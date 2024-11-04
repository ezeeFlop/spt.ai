from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings

security = HTTPBearer()

def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Validate and decode the JWT token from Clerk
    """
    try:
        token = credentials.credentials
        # Verify and decode the token using the Clerk public key
        decoded_token = jwt.decode(
            token,
            settings.CLERK_SECRET_KEY,
            algorithms=["HS256"],
            audience="your-audience",  # Configure as needed
            issuer="your-issuer"      # Configure as needed
        )
        return decoded_token
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
