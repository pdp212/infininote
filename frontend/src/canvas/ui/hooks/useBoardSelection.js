import { useEditor, useValue } from '@tldraw/tldraw'

export function useBoardSelection() {
  const editor = useEditor()
  const selectedShapeIds = useValue('selectedShapeIds', () => editor.getSelectedShapeIds(), [editor])
  
  const hasSelection = selectedShapeIds.length > 0
  const selectionCount = selectedShapeIds.length

  const selectedShapeType = useValue('selectedShapeType', () => {
    if (selectedShapeIds.length === 0) return null
    if (selectedShapeIds.length === 1) {
      const shape = editor.getShape(selectedShapeIds[0])
      return shape ? shape.type : null
    }
    // Mixed check
    const types = new Set(selectedShapeIds.map(id => editor.getShape(id)?.type))
    return types.size === 1 ? Array.from(types)[0] : 'mixed'
  }, [editor, selectedShapeIds])

  return {
    hasSelection,
    selectedShapeIds,
    selectionCount,
    selectedShapeType,
  }
}
