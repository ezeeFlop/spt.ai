from typing import Optional
from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from jwt.exceptions import PyJWTError
from app.core.config import settings
from app.api.deps import get_db
from app.models.user import User
from sqlalchemy.orm import Session
import logging
from app.core.auth import get_current_user_from_token

logger = logging.getLogger(__name__)

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Use the JWKS verification from auth.py"""
    return get_current_user_from_token(credentials)

def get_current_user(db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    try:
        user_id = token.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.clerk_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"Authenticated user: {user.email} (role: {user.role})")
        return user
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")
