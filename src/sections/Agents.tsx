import { motion } from 'framer-motion';
import { 
  Bot, 
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  BarChart3,
  MessageSquare,
  Settings,
  Zap,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAgentStore } from '@/store';
import { AgentCard } from '@/components/ui-custom';
import type { Agent, AgentStatus } from '@/types';

const statusConfig: Record<AgentStatus, { label: string; color: string; bg: string; icon: typeof Circle }> = {
  online: { 
    label: 'Online', 
    color: 'text-soma-green', 
    bg: 'bg-soma-green/10',
    icon: CheckCircle2
  },
  busy: { 
    label: 'Ocupado', 
    color: 'text-soma-orange', 
    bg: 'bg-soma-orange/10',
    icon: Clock
  },
  offline: { 
    label: 'Offline', 
    color: 'text-muted-foreground', 
    bg: 'bg-muted',
    icon: Circle
  },
  error: { 
    label: 'Erro', 
    color: 'text-soma-red', 
    bg: 'bg-soma-red/10',
    icon: AlertCircle
  }
};

function AgentDetail({ agent }: { agent: Agent }) {
  const status = statusConfig[agent.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full rounded-xl border border-border bg-card p-6"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: agent.color + '20' }}
        >
          <Bot className="w-8 h-8" style={{ color: agent.color }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{agent.name}</h2>
          <p className="text-sm text-muted-foreground">{agent.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={cn(status.bg, status.color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            {agent.currentTask && (
              <Badge variant="outline" className="text-soma-cyan border-soma-cyan/30">
                <Zap className="w-3 h-3 mr-1" />
                Executando
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className="mb-6 p-4 rounded-lg bg-soma-cyan/5 border border-soma-cyan/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-soma-cyan animate-pulse" />
            <span className="text-sm font-medium text-soma-cyan">Tarefa Atual</span>
          </div>
          <p className="text-sm text-foreground">{agent.currentTask}</p>
          <Progress value={65} className="mt-3 h-1" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-soma-green" />
            <span className="text-xs text-muted-foreground">Tarefas Concluídas</span>
          </div>
          <p className="text-2xl font-mono font-bold text-foreground">
            {agent.tasksCompleted.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-soma-blue" />
            <span className="text-xs text-muted-foreground">Última Atividade</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {new Date(agent.lastActive).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>

      {/* Performance */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-soma-purple" />
          Performance
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Eficiência</span>
              <span className="text-xs font-mono text-soma-green">94%</span>
            </div>
            <Progress value={94} className="h-1.5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Velocidade</span>
              <span className="text-xs font-mono text-soma-cyan">87%</span>
            </div>
            <Progress value={87} className="h-1.5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Qualidade</span>
              <span className="text-xs font-mono text-soma-purple">96%</span>
            </div>
            <Progress value={96} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <Button className="flex-1 gap-2" variant="outline">
          <MessageSquare className="w-4 h-4" />
          Conversar
        </Button>
        <Button className="flex-1 gap-2" variant="outline">
          <Settings className="w-4 h-4" />
          Configurar
        </Button>
      </div>
    </motion.div>
  );
}

export function Agents() {
  const { agents, selectedAgent, selectAgent } = useAgentStore();

  const onlineCount = agents.filter(a => a.status === 'online').length;
  const busyCount = agents.filter(a => a.status === 'busy').length;
  const offlineCount = agents.filter(a => a.status === 'offline').length;

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
            <Bot className="w-6 h-6 text-soma-blue" />
            Agentes SARA
          </h1>
          <p className="text-muted-foreground text-sm">
            Esquadrão de elite para execução técnica • 13 agentes especializados
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-soma-green animate-pulse" />
              <span className="text-sm text-muted-foreground">{onlineCount} online</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-soma-orange" />
              <span className="text-sm text-muted-foreground">{busyCount} ocupados</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span className="text-sm text-muted-foreground">{offlineCount} offline</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Agents Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 overflow-y-auto custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => selectAgent(agent)}
              >
                <AgentCard 
                  agent={agent} 
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Agent Detail */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:block overflow-y-auto custom-scrollbar"
        >
          {selectedAgent ? (
            <AgentDetail agent={selectedAgent} />
          ) : (
            <div className="h-full rounded-xl border border-border bg-card/50 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-soma-blue/10 flex items-center justify-center mb-4">
                <Bot className="w-10 h-10 text-soma-blue" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Selecione um Agente
              </h3>
              <p className="text-sm text-muted-foreground">
                Clique em qualquer agente para ver detalhes e estatísticas
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
