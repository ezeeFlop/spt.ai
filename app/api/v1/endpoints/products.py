from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import Product as ProductSchema, ProductCreate, ProductUpdate
from app.services import product_service
from typing import List
from app.api.deps import admin_required
from app.services.product_access_service import ProductAccessService
from app.api.deps import get_current_user
from typing import Optional

router = APIRouter()

product_access_service = ProductAccessService()

@router.post("/", response_model=ProductSchema, dependencies=[Depends(admin_required)])
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    return await product_service.create_product(db, product)

@router.get("/", response_model=List[ProductSchema])
async def list_products(db: Session = Depends(get_db)):
    return await product_service.get_all_products(db)

@router.put("/{product_id}", response_model=ProductSchema, dependencies=[Depends(admin_required)])
async def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    db_product = await product_service.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return await product_service.update_product(db, product_id=product_id, product_data=product)

@router.delete("/{product_id}", response_model=ProductSchema, dependencies=[Depends(admin_required)])
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = await product_service.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return await product_service.delete_product(db, product_id=product_id)

@router.get("/{product_id}", response_model=ProductSchema)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    product = await product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/{product_id}/access")
async def get_product_access(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify user has access through subscription
    has_access = await verify_product_access(db, current_user.clerk_id, product_id)
    if not has_access:
        raise HTTPException(status_code=403, detail="No access to this product")
    
    # Generate access token
    token = await product_access_service.generate_access_token(
        current_user.clerk_id,
        product_id
    )
    
    product = await product_service.get_product(db, product_id)
    
    return {
        "access_url": f"{product.frontend_url}?access_token={token}"
    }

@router.post("/verify-access")
async def verify_product_access(
    token: str,
    origin: Optional[str] = Header(None)
):
    try:
        payload = await product_access_service.verify_access_token(token)
        
        # Verify origin if provided
        if origin:
            product = await product_service.get_product(db, payload["product_id"])
            if not origin.startswith(product.frontend_url):
                raise HTTPException(status_code=403, detail="Invalid origin")
        
        return {
            "valid": True,
            "user_id": payload["sub"],
            "product_id": payload["product_id"]
        }
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))