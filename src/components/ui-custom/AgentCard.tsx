import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Bot, Circle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Agent } from '@/types';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
  isCompact?: boolean;
}

const statusConfig = {
  online: {
    icon: CheckCircle2,
    color: 'text-soma-green',
    bg: 'bg-soma-green/10',
    border: 'border-soma-green/20',
    label: 'Online'
  },
  busy: {
    icon: Clock,
    color: 'text-soma-orange',
    bg: 'bg-soma-orange/10',
    border: 'border-soma-orange/20',
    label: 'Ocupado'
  },
  offline: {
    icon: Circle,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
    label: 'Offline'
  },
  error: {
    icon: AlertCircle,
    color: 'text-soma-red',
    bg: 'bg-soma-red/10',
    border: 'border-soma-red/20',
    label: 'Erro'
  }
};

export function AgentCard({ agent, onClick, isCompact = false }: AgentCardProps) {
  const status = statusConfig[agent.status];
  const StatusIcon = status.icon;

  if (isCompact) {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg",
          "bg-card border border-border",
          "hover:border-soma-cyan/30 transition-all duration-200",
          "w-full text-left"
        )}
      >
        <div 
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            status.bg
          )}
          style={{ backgroundColor: agent.color + '20' }}
        >
          <Bot className="w-5 h-5" style={{ color: agent.color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {agent.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {agent.currentTask || status.label}
          </p>
        </div>
        
        <div className={cn(
          "w-2.5 h-2.5 rounded-full",
          agent.status === 'online' && "bg-soma-green animate-pulse",
          agent.status === 'busy' && "bg-soma-orange",
          agent.status === 'offline' && "bg-muted-foreground",
          agent.status === 'error' && "bg-soma-red"
        )} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl p-5",
        "bg-card border cursor-pointer",
        "hover:border-soma-cyan/30 transition-all duration-300",
        "hover:shadow-lg hover:shadow-soma-cyan/10"
      )}
    >
      {/* Glow Effect */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: agent.color }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: agent.color + '20' }}
          >
            <Bot className="w-6 h-6" style={{ color: agent.color }} />
          </div>
          
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1.5 text-xs",
              status.bg,
              status.border,
              status.color
            )}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {agent.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {agent.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Tarefas:
            </span>
            <span className="text-sm font-mono font-medium text-soma-cyan">
              {agent.tasksCompleted}
            </span>
          </div>
          
          {agent.currentTask && (
            <div className="flex items-center gap-1.5 text-xs text-soma-orange">
              <Clock className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{agent.currentTask}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
