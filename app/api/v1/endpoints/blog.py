from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.blog import BlogPost, BlogPostCreate, BlogPostUpdate
from app.schemas.common import PaginatedResponse
from app.models.user import User
from app.services import blog_service
from app.api.deps import get_current_user, admin_required
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[BlogPost])
async def list_blog_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    tag: Optional[str] = None,
    search: Optional[str] = None,
    author_id: Optional[int] = None,
    published: Optional[bool] = Query(None, description="Filter by published status (True for published, False for unpublished, None for both)"),
    db: Session = Depends(get_db)
):
    posts = await blog_service.get_blog_posts(
        db, 
        skip=skip, 
        limit=limit,
        tag=tag,
        search=search,
        author_id=author_id,
        published=published
    )
    total = await blog_service.get_posts_count(db, tag, search, author_id, published)
    return PaginatedResponse(
        items=posts,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/tags", response_model=List[str])
async def get_popular_tags(
    limit: Optional[int] = Query(None, ge=1, le=50, description="Maximum number of tags to return"),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Getting popular tags with limit: {limit}")
        tags = await blog_service.get_popular_tags(db, limit)
        if not tags:
            logger.warning("No tags found")
            return []
        return tags
    except Exception as e:
        logger.error(f"Error retrieving popular tags: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve popular tags"
        )

@router.post("/", response_model=BlogPost, dependencies=[Depends(admin_required)])
async def create_blog_post(post: BlogPostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await blog_service.create_blog_post(db, post, current_user.id)

@router.get("/{slug}", response_model=BlogPost)
async def get_blog_post(slug: str, db: Session = Depends(get_db)):
    db_post = await blog_service.get_blog_post_by_slug(db, slug)
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return db_post

@router.put("/{post_id}", response_model=BlogPost, dependencies=[Depends(admin_required)])
async def update_blog_post(post_id: int, post: BlogPostUpdate, db: Session = Depends(get_db)):
    db_post = await blog_service.get_blog_post(db, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return await blog_service.update_blog_post(db, db_post, post)

@router.delete("/{post_id}", dependencies=[Depends(admin_required)])
async def delete_blog_post(post_id: int, db: Session = Depends(get_db)):
    db_post = await blog_service.get_blog_post(db, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    await blog_service.delete_blog_post(db, db_post)
    return {"status": "success"}