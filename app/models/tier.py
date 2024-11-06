from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.relationships import tier_product_association, tier_subscribers

class Tier(Base):
    __tablename__ = 'tiers'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    billing_period = Column(String)
    tokens = Column(Integer)
    stripe_price_id = Column(String, nullable=True)
    popular = Column(Boolean, default=False)
    is_free = Column(Boolean, default=False)
    
    # Relationships
    subscribers = relationship(
        "User",
        secondary=tier_subscribers,
        back_populates="subscribed_tiers",
        lazy="select"
    )
    subscriptions = relationship("UserSubscription", back_populates="tier")
    payments = relationship("Payment", back_populates="tier")
    products = relationship("Product", secondary=tier_product_association, back_populates="tiers")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "billing_period": self.billing_period,
            "tokens": self.tokens,
            "stripe_price_id": self.stripe_price_id,
            "popular": self.popular,
            "is_free": self.is_free,
            "products": [product.to_dict() for product in self.products]
        }