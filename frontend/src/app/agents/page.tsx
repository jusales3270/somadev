"use client";

import { useEffect, useState, useRef } from 'react';
import { Terminal, RefreshCcw, Power } from 'lucide-react';

interface LogEntry {
    id: number;
    timestamp: string;
    agent: string;
    message: string;
}

export default function AgentsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<string | 'ALL'>('ALL');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Polling logs
    useEffect(() => {
        const fetchLogs = () => {
            fetch('http://localhost:8000/logs')
                .then(res => res.json())
                .then(data => {
                    setLogs(data);
                })
                .catch(err => console.error("Error fetching logs:", err));
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 2000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const filteredLogs = selectedAgent === 'ALL'
        ? logs
        : logs.filter(log => log.agent === selectedAgent);

    const agents = ['ALL', 'SomaFront', 'SomaBack', 'Orchestrator'];

    return (
        <div className="flex h-full bg-zinc-950 text-zinc-300 font-mono overflow-hidden">

            {/* Sidebar de Agentes */}
            <div className="w-64 border-r border-white/10 bg-zinc-900/30 flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                        <Terminal size={16} /> Active Agents
                    </h2>
                </div>
                <div className="flex-1 p-2 space-y-1">
                    {agents.map(agent => (
                        <button
                            key={agent}
                            onClick={() => setSelectedAgent(agent)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between group ${selectedAgent === agent
                                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                    : 'hover:bg-white/5 text-zinc-400'
                                }`}
                        >
                            <span>{agent}</span>
                            {selectedAgent === agent && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                        </button>
                    ))}
                </div>

                {/* Status Footer */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-2 text-xs text-green-500">
                        <Power size={12} />
                        <span>System Online</span>
                    </div>
                </div>
            </div>

            {/* Terminal Main Area */}
            <div className="flex-1 flex flex-col bg-[#0c0c0c] relative">
                {/* Header */}
                <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-zinc-900/20">
                    <span className="text-xs text-zinc-500">user@somadev:~/logs/agents $</span>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                </div>

                {/* Logs Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm"
                >
                    {filteredLogs.length === 0 && (
                        <div className="text-zinc-700 italic text-center mt-20">Waiting for agent activity...</div>
                    )}

                    {filteredLogs.map((log, index) => (
                        <div key={index} className="flex gap-3 hover:bg-white/5 p-1 -mx-2 px-2 rounded">
                            <span className="text-zinc-600 min-w-[80px] select-none">{log.timestamp}</span>
                            <span className={`font-bold min-w-[100px] ${log.agent === 'SomaFront' ? 'text-blue-400' :
                                    log.agent === 'SomaBack' ? 'text-purple-400' :
                                        'text-orange-500'
                                }`}>
                                [{log.agent}]
                            </span>
                            <span className="text-zinc-300 break-all">{log.message}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
