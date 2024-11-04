from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import datetime

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tier_id = Column(Integer, ForeignKey("tiers.id"))
    amount = Column(Float)
    stripe_payment_id = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    payment_date = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="payments")
    tier = relationship("Tier", back_populates="payments")
