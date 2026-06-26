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
import { getOrCreateTodayJournalBoard } from '../features/journal/journalBoardService'
import { sanitizeShapeForTldraw } from '../features/boards/utils/shapeStyleNormalizer'

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

function EmptyBoardHint() {
  const editor = useEditor()
  const [isEmpty, setIsEmpty] = useState(false)
  const [isJournal, setIsJournal] = useState(false)

  useEffect(() => {
    if (!editor) return
    const boardId = window.location.pathname.split('/').pop()
    const boards = JSON.parse(localStorage.getItem('infininote-recent-boards') || '[]')
    const board = boards.find(b => b.id === boardId)
    setIsJournal(board && board.boardType === 'journal')

    const checkEmpty = () => {
      // Exclude journal header from empty check so the hint still shows
      const shapes = editor.store.allRecords().filter(r => r.typeName === 'shape' && r.meta?.infininoteRole !== 'journal-header')
      setIsEmpty(shapes.length === 0)
    }
    checkEmpty()
    return editor.store.listen(checkEmpty, { scope: 'document' })
  }, [editor])

  if (!isEmpty) return null

  if (isJournal) {
    return (
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', color: '#888', textAlign: 'center', zIndex: -1
      }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#aaa' }}>Nhật ký hôm nay</h3>
        <p style={{ margin: '8px 0 0 0', fontSize: '15px', opacity: 0.7 }}>Nhấn Quick Note để ghi nhanh ý tưởng, việc cần làm hoặc điều đang nghĩ</p>
      </div>
    )
  }

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      pointerEvents: 'none', color: '#888', fontSize: '18px', fontWeight: 500, opacity: 0.5, zIndex: -1,
      textAlign: 'center'
    }}>
      Nhấn Note để bắt đầu ghi chú
    </div>
  )
}

import SearchPanel from '../features/search/components/SearchPanel'
import OutlinePanel from '../features/outline/components/OutlinePanel'

