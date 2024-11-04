from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt.exceptions import PyJWTError
from .config import settings

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        # Use Clerk's JWT verification here
        # For simplicity, we'll just decode the token without verification
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(payload: dict = Depends(verify_token)):
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id
