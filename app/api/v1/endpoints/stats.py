from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.payment import Payment
from app.api.deps import get_current_user, admin_required
from enum import Enum
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class TimeRange(str, Enum):
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"

@router.get("/revenue/{time_range}", dependencies=[Depends(admin_required)])
async def get_revenue_stats(
    time_range: TimeRange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get revenue statistics for a specific time range"""
    try:
        # Calculate date range
        now = datetime.utcnow()
        if time_range == TimeRange.WEEK:
            start_date = now - timedelta(days=7)
        elif time_range == TimeRange.MONTH:
            start_date = now - timedelta(days=30)
        else:  # YEAR
            start_date = now - timedelta(days=365)

        # Query payments within date range
        payments = db.query(Payment)\
            .filter(Payment.created_at >= start_date)\
            .all()

        # Process payments into time series data
        data = []
        labels = []
        # Add your logic to process payments into time series data

        return {
            "data": data,
            "labels": labels
        }
    except Exception as e:
        logger.error(f"Error getting revenue stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching revenue statistics")

@router.get("/revenue", dependencies=[Depends(admin_required)])
async def get_total_revenue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get total revenue across all time"""
    try:
        total = db.query(Payment).with_entities(
            func.sum(Payment.amount)
        ).scalar() or 0

        return {"total": float(total)}
    except Exception as e:
        logger.error(f"Error getting total revenue: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching total revenue")

@router.get("/users/{time_range}", dependencies=[Depends(admin_required)])
async def get_user_stats(
    time_range: TimeRange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user registration statistics for a specific time range"""
    try:
        # Calculate date range
        now = datetime.utcnow()
        if time_range == TimeRange.WEEK:
            start_date = now - timedelta(days=7)
        elif time_range == TimeRange.MONTH:
            start_date = now - timedelta(days=30)
        else:  # YEAR
            start_date = now - timedelta(days=365)

        # Query users within date range
        users = db.query(User)\
            .filter(User.first_connection >= start_date)\
            .all()

        # Process users into time series data
        data = []
        labels = []
        # Add your logic to process users into time series data

        return {
            "data": data,
            "labels": labels
        }
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching user statistics")