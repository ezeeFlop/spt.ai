from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.payment import Payment, PaymentStatus
from app.models.user_subscription import UserSubscription
from datetime import datetime, timedelta
import stripe
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

async def handle_successful_payment(
    db: AsyncSession,
    user_id: str,
    tier_id: int,
    payment_id: str
) -> None:
    """Handle successful Stripe payment and update subscription"""
    try:
        # Skip payment record for free tier
        if tier_id != 'free':
            payment = Payment(
                user_id=user_id,
                tier_id=tier_id,
                stripe_payment_id=payment_id,
                amount=0,  # Will be updated from Stripe
                status=PaymentStatus.COMPLETED
            )
            db.add(payment)

        # Update or create subscription
        subscription = await db.query(UserSubscription).filter(
            UserSubscription.user_id == user_id
        ).first()

        # Calculate subscription end date based on tier
        duration_days = 365 if tier_id == 'free' else 30
        end_date = datetime.utcnow() + timedelta(days=duration_days)

        if subscription:
            subscription.tier_id = tier_id
            subscription.end_date = end_date
            subscription.is_active = True
        else:
            subscription = UserSubscription(
                user_id=user_id,
                tier_id=tier_id,
                start_date=datetime.utcnow(),
                end_date=end_date,
                is_active=True
            )
            db.add(subscription)

        await db.commit()

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process subscription: {str(e)}"
        )
