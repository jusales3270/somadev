"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface WelcomeChatProps {
    onProjectCreated: () => void;
}

export default function WelcomeChat({ onProjectCreated }: WelcomeChatProps) {
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
        { role: 'ai', text: "Olá. Sou SARA, a arquiteta do sistema. O que vamos construir hoje?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const initChat = async () => {
            try {
                const res = await fetch("http://localhost:8000/chat/history");
                const history = await res.json();
                if (history.length > 0) {
                    setMessages(history.map((h: any) => ({ role: h.role, text: h.text })));
                }
            } catch (e) { console.error(e); }
        };
        initChat();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'FW3Gt1SJ9qFHO_ZaFTo-KAWLLKJOeBNYAF83rGZJxUE'
                },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();

            setMessages(prev => [...prev, { role: 'ai', text: data.response }]);

            // Check if tasks were generated (this means Phase 3 is complete)
            checkTasks();

        } catch (error) {
            toast.error("Erro de conexão com SARA.");
        } finally {
            setLoading(false);
        }
    };

    const checkTasks = async () => {
        try {
            const res = await fetch('http://localhost:8000/tasks');
            const tasks = await res.json();
            if (tasks.length > 0) {
                toast.success("Plano gerado! Iniciando produção...");
                setTimeout(onProjectCreated, 1500); // Small delay for effect
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-zinc-950 relative overflow-hidden">
            {/* Background Ambient Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl flex flex-col h-[80vh] bg-zinc-900/40 border border-zinc-800 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden z-10"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-zinc-900/50">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Bot className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">S.A.R.A.</h1>
                        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">System Architect</p>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {msg.role === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                                    <Sparkles size={14} className="text-orange-500" />
                                </div>
                            )}

                            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-orange-600 text-white shadow-lg'
                                : 'bg-zinc-800/80 text-zinc-200 border border-zinc-700/50 shadow-sm'
                                }`}>
                                <div dangerouslySetInnerHTML={{ __html: (msg.text || '').replace(/\n/g, '<br/>') }} />
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <div className="flex gap-2 p-4">
                            <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce delay-75" />
                            <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce delay-150" />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-zinc-900/80 border-t border-white/5">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Descreva seu projeto..."
                            autoFocus
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-5 pr-14 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="absolute right-2 p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
