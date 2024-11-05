from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.tier import Tier as TierModel
from app.schemas.tier import Tier as TierSchema, TierCreate, TierUpdate, TierWithProducts
from app.services import tier_service
from typing import List
from app.api.deps import get_current_user, admin_required
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("", response_model=List[TierWithProducts])
async def get_tiers(db: Session = Depends(get_db)):
    return await tier_service.get_all_tiers(db)

@router.post("", response_model=TierWithProducts, dependencies=[Depends(admin_required)])
async def create_tier(tier: TierCreate, db: Session = Depends(get_db)):
    logger.info(f"Creating tier with data: {tier.model_dump()}")
    return await tier_service.create_tier(db, tier)

@router.put("/{tier_id}", response_model=TierWithProducts, dependencies=[Depends(admin_required)])
async def update_tier(tier_id: int, tier: TierUpdate, db: Session = Depends(get_db)):
    return await tier_service.update_tier(db, tier_id, tier)

@router.delete("/{tier_id}", response_model=TierSchema, dependencies=[Depends(admin_required)])
async def delete_tier(tier_id: int, db: Session = Depends(get_db)):
    db_tier = await tier_service.get_tier(db, tier_id)
    if not db_tier:
        raise HTTPException(status_code=404, detail="Tier not found")
    return await tier_service.delete_tier(db, db_tier) 