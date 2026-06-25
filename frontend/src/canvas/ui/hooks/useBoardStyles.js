import { useValue, DefaultColorStyle, DefaultSizeStyle, DefaultFontStyle, DefaultHorizontalAlignStyle, DefaultTextAlignStyle } from '@tldraw/tldraw'
import { useBoardEditorBridge } from './useBoardEditorBridge'

const EMPTY_STYLES = {
  hasSelection: false,
  currentColor: null, currentSize: null, currentFont: null, currentAlign: null,
  canEditColor: false, canEditSize: false, canEditFont: false, canEditAlign: false,
  setColor: () => {}, setSize: () => {}, setFont: () => {}, setAlign: () => {},
}

export function useBoardStyles() {
  const bridge = useBoardEditorBridge()
  const editor = bridge?.editor

  const selectedShapes = useValue('selectedShapes', () => {
    if (!editor) return []
    if (typeof editor.getSelectedShapes === 'function') {
      return editor.getSelectedShapes()
    }
    if (typeof editor.getSelectedShapeIds === 'function' && typeof editor.getShape === 'function') {
      return editor.getSelectedShapeIds().map(id => editor.getShape(id)).filter(Boolean)
    }
    return []
  }, [editor])

  const selectedShapeIds = useValue('selectedShapeIds', () => {
    if (!editor) return []
    if (typeof editor.getSelectedShapeIds === 'function') {
      return editor.getSelectedShapeIds()
    }
    return []
  }, [editor])

  if (!editor) {
    return EMPTY_STYLES
  }

  // Helper to compute a shared style from the current selection
  const getSharedProp = (shapes, propKeys) => {
    if (shapes.length === 0) return { value: null, isSupported: false }
    
    let hasSupportedShape = false
    let sharedValue = undefined
    
    for (const shape of shapes) {
      if (shape && shape.props) {
        // Check if any of the provided prop keys exist on the shape
        const foundKey = propKeys.find(key => key in shape.props)
        if (foundKey) {
          hasSupportedShape = true
          const val = shape.props[foundKey]
          if (sharedValue === undefined) {
            sharedValue = val
          } else if (sharedValue !== val) {
            return { value: 'mixed', isSupported: true }
          }
        }
      }
    }
    
    return { value: hasSupportedShape ? sharedValue : null, isSupported: hasSupportedShape }
  }

  const colorProp = getSharedProp(selectedShapes, ['color'])
  const sizeProp = getSharedProp(selectedShapes, ['size'])
  const fontProp = getSharedProp(selectedShapes, ['font'])
  const alignProp = getSharedProp(selectedShapes, ['align', 'textAlign', 'horizontalAlign'])

  const currentColor = colorProp.value
  const currentSize = sizeProp.value
  const currentFont = fontProp.value
  const currentAlign = alignProp.value

  const canEditColor = colorProp.isSupported
  const canEditSize = sizeProp.isSupported
  const canEditFont = fontProp.isSupported
  const canEditAlign = alignProp.isSupported

  const applyStyle = (styleType, value) => {
    if (!editor) return
    try {
      editor.mark('set style')
      if (typeof editor.setStyleForSelectedShapes === 'function') {
        editor.setStyleForSelectedShapes(styleType, value)
      }
      if (typeof editor.setStyleForNextShapes === 'function') {
        editor.setStyleForNextShapes(styleType, value)
      }
    } catch (e) {
      console.warn(`[useBoardStyles] Could not apply style: ${e.message}`)
    }
  }

  const setColor = (value) => applyStyle(DefaultColorStyle, value)
  const setSize = (value) => applyStyle(DefaultSizeStyle, value)
  const setFont = (value) => applyStyle(DefaultFontStyle, value)
  
  const setAlign = (value) => {
    // Attempt to set both, Tldraw ignores what doesn't apply
    applyStyle(DefaultHorizontalAlignStyle, value)
    applyStyle(DefaultTextAlignStyle, value)
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
