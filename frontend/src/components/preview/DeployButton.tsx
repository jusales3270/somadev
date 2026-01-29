/**
 * DeployButton Component - One-click deploy to production
 */
'use client'

import { useState } from 'react'
import { Rocket, Loader2, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react'

interface DeployButtonProps {
    projectId: string
    provider?: 'vercel' | 'netlify' | 'railway'
    className?: string
}

interface DeployResult {
    url: string
    deployment_id: string
    status: string
    logs_url: string
}

export const DeployButton = ({
    projectId,
    provider = 'vercel',
    className = ''
}: DeployButtonProps) => {
    const [isDeploying, setIsDeploying] = useState(false)
    const [result, setResult] = useState<DeployResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    const handleDeploy = async () => {
        setIsDeploying(true)
        setError(null)
        setResult(null)

        try {
            const response = await fetch(`${apiUrl}/api/deploy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    provider
                })
            })

            const data = await response.json()

            if (response.ok) {
                setResult(data)
            } else {
                setError(data.detail || 'Deployment failed')
            }
        } catch (err) {
            setError('Failed to connect to server')
            console.error('Deploy error:', err)
        } finally {
            setIsDeploying(false)
        }
    }

    // Success state
    if (result) {
        return (
            <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Deployed successfully!</span>
                </div>
                <div className="space-y-2 text-sm">
                    <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-700 hover:text-green-800"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {result.url}
                    </a>
                    <button
                        onClick={() => setResult(null)}
                        className="text-gray-500 hover:text-gray-700 underline"
                    >
                        Deploy again
                    </button>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">Deployment failed</span>
                </div>
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <button
                    onClick={() => setError(null)}
                    className="text-sm text-red-700 hover:text-red-800 underline"
                >
                    Try again
                </button>
            </div>
        )
    }

    // Default state
    return (
        <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className={`
        flex items-center justify-center gap-2 px-6 py-3 
        bg-gradient-to-r from-purple-600 to-blue-600 
        text-white font-medium rounded-lg 
        hover:from-purple-700 hover:to-blue-700 
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all shadow-lg hover:shadow-xl
        ${className}
      `}
        >
            {isDeploying ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Deploying to {provider}...</span>
                </>
            ) : (
                <>
                    <Rocket className="w-5 h-5" />
                    <span>Deploy to Production</span>
                </>
            )}
        </button>
    )
}

export default DeployButton
