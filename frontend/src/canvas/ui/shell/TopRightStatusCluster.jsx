import React from 'react'
import { useBoardStatus } from '../hooks/useBoardStatus'
import { useBoardActions } from '../hooks/useBoardActions'

function SaveBadge({ status }) {
  const labels = { saving: '○ Đang lưu...', saved: '✓ Đã lưu', error: '✕ Lỗi lưu', idle: '✓ Đã lưu' }
  return (
    <div className="board-status-badge">
      {labels[status] || '✓ Đã lưu'}
    </div>
  )
}

function ConnectionBadge({ status }) {
  const labels = {
    connected: '● Online',
    connecting: '○ Đang kết nối',
    offline: '● Ngoại tuyến',
  }
  
  // Custom colors for the dot based on status
  const dotColor = status === 'connected' ? '#2bd67b' : status === 'offline' ? '#ef4444' : '#ffcc66'

  return (
    <div className="board-status-badge">
      <span style={{ color: dotColor, marginRight: '4px' }}>●</span>
      {labels[status]?.replace('● ', '').replace('○ ', '')}
    </div>
  )
}

export default function TopRightStatusCluster() {
  const { saveStatus, connectionStatus } = useBoardStatus()
  const { goToDashboard } = useBoardActions()

  return (
    <div className="board-top-right-status">
      <SaveBadge status={saveStatus} />
      <ConnectionBadge status={connectionStatus} />
      <button className="board-back-btn" onClick={goToDashboard}>
        Quay lại
      </button>
    </div>
  )
}
