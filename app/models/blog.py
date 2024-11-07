import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, ARRAY, Boolean
from sqlalchemy.orm import relationship, Mapped
from app.db.base_class import Base

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    title: Mapped[str] = Column(String, index=True)
    slug: Mapped[str] = Column(String, unique=True, index=True)
    description: Mapped[str] = Column(String)
    content: Mapped[str] = Column(Text)
    created_at: Mapped[datetime.datetime] = Column(
        DateTime, 
        default=datetime.datetime.utcnow
    )
    updated_at: Mapped[datetime.datetime] = Column(
        DateTime, 
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )
    reading_time: Mapped[str] = Column(String)
    image_url: Mapped[str] = Column(String, nullable=True)
    tags: Mapped[list[str]] = Column(ARRAY(String), default=[])
    author_id: Mapped[int] = Column(Integer, ForeignKey("users.id"))
    published: Mapped[bool] = Column(Boolean, default=False)
    in_menu: Mapped[bool] = Column(Boolean, default=False)
    
    # Relationship with User
    author = relationship("User", back_populates="blog_posts")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "description": self.description,
            "content": self.content,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "reading_time": self.reading_time,
            "image_url": self.image_url,
            "tags": self.tags,
            "author_id": self.author_id,
            "published": self.published,
            "in_menu": self.in_menu
        }