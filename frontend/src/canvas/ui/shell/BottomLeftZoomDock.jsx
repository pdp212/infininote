import React from 'react'
import { useBoardZoom } from '../hooks/useBoardZoom'

const ZoomIconButton = ({ onClick, children, title }) => (
  <button 
    onClick={onClick} 
    title={title}
    style={{
      background: 'transparent',
      border: 'none',
      color: 'var(--board-text-primary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px',
      borderRadius: '8px'
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
  >
    {children}
  </button>
)

export default function BottomLeftZoomDock() {
  const { zoomPercent, zoomIn, zoomOut, fitToScreen } = useBoardZoom()

  return (
    <div className="infininote-panel board-zoom-dock">
      <ZoomIconButton onClick={zoomOut} title="Zoom out">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14" />
        </svg>
      </ZoomIconButton>

      <div 
        style={{ 
          fontSize: '13px', 
          fontWeight: 500, 
          minWidth: '40px', 
          textAlign: 'center',
          cursor: 'pointer' 
        }}
        onClick={fitToScreen}
        title="Fit to screen"
      >
        {zoomPercent}%
      </div>

      <ZoomIconButton onClick={zoomIn} title="Zoom in">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </ZoomIconButton>
    </div>
  )
}
