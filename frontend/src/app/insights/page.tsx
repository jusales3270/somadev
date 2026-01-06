"use client";

import { useEffect, useState } from 'react';
import {
    LineChart,
    Activity,
    CheckCircle2,
    AlertCircle,
    Clock,
    Zap,
    Users,
    TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface Task {
    id: number;
    title: string;
    description: string;
    agent: string;
    status: 'To Do' | 'In Progress' | 'Done';
}

interface LogEntry {
    id: number;
    timestamp: string;
    agent: string;
    message: string;
}

export default function InsightsPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, logsRes] = await Promise.all([
                    fetch('http://localhost:8000/tasks'),
                    fetch('http://localhost:8000/logs')
                ]);

                if (tasksRes.ok) setTasks(await tasksRes.json());
                if (logsRes.ok) setLogs(await logsRes.json());

            } catch (error) {
                toast.error("Erro ao carregar dados de insights.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Live update
        return () => clearInterval(interval);
    }, []);

    // Analytics Calculation
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Agent Distribution
    const agentCounts: Record<string, number> = {};
    tasks.forEach(t => {
        agentCounts[t.agent] = (agentCounts[t.agent] || 0) + 1;
    });

    const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                    <Icon className={color.replace('bg-', 'text-')} size={24} />
                </div>
                {subtext && <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{subtext}</span>}
            </div>
            <h3 className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{value}</h3>
            <p className="text-zinc-500 text-sm font-medium">{label}</p>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-zinc-950 p-8 overflow-y-auto no-scrollbar">
            <header className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <LineChart className="text-blue-500" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Project Intelligence</h1>
                    <p className="text-zinc-500 text-sm">Real-time metrics & performance analytics</p>
                </div>
            </header>

            {/* Matrix / Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={CheckCircle2}
                    label="Tarefas Concluídas"
                    value={completedTasks}
                    subtext={`${successRate}% Success`}
                    color="text-green-500 bg-green-500"
                />
                <StatCard
                    icon={Activity}
                    label="Em Progresso"
                    value={inProgressTasks}
                    subtext="Active"
                    color="text-orange-500 bg-orange-500"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Total de Tarefas"
                    value={totalTasks}
                    subtext="Backlog"
                    color="text-blue-500 bg-blue-500"
                />
                <StatCard
                    icon={Users}
                    label="Agentes Ativos"
                    value={Object.keys(agentCounts).length}
                    subtext="Swarm Size"
                    color="text-purple-500 bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">

                {/* Visual Distribution Chart */}
                <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Zap size={18} className="text-yellow-500" />
                        Distribuição de Carga de Trabalho (Workload)
                    </h2>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                        {Object.entries(agentCounts)
                            .sort(([, a], [, b]) => b - a)
                            .map(([agent, count]) => (
                                <div key={agent} className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-zinc-300">{agent}</span>
                                        <span className="text-zinc-500">{count} tasks ({Math.round(count / totalTasks * 100)}%)</span>
                                    </div>
                                    <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${agent === 'SomaQA' ? 'bg-red-500' :
                                                    agent === 'SomaFront' ? 'bg-blue-500' :
                                                        agent === 'SomaBack' ? 'bg-green-500' :
                                                            agent === 'SomaDesign' ? 'bg-purple-500' :
                                                                'bg-zinc-500'
                                                }`}
                                            style={{ width: `${Math.round(count / totalTasks * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        {totalTasks === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-zinc-600">
                                <Activity size={32} className="mb-2 opacity-50" />
                                <p>Sem dados para análise.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 flex flex-col h-full overflow-hidden">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-cyan-500" />
                        Live Feed
                    </h2>

                    <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 relative">
                        {logs.slice().reverse().slice(0, 20).map((log) => (
                            <div key={log.id} className="flex gap-3 text-sm pb-3 border-b border-zinc-800/50 last:border-0 hover:bg-white/5 p-2 rounded-lg transition-colors">
                                <span className="font-mono text-zinc-600 text-[10px] whitespace-nowrap mt-1">{log.timestamp}</span>
                                <div className='flex-1 min-w-0'>
                                    <p className="font-bold text-zinc-300 mb-0.5 truncate">{log.agent}</p>
                                    <p className="text-zinc-500 break-words leading-relaxed">{log.message}</p>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-zinc-600">
                                <Clock size={32} className="mb-2 opacity-50" />
                                <p>Aguardando eventos...</p>
                            </div>
                        )}
                        {/* Gradient Fade at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}
