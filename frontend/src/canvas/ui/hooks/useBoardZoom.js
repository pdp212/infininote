import { useBoardEditorBridge } from './useBoardEditorBridge'

export function useBoardZoom() {
  const bridge = useBoardEditorBridge()

  return {
    zoomPercent: bridge.zoomPercent,
    zoomIn: bridge.zoomIn,
    zoomOut: bridge.zoomOut,
    resetZoom: bridge.resetZoom,
    fitToScreen: bridge.fitToScreen || bridge.resetZoom,
  }
}

