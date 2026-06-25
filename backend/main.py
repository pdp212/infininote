"""
main.py — InfiniNote Core Server
FastAPI + WebSocket real-time sync + MongoDB Atlas + Cloudinary image upload
"""
import os
import json
import logging
import cloudinary
import cloudinary.uploader
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import get_board, upsert_board, get_client, apply_delta
from models import SnapshotPayload, ImageUploadResponse

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("infininote")

# ── Cloudinary setup ─────────────────────────────────────────────────────────
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.getenv("CLOUDINARY_API_KEY", ""),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", ""),
)

MAX_IMAGE_BYTES = int(os.getenv("MAX_IMAGE_SIZE_BYTES", 5 * 1024 * 1024))  # 5 MB default

# ── Legacy personal board ID (for backward compatibility) ─────────────────────
BOARD_ID = "personal_board_v1"


# ── Lifespan: kết nối/đóng MongoDB khi app start/stop ───────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 InfiniNote server starting...")
    get_client()   # Khởi tạo connection pool
    yield
    logger.info("🛑 InfiniNote server shutting down...")
    get_client().close()


app = FastAPI(
    title="InfiniNote API",
    description="Infinite Canvas backend — WebSocket sync + REST",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS: cho phép Vercel frontend kết nối ──────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Production: thay bằng URL Vercel cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── WebSocket Connection Manager ─────────────────────────────────────────────
class ConnectionManager:
    """Quản lý danh sách WebSocket đang kết nối, phân tách theo board_id."""

    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, board_id: str):
        await ws.accept()
        if board_id not in self.active:
            self.active[board_id] = []
        self.active[board_id].append(ws)
        logger.info(f"✅ Client connected to {board_id}. Total: {len(self.active[board_id])}")

    def disconnect(self, ws: WebSocket, board_id: str):
        if board_id in self.active and ws in self.active[board_id]:
            self.active[board_id].remove(ws)
            if not self.active[board_id]:
                del self.active[board_id]
        logger.info(f"❌ Client disconnected from {board_id}.")

    async def broadcast(self, message: str, board_id: str, exclude: WebSocket = None):
        """Phát tán message đến tất cả client trong board_id, ngoại trừ sender."""
        if board_id not in self.active:
            return
        dead = []
        for ws in self.active[board_id]:
            if ws is exclude:
                continue
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, board_id)


manager = ConnectionManager()


# ── REST Endpoints ───────────────────────────────────────────────────────────

@app.get("/")
async def health_check():
    """Endpoint dùng cho keep-alive ping từ GitHub Actions."""
    return {"status": "ok", "service": "InfiniNote", "board": BOARD_ID}


@app.get("/api/board/{board_id}")
async def load_board(board_id: str):
    """Trả về snapshot tldraw hiện tại từ MongoDB."""
    doc = await get_board(board_id)
    if not doc:
        return {"snapshot": None}
    return {"snapshot": doc.get("snapshot")}


@app.post("/api/board/{board_id}")
async def save_board(board_id: str, payload: SnapshotPayload):
    """Lưu toàn bộ tldraw snapshot vào MongoDB (fallback khi WS offline)."""
    await upsert_board(board_id, payload.snapshot)
    return {"status": "saved"}


@app.post("/api/upload-image", response_model=ImageUploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """Upload ảnh paste từ clipboard lên Cloudinary."""
    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(413, f"File quá lớn (max {MAX_IMAGE_BYTES // 1024 // 1024}MB)")

    allowed = {"image/png", "image/jpeg", "image/gif", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(415, "Chỉ chấp nhận PNG, JPEG, GIF, WEBP")

    result = cloudinary.uploader.upload(
        content,
        folder="infininote",
        resource_type="image",
    )
    return ImageUploadResponse(
        url=result["secure_url"],
        public_id=result["public_id"],
        width=result["width"],
        height=result["height"],
    )


# ── WebSocket Endpoint ───────────────────────────────────────────────────────

@app.websocket("/ws/{board_id}")
async def websocket_endpoint(websocket: WebSocket, board_id: str):
    """
    WebSocket real-time sync (CRDT-lite):
    - Khi client mới kết nối → gửi INIT_LOAD với snapshot hiện tại của board_id
    - Khi nhận DELTA → áp dụng thay đổi vào MongoDB + broadcast đến các client khác
    """
    await manager.connect(websocket, board_id)

    # Gửi trạng thái canvas ban đầu cho client mới
    doc = await get_board(board_id)
    init_msg = json.dumps({
        "type": "INIT_LOAD",
        "payload": doc.get("snapshot") if doc else None,
    })
    await websocket.send_text(init_msg)

    try:
        while True:
            raw = await websocket.receive_text()

            # Parse message
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = msg.get("type", "")

            if msg_type == "PING":
                await websocket.send_text(json.dumps({"type": "PONG"}))

            elif msg_type == "DELTA":
                changes = msg.get("changes")
                if changes:
                    # Apply changes to MongoDB (CRDT-lite)
                    await apply_delta(board_id, changes)
                    # Broadcast đến tất cả client khác
                    await manager.broadcast(raw, board_id, exclude=websocket)
                    
            elif msg_type == "FULL_SYNC":
                snapshot = msg.get("payload")
                if snapshot:
                    await upsert_board(board_id, snapshot)
                    await manager.broadcast(raw, board_id, exclude=websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, board_id)
    except Exception as e:
        logger.error(f"WS error: {e}")
        manager.disconnect(websocket, board_id)
