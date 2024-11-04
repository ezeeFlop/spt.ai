from sqlalchemy import Column, Integer, String, Table, ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped
from app.db.base_class import Base
import datetime

# Association table for many-to-many relationship between User and Tier
tier_subscribers = Table(
    'tier_subscribers',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('tier_id', Integer, ForeignKey('tiers.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    clerk_id: Mapped[str] = Column(String, unique=True, index=True, nullable=False)
    email: Mapped[str] = Column(String, unique=True, index=True, nullable=False)
    name: Mapped[str] = Column(String, nullable=False)
    language: Mapped[str] = Column(String(length=10), nullable=False, server_default='en')
    max_product_api_calls_per_month: Mapped[int] = Column(Integer, nullable=False, default=100)
    product_api_calls_this_month: Mapped[int] = Column(Integer, nullable=False, default=0)
    first_connection: Mapped[datetime.datetime] = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    last_connection: Mapped[datetime.datetime] = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    
    # Add relationships
    payments = relationship("Payment", back_populates="user")
    blog_posts = relationship("BlogPost", back_populates="author")
    subscribed_tiers = relationship("Tier", secondary=tier_subscribers, back_populates="subscribers")

    def to_dict(self):
        return {
            "id": self.id,
            "clerk_id": self.clerk_id,
            "email": self.email,
            "name": self.name,
            "language": self.language,
            "first_connection": self.first_connection,
            "last_connection": self.last_connection
        }
