from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.payment import PaymentStatus, CheckoutSessionResponse
from app.schemas.subscription import UserSubscriptionResponse
from app.services import payment_service, subscription_service
from app.api.deps import get_current_user
from app.models.tier import Tier
from sqlalchemy import select

router = APIRouter()

@router.post("/create-checkout-session/{tier_id}", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    tier_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    # Validate tier exists
    query = select(Tier).where(Tier.id == tier_id)
    result = db.execute(query)
    tier = result.scalar_one_or_none()
    
    if not tier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tier not found"
        )
    
    # Check if user already has an active subscription
    existing_subscription = await subscription_service.get_active_subscription(db, current_user)
    if existing_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription"
        )
    
    try:
        checkout_session = await payment_service.create_stripe_checkout_session(
            tier_id=tier_id,
            price_id=tier.stripe_price_id,
            user_id=current_user
        )
        return CheckoutSessionResponse(
            checkout_session_id=checkout_session.id,
            url=checkout_session.url
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/register-free-tier", response_model=UserSubscriptionResponse)
async def register_free_tier(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    try:
        subscription = await subscription_service.register_free_tier(db, current_user)
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
    subscription = await subscription_service.get_active_subscription(db, current_user)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    return subscription