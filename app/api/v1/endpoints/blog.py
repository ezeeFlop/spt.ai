from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.services import blog_service
from app.schemas.blog import BlogPost, BlogPostCreate, BlogPostUpdate, BlogPostList

router = APIRouter()

@router.get("", response_model=BlogPostList)
def list_blog_posts(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    tag: Optional[str] = None,
    search: Optional[str] = None,
    author_id: Optional[int] = None
):
    posts = blog_service.get_blog_posts(db, skip, limit, tag, search, author_id)
    total = len(posts)  # In production, you'd want to do a separate count query
    return {
        "items": posts,
        "total": total,
        "page": skip // limit + 1,
        "size": limit
    }

@router.post("", response_model=BlogPost)
def create_blog_post(
    post: BlogPostCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return blog_service.create_blog_post(db, post, current_user.id)

@router.get("/tags", response_model=List[str])
def get_popular_tags(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return blog_service.get_popular_tags(db, limit)

@router.get("/{slug}", response_model=BlogPost)
def get_blog_post(slug: str, db: Session = Depends(get_db)):
    post = blog_service.get_blog_post_by_slug(db, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post

@router.put("/{slug}", response_model=BlogPost)
def update_blog_post(
    slug: str,
    post: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    updated_post = blog_service.update_blog_post(db, slug, post, current_user.id)
    if not updated_post:
        raise HTTPException(status_code=404, detail="Blog post not found or unauthorized")
    return updated_post

@router.delete("/{slug}")
def delete_blog_post(
    slug: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not blog_service.delete_blog_post(db, slug, current_user.id):
        raise HTTPException(status_code=404, detail="Blog post not found or unauthorized")
    return {"status": "success"} 