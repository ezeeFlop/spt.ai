from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, func, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    tier_id = Column(Integer, ForeignKey('tiers.id'), nullable=False)
    stripe_payment_id = Column(String, unique=True)
    amount = Column(Integer, nullable=False)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Define relationships
    user = relationship("User", back_populates="payments")
    tier = relationship("Tier", back_populates="payments")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "tier_id": self.tier_id,
            "stripe_payment_id": self.stripe_payment_id,
            "amount": self.amount,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }