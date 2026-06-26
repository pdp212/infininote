import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { getOrCreateTodayJournalBoard } from '../features/journal/journalBoardService'

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
    const newBoard = { id, title: 'Bảng trống', lastAccessed: Date.now() }
    
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
    const newTitle = window.prompt('Nhập tên mới:', board.title)
    if (newTitle && newTitle.trim() && newTitle !== board.title) {
      console.log('[BOARD] Rename clicked')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      try {
        const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/boards/${board.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle.trim() })
        })
        if (res.ok) {
          console.log('[BOARD] PATCH success')
          const updated = boards.map(b => b.id === board.id ? { ...b, title: newTitle.trim() } : b)
          setBoards(updated)
          localStorage.setItem('infininote-recent-boards', JSON.stringify(updated))
        } else {
          alert('Lỗi khi đổi tên bảng')
        }
      } catch (err) {
        console.error('Rename error:', err)
        alert('Lỗi kết nối khi đổi tên')
      }
    }
  }

  const deleteBoard = async (e, board) => {
    e.stopPropagation()
    setOpenMenuId(null)
    if (window.confirm(`Xóa "${board.title}"?`)) {
      console.log('[BOARD] Delete clicked')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      try {
        const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/boards/${board.id}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          console.log('[BOARD] DELETE success')
          const updated = boards.filter(b => b.id !== board.id)
          setBoards(updated)
          localStorage.setItem('infininote-recent-boards', JSON.stringify(updated))
        } else {
          alert('Lỗi khi xóa bảng')
        }
      } catch (err) {
        console.error('Delete error:', err)
        alert('Lỗi kết nối khi xóa bảng')
      }
    }
  }

  return (
    <>
      <Header />
      <div className="dashboard-container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px', paddingBottom: '40px' }}>
        
        {/* Main CTA */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          <button 
            onClick={() => {
              const board = getOrCreateTodayJournalBoard()
              navigate(`/board/${board.id}`)
            }} 
            style={{ 
              background: '#fff', color: '#000', fontWeight: '500', 
              padding: '12px 24px', borderRadius: '8px', border: 'none', 
              cursor: 'pointer', fontSize: '15px' 
            }}
          >
            + Journal Today
          </button>
          <button 
            onClick={createNewBoard} 
            style={{ 
              background: 'transparent', color: '#ccc', fontWeight: '500', 
              padding: '12px 24px', borderRadius: '8px', border: '1px solid #333', 
              cursor: 'pointer', fontSize: '15px' 
            }}
          >
            + New Board
          </button>
        </div>

        {/* Recent Journals */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Recent</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(() => {
              const journals = boards.filter(b => b.boardType === 'journal').slice(0, 5)
              if (journals.length === 0) return <div style={{ color: '#555', fontSize: '14px' }}>No recent journals.</div>
              return journals.map(board => (
                <div key={board.id} onClick={() => openBoard(board)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#1a1a1a', borderRadius: '8px', cursor: 'pointer', border: '1px solid transparent' }} onMouseOver={e => e.currentTarget.style.borderColor = '#333'} onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px', opacity: 0.5 }}>📓</span>
                    <span style={{ color: '#e0e0e0', fontSize: '15px', fontWeight: 500 }}>{board.title}</span>
                  </div>
                  <span style={{ color: '#666', fontSize: '13px' }}>{new Date(board.lastAccessed).toLocaleDateString()}</span>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* All Boards */}
        <div>
          <h3 style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Boards</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {boards.filter(b => b.boardType !== 'journal').length === 0 ? (
              <div style={{ color: '#555', fontSize: '14px' }}>No boards.</div>
            ) : (
              boards.filter(b => b.boardType !== 'journal').map(board => (
                <div key={board.id} onClick={() => openBoard(board)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#1a1a1a', borderRadius: '8px', cursor: 'pointer', border: '1px solid transparent' }} onMouseOver={e => e.currentTarget.style.borderColor = '#333'} onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px', opacity: 0.5 }}>📄</span>
                    <span style={{ color: '#e0e0e0', fontSize: '15px', fontWeight: 500 }}>{board.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: '#666', fontSize: '13px' }}>{new Date(board.lastAccessed).toLocaleDateString()}</span>
                    
                    <div style={{ position: 'relative' }} onClick={(e) => toggleMenu(e, board.id)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#666', cursor: 'pointer' }}>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                      {openMenuId === board.id && (
                        <div style={{ position: 'absolute', right: 0, top: '24px', background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '4px', zIndex: 10, minWidth: '120px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                          <button onClick={(e) => renameBoard(e, board)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', color: '#e0e0e0', cursor: 'pointer', fontSize: '13px', borderRadius: '4px' }}>Đổi tên</button>
                          <button onClick={(e) => deleteBoard(e, board)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', borderRadius: '4px' }}>Xóa</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
