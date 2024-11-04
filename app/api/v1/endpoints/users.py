from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import User as UserSchema, UserCreate, UserLanguageUpdate
from app.services import user_service
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=UserSchema)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_clerk_id(db, user.clerk_id)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")
    return user_service.create_user(db, user)

@router.get("/me", response_model=UserSchema)
def read_user_me(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_clerk_id(db, current_user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.patch("/language", response_model=UserSchema)
async def update_user_language(
    language_update: UserLanguageUpdate,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = user_service.get_user_by_clerk_id(db, current_user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.language = language_update.language
    db.commit()
    db.refresh(db_user)
    return db_user
