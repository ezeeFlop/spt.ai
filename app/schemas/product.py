from pydantic import BaseModel
from typing import Optional, List

class ProductBase(BaseModel):
    name: str
    description: str
    cover_image: Optional[str] = None
    demo_video_link: Optional[str] = None
    frontend_url: str

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    demo_video_link: Optional[str] = None
    frontend_url: Optional[str] = None

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

class TierBase(BaseModel):
    name: str
    description: str
    price: float
    billing_period: str
    tokens: int
    stripe_price_id: str

class TierCreate(TierBase):
    product_ids: List[int]  # List of product IDs

class Tier(TierBase):
    id: int
    products: List[Product] = []

    class Config:
        from_attributes = True
