from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.tier import Tier
from app.schemas.tier import TierCreate, TierUpdate
from app.models.product import Product
import logging
import stripe
from app.core.config import settings

logger = logging.getLogger(__name__)

async def update_stripe_product_description(stripe_price_id: str, description: str, products: list):
    """Update Stripe product description"""
    try:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        price = stripe.Price.retrieve(
            stripe_price_id,
            expand=['product']
        )
        
        # Format products list
        product_names = [p.name for p in products]
        product_list = "\n- ".join(product_names)
        full_description = f"{description}\n\nIncluded Products:\n- {product_list}"
        
        # Update the product description
        stripe.Product.modify(
            price.product.id,
            description=full_description
        )
    except stripe.error.StripeError as e:
        logger.error(f"Failed to update Stripe product description: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

async def create_tier(db: Session, tier_data: TierCreate):
    logger.info(f"Creating tier with data: {tier_data.model_dump()}")
    
    if tier_data.is_free:
        logger.info("Processing free tier creation")
        existing_free_tier = db.query(Tier).filter(Tier.is_free == True).first()
        if existing_free_tier:
            raise HTTPException(status_code=400, detail="A free tier already exists")
        
        tier_data.price = 0
        tier_data.billing_period = 'free'
        tier_data.stripe_price_id = None
    
    if tier_data.popular:
        # Reset popular flag for all other tiers
        db.query(Tier).filter(Tier.popular == True).update({"popular": False})
    
    # Extract product_ids before creating the tier
    product_ids = tier_data.product_ids
    tier_dict = tier_data.model_dump(exclude={'product_ids'})
    
    # Create tier without products first
    tier = Tier(**tier_dict)
    db.add(tier)
    db.flush()  # Get the ID without committing
    
    # Add products to the tier
    if product_ids:
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
        tier.products.extend(products)
        
        # Update Stripe product description if it's a paid tier
        if tier.stripe_price_id:
            await update_stripe_product_description(
                tier.stripe_price_id,
                tier.description,
                products
            )
    
    db.commit()
    db.refresh(tier)
    return tier

async def get_all_tiers(db: Session):
    return db.query(Tier).all()

async def get_tier(db: Session, tier_id: int):
    return db.query(Tier).filter(Tier.id == tier_id).first()

async def update_tier(db: Session, tier_id: int, tier_data: TierUpdate):
    tier = db.query(Tier).filter(Tier.id == tier_id).first()
    if tier:
        if tier_data.popular:
            # Reset popular flag for all other tiers
            db.query(Tier).filter(Tier.id != tier_id).filter(Tier.popular == True).update({"popular": False})
        
        # Extract product_ids before updating the tier
        product_ids = tier_data.product_ids
        update_data = tier_data.model_dump(exclude={'product_ids'}, exclude_unset=True)
        
        # Update tier fields
        for key, value in update_data.items():
            setattr(tier, key, value)
        
        # Update products if provided
        if product_ids is not None:
            products = db.query(Product).filter(Product.id.in_(product_ids)).all()
            tier.products = products
            
            # Update Stripe product description if it's a paid tier
            if tier.stripe_price_id:
                await update_stripe_product_description(
                    tier.stripe_price_id,
                    tier.description,
                    products
                )
        
        db.commit()
        db.refresh(tier)
    return tier

async def delete_tier(db: Session, tier: Tier):
    db.delete(tier)
    db.commit()
    return tier

async def get_default_tier(db: Session):
    return db.query(Tier).filter(Tier.is_free == True).first() 