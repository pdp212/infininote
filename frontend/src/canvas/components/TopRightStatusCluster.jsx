import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
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
      <div className="board-status-badge" style={{ padding: '4px 8px', background: 'transparent', color: '#aaa', fontSize: '12px' }}>
        {badge1}
      </div>
      <div className="board-status-badge" style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
        <span style={{ color: dotColor, marginRight: '6px', fontSize: '10px' }}>●</span>
        {badge2}
      </div>
    </div>
  )
}

export default function TopRightStatusCluster() {
  const navigate = useNavigate()
  const goToDashboard = () => navigate('/')
  const [showPopover, setShowPopover] = useState(false)

  return (
    <div className="board-top-right-status" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1c1c1c', padding: '6px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <SyncBadgeCluster onClick={() => setShowPopover(!showPopover)} />
        <button 
          onClick={goToDashboard}
          style={{ padding: '6px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '18px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: '0.2s' }}
        >
          Quay lại
        </button>
      </div>

      {showPopover && (
        <SyncDetailsPopover onClose={() => setShowPopover(false)} />
      )}
    </div>
  )
}
