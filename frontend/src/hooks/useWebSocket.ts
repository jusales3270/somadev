/**
 * useWebSocket Hook - Socket.IO connection for real-time preview updates
 */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Types
interface FileChangeEvent {
  path: string
  content: string
  timestamp?: number
}

interface BuildErrorEvent {
  message: string
  stack: string
}

interface UseWebSocketOptions {
  projectId: string
  onFileChange?: (data: FileChangeEvent) => void
  onBuildComplete?: () => void
  onBuildError?: (error: BuildErrorEvent) => void
}

interface UseWebSocketReturn {
  isConnected: boolean
  joinPreview: () => void
  leavePreview: () => void
}

// Socket.IO client (dynamically imported to avoid SSR issues)
let io: any = null

export const useWebSocket = ({
  projectId,
  onFileChange,
  onBuildComplete,
  onBuildError
}: UseWebSocketOptions): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<any>(null)
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000'

  // Initialize socket connection
  useEffect(() => {
    const initSocket = async () => {
      if (!io) {
        const socketIo = await import('socket.io-client')
        io = socketIo.io
      }

      socketRef.current = io(wsUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        timeout: 20000
      })

      socketRef.current.on('connect', () => {
        console.log('✅ WebSocket connected')
        setIsConnected(true)
      })

      socketRef.current.on('disconnect', () => {
        console.log('❌ WebSocket disconnected')
        setIsConnected(false)
      })

      socketRef.current.on('connect_error', (err: Error) => {
        console.error('WebSocket connection error:', err.message)
        setIsConnected(false)
      })

      // Event handlers
      socketRef.current.on('file_changed', (data: FileChangeEvent) => {
        console.log('🔥 Hot reload:', data.path)
        onFileChange?.(data)
      })

      socketRef.current.on('build_complete', () => {
        console.log('✅ Build complete')
        onBuildComplete?.()
      })

      socketRef.current.on('build_error', (error: BuildErrorEvent) => {
        console.error('❌ Build error:', error.message)
        onBuildError?.(error)
      })

      socketRef.current.on('joined', (data: { room: string }) => {
        console.log('👤 Joined room:', data.room)
      })
    }

    initSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [wsUrl, onFileChange, onBuildComplete, onBuildError])

  // Join preview room
  const joinPreview = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_preview', { project_id: projectId })
    }
  }, [projectId, isConnected])

  // Leave preview room
  const leavePreview = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_preview', { project_id: projectId })
    }
  }, [projectId, isConnected])

  // Auto-join when connected
  useEffect(() => {
    if (isConnected && projectId) {
      joinPreview()
    }
    
    return () => {
      if (isConnected && projectId) {
        leavePreview()
      }
    }
  }, [isConnected, projectId, joinPreview, leavePreview])

  return {
    isConnected,
    joinPreview,
    leavePreview
  }
}

export default useWebSocket
