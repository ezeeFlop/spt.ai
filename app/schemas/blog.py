from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional

class BlogPostBase(BaseModel):
    title: str
    description: str
    content: str
    slug: str
    image_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None

class BlogPostAuthor(BaseModel):
    id: int
    name: str
    avatar: str

class BlogPost(BlogPostBase):
    id: int
    date: datetime
    reading_time: str
    author: BlogPostAuthor

    class Config:
        from_attributes = True

class BlogPostList(BaseModel):
    items: List[BlogPost]
    total: int
    page: int
    size: int