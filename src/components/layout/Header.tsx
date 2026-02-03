import { 
  Search, 
  Bell, 
  Plus, 
  Command,
  Cpu,
  Zap,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAgentStore, useUIStore } from '@/store';

export function Header() {
  const { agents } = useAgentStore();
  const { sidebarOpen } = useUIStore();
  
  const onlineAgents = agents.filter(a => a.status === 'online').length;
  const busyAgents = agents.filter(a => a.status === 'busy').length;

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 z-30 h-16",
        "bg-background/80 backdrop-blur-xl border-b border-border",
        "flex items-center justify-between px-6",
        "transition-all duration-300"
      )}
      style={{ 
        left: sidebarOpen ? '260px' : '72px',
        width: `calc(100% - ${sidebarOpen ? '260px' : '72px'})`
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-soma-cyan transition-colors" />
          <Input
            placeholder="Buscar projetos, tarefas, agentes..."
            className={cn(
              "w-80 pl-10 pr-10 h-10",
              "bg-secondary/50 border-border/50",
              "focus:border-soma-cyan/50 focus:ring-soma-cyan/20",
              "placeholder:text-muted-foreground/60"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="w-3 h-3" />
              K
            </kbd>
          </div>
        </div>

        {/* Agent Status */}
        <div className="hidden lg:flex items-center gap-4">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <Cpu className="w-4 h-4 text-soma-green" />
              <div className="absolute inset-0 blur-sm bg-soma-green/50" />
            </div>
            <span className="text-sm text-muted-foreground">
              <span className="text-soma-green font-mono font-bold">{onlineAgents}</span> online
            </span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="relative">
              <Activity className="w-4 h-4 text-soma-orange" />
              <div className="absolute inset-0 blur-sm bg-soma-orange/50" />
            </div>
            <span className="text-sm text-muted-foreground">
              <span className="text-soma-orange font-mono font-bold">{busyAgents}</span> ocupados
            </span>
          </motion.div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-soma-green/10 border border-soma-green/20"
        >
          <div className="w-2 h-2 rounded-full bg-soma-green animate-pulse" />
          <span className="text-xs font-medium text-soma-green">Sistema Operacional</span>
        </motion.div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-soma-red animate-pulse" />
        </Button>

        {/* New Project Button */}
        <Button 
          className={cn(
            "h-10 gap-2",
            "bg-gradient-to-r from-soma-cyan to-soma-blue",
            "hover:from-soma-cyan/90 hover:to-soma-blue/90",
            "text-primary-foreground font-medium",
            "shadow-lg shadow-soma-cyan/20",
            "transition-all duration-200 hover:shadow-xl hover:shadow-soma-cyan/30"
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Projeto</span>
          <Zap className="w-4 h-4 hidden sm:inline" />
        </Button>
      </div>
    </header>
  );
}
