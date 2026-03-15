"""Chat router — Groq NLP interface for natural-language photo queries."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import User, Photo, Face
from app.schemas import ChatRequest, ChatResponse, PhotoOut
from app.auth import get_current_user
from app.groq_chat import process_chat

router = APIRouter(prefix="/api", tags=["Chat"])


def _execute_query(query: dict, user_id: int, db: Session) -> list[Photo]:
    """Execute a structured query against the database."""
    q = db.query(Photo).filter(Photo.user_id == user_id)

    action = query.get("action", "search")

    if action == "count":
        # For count we still fetch, but frontend displays count
        pass

    name = query.get("name")
    if name:
        q = q.join(Photo.faces).filter(Face.name.ilike(f"%{name}%"))

    date_from = query.get("date_from")
    if date_from:
        try:
            dt = datetime.strptime(date_from, "%Y-%m-%d")
            q = q.filter(Photo.upload_timestamp >= dt)
        except ValueError:
            pass

    date_to = query.get("date_to")
    if date_to:
        try:
            dt = datetime.strptime(date_to, "%Y-%m-%d")
            q = q.filter(Photo.upload_timestamp <= dt)
        except ValueError:
            pass

    return q.order_by(Photo.upload_timestamp.desc()).limit(50).all()


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Process a natural-language message through Groq and return matching photos."""
    message, query = process_chat(payload.message)

    photos = []
    if query and query.get("action"):
        photos = _execute_query(query, current_user.id, db)

    return ChatResponse(
        response=message,
        query=query,
        photos=[PhotoOut.model_validate(p) for p in photos],
    )
