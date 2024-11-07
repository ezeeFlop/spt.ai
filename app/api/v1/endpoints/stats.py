from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.services.stats_service import get_user_stats, get_revenue_stats
from app.services.payment_service import get_total_revenue
from app.api.deps import get_current_user, admin_required
from enum import Enum
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class TimeRange(str, Enum):
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"

@router.get("/revenue/{time_range}", dependencies=[Depends(admin_required)])
async def get_revenue_statistics(
    time_range: TimeRange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
): 
    logger.info(f"Getting revenue stats for time range: {time_range}")
    """Get revenue statistics for a specific time range"""
    try:
        stats = await get_revenue_stats(db, time_range)
        formatted_stats = {
            "type": "revenue",
            "timeRange": time_range,
            "data": stats
        }
        logger.info(f"Revenue stats: {formatted_stats}")
        return formatted_stats
    except Exception as e:
        logger.error(f"Error getting revenue stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching revenue statistics")

@router.get("/revenue", dependencies=[Depends(admin_required)])
async def get_total_revenue_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info("Getting total revenue stats")
    """Get total revenue across all time with currency breakdown"""
    try:
        total = await get_total_revenue(db)
        formatted_total = {
            "type": "total_revenue",
            "data": total
        }
        logger.info(f"Total revenue stats: {formatted_total}")
        return formatted_total
    except Exception as e:
        logger.error(f"Error getting total revenue: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching total revenue")

@router.get("/users/{time_range}", dependencies=[Depends(admin_required)])
async def get_user_statistics(
    time_range: TimeRange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user registration statistics for a specific time range"""
    logger.info(f"Getting user stats for time range: {time_range}")
    try:
        stats = await get_user_stats(db, time_range)
        formatted_stats = {
            "type": "users",
            "timeRange": time_range,
            "data": stats
        }
        logger.info(f"User stats: {formatted_stats}")
        return formatted_stats
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching user statistics")