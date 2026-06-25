/**
 * useWebSocket.js — Custom hook quản lý WebSocket connection
 * - Auto-reconnect với exponential backoff
 * - Heartbeat PING/PONG mỗi 25s để giữ kết nối
 * - Trả về: { sendMessage, connectionStatus }
 */
import { useEffect, useRef, useCallback } from 'react'
import useStore from '../store/useStore'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

// Backoff config
const INITIAL_DELAY = 1000
const MAX_DELAY = 30000
const HEARTBEAT_INTERVAL = 25000

export function useWebSocket({ onMessage, boardId }) {
  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const heartbeatRef = useRef(null)
  const delayRef = useRef(INITIAL_DELAY)
  const isMounted = useRef(true)

  const setConnectionStatus = useStore(s => s.setConnectionStatus)

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    if (heartbeatRef.current) clearInterval(heartbeatRef.current)
  }, [])

  const startHeartbeat = useCallback((ws) => {
    heartbeatRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'PING' }))
      }
    }, HEARTBEAT_INTERVAL)
  }, [])

  const connect = useCallback(() => {
    if (!isMounted.current) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    if (!boardId) return // Đợi có boardId mới connect

    setConnectionStatus('connecting')

    try {
      const wsUrlBase = WS_URL.replace(/\/ws\/?$/, '').replace(/\/$/, '')
      const url = `${wsUrlBase}/ws/${boardId}`
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        if (!isMounted.current) return
        console.log('[WS] Connected ✅')
        setConnectionStatus('connected')
        delayRef.current = INITIAL_DELAY // reset backoff
        startHeartbeat(ws)
      }

      ws.onmessage = (event) => {
        if (!isMounted.current) return
        try {
          const msg = JSON.parse(event.data)
          if (msg.type !== 'PONG') {
            onMessage?.(msg)
          }
        } catch (e) {
          console.warn('[WS] Invalid message:', event.data)
        }
      }

      ws.onerror = (err) => {
        console.warn('[WS] Error:', err)
      }

      ws.onclose = () => {
        if (!isMounted.current) return
        console.log(`[WS] Disconnected. Reconnecting in ${delayRef.current}ms…`)
        clearTimers()
        setConnectionStatus('offline')

        reconnectTimerRef.current = setTimeout(() => {
          delayRef.current = Math.min(delayRef.current * 2, MAX_DELAY)
          connect()
        }, delayRef.current)
      }
    } catch (err) {
      console.error('[WS] Failed to create:', err)
      setConnectionStatus('offline')
    }
  }, [onMessage, setConnectionStatus, startHeartbeat, clearTimers, boardId])

  useEffect(() => {
    isMounted.current = true
    if (boardId) connect()
    return () => {
      isMounted.current = false
      clearTimers()
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount')
        wsRef.current = null
      }
    }
  }, [connect, clearTimers, boardId])

  const sendMessage = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
      return true
    }
    return false
  }, [])

  return { sendMessage }
}
