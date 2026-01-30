'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Download, Eye, Code } from 'lucide-react'
import { toast } from 'sonner'

interface CodePreviewModalProps {
    isOpen: boolean
    onClose: () => void
    files: Array<{
        path: string
        content: string
        language?: string
    }>
    onApprove?: () => void
    onReject?: () => void
    title?: string
}

export function CodePreviewModal({
    isOpen,
    onClose,
    files,
    onApprove,
    onReject,
    title = 'Preview Generated Code'
}: CodePreviewModalProps) {
    const [selectedFile, setSelectedFile] = useState(0)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (isOpen && files.length > 0) {
            setSelectedFile(0)
        }
    }, [isOpen, files])

    const handleCopy = async () => {
        if (!files[selectedFile]) return
        try {
            await navigator.clipboard.writeText(files[selectedFile].content)
            setCopied(true)
            toast.success('Copied to clipboard')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Failed to copy')
        }
    }

    const handleDownload = () => {
        if (!files[selectedFile]) return
        const blob = new Blob([files[selectedFile].content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = files[selectedFile].path.split('/').pop() || 'code.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('File downloaded')
    }

    const getLanguage = (path: string) => {
        const ext = path.split('.').pop()?.toLowerCase()
        const langMap: Record<string, string> = {
            tsx: 'typescript',
            ts: 'typescript',
            jsx: 'javascript',
            js: 'javascript',
            py: 'python',
            css: 'css',
            json: 'json',
            md: 'markdown',
            sql: 'sql',
            yaml: 'yaml',
            yml: 'yaml'
        }
        return langMap[ext || ''] || 'plaintext'
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-zinc-900 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col border border-white/10 shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                <Code className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">{title}</h2>
                                <p className="text-sm text-zinc-500">{files.length} file(s) generated</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* File List */}
                        <div className="w-64 border-r border-white/10 overflow-y-auto shrink-0">
                            <div className="p-2">
                                <p className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase">Files</p>
                                {files.map((file, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedFile(idx)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedFile === idx
                                                ? 'bg-orange-500/20 text-orange-400'
                                                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <span className="truncate block">{file.path}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Code Preview */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* File toolbar */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-zinc-950/50">
                                <span className="text-sm text-zinc-400 font-mono">{files[selectedFile]?.path}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Download className="w-3 h-3" />
                                        Download
                                    </button>
                                </div>
                            </div>

                            {/* Code content */}
                            <div className="flex-1 overflow-auto p-4 bg-zinc-950">
                                <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap">
                                    {files[selectedFile]?.content || 'No content'}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Footer with actions */}
                    {(onApprove || onReject) && (
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-zinc-950/50">
                            {onReject && (
                                <button
                                    onClick={() => {
                                        onReject()
                                        onClose()
                                    }}
                                    className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                                >
                                    Reject
                                </button>
                            )}
                            {onApprove && (
                                <button
                                    onClick={() => {
                                        onApprove()
                                        onClose()
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                                >
                                    <Check className="w-4 h-4" />
                                    Approve & Save
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default CodePreviewModal
