# app/routes/maintenance.py

from fastapi import APIRouter, HTTPException, Depends
from app.utils import get_current_user, get_admin_user
from app.models import MaintenanceCreate, Maintenance
from app.database import db
from datetime import datetime
from uuid import uuid4

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])

# ✅ Créer une maintenance
@router.post("/")
async def schedule_maintenance(data: MaintenanceCreate, admin=Depends(get_admin_user)):
    maintenance_id = str(uuid4())
    data_dict = data.dict()
    data_dict.update({
        "id": maintenance_id,
        "status": "scheduled",
        "created_at": datetime.utcnow()
    })

    await db.maintenances.insert_one(data_dict)
    await db.engines.update_one(
        {"id": data.engine_id},
        {"$set": {"status": "maintenance"}}
    )

    return {"message": "Maintenance planifiée", "id": maintenance_id}

# ✅ Liste des maintenances
@router.get("/")
async def list_maintenances(user=Depends(get_current_user)):
    maintenances = await db.maintenances.find({}).to_list(100)
    return maintenances

# ✅ Terminer une maintenance
@router.patch("/{maintenance_id}/complete")
async def complete_maintenance(maintenance_id: str, user=Depends(get_current_user)):
    maintenance = await db.maintenances.find_one({"id": maintenance_id})
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance non trouvée")

    if maintenance["status"] != "scheduled":
        raise HTTPException(status_code=400, detail="Maintenance déjà terminée")

    await db.maintenances.update_one(
        {"id": maintenance_id},
        {"$set": {
            "status": "completed",
            "completed_date": datetime.utcnow()
        }}
    )

    await db.engines.update_one(
        {"id": maintenance["engine_id"]},
        {"$set": {"status": "available"}}
    )

    return {"message": "Maintenance terminée"}
