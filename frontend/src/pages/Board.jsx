import { useParams, Navigate } from 'react-router-dom'
import InfiniCanvas from '../canvas/InfiniCanvas'
import useStore from '../store/useStore'

function LoadingOverlay() {
  const isLoading = useStore(s => s.isLoading)
  if (!isLoading) return null
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
