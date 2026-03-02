from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine
import models

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

from routes import accounts, login_events, transactions, alerts, dashboard

app = FastAPI(
    title="CyberFusion API",
    description="Unified Cyber + AML Fraud Intervention Platform",
    version="1.0.0",
)

# ── CORS — allow React frontend ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(accounts.router)
app.include_router(login_events.router)
app.include_router(transactions.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {
        "name": "CyberFusion API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
