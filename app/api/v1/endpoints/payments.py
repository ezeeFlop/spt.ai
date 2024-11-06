from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.payment import PaymentStatus, CheckoutSessionResponse
from app.schemas.subscription import UserSubscriptionResponse
from app.services import payment_service, subscription_service
from app.api.deps import get_current_user
from app.models.tier import Tier
from sqlalchemy import select
import stripe
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/create-checkout-session/{tier_id}")
async def create_checkout_session(
    tier_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    # Get tier details first
    tier = db.get(Tier, tier_id)
    if not tier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tier not found"
        )

    # If it's a free tier, redirect to register-free-tier endpoint
    if tier.is_free:
        subscription = await subscription_service.register_free_tier(db, current_user.clerk_id)
        return subscription

    # Check if user already has an active subscription
    existing_subscription = await subscription_service.get_active_subscription(db, current_user.clerk_id)
    if existing_subscription:
        # If switching from paid plan, cancel the Stripe subscription
        if existing_subscription.tier.stripe_price_id:
            await payment_service.cancel_stripe_subscription(existing_subscription.stripe_subscription_id)
        
        # Deactivate current subscription
        existing_subscription.is_active = False
        db.commit()

    # Create Stripe checkout session for paid tier
    checkout_session = await payment_service.create_stripe_checkout_session(
        db=db,
        tier_id=tier_id,
        price_id=tier.stripe_price_id,
        user_id=current_user.clerk_id
    )
    
    return checkout_session

@router.post("/register-free-tier", response_model=UserSubscriptionResponse)
async def register_free_tier(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    try:
        subscription = await subscription_service.register_free_tier(db, current_user.clerk_id)
        return subscription
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/current-subscription", response_model=UserSubscriptionResponse)
async def get_current_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    subscription = await subscription_service.get_active_subscription_response(db, current_user.clerk_id)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    return subscription

@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    logger.info("Stripe webhook received")
    try:
        # Get the stripe signature header
        stripe_signature = request.headers.get('stripe-signature')
        
        # Get the raw request body
        payload = await request.body()
        
        # Construct the event
        event = stripe.Webhook.construct_event(
            payload,
            stripe_signature,
            settings.STRIPE_WEBHOOK_SECRET
        )
        
        logger.info(f"Stripe event received: {event.type}")
        
        # Handle the event
        if event.type == 'checkout.session.completed':
            session = event.data.object
            
            # Get customer details from session
            user_id = session.client_reference_id
            tier_id = session.metadata.get('tier_id')
            payment_id = session.payment_intent or session.subscription
            amount = session.amount_total
            
            logger.info(f"Processing payment for user: {user_id}, tier: {tier_id}, payment_id: {payment_id}, amount: {amount}")
            
            # Process the successful payment
            await payment_service.handle_successful_payment(
                db=db,
                clerk_id=user_id,
                tier_id=int(tier_id),
                payment_id=payment_id,
                amount=amount
            )
            
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        import traceback
        logger.error(f"Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))