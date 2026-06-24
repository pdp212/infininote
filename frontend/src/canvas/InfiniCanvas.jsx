/**
 * InfiniCanvas.jsx — Core canvas component
 * - Tích hợp tldraw v2
 * - Đồng bộ real-time qua WebSocket (debounced 600ms)
 * - Upload ảnh paste từ clipboard lên Cloudinary qua backend
 * - Fallback REST save khi WS offline
 */
import { useCallback, useRef, useEffect, useState } from 'react'
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

// ── Inner component (has access to editor) ─────────────────────
function CanvasInner({ initialSnapshot }) {
  const editor = useEditor()
  const setSaveStatus = useStore(s => s.setSaveStatus)
  const setIsLoading = useStore(s => s.setIsLoading)
  const addToast = useStore(s => s.addToast)
  const isInitialized = useRef(false)
  const isSyncing = useRef(false)

  // Load initial snapshot from server on mount
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

  // Save snapshot via REST (fallback)
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
      // WS offline → fallback to REST
      await saveToServer(snapshot)
    }
    setSaveStatus('saved')
  }, 600)

  // Listen to canvas changes
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

  // Handle image paste from clipboard
  useEffect(() => {
    if (!editor) return

    const handlePaste = async (e) => {
      const items = Array.from(e.clipboardData?.items || [])
      const imageItem = items.find(i => i.type.startsWith('image/'))
      if (!imageItem) return

      e.preventDefault()
      const file = imageItem.getAsFile()
      if (!file) return

      addToast({ type: 'success', text: '⬆️ Đang upload ảnh…' })

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(`${API_URL}/api/upload-image`, {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
        const data = await res.json()

        // Insert image vào canvas tại vị trí center
        const center = editor.getViewportPageCenter()
        editor.createShape({
          type: 'image',
          x: center.x - data.width / 4,
          y: center.y - data.height / 4,
          props: {
            url: data.url,
            w: Math.min(data.width, 600),
            h: Math.min(data.height, 600 * (data.height / data.width)),
          },
        })

        addToast({ type: 'success', text: '✅ Ảnh đã thêm vào canvas!' })
      } catch (err) {
        console.error('[Image upload]', err)
        addToast({ type: 'error', text: '❌ Upload ảnh thất bại' })
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [editor, addToast])

  return null // editor is provided by parent Tldraw component
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
