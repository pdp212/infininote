import { useEditor, createShapeId } from '@tldraw/tldraw'
import { useCallback } from 'react'
import { useBoardJournalMeta } from './useBoardJournalMeta'
import { getDefaultJournalHeaderText } from './journalTemplates'

export function useQuickCapture(boardId) {
  const editor = useEditor()
  const { getJournalHeaderShape, getNextJournalInsertionPoint } = useBoardJournalMeta()

  const createJournalHeaderIfNeeded = useCallback((dateKey) => {
    if (!editor) return
    const existing = getJournalHeaderShape()
    if (existing) return

    const id = createShapeId()
    editor.createShape({
      id,
      type: 'text',
      x: 100,
      y: 80,
      props: {
        text: getDefaultJournalHeaderText(dateKey),
        size: 'xl',
        color: 'black',
        font: 'draw',
        align: 'start'
      },
      meta: {
        infininoteRole: 'journal-header'
      }
    })
  }, [editor, getJournalHeaderShape])

  const createQuickNote = useCallback(() => {
    if (!editor) return
    
    // Temporarily switch tool to note to ensure proper mode if needed, or just insert it
    const pos = getNextJournalInsertionPoint()
    const id = createShapeId()
    
    editor.createShape({
      id,
      type: 'note',
      x: pos.x,
      y: pos.y,
      props: {
        text: '',
        size: 'm',
        color: 'yellow', // Could read from style memory later
      }
    })
    
    editor.select(id)
    editor.setCurrentTool('select')
    editor.setEditingShape(id)
    
  }, [editor, getNextJournalInsertionPoint])

  const createQuickText = useCallback(() => {
    if (!editor) return
    
    const pos = getNextJournalInsertionPoint()
    const id = createShapeId()
    
    editor.createShape({
      id,
      type: 'text',
      x: pos.x,
      y: pos.y,
      props: {
        text: '',
        size: 'm',
        color: 'black',
        w: 400
      }
    })
    
    editor.select(id)
    editor.setCurrentTool('select')
    editor.setEditingShape(id)
    
  }, [editor, getNextJournalInsertionPoint])

  return {
    createQuickNote,
    createQuickText,
    createJournalHeaderIfNeeded
  }
}
