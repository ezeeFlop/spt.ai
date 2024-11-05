from pydantic import BaseModel, validator
from typing import Optional, List
from .product import Product
import logging

logger = logging.getLogger(__name__)

class TierBase(BaseModel):
    name: str
    description: str
    price: float
    billing_period: str
    tokens: int
    popular: bool = False
    is_free: bool = False
    stripe_price_id: Optional[str] = None

    @validator('is_free')
    def validate_is_free(cls, v, values):
        return v

    @validator('stripe_price_id')
    def validate_stripe_price_id(cls, v, values):
        if values.get('is_free'):
            return None
        if not values.get('is_free') and not v:
            raise ValueError('Stripe price ID is required for paid tiers')
        return v

    @validator('price')
    def validate_price(cls, v, values):
        if values.get('is_free') and v != 0:
            raise ValueError('Free tier must have price set to 0')
        return v

    @validator('billing_period')
    def validate_billing_period(cls, v, values):
        if values.get('is_free') and v != 'free':
            raise ValueError('Free tier must have billing period set to "free"')
        return v

class TierCreate(TierBase):
    product_ids: List[int]

class TierUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    billing_period: Optional[str] = None
    tokens: Optional[int] = None
    stripe_price_id: Optional[str] = None
    popular: Optional[bool] = None
    product_ids: Optional[List[int]] = None
    is_free: Optional[bool] = False

class Tier(TierBase):
    id: int

    class Config:
        from_attributes = True

class TierWithProducts(TierBase):
    id: int
    products: List[Product] = []

    class Config:
        from_attributes = True

class TierInUser(BaseModel):
    id: int
    name: str
    description: str
    price: float
    billing_period: str
    tokens: int
    stripe_price_id: Optional[str] = None
    popular: bool = False
    is_free: bool = False

    class Config:
        from_attributes = True