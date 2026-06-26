/**
 * boardMetaStore.js
 * App-level board metadata registry.
 */

import { sanitizeBoardMeta } from './metaSanitizers'

class BoardMetaStore {
  constructor() {
    this.meta = new Map() // boardId -> BoardMeta
  }

  _getKey(boardId) {
    return `infininote-board-meta-${boardId}`
  }

  getBoardMeta(boardId) {
    if (!boardId) return sanitizeBoardMeta({})
    if (this.meta.has(boardId)) {
      return this.meta.get(boardId)
    }

    try {
      const cached = localStorage.getItem(this._getKey(boardId))
      if (cached) {
        const parsed = JSON.parse(cached)
        const clean = sanitizeBoardMeta(parsed)
        this.meta.set(boardId, clean)
        return clean
      }
    } catch (e) {
      console.warn('[BoardMetaStore] Failed to load local meta', e)
    }

    const fallback = sanitizeBoardMeta({ boardId })
    this.meta.set(boardId, fallback)
    return fallback
  }

  saveBoardMeta(boardId, newMeta) {
    if (!boardId) return
    const clean = sanitizeBoardMeta({ ...newMeta, boardId, updatedAt: new Date().toISOString() })
    this.meta.set(boardId, clean)
    try {
      localStorage.setItem(this._getKey(boardId), JSON.stringify(clean))
    } catch (e) {
      console.warn('[BoardMetaStore] Failed to save local meta', e)
    }
    return clean
  }

  mergeRemoteMeta(boardId, remoteMeta) {
    if (!remoteMeta) return
    // Assuming remote is truthy, we overwrite local for now since it's a simple sync model.
    // Ideally, we compare timestamps.
    const current = this.getBoardMeta(boardId)
    if (!current.updatedAt || !remoteMeta.updatedAt || new Date(remoteMeta.updatedAt) >= new Date(current.updatedAt)) {
      this.saveBoardMeta(boardId, remoteMeta)
    }
  }

  setBoardTags(boardId, tags) {
    const current = this.getBoardMeta(boardId)
    return this.saveBoardMeta(boardId, { ...current, boardTags: tags })
  }

  setBoardTitle(boardId, title) {
    const current = this.getBoardMeta(boardId)
    return this.saveBoardMeta(boardId, { ...current, boardTitle: title })
  }

  setJournalMeta(boardId, journalDate) {
    const current = this.getBoardMeta(boardId)
    return this.saveBoardMeta(boardId, { ...current, journalDate, boardType: 'journal' })
  }
}

export const boardMetaStore = new BoardMetaStore()
