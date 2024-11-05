import json
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate, UserDetails
from app.services import user_service
from typing import List, Dict
import logging
from app.api.deps import get_current_user, admin_required

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/me", response_model=UserDetails)
async def get_my_details(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get current user's detailed information including their tier and products"""
    user_details = await user_service.get_user_details(db, current_user.clerk_id)
    if not user_details:
        raise HTTPException(status_code=404, detail="User not found")
    return user_details

@router.post("/", response_model=UserSchema)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = await user_service.get_user_by_clerk_id(db, user.clerk_id)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")
    return await user_service.create_user(db, user)

@router.get("/", response_model=list[UserSchema], dependencies=[Depends(admin_required)])
async def list_users(db: Session = Depends(get_db)):
    users = await user_service.get_all_users(db)
    return users

@router.put("/{user_id}", response_model=UserSchema, dependencies=[Depends(admin_required)])
async def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = await user_service.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log the actual fields being updated
    update_fields = {k: v for k, v in user.model_dump(exclude_unset=True).items() if v is not None}
    
    return await user_service.update_user(db, db_user, user)

@router.delete("/{user_id}", response_model=UserSchema, dependencies=[Depends(admin_required)])
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = await user_service.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_service.delete_user(db, db_user)

@router.post("/sync")
async def sync_user(
    data: Dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Sync user data from Clerk with our database.
    If user doesn't exist, create them.
    """
    clerk_id = data.get("clerk_id")
    if not clerk_id:
        raise HTTPException(status_code=400, detail="Missing clerk_id")

    user_data = await user_service.get_clerk_user_data(clerk_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User data not found in Clerk")

    db_user = user_service.get_user_by_clerk_id(db, clerk_id)
    if not db_user:
        # Create new user
        user_create = UserCreate(clerk_id=clerk_id, **user_data)
        db_user = user_service.create_user(db, user_create)
    else:
        # Update existing user
        user_update = UserUpdate(**user_data)
        db_user = user_service.update_user(db, db_user, user_update)

    return {
        "status": "success",
        "user": {
            "id": db_user.id,
            "clerk_id": db_user.clerk_id,
            "name": db_user.name,
            "language": db_user.language,
            "role": db_user.role
        }
    }
