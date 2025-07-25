from fastapi import APIRouter, HTTPException, Depends, status
from app.models import Reservation, ReservationCreate, User
from app.database import db
from app.utils import get_current_user, get_admin_user, send_email
from datetime import datetime
from bson import ObjectId
import uuid

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.get("/", response_model=list[Reservation])
async def get_reservations(current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        reservations = await db.reservations.find().to_list(1000)
    else:
        reservations = await db.reservations.find({"user_id": current_user.id}).to_list(1000)
    return [Reservation(**r) for r in reservations]

@router.post("/", response_model=Reservation)
async def create_reservation(reservation_data: ReservationCreate, current_user: User = Depends(get_current_user)):
    engine = await db.engines.find_one({"_id": ObjectId(reservation_data.engine_id)})
    if not engine:
        raise HTTPException(status_code=404, detail="Engine not found")

    if engine.get("status") != "available":
        raise HTTPException(status_code=400, detail="Engine is not available")

    # Vérifier conflits réservations existantes sur la même période
    conflicts = await db.reservations.find({
        "engine_id": reservation_data.engine_id,
        "status": {"$in": ["pending", "approved"]},
        "$or": [
            {"start_date": {"$lte": reservation_data.start_date}, "end_date": {"$gte": reservation_data.start_date}},
            {"start_date": {"$lte": reservation_data.end_date}, "end_date": {"$gte": reservation_data.end_date}},
            {"start_date": {"$gte": reservation_data.start_date}, "end_date": {"$lte": reservation_data.end_date}}
        ]
    }).to_list(1000)
    if conflicts:
        raise HTTPException(status_code=400, detail="Engine already reserved for this period")

    days = (reservation_data.end_date - reservation_data.start_date).days
    if days <= 0:
        raise HTTPException(status_code=400, detail="Invalid reservation period")

    total_amount = days * engine.get("daily_rate", 0)

    reservation_dict = reservation_data.dict()
    reservation_dict.update({
        "_id": ObjectId(),
        "id": str(uuid.uuid4()),  # garder un ID string lisible si besoin
        "user_id": current_user.id,
        "total_amount": total_amount,
        "status": "pending",
        "created_at": datetime.utcnow()
    })

    await db.reservations.insert_one(reservation_dict)

    # Envoi email
    send_email(current_user.email, "Nouvelle réservation", f"Votre réservation pour {engine['name']} a été créée. Total: {total_amount}€")

    return Reservation(**reservation_dict)

@router.put("/{reservation_id}/approve")
async def approve_reservation(reservation_id: str, current_user: User = Depends(get_admin_user)):
    reservation = await db.reservations.find_one({"id": reservation_id})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    await db.reservations.update_one({"id": reservation_id}, {"$set": {"status": "approved"}})
    await db.engines.update_one({"_id": ObjectId(reservation["engine_id"])}, {"$set": {"status": "rented"}})

    payment_dict = {
        "_id": ObjectId(),
        "id": str(uuid.uuid4()),
        "reservation_id": reservation_id,
        "amount": reservation["total_amount"],
        "status": "pending",
        "payment_method": "stripe",
        "created_at": datetime.utcnow()
    }
    await db.payments.insert_one(payment_dict)
    return {"message": "Reservation approved"}

@router.put("/{reservation_id}/reject")
async def reject_reservation(reservation_id: str, current_user: User = Depends(get_admin_user)):
    reservation = await db.reservations.find_one({"id": reservation_id})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    await db.reservations.update_one({"id": reservation_id}, {"$set": {"status": "rejected"}})
    return {"message": "Reservation rejected"}
