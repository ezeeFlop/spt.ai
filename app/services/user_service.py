import logging
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
import httpx
from app.core.config import settings
from sqlalchemy.orm import joinedload
from app.models.tier import Tier
from typing import Optional
from fastapi import HTTPException

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
    return db.query(User).options(
        joinedload(User.subscribed_tiers)
    ).all()

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

async def get_user_details(db: Session, clerk_id: str):
    """Get detailed user information including tier"""
    user = (
        db.query(User)
        .options(joinedload(User.subscribed_tiers))
        .filter(User.clerk_id == clerk_id)
        .first()
    )
    
    if not user:
        return None
    
    # Get the user's current tier and its products
    current_tier = None
    if user.subscribed_tiers:
        tier = user.subscribed_tiers[0]  # Get first tier
        current_tier = {
            "id": tier.id,
            "name": tier.name,
            "description": tier.description,
            "price": tier.price,
            "billing_period": tier.billing_period,
            "tokens": tier.tokens,
            "stripe_price_id": tier.stripe_price_id,
            "popular": tier.popular,
            "is_free": tier.is_free,
            "products": [
                {
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "cover_image": p.cover_image,
                    "demo_video_link": p.demo_video_link,
                    "frontend_url": p.frontend_url
                }
                for p in tier.products
            ]
        }
    logger.info(f"Current tier: {current_tier} {user.subscribed_tiers}")
    return {
        "id": user.id,
        "clerk_id": user.clerk_id,
        "email": user.email,
        "name": user.name,
        "language": user.language,
        "role": user.role,
        "tier": current_tier,
        "api_calls_count": user.api_calls_count,
        "is_active": True
    }

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
