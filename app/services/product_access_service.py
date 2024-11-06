from datetime import datetime, timedelta
from typing import Dict
from jose import jwt
import secrets
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.product import Product
from app.models.user import User

class ProductAccessService:
    def __init__(self):
        self.secret = settings.PRODUCT_ACCESS_SECRET
        self.token_expiry = timedelta(minutes=5)

    async def generate_access_token(self, user_id: str, product_id: int) -> str:
        now = datetime.utcnow()
        nonce = secrets.token_urlsafe(32)
        
        payload = {
            "sub": user_id,
            "product_id": product_id,
            "iat": now.timestamp(),
            "exp": (now + self.token_expiry).timestamp(),
            "nonce": nonce
        }
        
        # Store nonce in Redis
        await settings.redis.setex(
            f"product_access:{nonce}",
            int(self.token_expiry.total_seconds()),
            "1"
        )
        
        return jwt.encode(payload, self.secret, algorithm="HS256")

    async def verify_access_token(self, token: str) -> Dict:
        try:
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            
            # Verify nonce
            nonce_key = f"product_access:{payload['nonce']}"
            nonce_exists = await settings.redis.get(nonce_key)
            
            if not nonce_exists:
                raise ValueError("Invalid or expired token")
            
            # Delete nonce to prevent reuse
            await settings.redis.delete(nonce_key)
            
            return payload
        except Exception as e:
            raise ValueError(f"Invalid token: {str(e)}")
