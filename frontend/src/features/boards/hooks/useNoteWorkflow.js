import { useEffect, useRef } from 'react'

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
    
    initDone.current = true
  }, [editor, boardId])
}
