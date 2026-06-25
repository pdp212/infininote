import { useEditor, useValue } from '@tldraw/tldraw'

export function useCurrentTool() {
  const editor = useEditor()
  const currentToolId = useValue('current tool id', () => editor.getCurrentToolId(), [editor])

  const isToolActive = (toolId) => currentToolId === toolId

  return {
    currentToolId,
    isToolActive,
  }
}
