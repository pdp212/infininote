import { useEditor, useValue } from '@tldraw/tldraw'
import { useNavigate } from 'react-router-dom'

export function useBoardActions() {
  const editor = useEditor()
  const navigate = useNavigate()

  const history = useValue('history', () => editor.getHistory(), [editor])
  const selectedShapeIds = useValue('selectedShapeIds', () => editor.getSelectedShapeIds(), [editor])

  const undo = () => editor.undo()
  const redo = () => editor.redo()
  
  const deleteSelection = () => editor.deleteShapes(selectedShapeIds)
  const duplicateSelection = () => {
    if (selectedShapeIds.length > 0) {
      editor.duplicateShapes(selectedShapeIds)
    }
  }

  const setTool = (toolId) => {
    editor.setCurrentTool(toolId)
  }

  const zoomIn = () => editor.zoomIn()
  const zoomOut = () => editor.zoomOut()
  const resetZoom = () => editor.resetZoom()
  const fitToScreen = () => editor.zoomToFit()

  const goToDashboard = () => navigate('/')

  return {
    undo,
    redo,
    deleteSelection,
    duplicateSelection,
    setTool,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    goToDashboard,
    canUndo: history.numUndos > 0,
    canRedo: history.numRedos > 0,
    hasSelection: selectedShapeIds.length > 0,
  }
}
