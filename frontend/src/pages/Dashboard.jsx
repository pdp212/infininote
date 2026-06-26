import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { getOrCreateTodayJournalBoard, getOrCreateYesterdayJournalBoard } from '../features/journal/journalBoardService'

export default function Dashboard() {
  const navigate = useNavigate()
  const [boards, setBoards] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('infininote-recent-boards')
    if (saved) {
      try {
        setBoards(JSON.parse(saved))
      } catch (e) {
        setBoards([])
      }
    }
    
    // Fetch global summaries to keep Dashboard in sync with server
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    fetch(`${API_URL.replace(/\/$/, '')}/api/boards/search-index`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = data.map(serverBoard => ({
            id: serverBoard.boardId,
            title: serverBoard.title || serverBoard.boardId,
            boardType: serverBoard.boardType || 'board',
            journalDate: serverBoard.journalDate,
            lastAccessed: new Date(serverBoard.updatedAt).getTime()
          }))
          setBoards(merged)
          localStorage.setItem('infininote-recent-boards', JSON.stringify(merged))
        }
      })
      .catch(err => console.warn('Failed to fetch global boards for dashboard:', err))
  }, [])

  const createNewBoard = () => {
    const id = `board_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const newBoard = { id, title: 'Bảng mới', lastAccessed: Date.now() }
    
    const updated = [newBoard, ...boards]
    setBoards(updated)
    localStorage.setItem('infininote-recent-boards', JSON.stringify(updated))
    
    navigate(`/board/${id}`)
  }

  const openBoard = (board) => {
    // Cập nhật lastAccessed
    const updated = boards.map(b => b.id === board.id ? { ...b, lastAccessed: Date.now() } : b)
    updated.sort((a, b) => b.lastAccessed - a.lastAccessed)
    setBoards(updated)
    localStorage.setItem('infininote-recent-boards', JSON.stringify(updated))
    
    navigate(`/board/${board.id}`)
  }

  const toggleMenu = (e, id) => {
    e.stopPropagation()
    setOpenMenuId(prev => prev === id ? null : id)
  }

  const renameBoard = (e, board) => {
    e.stopPropagation()
    setOpenMenuId(null)
    const newTitle = window.prompt('Nhập tên mới cho bảng:', board.title)
    if (newTitle && newTitle.trim()) {
      const updated = boards.map(b => b.id === board.id ? { ...b, title: newTitle.trim() } : b)
      setBoards(updated)
      localStorage.setItem('infininote-recent-boards', JSON.stringify(updated))
    }
  }

  const deleteBoard = (e, board) => {
    e.stopPropagation()
    setOpenMenuId(null)
    if (window.confirm(`Bạn có chắc chắn muốn xóa bảng "${board.title}"?`)) {
      // Xoá trên giao diện và local storage trước để phản hồi nhanh (Optimistic Update)
      const updated = boards.filter(b => b.id !== board.id)
      setBoards(updated)
      localStorage.setItem('infininote-recent-boards', JSON.stringify(updated))

      // Gọi API xoá trên server
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      fetch(`${API_URL.replace(/\/$/, '')}/api/boards/${board.id}`, {
        method: 'DELETE'
      }).catch(err => console.warn('Lỗi khi xoá bảng trên server:', err))
    }
  }

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <h2>Nhật ký & Ghi chú</h2>
            <p>{boards.length} bảng • Cập nhật gần đây</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="create-btn" onClick={() => {
              const board = getOrCreateTodayJournalBoard()
              navigate(`/board/${board.id}`)
            }} style={{ background: '#2bd67b', color: '#000', fontWeight: 'bold' }}>
              + Mở Journal hôm nay
            </button>
            <button className="create-btn" onClick={() => {
              const board = getOrCreateYesterdayJournalBoard()
              navigate(`/board/${board.id}`)
            }} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc' }}>
              Hôm qua
            </button>
            <button className="create-btn" onClick={createNewBoard} style={{ background: '#333' }}>
              + Bảng trống
            </button>
          </div>
        </div>

        {/* --- Recent Journals Section --- */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', color: '#aaa', textTransform: 'uppercase', marginBottom: '16px' }}>Nhật ký gần đây</h3>
          <div className="boards-grid">
            {(() => {
              const journals = boards.filter(b => b.boardType === 'journal')
              if (journals.length === 0) return <p style={{ color: '#666', fontSize: '13px' }}>Chưa có nhật ký nào.</p>
              return journals.slice(0, 4).map(board => (
                <div key={board.id} className="board-card" onClick={() => openBoard(board)} style={{ background: 'rgba(43, 214, 123, 0.05)', border: '1px solid rgba(43, 214, 123, 0.2)' }}>
                  <div className="board-card-icon" style={{ background: 'transparent' }}>📓</div>
                  <div className="board-card-info">
                    <h3 style={{ color: '#2bd67b' }}>{board.title}</h3>
                    <p>{new Date(board.lastAccessed).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>

        <h3 style={{ fontSize: '14px', color: '#aaa', textTransform: 'uppercase', marginBottom: '16px' }}>Tất cả các bảng</h3>
      <div className="boards-grid">
        {boards.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có bảng nào. Hãy tạo một bảng mới để bắt đầu!</p>
          </div>
        ) : (
          boards.map(board => (
            <div key={board.id} className="board-card" onClick={() => openBoard(board)}>
              <div className="board-card-icon">🖼️</div>
              <div className="board-card-info">
                <h3>{board.title}</h3>
                <p>Cập nhật lần cuối: {new Date(board.lastAccessed).toLocaleString('vi-VN')}</p>
                <div className="board-card-meta">
                  <span style={{ color: '#10B981' }}>●</span> Đã đồng bộ
                </div>
              </div>
              <div className="board-card-actions" onClick={(e) => toggleMenu(e, board.id)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#999' }}>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
                {openMenuId === board.id && (
                  <div className="card-context-menu">
                    <button onClick={(e) => renameBoard(e, board)}>Đổi tên</button>
                    <button onClick={(e) => deleteBoard(e, board)} className="danger">Xóa bảng</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  )
}
