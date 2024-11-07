from pydantic_settings import BaseSettings
import os
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sponge-Theory.ai API"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    
    CLERK_SECRET_KEY: str
    STRIPE_SECRET_KEY: str
    DATABASE_URL: str
    
    # Update Clerk JWT settings
    CLERK_JWKS_URL: str
    CLERK_JWT_AUDIENCE: str = os.getenv("CLERK_JWT_AUDIENCE", "")
    CLERK_JWT_ISSUER: str = os.getenv("CLERK_JWT_ISSUER", "")
    
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    # Media settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    SERVER_HOST: str = os.getenv("SERVER_HOST", "http://localhost:8000")
    ALLOWED_EXTENSIONS: dict = {
        'image': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
        'video': {'mp4', 'webm', 'mov'},
        'document': {'pdf'}
    }
    MAX_FILE_SIZE: dict = {
        'image': 5_000_000,      # 5MB
        'video': 100_000_000,    # 100MB
        'document': 10_000_000   # 10MB
    }
    
    PRODUCT_ACCESS_SECRET: str = ""
    
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    class Config:
        env_file = ".env"

settings = Settings()
