// SomaDev Evolution v3.5 - Type Definitions

// Agent Types
export type AgentStatus = 'online' | 'busy' | 'offline' | 'error';
export type AgentType =
  | '@SomaArch'
  | '@SomaFront'
  | '@SomaBack'
  | '@SomaQA'
  | '@SomaOps'
  | '@SomaDesign'
  | '@SomaDB'
  | '@SomaSecurity'
  | '@SomaTest'
  | '@SomaDeploy'
  | '@SomaMonitor'
  | '@SomaDocs'
  | '@SomaAPI'
  | 'SARA';

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  status: AgentStatus;
  currentTask?: string;
  lastActive: Date;
  tasksCompleted: number;
  avatar?: string;
  color: string;
}

// Project Types
export type ProjectStatus = 'draft' | 'planning' | 'development' | 'testing' | 'deployed' | 'archived';
export type ProjectType = 'webapp' | 'mobile' | 'api' | 'desktop' | 'microservice';

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  stack: TechStack;
  canvas?: CanvasData;
  tasks: Task[];
  agents: AgentType[];
  previewUrl?: string;
  productionUrl?: string;
}

export interface TechStack {
  frontend?: string;
  backend?: string;
  database?: string;
  hosting?: string;
  styling?: string;
  state?: string;
}

// Task Types
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: AgentType;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
}

// Canvas Types
export interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport?: CanvasViewport;
}

export interface CanvasNode {
  id: string;
  type: 'screen' | 'component' | 'api' | 'database' | 'logic' | 'start' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    code?: string;
    props?: Record<string, any>;
    screenshot?: string;
    route?: string;
  };
  style?: Record<string, any>;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'smoothstep' | 'step' | 'straight';
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: AgentType;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'code';
  name: string;
  url: string;
  size?: number;
}

// Log Types
export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  agent?: AgentType;
  projectId?: string;
  taskId?: string;
  metadata?: Record<string, any>;
}

// Deployment Types
export type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'live' | 'failed' | 'stopped';

export interface Deployment {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  environment: 'preview' | 'production';
  url?: string;
  createdAt: Date;
  deployedAt?: Date;
  buildLogs: LogEntry[];
  metrics?: DeploymentMetrics;
}

export interface DeploymentMetrics {
  buildTime: number;
  bundleSize: number;
  lighthouseScore?: number;
  uptime: number;
  requestsPerMinute: number;
  errorRate: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'developer' | 'viewer';
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  notifications: boolean;
  autoSave: boolean;
  defaultStack: TechStack;
}

// Navigation Types
export type ViewType =
  | 'dashboard'
  | 'canvas'
  | 'chat'
  | 'kanban'
  | 'agents'
  | 'deploy'
  | 'settings'
  | 'logs';

export interface NavItem {
  id: ViewType;
  label: string;
  icon: string;
  badge?: number;
  shortcut?: string;
}

// Stats Types
export interface DashboardStats {
  totalProjects: number;
  activeAgents: number;
  tasksCompleted: number;
  deploymentsThisWeek: number;
  averageBuildTime: number;
  successRate: number;
}

// WebSocket Types
export interface WSMessage {
  type: 'log' | 'agent_update' | 'task_update' | 'deployment_update' | 'chat' | 'canvas_sync';
  payload: any;
  timestamp: Date;
}
