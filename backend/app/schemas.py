"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


# ── Auth ────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


# ── Photo ───────────────────────────────────────────────────
class FaceOut(BaseModel):
    id: int
    name: str
    confidence: float
    bbox_json: dict

    class Config:
        from_attributes = True


class PhotoOut(BaseModel):
    id: int
    filename: str
    filepath: str
    upload_timestamp: datetime
    metadata_json: dict
    faces: list[FaceOut] = []

    class Config:
        from_attributes = True


# ── Chat ────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    query: Optional[dict] = None
    photos: list[PhotoOut] = []


# ── Search ──────────────────────────────────────────────────
class SearchQuery(BaseModel):
    name: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None


# ── Communication ───────────────────────────────────────────
class EmailRequest(BaseModel):
    to: str
    subject: str
    body: str
    photo_ids: list[int] = []


class WhatsAppRequest(BaseModel):
    to: str
    message: str
    photo_ids: list[int] = []
