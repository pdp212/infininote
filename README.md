# InfiniNote 🌌

> **Không gian vẽ vô hạn cá nhân** — Hoạt động 24/7, hoàn toàn **0 đồng** trên Cloud.

![License](https://img.shields.io/badge/cost-$0%2Fmonth-brightgreen)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20FastAPI%20%2B%20MongoDB-7c5cfc)
![Hosting](https://img.shields.io/badge/hosting-Vercel%20%2B%20Render-black)

---

## 💡 Tính năng Nổi bật

- ✅ **Multi-board Dashboard** — Quản lý nhiều không gian làm việc (board) riêng biệt với URL động.
- ✅ **Đồng bộ CRDT-lite (DELTA Sync)** — Vẽ cùng lúc trên nhiều thiết bị siêu mượt mà không lo bị đè nét.
- ✅ **Canva-like UI** — Giao diện được thiết kế tối giản, công cụ được gộp gọn lên Header, mở rộng 100% không gian canvas.
- ✅ **Infinite Canvas** — Tích hợp tldraw: Zoom, pan, vẽ, ghi chú, hình khối, mũi tên.
- ✅ **Image Paste** — Dán ảnh trực tiếp từ clipboard (Ctrl+V) và tự động upload lên Cloudinary.
- ✅ **PWA Ready** — Cài lên iPhone/Android hoặc desktop như app native.
- ✅ **Light/Dark Mode** — Hỗ trợ chuyển đổi theme nhanh chóng.
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

```
InfiniNote/
├── frontend/          # React + Vite + tldraw + React Router (PWA)
├── backend/           # FastAPI + WebSocket + MongoDB Motor (CRDT-lite)
├── .github/workflows/ # Keep-alive cron job
├── deploy.sh          # Script đẩy code tự động deploy
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

./deploy.sh "Lời nhắn của bạn ở đây"

*Được xây dựng bởi pdp bằng tldraw, FastAPI, và MongoDB Atlas.*