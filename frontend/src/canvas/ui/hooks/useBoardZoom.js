import { useEditor, useValue } from '@tldraw/tldraw'

export function useBoardZoom() {
  const editor = useEditor()
  const camera = useValue('camera', () => editor.getCamera(), [editor])
  const zoomPercent = Math.round(camera.z * 100)

  const zoomIn = () => editor.zoomIn()
  const zoomOut = () => editor.zoomOut()
  const resetZoom = () => editor.resetZoom()
  const fitToScreen = () => editor.zoomToFit()

  return {
    zoomPercent,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
  }
}
