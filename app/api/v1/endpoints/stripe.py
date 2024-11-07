from fastapi import APIRouter, HTTPException, Depends
from app.api.deps import admin_required
import stripe
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/price/{price_id}", dependencies=[Depends(admin_required)])
async def get_stripe_price_details(price_id: str):
    """Get detailed information about a Stripe price"""
    try:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        price = stripe.Price.retrieve(
            price_id,
            expand=['product']
        )
        
        return {
            "amount": price.unit_amount / 100,  # Convert cents to dollars
            "currency": price.currency.upper(),
            "type": "recurring" if price.recurring else "one_time",
            "billing_period": price.recurring.interval if price.recurring else None,
            "product_name": price.product.name if price.product else None,
            "product_description": price.product.description if price.product else None
        }
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/prices", dependencies=[Depends(admin_required)])
async def list_stripe_prices():
    """Get all available Stripe prices"""
    try:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        prices = stripe.Price.list(
            active=True,
            expand=['data.product'],
            limit=100
        )
        
        return [
            {
                "id": price.id,
                "amount": price.unit_amount / 100,
                "currency": price.currency.upper(),
                "type": "recurring" if price.recurring else "one_time",
                "billing_period": price.recurring.interval if price.recurring else None,
                "product_name": price.product.name if price.product else None,
                "product_description": price.product.description if price.product else None
            }
            for price in prices.data
        ]
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
