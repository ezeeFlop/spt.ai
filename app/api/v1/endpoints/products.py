from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import Product as ProductSchema, ProductCreate, ProductUpdate
from app.services import product_service
from typing import List
from app.api.deps import admin_required
router = APIRouter()

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
    return await product_service.update_product(db, db_product, product)

@router.delete("/{product_id}", response_model=ProductSchema, dependencies=[Depends(admin_required)])
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = await product_service.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return await product_service.delete_product(db, db_product)

@router.get("/{product_id}", response_model=ProductSchema)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    product = await product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product