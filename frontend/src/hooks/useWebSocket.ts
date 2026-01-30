'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

interface WebSocketMessage {
  type: string
  [key: string]: any
}

interface UseWebSocketOptions {
  url?: string
  projectId?: string
  onFileChange?: (data: { path: string; content: string }) => void
  onBuildComplete?: () => void
  onBuildError?: (error: { message: string; stack: string }) => void
  onMessage?: (message: WebSocketMessage) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
    projectId,
    onFileChange,
    onBuildComplete,
    onBuildError,
    onMessage,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const wsUrl = projectId ? `${url}?project_id=${projectId}` : url

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setReconnectAttempts(0)
        console.log('✅ WebSocket connected')
        toast.success('Connected to server', { duration: 2000 })
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage

          // Handle specific message types
          switch (data.type) {
            case 'FILE_CHANGE':
              onFileChange?.(data as any)
              break
            case 'BUILD_COMPLETE':
              onBuildComplete?.()
              toast.success('Build complete!')
              break
            case 'BUILD_ERROR':
              onBuildError?.(data as any)
              toast.error(`Build error: ${data.message}`)
              break
            case 'TASK_UPDATE':
              toast.info(`Task ${data.taskId}: ${data.status}`)
              break
            default:
              onMessage?.(data)
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        wsRef.current = null

        if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
          console.log(`🔄 Reconnecting... (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)

          // Exponential backoff
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttempts), 30000)

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, delay)
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          toast.error('Connection lost. Please refresh the page.')
        }
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }
  }, [url, projectId, onFileChange, onBuildComplete, onBuildError, onMessage, reconnectInterval, maxReconnectAttempts, reconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect')
      wsRef.current = null
    }
    setIsConnected(false)
    setReconnectAttempts(0)
  }, [])

  const send = useCallback((data: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  // Visibility change handler - reconnect when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected) {
        connect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [connect, isConnected])

  return {
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
    send
  }
}
