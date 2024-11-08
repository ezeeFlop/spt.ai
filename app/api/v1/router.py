from fastapi import APIRouter
from .endpoints import users, products, payments, auth, blog, tiers, stats, media, stripe, content

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(tiers.router, prefix="/tiers", tags=["tiers"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(blog.router, prefix="/blog", tags=["blog"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(media.router, prefix="/media", tags=["media"])
api_router.include_router(stripe.router, prefix="/stripe", tags=["stripe"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
