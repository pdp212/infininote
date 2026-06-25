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
import '@tldraw/tldraw/tldraw.css'
import BoardScreen from './ui/BoardScreen'
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

function AppOverlay() {
  return (
    <>
      <FocusExitButton />
      <BoardScreen />
    </>
  )
}

import { useBoardSync } from '../features/boards/hooks/useBoardSync'

// ── Canvas Inner (có editor context) ───────────────────────────
function CanvasInner({ boardId }) {
  const editor = useEditor()
  const addToast = useStore(s => s.addToast)

  // Kết nối hook đồng bộ
  useBoardSync(editor, boardId)

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

  return null
}

// ── Main Component ──────────────────────────────────────────────
export default function InfiniCanvas({ boardId }) {
  const initialSnapshot = useStore(s => s.initialSnapshot)

  if (!boardId) return null

  return (
    <div className="canvas-wrapper">
      <Tldraw
        persistenceKey={`infininote-board-${boardId}`}
        autoFocus
        inferDarkMode
        components={{
          Toolbar: null,
          StylePanel: null,
          MainMenu: null,
          PageMenu: null,
          NavigationPanel: null,
          ZoomMenu: null,
          SharePanel: null,
          KeyboardShortcutsDialog: null,
          QuickActions: null,
          ActionsMenu: null,
          HelpMenu: null,
          DebugMenu: null,
          MenuPanel: null,
          TopPanel: null,
          HelperButtons: null,
          Minimap: null,
          InFrontOfTheCanvas: AppOverlay,
        }}
      >
        <CanvasInner initialSnapshot={initialSnapshot} boardId={boardId} />
      </Tldraw>
    </div>
  )
}
