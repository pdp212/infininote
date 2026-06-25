import React from 'react'
import { useBoardStyles } from '../hooks/useBoardStyles'

const COLOR_PALETTE = [
  { id: 'black', hex: '#1a1a1a' },
  { id: 'grey', hex: '#808080' },
  { id: 'white', hex: '#ffffff' },
  { id: 'light-red', hex: '#ff9999' },
  { id: 'red', hex: '#e63946' },
  { id: 'orange', hex: '#f4a261' },
  { id: 'yellow', hex: '#e9c46a' },
  { id: 'light-green', hex: '#a8e6cf' },
  { id: 'green', hex: '#2a9d8f' },
  { id: 'light-blue', hex: '#a2d2ff' },
  { id: 'blue', hex: '#457b9d' },
  { id: 'light-violet', hex: '#cdb4db' },
  { id: 'violet', hex: '#9d4edd' }
]

const SIZE_OPTIONS = [
  { id: 's', label: 'S' },
  { id: 'm', label: 'M' },
  { id: 'l', label: 'L' },
  { id: 'xl', label: 'XL' }
]

const ALIGN_OPTIONS = [
  { id: 'start', icon: 'M3 6h18M3 12h12M3 18h18' },
  { id: 'middle', icon: 'M3 6h18M6 12h12M3 18h18' },
  { id: 'end', icon: 'M3 6h18M9 12h12M3 18h18' }
]

const FONT_OPTIONS = [
  { id: 'draw', label: 'Draw' },
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Mono' }
]

export default function RightInspectorPanel() {
  const { 
    hasSelection,
    currentColor, currentSize, currentFont, currentAlign,
    canEditColor, canEditSize, canEditFont, canEditAlign,
    setColor, setSize, setFont, setAlign
  } = useBoardStyles()

  if (!hasSelection) return null

  // If selection exists but no styles are editable (e.g. grouped shapes or unsupported), return null
  if (!canEditColor && !canEditSize && !canEditFont && !canEditAlign) {
    return null
  }

  return (
    <div className="infininote-panel board-right-inspector">
      
      {canEditColor && (
        <div className="inspector-section">
          <div className="inspector-label">Color</div>
          <div className="inspector-color-grid">
            {COLOR_PALETTE.map(c => (
              <button
                key={c.id}
                className={`inspector-swatch ${currentColor === c.id ? 'is-active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setColor(c.id)}
                title={c.id}
              />
            ))}
          </div>
        </div>
      )}

      {canEditSize && (
        <div className="inspector-section">
          <div className="inspector-label">Size</div>
          <div className="inspector-segmented-control">
            {SIZE_OPTIONS.map(s => (
              <button
                key={s.id}
                className={`inspector-segment ${currentSize === s.id ? 'is-active' : ''}`}
                onClick={() => setSize(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {canEditFont && (
        <div className="inspector-section">
          <div className="inspector-label">Font</div>
          <div className="inspector-segmented-control">
            {FONT_OPTIONS.map(f => (
              <button
                key={f.id}
                className={`inspector-segment ${currentFont === f.id ? 'is-active' : ''}`}
                onClick={() => setFont(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {canEditAlign && (
        <div className="inspector-section">
          <div className="inspector-label">Align</div>
          <div className="inspector-segmented-control">
            {ALIGN_OPTIONS.map(a => (
              <button
                key={a.id}
                className={`inspector-segment ${currentAlign === a.id ? 'is-active' : ''}`}
                onClick={() => setAlign(a.id)}
                title={a.id}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={a.icon} />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
