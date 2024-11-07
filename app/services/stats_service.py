from datetime import datetime, timedelta
from sqlalchemy import func
from app.models.user import User
from app.models.payment import Payment, PaymentStatus
import logging
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

logger = logging.getLogger(__name__)

async def get_user_stats(db: AsyncSession, time_range: str) -> Dict[str, Any]:
    try:
        end_date = datetime.utcnow()
        if time_range == "week":
            start_date = end_date - timedelta(days=7)
            interval = "day"
            date_format = "%Y-%m-%d"
        elif time_range == "month":
            start_date = end_date - timedelta(days=30)
            interval = "day"
            date_format = "%Y-%m-%d"
        else:  # year
            start_date = end_date - timedelta(days=365)
            interval = "month"
            date_format = "%Y-%m"

        query = select(
            func.date_trunc(interval, User.first_connection).label('date'),
            func.count(User.id).label('count')
        ).where(
            User.first_connection.between(start_date, end_date)
        ).group_by('date').order_by('date')

        result = db.execute(query)
        users = result.fetchall()

        return {
            "labels": [u.date.strftime(date_format) for u in users],
            "data": [u.count for u in users]
        }
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get user statistics: {str(e)}"
        )

async def get_revenue_stats(db: AsyncSession, time_range: str):
    try:
        end_date = datetime.utcnow()
        
        if time_range == "week":
            start_date = end_date - timedelta(days=7)
            interval = "day"
            date_format = "%Y-%m-%d"
        elif time_range == "month":
            start_date = end_date - timedelta(days=30)
            interval = "day"
            date_format = "%Y-%m-%d"
        else:  # year
            start_date = end_date - timedelta(days=365)
            interval = "month"
            date_format = "%Y-%m"

        query = select(
            func.date_trunc(interval, Payment.payment_date).label('date'),
            func.sum(Payment.amount).label('total'),
            Payment.currency
        ).where(
            Payment.payment_date.between(start_date, end_date),
            Payment.status == PaymentStatus.COMPLETED  # Only include completed payments
        ).group_by('date', Payment.currency).order_by('date')

        result = db.execute(query)
        payments = result.fetchall()
        
        # Group by status instead of currency
        stats_by_status = {}
        for r in payments:
            status = r.currency or 'pending'
            if status not in stats_by_status:
                stats_by_status[status] = {
                    "labels": [],
                    "data": []
                }
            stats_by_status[status]["labels"].append(r.date.strftime(date_format))
            stats_by_status[status]["data"].append(float(r.total / 100) if r.total else 0.0)
        
        return stats_by_status
    except Exception as e:
        logger.error(f"Error getting revenue stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get revenue statistics: {str(e)}"
        )

async def get_total_revenue(db):
    result = db.query(func.sum(Payment.amount)).scalar()
    return float(result / 100) if result else 0.0