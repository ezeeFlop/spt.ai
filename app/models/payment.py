from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, func, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey('users.clerk_id'), nullable=False)
    tier_id = Column(Integer, ForeignKey('tiers.id'), nullable=False)
    stripe_payment_id = Column(String, unique=True)
    amount = Column(Integer, nullable=False)
    currency = Column(String, nullable=False, default="USD")
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    payment_date = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    # Define relationships
    user = relationship("User", back_populates="payments", foreign_keys=[user_id])
    tier = relationship("Tier", back_populates="payments")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "tier_id": self.tier_id,
            "stripe_payment_id": self.stripe_payment_id,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "payment_date": self.payment_date
        }