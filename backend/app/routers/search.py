"""Search router — filter photos by name and date range."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Photo, Face
from app.schemas import PhotoOut
from app.auth import get_current_user

router = APIRouter(prefix="/api", tags=["Search"])


@router.get("/search", response_model=list[PhotoOut])
def search_photos(
    name: Optional[str] = Query(None, description="Person name to search for"),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search photos by face name and/or date range."""
    q = db.query(Photo).filter(Photo.user_id == current_user.id)

    if name:
        q = q.join(Photo.faces).filter(Face.name.ilike(f"%{name}%"))

    if date_from:
        try:
            dt = datetime.strptime(date_from, "%Y-%m-%d")
            q = q.filter(Photo.upload_timestamp >= dt)
        except ValueError:
            pass

    if date_to:
        try:
            dt = datetime.strptime(date_to, "%Y-%m-%d")
            q = q.filter(Photo.upload_timestamp <= dt)
        except ValueError:
            pass

    photos = q.order_by(Photo.upload_timestamp.desc()).limit(100).all()
    return photos
