/**
 * useBoardSync.js — Custom hook quản lý đồng bộ dữ liệu Board với server
 * Board V5.1 Sync Trust UX
 */
import { useEffect, useRef, useCallback } from 'react'
import { useWebSocket } from '../../../canvas/useWebSocket'
import useStore from '../../../store/useStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SESSION_TYPES = new Set(['instance', 'instance_page_state', 'camera', 'pointer', 'instance_presence'])

function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

export function useBoardSync(editor, boardId) {
  const updateSyncState = useStore(s => s.updateSyncState)
  const isSyncing = useRef(false)
  const baseRevision = useRef(0)

  // Lắng nghe online/offline
  useEffect(() => {
    const handleOnline = () => {
      updateSyncState({ isOnline: true })
      if (useStore.getState().hasPendingLocalChanges && editor) {
        updateSyncState({ syncState: 'saving_remote', lastSyncAttemptAt: Date.now() })
        // Tldraw sẽ tự sync qua các hook khác, ở đây dùng flush logic nếu cần
      }
    }
    const handleOffline = () => {
      updateSyncState({ isOnline: false })
      if (useStore.getState().hasPendingLocalChanges) {
        updateSyncState({ syncState: 'offline_dirty' })
      }
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [updateSyncState, editor])

  // Phase 1/3: Áp dụng dữ liệu từ server (chỉ khi an toàn)
  const applyDocRecords = useCallback((payload, serverRevision) => {
    if (!editor || !payload?.store) return
    const docRecords = Object.values(payload.store).filter(r => !SESSION_TYPES.has(r.typeName))
    if (docRecords.length === 0) return
    
    if (editor.getEditingShapeId()) {
      updateSyncState({ pendingServerRefresh: true })
      console.warn('[Sync] User is editing text. Deferring remote refresh.')
      return
    }

    isSyncing.current = true
    baseRevision.current = serverRevision
    
    editor.store.mergeRemoteChanges(() => {
      editor.store.put(docRecords)
    })
    
    updateSyncState({ 
      lastRemoteRevision: serverRevision,
      lastRemoteSaveAt: Date.now(),
      syncState: 'synced',
      hasPendingLocalChanges: false,
      conflictDetails: null,
      pendingServerRefresh: false
    })
    setTimeout(() => { isSyncing.current = false }, 150)
  }, [editor, updateSyncState])

  // Xử lý xung đột
  const handleConflict = useCallback((serverRevision, serverSnapshot) => {
    const hasLocalChanges = useStore.getState().hasPendingLocalChanges
    
    if (!hasLocalChanges) {
      // Local không có gì mới, tự động merge bản mới nhất từ server (ví dụ đang mở 2 tab)
      applyDocRecords(serverSnapshot, serverRevision)
    } else {
      // Local có thay đổi -> KHÔNG GHI ĐÈ, chờ user chọn
      updateSyncState({
        syncState: 'conflict',
        conflictDetails: {
          serverRevision,
          clientBaseRevision: baseRevision.current,
          serverSnapshot
        }
      })
      
      // Auto backup to localStorage
      try {
        const snapshot = editor.store.getSnapshot('document')
        localStorage.setItem(`infininote-conflict-backup-${boardId}`, JSON.stringify({
          boardId,
          createdAt: new Date().toISOString(),
          baseRevision: baseRevision.current,
          reason: 'conflict',
          snapshot
        }))
      } catch(e) {}
    }
  }, [applyDocRecords, boardId, updateSyncState, editor])

  // Phase 5: Xử lý WS Message
  const handleWsMessage = useCallback((msg) => {
    if (!editor || !msg) return

    if (msg.type === 'INIT_LOAD') {
      applyDocRecords(msg.payload, msg.revision || 0)
    } else if (msg.type === 'FULL_SYNC') {
      if (!isSyncing.current) applyDocRecords(msg.payload, msg.revision || 0)
    } else if (msg.type === 'DELTA') {
      if (isSyncing.current || !msg.changes) return
      isSyncing.current = true
      if (msg.revision) {
        baseRevision.current = msg.revision
        updateSyncState({ lastRemoteRevision: msg.revision })
      }
      editor.store.mergeRemoteChanges(() => {
        const toPut = [...Object.values(msg.changes.added || {}), ...Object.values(msg.changes.updated || {})]
        if (toPut.length > 0) editor.store.put(toPut)
        const toRemove = msg.changes.removed || []
        if (toRemove.length > 0) editor.store.remove(toRemove)
      })
      updateSyncState({ lastRemoteSaveAt: Date.now() })
      setTimeout(() => { isSyncing.current = false }, 50)
    } else if (msg.type === 'CONFLICT') {
      console.warn('[Sync] Conflict detected via WS!')
      handleConflict(msg.revision, msg.payload)
    } else if (msg.type === 'ACK_REVISION') {
      baseRevision.current = msg.revision || baseRevision.current
      updateSyncState({ 
        lastRemoteRevision: baseRevision.current, 
        lastRemoteSaveAt: Date.now(),
        syncState: 'synced',
        hasPendingLocalChanges: false,
        lastSyncError: null
      })
    }
  }, [editor, applyDocRecords, updateSyncState, handleConflict])

  const { sendMessage } = useWebSocket({ onMessage: handleWsMessage, boardId })

  // Phase 5: REST Fallback Save
  const saveToServer = useCallback(async (snapshot) => {
    if (!boardId) return
    updateSyncState({ lastSyncAttemptAt: Date.now() })
    try {
      const baseUrl = API_URL.replace(/\/$/, '')
      const res = await fetch(`${baseUrl}/api/board/${boardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot, baseRevision: baseRevision.current }),
      })
      if (res.status === 409) {
        const data = await res.json()
        console.warn('[REST Sync] Conflict detected!')
        handleConflict(data.detail.revision || 0, data.detail.snapshot)
      } else if (res.ok) {
        const data = await res.json()
        baseRevision.current = data.revision || baseRevision.current
        updateSyncState({ 
          lastRemoteRevision: baseRevision.current, 
          lastRemoteSaveAt: Date.now(),
          syncState: 'synced',
          hasPendingLocalChanges: false,
          lastSyncError: null
        })
      }
    } catch (e) {
      console.warn('[Canvas] REST save failed:', e)
      updateSyncState({ syncState: 'offline_dirty', lastSyncError: e.message })
    }
  }, [boardId, updateSyncState, handleConflict])

  const syncToServer = useDebounce(async (snapshot) => {
    updateSyncState({ syncState: 'saving_remote', lastSyncAttemptAt: Date.now() })
    const sent = sendMessage({ type: 'FULL_SYNC', payload: snapshot, baseRevision: baseRevision.current })
    if (!sent) {
      await saveToServer(snapshot)
    }
  }, 600)

  // Phase 4: Lắng nghe store changes từ local để đẩy lên server
  useEffect(() => {
    if (!editor) return
    updateSyncState({ syncState: 'checking_server' })

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
          updateSyncState({ 
            syncState: 'saving_local', 
            hasPendingLocalChanges: true, 
            lastLocalEditAt: Date.now() 
          })

          if (!useStore.getState().isOnline) {
             updateSyncState({ syncState: 'offline_dirty' })
             return
          }

          const sent = sendMessage({ 
            type: 'DELTA', 
            changes: filtered,
            baseRevision: baseRevision.current
          })
          
          if (!sent) {
            syncToServer(editor.store.getSnapshot('document'))
          } else {
            updateSyncState({ syncState: 'saving_remote', lastSyncAttemptAt: Date.now() })
          }
        }
      },
      { scope: 'document', source: 'user' }
    )
  }, [editor, sendMessage, syncToServer, updateSyncState])

  // Lắng nghe force reload
  useEffect(() => {
    const handleForceReload = (e) => {
      const { snapshot, revision } = e.detail
      if (snapshot) {
        // Clear conflicting state, reset local changes
        updateSyncState({ hasPendingLocalChanges: false })
        
        // Ensure we force sync false so mergeRemoteChanges works properly
        isSyncing.current = true
        baseRevision.current = revision
        
        const docRecords = Object.values(snapshot.store || snapshot).filter(r => !SESSION_TYPES.has(r.typeName))
        editor.store.mergeRemoteChanges(() => {
          const existing = editor.store.allRecords().filter(r => r.typeName !== 'page')
          editor.store.remove(existing.map(r => r.id))
          editor.store.put(docRecords)
        })
        
        updateSyncState({ 
          lastRemoteRevision: revision,
          lastRemoteSaveAt: Date.now(),
          syncState: 'synced',
          conflictDetails: null,
          pendingServerRefresh: false
        })
        setTimeout(() => { isSyncing.current = false }, 150)
      }
    }
    window.addEventListener('INFININOTE_FORCE_RELOAD_SERVER', handleForceReload)
    return () => window.removeEventListener('INFININOTE_FORCE_RELOAD_SERVER', handleForceReload)
  }, [editor, updateSyncState])

  return {
    baseRevision: baseRevision.current,
    applyDocRecords // exposed for SyncDetailsPopover action
  }
}
