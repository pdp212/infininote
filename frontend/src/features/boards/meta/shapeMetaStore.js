/**
 * shapeMetaStore.js
 * App-level shape metadata registry.
 */

import { sanitizeShapeMetaRegistry, sanitizeShapeMetaItem } from './metaSanitizers'

class ShapeMetaStore {
  constructor() {
    this.registries = new Map() // boardId -> ShapeMetaRegistry
  }

  _getKey(boardId) {
    return `infininote-shape-meta-${boardId}`
  }

  getRegistry(boardId) {
    if (!boardId) return sanitizeShapeMetaRegistry({})
    if (this.registries.has(boardId)) {
      return this.registries.get(boardId)
    }

    try {
      const cached = localStorage.getItem(this._getKey(boardId))
      if (cached) {
        const parsed = JSON.parse(cached)
        const clean = sanitizeShapeMetaRegistry(parsed)
        this.registries.set(boardId, clean)
        return clean
      }
    } catch (e) {
      console.warn('[ShapeMetaStore] Failed to load local shape meta', e)
    }

    const fallback = sanitizeShapeMetaRegistry({ boardId })
    this.registries.set(boardId, fallback)
    return fallback
  }

  saveRegistry(boardId, newRegistry) {
    if (!boardId) return
    const clean = sanitizeShapeMetaRegistry({ ...newRegistry, boardId, updatedAt: new Date().toISOString() })
    this.registries.set(boardId, clean)
    try {
      localStorage.setItem(this._getKey(boardId), JSON.stringify(clean))
    } catch (e) {
      console.warn('[ShapeMetaStore] Failed to save local shape meta', e)
    }
    return clean
  }

  mergeRemoteRegistry(boardId, remoteRegistry) {
    if (!remoteRegistry) return
    const current = this.getRegistry(boardId)
    if (!current.updatedAt || !remoteRegistry.updatedAt || new Date(remoteMeta.updatedAt) >= new Date(current.updatedAt)) {
      this.saveRegistry(boardId, remoteRegistry)
    }
  }

  getShapeMeta(boardId, shapeId) {
    const reg = this.getRegistry(boardId)
    return reg.items[shapeId] || sanitizeShapeMetaItem({ shapeId })
  }

  setShapeMeta(boardId, shapeId, changes) {
    const reg = this.getRegistry(boardId)
    const currentItem = reg.items[shapeId] || sanitizeShapeMetaItem({ shapeId })
    const updatedItem = sanitizeShapeMetaItem({ ...currentItem, ...changes, updatedAt: new Date().toISOString() })
    
    if (updatedItem) {
      reg.items[shapeId] = updatedItem
      this.saveRegistry(boardId, reg)
    }
    return updatedItem
  }

  setShapeTags(boardId, shapeId, tags) {
    return this.setShapeMeta(boardId, shapeId, { tags })
  }

  setShapeKind(boardId, shapeId, kind) {
    return this.setShapeMeta(boardId, shapeId, { kind })
  }

  cleanupOrphans(boardId, existingShapeIds) {
    const reg = this.getRegistry(boardId)
    let changed = false
    const newItems = {}
    
    for (const [shapeId, item] of Object.entries(reg.items)) {
      if (existingShapeIds.has(shapeId)) {
        newItems[shapeId] = item
      } else {
        changed = true
      }
    }

    if (changed) {
      this.saveRegistry(boardId, { ...reg, items: newItems })
    }
  }
}

export const shapeMetaStore = new ShapeMetaStore()
