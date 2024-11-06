from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user_subscription import UserSubscription
from app.models.tier import Tier
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy import select
from typing import Optional
from sqlalchemy.orm import selectinload
import logging
from app.schemas.subscription import UserSubscriptionResponse
from app.models.user import User
from app.services import payment_service

logger = logging.getLogger(__name__)

async def get_active_subscription(db: AsyncSession, clerk_id: str) -> Optional[UserSubscription]:
    """Get user's subscription"""
    user_id = str(clerk_id.id if hasattr(clerk_id, 'id') else clerk_id)
    
    query = (
        select(UserSubscription)
        .options(
            selectinload(UserSubscription.tier).selectinload(Tier.products)
        )
        .where(UserSubscription.user_id == user_id)
    )
    
    result = db.execute(query)
    return result.unique().scalar_one_or_none()

async def register_free_tier(db: AsyncSession, clerk_id: str) -> UserSubscriptionResponse:
    """Register user for free tier"""
    user_id = str(clerk_id.id if hasattr(clerk_id, 'id') else clerk_id)
    
    # Check existing subscription
    existing_subscription = await get_active_subscription(db, user_id)
    if existing_subscription:
        await payment_service.cancel_subscription(db, existing_subscription)

    # Get free tier
    query = select(Tier).where(Tier.is_free == True)
    result = db.execute(query)
    free_tier = result.scalar_one_or_none()
    
    if not free_tier:
        raise ValueError("Free tier not found")

    # Get user
    user_query = select(User).where(User.clerk_id == user_id)
    user_result = db.execute(user_query)
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise ValueError("User not found")

    # Update user's API call limits based on free tier
    user.api_max_calls = free_tier.tokens
    user.api_calls_count = 0

    # Create subscription
    now = datetime.utcnow()
    subscription = UserSubscription(
        user_id=user_id,
        tier_id=free_tier.id,
        start_date=now,
        end_date=now + timedelta(days=30),
        is_active=True,
        stripe_subscription_id=None  # Explicitly set to None for free tier
    )
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    return UserSubscriptionResponse.model_validate(subscription)

async def get_active_subscription_response(db: AsyncSession, clerk_id: str) -> Optional[UserSubscriptionResponse]:
    """Get user's subscription response"""
    subscription = await get_active_subscription(db, clerk_id)
    if subscription:
        # Ensure relationships are loaded
        db.refresh(subscription)
        if subscription.tier:
            db.refresh(subscription.tier, ['products'])
        return UserSubscriptionResponse.model_validate(subscription)
    return None
