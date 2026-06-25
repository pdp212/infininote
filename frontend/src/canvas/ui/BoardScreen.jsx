import React from 'react'
import {
  DefaultMainMenu,
  DefaultPageMenu,
  DefaultQuickActions,
  DefaultToolbar,
  DefaultStylePanel,
  DefaultZoomMenu
} from '@tldraw/tldraw'
import { StatusBadge, SaveIndicator } from '../../components/Header'
import { useNavigate } from 'react-router-dom'
import './board-ui.css'

export function TopLeftBoardBar() {
  return (
    <div className="floating-panel top-left-board-bar">
      <div className="panel-shell flex-row">
        <DefaultMainMenu />
        <div className="divider" />
        <DefaultPageMenu />
        <div className="divider" />
        <DefaultQuickActions />
      </div>
    </div>
  )
}

export function LeftToolbar() {
  return (
    <div className="floating-panel left-toolbar">
      <div className="panel-shell vertical-tldraw-toolbar">
        <DefaultToolbar />
      </div>
    </div>
  )
}

export function StatusCluster() {
  const navigate = useNavigate()
  return (
    <div className="floating-panel status-cluster">
      <div className="panel-shell flex-row">
        <SaveIndicator />
        <StatusBadge />
        <div className="divider" />
        <button className="back-to-dashboard-btn" onClick={() => navigate('/')}>
          Quay lại
        </button>
      </div>
    </div>
  )
}

export function InspectorPanel() {
  return (
    <div className="floating-panel inspector-panel">
      <div className="panel-shell">
        <DefaultStylePanel />
      </div>
    </div>
  )
}

export function ZoomDock() {
  return (
    <div className="floating-panel zoom-dock">
      <div className="panel-shell">
        <DefaultZoomMenu />
      </div>
    </div>
  )
}

export default function BoardScreen() {
  return (
    <div className="board-screen-overlay">
      <TopLeftBoardBar />
      <LeftToolbar />
      <StatusCluster />
      <InspectorPanel />
      <ZoomDock />
    </div>
  )
}
