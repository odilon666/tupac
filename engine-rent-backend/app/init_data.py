# app/init_data.py
from fastapi import APIRouter
from app.utils import get_password_hash
from app.database import db
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/init-data")
async def init_sample_data():
    admin_email = "admin@enginerent.com"
    existing_admin = await db.users.find_one({"email": admin_email})

    if not existing_admin:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password": get_password_hash("admin123"),
            "name": "Admin",
            "phone": "0000000000",
            "address": "HQ",
            "role": "admin",
            "is_verified": True,
            "created_at": datetime.utcnow()
        })

    engines = [
        {
            "id": str(uuid.uuid4()),
            "name": "Excavatrice CAT 320",
            "description": "Excavatrice hydraulique pour terrassement",
            "category": "excavatrice",
            "brand": "Caterpillar",
            "daily_rate": 350.0,
            "status": "available",
            "location": "Paris",
            "images": ["https://example.com/excavatrice.jpg"],
            "specifications": {"poids": "20t", "puissance": "140hp"},
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bulldozer Komatsu D65",
            "description": "Bulldozer puissant pour nivellement",
            "category": "bulldozer",
            "brand": "Komatsu",
            "daily_rate": 400.0,
            "status": "available",
            "location": "Lyon",
            "images": ["https://example.com/bulldozer.jpg"],
            "specifications": {"poids": "18t", "puissance": "170hp"},
            "created_at": datetime.utcnow()
        }
    ]

    for engine in engines:
        if not await db.engines.find_one({"name": engine["name"]}):
            await db.engines.insert_one(engine)

    return {"message": "Sample data initialized"}
