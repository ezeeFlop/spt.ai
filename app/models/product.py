from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.relationships import tier_product_association

class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    cover_image = Column(String, nullable=True)
    demo_video_link = Column(String, nullable=True)
    frontend_url = Column(String)
    tiers = relationship("Tier", secondary=tier_product_association, back_populates="products")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description
        }