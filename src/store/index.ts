import { create } from 'zustand';
import type { 
  Agent, 
  Project, 
  Task, 
  ChatMessage, 
  LogEntry, 
  ViewType,
  DashboardStats,
  CanvasData,
  TaskStatus
} from '@/types';

// Agent Store
interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  setAgents: (agents: Agent[]) => void;
  updateAgentStatus: (id: string, status: Agent['status'], currentTask?: string) => void;
  selectAgent: (agent: Agent | null) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [
    {
      id: '1',
      type: '@SomaArch',
      name: 'SomaArch',
      description: 'Arquiteto de Software - Define stack, schemas e arquitetura',
      status: 'online',
      lastActive: new Date(),
      tasksCompleted: 142,
      color: '#06b6d4'
    },
    {
      id: '2',
      type: '@SomaFront',
      name: 'SomaFront',
      description: 'Frontend Developer - Interfaces React/Tailwind',
      status: 'busy',
      currentTask: 'Implementando Dashboard',
      lastActive: new Date(),
      tasksCompleted: 289,
      color: '#8b5cf6'
    },
    {
      id: '3',
      type: '@SomaBack',
      name: 'SomaBack',
      description: 'Backend Developer - APIs FastAPI/Node',
      status: 'online',
      lastActive: new Date(),
      tasksCompleted: 198,
      color: '#10b981'
    },
    {
      id: '4',
      type: '@SomaQA',
      name: 'SomaQA',
      description: 'Quality Assurance - Testes automatizados',
      status: 'offline',
      lastActive: new Date(Date.now() - 3600000),
      tasksCompleted: 156,
      color: '#f59e0b'
    },
    {
      id: '5',
      type: '@SomaOps',
      name: 'SomaOps',
      description: 'DevOps - Docker, CI/CD, Infraestrutura',
      status: 'online',
      lastActive: new Date(),
      tasksCompleted: 134,
      color: '#ef4444'
    },
    {
      id: '6',
      type: '@SomaDesign',
      name: 'SomaDesign',
      description: 'Design AI - Canvas, UI/UX, Análise Visual',
      status: 'busy',
      currentTask: 'Analisando screenshot',
      lastActive: new Date(),
      tasksCompleted: 87,
      color: '#ec4899'
    },
    {
      id: '7',
      type: '@SomaDB',
      name: 'SomaDB',
      description: 'Database Engineer - PostgreSQL, Redis',
      status: 'online',
      lastActive: new Date(),
      tasksCompleted: 112,
      color: '#3b82f6'
    },
    {
      id: '8',
      type: '@SomaSecurity',
      name: 'SomaSecurity',
      description: 'Security Analyst - JWT, Auth, Vulnerabilities',
      status: 'online',
      lastActive: new Date(),
      tasksCompleted: 76,
      color: '#dc2626'
    },
    {
      id: '9',
      type: '@SomaTest',
      name: 'SomaTest',
      description: 'Test Engineer - Unit, Integration, E2E',
      status: 'offline',
      lastActive: new Date(Date.now() - 7200000),
      tasksCompleted: 203,
      color: '#84cc16'
    },
    {
      id: '10',
      type: '@SomaDeploy',
      name: 'SomaDeploy',
      description: 'Deployment Manager - MCP, Vercel, Hostinger',
      status: 'online',
      lastActive: new Date(),
      tasksCompleted: 168,
      color: '#06b6d4'
    },
    {
      id: '11',
      type: '@SomaMonitor',
      name: 'SomaMonitor',
      description: 'Monitoring - Prometheus, Grafana, Logs',
      status: 'online',
      lastActive: new Date(),
      tasksCompleted: 95,
      color: '#f97316'
    },
    {
      id: '12',
      type: '@SomaDocs',
      name: 'SomaDocs',
      description: 'Documentation - README, API Docs, Guides',
      status: 'offline',
      lastActive: new Date(Date.now() - 1800000),
      tasksCompleted: 124,
      color: '#6366f1'
    },
    {
      id: '13',
      type: '@SomaAPI',
      name: 'SomaAPI',
      description: 'API Integration - REST, GraphQL, WebSockets',
      status: 'online',
      lastActive: new Date(),
      tasksCompleted: 187,
      color: '#14b8a6'
    }
  ],
  selectedAgent: null,
  setAgents: (agents) => set({ agents }),
  updateAgentStatus: (id, status, currentTask) => set((state) => ({
    agents: state.agents.map(a => 
      a.id === id ? { ...a, status, currentTask, lastActive: new Date() } : a
    )
  })),
  selectAgent: (agent) => set({ selectedAgent: agent })
}));

