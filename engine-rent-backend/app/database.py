# app/database.py

from motor.motor_asyncio import AsyncIOMotorClient
import os

# Connexion à MongoDB
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)

# Base de données principale
db = client.enginerent

# Collections principales
users_collection           = db.users              # Utilisateurs (admin, client, technicien)
engines_collection         = db.engines            # Engins de construction
reservations_collection    = db.reservations       # Réservations
payments_collection        = db.payments           # Paiements (Stripe, etc.)
maintenances_collection    = db.maintenances       # Interventions techniques
support_tickets_collection = db.support_tickets    # Tickets de support
feedbacks_collection       = db.feedbacks          # Avis clients (optionnel)

# Collections supplémentaires
categories_collection      = db.categories         # Types d'engins (grue, pelle, etc.)
brands_collection          = db.brands             # Marques d'engins (Volvo, Caterpillar, etc.)
