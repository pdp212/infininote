import { useValue, DefaultColorStyle, DefaultSizeStyle, DefaultFontStyle, DefaultHorizontalAlignStyle, DefaultTextAlignStyle } from '@tldraw/tldraw'
import { useBoardEditorBridge } from './useBoardEditorBridge'

export function useBoardStyles() {
  const editor = useBoardEditorBridge()

  // Subscribe to explicitly selected shapes instead of getSharedStyles
  const selectedShapes = useValue('selectedShapes', () => editor?.getSelectedShapes() || [], [editor])
  const selectedShapeIds = useValue('selectedShapeIds', () => editor?.getSelectedShapeIds() || [], [editor])

  if (!editor) {
    return {
      hasSelection: false,
      currentColor: null, currentSize: null, currentFont: null, currentAlign: null,
      canEditColor: false, canEditSize: false, canEditFont: false, canEditAlign: false,
      setColor: () => {}, setSize: () => {}, setFont: () => {}, setAlign: () => {},
    }
  }

  // Helper to compute a shared style from the current selection
  const getSharedProp = (shapes, propKey) => {
    if (shapes.length === 0) return { value: null, isSupported: false }
    
    let hasSupportedShape = false
    let sharedValue = undefined
    
    for (const shape of shapes) {
      if (shape.props && propKey in shape.props) {
        hasSupportedShape = true
        const val = shape.props[propKey]
        if (sharedValue === undefined) {
          sharedValue = val
        } else if (sharedValue !== val) {
          return { value: 'mixed', isSupported: true }
        }
      }
    }
    
    return { value: hasSupportedShape ? sharedValue : null, isSupported: hasSupportedShape }
  }

  const colorProp = getSharedProp(selectedShapes, 'color')
  const sizeProp = getSharedProp(selectedShapes, 'size')
  const fontProp = getSharedProp(selectedShapes, 'font')
  const alignProp = getSharedProp(selectedShapes, 'align')
  const textAlignProp = getSharedProp(selectedShapes, 'textAlign')

  const currentColor = colorProp.value
  const currentSize = sizeProp.value
  const currentFont = fontProp.value
  // Align could be align or textAlign depending on shape type
  const currentAlign = alignProp.isSupported ? alignProp.value : textAlignProp.value

  const canEditColor = colorProp.isSupported
  const canEditSize = sizeProp.isSupported
  const canEditFont = fontProp.isSupported
  
  const hasHorizontalAlign = alignProp.isSupported
  const hasTextAlign = textAlignProp.isSupported
  const canEditAlign = hasHorizontalAlign || hasTextAlign

  // Setter helpers - update both selected shapes and the next default shapes
  // These use the working Tldraw APIs that are verified to exist.
  const setColor = (value) => {
    try {
      editor.mark('set color')
      editor.setStyleForSelectedShapes(DefaultColorStyle, value)
      editor.setStyleForNextShapes(DefaultColorStyle, value)
    } catch (e) {
      console.warn('Could not set color style', e)
    }
  }

  const setSize = (value) => {
    try {
      editor.mark('set size')
      editor.setStyleForSelectedShapes(DefaultSizeStyle, value)
      editor.setStyleForNextShapes(DefaultSizeStyle, value)
    } catch (e) {
      console.warn('Could not set size style', e)
    }
  }

  const setFont = (value) => {
    try {
      editor.mark('set font')
      editor.setStyleForSelectedShapes(DefaultFontStyle, value)
      editor.setStyleForNextShapes(DefaultFontStyle, value)
    } catch (e) {
      console.warn('Could not set font style', e)
    }
  }

  const setAlign = (value) => {
    try {
      editor.mark('set align')
      if (hasHorizontalAlign) {
        editor.setStyleForSelectedShapes(DefaultHorizontalAlignStyle, value)
        editor.setStyleForNextShapes(DefaultHorizontalAlignStyle, value)
      }
      if (hasTextAlign) {
        editor.setStyleForSelectedShapes(DefaultTextAlignStyle, value)
        editor.setStyleForNextShapes(DefaultTextAlignStyle, value)
      }
    } catch (e) {
      console.warn('Could not set align style', e)
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
