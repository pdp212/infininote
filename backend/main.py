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

from database import get_board, upsert_board, get_client
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

# ── Personal board ID (single board, no auth) ────────────────────────────────
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
    """Quản lý danh sách WebSocket đang kết nối đến cùng một board."""

    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        logger.info(f"✅ Client connected. Total: {len(self.active)}")

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)
        logger.info(f"❌ Client disconnected. Total: {len(self.active)}")

    async def broadcast(self, message: str, exclude: WebSocket = None):
        """Phát tán message đến tất cả client, ngoại trừ sender."""
        dead = []
        for ws in self.active:
            if ws is exclude:
                continue
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


# ── REST Endpoints ───────────────────────────────────────────────────────────

@app.get("/")
async def health_check():
    """Endpoint dùng cho keep-alive ping từ GitHub Actions."""
    return {"status": "ok", "service": "InfiniNote", "board": BOARD_ID}


@app.get("/api/board")
async def load_board():
    """Trả về snapshot tldraw hiện tại từ MongoDB."""
    doc = await get_board(BOARD_ID)
    if not doc:
        return {"snapshot": None}
    return {"snapshot": doc.get("snapshot")}


@app.post("/api/board")
async def save_board(payload: SnapshotPayload):
    """Lưu toàn bộ tldraw snapshot vào MongoDB (fallback khi WS offline)."""
    await upsert_board(BOARD_ID, payload.snapshot)
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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket real-time sync:
    - Khi client mới kết nối → gửi INIT_LOAD với snapshot hiện tại
    - Khi nhận DELTA → persist xuống MongoDB + broadcast đến các client khác
    - Hỗ trợ PING/PONG heartbeat để giữ kết nối sống
    """
    await manager.connect(websocket)

    # Gửi trạng thái canvas ban đầu cho client mới
    doc = await get_board(BOARD_ID)
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

            elif msg_type in ("DELTA", "FULL_SYNC"):
                snapshot = msg.get("payload")
                if snapshot:
                    # Persist vào MongoDB bất đồng bộ
                    await upsert_board(BOARD_ID, snapshot)
                    # Broadcast đến tất cả client khác
                    await manager.broadcast(raw, exclude=websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WS error: {e}")
        manager.disconnect(websocket)
