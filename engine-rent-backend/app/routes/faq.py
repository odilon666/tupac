# app/routes/faq.py

from fastapi import APIRouter, HTTPException, Depends
from app.models import FAQ, FAQCreate, FAQUpdate
from app.utils import get_admin_user
from app.database import db
from datetime import datetime
import uuid

router = APIRouter(prefix="/faq", tags=["FAQ"])


@router.get("/", response_model=list[FAQ])
async def get_all_faqs():
    faqs = await db.faqs.find().sort([("categorie", 1), ("ordre", 1)]).to_list(100)
    return [FAQ(**faq) for faq in faqs]





@router.post("/", response_model=FAQ)
async def create_faq(faq: FAQCreate, current_user=Depends(get_admin_user)):
    faq_dict = faq.dict()
    faq_dict["id"] = str(uuid.uuid4())
    faq_dict["created_at"] = datetime.utcnow()
    await db.faqs.insert_one(faq_dict)
    return FAQ(**faq_dict)

@router.put("/{faq_id}", response_model=FAQ)
async def update_faq(faq_id: str, faq_update: FAQUpdate, current_user=Depends(get_admin_user)):
    update_data = {k: v for k, v in faq_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")

    result = await db.faqs.find_one_and_update(
        {"id": faq_id},
        {"$set": update_data},
        return_document=True
    )

    if not result:
        raise HTTPException(status_code=404, detail="FAQ introuvable")

    return FAQ(**result)

@router.delete("/{faq_id}")
async def delete_faq(faq_id: str, current_user=Depends(get_admin_user)):
    result = await db.faqs.delete_one({"id": faq_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ introuvable")
    return {"message": "FAQ supprimée avec succès"}
