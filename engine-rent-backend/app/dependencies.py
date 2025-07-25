from fastapi import Depends, HTTPException, status
from app.auth import get_current_user
from app.models import UserInDB

# Nouveau : vérifier que l'utilisateur est actif
def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Utilisateur inactif",
        )
    return current_user

# Vérifier que l'utilisateur a un rôle spécifique
def require_role(required_role: str):
    def role_dependency(current_user: UserInDB = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accès refusé : rôle {required_role} requis",
            )
        return current_user
    return role_dependency

# Vérifier que l'utilisateur a un rôle parmi plusieurs
def require_roles(allowed_roles: list[str]):
    def role_dependency(current_user: UserInDB = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accès refusé : rôles requis : {', '.join(allowed_roles)}",
            )
        return current_user
    return role_dependency
