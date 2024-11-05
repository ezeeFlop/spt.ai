from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

# Initialize the JWKS client
jwks_client = PyJWKClient(settings.CLERK_JWKS_URL)

async def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Validate and decode the JWT token from Clerk"""
    try:
        token = credentials.credentials
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # First decode without verification to check claims
        unverified_token = jwt.decode(token, options={'verify_signature': False})
        logger.debug(f"Unverified token claims: {unverified_token}")
        
        # If token uses azp instead of aud, use that
        token_options = {}
        if 'azp' in unverified_token and 'aud' not in unverified_token:
            token_options = {'verify_aud': False}
            logger.debug("Using azp claim instead of aud")
        
        decoded_token = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.CLERK_JWT_AUDIENCE,
            issuer=settings.CLERK_JWT_ISSUER,
            options=token_options
        )
        return decoded_token
    except jwt.InvalidTokenError as e:
        logger.error(f"Token validation failed: {str(e)}")
        logger.error(f"Token claims: {jwt.decode(token, options={'verify_signature': False})}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
