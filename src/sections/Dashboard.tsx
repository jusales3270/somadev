import { motion } from 'framer-motion';
import {
  FolderOpen,
  Bot,
  CheckCircle2,
  Rocket,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard, AgentCard, ProjectCard, LogItem } from '@/components/ui-custom';
import { useAgentStore, useProjectStore, useLogStore, useStatsStore, useUIStore } from '@/store';

export function Dashboard() {
  const { agents } = useAgentStore();
  const { projects } = useProjectStore();
  const { logs } = useLogStore();
  const { stats } = useStatsStore();
  const { setCurrentView } = useUIStore();

  const recentLogs = logs.slice(-5).reverse();
  const recentProjects = projects.slice(0, 3);
  const onlineAgents = agents.filter(a => a.status === 'online' || a.status === 'busy').slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            Bem-vindo ao
            <img
              src="/somadev_v3.png"
              alt="SomaDev"
              className="h-16 w-auto object-contain"
            />
          </h1>
          <p className="text-muted-foreground mt-1">
            Fábrica de software autônoma e multimodal • v3.5 Enterprise
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-soma-green/10 border border-soma-green/20">
            <div className="w-2 h-2 rounded-full bg-soma-green animate-pulse" />
            <span className="text-sm font-medium text-soma-green">Sistema Online</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Projetos"
          value={stats.totalProjects}
          description="Total ativos"
          icon={FolderOpen}
          color="cyan"
          trend={{ value: 12, isPositive: true }}
          delay={0}
        />
        <StatCard
          title="Agentes Ativos"
          value={stats.activeAgents}
          description="De 13 disponíveis"
          icon={Bot}
          color="purple"
          delay={0.05}
        />
        <StatCard
          title="Tarefas Concluídas"
          value={stats.tasksCompleted.toLocaleString()}
          description="Este mês"
          icon={CheckCircle2}
          color="green"
          trend={{ value: 8, isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Deploys"
          value={stats.deploymentsThisWeek}
          description="Esta semana"
          icon={Rocket}
          color="orange"
          delay={0.15}
        />
        <StatCard
          title="Build Time"
          value={`${stats.averageBuildTime}s`}
          description="Média"
          icon={Clock}
          color="blue"
          trend={{ value: 5, isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          description="Taxa de sucesso"
          icon={TrendingUp}
          color="yellow"
          delay={0.25}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-soma-yellow" />
              Projetos Recentes
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('dashboard')}
              className="text-soma-yellow hover:text-soma-yellow/80"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        </motion.div>

        {/* Agents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bot className="w-5 h-5 text-soma-purple" />
              Agentes Ativos
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('agents')}
              className="text-soma-purple hover:text-soma-purple/80"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {onlineAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isCompact
                onClick={() => setCurrentView('agents')}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-soma-green" />
              Logs em Tempo Real
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('logs')}
              className="text-soma-green hover:text-soma-green/80"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card/50 p-4 space-y-1">
            {recentLogs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-soma-orange" />
            Ações Rápidas
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2 border-soma-orange/30 hover:bg-soma-orange/10"
              onClick={() => setCurrentView('canvas')}
            >
              <div className="p-2 rounded-lg bg-soma-orange/10">
                <Activity className="w-5 h-5 text-soma-orange" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Novo Canvas</p>
                <p className="text-xs text-muted-foreground">Design visual</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2 border-soma-purple/30 hover:bg-soma-purple/10"
              onClick={() => setCurrentView('chat')}
            >
              <div className="p-2 rounded-lg bg-soma-purple/10">
                <Bot className="w-5 h-5 text-soma-purple" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Chat com SARA</p>
                <p className="text-xs text-muted-foreground">Orquestrador AI</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2 border-soma-green/30 hover:bg-soma-green/10"
              onClick={() => setCurrentView('kanban')}
            >
              <div className="p-2 rounded-lg bg-soma-green/10">
                <CheckCircle2 className="w-5 h-5 text-soma-green" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Kanban Board</p>
                <p className="text-xs text-muted-foreground">Gerenciar tarefas</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2 border-soma-orange/30 hover:bg-soma-orange/10"
              onClick={() => setCurrentView('deploy')}
            >
              <div className="p-2 rounded-lg bg-soma-orange/10">
                <Rocket className="w-5 h-5 text-soma-orange" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Deploy</p>
                <p className="text-xs text-muted-foreground">SomaHost MCP</p>
              </div>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
