# app/dashboard.py
from fastapi import APIRouter, Depends
from app.utils import get_admin_user
from app.database import db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats(current_user = Depends(get_admin_user)):
    total_engines = await db.engines.count_documents({})
    available_engines = await db.engines.count_documents({"status": "available"})
    rented_engines = await db.engines.count_documents({"status": "rented"})
    maintenance_engines = await db.engines.count_documents({"status": "maintenance"})

    total_reservations = await db.reservations.count_documents({})
    pending_reservations = await db.reservations.count_documents({"status": "pending"})
    approved_reservations = await db.reservations.count_documents({"status": "approved"})

    completed_payments = await db.payments.find({"status": "completed"}).to_list(1000)
    total_revenue = sum(p["amount"] for p in completed_payments)

    return {
        "engines": {
            "total": total_engines,
            "available": available_engines,
            "rented": rented_engines,
            "maintenance": maintenance_engines,
        },
        "reservations": {
            "total": total_reservations,
            "pending": pending_reservations,
            "approved": approved_reservations,
        },
        "revenue": {
            "total": total_revenue,
            "this_month": total_revenue  # Simplified
        }
    }
