from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostUpdate

def create_blog_post(db: Session, post: BlogPostCreate, author_id: int) -> BlogPost:
    # Calculate reading time based on content length
    words_per_minute = 200
    word_count = len(post.content.split())
    reading_time = f"{max(1, round(word_count / words_per_minute))} min read"

    db_post = BlogPost(
        **post.model_dump(),
        author_id=author_id,
        date=datetime.utcnow(),
        reading_time=reading_time
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_blog_posts(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    tag: str = None,
    search: str = None,
    author_id: int = None
) -> list[BlogPost]:
    query = db.query(BlogPost)
    
    if tag:
        query = query.filter(BlogPost.tags.contains([tag]))
    if search:
        query = query.filter(
            BlogPost.title.ilike(f"%{search}%") |
            BlogPost.description.ilike(f"%{search}%") |
            BlogPost.content.ilike(f"%{search}%")
        )
    if author_id:
        query = query.filter(BlogPost.author_id == author_id)
    
    return query.order_by(BlogPost.date.desc()).offset(skip).limit(limit).all()

def get_blog_post_by_slug(db: Session, slug: str) -> BlogPost:
    return db.query(BlogPost).filter(BlogPost.slug == slug).first()

def update_blog_post(db: Session, slug: str, post: BlogPostUpdate, author_id: int) -> BlogPost:
    db_post = get_blog_post_by_slug(db, slug)
    if not db_post or db_post.author_id != author_id:
        return None
        
    for field, value in post.model_dump(exclude_unset=True).items():
        setattr(db_post, field, value)
    
    db.commit()
    db.refresh(db_post)
    return db_post

def delete_blog_post(db: Session, slug: str, author_id: int) -> bool:
    db_post = get_blog_post_by_slug(db, slug)
    if not db_post or db_post.author_id != author_id:
        return False
        
    db.delete(db_post)
    db.commit()
    return True

def get_popular_tags(db: Session, limit: int = 10) -> list[str]:
    return db.query(
        func.unnest(BlogPost.tags).label('tag'),
        func.count().label('count')
    ).group_by('tag').order_by('count DESC').limit(limit).all() 