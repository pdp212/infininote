import React from 'react'
import TopLeftCluster from './shell/TopLeftCluster'
import TopRightStatusCluster from './shell/TopRightStatusCluster'
import RightInspectorPanel from './shell/RightInspectorPanel'
import BottomLeftZoomDock from './shell/BottomLeftZoomDock'
import './board-ui.css'

export default function BoardScreen() {
  return (
    <div className="infininote-board-shell">
      <TopLeftCluster />
      <TopRightStatusCluster />
      <RightInspectorPanel />
      <BottomLeftZoomDock />
    </div>
  )
}