function AppOverlay() {
  const [showSearch, setShowSearch] = useState(false)
  const [showOutline, setShowOutline] = useState(false)
  const [searchEnabled, setSearchEnabled] = useState(false)

  // Post-mount: probe search endpoint — NEVER blocks board loading
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    let cancelled = false
    const probe = async () => {
      try {
        const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/boards/search-index`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(4000)
        })
        if (!cancelled && res.ok) setSearchEnabled(true)
      } catch (err) {
        console.warn('[Search] Endpoint unavailable, Cmd+K disabled.', err)
      }
    }
    // Delay probe until after editor mount — board load is never blocked
    const t = setTimeout(probe, 1000)
    return () => { cancelled = true; clearTimeout(t) }
  }, [])

  useEffect(() => {
    const handleSearch = () => { if (searchEnabled) setShowSearch(s => !s) }
    const handleOutline = () => setShowOutline(s => !s)
    
    window.addEventListener('TOGGLE_SEARCH_PANEL', handleSearch)
    window.addEventListener('TOGGLE_OUTLINE_PANEL', handleOutline)
    
    return () => {
      window.removeEventListener('TOGGLE_SEARCH_PANEL', handleSearch)
      window.removeEventListener('TOGGLE_OUTLINE_PANEL', handleOutline)
    }
  }, [searchEnabled])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        if (searchEnabled) setShowSearch(s => !s)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchEnabled])

  return (
    <>
      <FocusExitButton />
      <EmptyBoardHint />
      <BoardScreen />
      {showSearch && searchEnabled && <SearchPanel onClose={() => setShowSearch(false)} />}
      {showOutline && <OutlinePanel onClose={() => setShowOutline(false)} />}
    </>
  )
}

import { useBoardSync } from '../features/boards/hooks/useBoardSync'
import { useNoteWorkflow } from '../features/boards/hooks/useNoteWorkflow'
import { useQuickCapture } from '../features/journal/useQuickCapture'

// ── Canvas Inner (có editor context) ──────────────────────────
function CanvasInner({ boardId }) {
  const editor = useEditor()
  const addToast = useStore(s => s.addToast)
  const setBoardPhase = useStore(s => s.setBoardPhase)

  useEffect(() => {
    if (editor) {
      console.log('[BOOT] Editor mounted — CanvasInner ready, boardId:', boardId)
      // Single authoritative transition: mounting → ready
      setBoardPhase('ready')
    }
  }, [editor, boardId, setBoardPhase])

  // Kết nối hook đồng bộ
  useBoardSync(editor, boardId)
  // Kết nối hook note workflow
  useNoteWorkflow(editor, boardId)
  
  const { createQuickNote, createQuickText, createJournalHeaderIfNeeded } = useQuickCapture()

  useEffect(() => {
    // Only run after initial hydration to avoid duplicate headers
    const timer = setTimeout(() => {
      const boards = JSON.parse(localStorage.getItem('infininote-recent-boards') || '[]')
      const board = boards.find(b => b.id === boardId)
      if (board && board.boardType === 'journal') {
        createJournalHeaderIfNeeded(board.journalDate)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [boardId, createJournalHeaderIfNeeded])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || editor?.getEditingShapeId()) return
      
      if (e.shiftKey) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault()
          createQuickNote()
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault()
          createQuickText()
        } else if (e.key.toLowerCase() === 'j') {
          e.preventDefault()
          const today = getOrCreateTodayJournalBoard()
          window.location.href = `/board/${today.id}`
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editor, createQuickNote, createQuickText])

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
  // Single state machine — store owns all phases: idb_rescue → mounting → ready | error
  const boardPhase = useStore(s => s.boardPhase)
  const boardPhaseError = useStore(s => s.boardPhaseError)
  const setBoardPhase = useStore(s => s.setBoardPhase)

  // Best-effort local IDB rescue — runs BEFORE Tldraw mounts
  useEffect(() => {
    if (!boardId) return
    console.log(`[BOOT] Start — boardId=${boardId} phase=${boardPhase}`)
    
    // Safety valve: never block more than 3s waiting for IDB
    const safetyTimer = setTimeout(() => {
      console.warn('[BOOT] Safety valve fired (3s) — forcing mounting')
      setBoardPhase(prev => prev === 'idb_rescue' ? 'mounting' : prev)
    }, 3000)

    const tryRescue = async () => {
      try {
        console.log('[BOOT] IDB rescue: opening tldraw database...')
        const persistenceKey = `infininote-board-${boardId}`
        const req = indexedDB.open('tldraw')
        
        req.onsuccess = (e) => {
          const db = e.target.result
          console.log('[BOOT] IDB open OK — stores:', [...db.objectStoreNames])
          if (!db.objectStoreNames.contains(persistenceKey)) {
            console.log('[BOOT] No local store found — transitioning idb_rescue → mounting')
            clearTimeout(safetyTimer)
            setBoardPhase('mounting')
            return
          }
          
          const tx = db.transaction(persistenceKey, 'readwrite')
          const store = tx.objectStore(persistenceKey)
          const getAll = store.getAll()
          
          getAll.onsuccess = () => {
            console.log(`[BOOT] IDB getAll OK — ${getAll.result.length} records`)
            let fixed = 0
            for (const record of getAll.result) {
              if (record && record.typeName === 'shape') {
                const clean = sanitizeShapeForTldraw(record)
                if (JSON.stringify(clean) !== JSON.stringify(record)) {
                  store.put(clean)
                  fixed++
                }
              }
            }
            if (fixed > 0) console.warn(`[BOOT] Rescued ${fixed} corrupted shapes in IndexedDB!`)
            else console.log('[BOOT] IDB clean — no shape fixes needed')
          }

          getAll.onerror = () => {
            console.warn('[BOOT] IDB getAll error — continuing anyway')
          }
          
          tx.oncomplete = () => {
            console.log('[BOOT] IDB tx complete — idb_rescue → mounting')
            clearTimeout(safetyTimer)
            setBoardPhase('mounting')
          }
          tx.onerror = (ev) => {
            console.warn('[BOOT] IDB Tx error — continuing:', ev.target?.error)
            clearTimeout(safetyTimer)
            setBoardPhase('mounting')
          }
        }
        
        req.onerror = (ev) => {
          console.warn('[BOOT] IDB open error — continuing:', ev.target?.error)
          clearTimeout(safetyTimer)
          setBoardPhase('mounting')
        }

        req.onblocked = () => {
          console.warn('[BOOT] IDB blocked (another tab has the DB open). Safety valve will fire.')
        }
      } catch (err) {
        console.warn('[BOOT] Rescue threw exception:', err)
        clearTimeout(safetyTimer)
        setBoardPhase('mounting')
      }
    }
    
    tryRescue()
    return () => clearTimeout(safetyTimer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId])

  const handleClearCache = () => {
    try {
      const req = indexedDB.deleteDatabase('tldraw')
      req.onsuccess = () => window.location.reload()
      req.onerror = () => alert('Không thể xoá cache')
    } catch (e) {
      alert('Lỗi xoá cache: ' + e.message)
    }
  }

  if (!boardId) return null

  // Phase: error — show error UI inline (Board overlay hides itself for 'error' too)
  if (boardPhase === 'error') {
    console.error('[BOOT] boardPhase=error — showing error UI')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a1a', color: '#fff', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '8px' }}>Lỗi tải bảng</h2>
        <p style={{ color: '#aaa', marginBottom: '24px' }}>{boardPhaseError || 'Dữ liệu cục bộ của bảng có vẻ bị hỏng.'}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Tải lại trang
          </button>
          <button onClick={handleClearCache} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Xóa Cache Tldraw (Mất bản nháp)
          </button>
          <button onClick={() => window.location.href = '/'} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
            Về Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Phase: idb_rescue — null render; Board.jsx overlay shows the spinner
  // Phase: mounting — Tldraw renders; CanvasInner transitions to 'ready' on editor mount
  if (boardPhase === 'idb_rescue') {
    console.log('[BOOT] boardPhase=idb_rescue — waiting for IDB rescue to complete')
    return null
  }

  console.log(`[BOOT] boardPhase=${boardPhase} — rendering Tldraw`)
  return (
    <div className="canvas-wrapper">
      <Tldraw
        persistenceKey={`infininote-board-${boardId}`}
        autoFocus
        inferDarkMode
        components={{
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
