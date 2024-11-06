from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class UserSubscription(Base):
    __tablename__ = "user_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.clerk_id"), nullable=False)
    tier_id = Column(Integer, ForeignKey("tiers.id"), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    stripe_subscription_id = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="subscriptions")
    tier = relationship("Tier", back_populates="subscriptions")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "tier_id": self.tier_id,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "stripe_subscription_id": self.stripe_subscription_id,
            "tier": {
                "id": self.tier.id,
                "name": self.tier.name,
                "description": self.tier.description,
                "price": self.tier.price,
                "billing_period": self.tier.billing_period,
                "tokens": self.tier.tokens,
                "stripe_price_id": self.tier.stripe_price_id,
                "popular": self.tier.popular,
                "is_free": self.tier.is_free,
                "products": [
                    {
                        "id": p.id,
                        "name": p.name,
                        "description": p.description,
                        "cover_image": p.cover_image,
                        "demo_video_link": p.demo_video_link,
                        "frontend_url": p.frontend_url
                    }
                    for p in self.tier.products
                ] if self.tier else []
            } if self.tier else None
        }
