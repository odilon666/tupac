# app/engines.py
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.models import Engine, EngineCreate, User
from app.utils import get_admin_user
from app.database import db
from datetime import datetime
import uuid

router = APIRouter(prefix="/engines", tags=["Engines"])

@router.get("/", response_model=List[Engine])
async def list_engines(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None
):
    query = {}
    if category:
        query["category"] = category
    if brand:
        query["brand"] = brand
    if status:
        query["status"] = status
    if location:
        query["location"] = location
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]

    engines = await db.engines.find(query).to_list(1000)
    return [Engine(**engine) for engine in engines]

@router.get("/{engine_id}", response_model=Engine)
async def get_engine(engine_id: str):
    engine = await db.engines.find_one({"id": engine_id})
    if not engine:
        raise HTTPException(status_code=404, detail="Engine not found")
    return Engine(**engine)

@router.post("/", response_model=Engine)
async def create_engine(engine_data: EngineCreate, current_user: User = Depends(get_admin_user)):
    engine_dict = engine_data.dict()
    engine_dict.update({
        "id": str(uuid.uuid4()),
        "status": "available",
        "created_at": datetime.utcnow()
    })
    await db.engines.insert_one(engine_dict)
    return Engine(**engine_dict)

@router.put("/{engine_id}", response_model=Engine)
async def update_engine(engine_id: str, engine_data: EngineCreate, current_user: User = Depends(get_admin_user)):
    existing = await db.engines.find_one({"id": engine_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Engine not found")
    await db.engines.update_one({"id": engine_id}, {"$set": engine_data.dict()})
    updated = await db.engines.find_one({"id": engine_id})
    return Engine(**updated)

@router.delete("/{engine_id}")
async def delete_engine(engine_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.engines.delete_one({"id": engine_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Engine not found")
    return {"message": "Engine deleted successfully"}
