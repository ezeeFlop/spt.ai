from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: str
    language: str = 'en'

class UserCreate(UserBase):
    clerk_id: str

class User(UserBase):
    id: int
    clerk_id: str
    max_product_api_calls_per_month: int
    product_api_calls_this_month: int
    first_connection: datetime
    last_connection: datetime

    class Config:
        from_attributes = True

class UserLanguageUpdate(BaseModel):
    language: str
