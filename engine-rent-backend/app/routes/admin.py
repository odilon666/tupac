# app/routes/admin.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from app.models import User
from app.utils import get_password_hash
from app.database import db
from app.dependencies import require_roles

# Collections MongoDB
from app.database import (
    users_collection as users,
    engines_collection as engines,
    reservations_collection as reservations,
    maintenances_collection as maintenances
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# --- Dashboard stats
@router.get("/dashboard/stats")
async def get_dashboard_stats(admin=Depends(require_roles(["admin"]))):
    total_users = await users.count_documents({})
    total_engines = await engines.count_documents({})
    total_reservations = await reservations.count_documents({})
    return {
        "users": total_users,
        "engines": total_engines,
        "reservations": total_reservations
    }

# --- Réservations en attente
@router.get("/reservations/pending")
async def get_pending_reservations(admin=Depends(require_roles(["admin"]))):
    return await reservations.find({"status": "pending"}).to_list(100)

# --- Approuver une réservation
@router.put("/reservations/{reservation_id}/approve")
async def approve_reservation(reservation_id: str, admin=Depends(require_roles(["admin"]))):
    result = await reservations.update_one(
        {"id": reservation_id},
        {"$set": {"status": "approved"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
    return {"message": "Réservation approuvée"}

# --- Rejeter une réservation
@router.put("/reservations/{reservation_id}/reject")
async def reject_reservation(reservation_id: str, admin=Depends(require_roles(["admin"]))):
    result = await reservations.update_one(
        {"id": reservation_id},
        {"$set": {"status": "rejected"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
    return {"message": "Réservation rejetée"}

# --- Obtenir tous les utilisateurs
@router.get("/users", response_model=List[User])
async def get_all_users(admin=Depends(require_roles(["admin"]))):
    return await users.find().to_list(100)

# --- Créer un nouvel utilisateur
@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(user_data: User, admin=Depends(require_roles(["admin"]))):
    existing_user = await users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    user_dict["password"] = hashed_password
    user_dict["is_verified"] = False
    user_dict["id"] = str(ObjectId())

    await users.insert_one(user_dict)
    return {"message": "Utilisateur créé avec succès"}

# --- Activer/désactiver utilisateur
@router.put("/users/{user_id}/toggle-verify")
async def toggle_user_verification(user_id: str, admin=Depends(require_roles(["admin"]))):
    user = await users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    new_status = not user.get("is_verified", False)
    await users.update_one({"id": user_id}, {"$set": {"is_verified": new_status}})
    return {"message": f"Utilisateur {'activé' if new_status else 'désactivé'} avec succès"}

# --- Supprimer un utilisateur
@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin=Depends(require_roles(["admin"]))):
    result = await users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur supprimé avec succès"}

# --- Liste des maintenances
@router.get("/maintenances")
async def get_all_maintenances(admin=Depends(require_roles(["admin"]))):
    return await maintenances.find().to_list(100)

# --- Ajouter une maintenance
@router.post("/maintenances")
async def create_maintenance(data: dict, admin=Depends(require_roles(["admin"]))):
    data["id"] = str(ObjectId())
    await maintenances.insert_one(data)
    return {"message": "Maintenance ajoutée avec succès"}

# --- Modifier une maintenance
@router.put("/maintenances/{maintenance_id}")
async def update_maintenance(maintenance_id: str, data: dict, admin=Depends(require_roles(["admin"]))):
    result = await maintenances.update_one({"id": maintenance_id}, {"$set": data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Maintenance non trouvée")
    return {"message": "Maintenance mise à jour"}

# --- Modifier le statut uniquement
@router.put("/{maintenance_id}/status")
async def update_maintenance_status(maintenance_id: str, status_update: dict, admin=Depends(require_roles(["admin"]))):
    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Nouveau statut requis")

    result = await db.maintenances.update_one(
        {"id": maintenance_id},
        {"$set": {"status": new_status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Maintenance non trouvée")
    return {"message": f"Statut mis à jour : {new_status}"}

# --- Supprimer une maintenance
@router.delete("/maintenances/{maintenance_id}")
async def delete_maintenance(maintenance_id: str, admin=Depends(require_roles(["admin"]))):
    result = await maintenances.delete_one({"id": maintenance_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Maintenance non trouvée")
    return {"message": "Maintenance supprimée"}

# --- Support : récupérer tous les tickets
@router.get("/support-tickets")
async def get_all_tickets(admin=Depends(require_roles(["admin"]))):
    tickets = await db.support_tickets.find().to_list(100)
    return tickets

# --- Support : changer le statut d’un ticket
@router.put("/support-tickets/{ticket_id}/status")
async def update_ticket_status(ticket_id: str, status: str, admin=Depends(require_roles(["admin"]))):
    result = await db.support_tickets.update_one(
        {"id": ticket_id}, {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    return {"message": "Statut mis à jour"}

# --- Supprimer un ticket
@router.delete("/support-tickets/{ticket_id}")
async def delete_ticket(ticket_id: str, admin=Depends(require_roles(["admin"]))):
    result = await db.support_tickets.delete_one({"id": ticket_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    return {"message": "Ticket supprimé avec succès"}

# --- Lister tous les feedbacks
@router.get("/feedbacks")
async def list_feedbacks(admin=Depends(require_roles(["admin"]))):
    feedbacks = await db.feedbacks.find().to_list(100)
    return feedbacks

# --- Supprimer un feedback
@router.delete("/feedbacks/{feedback_id}")
async def delete_feedback(feedback_id: str, admin=Depends(require_roles(["admin"]))):
    result = await db.feedbacks.delete_one({"id": feedback_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Feedback non trouvé")
    return {"message": "Feedback supprimé"}

# --- Exemple multi-rôle
@router.get("/dashboard")
def technicien_et_admin(current_user=Depends(require_roles(["admin", "technicien"]))):
    return {"message": f"Bonjour {current_user.name}"}
