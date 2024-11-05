from fastapi import APIRouter, Depends, HTTPException, Body
import logging
from sqlalchemy.orm import Session
from typing import Dict
from app.api.deps import get_current_user
from app.db.session import get_db
from app.services import user_service
from app.schemas.user import User, UserCreate, UserUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user_subscription import UserSubscription
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/sync")
async def sync_user(
    data: Dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Sync user data from Clerk with our database.
    If user doesn't exist, create them.
    First user to register will automatically become admin.
    """
    try:
        clerk_id = data.get("clerk_id")
        if not clerk_id:
            raise HTTPException(status_code=400, detail="Missing clerk_id")

        user_data = await user_service.get_clerk_user_data(clerk_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User data not found in Clerk")

        db_user = await user_service.get_user_by_clerk_id(db, clerk_id)
        if not db_user:
            user_create = UserCreate(clerk_id=clerk_id, **user_data)
            db_user = await user_service.create_user(db, user_create)
            if db_user.role == 'admin':
                logger.info(f"First user {db_user.email} registered and set as admin")
        else:
            user_update = UserUpdate(**user_data)
            db_user = await user_service.update_user(db, db_user, user_update)

        return {
            "status": "success",
            "user": {
                "id": db_user.id,
                "clerk_id": db_user.clerk_id,
                "email": db_user.email,
                "name": db_user.name,
                "role": db_user.role
            }
        }
    except Exception as e:
        logger.error(f"Error syncing user: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/register-free-tier")
async def register_free_tier(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Check if user already has a subscription
        existing_subscription = await db.query(UserSubscription).filter(
            UserSubscription.user_id == current_user.id
        ).first()

        if existing_subscription:
            if existing_subscription.tier_id == 'free':
                raise HTTPException(
                    status_code=400,
                    detail="User already has free tier subscription"
                )
            
        # Create free tier subscription
        subscription = UserSubscription(
            user_id=current_user.id,
            tier_id='free',
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=365),  # Free tier for 1 year
            is_active=True
        )
        
        db.add(subscription)
        await db.commit()
        
        return {"success": True}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
