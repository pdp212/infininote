import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

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
          setBoards(prevBoards => {
            const localMap = new Map(prevBoards.map(b => [b.id, b]))
            const mergedMap = new Map()

            // Update with server data
            data.forEach(serverBoard => {
              const serverLastAccessed = new Date(serverBoard.updatedAt).getTime()
              const local = localMap.get(serverBoard.boardId)
              
              mergedMap.set(serverBoard.boardId, {
                id: serverBoard.boardId,
                title: serverBoard.title || serverBoard.boardId,
                lastAccessed: local && local.lastAccessed > serverLastAccessed ? local.lastAccessed : serverLastAccessed
              })
              localMap.delete(serverBoard.boardId)
            })

            // Keep local-only boards
            localMap.forEach((localBoard, id) => {
              mergedMap.set(id, localBoard)
            })

            const finalBoards = Array.from(mergedMap.values()).sort((a, b) => b.lastAccessed - a.lastAccessed)
            localStorage.setItem('infininote-recent-boards', JSON.stringify(finalBoards))
            return finalBoards
          })
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

  const renameBoard = async (e, board) => {
    e.stopPropagation()
    setOpenMenuId(null)
    const newTitle = window.prompt('Nhập tên mới cho bảng:', board.title)
    if (newTitle && newTitle.trim() && newTitle.trim() !== board.title) {
      const cleanTitle = newTitle.trim()
      const previousBoards = [...boards]
      
      // Optimistic update (cập nhật luôn updatedAt để nhảy lên đầu)
      const now = Date.now()
      let updated = boards.map(b => b.id === board.id ? { ...b, title: cleanTitle, lastAccessed: now } : b)
      updated.sort((a, b) => b.lastAccessed - a.lastAccessed)
      // Cập nhật state UI
      setBoards(updated)
      localStorage.setItem('infininote-recent-boards', JSON.stringify(updated))

      // Cập nhật meta cục bộ luôn để đồng bộ với Canvas
      try {
        const metaKey = `infininote-board-meta-${board.id}`
        const metaStr = localStorage.getItem(metaKey)
        if (metaStr) {
          const metaObj = JSON.parse(metaStr)
          metaObj.boardTitle = cleanTitle
          metaObj.updatedAt = new Date(now).toISOString()
          localStorage.setItem(metaKey, JSON.stringify(metaObj))
        }
      } catch (e) {
        console.warn('Failed to update local meta:', e)
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/boards/${board.id}/title`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: cleanTitle })
        })
        if (!res.ok) {
          // Bỏ qua lỗi 404 (bảng chưa từng sync lên server)
          if (res.status !== 404) {
            throw new Error('API error')
          }
        }
      } catch (err) {
        console.warn('Lỗi khi đổi tên bảng trên server:', err)
        alert('Không thể kết nối đến máy chủ. Tên bảng chỉ được lưu cục bộ!')
      }
    }
  }

  const deleteBoard = async (e, board) => {
    e.stopPropagation()
    setOpenMenuId(null)
    if (window.confirm(`Bạn có chắc chắn muốn xóa bảng "${board.title}"?`)) {
      const previousBoards = [...boards]
      
      // Optimistic Update
      const updated = boards.filter(b => b.id !== board.id)
      setBoards(updated)
      localStorage.setItem('infininote-recent-boards', JSON.stringify(updated))
      
      // Xoá luôn meta cục bộ
      localStorage.removeItem(`infininote-board-meta-${board.id}`)

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/boards/${board.id}`, {
          method: 'DELETE'
        })
        if (!res.ok) {
          if (res.status !== 404) {
            throw new Error('API error')
          }
        }
      } catch (err) {
        console.warn('Lỗi khi xoá bảng trên server:', err)
        alert('Không thể kết nối đến máy chủ để xóa bảng. Đang hoàn tác...')
        setBoards(previousBoards)
        localStorage.setItem('infininote-recent-boards', JSON.stringify(previousBoards))
      }
    }
  }

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <h2>Tất cả bảng</h2>
            <p>{boards.length} bảng • Cập nhật gần đây</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="create-btn" onClick={createNewBoard} style={{ background: '#333' }}>
              + Bảng trống
            </button>
          </div>
        </div>
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
