from celery import Celery
from app.core.config import settings
from celery.schedules import crontab

celery_app = Celery(
    'tasks',
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

celery_app.conf.beat_schedule = {
    'refill-user-tokens-every-day': {
        'task': 'app.tasks.refill_user_tokens',
        'schedule': crontab(hour=0, minute=0),  # Every day at midnight
    },
}
