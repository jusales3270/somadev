import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Server, 
  Smartphone, 
  Database,
  ExternalLink,
  GitBranch
} from 'lucide-react';
import type { Project, ProjectStatus, ProjectType } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const typeIcons: Record<ProjectType, typeof Globe> = {
  webapp: Globe,
  mobile: Smartphone,
  api: Server,
  desktop: Database,
  microservice: GitBranch
};

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  draft: { 
    label: 'Rascunho', 
    color: 'text-muted-foreground', 
    bg: 'bg-muted' 
  },
  planning: { 
    label: 'Planejamento', 
    color: 'text-soma-blue', 
    bg: 'bg-soma-blue/10' 
  },
  development: { 
    label: 'Desenvolvimento', 
    color: 'text-soma-cyan', 
    bg: 'bg-soma-cyan/10' 
  },
  testing: { 
    label: 'Testes', 
    color: 'text-soma-purple', 
    bg: 'bg-soma-purple/10' 
  },
  deployed: { 
    label: 'Deployado', 
    color: 'text-soma-green', 
    bg: 'bg-soma-green/10' 
  },
  archived: { 
    label: 'Arquivado', 
    color: 'text-muted-foreground', 
    bg: 'bg-muted' 
  }
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const TypeIcon = typeIcons[project.type];
  const status = statusConfig[project.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl p-5",
        "bg-card border border-border cursor-pointer",
        "hover:border-soma-cyan/30 transition-all duration-300",
        "hover:shadow-lg hover:shadow-soma-cyan/10"
      )}
    >
      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-soma-cyan/10 blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              status.bg
            )}>
              <TypeIcon className={cn("w-5 h-5", status.color)} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {project.name}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">
                {project.type}
              </p>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn("text-xs", status.bg, status.color)}
          >
            {status.label}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>

        {/* Stack */}
        {project.stack && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {Object.entries(project.stack).slice(0, 3).map(([key, value]) => (
              <span 
                key={key}
                className="px-2 py-0.5 text-[10px] font-mono bg-secondary rounded text-muted-foreground"
              >
                {value?.split(' ')[0]}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Agentes:</span>
              <span className="text-sm font-mono text-soma-cyan">
                {project.agents.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Tarefas:</span>
              <span className="text-sm font-mono text-soma-purple">
                {project.tasks.length}
              </span>
            </div>
          </div>
          
          {(project.previewUrl || project.productionUrl) && (
            <a
              href={project.productionUrl || project.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "p-2 rounded-lg",
                "text-muted-foreground hover:text-soma-cyan",
                "hover:bg-soma-cyan/10 transition-colors"
              )}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
