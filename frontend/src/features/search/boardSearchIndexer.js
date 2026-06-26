/**
 * boardSearchIndexer.js
 * Builds a search index from a local board snapshot and app metadata.
 */

import { boardMetaStore } from '../boards/meta/boardMetaStore'
import { shapeMetaStore } from '../boards/meta/shapeMetaStore'

export function buildBoardSearchIndex(boardId, editor) {
  if (!boardId || !editor) return null

  const boardMeta = boardMetaStore.getBoardMeta(boardId)
  const shapeRegistry = shapeMetaStore.getRegistry(boardId)
  
  const items = []
  
  // Index all text/note shapes
  const allRecords = editor.store.allRecords()
  for (const record of allRecords) {
    if (record.typeName === 'shape' && (record.type === 'text' || record.type === 'note')) {
      const text = record.props?.text || ''
      if (!text.trim()) continue
      
      const meta = shapeRegistry.items[record.id] || {}
      
      items.push({
        id: record.id,
        type: 'shape',
        shapeId: record.id,
        text: text,
        tags: meta.tags || [],
        kind: meta.kind || 'body'
      })
    }
  }

  return {
    boardId,
    boardTitle: boardMeta.boardTitle || boardId,
    boardTags: boardMeta.boardTags || [],
    updatedAt: boardMeta.updatedAt,
    items
  }
}
