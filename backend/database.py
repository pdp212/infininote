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


async def upsert_board(board_id: str, snapshot: dict, base_revision: int = None, app_meta: dict = None) -> dict:
    """Lưu/cập nhật toàn bộ snapshot của canvas vào MongoDB."""
    collection = get_board_collection()
    doc = await collection.find_one({"_id": board_id})
    current_rev = doc.get("revision", 0) if doc else 0
    
    if base_revision is not None and base_revision < current_rev:
        return {"status": "conflict", "doc": doc}
        
    new_rev = current_rev + 1
    
    update_data = {
        "snapshot": snapshot, 
        "updated_at": __import__("datetime").datetime.utcnow().isoformat(),
        "revision": new_rev
    }
    if app_meta is not None:
        update_data["app_meta"] = app_meta

    await collection.update_one(
        {"_id": board_id},
        {"$set": update_data},
        upsert=True,
    )
    return {"status": "success", "revision": new_rev}


async def apply_delta(board_id: str, delta: dict, app_meta: dict = None) -> dict:
    """Áp dụng bản vá (DELTA) vào snapshot của canvas hiện tại (CRDT-lite)."""
    collection = get_board_collection()
    doc = await collection.find_one({"_id": board_id})
    current_rev = doc.get("revision", 0) if doc else 0
    new_rev = current_rev + 1
    
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
        
    update_query = { "$set": {"updated_at": __import__("datetime").datetime.utcnow().isoformat(), "revision": new_rev} }
    if app_meta is not None:
        update_query["$set"]["app_meta"] = app_meta
    
    if set_ops:
        update_query["$set"].update(set_ops)
    if unset_ops:
        update_query["$unset"] = unset_ops
        
    if set_ops or unset_ops or app_meta is not None:
        await collection.update_one({"_id": board_id}, update_query, upsert=True)
    return {"status": "success", "revision": new_rev}

async def get_boards_summary() -> list[dict]:
    """Lấy danh sách summary của tất cả board phục vụ Global Search."""
    collection = get_board_collection()
    # Chỉ query những fields cần thiết để tối ưu payload
    cursor = collection.find(
        {}, 
        {"_id": 1, "updated_at": 1, "app_meta.boardMeta": 1, "snapshot.store": 1}
    )
    
    summaries = []
    async for doc in cursor:
        board_id = doc["_id"]
        updated_at = doc.get("updated_at", "")
        app_meta = doc.get("app_meta", {})
        board_meta = app_meta.get("boardMeta", {})
        
        # Build text preview
        store = doc.get("snapshot", {}).get("store", {})
        text_preview = []
        for rec_id, rec in store.items():
            if rec.get("typeName") == "shape" and rec.get("type") in ["text", "note"]:
                text_val = rec.get("props", {}).get("text", "")
                if text_val:
                    text_preview.append(text_val[:140])
            if len(text_preview) >= 5: # Limit
                break
                
        summaries.append({
            "boardId": board_id,
            "title": board_meta.get("boardTitle") or board_meta.get("title") or board_id,
            "boardType": board_meta.get("boardType"),
            "journalDate": board_meta.get("journalDate"),
            "boardTags": board_meta.get("boardTags", []),
            "updatedAt": updated_at,
            "textPreview": text_preview
        })
        
    # Sort by updatedAt DESC
    summaries.sort(key=lambda x: x["updatedAt"], reverse=True)
    return summaries


async def rename_board(board_id: str, new_title: str) -> bool:
    """Đổi tên board (cập nhật app_meta.boardMeta.boardTitle và updated_at)."""
    collection = get_board_collection()
    updated_at = __import__("datetime").datetime.utcnow().isoformat()
    result = await collection.update_one(
        {"_id": board_id},
        {"$set": {
            "app_meta.boardMeta.boardTitle": new_title,
            "updated_at": updated_at
        }}
    )
    return result.modified_count > 0


async def delete_board_by_id(board_id: str) -> bool:
    """Xóa toàn bộ dữ liệu board."""
    collection = get_board_collection()
    result = await collection.delete_one({"_id": board_id})
    return result.deleted_count > 0

