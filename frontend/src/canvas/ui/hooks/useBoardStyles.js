import { useValue, DefaultColorStyle, DefaultSizeStyle, DefaultFontStyle, DefaultHorizontalAlignStyle, DefaultTextAlignStyle } from '@tldraw/tldraw'
import { useBoardEditorBridge } from './useBoardEditorBridge'

export function useBoardStyles() {
  const editor = useBoardEditorBridge()

  // Subscribe to shared styles (returns a map of shared styles for the current selection)
  const sharedStyles = useValue('sharedStyles', () => editor?.getSharedStyles(), [editor])
  
  // Also track selection explicitly to know if we should show the inspector at all
  const selectedShapeIds = useValue('selectedShapes', () => editor?.getSelectedShapeIds() || [], [editor])

  if (!editor || !sharedStyles) {
    return {
      hasSelection: false,
      currentColor: null,
      currentSize: null,
      currentFont: null,
      currentAlign: null,
      canEditColor: false,
      canEditSize: false,
      canEditFont: false,
      canEditAlign: false,
      setColor: () => {},
      setSize: () => {},
      setFont: () => {},
      setAlign: () => {},
    }
  }

  // Helper to extract style value or 'mixed' from the SharedStyleMap
  const getStyleValue = (styleProp) => {
    const shared = sharedStyles.get(styleProp)
    if (!shared) return null
    if (shared.type === 'mixed') return 'mixed'
    return shared.value
  }

  const currentColor = getStyleValue(DefaultColorStyle)
  const currentSize = getStyleValue(DefaultSizeStyle)
  const currentFont = getStyleValue(DefaultFontStyle)
  
  // Align could be DefaultHorizontalAlignStyle or DefaultTextAlignStyle depending on shape
  const currentAlign = getStyleValue(DefaultHorizontalAlignStyle) || getStyleValue(DefaultTextAlignStyle)

  // A style is editable if the sharedStyles map contains it
  // (Meaning at least one selected shape supports it)
  const canEditColor = sharedStyles.get(DefaultColorStyle) !== undefined
  const canEditSize = sharedStyles.get(DefaultSizeStyle) !== undefined
  const canEditFont = sharedStyles.get(DefaultFontStyle) !== undefined
  
  const hasHorizontalAlign = sharedStyles.get(DefaultHorizontalAlignStyle) !== undefined
  const hasTextAlign = sharedStyles.get(DefaultTextAlignStyle) !== undefined
  const canEditAlign = hasHorizontalAlign || hasTextAlign

  // Setter helpers - update both selected shapes and the next default shapes
  const setColor = (value) => {
    editor.mark('set color')
    editor.setStyleForSelectedShapes(DefaultColorStyle, value)
    editor.setStyleForNextShapes(DefaultColorStyle, value)
  }

  const setSize = (value) => {
    editor.mark('set size')
    editor.setStyleForSelectedShapes(DefaultSizeStyle, value)
    editor.setStyleForNextShapes(DefaultSizeStyle, value)
  }

  const setFont = (value) => {
    editor.mark('set font')
    editor.setStyleForSelectedShapes(DefaultFontStyle, value)
    editor.setStyleForNextShapes(DefaultFontStyle, value)
  }

  const setAlign = (value) => {
    editor.mark('set align')
    if (hasHorizontalAlign) {
      editor.setStyleForSelectedShapes(DefaultHorizontalAlignStyle, value)
      editor.setStyleForNextShapes(DefaultHorizontalAlignStyle, value)
    }
    if (hasTextAlign) {
      editor.setStyleForSelectedShapes(DefaultTextAlignStyle, value)
      editor.setStyleForNextShapes(DefaultTextAlignStyle, value)
    }
  }

  return {
    hasSelection: selectedShapeIds.length > 0,
    currentColor,
    currentSize,
    currentFont,
    currentAlign,
    canEditColor,
    canEditSize,
    canEditFont,
    canEditAlign,
    setColor,
    setSize,
    setFont,
    setAlign
  }
}
