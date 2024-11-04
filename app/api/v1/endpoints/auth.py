from fastapi import APIRouter, Depends, HTTPException, Body
import logging
from sqlalchemy.orm import Session
from typing import Dict
from app.db.session import get_db
from app.services import user_service
from app.schemas.user import UserCreate

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
    """
    try:
        clerk_id = data.get("clerk_id")
        language = data.get("language", "en")
        
        if not clerk_id:
            raise HTTPException(status_code=400, detail="Missing clerk_id")

        # Check if user exists in our database
        user = user_service.get_user_by_clerk_id(db, clerk_id)
        
        if not user:
            # Create new user with minimal data
            user_data = UserCreate(
                clerk_id=clerk_id,
                email="placeholder@example.com",
                name="New User",
                language=language
            )
            user = user_service.create_user(db, user_data)
        else:
            # Update language if it changed
            if user.language != language:
                user.language = language
                db.commit()
                db.refresh(user)

        return {
            "status": "success",
            "user": {
                "id": user.id,
                "clerk_id": user.clerk_id,
                "name": user.name,
                "language": user.language
            }
        }
    except Exception as e:
        logger.error(f"Error syncing user: {e}")
        raise HTTPException(status_code=400, detail=str(e))
