from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.api.v1.router import api_router
from app.api.health import router as health_router
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.db.base import Base
from app.db.session import engine
from app.middleware.error_handler import (
    error_handler_middleware,
    validation_exception_handler,
    sqlalchemy_exception_handler
)
from app.middleware.validation import request_validation_middleware
from app.middleware.logging import log_request_middleware

# Setup logging
setup_logging()

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=f"{settings.PROJECT_NAME} - v1",
    description="API for Sponge-Theory.ai platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add middlewares
app.middleware("http")(error_handler_middleware)
app.middleware("http")(request_validation_middleware)
app.middleware("http")(log_request_middleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)

# Include routers
app.include_router(health_router, tags=["Health"])
app.include_router(api_router, prefix=settings.API_V1_STR)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Sponge-Theory.ai API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 