/**
 * InfiniCanvas.jsx — Core canvas component
 *
 * Fix 2: Focus Mode — dùng components.InFrontOfTheCanvas để inject nút thoát
 *         bên trong tldraw (tránh z-index & coordinate conflicts hoàn toàn)
 * Fix 3: Stroke offset — canvas-wrapper top:0 full-screen (xem index.css)
 * Fix 4: Settings sync — chỉ sync document scope, không ghi đè UI state
 *         của thiết bị khác (camera, tool selection, color)
 */
import { useCallback, useRef, useEffect, useState } from 'react'
import { Tldraw, useEditor, DefaultSharePanel } from '@tldraw/tldraw'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle, StatusBadge, SaveIndicator } from '../components/Header'
import '@tldraw/tldraw/tldraw.css'
import { AssetRecordType } from '@tldraw/tlschema'
import { useWebSocket } from './useWebSocket'
import useStore from '../store/useStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Record types thuộc session scope (per-device) → KHÔNG sync giữa thiết bị
const SESSION_TYPES = new Set([
  'instance',
  'instance_page_state',
  'camera',
  'pointer',
  'instance_presence',
])

// ── Debounce helper ────────────────────────────────────────────
function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

// Helper: lấy dimensions của ảnh từ URL
function getImageSize(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => resolve({ w: 200, h: 200 })
    img.src = url
  })
}

