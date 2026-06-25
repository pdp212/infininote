import { useBoardEditorBridge } from './useBoardEditorBridge'

export function useCurrentTool() {
  const { currentTool, isReady } = useBoardEditorBridge()

  const isToolActive = (toolId) => isReady && currentTool === toolId

  return {
    currentToolId: currentTool,
    isToolActive,
  }
}

