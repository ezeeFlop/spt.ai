from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserSubscriptionBase(BaseModel):
    tier_id: int
    status: str
    expires_at: datetime

class UserSubscriptionCreate(UserSubscriptionBase):
    user_id: str

class UserSubscriptionResponse(UserSubscriptionBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
