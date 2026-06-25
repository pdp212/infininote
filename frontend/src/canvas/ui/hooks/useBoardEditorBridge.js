import { useEditor, useValue } from '@tldraw/tldraw'

export function useBoardEditorBridge() {
  const editor = useEditor()
  
  if (!editor) {
    return {
      editor: null,
      isReady: false,
      currentTool: 'select',
      setTool: () => {},
      undo: () => {},
      redo: () => {},
      duplicateSelection: () => {},
      deleteSelection: () => {},
      zoomIn: () => {},
      zoomOut: () => {},
      resetZoom: () => {},
      zoomPercent: 100,
      selectedShapeIds: [],
      hasSelection: false,
      canUndo: false,
      canRedo: false,
    }
  }

  const currentTool = useValue('current tool id', () => editor.getCurrentToolId(), [editor])
  const selectedShapeIds = useValue('selectedShapeIds', () => editor.getSelectedShapeIds(), [editor])
  const canUndo = useValue('canUndo', () => editor.getCanUndo(), [editor])
  const canRedo = useValue('canRedo', () => editor.getCanRedo(), [editor])
  const camera = useValue('camera', () => editor.getCamera(), [editor])
  const zoomPercent = Math.round(camera.z * 100)

  return {
    editor,
    isReady: true,
    currentTool,
    setTool: (toolId) => editor.setCurrentTool(toolId),
    undo: () => editor.undo(),
    redo: () => editor.redo(),
    duplicateSelection: () => {
      if (selectedShapeIds.length > 0) editor.duplicateShapes(selectedShapeIds)
    },
    deleteSelection: () => editor.deleteShapes(selectedShapeIds),
    zoomIn: () => editor.zoomIn(),
    zoomOut: () => editor.zoomOut(),
    resetZoom: () => editor.resetZoom(),
    fitToScreen: () => editor.zoomToFit(),
    zoomPercent,
    selectedShapeIds,
    hasSelection: selectedShapeIds.length > 0,
    canUndo,
    canRedo,
  }
}
