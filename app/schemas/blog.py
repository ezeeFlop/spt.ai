from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BlogAuthor(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True

class BlogPostBase(BaseModel):
    title: str
    content: str
    description: str
    image_url: Optional[str] = None
    tags: List[str] = []
    published: bool = False

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None

class BlogPost(BlogPostBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime
    reading_time: str
    author: BlogAuthor

    class Config:
        from_attributes = True