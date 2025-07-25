# app/auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from app.models import UserCreate, UserLogin, UserInDB, Token
from app.utils import get_password_hash, verify_password, create_access_token, get_current_user, send_email
from app.database import db
import uuid

#router = APIRouter(prefix="/auth", tags=["Auth"])
router = APIRouter(tags=["Auth"])


@router.post("/register", response_model=UserInDB)
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    user_dict.update({
        "id": str(uuid.uuid4()),
        "password": hashed_password,
        "is_verified": True,
        "created_at": datetime.utcnow()
    })

    await db.users.insert_one(user_dict)
    send_email(user_data.email, "Bienvenue sur EngineRent Pro", f"Bonjour {user_data.name}, votre compte a été créé !")
    user_dict.pop("password")
    return User(**user_dict)

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": user["id"]}, timedelta(minutes=60))
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
