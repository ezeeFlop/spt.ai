from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.payment import Payment, PaymentStatus
from app.models.user_subscription import UserSubscription
from datetime import datetime, timedelta
from app.services import subscription_service
import stripe
from app.core.config import settings
import logging
from sqlalchemy import select
from app.models.tier import Tier
from app.models.user import User
from typing import List, Dict, Any
from sqlalchemy import func

logger = logging.getLogger(__name__)
    
stripe.api_key = settings.STRIPE_SECRET_KEY

async def handle_successful_payment(
    db: AsyncSession,
    clerk_id: str,
    tier_id: int,
    payment_id: str,
    amount: int,
    currency: str = "USD"
) -> None:
    """Handle successful Stripe payment and update subscription"""
    try:
        # Create payment record
        payment = Payment(
            user_id=clerk_id,
            tier_id=tier_id,
            stripe_payment_id=payment_id,
            amount=amount,
            currency=currency,
            status=PaymentStatus.COMPLETED,
            payment_date=datetime.utcnow()
        )
        db.add(payment)

        # Get the tier
        tier_result = db.execute(
            select(Tier).where(Tier.id == tier_id)
        )
        tier = tier_result.scalar_one_or_none()
        
        if not tier:
            raise ValueError("Tier not found")

        # Get the user
        user_result = db.execute(
            select(User).where(User.clerk_id == clerk_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise ValueError("User not found")

        # Update user's API call limits based on tier
        user.api_max_calls = tier.tokens
        user.api_calls_count = 0

        # Delete any existing subscription
        old_sub_result = db.execute(
            select(UserSubscription).where(UserSubscription.user_id == clerk_id)
        )
        old_subscription = old_sub_result.scalar_one_or_none()
        
        if old_subscription:
            await cancel_subscription(db, old_subscription)

        # Create new subscription
        now = datetime.utcnow()
        subscription = UserSubscription(
            user_id=clerk_id,
            tier_id=tier_id,
            start_date=now,
            end_date=now + timedelta(days=30),
            is_active=True
        )
        db.add(subscription)

        db.commit()

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to process payment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process subscription: {str(e)}"
        )

async def cancel_subscription(db: AsyncSession, subscription: UserSubscription) -> None:
    """Cancel a subscription and handle Stripe if needed"""
    try:
        logger.info(f"Cancelling subscription: {subscription.id} for user: {subscription.user_id} with stripe id: {subscription.stripe_subscription_id}")
        # If it's a paid subscription with Stripe, cancel it first
        if subscription.stripe_subscription_id:
            await cancel_stripe_subscription(subscription.stripe_subscription_id)
        
        # Delete the subscription from our database
        db.delete(subscription)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to cancel subscription: {str(e)}")
        import traceback
        logger.error(f"Stack trace: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel subscription: {str(e)}"
        )


async def create_stripe_checkout_session(
    db: AsyncSession,
    tier_id: int, 
    price_id: str, 
    user_id: str
):
    """Create a Stripe checkout session for subscription"""
    try:
        # Get the tier to check its type
        tier_result = db.execute(select(Tier).where(Tier.id == tier_id))
        tier = tier_result.scalar_one_or_none()
        
        if not tier:
            raise ValueError("Tier not found")

        # Check for existing subscription
        existing_sub = await subscription_service.get_active_subscription(db, user_id)
        if existing_sub and existing_sub.stripe_subscription_id:
            # Cancel existing Stripe subscription
            await cancel_stripe_subscription(existing_sub.stripe_subscription_id)
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription' if tier.type == 'recurring' else 'payment',
            success_url=f"{settings.FRONTEND_URL}/features?payment=success",
            cancel_url=f"{settings.FRONTEND_URL}/pricing",
            client_reference_id=user_id,
            metadata={
                'tier_id': tier_id,
                'user_id': user_id
            }
        )
        return checkout_session
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise ValueError(f"Error creating checkout session: {str(e)}")

async def cancel_stripe_subscription(subscription_id: str) -> None:
    """Cancel a Stripe subscription"""
    try:
        logger.info(f"Cancelling Stripe subscription: {subscription_id}")
        if subscription_id:
            stripe.Subscription.delete(subscription_id)
    except stripe.error.StripeError as e:
        logger.error(f"Failed to cancel Stripe subscription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel subscription: {str(e)}"
        )

async def get_stripe_products() -> List[Dict[str, Any]]:
    """
    Retrieve all active products and their prices from Stripe,
    including all available currencies for each product.
    Returns a list of products with their associated prices, currencies, and metadata.
    """
    try:
        # Fetch all active products
        products = stripe.Product.list(active=True)
        
        # Fetch all active prices for these products
        prices = stripe.Price.list(
            active=True,
            expand=['data.product']
        )
        
        # Group prices by product
        product_prices: Dict[str, List[Dict[str, Any]]] = {}
        for price in prices.data:
            product_id = price.product.id
            if product_id not in product_prices:
                product_prices[product_id] = []
                
            price_info = {
                'id': price.id,
                'currency': price.currency.upper(),
                'amount': price.unit_amount / 100,  # Convert cents to dollars
                'interval': price.recurring.interval if price.recurring else None,
                'interval_count': price.recurring.interval_count if price.recurring else None,
                'type': 'recurring' if price.recurring else 'one_time'
            }
            product_prices[product_id].append(price_info)
        
        # Format products with their prices
        formatted_products = []
        for product in products.data:
            product_data = {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'metadata': product.metadata,
                'image': product.images[0] if product.images else None,
                'prices': product_prices.get(product.id, []),
                'default_price': next(
                    (p for p in product_prices.get(product.id, []) 
                     if p['id'] == product.default_price),
                    None
                )
            }
            formatted_products.append(product_data)
        
        return formatted_products

    except stripe.error.StripeError as e:
        logger.error(f"Failed to fetch Stripe products: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch subscription products: {str(e)}"
        )

