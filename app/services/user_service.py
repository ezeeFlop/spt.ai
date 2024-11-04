import logging
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
import httpx
from app.core.config import settings
from datetime import datetime

logger = logging.getLogger(__name__)

async def get_clerk_user_data(clerk_id: str):
    """Fetch user data from Clerk API"""
    logger.info(f"Fetching user data from Clerk API for clerk_id: {clerk_id}")
    
    headers = {
        "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            logger.debug(f"Making request to Clerk API: GET https://api.clerk.dev/v1/users/{clerk_id}")
            
            response = await client.get(
                f"https://api.clerk.dev/v1/users/{clerk_id}",
                headers=headers
            )
            
            logger.info(f"Clerk API response status code: {response.status_code}")
            
            if response.status_code == 200:
                user_data = response.json()
                logger.debug("Successfully parsed Clerk API response")
                
                result = {
                    "email": user_data["email_addresses"][0]["email_address"],
                    "name": f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
                }
                logger.info(f"Successfully retrieved user data for clerk_id: {clerk_id}")
                return result
            
            logger.error(f"Failed to fetch user data from Clerk API. Status code: {response.status_code}")
            return None
            
    except httpx.RequestError as e:
        logger.error(f"HTTP request to Clerk API failed: {str(e)}")
        return None
    except KeyError as e:
        logger.error(f"Failed to parse Clerk API response: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error while fetching Clerk user data: {str(e)}")
        return None

def create_user(db: Session, user: UserCreate):
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_clerk_id(db: Session, clerk_id: str):
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if user:
        user.last_connection = datetime.utcnow()
        db.commit()
    return user

def increment_product_api_call_count(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        if user.product_api_calls_this_month < user.max_product_api_calls_per_month:
            user.product_api_calls_this_month += 1
            db.commit()
        else:
            raise Exception("API call limit reached for this month")

def reset_monthly_api_call_count(db: Session):
    # This function should be called at the start of each month
    users = db.query(User).all()
    for user in users:
        user.product_api_calls_this_month = 0
    db.commit()
