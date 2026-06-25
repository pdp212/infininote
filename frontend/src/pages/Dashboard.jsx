import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

export default function Dashboard() {
  const navigate = useNavigate()
  const [boards, setBoards] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('infininote-recent-boards')
    if (saved) {
      try {
        setBoards(JSON.parse(saved))
      } catch (e) {
        setBoards([])
      }
    }
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

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <h2>Không gian làm việc</h2>
            <p>{boards.length} bảng • Cập nhật gần đây</p>
          </div>
          <button className="create-btn" onClick={createNewBoard}>
            + Tạo bảng mới
          </button>
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
              <div className="board-card-actions" onClick={(e) => { e.stopPropagation(); /* TODO: Open context menu */ }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#999' }}>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  )
}
