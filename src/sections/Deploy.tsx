import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Globe, 
  Server, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Pause,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  Database,
  Shield,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store';

const deployments = [
  {
    id: '1',
    projectId: '1',
    environment: 'preview' as const,
    status: 'live' as const,
    url: 'https://preview-1.somadev.me',
    createdAt: new Date(Date.now() - 3600000),
    buildTime: 245,
    bundleSize: 2.4,
  },
  {
    id: '2',
    projectId: '2',
    environment: 'production' as const,
    status: 'live' as const,
    url: 'https://api.ecommerce.com',
    createdAt: new Date(Date.now() - 86400000),
    buildTime: 312,
    bundleSize: 4.8,
  },
  {
    id: '3',
    projectId: '3',
    environment: 'preview' as const,
    status: 'building' as const,
    url: 'https://preview-3.somadev.me',
    createdAt: new Date(),
    buildTime: 0,
    bundleSize: 0,
  }
];

const statusConfig = {
  pending: { label: 'Pendente', color: 'text-muted-foreground', bg: 'bg-muted', icon: Clock },
  building: { label: 'Buildando', color: 'text-soma-cyan', bg: 'bg-soma-cyan/10', icon: RefreshCw },
  deploying: { label: 'Deployando', color: 'text-soma-purple', bg: 'bg-soma-purple/10', icon: Rocket },
  live: { label: 'Online', color: 'text-soma-green', bg: 'bg-soma-green/10', icon: CheckCircle2 },
  failed: { label: 'Falhou', color: 'text-soma-red', bg: 'bg-soma-red/10', icon: AlertCircle },
  stopped: { label: 'Parado', color: 'text-muted-foreground', bg: 'bg-muted', icon: Pause }
};

function DeploymentCard({ deployment }: { deployment: typeof deployments[0] }) {
  const status = statusConfig[deployment.status];
  const StatusIcon = status.icon;
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(deployment.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border border-border bg-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            status.bg
          )}>
            {deployment.status === 'building' ? (
              <RefreshCw className={cn("w-5 h-5", status.color, "animate-spin")} />
            ) : (
              <StatusIcon className={cn("w-5 h-5", status.color)} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {deployment.environment === 'production' ? 'Produção' : 'Preview'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {new Date(deployment.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
        <Badge className={cn(status.bg, status.color)}>
          {status.label}
        </Badge>
      </div>

      {/* URL */}
      <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-secondary/50">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-mono text-foreground flex-1 truncate">
          {deployment.url}
        </span>
        <button
          onClick={copyUrl}
          className="p-1.5 hover:bg-secondary rounded transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-soma-green" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <a
          href={deployment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 hover:bg-secondary rounded transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </a>
      </div>

      {/* Stats */}
      {deployment.status === 'live' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-soma-blue" />
            <span className="text-xs text-muted-foreground">Build:</span>
            <span className="text-sm font-mono">{deployment.buildTime}s</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-soma-purple" />
            <span className="text-xs text-muted-foreground">Bundle:</span>
            <span className="text-sm font-mono">{deployment.bundleSize}MB</span>
          </div>
        </div>
      )}

      {/* Progress */}
      {deployment.status === 'building' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Progresso do build</span>
            <span className="text-xs font-mono text-soma-cyan">65%</span>
          </div>
          <Progress value={65} className="h-1.5" />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {deployment.status === 'live' && (
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <Pause className="w-4 h-4" />
            Parar
          </Button>
        )}
        <Button variant="outline" size="sm" className="flex-1 gap-2">
          <Terminal className="w-4 h-4" />
          Logs
        </Button>
      </div>
    </motion.div>
  );
}

export function Deploy() {
  const { projects } = useProjectStore();
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id);

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
            <Rocket className="w-6 h-6 text-soma-orange" />
            SomaHost
          </h1>
          <p className="text-muted-foreground text-sm">
            Deploy automatizado via protocolo MCP • Hostinger/Vercel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-soma-green/10 border border-soma-green/20">
            <Shield className="w-4 h-4 text-soma-green" />
            <span className="text-xs font-medium text-soma-green">SSL Ativo</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-soma-blue/10 border border-soma-blue/20">
            <Server className="w-4 h-4 text-soma-blue" />
            <span className="text-xs font-medium text-soma-blue">MCP Conectado</span>
          </div>
        </div>
      </motion.div>

      {/* Project Selector */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-card border border-border"
      >
        <span className="text-sm text-muted-foreground">Projeto:</span>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="flex-1 max-w-md h-10 px-3 rounded-md border border-border bg-background text-sm"
        >
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <Button className="gap-2 bg-soma-orange hover:bg-soma-orange/90">
          <Rocket className="w-4 h-4" />
          Novo Deploy
        </Button>
      </motion.div>

      {/* Deployments Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          {deployments.map((deployment) => (
            <DeploymentCard key={deployment.id} deployment={deployment} />
          ))}
          
          {/* Add New Card */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-xl border-2 border-dashed border-border bg-card/30 hover:border-soma-orange/30 hover:bg-card/50 transition-all flex flex-col items-center justify-center gap-4 min-h-[280px]"
          >
            <div className="w-16 h-16 rounded-full bg-soma-orange/10 flex items-center justify-center">
              <Plus className="w-8 h-8 text-soma-orange" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Novo Ambiente</p>
              <p className="text-sm text-muted-foreground">Preview ou Produção</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
