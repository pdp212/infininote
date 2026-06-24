/**
 * InfiniCanvas.jsx — Core canvas component
 * - Tích hợp tldraw v2
 * - Đồng bộ real-time qua WebSocket (debounced 600ms)
 * - Ảnh paste/drop được xử lý bởi tldraw native → upload backend → URL persistent
 * - Fallback REST save khi WS offline
 */
import { useCallback, useRef, useEffect } from 'react'
import { Tldraw, useEditor } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { useWebSocket } from './useWebSocket'
import useStore from '../store/useStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Debounce helper ────────────────────────────────────────────
function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

// ── Upload ảnh lên backend → Cloudinary (nếu có) hoặc objectURL fallback ──────
async function uploadImageAsset(file, addToast) {
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
      return { url: data.url, width: data.width, height: data.height }
    }
  } catch (e) {
    console.warn('[Image] Cloud upload failed, fallback to objectURL:', e)
  }
  // Fallback: objectURL (chỉ hoạt động trong phiên hiện tại trên thiết bị này)
  const url = URL.createObjectURL(file)
  addToast({ type: 'success', text: '📎 Ảnh đã thêm vào canvas!' })
  return { url, width: 0, height: 0 }
}

// ── Inner component (has access to editor) ─────────────────────
function CanvasInner({ initialSnapshot }) {
  const editor = useEditor()
  const setSaveStatus = useStore(s => s.setSaveStatus)
  const setIsLoading = useStore(s => s.setIsLoading)
  const addToast = useStore(s => s.addToast)
  const isInitialized = useRef(false)
  const isSyncing = useRef(false)

  // Load initial snapshot từ server khi mount
  useEffect(() => {
    if (!editor || isInitialized.current) return
    isInitialized.current = true
    if (initialSnapshot) {
      try {
        editor.store.loadSnapshot(initialSnapshot)
      } catch (e) {
        console.warn('[Canvas] Could not load snapshot:', e)
      }
    }
    setIsLoading(false)
  }, [editor, initialSnapshot, setIsLoading])

  // ── Đăng ký asset handler: tldraw gọi khi user paste/drop ảnh ──
  useEffect(() => {
    if (!editor) return
    const handleAsset = async (asset, file) => {
      if (!file) return asset
      addToast({ type: 'success', text: '⬆️ Đang xử lý ảnh…' })
      const result = await uploadImageAsset(file, addToast)
      return { ...asset, props: { ...asset.props, src: result.url } }
    }
    editor.registerExternalAssetHandler('file', handleAsset)
    return () => {
      try { editor.registerExternalAssetHandler('file', null) } catch (_) {}
    }
  }, [editor, addToast])

  // Save snapshot via REST (fallback khi WS offline)
  const saveToServer = useCallback(async (snapshot) => {
    try {
      await fetch(`${API_URL}/api/board`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot }),
      })
    } catch (e) {
      console.warn('[Canvas] REST save failed:', e)
    }
  }, [])

  // WS message handler
  const handleWsMessage = useCallback((msg) => {
    if (!editor || !msg) return
    if (msg.type === 'INIT_LOAD' && msg.payload && !isInitialized.current) {
      try {
        editor.store.loadSnapshot(msg.payload)
        setIsLoading(false)
        isInitialized.current = true
      } catch (e) {}
    } else if (msg.type === 'DELTA' || msg.type === 'FULL_SYNC') {
      if (msg.payload && !isSyncing.current) {
        isSyncing.current = true
        try {
          editor.store.loadSnapshot(msg.payload)
        } catch (e) {}
        setTimeout(() => { isSyncing.current = false }, 100)
      }
    }
  }, [editor, setIsLoading])

  const { sendMessage } = useWebSocket({ onMessage: handleWsMessage })

  // Debounced sync function
  const syncToServer = useDebounce(async (snapshot) => {
    setSaveStatus('saving')
    const sent = sendMessage({ type: 'FULL_SYNC', payload: snapshot })
    if (!sent) {
      await saveToServer(snapshot)
    }
    setSaveStatus('saved')
  }, 600)

  // Listen to canvas changes → auto-save
  useEffect(() => {
    if (!editor) return
    const cleanup = editor.store.listen(
      () => {
        if (isSyncing.current) return
        const snapshot = editor.store.getSnapshot()
        setSaveStatus('saving')
        syncToServer(snapshot)
      },
      { scope: 'document', source: 'user' }
    )
    return cleanup
  }, [editor, syncToServer, setSaveStatus])

  return null
}

// ── Main exported component ────────────────────────────────────
export default function InfiniCanvas() {
  const initialSnapshot = useStore(s => s.initialSnapshot)

  return (
    <div className="canvas-wrapper">
      <Tldraw
        persistenceKey="infininote-local"
        autoFocus
        inferDarkMode
      >
        <CanvasInner initialSnapshot={initialSnapshot} />
      </Tldraw>
    </div>
  )
}
