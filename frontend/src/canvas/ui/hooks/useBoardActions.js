import { useBoardEditorBridge } from './useBoardEditorBridge'
import { useNavigate } from 'react-router-dom'

export function useBoardActions() {
  const bridge = useBoardEditorBridge()
  const navigate = useNavigate()

  return {
    ...bridge,
    goToDashboard: () => navigate('/'),
  }
}

