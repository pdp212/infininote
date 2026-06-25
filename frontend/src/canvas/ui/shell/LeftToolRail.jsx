import React from 'react'
import { BOARD_TOOLS } from '../constants/boardTools'
import { useCurrentTool } from '../hooks/useCurrentTool'
import { useBoardActions } from '../hooks/useBoardActions'

const Icons = {
  select: <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />,
  note: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />,
  text: <path d="M4 7V4h16v3M9 20h6M12 4v16" />,
  hand: <path d="M18 11V6a2 2 0 0 0-4 0v4H10V4a2 2 0 0 0-4 0v6H2v5.5C2 19.09 4.91 22 8.5 22h7c3.87 0 7-3.13 7-7v-4h-4.5z" />,
  pen: <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-1.5L2 22v-3.5L16.5 4.5 18 6l-6.5 6.5M22 2l-3 3M19 5l-2-2" />,
  eraser: <path d="M20 20H7L2 15l9-9 9 9-4 5zM11 6l9 9" />,
  arrow: <path d="M5 12h14M12 5l7 7-7 7" />,
  image: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />, // Use standard image icon later, for now this is generic upload
  shape: <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
}

export default function LeftToolRail() {
  const { currentToolId } = useCurrentTool()
  const { setTool } = useBoardActions()

  const groups = {
    nav: BOARD_TOOLS.filter(t => t.group === 'nav'),
    primary: BOARD_TOOLS.filter(t => t.group === 'primary'),
    draw: BOARD_TOOLS.filter(t => t.group === 'draw'),
    content: BOARD_TOOLS.filter(t => t.group === 'content'),
    shape: BOARD_TOOLS.filter(t => t.group === 'shape'),
  }

  const renderTool = (tool) => {
    const isActive = currentToolId === tool.tool
    return (
      <button
        key={tool.id}
        className={`board-tool-btn ${isActive ? 'is-active' : ''} ${tool.id === 'note' ? 'quick-note-btn' : ''}`}
        onClick={() => {
          if (tool.tool) setTool(tool.tool)
          else if (tool.action === 'insert-image') {
            // Future image upload action
            alert('Insert image feature not fully wired yet.')
          }
        }}
        title={tool.label}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {Icons[tool.icon]}
        </svg>
      </button>
    )
  }

  return (
    <div className="infininote-panel board-left-tool-rail">
      <div className="board-tool-group">
        {groups.nav.map(renderTool)}
      </div>
      <div className="board-tool-group">
        {groups.primary.map(renderTool)}
      </div>
      <div className="board-tool-group">
        {groups.draw.map(renderTool)}
      </div>
      <div className="board-tool-group">
        {groups.content.map(renderTool)}
      </div>
      <div className="board-tool-group">
        {groups.shape.map(renderTool)}
      </div>
    </div>
  )
}
