import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Info, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Bug,
  Bot
} from 'lucide-react';
import type { LogEntry, LogLevel } from '@/types';

interface LogItemProps {
  log: LogEntry;
  showAgent?: boolean;
}

const levelConfig: Record<LogLevel, { icon: typeof Info; color: string; bg: string; label: string }> = {
  info: { 
    icon: Info, 
    color: 'text-soma-blue', 
    bg: 'bg-soma-blue/10',
    label: 'INFO'
  },
  warn: { 
    icon: AlertTriangle, 
    color: 'text-soma-orange', 
    bg: 'bg-soma-orange/10',
    label: 'WARN'
  },
  error: { 
    icon: XCircle, 
    color: 'text-soma-red', 
    bg: 'bg-soma-red/10',
    label: 'ERROR'
  },
  success: { 
    icon: CheckCircle, 
    color: 'text-soma-green', 
    bg: 'bg-soma-green/10',
    label: 'SUCCESS'
  },
  debug: { 
    icon: Bug, 
    color: 'text-muted-foreground', 
    bg: 'bg-muted',
    label: 'DEBUG'
  }
};

export function LogItem({ log, showAgent = true }: LogItemProps) {
  const level = levelConfig[log.level];
  const LevelIcon = level.icon;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg",
        "border border-transparent",
        "hover:bg-secondary/50 transition-colors"
      )}
    >
      {/* Timestamp */}
      <span className="text-xs font-mono text-muted-foreground whitespace-nowrap pt-0.5">
        {formatTime(log.timestamp)}
      </span>

      {/* Level Badge */}
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium",
        level.bg,
        level.color
      )}>
        <LevelIcon className="w-3 h-3" />
        {level.label}
      </div>

      {/* Agent */}
      {showAgent && log.agent && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Bot className="w-3 h-3" />
          <span className="font-mono">{log.agent}</span>
        </div>
      )}

      {/* Message */}
      <span className={cn(
        "text-sm flex-1",
        log.level === 'error' && "text-soma-red",
        log.level === 'warn' && "text-soma-orange",
        log.level === 'success' && "text-soma-green",
        log.level === 'info' && "text-foreground",
        log.level === 'debug' && "text-muted-foreground"
      )}>
        {log.message}
      </span>
    </motion.div>
  );
}
