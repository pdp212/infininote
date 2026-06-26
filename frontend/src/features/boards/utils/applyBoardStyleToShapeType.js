/**
 * applyBoardStyleToShapeType.js
 * Maps generic UI styles to safe Tldraw styles/props based on shape type.
 */

import { DefaultColorStyle, DefaultSizeStyle, DefaultFontStyle, DefaultHorizontalAlignStyle, DefaultTextAlignStyle, DefaultDashStyle, DefaultFillStyle } from '@tldraw/tldraw'

/**
 * Safely applies a generic UI style to the editor's selected shapes.
 */
export function applySafeStyleToSelectedShapes(editor, styleType, value) {
  if (!editor) return
  try {
    editor.mark('set safe style')
    
    // Instead of using editor.setStyleForSelectedShapes directly for everything,
    // we use editor's API but ensure we don't trigger validation errors.
    // Tldraw v2 `setStyleForSelectedShapes` internally filters by what shape supports it,
    // BUT we need to map `align` correctly.
    
    if (styleType === 'align') {
      editor.setStyleForSelectedShapes(DefaultHorizontalAlignStyle, value)
      editor.setStyleForSelectedShapes(DefaultTextAlignStyle, value)
    } else if (styleType === 'color') {
      editor.setStyleForSelectedShapes(DefaultColorStyle, value)
    } else if (styleType === 'size') {
      editor.setStyleForSelectedShapes(DefaultSizeStyle, value)
    } else if (styleType === 'font') {
      editor.setStyleForSelectedShapes(DefaultFontStyle, value)
    } else if (styleType === 'dash') {
      editor.setStyleForSelectedShapes(DefaultDashStyle, value)
    } else if (styleType === 'fill') {
      editor.setStyleForSelectedShapes(DefaultFillStyle, value)
    }
  } catch (e) {
    console.warn(`[applyBoardStyle] Failed to apply style: ${e.message}`)
  }
}

/**
 * Safely applies a generic UI style to the next shapes.
 */
export function applySafeStyleToNextShapes(editor, styleType, value) {
  if (!editor) return
  try {
    if (styleType === 'align') {
      editor.setStyleForNextShapes(DefaultHorizontalAlignStyle, value)
      editor.setStyleForNextShapes(DefaultTextAlignStyle, value)
    } else if (styleType === 'color') {
      editor.setStyleForNextShapes(DefaultColorStyle, value)
    } else if (styleType === 'size') {
      editor.setStyleForNextShapes(DefaultSizeStyle, value)
    } else if (styleType === 'font') {
      editor.setStyleForNextShapes(DefaultFontStyle, value)
    } else if (styleType === 'dash') {
      editor.setStyleForNextShapes(DefaultDashStyle, value)
    } else if (styleType === 'fill') {
      editor.setStyleForNextShapes(DefaultFillStyle, value)
    }

    // Phase 10: Save to global localStorage
    try {
      const globalStyles = JSON.parse(localStorage.getItem('infininote-global-styles') || '{}')
      globalStyles[styleType] = value
      localStorage.setItem('infininote-global-styles', JSON.stringify(globalStyles))
    } catch (_) {}

  } catch (e) {
    console.warn(`[applyBoardStyle] Failed to apply next style: ${e.message}`)
  }
}
