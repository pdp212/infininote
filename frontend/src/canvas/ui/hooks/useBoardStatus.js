import useStore from '../../../store/useStore'

export function useBoardStatus() {
  const saveStatus = useStore(s => s.saveStatus)
  const connectionStatus = useStore(s => s.connectionStatus)

  return {
    saveStatus,
    connectionStatus,
  }
}
