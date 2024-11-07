from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CheckoutSessionResponse(BaseModel):
    checkout_session_id: str
    url: str

class PaymentStatus(BaseModel):
    status: str
    tier_id: int
    payment_id: str

class TierSubscription(BaseModel):
    tier_id: int
    status: str
    expires_at: datetime

class PaymentCreate(BaseModel):
    tier_id: int
    payment_method_id: Optional[str] = None
    amount: float
    currency: str = "USD"

class Payment(PaymentCreate):
    id: str
    user_id: str
    status: str
    currency: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
