import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Kanban, 
  Plus, 
  Search,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTaskStore, useAgentStore } from '@/store';
import { KanbanCard } from '@/components/ui-custom';
import type { TaskStatus } from '@/types';

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'text-muted-foreground' },
  { id: 'todo', label: 'A Fazer', color: 'text-soma-blue' },
  { id: 'in_progress', label: 'Em Progresso', color: 'text-soma-cyan' },
  { id: 'review', label: 'Revisão', color: 'text-soma-purple' },
  { id: 'done', label: 'Concluído', color: 'text-soma-green' },
];

export function KanbanBoard() {
  const { tasks, moveTask } = useTaskStore();
  const { agents } = useAgentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgent = selectedAgent ? task.assignee === selectedAgent : true;
    return matchesSearch && matchesAgent;
  });

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      moveTask(taskId, status);
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
            <Kanban className="w-6 h-6 text-soma-green" />
            Kanban Board
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestão de tarefas e fluxo de trabalho
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tarefas..."
              className="pl-10 w-64"
            />
          </div>

          {/* Filter by Agent */}
          <select
            value={selectedAgent || ''}
            onChange={(e) => setSelectedAgent(e.target.value || null)}
            className="h-10 px-3 rounded-md border border-border bg-card text-sm"
          >
            <option value="">Todos os agentes</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.type}>
                {agent.name}
              </option>
            ))}
          </select>

          <Button className="gap-2 bg-soma-green hover:bg-soma-green/90">
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </Button>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-6 mb-4 p-3 rounded-lg bg-card border border-border"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Total:</span>
          <span className="text-lg font-mono font-bold text-foreground">{tasks.length}</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-soma-cyan">Em Progresso:</span>
          <span className="text-lg font-mono font-bold text-soma-cyan">
            {tasks.filter(t => t.status === 'in_progress').length}
          </span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-soma-green">Concluídas:</span>
          <span className="text-lg font-mono font-bold text-soma-green">
            {tasks.filter(t => t.status === 'done').length}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-soma-green" />
          <span className="text-sm text-muted-foreground">
            {Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)}% completo
          </span>
        </div>
      </motion.div>

      {/* Kanban Columns */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-x-auto"
      >
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column, index) => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="w-80 flex-shrink-0 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("font-semibold", column.color)}>
                      {column.label}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  <button className="p-1 hover:bg-secondary rounded">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Column Content */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={cn(
                    "flex-1 rounded-xl border-2 border-dashed p-3 space-y-3",
                    "transition-colors duration-200",
                    "border-border bg-card/30",
                    "hover:border-soma-cyan/30"
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {columnTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        draggable
                        onDragStart={(e) => handleDragStart(e as any, task.id)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <KanbanCard task={task} />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {columnTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-sm">Arraste tarefas aqui</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
