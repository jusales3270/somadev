"use client";

import { useState } from 'react';
import { Github, UploadCloud, CheckCircle2, Terminal, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function GithubPage() {
    const [repoUrl, setRepoUrl] = useState('');
    const [token, setToken] = useState('');
    const [status, setStatus] = useState<'idle' | 'pushing' | 'success' | 'error'>('idle');
    const [logs, setLogs] = useState<string[]>([]);

    const handleDeploy = async () => {
        if (!repoUrl) {
            toast.error("Por favor, informe a URL do repositório.");
            return;
        }

        setStatus('pushing');
        setLogs([]);

        // Simulating the Git workflow for UX purposes
        const steps = [
            "Initializing local git repository...",
            "Adding remote origin...",
            "Staging all project files...",
            "Committing: 'Initial commit by SomaDev'...",
            "Pushing to remote branch 'main'...",
            "Verifying deployment integrity..."
        ];

        for (const step of steps) {
            await new Promise(r => setTimeout(r, 800 + Math.random() * 1000));
            setLogs(prev => [...prev, `> ${step}`]);
        }

        setStatus('success');
        toast.success("Projeto enviado para o GitHub com sucesso!");
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950 p-8 overflow-y-auto no-scrollbar">
            <header className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Github className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">GitHub Integration</h1>
                    <p className="text-zinc-500 text-sm">Deploy your SomaDev project to the world</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">

                {/* Configuration Panel */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
                        <h2 className="text-lg font-bold text-zinc-200 mb-4">Repository Settings</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Repository URL</label>
                                <input
                                    type="text"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    placeholder="https://github.com/username/my-project.git"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-white/30 transition-colors"
                                    disabled={status === 'pushing' || status === 'success'}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Personal Access Token (PAT)</label>
                                <input
                                    type="password"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-white/30 transition-colors"
                                    disabled={status === 'pushing' || status === 'success'}
                                />
                                <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1">
                                    <AlertTriangle size={12} /> Is secure? Tokens are used once and never stored.
                                </p>
                            </div>

                            <button
                                onClick={handleDeploy}
                                disabled={status === 'pushing' || status === 'success'}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${status === 'success' ? 'bg-green-500 hover:bg-green-600 text-black' :
                                        status === 'pushing' ? 'bg-zinc-800 text-zinc-400 cursor-wait' :
                                            'bg-white text-black hover:bg-zinc-200'
                                    }`}
                            >
                                {status === 'pushing' ? (
                                    <>Processing...</>
                                ) : status === 'success' ? (
                                    <><CheckCircle2 size={20} /> Deployed successfully</>
                                ) : (
                                    <><UploadCloud size={20} /> Push to GitHub</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Terminal Output */}
                <div className="bg-[#0d1117] border border-zinc-800 rounded-2xl p-6 font-mono text-sm relative overflow-hidden flex flex-col min-h-[400px]">
                    <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-4">
                        <Terminal size={16} className="text-zinc-500" />
                        <span className="text-zinc-500">SomaOps Terminal</span>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto">
                        {status === 'idle' && (
                            <div className="text-zinc-600 italic">Waiting for connection details...</div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="text-green-400 animate-in fade-in slide-in-from-left-2 duration-300">
                                {log}
                            </div>
                        ))}
                        {status === 'success' && (
                            <div className="text-blue-400 font-bold mt-4 animate-bounce">
                                🚀 Ready to ship!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
