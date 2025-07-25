from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.engines import router as engine_router
from app.reservations import router as reservation_router
from app.payments import router as payment_router
from app.maintenance import router as maintenance_router
from app.support import router as support_router
from app.dashboard import router as dashboard_router
from app.database import client
from app.routes import admin
from app.routes import payment
from app.routes import maintenance
from app.routes import support
from app import users
from app.routes import faq



app = FastAPI(title="EngineRent Pro API")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routers avec préfixe /api
app.include_router(auth_router, prefix="/api/auth")
app.include_router(engine_router, prefix="/api/engines")
app.include_router(reservation_router, prefix="/api/reservations")
app.include_router(payment_router, prefix="/api/payments")
app.include_router(maintenance_router, prefix="/api/maintenance")
app.include_router(support_router, prefix="/api/support")
app.include_router(dashboard_router, prefix="/api/dashboard")
app.include_router(admin.router)
app.include_router(payment.router)
app.include_router(maintenance.router)
app.include_router(support.router)
app.include_router(faq.router)
app.include_router(users.router)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
