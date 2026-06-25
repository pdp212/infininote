import React from 'react'
import { DefaultStylePanel } from '@tldraw/tldraw'
import { useBoardSelection } from '../hooks/useBoardSelection'

export default function RightInspectorPanel() {
  const { hasSelection } = useBoardSelection()

  // Requirement: Ưu tiên ẩn panel khi không có selection
  if (!hasSelection) {
    return null
  }

  return (
    <div className="infininote-panel board-right-inspector">
      <DefaultStylePanel />
    </div>
  )
}
