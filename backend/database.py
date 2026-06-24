"""
database.py — Motor async MongoDB client cho InfiniNote
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "")
_client: AsyncIOMotorClient = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGO_URI)
    return _client


def get_db():
    return get_client()["infininote_db"]


def get_board_collection():
    return get_db()["canvas_boards"]


def get_image_collection():
    return get_db()["uploaded_images"]


async def get_board(board_id: str) -> dict | None:
    """Lấy dữ liệu canvas từ MongoDB."""
    collection = get_board_collection()
    doc = await collection.find_one({"_id": board_id})
    return doc


async def upsert_board(board_id: str, snapshot: dict) -> None:
    """Lưu/cập nhật toàn bộ snapshot của canvas vào MongoDB."""
    collection = get_board_collection()
    await collection.update_one(
        {"_id": board_id},
        {"$set": {"snapshot": snapshot, "updated_at": __import__("datetime").datetime.utcnow().isoformat()}},
        upsert=True,
    )
