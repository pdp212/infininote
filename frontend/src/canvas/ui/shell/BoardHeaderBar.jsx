import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBoardActions } from '../hooks/useBoardActions'

const IconButton = ({ onClick, disabled, children, title }) => (
  <button 
    className="board-tool-btn" 
    onClick={onClick} 
    disabled={disabled}
    title={title}
  >
    {children}
  </button>
)

export default function BoardHeaderBar() {
  const { goToDashboard } = useBoardActions()
  const { id: boardId } = useParams()
  const [boardName, setBoardName] = useState('Bảng không tên')

  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('infininote-recent-boards') || '[]')
      const b = recent.find(r => r.id === boardId)
      if (b && b.name) setBoardName(b.name)
    } catch (_) {}
  }, [boardId])

  return (
    <div className="infininote-panel board-header-bar" style={{ gap: '8px' }}>
      <div className="board-header-left" style={{ gap: '8px' }}>
        <button 
          onClick={goToDashboard} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: '#aaa', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            fontSize: '14px',
            padding: '4px'
          }}
          title="Về Dashboard"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div className="board-tool-divider" style={{ width: '1px', height: '16px', margin: '0' }} />

        <div style={{ fontSize: '14px', fontWeight: 600, color: '#e0e0e0', padding: '0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
          {boardName}
        </div>

        <div className="board-tool-divider" style={{ width: '1px', height: '16px', margin: '0' }} />

        <IconButton onClick={() => window.dispatchEvent(new CustomEvent('TOGGLE_SEARCH_PANEL'))} title="Search (Cmd+K)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </IconButton>
      </div>
    </div>
  )
}
