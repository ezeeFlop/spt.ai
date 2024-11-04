from pydantic import BaseModel
from datetime import datetime

class PaymentBase(BaseModel):
    amount: float

class PaymentCreate(PaymentBase):
    user_id: int
    tier_id: int
    stripe_payment_id: str

class PaymentInDB(PaymentBase):
    id: int
    user_id: int
    tier_id: int
    stripe_payment_id: str
    created_at: datetime
    payment_date: datetime

    class Config:
        from_attributes = True

class Payment(PaymentInDB):
    pass
