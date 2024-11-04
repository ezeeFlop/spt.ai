from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.payment import Payment, PaymentCreate
from app.services import payment_service, product_service
from app.core.security import get_current_user
from app.models.tier import Tier

router = APIRouter()

@router.post("/create-checkout-session/{tier_id}")
def create_checkout_session(tier_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    tier = db.query(Tier).filter(Tier.id == tier_id).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Tier not found")
    
    try:
        checkout_session = payment_service.create_stripe_checkout_session(tier_id, tier.stripe_price_id)
        return {"checkout_session_id": checkout_session.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=Payment)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return payment_service.create_payment(db, payment)
