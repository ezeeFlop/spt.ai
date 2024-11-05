from datetime import datetime, timedelta
from sqlalchemy import func
from app.models.user import User
from app.models.payment import Payment
import logging

logger = logging.getLogger(__name__)

async def get_user_stats(db, time_range):
    end_date = datetime.utcnow()
    
    if time_range == "week":
        start_date = end_date - timedelta(days=7)
        interval = "day"
    elif time_range == "month":
        start_date = end_date - timedelta(days=30)
        interval = "day"
    else:  # year
        start_date = end_date - timedelta(days=365)
        interval = "month"

    results = db.query(
        func.date_trunc(interval, User.first_connection).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.first_connection.between(start_date, end_date)
    ).group_by('date').order_by('date').all()
    
    return {
        "labels": [r.date.strftime("%Y-%m-%d") for r in results],
        "data": [r.count for r in results]
    }

async def get_revenue_stats(db, time_range):
    end_date = datetime.utcnow()
    
    if time_range == "week":
        start_date = end_date - timedelta(days=7)
        interval = "day"
    elif time_range == "month":
        start_date = end_date - timedelta(days=30)
        interval = "day"
    else:  # year
        start_date = end_date - timedelta(days=365)
        interval = "month"

    results = db.query(
        func.date_trunc(interval, Payment.payment_date).label('date'),
        func.sum(Payment.amount).label('total')
    ).filter(
        Payment.payment_date.between(start_date, end_date)
    ).group_by('date').order_by('date').all()
    
    return {
        "labels": [r.date.strftime("%Y-%m-%d") for r in results],
        "data": [float(r.total) if r.total else 0.0 for r in results]
    }

async def get_total_revenue(db):
    result = db.query(func.sum(Payment.amount)).scalar()
    return float(result) if result else 0.0