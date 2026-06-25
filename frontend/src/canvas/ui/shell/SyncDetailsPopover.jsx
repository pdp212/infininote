import React, { useRef } from 'react'
import useStore from '../../../store/useStore'
import { useBoardEditorBridge } from '../hooks/useBoardEditorBridge'

export default function SyncDetailsPopover({ onClose }) {
  const syncState = useStore(s => s.syncState)
  const isOnline = useStore(s => s.isOnline)
  const lastLocalEditAt = useStore(s => s.lastLocalEditAt)
  const lastRemoteSaveAt = useStore(s => s.lastRemoteSaveAt)
  const lastRemoteRevision = useStore(s => s.lastRemoteRevision)
  const conflictDetails = useStore(s => s.conflictDetails)
  
  const bridge = useBoardEditorBridge()
  const editor = bridge?.editor
  const boardId = window.location.pathname.split('/').pop() // simplistic, but works here
  
  const fileInputRef = useRef(null)

  const handleDownloadBackup = () => {
    const backupStr = localStorage.getItem(`infininote-conflict-backup-${boardId}`)
    if (!backupStr) return alert('Không tìm thấy bản sao lưu cục bộ!')
    const blob = new Blob([backupStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `infininote_backup_${boardId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJson = () => {
    if (!editor) return
    const snapshot = editor.store.getSnapshot('document')
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `infininote_export_${boardId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJson = (e) => {
    const file = e.target.files[0]
    if (!file || !editor) return
    
    if (!window.confirm('Nhập dữ liệu sẽ THAY THẾ TOÀN BỘ nội dung board hiện tại. Bạn có chắc chắn?')) return
    
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const payload = JSON.parse(evt.target.result)
        const store = payload.snapshot ? payload.snapshot.store : (payload.store ? payload.store : payload)
        
        const docRecords = Object.values(store).filter(r => !['instance', 'instance_page_state', 'camera', 'pointer', 'instance_presence'].includes(r.typeName))
        
        editor.store.mergeRemoteChanges(() => {
          // Clear current content first except page
          const existing = editor.store.allRecords().filter(r => r.typeName !== 'page')
          editor.store.remove(existing.map(r => r.id))
          editor.store.put(docRecords)
        })
        
        alert('Đã nhập dữ liệu thành công!')
      } catch (err) {
        alert('File không đúng định dạng: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const handleReloadServer = () => {
    if (syncState === 'conflict' && conflictDetails) {
      if (window.confirm('Bỏ qua các thay đổi chưa lưu trên máy và tải lại bản mới nhất từ server?')) {
        // Need to call applyDocRecords, but we don't have direct access here easily without passing it.
        // Easiest is to force a reload of the page to rehydrate from server, since local DB might be dirty.
        // Wait, Tldraw local DB is already dirty. If we reload, Tldraw loads local DB!
        // We must clear local DB or overwrite it. 
        // Best approach: emit a custom event or let the user click "Refresh" which triggers useBoardSync
        // Since we don't have applyDocRecords here, we will dispatch an event that useBoardSync listens to.
        const event = new CustomEvent('INFININOTE_FORCE_RELOAD_SERVER', { detail: { snapshot: conflictDetails.serverSnapshot, revision: conflictDetails.serverRevision } })
        window.dispatchEvent(event)
      }
    } else {
      window.location.reload()
    }
  }

  const timeStr = (ts) => ts ? new Date(ts).toLocaleTimeString() : 'Chưa có'

  return (
    <div className="sync-details-popover" style={{
      position: 'absolute', top: '48px', right: '0', background: '#2c2c2c', border: '1px solid #444', 
      borderRadius: '8px', padding: '16px', width: '320px', zIndex: 1000, color: '#f0f0f0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>Chi tiết Đồng bộ</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#aaa' }}>Trạng thái:</span>
          <span style={{ fontWeight: 600 }}>{syncState}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#aaa' }}>Kết nối:</span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#aaa' }}>Phiên bản (Revision):</span>
          <span>{lastRemoteRevision}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#aaa' }}>Lưu trên máy lần cuối:</span>
          <span>{timeStr(lastLocalEditAt)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#aaa' }}>Đồng bộ Cloud lần cuối:</span>
          <span>{timeStr(lastRemoteSaveAt)}</span>
        </div>
      </div>

      {syncState === 'conflict' && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '8px', borderRadius: '4px', fontSize: '13px' }}>
          <strong style={{ color: '#ef4444', display: 'block', marginBottom: '4px' }}>Cảnh báo Xung đột!</strong>
          Dữ liệu trên server (Rev {conflictDetails?.serverRevision}) mới hơn bản trên máy. Các thay đổi chưa lưu của bạn đang bị treo.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {syncState === 'conflict' ? (
          <>
            <button onClick={handleReloadServer} style={{ padding: '6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Tải lại từ server (Ghi đè local)</button>
            <button onClick={handleDownloadBackup} style={{ padding: '6px', background: '#4b5563', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Tải bản sao lưu JSON (Local)</button>
          </>
        ) : (
          <button onClick={() => window.location.reload()} style={{ padding: '6px', background: '#374151', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Thử đồng bộ lại / Refresh</button>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #444', margin: '0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', color: '#fff' }}>Hành động Dữ liệu</h4>
        <button onClick={handleExportJson} style={{ padding: '6px', background: 'transparent', border: '1px solid #555', color: '#ddd', borderRadius: '4px', cursor: 'pointer' }}>Xuất JSON (Export)</button>
        <button onClick={() => fileInputRef.current?.click()} style={{ padding: '6px', background: 'transparent', border: '1px solid #555', color: '#ddd', borderRadius: '4px', cursor: 'pointer' }}>Nhập JSON (Import)</button>
        <input type="file" ref={fileInputRef} onChange={handleImportJson} accept=".json" style={{ display: 'none' }} />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #444', margin: '0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', color: '#fff' }}>Cài đặt Board</h4>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Ghi nhớ style note
          <input type="checkbox" defaultChecked={localStorage.getItem(`infininote-style-memory-${boardId}`) !== 'false'} 
                 onChange={(e) => localStorage.setItem(`infininote-style-memory-${boardId}`, e.target.checked)} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Công cụ mặc định
          <select 
            defaultValue={localStorage.getItem(`infininote-default-tool-${boardId}`) || 'select'}
            onChange={(e) => localStorage.setItem(`infininote-default-tool-${boardId}`, e.target.value)}
            style={{ background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', padding: '2px 4px' }}
          >
            <option value="select">Select</option>
            <option value="note">Note</option>
            <option value="text">Text</option>
            <option value="draw">Draw</option>
          </select>
        </label>
      </div>

    </div>
  )
}
