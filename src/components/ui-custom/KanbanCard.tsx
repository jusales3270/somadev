import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  Circle,
  Calendar,
  Tag,
  MoreHorizontal
} from 'lucide-react';
import type { Task, TaskPriority } from '@/types';

interface KanbanCardProps {
  task: Task;
  onClick?: () => void;
  dragHandleProps?: any;
}

const priorityConfig: Record<TaskPriority, { color: string; bg: string; icon: typeof Circle }> = {
  low: { 
    color: 'text-muted-foreground', 
    bg: 'bg-muted',
    icon: Circle
  },
  medium: { 
    color: 'text-soma-blue', 
    bg: 'bg-soma-blue/10',
    icon: Circle
  },
  high: { 
    color: 'text-soma-orange', 
    bg: 'bg-soma-orange/10',
    icon: AlertCircle
  },
  critical: { 
    color: 'text-soma-red', 
    bg: 'bg-soma-red/10',
    icon: AlertCircle
  }
};

export function KanbanCard({ task, onClick, dragHandleProps }: KanbanCardProps) {
  const priority = priorityConfig[task.priority];
  const PriorityIcon = priority.icon;

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      {...dragHandleProps}
      className={cn(
        "group relative p-4 rounded-lg",
        "bg-card border border-border cursor-pointer",
        "hover:border-soma-cyan/30 hover:shadow-md",
        "transition-all duration-200"
      )}
    >
      {/* Priority Indicator */}
      <div className={cn(
        "absolute left-0 top-4 bottom-4 w-1 rounded-full",
        priority.bg.replace('/10', '')
      )} />

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground line-clamp-2 flex-1">
            {task.title}
          </h4>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-secondary rounded"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-secondary rounded text-muted-foreground"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {/* Priority */}
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
              priority.bg,
              priority.color
            )}>
              <PriorityIcon className="w-3 h-3" />
              {task.priority}
            </div>

            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="font-mono">{task.assignee}</span>
              </div>
            )}
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-[10px]",
              new Date(task.dueDate) < new Date() 
                ? "text-soma-red" 
                : "text-muted-foreground"
            )}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
