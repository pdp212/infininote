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

const FILL_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'solid', label: 'Solid' },
  { id: 'semi', label: 'Soft' },
  { id: 'pattern', label: 'Pattern' }
]

const DASH_OPTIONS = [
  { id: 'draw', label: 'Draw' },
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dash' },
  { id: 'dotted', label: 'Dot' }
]

const SIZE_OPTIONS = [
  { id: 's', label: 'S' },
  { id: 'm', label: 'M' },
  { id: 'l', label: 'L' },
  { id: 'xl', label: 'XL' }
]

const FONT_OPTIONS = [
  { id: 'draw', label: 'Draw' },
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Mono' }
]

const ALIGN_OPTIONS = [
  { id: 'start', icon: 'M3 6h18M3 12h12M3 18h18' },
  { id: 'middle', icon: 'M3 6h18M6 12h12M3 18h18' },
  { id: 'end', icon: 'M3 6h18M9 12h12M3 18h18' }
]

const OPACITY_OPTIONS = [
  { id: 0.25, label: '25%' },
  { id: 0.5, label: '50%' },
  { id: 0.75, label: '75%' },
  { id: 1, label: '100%' }
]

const InspectorSection = ({ title, isMixed, children }) => (
  <div className="inspector-section">
    <div className="inspector-section-header">
      <div className="inspector-section-title">{title}</div>
      {isMixed && <div className="inspector-section-mixed">Mixed</div>}
    </div>
    {children}
  </div>
)

export default function RightInspectorPanel() {
  const { 
    hasSelection,
    currentColor, currentSize, currentFont, currentAlign, currentDash, currentFill, currentOpacity,
    showColor, showSize, showFont, showAlign, showDash, showFill, showOpacity,
    setColor, setSize, setFont, setAlign, setDash, setFill, setOpacity
  } = useBoardStyles()

  if (!hasSelection) return null

  if (!showColor && !showSize && !showFont && !showAlign && !showDash && !showFill && !showOpacity) {
    return null
  }

  return (
    <div className="infininote-panel board-right-inspector">
      
      {showColor && (
        <InspectorSection title="Color" isMixed={currentColor === 'mixed'}>
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
        </InspectorSection>
      )}

      {showFont && (
        <InspectorSection title="Font" isMixed={currentFont === 'mixed'}>
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
        </InspectorSection>
      )}

      {showAlign && (
        <InspectorSection title="Align" isMixed={currentAlign === 'mixed'}>
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
        </InspectorSection>
      )}

      {showSize && (
        <InspectorSection title="Size" isMixed={currentSize === 'mixed'}>
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
        </InspectorSection>
      )}

      {showOpacity && (
        <InspectorSection title="Opacity" isMixed={currentOpacity === 'mixed'}>
          <div className="inspector-segmented-control">
            {OPACITY_OPTIONS.map(o => (
              <button
                key={o.id}
                className={`inspector-segment ${currentOpacity === o.id ? 'is-active' : ''}`}
                onClick={() => setOpacity(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </InspectorSection>
      )}

      {showFill && (
        <InspectorSection title="Fill" isMixed={currentFill === 'mixed'}>
          <div className="inspector-segmented-control">
            {FILL_OPTIONS.map(f => (
              <button
                key={f.id}
                className={`inspector-segment ${currentFill === f.id ? 'is-active' : ''}`}
                onClick={() => setFill(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </InspectorSection>
      )}

      {showDash && (
        <InspectorSection title="Stroke" isMixed={currentDash === 'mixed'}>
          <div className="inspector-segmented-control">
            {DASH_OPTIONS.map(d => (
              <button
                key={d.id}
                className={`inspector-segment ${currentDash === d.id ? 'is-active' : ''}`}
                onClick={() => setDash(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </InspectorSection>
      )}

    </div>
  )
}

