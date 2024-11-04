from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate
import stripe
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_payment(db: Session, payment: PaymentCreate):
    db_payment = Payment(**payment.model_dump())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def create_stripe_checkout_session(product_id: int, price_id: str):
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='payment',
            success_url='http://localhost:3000/success',
            cancel_url='http://localhost:3000/cancel',
        )
        return checkout_session
    except Exception as e:
        raise ValueError(str(e))
