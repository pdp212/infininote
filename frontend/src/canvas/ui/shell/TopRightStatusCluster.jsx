import React, { useState } from 'react'
import useStore from '../../../store/useStore'
import SyncDetailsPopover from './SyncDetailsPopover'

function SyncBadgeCluster({ onClick }) {
  const syncState = useStore(s => s.syncState)
  const isOnline = useStore(s => s.isOnline)

  let label = ''
  let dotColor = '#ffcc66' // warning default
  let isSaving = false

  switch (syncState) {
    case 'hydrating_local':
    case 'checking_server':
      label = 'Đồng bộ...'
      dotColor = isOnline ? '#2bd67b' : '#ffcc66'
      isSaving = true
      break
    case 'saving_local':
    case 'saving_remote':
      label = 'Saving...'
      dotColor = isOnline ? '#2bd67b' : '#ffcc66'
      isSaving = true
      break
    case 'offline_dirty':
      label = 'Đã lưu cục bộ'
      dotColor = '#ffcc66'
      break
    case 'synced':
      label = 'Saved'
      dotColor = '#ccc' // subtle color for saved state
      break
    case 'conflict':
      label = 'Xung đột'
      dotColor = '#ef4444' // red
      break
    case 'error':
      label = 'Lỗi'
      dotColor = '#ef4444' // red
      break
    default:
      label = 'Saved'
      dotColor = '#ccc'
  }

  return (
    <div className="board-status-badge-group" onClick={onClick} style={{ display: 'flex', gap: '6px', cursor: 'pointer', alignItems: 'center', background: 'var(--color-panel)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', color: '#aaa', fontWeight: 500 }}>
      <span style={{ color: dotColor, fontSize: '10px' }}>
        {isSaving ? '●' : '✔'}
      </span>
      <span>{label}</span>
    </div>
  )
}

export default function TopRightStatusCluster() {
  const [showPopover, setShowPopover] = useState(false)

  return (
    <div className="board-top-right-status" style={{ position: 'relative' }}>
      <SyncBadgeCluster onClick={() => setShowPopover(!showPopover)} />
      {showPopover && (
        <SyncDetailsPopover onClose={() => setShowPopover(false)} />
      )}
    </div>
  )
}
