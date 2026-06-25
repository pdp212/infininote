import React from 'react'
import { DefaultMainMenu, DefaultPageMenu } from '@tldraw/tldraw'
import { useBoardActions } from '../hooks/useBoardActions'
import { useBoardSelection } from '../hooks/useBoardSelection'

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

import { useQuickCapture } from '../../../features/journal/useQuickCapture'

export default function BoardHeaderBar() {
  const { undo, redo, deleteSelection, duplicateSelection, canUndo, canRedo } = useBoardActions()
  const { hasSelection } = useBoardSelection()
  const { createQuickNote, createQuickText } = useQuickCapture()

  return (
    <div className="infininote-panel board-header-bar">
      <div className="board-header-left">
        <DefaultMainMenu />
        <div className="board-tool-divider" style={{ width: '1px', height: '20px', margin: '0 8px' }} />
        <DefaultPageMenu />
      </div>
      
      <div className="board-tool-divider" style={{ width: '1px', height: '20px', margin: '0 8px' }} />
      
      {/* --- Quick Capture Group --- */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <button onClick={createQuickNote} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(43, 214, 123, 0.1)', color: '#2bd67b', border: '1px solid rgba(43, 214, 123, 0.3)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
          <span style={{ fontSize: '16px' }}>+</span> Note
        </button>
        <button onClick={createQuickText} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', color: '#ccc', border: '1px solid #444', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
          <span style={{ fontSize: '16px' }}>+</span> Text
        </button>
      </div>

      <div className="board-tool-divider" style={{ width: '1px', height: '20px', margin: '0 8px' }} />

      
      <div className="board-header-right">
        <IconButton onClick={undo} disabled={!canUndo} title="Undo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </IconButton>
        <IconButton onClick={redo} disabled={!canRedo} title="Redo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </IconButton>
        <div className="board-tool-divider" style={{ width: '1px', height: '20px', margin: '0 4px' }} />
        <IconButton onClick={deleteSelection} disabled={!hasSelection} title="Delete">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </IconButton>
        <IconButton onClick={duplicateSelection} disabled={!hasSelection} title="Duplicate">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </IconButton>
      </div>
    </div>
  )
}
