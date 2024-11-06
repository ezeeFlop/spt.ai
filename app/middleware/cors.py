from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.services.product_service import get_all_products
from typing import List
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from fastapi import Response

def setup_cors(app):
    """Setup CORS middleware with configured origins"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL],  # Only allow frontend initially
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def cors_origin_middleware(request, call_next):
        # Skip CORS check for OPTIONS requests
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip CORS check for internal API routes
        if request.url.path.startswith(f"{settings.API_V1_STR}/verify-access"):
            return await call_next(request)

        # Get origin from headers
        origin = request.headers.get("origin")
        if not origin:
            return await call_next(request)

        # Allow frontend URL
        if origin == settings.FRONTEND_URL:
            return await call_next(request)

        # For product origins, only check on verify-access endpoint
        if request.url.path.endswith("/verify-access"):
            db = SessionLocal()
            try:
                products = await get_all_products(db)
                product_urls = [product.frontend_url for product in products]
                
                if origin not in product_urls:
                    return Response(
                        status_code=403,
                        content="Origin not allowed"
                    )
            finally:
                db.close()

        return await call_next(request)
