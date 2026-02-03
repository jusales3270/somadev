import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  X,
  Send,
  User,
  Paperclip,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  Volume2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useChatStore, useUIStore } from '@/store';
import type { ChatMessage, AgentType } from '@/types';

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
        isUser ? "bg-soma-cyan/20" : "bg-transparent"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-soma-cyan" />
        ) : (
          <img
            src="/sara-avatar.png"
            alt="SARA"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-[85%]",
        isUser && "text-right"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center gap-2 mb-1",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span className="text-xs font-medium text-foreground">
            {isUser ? 'Você' : message.agent || 'SARA'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {/* Message */}
        <div className={cn(
          "inline-block text-left px-3 py-2 rounded-xl text-sm",
          "relative group",
          isUser
            ? "bg-soma-cyan/20 text-foreground rounded-tr-sm"
            : "bg-white/10 backdrop-blur-sm border border-white/10 rounded-tl-sm text-white"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Copy Button */}
          {!isUser && (
            <button
              onClick={copyToClipboard}
              className={cn(
                "absolute -right-7 top-1 p-1 rounded",
                "opacity-0 group-hover:opacity-100",
                "bg-white/10 hover:bg-white/20 transition-all"
              )}
            >
              {copied ? (
                <Check className="w-3 h-3 text-soma-green" />
              ) : (
                <Copy className="w-3 h-3 text-white/60" />
              )}
            </button>
          )}
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
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
        <img
          src="/sara-avatar.png"
          alt="SARA"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 rounded-tl-sm">
        <div className="flex gap-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
            className="w-1.5 h-1.5 rounded-full bg-soma-cyan"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-soma-cyan"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
            className="w-1.5 h-1.5 rounded-full bg-soma-cyan"
          />
        </div>
        <span className="text-xs text-white/60">SARA está digitando...</span>
      </div>
    </motion.div>
  );
}

export function ChatWidget() {
  const { messages, isTyping, addMessage, setIsTyping } = useChatStore();
  const { setCurrentView } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const dragControls = useDragControls();

  // Auto-scroll to bottom
  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
    if (viewport && isOpen && !isMinimized) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isTyping, isOpen, isMinimized]);

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
      // Check if user wants to create something
      const lowerInput = input.toLowerCase();
      let response: { content: string; agent: AgentType } = {
        content: '',
        agent: 'SARA'
      };

      if (lowerInput.includes('criar') || lowerInput.includes('app') || lowerInput.includes('aplicativo')) {
        response = {
          content: `Entendido! Vou coordenar a criação do seu app. \n\nEstou convocando:\n- **@SomaArch** para definir a arquitetura\n- **@SomaDesign** para o design visual\n\n📋 **Plano de Ação:**\n1. O @SomaArch analisará os requisitos técnicos.\n2. O @SomaDesign criará o canvas visual.\n3. @SomaFront e @SomaBack implementarão a solução.\n\nVocê concorda com este plano?`,
          agent: 'SARA'
        };

        // Simulate redirect after a few seconds
        setTimeout(() => {
          const confirmMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: `✅ **Ótimo!**\n\n@SomaArch, por favor, assuma a liderança da arquitetura no Canvas.\n\nRedirecionando para o ambiente de trabalho...`,
            timestamp: new Date(),
            agent: 'SARA'
          };
          addMessage(confirmMessage);

          setTimeout(() => {
            setCurrentView('canvas');
          }, 2000);
        }, 5000);
      } else {

        const responses = [
          {
            content: `Compreendo. Como orquestradora, posso chamar o @SomaArch se precisar de definições técnicas ou o @SomaDesign se for algo visual. Como prefere seguir?`,
            agent: 'SARA'
          },
          {
            content: `Interessante. Vou analisar isso junto com o esquadrão. Se for uma questão de infraestrutura, o @SomaOps é o mais indicado.`,
            agent: 'SARA'
          },
          {
            content: `Posso ajudar com isso. O que acha de começarmos desenhando a estrutura básica? Posso pedir sugestões ao @SomaArch.`,
            agent: 'SARA'
          }
        ];
        response = responses[Math.floor(Math.random() * responses.length)] as any;
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        agent: response.agent
      };
      addMessage(aiMessage);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Collapsed button - SARA Avatar
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-16 h-16 rounded-full overflow-hidden",
          "border-2 border-white/20",
          "shadow-lg shadow-black/30",
          "transition-all duration-300",
          "hover:shadow-xl hover:border-soma-cyan/50"
        )}
      >
        <img
          src="/sara-avatar.png"
          alt="SARA"
          className="w-full h-full object-cover"
        />
        {/* Online indicator */}
        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-soma-green border-2 border-background animate-pulse" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        width: isMinimized ? 320 : 400,
        height: isMinimized ? 70 : 600
      }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "rounded-2xl overflow-hidden",
        "shadow-2xl shadow-black/50",
        "flex flex-col",
        "bg-gradient-to-br from-white/10 via-black/20 to-black/40",
        "backdrop-blur-xl",
        "border border-white/20",
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]",
        "shadow-glass"
      )}
    >
      {/* Header with SARA Background Image */}
      <div className="relative flex-shrink-0">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/sara-avatar.png"
            alt="SARA Background"
            className="w-full h-full object-cover object-top"
          />
          {/* Dark overlay gradient - Very subtle for glass effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        </div>

        {/* Header Content */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="relative flex items-center justify-between px-4 py-3 cursor-move select-none"
        >
          <div className="flex items-center gap-3">
            {/* Small Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
              <img
                src="/sara-avatar.png"
                alt="SARA"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">SARA</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-soma-green animate-pulse" />
                <span className="text-[10px] text-white/70">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Sound button */}
            <button
              onClick={() => { }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Volume2 className="w-4 h-4 text-white/70" />
            </button>
            {/* More options */}
            <button
              onClick={() => { }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-white/70" />
            </button>
            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-white/70" />
              ) : (
                <Minimize2 className="w-4 h-4 text-white/70" />
              )}
            </button>
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>
      </div>

      {/* Content - only show when not minimized */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden bg-transparent min-h-0"
          >
            {/* Messages */}
            <div className="flex-1 min-h-0 relative">
              <ScrollArea ref={scrollRef} className="h-full w-full p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </AnimatePresence>

                  {isTyping && <TypingIndicator />}
                </div>
              </ScrollArea>

              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#1a1a2e] to-transparent pointer-events-none z-10" />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 bg-transparent backdrop-blur-md">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    className={cn(
                      "pr-10 min-h-[44px] py-3 text-sm text-white",
                      "bg-white/5 border-white/10 hover:bg-white/10 transition-colors",
                      "focus:border-soma-cyan/50 focus:ring-soma-cyan/20",
                      "placeholder:text-white/40"
                    )}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                      <Paperclip className="w-4 h-4 text-white/40" />
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className={cn(
                    "h-11 w-11 rounded-full",
                    "bg-soma-cyan hover:bg-soma-cyan/80",
                    "text-white",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                <span className="text-[10px] text-white/40 whitespace-nowrap">Ações:</span>
                {['@SomaArch', '@SomaDesign', '@SomaDeploy'].map((agent) => (
                  <button
                    key={agent}
                    onClick={() => setInput(agent + ' ')}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-soma-cyan whitespace-nowrap transition-colors border border-soma-cyan/20"
                  >
                    {agent}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
