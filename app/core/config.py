from pydantic_settings import BaseSettings

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
    
    class Config:
        env_file = ".env"

settings = Settings()
