import { useValue, DefaultColorStyle, DefaultSizeStyle, DefaultFontStyle, DefaultHorizontalAlignStyle, DefaultTextAlignStyle, DefaultDashStyle, DefaultFillStyle } from '@tldraw/tldraw'
import { useBoardEditorBridge } from './useBoardEditorBridge'
import { applySafeStyleToSelectedShapes, applySafeStyleToNextShapes } from '../../../features/boards/utils/applyBoardStyleToShapeType'

const EMPTY_STYLES = {
  hasSelection: false,
  currentColor: null, currentSize: null, currentFont: null, currentAlign: null,
  currentDash: null, currentFill: null, currentOpacity: null,
  showColor: false, showSize: false, showFont: false, showAlign: false,
  showDash: false, showFill: false, showOpacity: false,
  setColor: () => {}, setSize: () => {}, setFont: () => {}, setAlign: () => {},
  setDash: () => {}, setFill: () => {}, setOpacity: () => {},
}

export function useBoardStyles() {
  const bridge = useBoardEditorBridge()
  const editor = bridge?.editor ?? null

  const selectedShapes = useValue('selectedShapes', () => {
    if (!editor) return []
    try {
      if (typeof editor.getSelectedShapes === 'function') {
        return editor.getSelectedShapes().filter(Boolean)
      }
      if (typeof editor.getSelectedShapeIds === 'function' && typeof editor.getShape === 'function') {
        return editor.getSelectedShapeIds().map(id => editor.getShape(id)).filter(Boolean)
      }
    } catch (e) {
      console.warn('[useBoardStyles] Error resolving selected shapes', e)
    }
    return []
  }, [editor])

  const selectedShapeIds = useValue('selectedShapeIds', () => {
    if (!editor) return []
    try {
      if (typeof editor.getSelectedShapeIds === 'function') {
        return editor.getSelectedShapeIds()
      }
    } catch (e) {}
    return []
  }, [editor])

  if (!editor) {
    return EMPTY_STYLES
  }

  // Helper to compute a shared prop from the current selection
  // isRoot: true checks shape[key] instead of shape.props[key]
  const getSharedProp = (shapes, propKeys, isRoot = false) => {
    if (shapes.length === 0) return { value: null, isSupported: false }
    
    let hasSupportedShape = false
    let sharedValue = undefined
    
    for (const shape of shapes) {
      if (!shape) continue
      const targetObj = isRoot ? shape : shape.props
      if (targetObj) {
        const foundKey = propKeys.find(key => key in targetObj)
        if (foundKey) {
          hasSupportedShape = true
          const val = targetObj[foundKey]
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
  const dashProp = getSharedProp(selectedShapes, ['dash'])
  const fillProp = getSharedProp(selectedShapes, ['fill'])
  const opacityProp = getSharedProp(selectedShapes, ['opacity'], true)

  const currentColor = colorProp.value
  const currentSize = sizeProp.value
  const currentFont = fontProp.value
  const currentAlign = alignProp.value
  const currentDash = dashProp.value
  const currentFill = fillProp.value
  const currentOpacity = opacityProp.value

  const showColor = colorProp.isSupported
  const showSize = sizeProp.isSupported
  const showFont = fontProp.isSupported
  const showAlign = alignProp.isSupported
  const showDash = dashProp.isSupported
  const showFill = fillProp.isSupported
  // Opacity is typically supported on all shapes, but let's check
  const showOpacity = opacityProp.isSupported

  const setColor = (value) => {
    applySafeStyleToSelectedShapes(editor, 'color', value)
    applySafeStyleToNextShapes(editor, 'color', value)
  }
  const setSize = (value) => {
    applySafeStyleToSelectedShapes(editor, 'size', value)
    applySafeStyleToNextShapes(editor, 'size', value)
  }
  const setFont = (value) => {
    applySafeStyleToSelectedShapes(editor, 'font', value)
    applySafeStyleToNextShapes(editor, 'font', value)
  }
  const setDash = (value) => {
    applySafeStyleToSelectedShapes(editor, 'dash', value)
    applySafeStyleToNextShapes(editor, 'dash', value)
  }
  const setFill = (value) => {
    applySafeStyleToSelectedShapes(editor, 'fill', value)
    applySafeStyleToNextShapes(editor, 'fill', value)
  }
  const setAlign = (value) => {
    applySafeStyleToSelectedShapes(editor, 'align', value)
    applySafeStyleToNextShapes(editor, 'align', value)
  }

  const setOpacity = (value) => {
    if (!editor) return
    try {
      editor.mark('set opacity')
      if (typeof editor.setOpacityForSelectedShapes === 'function') {
        editor.setOpacityForSelectedShapes(value)
      }
      if (typeof editor.setOpacityForNextShapes === 'function') {
        editor.setOpacityForNextShapes(value)
      }
    } catch (e) {
      console.warn(`[useBoardStyles] Could not apply opacity: ${e.message}`)
    }
  }

  return {
    hasSelection: selectedShapeIds.length > 0,
    currentColor, currentSize, currentFont, currentAlign,
    currentDash, currentFill, currentOpacity,
    showColor, showSize, showFont, showAlign,
    showDash, showFill, showOpacity,
    setColor, setSize, setFont, setAlign,
    setDash, setFill, setOpacity
  }
}

