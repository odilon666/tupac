from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime, date


# --- USER BASE ---
class UserBase(BaseModel):
    name: str = Field(..., example="Jean Dupont")
    email: EmailStr = Field(..., example="jean@example.com")
    role: str = Field(..., example="client")  # admin, client, technicien
    is_active: bool = True

# --- POUR AFFICHAGE ---
class UserOut(UserBase):
    id: str = Field(..., example="abc123")
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

# --- POUR MISE À JOUR ---
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

    model_config = {
        "from_attributes": True
    }

# -------------------------------
# 🚗 RÉSERVATIONS
# -------------------------------

class ReservationBase(BaseModel):
    engine_id: str = Field(..., description="ID de l'engin à réserver")
    start_date: date = Field(..., description="Date de début de réservation")
    end_date: date = Field(..., description="Date de fin de réservation")

class ReservationCreate(ReservationBase):
    pass  # mêmes champs que ReservationBase pour la création

class Reservation(ReservationBase):
    id: str = Field(..., description="Identifiant unique de la réservation")
    user_id: str = Field(..., description="ID de l'utilisateur qui a réservé")
    total_amount: float = Field(..., description="Montant total de la réservation")
    status: str = Field(..., description="Statut de la réservation (pending, approved, rejected)")
    created_at: datetime = Field(..., description="Date de création de la réservation")

    class Config:
        orm_mode = True


# -------------------------------
# 👤 UTILISATEURS
# -------------------------------

class UserBase(BaseModel):
    name: str = Field(..., example="Jean Dupont")
    email: EmailStr = Field(..., example="jean@example.com")
    role: str = Field(..., example="client")  # admin / client / agent, etc.

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = None  # seulement si on veut permettre le changement

class User(UserBase):
    id: str = Field(..., alias="_id")
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True  # Permet d'accepter "_id" depuis Mongo
