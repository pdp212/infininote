/**
 * App.jsx — Root component của InfiniNote
 * - Render LockScreen nếu chưa unlock
 * - Render Header + Canvas sau khi unlock
 * - Quản lý Toast notifications
 */
import { useEffect } from 'react'
import useStore from './store/useStore'
import LockScreen from './components/LockScreen'
import Dashboard from './pages/Dashboard'
import Board from './pages/Board'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

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

// ── Main App ────────────────────────────────────────────────────
export default function App() {
  const isUnlocked = useStore(s => s.isUnlocked)
  const theme = useStore(s => s.theme)

  if (!isUnlocked) {
    return <LockScreen />
  }

  return (
    <div className={`app-shell theme-${theme}`}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/board/:id" element={<Board />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Overlays */}
      <Toasts />
    </div>
  )
}
