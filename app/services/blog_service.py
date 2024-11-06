from sqlalchemy.orm import Session
from sqlalchemy import or_, any_
from sqlalchemy.dialects.postgresql import ARRAY
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostUpdate
from typing import List, Optional
from slugify import slugify
from app.utils.text import calculate_reading_time
import logging

logger = logging.getLogger(__name__)

async def create_blog_post(db: Session, post: BlogPostCreate, author_id: int) -> BlogPost:
    reading_time = calculate_reading_time(post.content)
    db_post = BlogPost(
        **post.model_dump(),
        author_id=author_id,
        slug=slugify(post.title),
        reading_time=reading_time
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

async def get_blog_posts(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    author_id: Optional[int] = None,
    published: bool = True
) -> List[BlogPost]:
    query = db.query(BlogPost)
    
    if tag:
        query = query.filter(tag == any_(BlogPost.tags))
    if search:
        query = query.filter(
            or_(
                BlogPost.title.ilike(f"%{search}%"),
                BlogPost.description.ilike(f"%{search}%")
            )
        )
    if author_id:
        query = query.filter(BlogPost.author_id == author_id)
    if published:
        query = query.filter(BlogPost.published == published)
    
    return query.offset(skip).limit(limit).all()

async def get_blog_post(db: Session, post_id: int) -> Optional[BlogPost]:
    return  db.query(BlogPost).filter(BlogPost.id == post_id).first()

async def get_blog_post_by_slug(db: Session, slug: str) -> Optional[BlogPost]:
    return db.query(BlogPost).filter(BlogPost.slug == slug).first()

async def get_user_blog_posts(db: Session, author_id: int) -> List[BlogPost]:
    return db.query(BlogPost).filter(BlogPost.author_id == author_id).all()

async def update_blog_post(db: Session, db_post: BlogPost, post_update: BlogPostUpdate) -> BlogPost:
    update_data = post_update.dict(exclude_unset=True)
    if 'title' in update_data:
        update_data['slug'] = slugify(update_data['title'])
    for key, value in update_data.items():
        setattr(db_post, key, value)
    db.commit()
    db.refresh(db_post)
    return db_post

async def delete_blog_post(db: Session, db_post: BlogPost) -> BlogPost:
    db.delete(db_post)
    db.commit()
    return db_post

async def get_posts_count(
    db: Session,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    author_id: Optional[int] = None,
    published: bool = True
) -> int:
    """Get total count of blog posts matching the given filters"""
    query = db.query(BlogPost)
    
    if tag:
        query = query.filter(tag == any_(BlogPost.tags))
    if search:
        query = query.filter(
            or_(
                BlogPost.title.ilike(f"%{search}%"),
                BlogPost.content.ilike(f"%{search}%"),
                BlogPost.description.ilike(f"%{search}%")
            )
        )
    if author_id:
        query = query.filter(BlogPost.author_id == author_id)
    if published:
        query = query.filter(BlogPost.published == published)
    
    return query.count()

async def get_popular_tags(db: Session, limit: Optional[int] = None) -> List[str]:
    """Get list of unique tags ordered by frequency of use"""
    try:
        # Get all published blog posts with tags
        query = db.query(BlogPost.tags)\
            .filter(BlogPost.published == True)\
            .filter(BlogPost.tags != None)\
            .filter(BlogPost.tags != [])
        
        # Get all tags from posts
        posts_with_tags = query.all()
        
        # Flatten the list of tags and count occurrences
        tag_counts = {}
        for post_tags in posts_with_tags:
            for tag in post_tags[0]:  # post_tags is a tuple with tags list as first element
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Sort tags by count
        sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
        
        # Get just the tags in order
        popular_tags = [tag for tag, count in sorted_tags]
        
        # Apply limit if specified
        if limit:
            popular_tags = popular_tags[:limit]
            
        return popular_tags
        
    except Exception as e:
        logger.error(f"Error fetching popular tags: {str(e)}")
        return []