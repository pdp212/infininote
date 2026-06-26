"""
models.py — Pydantic schemas cho InfiniNote API
"""
from pydantic import BaseModel
from typing import Any


class SnapshotPayload(BaseModel):
    """Payload gửi từ frontend để lưu toàn bộ tldraw snapshot."""
    snapshot: dict[str, Any]
    baseRevision: int | None = None
    app_meta: dict[str, Any] | None = None


class ImageUploadResponse(BaseModel):
    url: str
    public_id: str
    width: int
    height: int


class BoardRenamePayload(BaseModel):
    title: str


class WSMessage(BaseModel):
    """Cấu trúc message WebSocket giữa client ↔ server."""
    type: str           # "INIT_LOAD" | "DELTA" | "FULL_SYNC" | "PING" | "PONG"
    payload: Any = None
    app_meta: Any = None


class BoardSummary(BaseModel):
    boardId: str
    title: str | None = None
    boardType: str | None = None
    journalDate: str | None = None
    boardTags: list[str] = []
    updatedAt: str
    textPreview: list[str] = []

