/**
 * LockScreen.jsx — Màn hình nhập passcode bảo vệ app
 * Passcode lưu trong biến môi trường VITE_APP_PASSCODE
 * Sau khi mở khóa, lưu vào sessionStorage để tránh nhập lại khi reload
 */
import { useState, useEffect, useRef } from 'react'
import useStore from '../store/useStore'

const PASSCODE = import.meta.env.VITE_APP_PASSCODE || 'infininote'
const SESSION_KEY = 'infininote_unlocked'

export default function LockScreen() {
  const unlock = useStore(s => s.unlock)
  const [value, setValue] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  // Auto-unlock nếu session còn hợp lệ
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      unlock()
    } else {
      // Focus vào input ngay khi mount
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [unlock])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return

    setLoading(true)
    setError('')

    // Thêm delay nhỏ để tránh brute-force (UX effect)
    setTimeout(() => {
      if (value === PASSCODE) {
        sessionStorage.setItem(SESSION_KEY, 'true')
        unlock()
      } else {
        setError('Mật khẩu không đúng. Vui lòng thử lại.')
        setValue('')
        setLoading(false)
        setTimeout(() => setError(''), 3000)
        inputRef.current?.focus()
      }
    }, 400)
  }

  return (
    <div className="lock-overlay">
      <div className="lock-card">
        {/* Logo */}
        <span className="lock-logo" role="img" aria-label="InfiniNote">∞</span>

        <h1 className="lock-title">InfiniNote</h1>
        <p className="lock-subtitle">
          Không gian vẽ vô hạn cá nhân của bạn.<br />
          Nhập mật khẩu để tiếp tục.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="lock-input-group">
            <input
              ref={inputRef}
              id="passcode-input"
              className={`lock-input ${error ? 'error' : ''}`}
              type={showPass ? 'text' : 'password'}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Nhập mật khẩu..."
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              className="lock-toggle-vis"
              onClick={() => setShowPass(v => !v)}
              tabIndex={-1}
              aria-label="Toggle visibility"
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>

          <p className="lock-error">{error}</p>

          <button
            id="lock-submit-btn"
            type="submit"
            className="lock-btn"
            disabled={loading || !value}
          >
            {loading ? 'Đang xác thực…' : 'Mở khóa →'}
          </button>
        </form>

        <p className="lock-footer">
          🔒 Bảo vệ bằng Static Passcode • Dữ liệu lưu trên Cloud
        </p>
      </div>
    </div>
  )
}
