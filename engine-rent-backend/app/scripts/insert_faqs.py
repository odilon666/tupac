# insert_faqs.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGODB_URI)
db = client.enginerent

faqs_data = [
    {
        "id": "1",
        "question": "Comment réserver un engin ?",
        "answer": "Connectez-vous, allez dans le catalogue, choisissez une date et cliquez sur Réserver.",
        "categorie": "Réservations",
        "ordre": 1
    },
    {
        "id": "2",
        "question": "Quels moyens de paiement acceptez-vous ?",
        "answer": "Nous acceptons les paiements par carte via Stripe.",
        "categorie": "Paiement",
        "ordre": 2
    },
    {
        "id": "3",
        "question": "Puis-je modifier ou annuler ma réservation ?",
        "answer": "Oui, si la réservation n’est pas encore approuvée. Contactez le support pour les annulations après validation.",
        "categorie": "Réservations",
        "ordre": 3
    }
]

async def insert_faqs():
    await db.faqs.delete_many({})  # Vide les anciennes FAQs (optionnel)
    await db.faqs.insert_many(faqs_data)
    print("FAQs insérées avec succès.")

if __name__ == "__main__":
    asyncio.run(insert_faqs())
