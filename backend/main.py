from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import asyncio
from typing import List
from config import settings
from database import engine
import models

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

from ws_manager import manager

from routes import accounts, login_events, transactions, alerts, dashboard, simulate, killchain

app = FastAPI(
    title="CyberFusion API",
    description="Unified Cyber + AML Fraud Intervention Platform",
    version="1.0.0",
)

# ── CORS — allow React frontend ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(accounts.router, prefix="/api")
app.include_router(login_events.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(simulate.router, prefix="/api")
app.include_router(killchain.router, prefix="/api")

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We can receive ping/pong or control messages here if needed
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


@app.get("/api")
def root():
    return {
        "name": "CyberFusion API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}

# ── Serve React Frontend ─────────────────────────────────────────────────────────────
build_dir = os.path.join(os.path.dirname(__file__), "..", "build")

if os.path.isdir(build_dir):
    app.mount("/static", StaticFiles(directory=os.path.join(build_dir, "static")), name="static")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        file_path = os.path.join(build_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        index_path = os.path.join(build_dir, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
        return {"error": "React build not found. Run npm run build."}
