import { useEditor, createShapeId } from '@tldraw/tldraw'
import { useCallback } from 'react'
import { useBoardJournalMeta } from './useBoardJournalMeta'
import { getDefaultJournalHeaderText } from './journalTemplates'
import { sanitizeShapeForTldraw } from '../../features/boards/utils/shapeStyleNormalizer'

export function useQuickCapture(boardId) {
  const editor = useEditor()
  const { getJournalHeaderShape, getNextJournalInsertionPoint } = useBoardJournalMeta()

  const createJournalHeaderIfNeeded = useCallback((dateKey) => {
    if (!editor) return
    const existing = getJournalHeaderShape()
    if (existing) return

    const id = createShapeId()
    const shape = sanitizeShapeForTldraw({
      id,
      type: 'text',
      x: 100,
      y: 80,
      props: {
        text: getDefaultJournalHeaderText(dateKey),
        size: 'xl',
        color: 'black',
        font: 'draw',
        textAlign: 'start' // FIX: use textAlign instead of align for text shape
      },
      meta: {
        infininoteRole: 'journal-header'
      }
    })
    editor.createShape(shape)
  }, [editor, getJournalHeaderShape])

  const createQuickNote = useCallback(() => {
    if (!editor) return
    
    const pos = getNextJournalInsertionPoint()
    const id = createShapeId()
    
    const shape = sanitizeShapeForTldraw({
      id,
      type: 'note',
      x: pos.x,
      y: pos.y,
      props: {
        text: '',
        size: 'm',
        color: 'yellow',
      }
    })
    editor.createShape(shape)
    
    editor.select(id)
    editor.setCurrentTool('select')
    editor.setEditingShape(id)
    
  }, [editor, getNextJournalInsertionPoint])

  const createQuickText = useCallback(() => {
    if (!editor) return
    
    const pos = getNextJournalInsertionPoint()
    const id = createShapeId()
    
    const shape = sanitizeShapeForTldraw({
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
    editor.createShape(shape)
    
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
