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


async def apply_delta(board_id: str, delta: dict) -> None:
    """Áp dụng bản vá (DELTA) vào snapshot của canvas hiện tại (CRDT-lite)."""
    collection = get_board_collection()
    
    set_ops = {}
    unset_ops = {}
    
    # 1. Thêm mới
    for rec_id, rec in delta.get("added", {}).items():
        set_ops[f"snapshot.store.{rec_id}"] = rec
        
    # 2. Cập nhật
    for rec_id, rec in delta.get("updated", {}).items():
        set_ops[f"snapshot.store.{rec_id}"] = rec
        
    # 3. Xoá
    for rec_id in delta.get("removed", []):
        unset_ops[f"snapshot.store.{rec_id}"] = ""
        
    update_query = { "$set": {"updated_at": __import__("datetime").datetime.utcnow().isoformat()} }
    if set_ops:
        update_query["$set"].update(set_ops)
    if unset_ops:
        update_query["$unset"] = unset_ops
        
    if set_ops or unset_ops:
        await collection.update_one({"_id": board_id}, update_query, upsert=True)
