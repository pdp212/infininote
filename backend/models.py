"""
models.py — Pydantic schemas cho InfiniNote API
"""
from pydantic import BaseModel
from typing import Any


class SnapshotPayload(BaseModel):
    """Payload gửi từ frontend để lưu toàn bộ tldraw snapshot."""
    snapshot: dict[str, Any]


class ImageUploadResponse(BaseModel):
    url: str
    public_id: str
    width: int
    height: int


class WSMessage(BaseModel):
    """Cấu trúc message WebSocket giữa client ↔ server."""
    type: str           # "INIT_LOAD" | "DELTA" | "FULL_SYNC" | "PING" | "PONG"
    payload: Any = None
