/**
 * buildBoardOutline.js
 * Builds an outline view from shapes and app metadata.
 */

import { shapeMetaStore } from '../boards/meta/shapeMetaStore'

const getLevel = (kind) => {
  if (kind === 'heading') return 1
  if (kind === 'subheading') return 2
  return 3 // body
}

export function buildBoardOutline(boardId, editor) {
  if (!boardId || !editor) return []

  const registry = shapeMetaStore.getRegistry(boardId)
  const items = []

  const allRecords = editor.store.allRecords()
  for (const record of allRecords) {
    if (record.typeName === 'shape' && (record.type === 'text' || record.type === 'note')) {
      const text = record.props?.text || ''
      if (!text.trim()) continue

      const meta = registry.items[record.id] || { kind: 'body' }
      
      // Heuristic fallback for outline if kind is not set but text is large
      let kind = meta.kind
      if (kind === 'body' && record.type === 'text') {
        const scale = record.props?.scale || 1
        if (scale > 1.5) kind = 'heading'
      }

      const bounds = editor.getShapePageBounds(record.id)
      
      let label = text.split('\n')[0]
      if (label.length > 40) label = label.substring(0, 40) + '...'

      items.push({
        shapeId: record.id,
        label,
        level: getLevel(kind),
        kind,
        y: bounds ? bounds.y : 0,
        x: bounds ? bounds.x : 0,
      })
    }
  }

  // Sort top-to-bottom, then left-to-right
  items.sort((a, b) => {
    if (Math.abs(a.y - b.y) > 20) {
      return a.y - b.y
    }
    return a.x - b.x
  })

  return items
}
