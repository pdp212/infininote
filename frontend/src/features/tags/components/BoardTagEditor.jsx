import { useState } from 'react'
import useStore from '../../../store/useStore'
import { boardMetaStore } from '../../boards/meta/boardMetaStore'

export default function BoardTagEditor() {
  const boardId = useStore(s => s.boardId)
  const meta = boardMetaStore.getBoardMeta(boardId)
  
  const [tags, setTags] = useState(meta.boardTags || [])
  const [input, setInput] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    const t = input.trim()
    if (!t) return
    const newTags = [...new Set([...tags, t])]
    setTags(newTags)
    boardMetaStore.setBoardTags(boardId, newTags)
    setInput('')
  }

  const handleRemove = (tag) => {
    const newTags = tags.filter(t => t !== tag)
    setTags(newTags)
    boardMetaStore.setBoardTags(boardId, newTags)
  }

  return (
    <div className="tag-editor board-tag-editor">
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
          placeholder="Thêm board tag..." 
          className="tag-input"
        />
        <button type="submit" className="tag-add-btn">+</button>
      </form>
    </div>
  )
}
