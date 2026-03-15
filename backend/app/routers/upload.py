"""Upload router — save photos, extract faces, update DB."""

import uuid
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Photo, Face
from app.schemas import PhotoOut
from app.auth import get_current_user
from app.ai_engine import extract_faces, find_matching_face
from app.config import UPLOAD_DIR

router = APIRouter(prefix="/api", tags=["Upload"])


@router.post("/upload", response_model=PhotoOut, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a photo, extract faces, and store everything in the database."""
    # Validate file type
    allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. Use JPEG, PNG, or WebP.",
        )

    # Save file to disk
    ext = Path(file.filename).suffix or ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / unique_name
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Create Photo record
    photo = Photo(
        filename=file.filename,
        filepath=str(dest),
        metadata_json={"original_name": file.filename, "content_type": file.content_type},
        user_id=current_user.id,
    )
    db.add(photo)
    db.flush()  # get photo.id before adding faces

    # Extract faces via DeepFace
    face_data = extract_faces(str(dest))
    for fd in face_data:
        name, score = find_matching_face(fd["embedding"], db)
        face = Face(
            name=name,
            embedding=fd["embedding"],
            bbox_json=fd["bbox"],
            confidence=fd["confidence"] if name == "Unknown" else score,
            photo_id=photo.id,
        )
        db.add(face)

    db.commit()
    db.refresh(photo)
    return photo
