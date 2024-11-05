from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .tier import TierInUser, TierWithProducts

class UserBase(BaseModel):
    email: str
    name: str
    language: str = 'en'
    role: str = 'user'

class UserCreate(UserBase):
    clerk_id: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    language: Optional[str] = None
    role: Optional[str] = None
    tier: Optional[str] = None
    api_calls_count: Optional[int] = None
    api_max_calls: Optional[int] = None

    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    clerk_id: str
    first_connection: datetime
    last_connection: datetime
    api_calls_count: int
    api_max_calls: int
    subscribed_tiers: List[TierInUser] = []

    class Config:
        from_attributes = True

class UserDetails(BaseModel):
    id: int
    clerk_id: str
    email: str
    name: str
    language: str
    role: str
    tier: Optional[TierWithProducts] = None
    api_calls_count: int = 0
    api_max_calls: int = 100
    is_active: bool = True

    class Config:
        from_attributes = True