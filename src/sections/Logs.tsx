import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Search, 
  Download,
  Trash2,
  Pause,
  Play,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Bug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLogStore, useAgentStore } from '@/store';
import type { LogLevel } from '@/types';

const levelFilters: { id: LogLevel | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'Todos', color: 'text-foreground' },
  { id: 'info', label: 'Info', color: 'text-soma-blue' },
  { id: 'success', label: 'Success', color: 'text-soma-green' },
  { id: 'warn', label: 'Warn', color: 'text-soma-orange' },
  { id: 'error', label: 'Error', color: 'text-soma-red' },
  { id: 'debug', label: 'Debug', color: 'text-muted-foreground' },
];

const levelIcons: Record<LogLevel, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warn: AlertTriangle,
  error: XCircle,
  debug: Bug
};

export function Logs() {
  const { logs, clearLogs } = useLogStore();
  const { agents } = useAgentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.agent?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesAgent = selectedAgent ? log.agent === selectedAgent : true;
    return matchesSearch && matchesLevel && matchesAgent;
  });

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'info': return 'text-soma-blue';
      case 'success': return 'text-soma-green';
      case 'warn': return 'text-soma-orange';
      case 'error': return 'text-soma-red';
      case 'debug': return 'text-muted-foreground';
    }
  };

  const getLevelBg = (level: LogLevel) => {
    switch (level) {
      case 'info': return 'bg-soma-blue/10';
      case 'success': return 'bg-soma-green/10';
      case 'warn': return 'bg-soma-orange/10';
      case 'error': return 'bg-soma-red/10';
      case 'debug': return 'bg-muted';
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Terminal className="w-6 h-6 text-soma-yellow" />
            Logs do Sistema
          </h1>
          <p className="text-muted-foreground text-sm">
            Streaming em tempo real de logs de todos os agentes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="gap-2"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                Retomar
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Pausar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearLogs}
            className="gap-2 text-soma-red hover:text-soma-red hover:bg-soma-red/10"
          >
            <Trash2 className="w-4 h-4" />
            Limpar
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg bg-card border border-border"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar logs..."
            className="pl-10"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1">
          {levelFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedLevel(filter.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                selectedLevel === filter.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Agent Filter */}
        <select
          value={selectedAgent || ''}
          onChange={(e) => setSelectedAgent(e.target.value || null)}
          className="h-9 px-3 rounded-md border border-border bg-background text-sm"
        >
          <option value="">Todos os agentes</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.type}>
              {agent.name}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-6 mb-4 px-4 py-2 rounded-lg bg-card border border-border"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Total:</span>
          <span className="text-sm font-mono font-bold">{logs.length}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-soma-green" />
          <span className="text-xs text-soma-green">{logs.filter(l => l.level === 'success').length}</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-soma-orange" />
          <span className="text-xs text-soma-orange">{logs.filter(l => l.level === 'warn').length}</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-3 h-3 text-soma-red" />
          <span className="text-xs text-soma-red">{logs.filter(l => l.level === 'error').length}</span>
        </div>
      </motion.div>

      {/* Logs List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 rounded-xl border border-border bg-card/50 overflow-hidden"
      >
        <ScrollArea className="h-full">
          <div className="p-4 space-y-1">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Terminal className="w-12 h-12 mb-4 opacity-50" />
                <p>Nenhum log encontrado</p>
              </div>
            ) : (
              filteredLogs.map((log, index) => {
                const LevelIcon = levelIcons[log.level];
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-lg",
                      "hover:bg-secondary/50 transition-colors"
                    )}
                  >
                    {/* Timestamp */}
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap pt-0.5 w-20">
                      {formatTime(log.timestamp)}
                    </span>

                    {/* Level Badge */}
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium",
                      getLevelBg(log.level),
                      getLevelColor(log.level)
                    )}>
                      <LevelIcon className="w-3 h-3" />
                      {log.level.toUpperCase()}
                    </div>

                    {/* Agent */}
                    {log.agent && (
                      <span className="text-xs font-mono text-soma-purple whitespace-nowrap">
                        {log.agent}
                      </span>
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
              })
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}
