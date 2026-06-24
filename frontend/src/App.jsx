/**
 * App.jsx — Root component của InfiniNote
 * - Render LockScreen nếu chưa unlock
 * - Render Header + Canvas sau khi unlock
 * - Quản lý Toast notifications
 */
import { useEffect } from 'react'
import useStore from './store/useStore'
import LockScreen from './components/LockScreen'
import InfiniCanvas from './canvas/InfiniCanvas'

// ── Status badge ────────────────────────────────────────────────
function StatusBadge() {
  const status = useStore(s => s.connectionStatus)
  const labels = {
    connected: 'Đã kết nối',
    connecting: 'Đang kết nối…',
    offline: 'Ngoại tuyến',
  }
  return (
    <div className={`status-badge ${status}`} aria-label={`Trạng thái: ${labels[status]}`}>
      <span className="status-dot" />
      <span>{labels[status]}</span>
    </div>
  )
}

// ── Save indicator ──────────────────────────────────────────────
function SaveIndicator() {
  const saveStatus = useStore(s => s.saveStatus)
  const icons = { saving: '⏳', saved: '✓', error: '✗' }
  const labels = { saving: 'Đang lưu…', saved: 'Đã lưu', error: 'Lỗi lưu' }
  return (
    <div className={`save-indicator ${saveStatus}`}>
      <span>{icons[saveStatus]}</span>
      <span>{labels[saveStatus]}</span>
    </div>
  )
}

// ── Toast renderer ──────────────────────────────────────────────
function Toasts() {
  const toasts = useStore(s => s.toasts)
  const removeToast = useStore(s => s.removeToast)

  useEffect(() => {
    if (toasts.length === 0) return
    const latest = toasts[toasts.length - 1]
    const timer = setTimeout(() => removeToast(latest.id), 3000)
    return () => clearTimeout(timer)
  }, [toasts, removeToast])

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.text}</div>
      ))}
    </div>
  )
}

// ── Loading overlay ─────────────────────────────────────────────
function LoadingOverlay() {
  const isLoading = useStore(s => s.isLoading)
  if (!isLoading) return null
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p className="loading-text">Đang tải canvas của bạn…</p>
    </div>
  )
}

// ── Main App ────────────────────────────────────────────────────
export default function App() {
  const isUnlocked = useStore(s => s.isUnlocked)

  if (!isUnlocked) {
    return <LockScreen />
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">∞</div>
          <span className="header-title">InfiniNote</span>
        </div>
        <div className="header-right">
          <SaveIndicator />
          <StatusBadge />
        </div>
      </header>

      {/* Canvas */}
      <InfiniCanvas />

      {/* Overlays */}
      <LoadingOverlay />
      <Toasts />
    </div>
  )
}
