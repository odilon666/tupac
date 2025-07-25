from fastapi import APIRouter, HTTPException, Depends
from app.models import Payment, User, PaymentResponse
from app.database import db
from app.utils import get_current_user
from datetime import datetime
import uuid
from fastapi.responses import StreamingResponse
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/", response_model=list[PaymentResponse])
async def get_payments(current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        payments = await db.payments.find().to_list(1000)
    else:
        reservations = await db.reservations.find({"user_id": current_user.id}).to_list(1000)
        reservation_ids = [r["id"] for r in reservations]
        payments = await db.payments.find({"reservation_id": {"$in": reservation_ids}}).to_list(1000)
    
    enriched = []
    for payment in payments:
        user = await db.users.find_one({"id": payment.get("user_id")})  # Si user_id stocké dans paiement
        reservation = await db.reservations.find_one({"id": payment["reservation_id"]})
        
        # Parfois user_id peut ne pas être dans paiement, donc fallback sur current_user.email si admin
        user_email = user["email"] if user else (current_user.email if current_user.role != "admin" else "Inconnu")
        
        # Exemple pour reservation_title, tu peux adapter selon ta structure de réservation
        reservation_title = reservation.get("engine_name") if reservation else "Réservation"
        
        enriched.append(
            PaymentResponse(
                **payment,
                user_email=user_email,
                reservation_title=reservation_title
            )
        )

    return enriched

@router.post("/{payment_id}/process")
async def process_payment(payment_id: str, current_user: User = Depends(get_current_user)):
    payment = await db.payments.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    await db.payments.update_one({"id": payment_id}, {
        "$set": {
            "status": "completed",
            "transaction_id": f"txn_{uuid.uuid4()}"
        }
    })
    return {"message": "Payment processed successfully"}

@router.get("/{payment_id}/invoice")
async def get_invoice(payment_id: str, current_user: User = Depends(get_current_user)):
    payment = await db.payments.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement introuvable")

    reservation = await db.reservations.find_one({"id": payment["reservation_id"]})
    user = await db.users.find_one({"id": reservation["user_id"]}) if reservation else None

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 800, f"Facture Paiement #{payment['id']}")
    p.setFont("Helvetica", 12)
    p.drawString(100, 780, f"Client : {user['name'] if user else 'Inconnu'} ({user['email'] if user else 'Inconnu'})")
    p.drawString(100, 760, f"Réservation : {reservation['engine_name'] if reservation else 'Inconnue'}")
    p.drawString(100, 740, f"Montant : {payment['amount']} Ar")
    p.drawString(100, 720, f"Date : {payment['created_at'].strftime('%Y-%m-%d') if isinstance(payment['created_at'], datetime) else payment['created_at']}")

    p.showPage()
    p.save()
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="application/pdf", headers={
        "Content-Disposition": f"inline; filename=facture_{payment_id}.pdf"
    })
