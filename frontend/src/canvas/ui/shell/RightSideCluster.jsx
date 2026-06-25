import React from 'react'
import TopRightStatusCluster from './TopRightStatusCluster'
import RightInspectorPanel from './RightInspectorPanel'

export default function RightSideCluster() {
  return (
    <div className="board-right-side-cluster">
      <TopRightStatusCluster />
      <RightInspectorPanel />
    </div>
  )
}