// Project Store
interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  setProjects: (projects: Project[]) => void;
  selectProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [
    {
      id: '1',
      name: 'SomaDev Dashboard',
      description: 'Interface principal do SomaDev Evolution v3.5',
      type: 'webapp',
      status: 'development',
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(),
      stack: {
        frontend: 'React 19 + TypeScript',
        backend: 'FastAPI',
        database: 'PostgreSQL',
        hosting: 'Vercel',
        styling: 'Tailwind CSS v4',
        state: 'Zustand'
      },
      tasks: [],
      agents: ['@SomaFront', '@SomaBack', '@SomaDesign'],
      previewUrl: 'https://preview-1.somadev.me'
    },
    {
      id: '2',
      name: 'E-commerce API',
      description: 'API RESTful para plataforma de e-commerce',
      type: 'api',
      status: 'deployed',
      createdAt: new Date(Date.now() - 86400000 * 15),
      updatedAt: new Date(Date.now() - 86400000 * 2),
      stack: {
        backend: 'FastAPI + Python 3.12',
        database: 'PostgreSQL + Redis',
        hosting: 'Hostinger VPS'
      },
      tasks: [],
      agents: ['@SomaBack', '@SomaDB', '@SomaAPI'],
      productionUrl: 'https://api.ecommerce.com'
    },
    {
      id: '3',
      name: 'Mobile App',
      description: 'Aplicativo mobile para gestão de tarefas',
      type: 'mobile',
      status: 'planning',
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(),
      stack: {
        frontend: 'React Native',
        backend: 'Node.js',
        database: 'PostgreSQL'
      },
      tasks: [],
      agents: ['@SomaArch', '@SomaDesign']
    }
  ],
  selectedProject: null,
  setProjects: (projects) => set({ projects }),
  selectProject: (project) => set({ selectedProject: project }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    )
  }))
}));

// Task Store
interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [
    {
      id: '1',
      projectId: '1',
      title: 'Implementar Canvas com React Flow',
      description: 'Criar o whiteboard infinito para design visual',
      status: 'in_progress',
      priority: 'high',
      assignee: '@SomaDesign',
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
      tags: ['frontend', 'canvas', 'react-flow']
    },
    {
      id: '2',
      projectId: '1',
      title: 'Configurar WebSockets para logs',
      description: 'Implementar streaming em tempo real de logs',
      status: 'todo',
      priority: 'high',
      assignee: '@SomaBack',
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
      tags: ['backend', 'websocket', 'real-time']
    },
    {
      id: '3',
      projectId: '1',
      title: 'Criar componentes de UI base',
      description: 'Botões, cards, inputs no estilo industrial',
      status: 'done',
      priority: 'medium',
      assignee: '@SomaFront',
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000),
      tags: ['frontend', 'ui', 'design-system']
    },
    {
      id: '4',
      projectId: '2',
      title: 'Configurar Docker Compose',
      description: 'Setup de containers para desenvolvimento',
      status: 'done',
      priority: 'high',
      assignee: '@SomaOps',
      createdAt: new Date(Date.now() - 86400000 * 10),
      updatedAt: new Date(Date.now() - 86400000 * 8),
      tags: ['devops', 'docker', 'infra']
    },
    {
      id: '5',
      projectId: '2',
      title: 'Implementar autenticação JWT',
      description: 'Sistema de auth com refresh tokens',
      status: 'done',
      priority: 'critical',
      assignee: '@SomaSecurity',
      createdAt: new Date(Date.now() - 86400000 * 12),
      updatedAt: new Date(Date.now() - 86400000 * 9),
      tags: ['security', 'auth', 'jwt']
    }
  ],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
    )
  })),
  moveTask: (id, status) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === id ? { ...t, status, updatedAt: new Date() } : t
    )
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  }))
}));

