"use client";
import { useEffect, useState } from 'react';
import { MoreHorizontal, Circle, CheckCircle2, Timer } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
    id: number;
    title: string;
    status: string;
    agent: string;
}

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Busca as tarefas do SEU backend (main.py) com Polling
    useEffect(() => {
        const fetchTasks = () => {
            fetch('http://localhost:8000/tasks')
                .then(res => res.json())
                .then(data => {
                    setTasks(data);
                    setLoading(false);
                })
                .catch(err => console.error("Erro ao buscar tarefas:", err));
        };

        fetchTasks(); // Busca imediata
        const interval = setInterval(fetchTasks, 3000); // Atualiza a cada 3s

        return () => clearInterval(interval);
    }, []);

    const columns = [
        { id: 'To Do', label: 'A Fazer', icon: Circle, color: 'text-zinc-500' },
        { id: 'In Progress', label: 'Em Progresso', icon: Timer, color: 'text-orange-500' },
        { id: 'Done', label: 'Concluído', icon: CheckCircle2, color: 'text-green-500' }
    ];

    if (loading) return <div className="p-8 text-zinc-500">Carregando quadro...</div>;

    return (
        <div className="h-full p-6 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-6 h-full min-w-full pb-4">
                {columns.map(col => (
                    <div key={col.id} className="flex-1 flex flex-col min-w-[300px]">
                        {/* Header da Coluna */}
                        <div className="flex items-center justify-between mb-4 p-2">
                            <div className="flex items-center gap-2">
                                <col.icon size={16} className={col.color} />
                                <span className="font-semibold text-zinc-200">{col.label}</span>
                                <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                                    {tasks.filter(t => t.status === col.id).length}
                                </span>
                            </div>
                            <MoreHorizontal size={16} className="text-zinc-600 cursor-pointer" />
                        </div>

                        {/* Área de Cards */}
                        <div className="flex-1 bg-zinc-900/50 rounded-xl p-3 space-y-3 border border-zinc-800/50">
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <div key={task.id} className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 hover:border-orange-500/50 transition-colors group cursor-pointer shadow-sm relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-zinc-500">#{task.id}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-2 py-1 rounded bg-black border border-zinc-700 ${task.agent === 'SomaFront' ? 'text-blue-400' : 'text-purple-400'}`}>
                                                {task.agent}
                                            </span>
                                            {/* Execute Button - Always Visible & Labeled */}
                                            {task.status !== 'Done' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toast.promise(
                                                            fetch(`http://localhost:8000/execute/${task.id}`, { method: 'POST' })
                                                                .then(async (res) => {
                                                                    if (!res.ok) throw new Error("Falha na requisição");
                                                                    return res.json();
                                                                }),
                                                            {
                                                                loading: 'Iniciando Agente...',
                                                                success: `Tarefa #${task.id} enviada para o ${task.agent}!`,
                                                                error: 'Erro ao iniciar tarefa.'
                                                            }
                                                        );
                                                    }}
                                                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors border border-green-500/20"
                                                    title="Executar Tarefa (Vibe Code)"
                                                >
                                                    <Timer size={12} className="animate-pulse" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wide">Executar</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-200 font-medium leading-relaxed">{task.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
