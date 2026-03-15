"""Application configuration loaded from environment variables."""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Database ────────────────────────────────────────────────
_default_db = "sqlite:///" + str(Path(__file__).resolve().parent.parent / "drishyamitra.db")
DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db)
# If the user provides a postgres:// URL without a driver, add +psycopg for psycopg3
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# ── JWT ─────────────────────────────────────────────────────
SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# ── Groq ────────────────────────────────────────────────────
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

# ── SMTP ────────────────────────────────────────────────────
SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER: str = os.getenv("SMTP_USER", "")
SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

# ── Twilio ──────────────────────────────────────────────────
TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_FROM: str = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

# ── Storage ─────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR.parent / "storage" / "uploads")))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
