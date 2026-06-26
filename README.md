# InfiniNote

> **Không gian vẽ vô hạn cá nhân** — Hoạt động 24/7, hoàn toàn **0 đồng** trên Cloud.

![License](https://img.shields.io/badge/cost-$0%2Fmonth-brightgreen)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20FastAPI%20%2B%20MongoDB-7c5cfc)
![Hosting](https://img.shields.io/badge/hosting-Vercel%20%2B%20Render-black)

---

## 💡 Tính năng Nổi bật

- ✅ **Note-First Workflow (V5)** — Trải nghiệm sổ tay cá nhân đích thực: Quick Note, Journal hôm nay, Outline tự động.
- ✅ **Search & Retrieval (Cmd+K)** — Công cụ tìm kiếm nội dung (tag, text, tiêu đề) xuyên suốt các board.
- ✅ **Crash Recovery & Safe Sync (V5.3)** — Tự động cứu hộ dữ liệu cục bộ (IDB Rescue) không làm treo board, cơ chế tải board bằng State Machine 1-luồng an toàn tuyệt đối.
- ✅ **Multi-board Dashboard** — Quản lý nhiều không gian làm việc (board) riêng biệt với URL động.
- ✅ **Đồng bộ CRDT-lite (DELTA Sync)** — Vẽ cùng lúc trên nhiều thiết bị siêu mượt mà không lo bị đè nét.
- ✅ **Canva-like UI & Premium Auth** — Giao diện được thiết kế tối giản, màn hình khoá Glassmorphism cao cấp, mở rộng 100% không gian canvas.
- ✅ **Infinite Canvas** — Tích hợp tldraw: Zoom, pan, vẽ, ghi chú, hình khối, mũi tên.
- ✅ **Image Paste** — Dán ảnh trực tiếp từ clipboard (Ctrl+V) và tự động upload lên Cloudinary.
- ✅ **PWA & Mobile Ready** — Cài lên iPhone/Android, hỗ trợ dock trên di động.
- ✅ **Offline Resilient** — Tự động fallback sang REST API khi mất mạng & auto-reconnect WebSocket.

---

## 🏗️ Kiến trúc & Dữ liệu

```
Browser/PWA (Vercel)
    │
    │── WebSocket (DELTA patch) ──→ FastAPI (Render) ──→ MongoDB Atlas M0
    │
    │── REST API (Fallback/Load) ─→ FastAPI (Render) ──→ Cloudinary (Images)
```

### 📦 Stack hoàn toàn miễn phí

| Layer | Service | Free Tier |
|-------|---------|-----------|
| 🎨 Frontend | **Vercel** | 100 GB BW/tháng |
| ⚙️ Backend | **Render** | 750 giờ/tháng (đủ 24/7) |
| 🗄️ Database | **MongoDB Atlas M0** | 512 MB vĩnh viễn |
| 🖼️ Images | **Cloudinary** | 25 GB / 25 credits |
| 🔄 Keep-Alive | **GitHub Actions** | 2000 phút/tháng |

---

## 🌐 URLs đã deploy

| Service | URL |
|---------|-----|
| 🎨 Frontend (Vercel) | https://infininote-kappa.vercel.app |
| ⚙️ Backend (Render) | https://infininote.onrender.com |
| 🔌 WebSocket | wss://infininote.onrender.com/ws |

---

## 📁 Cấu trúc dự án

```text
InfiniNote/
├── .github/
│   └── workflows/
│       └── keep-alive.yml       # Keep-alive cron job
├── backend/                     # FastAPI + WebSocket + MongoDB
│   ├── .env.example
│   ├── Procfile
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── requirements.txt
├── frontend/                    # React + Vite + tldraw + PWA
│   ├── public/
│   │   ├── icons/
│   │   │   ├── icon-192.png
│   │   │   └── icon-512.png
│   │   └── manifest.json
│   ├── src/
│   │   ├── canvas/              # Core Editor Engine
│   │   │   ├── ui/              # Floating UI Shell
│   │   │   ├── InfiniCanvas.jsx # Board Wrapper
│   │   │   └── useWebSocket.js  # CRDT Sync Logic
│   │   ├── features/            # Business logic (V5)
│   │   │   ├── boards/          # Sync, recovery, schema validation
│   │   │   ├── journal/         # Quick capture, daily journals
│   │   │   ├── outline/         # Document structure
│   │   │   └── search/          # Local/Global search indexer
│   │   ├── components/
│   │   │   ├── Header.jsx       # Global Header
│   │   │   └── LockScreen.jsx   # Passcode protection
│   │   ├── pages/
│   │   │   ├── Board.jsx        # Editor Route
│   │   │   └── Dashboard.jsx    # Workspace Route
│   │   ├── store/
│   │   │   └── useStore.js      # Zustand State Machine
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
├── deploy.sh                    # Script đẩy code tự động deploy
├── .gitignore
└── README.md
```

---

## 🚀 Hướng dẫn Deploy/Push code

Dự án đã kết nối luồng CI/CD. Bất kì commit nào được đẩy lên nhánh `main` trên GitHub sẽ kích hoạt tự động:
1. **Vercel** tự build và deploy frontend.
2. **Render** tự pull code và deploy backend.

Bạn chỉ cần chạy script có sẵn:

```bash
./deploy.sh "Lời nhắn commit của bạn"
```

*Được xây dựng bởi pdp bằng tldraw, FastAPI, và MongoDB Atlas.*