# app/support.py
from fastapi import APIRouter, Depends, HTTPException
from app.models import SupportTicket, SupportTicketCreate, User
from app.database import db
from app.utils import get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/support/tickets", tags=["Support"])

@router.get("/", response_model=list[SupportTicket])
async def get_support_tickets(current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        tickets = await db.support_tickets.find().to_list(1000)
    else:
        tickets = await db.support_tickets.find({"user_id": current_user.id}).to_list(1000)
    return [SupportTicket(**t) for t in tickets]

@router.post("/", response_model=SupportTicket)
async def create_support_ticket(ticket_data: SupportTicketCreate, current_user: User = Depends(get_current_user)):
    ticket_dict = ticket_data.dict()
    ticket_dict.update({
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "created_at": datetime.utcnow(),
        "status": "open"
    })
    await db.support_tickets.insert_one(ticket_dict)
    return SupportTicket(**ticket_dict)
