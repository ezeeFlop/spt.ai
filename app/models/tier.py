from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.base_class import Base

# Association table for many-to-many relationship between Tier and Product
tier_product_association = Table(
    'tier_product_association',
    Base.metadata,
    Column('tier_id', Integer, ForeignKey('tiers.id'), primary_key=True),
    Column('product_id', Integer, ForeignKey('products.id'), primary_key=True),
    extend_existing=True
)

# Association table for many-to-many relationship between User and Tier
tier_subscribers = Table(
    'tier_subscribers',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('tier_id', Integer, ForeignKey('tiers.id'), primary_key=True),
    extend_existing=True
)

class Tier(Base):
    __tablename__ = 'tiers'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    billing_period = Column(String)
    tokens = Column(Integer)
    stripe_price_id = Column(String)
    products = relationship("Product", secondary=tier_product_association, back_populates="tiers")
    subscribers = relationship("User", secondary=tier_subscribers, back_populates="subscribed_tiers")
    payments = relationship("Payment", back_populates="tier")