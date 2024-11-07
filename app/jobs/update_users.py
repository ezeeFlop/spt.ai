from app.celery_app import celery_app
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.user_subscription import UserSubscription
from app.models.tier import Tier
from app.db.session import get_db
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def refill_user_tokens():
    try:
        with get_db() as db:  # Assuming get_db is an async context manager
            # Get all active subscriptions with recurring tiers
            query = (
                select(UserSubscription)
                .join(Tier)
                .where(UserSubscription.is_active == True)
                .where(Tier.type == 'recurring')
            )
            result = db.execute(query)
            subscriptions = result.scalars().all()

            for subscription in subscriptions:
                # Calculate the next refill date
                next_refill_date = subscription.start_date + timedelta(days=30)
                if datetime.utcnow() >= next_refill_date:
                    # Get the user
                    user = db.get(User, subscription.user_id)
                    if user:
                        # Refill tokens
                        user.api_max_calls = subscription.tier.tokens
                        user.api_calls_count = 0
                        # Update the subscription start date to the current date
                        subscription.start_date = datetime.utcnow()
                        db.commit()
    except Exception as e:
        logger.error(f"Error refilling user tokens: {str(e)}")
        db.rollback()
