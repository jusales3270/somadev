"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Clock, Map, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
    id: number;
    title: string;
    description: string;
    agent: string;
    status: 'To Do' | 'In Progress' | 'Done';
}

// Helper to generate fake dates for visualization based on task ID
const getComputedDates = (taskId: number) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + (taskId - 1)); // Stagger tasks by 1 day

    const end = new Date(start);
    end.setDate(start.getDate() + 2); // 2 day duration

    return {
        start: start.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        end: end.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
    };
};

export default function RoadmapPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/tasks')
            .then(res => res.json())
            .then(setTasks)
            .catch(() => toast.error("Failed to load roadmap."))
            .finally(() => setLoading(false));
    }, []);

    const getAgentColor = (agent: string) => {
        switch (agent) {
            case 'SomaFront': return 'bg-blue-500 border-blue-400';
            case 'SomaBack': return 'bg-green-500 border-green-400';
            case 'SomaQA': return 'bg-red-500 border-red-400';
            case 'SomaOps': return 'bg-purple-500 border-purple-400';
            case 'SomaDesign': return 'bg-pink-500 border-pink-400';
            default: return 'bg-zinc-500 border-zinc-400';
        }
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950 p-8 overflow-hidden">
            <header className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <Map className="text-emerald-500" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Strategic Roadmap</h1>
                    <p className="text-zinc-500 text-sm">Project Timeline & Application Lifecycle</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar relative pl-4">
                {/* Vertical Line */}
                <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-zinc-800 via-zinc-800 to-transparent" />

                <div className="space-y-8 pb-20">
                    {tasks.map((task, index) => {
                        const { start, end } = getComputedDates(task.id);
                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative flex items-start gap-6 group"
                            >
                                {/* Timeline Dot */}
                                <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center border-2 bg-zinc-950 shadow-xl mt-1 shrink-0 ${task.status === 'Done' ? 'border-emerald-500 text-emerald-500' :
                                        task.status === 'In Progress' ? 'border-orange-500 text-orange-500' : 'border-zinc-800 text-zinc-600'
                                    }`}>
                                    <span className="text-lg font-bold">#{task.id}</span>
                                </div>

                                {/* Card */}
                                <div className="flex-1 bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-2xl hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-default">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`h-2 w-2 rounded-full ${getAgentColor(task.agent).split(' ')[0]}`} />
                                            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{task.agent}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-black/20 px-2 py-1 rounded-md font-mono">
                                            <Calendar size={12} />
                                            <span>{start} - {end}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-zinc-200 mb-1">{task.title}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{task.description}</p>

                                    {/* Status Pill */}
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                task.status === 'In Progress' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                    'bg-zinc-800/50 text-zinc-500 border-zinc-700'
                                            }`}>
                                            {task.status === 'In Progress' && <Clock size={12} className="animate-pulse" />}
                                            {task.status}
                                        </div>

                                        <ChevronRight size={16} className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {tasks.length === 0 && !loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                        <Map size={48} className="mb-4 opacity-20" />
                        <p>No roadmap items defined.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
