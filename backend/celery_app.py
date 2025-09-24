from celery import Celery
from config import settings


celery_app = Celery(
    "backend_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)



# Ensure task modules are registered when the worker starts
import tasks  # noqa: E402,F401
