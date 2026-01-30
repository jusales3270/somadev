'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Play, Eye, Code, ExternalLink, Loader2 } from 'lucide-react'

// Dynamic import to avoid SSR issues with WebSocket
const PreviewWindow = dynamic(
    () => import('@/components/preview/PreviewWindow'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }
)

export default function CanvasPage() {
    const [projectId, setProjectId] = useState('somadev-generated')
    const [showPreview, setShowPreview] = useState(false)
    const [previewUrl, setPreviewUrl] = useState('http://localhost:3001')
    const [showCodePanel, setShowCodePanel] = useState(false)

    const handleStartPreview = async () => {
        setShowPreview(true)
    }

    const handleInspectComponent = (path: string) => {
        console.log('Inspect component:', path)
        setShowCodePanel(true)
    }

    return (
        <div className="h-screen flex flex-col bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Eye className="w-5 h-5 text-orange-500" />
                        Canvas - Live Preview
                    </h1>
                    <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                        {projectId}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {!showPreview ? (
                        <button
                            onClick={handleStartPreview}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
                        >
                            <Play className="w-4 h-4" />
                            Start Preview
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowCodePanel(!showCodePanel)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${showCodePanel
                                        ? 'bg-orange-500/20 text-orange-400'
                                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <Code className="w-4 h-4" />
                                Code
                            </button>
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-zinc-900 text-zinc-400 rounded-lg hover:text-white transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open
                            </a>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Preview Panel */}
                <div className={`flex-1 ${showCodePanel ? 'w-1/2' : 'w-full'} transition-all`}>
                    {showPreview ? (
                        <PreviewWindow
                            projectId={projectId}
                            onInspect={handleInspectComponent}
                            className="h-full"
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mb-6 animate-pulse">
                                <Eye className="w-12 h-12 text-orange-500/60" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Preview Your Project</h2>
                            <p className="text-zinc-500 max-w-md mb-8">
                                Click "Start Preview" to see your generated application running in real-time.
                                Changes made by agents will automatically appear here.
                            </p>
                            <div className="grid grid-cols-3 gap-4 text-center text-sm text-zinc-500">
                                <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <span className="text-green-500">1</span>
                                    </div>
                                    <p>Agents generate code</p>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <span className="text-blue-500">2</span>
                                    </div>
                                    <p>Hot reload applies changes</p>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                        <span className="text-orange-500">3</span>
                                    </div>
                                    <p>See results instantly</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Code Panel */}
                {showCodePanel && (
                    <div className="w-1/2 border-l border-white/10 bg-zinc-900 overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <h3 className="text-sm font-medium text-white">Generated Code</h3>
                            <p className="text-xs text-zinc-500 mt-1">Click components in preview to inspect</p>
                        </div>
                        <div className="p-4 h-full overflow-auto">
                            <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap">
                                {`// Select a component in the preview to see its code here
// Use the Inspect mode in the preview toolbar`}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
