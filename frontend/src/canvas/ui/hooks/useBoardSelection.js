import { useBoardEditorBridge } from './useBoardEditorBridge'

export function useBoardSelection() {
  const { hasSelection, selectedShapeIds, editor, isReady } = useBoardEditorBridge()
  
  const selectionCount = selectedShapeIds.length

  let selectedShapeType = null
  if (isReady && selectionCount > 0) {
    if (selectionCount === 1) {
      const shape = editor.getShape(selectedShapeIds[0])
      selectedShapeType = shape ? shape.type : null
    } else {
      const types = new Set(selectedShapeIds.map(id => editor.getShape(id)?.type))
      selectedShapeType = types.size === 1 ? Array.from(types)[0] : 'mixed'
    }
  }

  return {
    hasSelection,
    selectedShapeIds,
    selectionCount,
    selectedShapeType,
  }
}

