"use client";

import { useState, useEffect } from 'react';
import { Lightbulb, Send, Sparkles, Bot } from 'lucide-react';
import { toast } from 'sonner';

export default function IdeationPage() {
    const [input, setInput] = useState('');
    const [ideas, setIdeas] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8000/ideation/history')
            .then(res => res.json())
            .then(setIdeas)
            .catch(() => toast.error("Não foi possível carregar o histórico de brainstorming."));
    }, []);

    const handleBrainstorm = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setIdeas(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            // We reuse the main chat endpoint but contextually it's for ideation
            // In a real app we might send a flag "mode: ideation"
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `[BRAINSTORM MODE] ${userMsg}` })
            });
            const data = await res.json();

            setIdeas(prev => [...prev, { role: 'ai', text: data.response }]);
        } catch (error) {
            toast.error("Falha ao conectar com o laboratório.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950 p-6">
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <Lightbulb className="text-yellow-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Ideation Lab</h1>
                        <p className="text-zinc-500 text-sm">Brainstorming with SARA Architecture Core</p>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6 overflow-y-auto space-y-6 mb-6">
                {ideas.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                        <Sparkles size={48} className="mb-4" />
                        <p>Digite uma ideia crua para começarmos...</p>
                    </div>
                )}

                {ideas.map((msg, i) => (
                    <div key={i} className={`flex gap-4 ${msg.role === 'ai' ? 'bg-zinc-800/50 p-4 rounded-xl' : 'flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-700 text-zinc-300'
                            }`}>
                            {msg.role === 'ai' ? <Bot size={16} /> : <div className="w-2 h-2 bg-zinc-400 rounded-full" />}
                        </div>
                        <div className={`prose prose-invert max-w-none text-sm leading-relaxed ${msg.role === 'user' ? 'text-right' : ''}`}>
                            {msg.role === 'ai' ? (
                                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                            ) : (
                                msg.text
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-4 bg-zinc-800/30 p-4 rounded-xl animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-zinc-700/50 rounded w-3/4" />
                            <div className="h-4 bg-zinc-700/50 rounded w-1/2" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBrainstorm()}
                    placeholder="Ex: 'E se criássemos um app de delivery de drones?'"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 pr-16 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all font-medium"
                />
                <button
                    onClick={handleBrainstorm}
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
