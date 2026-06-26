/**
 * metaSanitizers.js
 * Sanitizers for app-level metadata (BoardMeta & ShapeMeta)
 */

export function sanitizeBoardMeta(meta) {
  if (!meta || typeof meta !== 'object') {
    return { version: 1, boardTags: [], updatedAt: new Date().toISOString() }
  }

  const cleanTags = Array.isArray(meta.boardTags)
    ? meta.boardTags.map(t => String(t).trim()).filter(Boolean)
    : []

  return {
    boardId: meta.boardId || '',
    version: meta.version || 1,
    boardTitle: meta.boardTitle || '',
    boardTags: [...new Set(cleanTags)], // deduplicate
    boardType: meta.boardType || 'board',
    journalDate: meta.journalDate || null,
    preferences: meta.preferences || {},
    outline: meta.outline || {},
    updatedAt: meta.updatedAt || new Date().toISOString()
  }
}

export function sanitizeShapeMetaItem(item) {
  if (!item || typeof item !== 'object') return null
  if (!item.shapeId) return null

  const validKinds = ['note', 'text', 'heading', 'subheading', 'body']
  const kind = validKinds.includes(item.kind) ? item.kind : 'body'

  const cleanTags = Array.isArray(item.tags)
    ? item.tags.map(t => String(t).trim()).filter(Boolean)
    : []

  return {
    shapeId: item.shapeId,
    kind,
    tags: [...new Set(cleanTags)],
    pinned: !!item.pinned,
    archived: !!item.archived,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString()
  }
}

export function sanitizeShapeMetaRegistry(registry) {
  if (!registry || typeof registry !== 'object') {
    return { version: 1, items: {}, updatedAt: new Date().toISOString() }
  }

  const items = {}
  if (registry.items && typeof registry.items === 'object') {
    for (const [key, item] of Object.entries(registry.items)) {
      const cleanItem = sanitizeShapeMetaItem(item)
      if (cleanItem) {
        items[key] = cleanItem
      }
    }
  }

  return {
    boardId: registry.boardId || '',
    version: registry.version || 1,
    items,
    updatedAt: registry.updatedAt || new Date().toISOString()
  }
}
