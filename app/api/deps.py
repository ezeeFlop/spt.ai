from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.auth import get_current_user_from_token, security
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    token_data: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from token"""
    user = db.query(User).filter(User.clerk_id == token_data.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def admin_required(current_user: User = Depends(get_current_user)):
    """Check if current user is admin"""
    logger.info(f"Current user: {current_user.email} role {current_user.role}")
    if current_user.role != "admin":
        logger.warning(f"Non-admin user {current_user.email} attempted to access admin endpoint")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    logger.info(f"Admin access granted for user: {current_user.email}")
    return current_user
