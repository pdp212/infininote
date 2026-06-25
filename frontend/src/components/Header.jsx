/**
 * Header.jsx — Application Header component
 * Chứa logo, bộ chuyển đổi giao diện (theme toggle), trạng thái kết nối & trạng thái lưu.
 */
import useStore from '../store/useStore'

// ── Status badge ────────────────────────────────────────────────
export function StatusBadge() {
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
export function SaveIndicator() {
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

// ── Theme Toggle ────────────────────────────────────────────────
export function ThemeToggle() {
  const theme = useStore(s => s.theme)
  const toggleTheme = useStore(s => s.toggleTheme)

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={`Chuyển sang nền ${theme === 'dark' ? 'sáng' : 'tối'}`}
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  )
}

// ── Dashboard Header Component ──────────────────────────────────
export default function Header() {
  return (
    <header className="app-header dashboard-only-header">
      <div className="header-brand">
        <div className="header-logo" aria-hidden="true">∞</div>
        <span className="header-title">InfiniNote</span>
      </div>
      <div className="header-controls">
        <ThemeToggle />
      </div>
    </header>
  )
}
