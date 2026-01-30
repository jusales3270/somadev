'use client'

import { useState, useEffect } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Play,
    Check,
    Clock,
    AlertCircle,
    GripVertical,
    Edit2,
    X,
    Save,
    Loader2,
    ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

// Types
interface Task {
    id: number
    title: string
    description?: string
    status: 'todo' | 'in_progress' | 'done' | 'failed'
    agent: string
    order_index: number
}

interface Column {
    id: string
    title: string
    status: string
    icon: React.ReactNode
    color: string
}

const COLUMNS: Column[] = [
    { id: 'todo', title: 'A Fazer', status: 'todo', icon: <Clock className="w-4 h-4" />, color: 'text-zinc-400' },
    { id: 'in_progress', title: 'Em Progresso', status: 'in_progress', icon: <Loader2 className="w-4 h-4 animate-spin" />, color: 'text-orange-400' },
    { id: 'done', title: 'Concluído', status: 'done', icon: <Check className="w-4 h-4" />, color: 'text-green-400' }
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

// Agent color map
const AGENT_COLORS: Record<string, string> = {
    SomaFront: 'bg-blue-500',
    SomaBack: 'bg-purple-500',
    SomaQA: 'bg-green-500',
    SomaOps: 'bg-orange-500',
    SomaDesign: 'bg-pink-500',
    SomaArch: 'bg-cyan-500',
    SomaLead: 'bg-yellow-500',
    SomaMobile: 'bg-indigo-500',
    SomaData: 'bg-emerald-500',
    SomaSec: 'bg-red-500',
    SomaDocs: 'bg-teal-500'
}

// Sortable Task Card Component
function SortableTaskCard({ task, onExecute, onEdit }: {
    task: Task
    onExecute: (id: number) => void
    onEdit: (task: Task) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    const agentColor = AGENT_COLORS[task.agent] || 'bg-zinc-500'

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-zinc-900 rounded-xl p-4 border border-white/10 hover:border-orange-500/30 transition-all group ${isDragging ? 'shadow-xl ring-2 ring-orange-500' : ''
                }`}
        >
            {/* Header with drag handle */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-zinc-500">#{task.id}</span>
                </div>
                <span className={`${agentColor} text-white text-xs px-2 py-0.5 rounded-full font-medium`}>
                    {task.agent}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-white font-medium mb-2 line-clamp-2">{task.title}</h3>

            {/* Description */}
            {task.description && (
                <p className="text-zinc-500 text-sm mb-3 line-clamp-2">{task.description}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                {task.status === 'todo' && (
                    <button
                        onClick={() => onExecute(task.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
                    >
                        <Play className="w-3 h-3" />
                        Executar
                    </button>
                )}
                {task.status === 'in_progress' && (
                    <span className="flex items-center gap-1 text-orange-400 text-sm">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Executando...
                    </span>
                )}
                {task.status === 'done' && (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                        <Check className="w-3 h-3" />
                        Concluído
                    </span>
                )}
                {task.status === 'failed' && (
                    <span className="flex items-center gap-1 text-red-400 text-sm">
                        <AlertCircle className="w-3 h-3" />
                        Falhou
                    </span>
                )}

                <button
                    onClick={() => onEdit(task)}
                    className="ml-auto p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Edit2 className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    )
}

// Edit Task Modal
function EditTaskModal({
    task,
    onClose,
    onSave
}: {
    task: Task | null
    onClose: () => void
    onSave: (id: number, title: string, description: string) => void
}) {
    const [title, setTitle] = useState(task?.title || '')
    const [description, setDescription] = useState(task?.description || '')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (task) {
            setTitle(task.title)
            setDescription(task.description || '')
        }
    }, [task])

    if (!task) return null

    const handleSave = async () => {
        setSaving(true)
        await onSave(task.id, title, description)
        setSaving(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Editar Tarefa #{task.id}</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// Progress Bar Component
function ProgressBar({ tasks }: { tasks: Task[] }) {
    const total = tasks.length
    const done = tasks.filter(t => t.status === 'done').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const failed = tasks.filter(t => t.status === 'failed').length

    const percent = total > 0 ? Math.round((done / total) * 100) : 0

    return (
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Progresso do Projeto</span>
                <span className="text-lg font-bold text-white">{percent}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                />
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1 text-zinc-500">
                    <div className="w-2 h-2 rounded-full bg-zinc-600" /> {total - done - inProgress - failed} pendentes
                </span>
                <span className="flex items-center gap-1 text-orange-400">
                    <div className="w-2 h-2 rounded-full bg-orange-500" /> {inProgress} em progresso
                </span>
                <span className="flex items-center gap-1 text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> {done} concluídas
                </span>
                {failed > 0 && (
                    <span className="flex items-center gap-1 text-red-400">
                        <div className="w-2 h-2 rounded-full bg-red-500" /> {failed} falharam
                    </span>
                )}
            </div>
        </div>
    )
}

// Main Kanban Board Component
export default function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [activeId, setActiveId] = useState<number | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                headers: { 'x-api-key': API_KEY }
            })
            const data = await res.json()
            setTasks(data)
        } catch (err) {
            console.error('Failed to fetch tasks:', err)
            toast.error('Falha ao carregar tarefas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
        // Poll for updates
        const interval = setInterval(fetchTasks, 3000)
        return () => clearInterval(interval)
    }, [])

    // Execute task
    const handleExecute = async (taskId: number) => {
        try {
            toast.loading('Iniciando execução...', { id: `exec-${taskId}` })

            const res = await fetch(`${API_URL}/execute/${taskId}`, {
                method: 'POST',
                headers: { 'x-api-key': API_KEY }
            })

            if (res.status === 429) {
                const data = await res.json()
                toast.error(`Limite de requisições. Tente novamente em ${data.detail.retry_after}s`, { id: `exec-${taskId}` })
                return
            }

            toast.success('Tarefa iniciada!', { id: `exec-${taskId}` })
            fetchTasks()
        } catch (err) {
            toast.error('Falha ao executar tarefa', { id: `exec-${taskId}` })
        }
    }

    // Edit task
    const handleEditSave = async (id: number, title: string, description: string) => {
        try {
            await fetch(`${API_URL}/tasks/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY
                },
                body: JSON.stringify({ title, description })
            })
            toast.success('Tarefa atualizada!')
            fetchTasks()
        } catch (err) {
            toast.error('Falha ao atualizar tarefa')
        }
    }

    // Drag handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as number)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeTask = tasks.find(t => t.id === active.id)
        const overTask = tasks.find(t => t.id === over.id)

        if (!activeTask) return

        // Determine new status from drop zone
        const overColumn = COLUMNS.find(c => c.id === over.id)
        const newStatus = overColumn?.status || overTask?.status || activeTask.status

        if (activeTask.status !== newStatus || (overTask && activeTask.id !== overTask.id)) {
            // Update locally first for instant feedback
            setTasks(prev => {
                const updated = prev.map(t =>
                    t.id === activeTask.id ? { ...t, status: newStatus as Task['status'] } : t
                )
                return updated
            })

            // API call to persist
            try {
                await fetch(`${API_URL}/tasks/${activeTask.id}/reorder`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY
                    },
                    body: JSON.stringify({
                        status: newStatus,
                        order_index: overTask?.order_index || 0
                    })
                })
                toast.success('Tarefa movida!')
            } catch (err) {
                toast.error('Falha ao mover tarefa')
                fetchTasks() // Revert on error
            }
        }
    }

    const getTasksByStatus = (status: string) =>
        tasks.filter(t => t.status === status).sort((a, b) => a.order_index - b.order_index)

    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Progress Bar */}
            <ProgressBar tasks={tasks} />

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-3 gap-6">
                    {COLUMNS.map(column => {
                        const columnTasks = getTasksByStatus(column.status)

                        return (
                            <div key={column.id} className="space-y-4">
                                {/* Column Header */}
                                <div className="flex items-center gap-2">
                                    <span className={column.color}>{column.icon}</span>
                                    <h2 className="font-semibold text-white">{column.title}</h2>
                                    <span className="ml-auto text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
                                        {columnTasks.length}
                                    </span>
                                </div>

                                {/* Drop Zone */}
                                <div className="min-h-[200px] space-y-3 p-2 rounded-xl bg-zinc-950/50 border border-dashed border-white/5">
                                    <SortableContext
                                        items={columnTasks.map(t => t.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <AnimatePresence>
                                            {columnTasks.map(task => (
                                                <SortableTaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onExecute={handleExecute}
                                                    onEdit={setEditingTask}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </SortableContext>

                                    {columnTasks.length === 0 && (
                                        <div className="py-8 text-center text-zinc-600 text-sm">
                                            Arraste tarefas aqui
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeTask && (
                        <div className="bg-zinc-900 rounded-xl p-4 border-2 border-orange-500 shadow-2xl opacity-90">
                            <span className="text-white font-medium">{activeTask.title}</span>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingTask && (
                    <EditTaskModal
                        task={editingTask}
                        onClose={() => setEditingTask(null)}
                        onSave={handleEditSave}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
