import { useEffect, useRef } from 'react'
import { applySafeStyleToNextShapes } from '../utils/applyBoardStyleToShapeType'

export function useNoteWorkflow(editor, boardId) {
  const initDone = useRef(false)
  
  useEffect(() => {
    if (!editor || initDone.current) return
    
    // Set default tool
    const defaultTool = localStorage.getItem(`infininote-default-tool-${boardId}`) || 'select'
    try {
      if (['note', 'text', 'draw', 'select'].includes(defaultTool)) {
        editor.setCurrentTool(defaultTool)
      }
    } catch(e) {
      console.warn('[useNoteWorkflow] Failed to set default tool', e)
    }

    // Restore safe style memory
    const shouldMemory = localStorage.getItem(`infininote-style-memory-${boardId}`) !== 'false'
    if (shouldMemory) {
      const styleMem = localStorage.getItem(`infininote-saved-style-${boardId}`)
      if (styleMem) {
        try {
          const parsed = JSON.parse(styleMem)
          if (parsed.color) applySafeStyleToNextShapes(editor, 'color', parsed.color)
          if (parsed.size) applySafeStyleToNextShapes(editor, 'size', parsed.size)
          if (parsed.font) applySafeStyleToNextShapes(editor, 'font', parsed.font)
          if (parsed.align) applySafeStyleToNextShapes(editor, 'align', parsed.align)
          if (parsed.dash) applySafeStyleToNextShapes(editor, 'dash', parsed.dash)
          if (parsed.fill) applySafeStyleToNextShapes(editor, 'fill', parsed.fill)
        } catch(e) {
          console.warn('[useNoteWorkflow] Failed to restore style memory', e)
        }
      }
    }
    
    initDone.current = true
  }, [editor, boardId])

  // Track style changes to save to memory
  useEffect(() => {
    if (!editor) return
    return editor.store.listen((entry) => {
      const shouldMemory = localStorage.getItem(`infininote-style-memory-${boardId}`) !== 'false'
      if (!shouldMemory || entry.source !== 'user') return

      // Look for style applications or newly created shapes to learn their styles
      const updatedShapes = Object.values(entry.changes.updated).map(u => u[1])
      const addedShapes = Object.values(entry.changes.added)
      const shapes = [...updatedShapes, ...addedShapes].filter(s => s.typeName === 'shape')
      
      if (shapes.length > 0) {
        const lastShape = shapes[shapes.length - 1]
        // Extract UI style model ONLY (no raw props)
        const uiStyleModel = {}
        if (lastShape.props.color) uiStyleModel.color = lastShape.props.color
        if (lastShape.props.size) uiStyleModel.size = lastShape.props.size
        if (lastShape.props.font) uiStyleModel.font = lastShape.props.font
        // For align, prefer textAlign if text, else align
        if (lastShape.props.textAlign) uiStyleModel.align = lastShape.props.textAlign
        else if (lastShape.props.align) uiStyleModel.align = lastShape.props.align
        if (lastShape.props.dash) uiStyleModel.dash = lastShape.props.dash
        if (lastShape.props.fill) uiStyleModel.fill = lastShape.props.fill

        if (Object.keys(uiStyleModel).length > 0) {
          localStorage.setItem(`infininote-saved-style-${boardId}`, JSON.stringify(uiStyleModel))
        }
      }
    }, { scope: 'document', source: 'user' })
  }, [editor, boardId])
}
