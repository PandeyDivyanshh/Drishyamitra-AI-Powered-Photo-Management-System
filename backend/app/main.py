"""Drishyamitra — FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.config import UPLOAD_DIR
from app.routers import auth_router, upload, chat, search

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    logger.info("🚀 Drishyamitra starting — creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables ready.")
    yield
    logger.info("👋 Drishyamitra shutting down.")


app = FastAPI(
    title="Drishyamitra",
    description="AI-powered photo management with face recognition and natural language search.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (uploaded photos) ──────────────────────────
app.mount("/static/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ── Routers ─────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(upload.router)
app.include_router(chat.router)
app.include_router(search.router)


@app.get("/")
def root():
    return {
        "app": "Drishyamitra",
        "version": "1.0.0",
        "docs": "/docs",
    }
