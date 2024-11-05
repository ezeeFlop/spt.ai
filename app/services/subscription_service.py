from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user_subscription import UserSubscription
from app.models.tier import Tier
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy import select

async def get_active_subscription(db: AsyncSession, user_id: str) -> UserSubscription | None:
    """Get user's active subscription if exists"""
    query = select(UserSubscription).where(
        UserSubscription.user_id == user_id,
        UserSubscription.status == "active",
        UserSubscription.expires_at > datetime.utcnow()
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def register_free_tier(db: AsyncSession, user_id: str) -> UserSubscription:
    """Register user for free tier"""
    # Check if user already has an active subscription
    existing_subscription = await get_active_subscription(db, user_id)
    if existing_subscription:
        raise ValueError("User already has an active subscription")

    # Get free tier
    query = select(Tier).where(Tier.is_free == True)
    result = await db.execute(query)
    free_tier = result.scalar_one_or_none()
    
    if not free_tier:
        raise ValueError("Free tier not found")

    # Create new subscription
    subscription = UserSubscription(
        user_id=user_id,
        tier_id=free_tier.id,
        status="active",
        expires_at=datetime.utcnow() + timedelta(days=30)  # Free tier duration
    )
    
    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)
    
    return subscription
