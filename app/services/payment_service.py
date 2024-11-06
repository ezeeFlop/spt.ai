from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.payment import Payment, PaymentStatus
from app.models.user_subscription import UserSubscription
from datetime import datetime, timedelta
from app.services import subscription_service
import stripe
from app.core.config import settings
import logging
from sqlalchemy import select
from app.models.tier import Tier
from app.models.user import User

logger = logging.getLogger(__name__)
    
stripe.api_key = settings.STRIPE_SECRET_KEY

async def handle_successful_payment(
    db: AsyncSession,
    clerk_id: str,
    tier_id: int,
    payment_id: str,
    amount: int
) -> None:
    """Handle successful Stripe payment and update subscription"""
    try:
        # Create payment record
        payment = Payment(
            user_id=clerk_id,
            tier_id=tier_id,
            stripe_payment_id=payment_id,
            amount=amount,
            status=PaymentStatus.COMPLETED,
            payment_date=datetime.utcnow()
        )
        db.add(payment)

        # Get the tier
        tier_result = db.execute(
            select(Tier).where(Tier.id == tier_id)
        )
        tier = tier_result.scalar_one_or_none()
        
        if not tier:
            raise ValueError("Tier not found")

        # Get the user
        user_result = db.execute(
            select(User).where(User.clerk_id == clerk_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise ValueError("User not found")

        # Update user's API call limits based on tier
        user.api_max_calls = tier.tokens
        user.api_calls_count = 0

        # Delete any existing subscription
        old_sub_result = db.execute(
            select(UserSubscription).where(UserSubscription.user_id == clerk_id)
        )
        old_subscription = old_sub_result.scalar_one_or_none()
        
        if old_subscription:
            await cancel_subscription(db, old_subscription)

        # Create new subscription
        now = datetime.utcnow()
        subscription = UserSubscription(
            user_id=clerk_id,
            tier_id=tier_id,
            start_date=now,
            end_date=now + timedelta(days=30),
            is_active=True
        )
        db.add(subscription)

        db.commit()

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to process payment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process subscription: {str(e)}"
        )

async def cancel_subscription(db: AsyncSession, subscription: UserSubscription) -> None:
    """Cancel a subscription and handle Stripe if needed"""
    try:
        logger.info(f"Cancelling subscription: {subscription.id} for user: {subscription.user_id} with stripe id: {subscription.stripe_subscription_id}")
        # If it's a paid subscription with Stripe, cancel it first
        if subscription.stripe_subscription_id:
            await cancel_stripe_subscription(subscription.stripe_subscription_id)
        
        # Delete the subscription from our database
        db.delete(subscription)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to cancel subscription: {str(e)}")
        import traceback
        logger.error(f"Stack trace: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel subscription: {str(e)}"
        )


async def create_stripe_checkout_session(
    db: AsyncSession,
    tier_id: int, 
    price_id: str, 
    user_id: str
):
    """Create a Stripe checkout session for subscription"""
    try:
        # Check for existing subscription
        existing_sub = await subscription_service.get_active_subscription(db, user_id)
        if existing_sub and existing_sub.stripe_subscription_id:
            # Cancel existing Stripe subscription
            await cancel_stripe_subscription(existing_sub.stripe_subscription_id)
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{settings.FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/payment/cancel",
            client_reference_id=user_id,
            metadata={
                'tier_id': tier_id,
                'user_id': user_id
            }
        )
        return checkout_session
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise ValueError(f"Error creating checkout session: {str(e)}")

async def cancel_stripe_subscription(subscription_id: str) -> None:
    """Cancel a Stripe subscription"""
    try:
        stripe.Subscription.delete(subscription_id)
    except stripe.error.StripeError as e:
        logger.error(f"Failed to cancel Stripe subscription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel subscription: {str(e)}"
        )
