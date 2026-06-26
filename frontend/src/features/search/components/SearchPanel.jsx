import { useState, useEffect, useRef } from 'react'
import { useEditor } from '@tldraw/tldraw'
import useStore from '../../../store/useStore'
import { buildBoardSearchIndex } from '../boardSearchIndexer'
import { searchLocalBoard, searchGlobalSummaries } from '../searchEngine'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function SearchPanel({ onClose }) {
  const editor = useEditor()
  const boardId = useStore(s => s.boardId)
  const navigate = useNavigate()
  
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('local') // 'local' | 'global'
  const [results, setResults] = useState([])
  const [globalSummaries, setGlobalSummaries] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  // Fetch global summaries once
  useEffect(() => {
    if (mode === 'global' && globalSummaries.length === 0) {
      setLoading(true)
      fetch(`${API_URL.replace(/\/$/, '')}/api/boards/search-index`)
        .then(r => r.json())
        .then(data => {
          setGlobalSummaries(data)
          setLoading(false)
        })
        .catch(err => {
          console.warn('Global search index fetch failed', err)
          setLoading(false)
        })
    }
  }, [mode, globalSummaries.length])

  // Perform search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      if (mode === 'local') {
        const localIndex = buildBoardSearchIndex(boardId, editor)
        setResults(searchLocalBoard(query, localIndex))
      } else {
        setResults(searchGlobalSummaries(query, globalSummaries))
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, mode, boardId, editor, globalSummaries])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleResultClick = (res) => {
    if (res.boardId === boardId) {
      if (res.shapeId) {
        editor.select(res.shapeId)
        editor.zoomToSelection({ animation: { duration: 200 } })
      }
      onClose()
    } else {
      // Navigate to other board
      navigate(`/board/${res.boardId}`)
      onClose()
    }
  }

  return (
    <div className="search-panel-overlay" onClick={onClose}>
      <div className="search-panel-content" onClick={e => e.stopPropagation()}>
        <div className="search-panel-header">
          <input 
            ref={inputRef}
            className="search-panel-input" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Tìm kiếm nội dung, thẻ..." 
          />
          <div className="search-panel-tabs">
            <button className={`search-tab ${mode === 'local' ? 'active' : ''}`} onClick={() => setMode('local')}>This Board</button>
            <button className={`search-tab ${mode === 'global' ? 'active' : ''}`} onClick={() => setMode('global')}>All Boards</button>
          </div>
        </div>
        
        <div className="search-panel-results">
          {loading && <div className="search-status">Đang tải dữ liệu...</div>}
          {!loading && query && results.length === 0 && (
            <div className="search-status">Không tìm thấy ghi chú phù hợp</div>
          )}
          {results.map((res, i) => (
            <div key={i} className="search-result-item" onClick={() => handleResultClick(res)}>
              <div className="search-result-title">
                {res.matchType === 'board-title' && '📄 '}
                {res.matchType === 'board-tag' && '🏷 '}
                {res.matchType.startsWith('shape') && '📝 '}
                {res.boardTitle}
              </div>
              {res.snippet && <div className="search-result-snippet">{res.snippet}</div>}
              <div className="search-result-meta">
                Match: {res.matchType} | Score: {res.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
