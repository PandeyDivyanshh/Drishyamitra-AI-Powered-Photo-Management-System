"""SQLAlchemy ORM models for Drishyamitra."""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    photos = relationship("Photo", back_populates="owner", cascade="all, delete-orphan")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    filepath = Column(Text, nullable=False)
    upload_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    metadata_json = Column(JSON, default=dict)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="photos")
    faces = relationship("Face", back_populates="photo", cascade="all, delete-orphan")


class Face(Base):
    __tablename__ = "faces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, default="Unknown", index=True)
    embedding = Column(JSON, nullable=False)          # list of 512 floats (Facenet512)
    bbox_json = Column(JSON, default=dict)             # {"x": …, "y": …, "w": …, "h": …}
    confidence = Column(Float, default=0.0)
    photo_id = Column(Integer, ForeignKey("photos.id"), nullable=False)

    photo = relationship("Photo", back_populates="faces")
