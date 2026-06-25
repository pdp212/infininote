import { useEditor } from '@tldraw/tldraw'
import { useCallback } from 'react'

export function useBoardJournalMeta() {
  const editor = useEditor()
  
  const getJournalHeaderShape = useCallback(() => {
    if (!editor) return null
    const shapes = editor.store.allRecords().filter(r => r.typeName === 'shape')
    return shapes.find(s => s.meta?.infininoteRole === 'journal-header') || null
  }, [editor])

  const getNextJournalInsertionPoint = useCallback(() => {
    if (!editor) return { x: 100, y: 160 }
    
    const shapes = editor.store.allRecords().filter(r => r.typeName === 'shape')
    
    // Find all shapes in the left journal column
    const journalColumnShapes = shapes.filter(s => {
      const bounds = editor.getShapePageBounds(s.id)
      return bounds && bounds.x > 0 && bounds.x < 800
    })
    
    if (journalColumnShapes.length > 0) {
      let maxBottom = -Infinity
      let anchorX = 100
      
      for (const s of journalColumnShapes) {
        const bounds = editor.getShapePageBounds(s.id)
        if (bounds) {
          const bottom = bounds.y + bounds.h
          if (bottom > maxBottom) {
            maxBottom = bottom
            anchorX = Math.max(100, bounds.x)
          }
        }
      }
      
      return { x: anchorX, y: maxBottom + 32 } // 32px vertical gap
    }
    
    // Fallback to header
    const header = getJournalHeaderShape()
    if (header) {
      const bounds = editor.getShapePageBounds(header.id)
      if (bounds) {
        return { x: bounds.x, y: bounds.y + bounds.h + 40 }
      }
    }
    
    // Default start
    return { x: 100, y: 160 }
  }, [editor, getJournalHeaderShape])
  
  return { getJournalHeaderShape, getNextJournalInsertionPoint }
}