// ── Upload ảnh lên Cloudinary qua backend ───────────────────────
async function uploadFile(file, addToast) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_URL}/api/upload-image`, {
      method: 'POST',
      body: formData,
    })
    if (res.ok) {
      const data = await res.json()
      addToast({ type: 'success', text: '✅ Ảnh đã lưu lên Cloud!' })
      return { url: data.url, w: data.width || 0, h: data.height || 0 }
    }
  } catch (e) {
    console.warn('[Image] Cloud upload failed:', e)
  }
  // Fallback: objectURL (chỉ tồn tại trong tab hiện tại)
  const url = URL.createObjectURL(file)
  addToast({ type: 'success', text: '❐️ Ảnh đã thêm vào canvas!' })
  return { url, w: 0, h: 0 }
}

// ── FIX 2: Focus Mode Exit Button ─────────────────────────────
// Được inject qua components.InFrontOfTheCanvas — nằm TRONG tldraw render tree
// nên useEditor() hoạt động và z-index + coordinate hoàn toàn chính xác.
function FocusExitButton() {
  const editor = useEditor()
  const [isFocusMode, setIsFocusMode] = useState(false)

  useEffect(() => {
    if (!editor) return
    // Sync state ngay lúc mount
    setIsFocusMode(editor.getInstanceState().isFocusMode)
    // Lắng nghe thay đổi session state (focus mode thay đổi trong instance)
    return editor.store.listen(
      () => setIsFocusMode(editor.getInstanceState().isFocusMode),
      { scope: 'session', source: 'all' }
    )
  }, [editor])

  if (!isFocusMode) return null

  return (
    <div className="focus-exit-overlay">
      <button
        className="focus-exit-btn"
        onClick={() => editor.updateInstanceState({ isFocusMode: false })}
        title="Thoát chế độ tập trung"
      >
        <span className="focus-exit-icon">⊕</span>
        Thoát Focus Mode
      </button>
    </div>
  )
}

// ── Canvas Inner (có editor context) ───────────────────────────
function CanvasInner({ initialSnapshot, boardId }) {
  const editor = useEditor()
  const setSaveStatus = useStore(s => s.setSaveStatus)
  const setIsLoading = useStore(s => s.setIsLoading)
  const addToast = useStore(s => s.addToast)
  const theme = useStore(s => s.theme)
  const isInitialized = useRef(false)
  const isSyncing = useRef(false)

  // Sync theme
  useEffect(() => {
    if (editor) {
      editor.user.updateUserPreferences({ colorScheme: theme === 'dark' ? 'dark' : 'light' })
    }
  }, [editor, theme])

  // Load snapshot từ server — chỉ áp document records, giữ nguyên UI state local
  useEffect(() => {
    if (!editor || isInitialized.current) return
    isInitialized.current = true
    if (initialSnapshot?.store) {
      try {
        const docRecords = Object.values(initialSnapshot.store)
          .filter(r => !SESSION_TYPES.has(r.typeName))
        if (docRecords.length > 0) {
          // mergeRemoteChanges: đánh dấu là remote change → không re-broadcast
          editor.store.mergeRemoteChanges(() => editor.store.put(docRecords))
        }
      } catch (e) {
        console.warn('[Canvas] Could not load snapshot:', e)
      }
    }
    setIsLoading(false)
  }, [editor, initialSnapshot, setIsLoading])

  // Đăng ký asset handler: tldraw v2.4.x gọi với (info) không phải (asset, file)
  // info = { type: 'file', file: File } → phải trả về TLAsset hoặc null
  useEffect(() => {
    if (!editor) return
    const handleAsset = async (info) => {
      const file = info?.file
      if (!file) return null
      try {
        addToast({ type: 'success', text: '⬆️ Đang xử lý ảnh…' })
        const result = await uploadFile(file, addToast)
        // Lấy dimensions nếu server không trả về
        const size = (result.w && result.h)
          ? { w: result.w, h: result.h }
          : await getImageSize(result.url)
        // Trả về TLAsset hợp lệ — id sẽ bị tldraw override
        return {
          id: AssetRecordType.createId(),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          typeName: 'asset',
          props: {
            name: file.name,
            src: result.url,
            w: size.w,
            h: size.h,
            mimeType: file.type || 'image/png',
            isAnimated: false,
          },
          meta: {},
        }
      } catch (e) {
        console.error('[Canvas] Asset upload failed:', e)
        return null  // tldraw sẽ xóa asset placeholder
      }
    }
    editor.registerExternalAssetHandler('file', handleAsset)
    return () => {
      try { editor.registerExternalAssetHandler('file', null) } catch (_) {}
    }
  }, [editor, addToast])

  // REST fallback khi WebSocket offline
  const saveToServer = useCallback(async (snapshot) => {
    if (!boardId) return
    try {
      const baseUrl = API_URL.replace(/\/$/, '')
      await fetch(`${baseUrl}/api/board/${boardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot }),
      })
    } catch (e) {
      console.warn('[Canvas] REST save failed:', e)
    }
  }, [boardId])

  // FIX 4: WS handler — chỉ apply document records từ remote
  // Không ghi đè camera/tool/color của thiết bị hiện tại
  const handleWsMessage = useCallback((msg) => {
    if (!editor || !msg) return

    const applyDocRecords = (payload) => {
      if (!payload?.store) return
      const docRecords = Object.values(payload.store)
        .filter(r => !SESSION_TYPES.has(r.typeName))
      if (docRecords.length === 0) return
      isSyncing.current = true
      editor.store.mergeRemoteChanges(() => editor.store.put(docRecords))
      setTimeout(() => { isSyncing.current = false }, 150)
    }

    if (msg.type === 'INIT_LOAD' && !isInitialized.current) {
      applyDocRecords(msg.payload)
      setIsLoading(false)
      isInitialized.current = true
    } else if (msg.type === 'FULL_SYNC') {
      if (!isSyncing.current) applyDocRecords(msg.payload)
    } else if (msg.type === 'DELTA') {
      if (isSyncing.current || !msg.changes) return
      isSyncing.current = true
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
    }
  }, [editor, setIsLoading])

  const { sendMessage } = useWebSocket({ onMessage: handleWsMessage, boardId })

  // FIX 4: Sync — chỉ gửi document scope (content), không gửi UI state
  const syncToServer = useDebounce(async (snapshot) => {
    setSaveStatus('saving')
    const sent = sendMessage({ type: 'FULL_SYNC', payload: snapshot })
    if (!sent) await saveToServer(snapshot)
    setSaveStatus('saved')
  }, 600)

  // Lắng nghe document changes và sync
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
          const sent = sendMessage({ type: 'DELTA', changes: filtered })
          if (!sent) {
            // Fallback REST nếu WS chết
            syncToServer(editor.store.getSnapshot('document'))
          } else {
            setSaveStatus('saved')
          }
        }
      },
      { scope: 'document', source: 'user' }
    )
  }, [editor, sendMessage, syncToServer, setSaveStatus])

  return null
}

// ── Custom Share Panel ──────────────────────────────────────────
function CustomSharePanel() {
  const navigate = useNavigate()
  return (
    <div style={{ pointerEvents: 'all', display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '8px' }}>
      <SaveIndicator />
      <StatusBadge />
      <ThemeToggle />
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          background: 'var(--brand-primary)', 
          color: 'white', 
          border: 'none', 
          padding: '6px 12px', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          fontWeight: 500,
          fontSize: '13px'
        }}
      >
        Quay lại
      </button>
      <DefaultSharePanel />
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────
export default function InfiniCanvas({ boardId }) {
  const initialSnapshot = useStore(s => s.initialSnapshot)

  if (!boardId) return null

  return (
    <div className="canvas-wrapper">
      <Tldraw
        persistenceKey="infininote-local"
        autoFocus
        inferDarkMode
        components={{
          // FIX 2: Inject nút Exit Focus Mode trực tiếp vào trong tldraw
          // InFrontOfTheCanvas render trong tldraw's stacking context →
          // không có z-index conflicts, useEditor() hoạt động chính xác
          InFrontOfTheCanvas: FocusExitButton,
          SharePanel: CustomSharePanel,
        }}
      >
        <CanvasInner initialSnapshot={initialSnapshot} boardId={boardId} />
      </Tldraw>
    </div>
  )
}
