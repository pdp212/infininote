import React, { useState } from 'react'
import useStore from '../../../store/useStore'
import { useBoardActions } from '../hooks/useBoardActions'
import SyncDetailsPopover from './SyncDetailsPopover'

function SyncBadgeCluster({ onClick }) {
  const syncState = useStore(s => s.syncState)
  const isOnline = useStore(s => s.isOnline)

  let badge1 = ''
  let badge2 = ''
  let dotColor = '#ffcc66' // warning default
  
  const networkStr = isOnline ? 'Online' : 'Offline'

  switch (syncState) {
    case 'hydrating_local':
    case 'checking_server':
      badge1 = 'Đồng bộ...'
      badge2 = networkStr
      dotColor = isOnline ? '#2bd67b' : '#ffcc66'
      break
    case 'saving_local':
    case 'saving_remote':
      badge1 = 'Đang lưu...'
      badge2 = networkStr
      dotColor = isOnline ? '#2bd67b' : '#ffcc66'
      break
    case 'offline_dirty':
      badge1 = 'Đã lưu trên máy'
      badge2 = 'Chưa đồng bộ'
      dotColor = '#ffcc66'
      break
    case 'synced':
      badge1 = 'Đã đồng bộ'
      badge2 = 'Online'
      dotColor = '#2bd67b'
      break
    case 'conflict':
      badge1 = 'Xung đột dữ liệu'
      badge2 = 'Cần xử lý'
      dotColor = '#ef4444' // red
      break
    case 'error':
      badge1 = 'Lỗi lưu'
      badge2 = 'Thử lại'
      dotColor = '#ef4444' // red
      break
    default:
      badge1 = 'Đã đồng bộ'
      badge2 = 'Online'
      dotColor = '#2bd67b'
  }

  return (
    <div className="board-status-badge-group" onClick={onClick} style={{ display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'center' }}>
      <div className="board-status-badge">
        {badge1}
      </div>
      <div className="board-status-badge">
        <span style={{ color: dotColor, marginRight: '4px' }}>●</span>
        {badge2}
      </div>
    </div>
  )
}

export default function TopRightStatusCluster() {
  const { goToDashboard } = useBoardActions()
  const [showPopover, setShowPopover] = useState(false)

  return (
    <div className="board-top-right-status" style={{ position: 'relative' }}>
      <SyncBadgeCluster onClick={() => setShowPopover(!showPopover)} />
      <button className="board-back-btn" onClick={goToDashboard}>
        Quay lại
      </button>

      {showPopover && (
        <SyncDetailsPopover onClose={() => setShowPopover(false)} />
      )}
    </div>
  )
}
