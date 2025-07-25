# app/maintenance.py
from fastapi import APIRouter, HTTPException, Depends, Form
from app.models import Maintenance, MaintenanceCreate, User
from app.database import db
from app.utils import get_current_user, get_admin_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.get("/", response_model=list[Maintenance])
async def get_maintenance(current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        maintenance = await db.maintenance.find().to_list(1000)
    elif current_user.role == "technician":
        maintenance = await db.maintenance.find({"technician_id": current_user.id}).to_list(1000)
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
    return [Maintenance(**m) for m in maintenance]

@router.post("/", response_model=Maintenance)
async def create_maintenance(maintenance_data: MaintenanceCreate, current_user: User = Depends(get_admin_user)):
    await db.engines.update_one({"id": maintenance_data.engine_id}, {"$set": {"status": "maintenance"}})
    maintenance_dict = maintenance_data.dict()
    maintenance_dict.update({
        "id": str(uuid.uuid4()),
        "created_at": datetime.utcnow(),
        "status": "scheduled"
    })
    await db.maintenance.insert_one(maintenance_dict)
    return Maintenance(**maintenance_dict)

@router.put("/{maintenance_id}/complete")
async def complete_maintenance(maintenance_id: str, notes: str = Form(...), current_user: User = Depends(get_current_user)):
    maintenance = await db.maintenance.find_one({"id": maintenance_id})
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance not found")

    await db.maintenance.update_one({"id": maintenance_id}, {
        "$set": {
            "status": "completed",
            "completed_date": datetime.utcnow(),
            "notes": notes
        }
    })
    await db.engines.update_one({"id": maintenance["engine_id"]}, {"$set": {"status": "available"}})
    return {"message": "Maintenance completed"}
