"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Olá! Sou a SARA. O que vamos construir hoje? Uma Landing Page, um Dashboard ou algo novo?",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { role: "user", content: input, timestamp: new Date() }
        setMessages((prev) => [...prev, userMsg])
        setInput("")
        setLoading(true)

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, history: messages })
            })

            if (!response.ok) throw new Error("API call failed")

            const data = await response.json()

            const saraMsg: Message = {
                role: "assistant",
                content: data.content,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, saraMsg])

        } catch (err) {
            console.error("Failed to Chat", err)
            const errorMsg: Message = {
                role: "assistant",
                content: "Desculpe, meu cérebro (API) não está respondendo. Verifique se o backend está rodando em http://localhost:8000.",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setLoading(false)
        }
    }

    // Auto-scroll
    useEffect(() => {
        // scroll logic
    }, [messages])

    return (
        <div className="flex flex-col h-full bg-slate-900/40">
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                }`}
                        >
                            <Avatar className="h-8 w-8 border border-slate-700">
                                <AvatarFallback className={msg.role === "assistant" ? "bg-indigo-600" : "bg-slate-600"}>
                                    {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className={`p-3 rounded-lg max-w-[80%] text-sm ${msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-tr-none"
                                        : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <Avatar className="h-8 w-8 border border-slate-700">
                                <AvatarFallback className="bg-indigo-600"><Bot size={16} /></AvatarFallback>
                            </Avatar>
                            <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                                <span className="animate-pulse text-slate-400">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 bg-slate-900/60 border-t border-slate-800">
                <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Descreva seu projeto..."
                        className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-indigo-500"
                    />
                    <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700">
                        <Send size={18} />
                    </Button>
                </form>
            </div>
        </div>
    )
}
