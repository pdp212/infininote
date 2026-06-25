import React from 'react'
import TopLeftCluster from './shell/TopLeftCluster'
import RightSideCluster from './shell/RightSideCluster'
import BottomLeftZoomDock from './shell/BottomLeftZoomDock'
import './board-ui.css'

export default function BoardScreen() {
  return (
    <div className="infininote-board-shell">
      <TopLeftCluster />
      <RightSideCluster />
      <BottomLeftZoomDock />
    </div>
  )
}

