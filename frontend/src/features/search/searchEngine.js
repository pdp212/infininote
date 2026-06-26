/**
 * searchEngine.js
 * Basic search ranking & matching for local index and global summaries.
 */

const normalize = (str) => String(str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

function getSnippet(text, query) {
  const normText = normalize(text)
  const normQuery = normalize(query)
  const idx = normText.indexOf(normQuery)
  if (idx === -1) return text.substring(0, 80) + (text.length > 80 ? '...' : '')
  
  const start = Math.max(0, idx - 40)
  const end = Math.min(text.length, idx + normQuery.length + 40)
  return (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '')
}

export function searchLocalBoard(query, localIndex) {
  if (!query || !query.trim() || !localIndex) return []
  
  const normQuery = normalize(query.trim())
  const results = []
  
  // 1. Board Match
  const boardTitleMatch = normalize(localIndex.boardTitle).includes(normQuery)
  const boardTagMatch = localIndex.boardTags.some(t => normalize(t).includes(normQuery))
  
  if (boardTitleMatch || boardTagMatch) {
    results.push({
      boardId: localIndex.boardId,
      boardTitle: localIndex.boardTitle,
      matchType: boardTitleMatch ? 'board-title' : 'board-tag',
      score: boardTitleMatch ? 100 : 80
    })
  }

  // 2. Shape Match
  for (const item of localIndex.items) {
    const textMatch = normalize(item.text).includes(normQuery)
    const tagMatch = item.tags.some(t => normalize(t).includes(normQuery))
    
    if (textMatch || tagMatch) {
      results.push({
        boardId: localIndex.boardId,
        boardTitle: localIndex.boardTitle,
        shapeId: item.shapeId,
        snippet: getSnippet(item.text, query),
        matchType: textMatch ? 'shape-text' : 'shape-tag',
        score: textMatch ? (normalize(item.text) === normQuery ? 90 : 50) : 70
      })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results
}

export function searchGlobalSummaries(query, summaries) {
  if (!query || !query.trim() || !summaries) return []
  
  const normQuery = normalize(query.trim())
  const results = []

  for (const summary of summaries) {
    const titleMatch = normalize(summary.title).includes(normQuery)
    const tagMatch = summary.boardTags.some(t => normalize(t).includes(normQuery))
    
    let textMatch = false
    let bestSnippet = ''
    for (const preview of summary.textPreview || []) {
      if (normalize(preview).includes(normQuery)) {
        textMatch = true
        bestSnippet = getSnippet(preview, query)
        break
      }
    }

    if (titleMatch || tagMatch || textMatch) {
      results.push({
        boardId: summary.boardId,
        boardTitle: summary.title,
        snippet: bestSnippet,
        matchType: titleMatch ? 'board-title' : (tagMatch ? 'board-tag' : 'shape-text'),
        score: titleMatch ? 100 : (tagMatch ? 80 : 50)
      })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results
}
