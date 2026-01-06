"use client";
import { useState, useEffect } from 'react';
import ChatModal from '@/components/ChatModal';
import KanbanBoard from '@/components/KanbanBoard';
import WelcomeChat from '@/components/WelcomeChat';
import { toast } from 'sonner';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasTasks, setHasTasks] = useState<boolean | null>(null); // null = loading

  const checkTasks = () => {
    fetch('http://localhost:8000/tasks')
      .then(res => res.json())
      .then(data => setHasTasks(data.length > 0))
      .catch(() => setHasTasks(false));
  };

  useEffect(() => {
    checkTasks();
  }, []);

  if (hasTasks === null) return <div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Connecting to SARA...</div>;

  // Mode 1: Onboarding (SARA First)
  if (!hasTasks) {
    return (
      <div className="h-screen bg-zinc-950">
        <WelcomeChat onProjectCreated={() => {
          setHasTasks(true);
          toast.success("Ambiente de Produção Configurado!");
        }} />
      </div>
    );
  }

  // Mode 2: Production (Kanban Dashboard)
  return (
    <main className="h-screen bg-zinc-950 text-white selection:bg-orange-500 selection:text-black flex flex-col overflow-hidden animate-in fade-in duration-700">
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating Copilot Button (Production Helper) */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-orange-500 hover:bg-orange-400 text-black rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center font-bold"
      >
        SARA
      </button>

      {/* Main Dashboard Area */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </main>
  );
}