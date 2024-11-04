import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    slug = Column(String, unique=True, index=True)
    description = Column(String)
    content = Column(Text)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    reading_time = Column(String)
    image_url = Column(String, nullable=True)
    tags = Column(ARRAY(String), default=[])
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="blog_posts")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "description": self.description,
            "content": self.content,
            "date": self.date,
            "reading_time": self.reading_time,
            "image_url": self.image_url,
            "author_id": self.author_id
        }