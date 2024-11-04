from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.product import Product, ProductCreate
from app.services import product_service
from app.core.security import get_current_user
from typing import List, Optional

router = APIRouter()

@router.post("/", response_model=Product)
def create_product(product: ProductCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return product_service.create_product(db, product)

@router.get("/", response_model=List[Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = product_service.get_all_products(db, skip=skip, limit=limit)
    return products

@router.get("/{product_id}", response_model=Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = product_service.get_product(db, product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.get("/search", response_model=List[Product])
def search_products(
    query: str,
    category: Optional[str] = None,
    sort_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return product_service.search_products(db, query, category, sort_by)

@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    return product_service.get_categories(db)
