# app/models.py
from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

# --- USER MODELS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    address: str
    role: str = "client"  # "client", "admin", "technicien"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")  # MongoDB ID
    name: str
    email: EmailStr
    phone: str
    address: str
    role: str  # "admin", "client", "technicien"
    hashed_password: str
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "from_attributes": True
    }
# --- ENGINE MODELS ---

class Engine(BaseModel):
    id: str
    name: str
    description: str
    category: str
    brand: str
    daily_rate: float
    status: str = "available"
    location: str
    images: List[str] = []
    specifications: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EngineCreate(BaseModel):
    name: str
    description: str
    category: str
    brand: str
    daily_rate: float
    location: str
    images: List[str] = []
    specifications: Dict[str, Any] = {}

# --- RESERVATION MODELS ---

class Reservation(BaseModel):
    id: str
    user_id: str
    engine_id: str
    start_date: datetime
    end_date: datetime
    total_amount: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReservationCreate(BaseModel):
    engine_id: str
    start_date: datetime
    end_date: datetime

# --- PAYMENT MODELS ---
# --- PAYMENT MODELS ---

class Payment(BaseModel):
    id: str
    reservation_id: str
    amount: float
    status: str
    payment_method: str
    transaction_id: Optional[str] = None
    created_at: datetime

# Modèle enrichi pour l'interface admin (avec infos liées)
class PaymentResponse(Payment):
    user_email: Optional[str] = None
    reservation_title: Optional[str] = None

# --- MAINTENANCE MODELS ---

class Maintenance(BaseModel):
    id: str
    engine_id: str
    type: str
    description: str
    scheduled_date: datetime
    completed_date: Optional[datetime] = None
    technician_id: str
    status: str = "scheduled"
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MaintenanceCreate(BaseModel):
    engine_id: str
    type: str
    description: str
    scheduled_date: datetime
    technician_id: str

# --- SUPPORT TICKET MODELS ---

class SupportTicket(BaseModel):
    id: str
    user_id: str
    subject: str
    message: str
    category: str
    status: str = "open"
    priority: str = "medium"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SupportTicketCreate(BaseModel):
    subject: str
    message: str
    category: str
    priority: str = "medium"

# --- TOKEN MODEL ---

class Token(BaseModel):
    access_token: str
    token_type: str

# --- FAQ MODELS ---

class FAQ(BaseModel):
    id: str
    question: str
    answer: str
    categorie: Optional[str] = "Général"
    ordre: Optional[int] = 0
    created_at: datetime

class FAQCreate(BaseModel):
    question: str = Field(..., min_length=10, max_length=500)
    answer: str = Field(..., min_length=10)
    categorie: Optional[str] = Field(default="Général", max_length=100)
    ordre: Optional[int] = Field(default=0, ge=0)

class FAQUpdate(BaseModel):
    question: Optional[str] = Field(None, min_length=10, max_length=500)
    answer: Optional[str] = Field(None, min_length=10)
    categorie: Optional[str] = Field(None, max_length=100)
    ordre: Optional[int] = Field(None, ge=0)
