"use client";

import { useState } from 'react';
import { GitBranch, Plus, MonitorPlay, FlaskConical, Check, Trash2, GitMerge } from 'lucide-react';
import { toast } from 'sonner';

interface Worktree {
    id: string;
    name: string;
    type: 'production' | 'staging' | 'experimental';
    status: 'active' | 'inactive';
    lastCommit: string;
}

export default function WorktreesPage() {
    const [trees, setTrees] = useState<Worktree[]>([
        { id: '1', name: 'main', type: 'production', status: 'active', lastCommit: 'Initial commit' },
        { id: '2', name: 'feat/user-auth', type: 'staging', status: 'inactive', lastCommit: 'Add login modal' },
        { id: '3', name: 'experiment/dark-mode-v2', type: 'experimental', status: 'inactive', lastCommit: 'Try new color palette' },
    ]);

    const handleSwitch = (id: string) => {
        setTrees(trees.map(t => ({
            ...t,
            status: t.id === id ? 'active' : 'inactive'
        })));
        toast.success(`Context switch: ${trees.find(t => t.id === id)?.name}`);
    };

    const handleCreate = () => {
        const name = prompt("Nome do novo ambiente/branch:");
        if (name) {
            setTrees([...trees, {
                id: Date.now().toString(),
                name,
                type: 'experimental',
                status: 'inactive',
                lastCommit: 'Branched from main'
            }]);
            toast.success(`Environment '${name}' created.`);
        }
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950 p-8 overflow-y-auto no-scrollbar">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <GitBranch className="text-orange-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Worktrees Manager</h1>
                        <p className="text-zinc-500 text-sm">Isolated Development Environments</p>
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-black rounded-lg font-bold transition-colors"
                >
                    <Plus size={18} /> Novo Ambiente
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trees.map((tree) => (
                    <div
                        key={tree.id}
                        className={`relative border rounded-2xl p-6 transition-all group ${tree.status === 'active'
                                ? 'bg-zinc-900/80 border-orange-500/50 shadow-lg shadow-orange-500/10'
                                : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                            }`}
                    >
                        {tree.status === 'active' && (
                            <div className="absolute top-4 right-4 text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded flex items-center gap-1">
                                <Check size={12} /> CURRENT
                            </div>
                        )}

                        <div className="mb-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${tree.type === 'production' ? 'bg-blue-500/20 text-blue-400' :
                                    tree.type === 'staging' ? 'bg-green-500/20 text-green-400' :
                                        'bg-purple-500/20 text-purple-400'
                                }`}>
                                {tree.type === 'production' ? <MonitorPlay size={20} /> :
                                    tree.type === 'staging' ? <GitMerge size={20} /> :
                                        <FlaskConical size={20} />}
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-1">{tree.name}</h3>
                            <p className="text-xs font-mono text-zinc-500">{tree.lastCommit}</p>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => handleSwitch(tree.id)}
                                disabled={tree.status === 'active'}
                                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${tree.status === 'active'
                                        ? 'bg-zinc-800 text-zinc-500 cursor-default'
                                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                                    }`}
                            >
                                {tree.status === 'active' ? 'Ativo' : 'Ativar'}
                            </button>
                            {tree.type !== 'production' && (
                                <button className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
