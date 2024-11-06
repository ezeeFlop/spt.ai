from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship, Mapped
from app.db.base_class import Base
import datetime
from app.models.relationships import tier_subscribers

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    clerk_id: Mapped[str] = Column(String, unique=True, index=True, nullable=False)
    email: Mapped[str] = Column(String, unique=True, index=True, nullable=False)
    name: Mapped[str] = Column(String, nullable=False)
    language: Mapped[str] = Column(String(length=10), nullable=False, server_default='en')
    api_calls_count: Mapped[int] = Column(Integer, nullable=False, default=0)
    api_max_calls: Mapped[int] = Column(Integer, nullable=False, default=100)
    first_connection: Mapped[datetime.datetime] = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    last_connection: Mapped[datetime.datetime] = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    role: Mapped[str] = Column(String, nullable=False, server_default='user')
    
    # Relationships
    subscribed_tiers = relationship(
        "Tier",
        secondary=tier_subscribers,
        back_populates="subscribers",
        lazy="select"
    )
    subscriptions = relationship(
        "UserSubscription",
        back_populates="user",
        primaryjoin="User.clerk_id==UserSubscription.user_id",
        uselist=False,
        lazy="select"
    )
    payments = relationship("Payment", back_populates="user", lazy="select")
    blog_posts = relationship("BlogPost", back_populates="author", lazy="select")

    def to_dict(self):
        return {
            "id": self.id,
            "clerk_id": self.clerk_id,
            "email": self.email,
            "name": self.name,
            "language": self.language,
            "role": self.role,
            "api_calls_count": self.api_calls_count,
            "api_max_calls": self.api_max_calls,
            "first_connection": self.first_connection,
            "last_connection": self.last_connection,
            "subscribed_tiers": [tier.to_dict() for tier in self.subscribed_tiers],
            "active_subscription": self.subscriptions.to_dict() if self.subscriptions else None
        }
