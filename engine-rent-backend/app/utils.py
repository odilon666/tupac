# app/utils.py

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional

from app.models import User
from app.database import db

# Configuration JWT
SECRET_KEY = "your-secret-key"  # 🔒 change ce secret en production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Pour le hashage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


# -------------------------------------
# 🔐 AUTHENTIFICATION & JWT
# -------------------------------------

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user_data = await db.users.find_one({"id": user_id})
    if user_data is None:
        raise credentials_exception
    return User(**user_data)


# -------------------------------------
# 🔐 CONTRÔLE DES RÔLES
# -------------------------------------

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    return current_user

async def get_technician_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "technicien":
        raise HTTPException(status_code=403, detail="Accès réservé aux techniciens")
    return current_user

async def get_client_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Accès réservé aux clients")
    return current_user


# -------------------------------------
# 📧 ENVOI D’EMAIL (simulation pour dev)
# -------------------------------------

def send_email(to_email: str, subject: str, body: str):
    print("\n📧 EMAIL ENVOYÉ")
    print(f"À       : {to_email}")
    print(f"Objet   : {subject}")
    print(f"Message : {body}")
    print("-" * 50)
