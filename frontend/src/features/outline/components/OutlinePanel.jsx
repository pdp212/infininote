import { useState, useEffect } from 'react'
import { useEditor } from '@tldraw/tldraw'
import useStore from '../../../store/useStore'
import { buildBoardOutline } from '../buildBoardOutline'

export default function OutlinePanel({ onClose }) {
  const editor = useEditor()
  const boardId = useStore(s => s.boardId)
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!editor || !boardId) return
    const updateOutline = () => {
      setItems(buildBoardOutline(boardId, editor))
    }
    updateOutline()

    return editor.store.listen(updateOutline, { scope: 'document' })
  }, [editor, boardId])

  const handleClick = (shapeId) => {
    editor.select(shapeId)
    editor.zoomToSelection({ animation: { duration: 300 } })
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  return (
    <div className="outline-panel">
      <div className="outline-panel-header">
        <h3>Mục lục</h3>
        <button className="outline-close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="outline-panel-content">
        {items.length === 0 && (
          <div className="outline-empty">Chưa có nội dung.</div>
        )}
        {items.map((item, i) => (
          <div 
            key={i} 
            className={`outline-item level-${item.level} kind-${item.kind}`}
            onClick={() => handleClick(item.shapeId)}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
