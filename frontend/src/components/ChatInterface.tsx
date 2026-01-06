"use client";

import { useState, useEffect } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch("http://localhost:8000/chat/history");
                const history = await res.json();
                const formatted = history.map((h: any) => ({
                    role: h.role === 'ai' ? 'assistant' : 'user',
                    content: h.text
                }));
                setMessages(formatted);
            } catch (e) { console.error("Failed to load history", e); }
        };
        fetchHistory();
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: input, history: messages }),
            });

            const data = await response.json();

            // Handle potential error response from backend
            if (data.response && data.response.startsWith("Error:")) {
                const errorMessage: Message = { role: "assistant", content: data.response };
                setMessages((prev) => [...prev, errorMessage]);
            } else {
                const botMessage: Message = { role: "assistant", content: data.response };
                setMessages((prev) => [...prev, botMessage]);
            }

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { role: "assistant", content: "Erro ao conectar com o servidor." };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-transparent text-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-zinc-500 text-center mt-10">
                        Inicie uma conversa com o Orquestrador SomaDev...
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700"
                                }`}
                        >
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800 text-zinc-400 p-3 rounded-lg rounded-bl-none animate-pulse border border-zinc-700">
                            Pensando...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        className="flex-1 p-2 bg-zinc-950 border border-zinc-700 rounded focus:outline-none focus:border-yellow-500 text-white placeholder-zinc-600"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Digite sua instrução..."
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded font-bold disabled:opacity-50 transition-colors"
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
}