# Helper function to get products in a specific currency
async def get_products_by_currency(currency_code: str) -> List[Dict[str, Any]]:
    """
    Get all products with prices in a specific currency.
    """
    try:
        products = await get_stripe_products()
        
        # Filter products to only include prices in the specified currency
        currency_products = []
        for product in products:
            currency_prices = [
                price for price in product['prices'] 
                if price['currency'] == currency_code.upper()
            ]
            
            if currency_prices:
                product_copy = product.copy()
                product_copy['prices'] = currency_prices
                product_copy['default_price'] = next(
                    (p for p in currency_prices 
                     if p['id'] == product['default_price']['id']),
                    currency_prices[0]
                ) if currency_prices else None
                currency_products.append(product_copy)
        
        return currency_products

    except Exception as e:
        logger.error(f"Failed to fetch products for currency {currency_code}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch products: {str(e)}"
        )

async def get_stripe_currencies() -> List[Dict[str, str]]:
    """
    Retrieve all supported currencies from Stripe.
    Returns a list of currencies with their details.
    """
    try:
        # Get all supported currencies from Stripe
        currencies = stripe.CountrySpec.retrieve('US').supported_payment_currencies
        
        # Format the currencies with their symbols and names
        formatted_currencies = []
        for currency_code in currencies:
            try:
                # Get currency details using the built-in locale module
                currency_info = {
                    'code': currency_code.upper(),
                    'name': stripe.Price.create(
                        unit_amount=1000,
                        currency=currency_code,
                        product='dummy'
                    ).currency
                }
                formatted_currencies.append(currency_info)
            except stripe.error.StripeError:
                continue
                
        return formatted_currencies

    except stripe.error.StripeError as e:
        logger.error(f"Failed to fetch Stripe currencies: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch supported currencies: {str(e)}"
        )

# You can also add a helper function to get a specific currency's details
async def get_currency_details(currency_code: str) -> Dict[str, str]:
    """
    Get details for a specific currency.
    """
    try:
        currencies = await get_stripe_currencies()
        currency = next((c for c in currencies if c['code'] == currency_code.upper()), None)
        
        if not currency:
            raise HTTPException(
                status_code=404,
                detail=f"Currency {currency_code} not found"
            )
            
        return currency

    except Exception as e:
        logger.error(f"Failed to fetch currency details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch currency details: {str(e)}"
        )

async def get_revenue_stats(db: AsyncSession, time_range: str) -> Dict[str, Any]:
    try:
        # Get the date range
        end_date = datetime.utcnow()
        if time_range == 'week':
            start_date = end_date - timedelta(days=7)
            interval = '1 day'
            date_format = '%Y-%m-%d'
        elif time_range == 'month':
            start_date = end_date - timedelta(days=30)
            interval = '1 day'
            date_format = '%Y-%m-%d'
        else:  # year
            start_date = end_date - timedelta(days=365)
            interval = '1 month'
            date_format = '%Y-%m'

        # Query payments with currency information
        query = select(
            func.date_trunc(interval, Payment.payment_date).label('date'),
            func.sum(Payment.amount).label('amount'),
            Payment.currency
        ).where(
            Payment.payment_date.between(start_date, end_date),
            Payment.status == PaymentStatus.COMPLETED
        ).group_by(
            'date',
            Payment.currency
        ).order_by('date')

        result = db.execute(query)
        payments = result.fetchall()

        # Group by currency
        revenue_by_currency = {}
        for payment in payments:
            currency = payment.currency or 'USD'  # Default to USD if not specified
            if currency not in revenue_by_currency:
                revenue_by_currency[currency] = {
                    'labels': [],
                    'data': []
                }
            revenue_by_currency[currency]['labels'].append(
                payment.date.strftime(date_format)
            )
            revenue_by_currency[currency]['data'].append(float(payment.amount))

        return revenue_by_currency

    except Exception as e:
        logger.error(f"Error getting revenue stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get revenue statistics: {str(e)}"
        )

async def get_total_revenue(db: AsyncSession) -> Dict[str, Any]:
    try:
        query = select(
            func.sum(Payment.amount).label('total'),
            Payment.currency
        ).where(
            Payment.status == PaymentStatus.COMPLETED
        ).group_by(Payment.currency)
        
        result = db.execute(query)
        totals = result.fetchall()
        
        revenue_by_currency = {}
        total_usd = 0  # Keep USD total for legacy support
        
        for total in totals:
            currency = total.currency or 'USD'
            amount = float(total.total / 100) if total.total else 0.0
            revenue_by_currency[currency] = amount
            if currency == 'USD':
                total_usd = amount
        
        return {
            "total": total_usd,  # Keep for backward compatibility
            "by_currency": revenue_by_currency
        }
    except Exception as e:
        logger.error(f"Error getting total revenue: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get total revenue: {str(e)}"
        )
