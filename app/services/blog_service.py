from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostUpdate
from typing import List, Optional
from slugify import slugify
from app.utils.text import calculate_reading_time

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
    author_id: Optional[int] = None
) -> List[BlogPost]:
    query = db.query(BlogPost)
    
    if tag:
        query = query.filter(BlogPost.tags.contains([tag]))
    if search:
        query = query.filter(
            or_(
                BlogPost.title.ilike(f"%{search}%"),
                BlogPost.description.ilike(f"%{search}%")
            )
        )
    if author_id:
        query = query.filter(BlogPost.author_id == author_id)
    
    return query.offset(skip).limit(limit).all()

async def get_blog_post(db: Session, post_id: int) -> Optional[BlogPost]:
    return await db.query(BlogPost).filter(BlogPost.id == post_id).first()

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
    await db.commit()
    await db.refresh(db_post)
    return db_post

async def delete_blog_post(db: Session, db_post: BlogPost) -> BlogPost:
    await db.delete(db_post)
    await db.commit()
    return db_post

async def get_posts_count(
    db: Session,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    author_id: Optional[int] = None
) -> int:
    """Get total count of blog posts matching the given filters"""
    query = db.query(BlogPost)
    
    if tag:
        query = query.filter(BlogPost.tags.contains([tag]))
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
    
    return query.count()