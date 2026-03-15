"""AI engine for face extraction and matching using DeepFace."""

import logging
from typing import Optional
import numpy as np
from deepface import DeepFace
from sqlalchemy.orm import Session

from app.models import Face

logger = logging.getLogger(__name__)


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a_np = np.array(a, dtype=np.float64)
    b_np = np.array(b, dtype=np.float64)
    norm_a = np.linalg.norm(a_np)
    norm_b = np.linalg.norm(b_np)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a_np, b_np) / (norm_a * norm_b))


def extract_faces(image_path: str) -> list[dict]:
    """
    Extract face embeddings from an image using DeepFace.

    Returns a list of dicts:
        [{"embedding": [...], "bbox": {"x":…,"y":…,"w":…,"h":…}, "confidence": float}]
    """
    try:
        results = DeepFace.represent(
            img_path=image_path,
            model_name="Facenet512",
            detector_backend="retinaface",
            enforce_detection=False,
        )
    except Exception as e:
        logger.warning("DeepFace extraction failed for %s: %s", image_path, e)
        return []

    faces = []
    for r in results:
        facial_area = r.get("facial_area", {})
        faces.append({
            "embedding": r["embedding"],
            "bbox": {
                "x": facial_area.get("x", 0),
                "y": facial_area.get("y", 0),
                "w": facial_area.get("w", 0),
                "h": facial_area.get("h", 0),
            },
            "confidence": facial_area.get("confidence", r.get("face_confidence", 0.0)),
        })
    return faces


def find_matching_face(
    embedding: list[float],
    db: Session,
    threshold: float = 0.35,
) -> tuple[str, float]:
    """
    Compare an embedding against all known faces in the database.

    Returns (face_name, best_similarity) or ("Unknown", 0.0).
    """
    known_faces = db.query(Face).filter(Face.name != "Unknown").all()

    best_name = "Unknown"
    best_score = 0.0

    for face in known_faces:
        score = cosine_similarity(embedding, face.embedding)
        if score > best_score and score >= threshold:
            best_score = score
            best_name = face.name

    return best_name, best_score
