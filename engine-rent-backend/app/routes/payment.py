# app/routes/payment.py

from fastapi import APIRouter, Depends, HTTPException
from app.utils import get_current_user, send_email
from app.database import db
from app.models import Payment
from datetime import datetime
from uuid import uuid4

router = APIRouter(prefix="/api/payment", tags=["Paiement"])

@router.get("/")
async def get_user_payments(user=Depends(get_current_user)):
    payments = await db.payments.find({"user_id": user.id}).to_list(100)
    return payments

@router.post("/pay/{reservation_id}")
async def pay_for_reservation(reservation_id: str, user=Depends(get_current_user)):
    reservation = await db.reservations.find_one({"id": reservation_id, "user_id": user.id})
    if not reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")

    if reservation["status"] != "approved":
        raise HTTPException(status_code=400, detail="Réservation non approuvée")

    amount = reservation["total_amount"]

    # Simuler une transaction Stripe
    transaction_id = f"TX-{uuid4().hex[:8]}"

    payment = {
        "id": str(uuid4()),
        "reservation_id": reservation_id,
        "user_id": user.id,
        "amount": amount,
        "status": "paid",
        "payment_method": "Stripe (simulé)",
        "transaction_id": transaction_id,
        "created_at": datetime.utcnow()
    }

    await db.payments.insert_one(payment)

    await db.reservations.update_one(
        {"id": reservation_id},
        {"$set": {"status": "paid"}}
    )

    send_email(
        to_email=user.email,
        subject="Paiement reçu",
        body=f"Merci pour votre paiement de {amount} €. Transaction : {transaction_id}"
    )

    return {"message": "Paiement réussi", "transaction_id": transaction_id}
