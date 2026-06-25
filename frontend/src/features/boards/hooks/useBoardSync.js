/**
 * useBoardSync.js — Custom hook quản lý đồng bộ dữ liệu Board với server
 * Implement Server as Source of Truth + Revision Guard
 */
import { useEffect, useRef, useCallback } from 'react'
import { useWebSocket } from '../../../canvas/useWebSocket'
import useStore from '../../../store/useStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SESSION_TYPES = new Set([
  'instance',
  'instance_page_state',
  'camera',
  'pointer',
  'instance_presence',
])

function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

export function useBoardSync(editor, boardId) {
  const setSaveStatus = useStore(s => s.setSaveStatus)
  const setIsLoading = useStore(s => s.setIsLoading)
  const isSyncing = useRef(false)
  const baseRevision = useRef(0)

  // Hàm helper áp dụng record từ server xuống editor an toàn
  const applyDocRecords = useCallback((payload, serverRevision) => {
    if (!editor || !payload?.store) return
    const docRecords = Object.values(payload.store)
      .filter(r => !SESSION_TYPES.has(r.typeName))
    
    if (docRecords.length === 0) return
    
    isSyncing.current = true
    baseRevision.current = serverRevision
    
    editor.store.mergeRemoteChanges(() => {
      editor.store.put(docRecords)
    })
    
    setTimeout(() => { isSyncing.current = false }, 150)
  }, [editor])

  // Lắng nghe WebSocket
  const handleWsMessage = useCallback((msg) => {
    if (!editor || !msg) return

    if (msg.type === 'INIT_LOAD') {
      applyDocRecords(msg.payload, msg.revision || 0)
      setIsLoading(false)
    } else if (msg.type === 'FULL_SYNC') {
      if (!isSyncing.current) applyDocRecords(msg.payload, msg.revision || 0)
    } else if (msg.type === 'DELTA') {
      if (isSyncing.current || !msg.changes) return
      isSyncing.current = true
      
      // Update baseRevision if server sends it, else just keep current
      if (msg.revision) {
        baseRevision.current = msg.revision
      }

      editor.store.mergeRemoteChanges(() => {
        const toPut = [
          ...Object.values(msg.changes.added || {}),
          ...Object.values(msg.changes.updated || {})
        ]
        if (toPut.length > 0) editor.store.put(toPut)
        
        const toRemove = msg.changes.removed || []
        if (toRemove.length > 0) editor.store.remove(toRemove)
      })
      setTimeout(() => { isSyncing.current = false }, 50)
    } else if (msg.type === 'CONFLICT') {
      console.warn('[Sync] Conflict detected! Forcing sync with server.')
      applyDocRecords(msg.payload, msg.revision || 0)
      setSaveStatus('saved')
    } else if (msg.type === 'ACK_REVISION') {
      baseRevision.current = msg.revision || baseRevision.current
      setSaveStatus('saved')
    }
  }, [editor, applyDocRecords, setIsLoading, setSaveStatus])

  const { sendMessage } = useWebSocket({ onMessage: handleWsMessage, boardId })

  // Fallback save qua REST
  const saveToServer = useCallback(async (snapshot) => {
    if (!boardId) return
    try {
      const baseUrl = API_URL.replace(/\/$/, '')
      const res = await fetch(`${baseUrl}/api/board/${boardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot, baseRevision: baseRevision.current }),
      })
      if (res.status === 409) {
        const data = await res.json()
        console.warn('[REST Sync] Conflict detected! Forcing sync with server.')
        applyDocRecords(data.detail.snapshot, data.detail.revision || 0)
      } else if (res.ok) {
        const data = await res.json()
        baseRevision.current = data.revision || baseRevision.current
        setSaveStatus('saved')
      }
    } catch (e) {
      console.warn('[Canvas] REST save failed:', e)
      setSaveStatus('error')
    }
  }, [boardId, setSaveStatus, applyDocRecords])

  const syncToServer = useDebounce(async (snapshot) => {
    setSaveStatus('saving')
    const sent = sendMessage({ type: 'FULL_SYNC', payload: snapshot, baseRevision: baseRevision.current })
    if (!sent) {
      await saveToServer(snapshot)
    }
  }, 600)

  // Lắng nghe store changes từ local để đẩy lên server
  useEffect(() => {
    if (!editor) return
    return editor.store.listen(
      (entry) => {
        if (isSyncing.current || entry.source !== 'user') return

        const changes = entry.changes
        const filtered = { added: {}, updated: {}, removed: [] }
        
        for (const [id, rec] of Object.entries(changes.added)) {
          if (!SESSION_TYPES.has(rec.typeName)) filtered.added[id] = rec
        }
        for (const [id, recs] of Object.entries(changes.updated)) {
          if (!SESSION_TYPES.has(recs[1].typeName)) filtered.updated[id] = recs[1]
        }
        for (const [id, rec] of Object.entries(changes.removed)) {
          if (!SESSION_TYPES.has(rec.typeName)) filtered.removed.push(id)
        }

        if (Object.keys(filtered.added).length || Object.keys(filtered.updated).length || filtered.removed.length) {
          setSaveStatus('saving')
          const sent = sendMessage({ 
            type: 'DELTA', 
            changes: filtered,
            baseRevision: baseRevision.current
          })
          
          if (!sent) {
            syncToServer(editor.store.getSnapshot('document'))
          }
        }
      },
      { scope: 'document', source: 'user' }
    )
  }, [editor, sendMessage, syncToServer, setSaveStatus])
}
