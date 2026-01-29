/**
 * PreviewWindow Component - Live preview iframe with hot reload
 */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Loader2, RefreshCw, ExternalLink, Smartphone, Monitor, Maximize2, Minimize2 } from 'lucide-react'

interface PreviewWindowProps {
    projectId: string
    onInspect?: (componentPath: string) => void
    className?: string
}

type DeviceType = 'desktop' | 'mobile' | 'tablet'

interface DeviceConfig {
    width: string
    height: string
    label: string
}

const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
    desktop: { width: '100%', height: '100%', label: 'Desktop' },
    tablet: { width: '768px', height: '1024px', label: 'Tablet' },
    mobile: { width: '375px', height: '667px', label: 'Mobile' }
}

export const PreviewWindow = ({
    projectId,
    onInspect,
    className = ''
}: PreviewWindowProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const [device, setDevice] = useState<DeviceType>('desktop')
    const [inspectMode, setInspectMode] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    // WebSocket handlers
    const handleFileChange = useCallback((data: { path: string; content: string }) => {
        // Send HMR update to iframe
        iframeRef.current?.contentWindow?.postMessage({
            type: 'HMR_UPDATE',
            path: data.path,
            content: data.content
        }, '*')
    }, [])

    const handleBuildComplete = useCallback(() => {
        // Force full reload
        iframeRef.current?.contentWindow?.location.reload()
    }, [])

    const handleBuildError = useCallback((error: { message: string; stack: string }) => {
        setError(error.message)
    }, [])

    // WebSocket connection
    const { isConnected } = useWebSocket({
        projectId,
        onFileChange: handleFileChange,
        onBuildComplete: handleBuildComplete,
        onBuildError: handleBuildError
    })

    // Initialize preview
    useEffect(() => {
        const initPreview = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`${apiUrl}/api/preview/init`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ project_id: projectId })
                })

                const data = await response.json()

                if (data.url) {
                    setPreviewUrl(data.url)
                } else if (data.status === 'no_project') {
                    setError('Project not found. Create files first.')
                } else if (data.error) {
                    setError(data.error)
                }
            } catch (err) {
                setError('Failed to initialize preview')
                console.error('Preview init error:', err)
            } finally {
                setIsLoading(false)
            }
        }

        if (projectId) {
            initPreview()
        }

        // Cleanup on unmount
        return () => {
            fetch(`${apiUrl}/api/preview/${projectId}`, { method: 'DELETE' })
                .catch(console.error)
        }
    }, [projectId, apiUrl])

    // Inspect mode injection
    useEffect(() => {
        if (!iframeRef.current || !inspectMode) return

        const injectInspectScript = () => {
            const iframeDoc = iframeRef.current?.contentDocument
            if (!iframeDoc) return

            const script = iframeDoc.createElement('script')
            script.textContent = `
        (function() {
          let overlay = null;
          
          document.addEventListener('click', (e) => {
            if (!window.__inspectMode) return;
            e.preventDefault();
            e.stopPropagation();
            
            const element = e.target;
            const componentPath = element.dataset?.componentPath || 
              element.closest('[data-component-path]')?.dataset?.componentPath;
            
            if (componentPath) {
              window.parent.postMessage({
                type: 'INSPECT_CLICK',
                componentPath
              }, '*');
            }
          }, true);

          document.addEventListener('mouseover', (e) => {
            if (!window.__inspectMode) return;
            const element = e.target;
            if (element.dataset?.componentPath || element.closest('[data-component-path]')) {
              element.style.outline = '2px solid #3B82F6';
              element.style.outlineOffset = '2px';
            }
          });

          document.addEventListener('mouseout', (e) => {
            e.target.style.outline = '';
            e.target.style.outlineOffset = '';
          });

          window.__inspectMode = true;
        })();
      `
            iframeDoc.body.appendChild(script)
        }

        iframeRef.current.addEventListener('load', injectInspectScript)
        return () => {
            iframeRef.current?.removeEventListener('load', injectInspectScript)
        }
    }, [inspectMode])

    // Listen for inspect clicks
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'INSPECT_CLICK') {
                onInspect?.(event.data.componentPath)
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [onInspect])

    // Handlers
    const handleRefresh = () => {
        iframeRef.current?.contentWindow?.location.reload()
    }

    const handleOpenInNewTab = () => {
        if (previewUrl) {
            window.open(previewUrl, '_blank')
        }
    }

    const deviceConfig = DEVICE_CONFIGS[device]

    return (
        <div className={`flex flex-col h-full bg-gray-100 ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm">
                <div className="flex items-center gap-2">
                    {/* Device Selector */}
                    {Object.entries(DEVICE_CONFIGS).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setDevice(key as DeviceType)}
                            className={`p-2 rounded transition-colors ${device === key
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'hover:bg-gray-100 text-gray-600'
                                }`}
                            title={config.label}
                        >
                            {key === 'desktop' && <Monitor className="w-4 h-4" />}
                            {key === 'tablet' && <Monitor className="w-4 h-4" />}
                            {key === 'mobile' && <Smartphone className="w-4 h-4" />}
                        </button>
                    ))}

                    <div className="w-px h-6 bg-gray-300 mx-2" />

                    {/* Inspect Mode Toggle */}
                    <button
                        onClick={() => setInspectMode(!inspectMode)}
                        className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${inspectMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                    >
                        {inspectMode ? '🔍 Inspect ON' : '🔍 Inspect'}
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Connection Status */}
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                        {isConnected ? 'Live' : 'Disconnected'}
                    </span>

                    {/* Actions */}
                    <button
                        onClick={handleRefresh}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>

                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Fullscreen"
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-4 h-4 text-gray-600" />
                        ) : (
                            <Maximize2 className="w-4 h-4 text-gray-600" />
                        )}
                    </button>

                    <button
                        onClick={handleOpenInNewTab}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Open in new tab"
                        disabled={!previewUrl}
                    >
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-600">Initializing preview...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center gap-3 text-center max-w-md">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : previewUrl ? (
                    <div
                        className={`bg-white shadow-2xl rounded-lg overflow-hidden transition-all ${device === 'desktop' ? 'w-full h-full' : ''
                            }`}
                        style={device !== 'desktop' ? {
                            width: deviceConfig.width,
                            height: deviceConfig.height,
                            maxHeight: '100%'
                        } : undefined}
                    >
                        <iframe
                            ref={iframeRef}
                            src={previewUrl}
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                            title="Preview"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Monitor className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">No preview available</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PreviewWindow
