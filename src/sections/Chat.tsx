import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Paperclip,
  Image,
  Code,
  Sparkles,
  Cpu,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useChatStore, useAgentStore } from '@/store';
import type { ChatMessage } from '@/types';

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
        isUser ? "bg-soma-cyan/20" : "bg-soma-purple/20"
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-soma-cyan" />
        ) : (
          <Bot className="w-5 h-5 text-soma-purple" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-[80%]",
        isUser && "text-right"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center gap-2 mb-1",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span className="text-sm font-medium text-foreground">
            {isUser ? 'Você' : message.agent || 'SARA'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {message.agent && (
            <span className="text-xs font-mono text-soma-purple">
              {message.agent}
            </span>
          )}
        </div>

        {/* Message */}
        <div className={cn(
          "inline-block text-left px-4 py-3 rounded-2xl",
          "relative group",
          isUser
            ? "bg-soma-cyan/20 text-foreground rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm"
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className={cn(
              "absolute -right-8 top-2 p-1.5 rounded-lg",
              "opacity-0 group-hover:opacity-100",
              "bg-secondary hover:bg-secondary/80 transition-all",
              !isUser && "right-auto -left-8"
            )}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-soma-green" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4"
    >
      <div className="w-10 h-10 rounded-xl bg-soma-purple/20 flex items-center justify-center">
        <Bot className="w-5 h-5 text-soma-purple" />
      </div>
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border border-border rounded-tl-sm">
        <div className="flex gap-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
            className="w-2 h-2 rounded-full bg-soma-purple"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
            className="w-2 h-2 rounded-full bg-soma-purple"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
            className="w-2 h-2 rounded-full bg-soma-purple"
          />
        </div>
        <span className="text-xs text-muted-foreground">SARA está digitando...</span>
      </div>
    </motion.div>
  );
}

export function Chat() {
  const { messages, isTyping, addMessage, setIsTyping } = useChatStore();
  const { agents } = useAgentStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    addMessage(userMessage);
    setInput('');

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        {
          content: `Entendido! Sou a SARA e vou coordenar os agentes para você. O @SomaArch é o especialista em arquitetura que posso acionar se necessário.`,
          agent: 'SARA'
        },
        {
          content: `Certo. Como orquestradora, recomendo envolvermos o @SomaFront para as questões de interface. Deseja que eu o chame?`,
          agent: 'SARA'
        },
        {
          content: `Vou registrar essa solicitação. Se precisarmos de infraestrutura, acionarei o @SomaOps para configurar o ambiente.`,
          agent: 'SARA'
        }
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse.content,
        timestamp: new Date(),
        agent: randomResponse.agent as any
      };
      addMessage(aiMessage);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-soma-purple" />
              Chat com SARA
            </h1>
            <p className="text-muted-foreground text-sm">
              Orquestrador de Agentes AI • Comunique-se com o esquadrão
            </p>
          </div>

          {/* Active Agents */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
            <span className="text-xs text-muted-foreground">Agentes ativos:</span>
            <div className="flex -space-x-2">
              {agents.slice(0, 5).map((agent) => (
                <div
                  key={agent.id}
                  className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center"
                  style={{ backgroundColor: agent.color + '30' }}
                  title={agent.name}
                >
                  <span className="text-[10px] font-bold" style={{ color: agent.color }}>
                    {agent.name.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-soma-green/10 border border-soma-green/20">
            <Cpu className="w-4 h-4 text-soma-green" />
            <span className="text-xs font-medium text-soma-green">SARA Online</span>
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 rounded-xl border border-border bg-card/30 overflow-hidden flex flex-col"
      >
        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                />
              ))}
            </AnimatePresence>

            {isTyping && <TypingIndicator />}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem... Use @ para mencionar agentes"
                className={cn(
                  "pr-24 min-h-[44px] py-3",
                  "bg-secondary/50 border-border/50",
                  "focus:border-soma-cyan/50 focus:ring-soma-cyan/20"
                )}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Image className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Code className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={cn(
                "h-11 px-4 gap-2",
                "bg-gradient-to-r from-soma-cyan to-soma-blue",
                "hover:from-soma-cyan/90 hover:to-soma-blue/90",
                "text-primary-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Ações rápidas:</span>
            <button
              onClick={() => setInput('@SomaArch ')}
              className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-soma-cyan transition-colors"
            >
              @SomaArch
            </button>
            <button
              onClick={() => setInput('@SomaDesign ')}
              className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-soma-purple transition-colors"
            >
              @SomaDesign
            </button>
            <button
              onClick={() => setInput('@SomaDeploy ')}
              className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-soma-orange transition-colors"
            >
              @SomaDeploy
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
