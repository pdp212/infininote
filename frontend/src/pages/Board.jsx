import { useParams, Navigate } from 'react-router-dom'
import InfiniCanvas from '../canvas/InfiniCanvas'
import useStore from '../store/useStore'

/**
 * Board loading overlay — driven by boardPhase state machine.
 * Shows while phase is not 'ready' or 'error'.
 * 'error' renders inline in InfiniCanvas itself.
 */
function LoadingOverlay() {
  const boardPhase = useStore(s => s.boardPhase)
  if (boardPhase === 'ready' || boardPhase === 'error') return null
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p className="loading-text">Đang tải canvas của bạn…</p>
    </div>
  )
}

export default function Board() {
  const { id } = useParams()

  if (!id) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="board-container">
      <InfiniCanvas boardId={id} />
      <LoadingOverlay />
    </div>
  )
}
