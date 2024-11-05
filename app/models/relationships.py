from sqlalchemy import Table, Column, Integer, ForeignKey
from app.db.base_class import Base

# Association table for many-to-many relationship between User and Tier
tier_subscribers = Table(
    'tier_subscribers',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('tier_id', Integer, ForeignKey('tiers.id'), primary_key=True)
)

# Association table for many-to-many relationship between Tier and Product
tier_product_association = Table(
    'tier_product_association',
    Base.metadata,
    Column('tier_id', Integer, ForeignKey('tiers.id'), primary_key=True),
    Column('product_id', Integer, ForeignKey('products.id'), primary_key=True)
) 