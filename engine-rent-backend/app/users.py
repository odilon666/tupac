from fastapi import APIRouter, Depends, HTTPException, status
from app.database import db  # db = instance Motor async
from app.schemas import User, UserUpdate  # modèles Pydantic adaptés
from app.dependencies import get_current_active_user
from app.auth import require_roles
from bson import ObjectId

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

# Voir tous les utilisateurs (Admin uniquement)
@router.get("/", dependencies=[Depends(require_roles(["admin"]))])
async def get_all_users():
    users_cursor = db.users.find()
    users = await users_cursor.to_list(length=1000)
    # Si besoin, on peut convertir les _id en str
    for user in users:
        user["_id"] = str(user["_id"])
    return users

# Voir son propre profil (tous les rôles)
@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_active_user)):
    return current_user

# Modifier son propre profil
@router.put("/me")
async def update_my_profile(
    new_data: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    update_data = {k: v for k, v in new_data.items() if hasattr(current_user, k)}
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée valide à mettre à jour")

    result = await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Mise à jour échouée")

    # Retourner le profil mis à jour
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    updated_user["_id"] = str(updated_user["_id"])
    return {"message": "Profil mis à jour", "user": updated_user}

# Supprimer un utilisateur (Admin uniquement)
@router.delete("/{user_id}", dependencies=[Depends(require_roles(["admin"]))])
async def delete_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")
    
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return {"message": "Utilisateur supprimé"}
