import { useState, useEffect } from 'react'
import useStore from '../../../store/useStore'
import { shapeMetaStore } from '../../boards/meta/shapeMetaStore'
import { useEditor } from '@tldraw/tldraw'

export default function ShapeTagEditor() {
  const boardId = useStore(s => s.boardId)
  const editor = useEditor()
  
  const selectedShapeIds = editor.getSelectedShapeIds()
  const shapeId = selectedShapeIds.length === 1 ? selectedShapeIds[0] : null
  const shape = shapeId ? editor.getShape(shapeId) : null

  const isEligible = shape && (shape.type === 'text' || shape.type === 'note')

  const [tags, setTags] = useState([])
  const [kind, setKind] = useState('body')
  const [input, setInput] = useState('')

  useEffect(() => {
    if (isEligible && shapeId) {
      const meta = shapeMetaStore.getShapeMeta(boardId, shapeId)
      setTags(meta.tags || [])
      setKind(meta.kind || 'body')
    } else {
      setTags([])
      setKind('body')
    }
  }, [shapeId, isEligible, boardId])

  if (!isEligible) return null

  const handleAdd = (e) => {
    e.preventDefault()
    const t = input.trim()
    if (!t) return
    const newTags = [...new Set([...tags, t])]
    setTags(newTags)
    shapeMetaStore.setShapeTags(boardId, shapeId, newTags)
    setInput('')
  }

  const handleRemove = (tag) => {
    const newTags = tags.filter(t => t !== tag)
    setTags(newTags)
    shapeMetaStore.setShapeTags(boardId, shapeId, newTags)
  }

  const handleKindChange = (e) => {
    const newKind = e.target.value
    setKind(newKind)
    shapeMetaStore.setShapeKind(boardId, shapeId, newKind)
  }

  return (
    <div className="tag-editor shape-tag-editor">
      <div className="outline-kind-selector">
        <label>Outline Level:</label>
        <select value={kind} onChange={handleKindChange}>
          <option value="body">Body (ẩn)</option>
          <option value="heading">Heading (Level 1)</option>
          <option value="subheading">Subheading (Level 2)</option>
        </select>
      </div>

      <div className="tag-list">
        {tags.map(t => (
          <span key={t} className="tag-chip">
            {t}
            <button onClick={() => handleRemove(t)}>✕</button>
          </span>
        ))}
      </div>
      <form onSubmit={handleAdd} className="tag-form">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Thêm shape tag..." 
          className="tag-input"
        />
        <button type="submit" className="tag-add-btn">+</button>
      </form>
    </div>
  )
}
