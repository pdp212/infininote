# InfiniNote 🌌

> **Không gian vẽ vô hạn cá nhân** — Hoạt động 24/7, hoàn toàn **0 đồng** trên Cloud.

![License](https://img.shields.io/badge/cost-$0%2Fmonth-brightgreen)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20FastAPI%20%2B%20MongoDB-7c5cfc)
![Hosting](https://img.shields.io/badge/hosting-Vercel%20%2B%20Render-black)

---

## 🏗️ Kiến trúc

```
Browser/PWA (Vercel)
    │── WebSocket ──→ FastAPI (Render) ──→ MongoDB Atlas M0
    │── REST API ───→ FastAPI (Render) ──→ Cloudinary (Images)
```

## 📦 Stack hoàn toàn miễn phí

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
| ⚙️ Backend (Render) | https://infininote.onrender.com |
| 🔌 WebSocket | wss://infininote.onrender.com/ws |
| 🎨 Frontend (Vercel) | *(Chưa deploy — xem Bước 4)* |

---

## 🚀 Hướng dẫn Deploy (5 bước)

### Bước 1: Clone & push lên GitHub ✅ HOÀN THÀNH

```bash
git remote: git@github.com:pdp212/infininote.git
```

### Bước 2: Tạo MongoDB Atlas M0 (Free) ✅ HOÀN THÀNH

- Cluster: `cluster0.tueb7os.mongodb.net`
- Database: `infininote_db`

### Bước 3: Deploy Backend lên Render ✅ HOÀN THÀNH

- URL: `https://infininote.onrender.com`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Bước 4: Deploy Frontend lên Vercel

1. Vào [vercel.com](https://vercel.com) → Đăng nhập
2. **New Project** → Import GitHub repo `pdp212/infininote`
3. **Root Directory**: `frontend`
4. **Framework Preset**: Vite
5. **Environment Variables** (thêm 3 biến này):
   ```
   VITE_WS_URL       = wss://infininote.onrender.com/ws
   VITE_API_URL      = https://infininote.onrender.com
   VITE_APP_PASSCODE = <mật khẩu bí mật của bạn>
   ```
6. Nhấn **Deploy** → Copy URL Vercel 🎉

### Bước 5: Kích hoạt Keep-Alive (quan trọng!)

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Tạo secret mới:
   - **Name**: `RENDER_URL`
   - **Value**: `https://infininote.onrender.com`
3. Vào tab **Actions** → Enable workflows ✅

---

## 📱 Cài đặt PWA lên điện thoại

**iOS (Safari)**:
> Mở URL Vercel → Share (⎙) → **Thêm vào màn hình chính**

**Android (Chrome)**:
> Mở URL Vercel → Menu (⋮) → **Thêm vào màn hình chính**

App sẽ mở toàn màn hình không có browser bar — như native app! 🚀

---

## 🔒 Bảo mật

App được bảo vệ bởi **Static Passcode** — mật khẩu lưu trong biến môi trường Vercel (`VITE_APP_PASSCODE`). Không ai có URL mà không biết passcode có thể truy cập canvas của bạn.

**Đổi passcode**: Thay giá trị `VITE_APP_PASSCODE` trong Vercel → Redeploy.

---

## 📁 Cấu trúc dự án

```
InfiniNote/
├── frontend/          # React + Vite + tldraw (PWA)
├── backend/           # FastAPI + WebSocket + MongoDB
├── .github/workflows/ # Keep-alive cron job
└── README.md
```

---

## 💡 Tính năng

- ✅ **Infinite Canvas** — Zoom, pan, vẽ, ghi chú, mũi tên, hình khối
- ✅ **Real-time sync** — Mở nhiều tab/thiết bị, thay đổi hiện ngay
- ✅ **Image paste** — Ctrl+V dán ảnh từ clipboard, tự upload Cloudinary
- ✅ **PWA** — Cài lên iPhone/Android như app native
- ✅ **Dark mode** — Giao diện tối cực đẹp
- ✅ **Auto-save** — Tự lưu sau mỗi thay đổi (debounce 600ms)
- ✅ **Offline resilient** — Tự reconnect khi mất mạng
- ✅ **24/7 uptime** — Keep-alive GitHub Actions mỗi 14 phút

---

*Được xây dựng với ❤️ bằng tldraw, FastAPI, và MongoDB Atlas.*