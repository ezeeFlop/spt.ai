import logging
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserDetailsResponse
import httpx
from app.core.config import settings
from sqlalchemy.orm import joinedload
from app.models.tier import Tier
from typing import Optional
from fastapi import HTTPException
from app.models.user_subscription import UserSubscription
from sqlalchemy import select
from app.services.subscription_service import get_active_subscription, get_active_subscription_response
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

async def get_clerk_user_data(clerk_id: str):
    """Fetch user data from Clerk API"""
    headers = {
        "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.clerk.dev/v1/users/{clerk_id}",
                headers=headers
            )
            if response.status_code == 200:
                user_data = response.json()
                return {
                    "email": user_data["email_addresses"][0]["email_address"],
                    "name": f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
                }
            return None
    except httpx.RequestError as e:
        logger.error(f"HTTP request to Clerk API failed: {str(e)}")
        return None

async def create_user(db: Session, user: UserCreate):
    user_data = user.model_dump()
    # Remove subscribed_tiers from the data if it exists
    user_data.pop('subscribed_tiers', None)
    
    # Check if this is the first user
    if await is_first_user(db):
        user_data['role'] = 'admin'
    
    db_user = User(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

async def get_all_users(db: Session):
    users = (
        db.query(User)
        .options(
            joinedload(User.subscribed_tiers),
            joinedload(User.subscriptions)
            .joinedload(UserSubscription.tier)
            .joinedload(Tier.products)
        )
        .all()
    )
    
    # Add active subscription tier to each user
    for user in users:
        if user.subscriptions and user.subscriptions.is_active:
            user.tier = user.subscriptions.tier
    
    return users

async def update_user(db: Session, db_user: User, user_update: UserUpdate):
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Handle tier update separately
    if 'tier' in update_data:
        tier_name = update_data.pop('tier')
        tier = db.query(Tier).filter(Tier.name == tier_name).first()
        if tier:
            logger.info(f"Setting tier to {tier_name} for user {db_user.id} {tier}")
            db_user.subscribed_tiers = [tier]
        else:
            logger.error(f"Tier not found: {tier_name}")
            raise HTTPException(status_code=404, detail=f"Tier '{tier_name}' not found")
    
    # Update other fields
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

async def delete_user(db: Session, db_user: User):
    db.delete(db_user)
    db.commit()
    return db_user

async def get_user_by_clerk_id(db: Session, clerk_id: str):
    """Get a user by their Clerk ID"""
    return db.query(User).options(
        joinedload(User.subscribed_tiers)
    ).filter(User.clerk_id == clerk_id).first()


async def is_first_user(db: Session) -> bool:
    """Check if this is the first user being registered"""
    user_count = db.query(User).count()
    return user_count == 0

async def get_user_details(db: AsyncSession, clerk_id: str) -> Optional[UserDetailsResponse]:
    """Get detailed user information including active subscription and tier"""
    query = (
        select(User)
        .options(joinedload(User.subscriptions))
        .where(User.clerk_id == clerk_id)
    )
    result = db.execute(query)
    user = result.unique().scalar_one_or_none()
    
    if not user:
        return None
    
    # Get the user's current active subscription and its tier
    active_subscription = await get_active_subscription_response(db, clerk_id)
    
    # Create the response object
    user_details = {
        "id": user.id,
        "clerk_id": user.clerk_id,
        "email": user.email,
        "name": user.name,
        "language": user.language,
        "role": user.role,
        "tier": active_subscription.tier if active_subscription else None,
        "api_calls_count": user.api_calls_count,
        "api_max_calls": user.api_max_calls,
        "is_active": True
    }
    
    return UserDetailsResponse.model_validate(user_details)

async def get_user(db: Session, user_id: int) -> Optional[User]:
    """
    Retrieve a user by their ID.
    
    Args:
        db: Database session
        user_id: The ID of the user to retrieve
        
    Returns:
        Optional[User]: The user if found, None otherwise
    """
    try:
        return db.query(User).filter(User.id == user_id).first()
    except Exception as e:
        logger.error(f"Error retrieving user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while retrieving user"
        )