// Chat Store
interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (message: ChatMessage) => void;
  setIsTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o SARA, o orquestrador de agentes do SomaDev. Como posso ajudar você hoje?',
      timestamp: new Date(Date.now() - 3600000),
      agent: '@SomaArch'
    },
    {
      id: '2',
      role: 'user',
      content: 'Quero criar um novo projeto de e-commerce',
      timestamp: new Date(Date.now() - 3500000)
    },
    {
      id: '3',
      role: 'assistant',
      content: 'Perfeito! Vou iniciar o processo de criação. Primeiro, vou consultar o @SomaArch para definir a arquitetura ideal para seu e-commerce.\n\nAlgumas perguntas rápidas:\n1. Qual o volume esperado de produtos?\n2. Precisa de painel administrativo?\n3. Integração com gateways de pagamento?',
      timestamp: new Date(Date.now() - 3400000),
      agent: '@SomaArch'
    }
  ],
  isTyping: false,
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setIsTyping: (isTyping) => set({ isTyping }),
  clearMessages: () => set({ messages: [] })
}));

// Log Store
interface LogState {
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
  getLogsByProject: (projectId: string) => LogEntry[];
}

export const useLogStore = create<LogState>((set, get) => ({
  logs: [
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000),
      level: 'info',
      message: 'Agent @SomaDesign iniciou análise de screenshot',
      agent: '@SomaDesign',
      projectId: '1'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 280000),
      level: 'success',
      message: 'Componente Button gerado com sucesso',
      agent: '@SomaFront',
      projectId: '1'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 260000),
      level: 'info',
      message: 'Build iniciado para preview-1.somadev.me',
      agent: '@SomaDeploy',
      projectId: '1'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 240000),
      level: 'warn',
      message: 'Bundle size excede 500KB, otimização recomendada',
      agent: '@SomaMonitor',
      projectId: '1'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 220000),
      level: 'success',
      message: 'Deploy concluído com sucesso',
      agent: '@SomaDeploy',
      projectId: '1'
    }
  ],
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  clearLogs: () => set({ logs: [] }),
  getLogsByProject: (projectId) => {
    return get().logs.filter(l => l.projectId === projectId);
  }
}));

// UI Store
interface UIState {
  currentView: ViewType;
  sidebarOpen: boolean;
  setCurrentView: (view: ViewType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'dashboard',
  sidebarOpen: true,
  setCurrentView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open })
}));

// Canvas Store
interface CanvasState {
  canvasData: CanvasData;
  selectedNode: string | null;
  isSyncing: boolean;
  setCanvasData: (data: CanvasData) => void;
  updateNodes: (nodes: CanvasData['nodes']) => void;
  updateEdges: (edges: CanvasData['edges']) => void;
  selectNode: (nodeId: string | null) => void;
  addNode: (node: CanvasData['nodes'][0]) => void;
  removeNode: (nodeId: string) => void;
  setIsSyncing: (syncing: boolean) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  canvasData: {
    nodes: [
      {
        id: '1',
        type: 'start',
        position: { x: 100, y: 200 },
        data: { label: 'Home' }
      },
      {
        id: '2',
        type: 'screen',
        position: { x: 350, y: 100 },
        data: { label: 'Dashboard', route: '/dashboard' }
      },
      {
        id: '3',
        type: 'screen',
        position: { x: 350, y: 300 },
        data: { label: 'Login', route: '/login' }
      },
      {
        id: '4',
        type: 'api',
        position: { x: 600, y: 100 },
        data: { label: 'API /stats' }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e2-4', source: '2', target: '4', animated: true }
    ]
  },
  selectedNode: null,
  isSyncing: false,
  setCanvasData: (data) => set({ canvasData: data }),
  updateNodes: (nodes) => set((state) => ({
    canvasData: { ...state.canvasData, nodes }
  })),
  updateEdges: (edges) => set((state) => ({
    canvasData: { ...state.canvasData, edges }
  })),
  selectNode: (nodeId) => set({ selectedNode: nodeId }),
  addNode: (node) => set((state) => ({
    canvasData: {
      ...state.canvasData,
      nodes: [...state.canvasData.nodes, node]
    }
  })),
  removeNode: (nodeId) => set((state) => ({
    canvasData: {
      nodes: state.canvasData.nodes.filter(n => n.id !== nodeId),
      edges: state.canvasData.edges.filter(e => 
        e.source !== nodeId && e.target !== nodeId
      )
    }
  })),
  setIsSyncing: (syncing) => set({ isSyncing: syncing })
}));

// Stats Store
interface StatsState {
  stats: DashboardStats;
  updateStats: (stats: Partial<DashboardStats>) => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: {
    totalProjects: 12,
    activeAgents: 9,
    tasksCompleted: 2347,
    deploymentsThisWeek: 23,
    averageBuildTime: 4.2,
    successRate: 98.5
  },
  updateStats: (stats) => set((state) => ({
    stats: { ...state.stats, ...stats }
  }))
}));
