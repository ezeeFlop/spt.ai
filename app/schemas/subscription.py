from pydantic import BaseModel
from datetime import datetime
from .tier import TierWithProducts

class UserSubscriptionBase(BaseModel):
    tier_id: int
    start_date: datetime
    end_date: datetime
    is_active: bool = True

class UserSubscriptionCreate(UserSubscriptionBase):
    user_id: str

class UserSubscriptionResponse(UserSubscriptionBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime | None
    tier: TierWithProducts
    stripe_subscription_id: str | None

    class Config:
        from_attributes = True
