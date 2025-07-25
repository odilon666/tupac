# app/routes/support.py

from fastapi import APIRouter, HTTPException, Depends
from app.utils import get_current_user, get_admin_user
from app.models import SupportTicketCreate, SupportTicket
from app.database import db
from datetime import datetime
from uuid import uuid4

router = APIRouter(prefix="/api/support", tags=["Support"])

# ✅ Créer un ticket de support
@router.post("/")
async def create_ticket(data: SupportTicketCreate, user=Depends(get_current_user)):
    ticket_id = str(uuid4())
    ticket_data = data.dict()
    ticket_data.update({
        "id": ticket_id,
        "user_id": user.id,
        "status": "open",
        "created_at": datetime.utcnow()
    })

    await db.support_tickets.insert_one(ticket_data)
    return {"message": "Ticket envoyé avec succès", "id": ticket_id}

# ✅ Voir ses propres tickets
@router.get("/my")
async def get_my_tickets(user=Depends(get_current_user)):
    tickets = await db.support_tickets.find({"user_id": user.id}).to_list(100)
    return tickets

# ✅ Voir tous les tickets (admin)
@router.get("/")
async def get_all_tickets(admin=Depends(get_admin_user)):
    tickets = await db.support_tickets.find({}).to_list(100)
    return tickets

# ✅ Marquer un ticket comme résolu
@router.patch("/{ticket_id}/resolve")
async def resolve_ticket(ticket_id: str, admin=Depends(get_admin_user)):
    ticket = await db.support_tickets.find_one({"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket introuvable")

    await db.support_tickets.update_one(
        {"id": ticket_id},
        {"$set": {"status": "resolved"}}
    )
    return {"message": "Ticket marqué comme résolu"}
