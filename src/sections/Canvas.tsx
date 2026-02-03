import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Eye, 
  RotateCcw,
  Download,
  Copy,
  Check,
  Wand2,
  Terminal,
  Sparkles,
  Send,
  Image as ImageIcon,
  FileCode,
  Layout,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type ViewMode = 'code' | 'preview';
type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error';

interface CodeFile {
  name: string;
  language: string;
  content: string;
}

const sampleGeneratedApp = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskMaster Pro - Gerenciador de Tarefas</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .task-card { transition: all 0.3s ease; }
    .task-card:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .glass { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <!-- Header -->
  <header class="gradient-bg text-white py-6 px-8">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">TaskMaster Pro</h1>
        <p class="text-white/80 mt-1">Gerencie suas tarefas com eficiência</p>
      </div>
      <div class="flex items-center gap-4">
        <span class="glass px-4 py-2 rounded-full text-sm">12 tarefas pendentes</span>
        <button class="bg-white text-purple-600 px-6 py-2 rounded-full font-medium hover:bg-white/90 transition">
          + Nova Tarefa
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto p-8">
    <!-- Stats -->
    <div class="grid grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="text-3xl font-bold text-purple-600">24</div>
        <div class="text-gray-500 text-sm mt-1">Total de Tarefas</div>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="text-3xl font-bold text-green-500">18</div>
        <div class="text-gray-500 text-sm mt-1">Concluídas</div>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="text-3xl font-bold text-orange-500">4</div>
        <div class="text-gray-500 text-sm mt-1">Em Progresso</div>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="text-3xl font-bold text-red-500">2</div>
        <div class="text-gray-500 text-sm mt-1">Atrasadas</div>
      </div>
    </div>

    <!-- Task Board -->
    <div class="grid grid-cols-3 gap-6">
      <!-- To Do -->
      <div class="bg-gray-100 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-700">A Fazer</h3>
          <span class="bg-gray-200 px-2 py-1 rounded text-sm">3</span>
        </div>
        <div class="space-y-3">
          <div class="task-card bg-white rounded-xl p-4 cursor-pointer">
            <div class="flex items-start justify-between">
              <h4 class="font-medium text-gray-800">Revisar documentação</h4>
              <span class="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">Alta</span>
            </div>
            <p class="text-gray-500 text-sm mt-2">Revisar a documentação do projeto antes da reunião</p>
            <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span>📅 Amanhã</span>
              <span>👤 João</span>
            </div>
          </div>
          <div class="task-card bg-white rounded-xl p-4 cursor-pointer">
            <div class="flex items-start justify-between">
              <h4 class="font-medium text-gray-800">Atualizar dependências</h4>
              <span class="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded">Média</span>
            </div>
            <p class="text-gray-500 text-sm mt-2">Atualizar pacotes npm para versões mais recentes</p>
            <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span>📅 Esta semana</span>
              <span>👤 Maria</span>
            </div>
          </div>
        </div>
      </div>

      <!-- In Progress -->
      <div class="bg-gray-100 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-700">Em Progresso</h3>
          <span class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">2</span>
        </div>
        <div class="space-y-3">
          <div class="task-card bg-white rounded-xl p-4 cursor-pointer border-l-4 border-blue-500">
            <div class="flex items-start justify-between">
              <h4 class="font-medium text-gray-800">Implementar dashboard</h4>
              <span class="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">Alta</span>
            </div>
            <p class="text-gray-500 text-sm mt-2">Criar interface do dashboard com gráficos</p>
            <div class="mt-3">
              <div class="bg-gray-200 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full" style="width: 65%"></div>
              </div>
              <span class="text-xs text-gray-400 mt-1">65% concluído</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Done -->
      <div class="bg-gray-100 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-700">Concluído</h3>
          <span class="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">5</span>
        </div>
        <div class="space-y-3">
          <div class="task-card bg-white rounded-xl p-4 cursor-pointer opacity-60">
            <div class="flex items-start justify-between">
              <h4 class="font-medium text-gray-800 line-through">Configurar ambiente</h4>
              <CheckCircle2 class="w-5 h-5 text-green-500" />
            </div>
            <p class="text-gray-500 text-sm mt-2">Setup inicial do projeto completo</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
`;

const generatedFiles: CodeFile[] = [
  {
    name: 'index.html',
    language: 'html',
    content: sampleGeneratedApp.trim()
  },
  {
    name: 'styles.css',
    language: 'css',
    content: `/* TaskMaster Pro - Styles */

:root {
  --primary: #667eea;
  --primary-dark: #764ba2;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: #f9fafb;
}

.task-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.gradient-bg {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}

.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}`
  },
  {
    name: 'app.js',
    language: 'javascript',
    content: `// TaskMaster Pro - Main Application

class TaskManager {
  constructor() {
    this.tasks = [];
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.loadTasks();
    this.render();
    this.bindEvents();
  }

  addTask(title, description, priority = 'medium') {
    const task = {
      id: Date.now(),
      title,
      description,
      priority,
      status: 'todo',
      createdAt: new Date()
    };
    this.tasks.push(task);
    this.saveTasks();
    this.render();
    return task;
  }

  moveTask(id, newStatus) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.status = newStatus;
      this.saveTasks();
      this.render();
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
    this.render();
  }

  getStats() {
    return {
      total: this.tasks.length,
      completed: this.tasks.filter(t => t.status === 'done').length,
      inProgress: this.tasks.filter(t => t.status === 'in-progress').length,
      overdue: this.tasks.filter(t => t.status === 'todo').length
    };
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      this.tasks = JSON.parse(saved);
    }
  }

  render() {
    // Render logic
    console.log('Rendering tasks:', this.tasks);
  }

  bindEvents() {
    // Event binding
    document.addEventListener('DOMContentLoaded', () => {
      console.log('TaskManager initialized');
    });
  }
}

// Initialize app
const app = new TaskManager();`
  }
];

export function Canvas() {
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<CodeFile>(generatedFiles[0]);
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [progress, setProgress] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Simulate code generation
  const startGeneration = () => {
    if (!prompt.trim()) return;
    
    setGenerationStatus('generating');
    setProgress(0);
    setGeneratedCode('');

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerationStatus('completed');
          setGeneratedCode(sampleGeneratedApp);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Update iframe when code changes
  useEffect(() => {
    if (iframeRef.current && generatedCode) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(generatedCode);
        doc.close();
      }
    }
  }, [generatedCode]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-soma-purple" />
              SomaDesign Canvas
            </h1>
            <p className="text-muted-foreground text-sm">
              Geração de código em tempo real • Visualize enquanto cria
            </p>
          </div>

          {/* Generation Status */}
          {generationStatus === 'generating' && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-soma-cyan/10 border border-soma-cyan/20">
              <Loader2 className="w-4 h-4 text-soma-cyan animate-spin" />
              <span className="text-sm text-soma-cyan">Gerando código...</span>
              <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-soma-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-soma-cyan">{progress}%</span>
            </div>
          )}

          {generationStatus === 'completed' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-soma-green/10 border border-soma-green/20">
              <CheckCircle2 className="w-4 h-4 text-soma-green" />
              <span className="text-sm text-soma-green">Geração concluída!</span>
            </div>
          )}
        </div>

        {/* View Toggle */}
        {generationStatus === 'completed' && (
          <div className="flex items-center gap-2 p-1 rounded-lg bg-secondary">
            <button
              onClick={() => setViewMode('code')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                viewMode === 'code' 
                  ? "bg-card text-soma-cyan shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Code className="w-4 h-4" />
              Código
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                viewMode === 'preview' 
                  ? "bg-card text-soma-purple shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        )}
      </motion.div>

      {/* Input Area - Always visible */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <div className="flex items-end gap-3 p-4 rounded-xl bg-card border border-border">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-2 block">
              Descreva o que você quer criar
            </label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soma-purple" />
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Crie um app de gerenciamento de tarefas com design moderno e dashboard..."
                className={cn(
                  "pl-10 pr-4 py-3",
                  "bg-secondary/50 border-border/50",
                  "focus:border-soma-purple/50 focus:ring-soma-purple/20",
                  "placeholder:text-muted-foreground/60"
                )}
                onKeyDown={(e) => e.key === 'Enter' && startGeneration()}
                disabled={generationStatus === 'generating'}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-11 w-11"
              disabled={generationStatus === 'generating'}
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-11 w-11"
              disabled={generationStatus === 'generating'}
            >
              <FileCode className="w-4 h-4" />
            </Button>
            <Button 
              onClick={startGeneration}
              disabled={!prompt.trim() || generationStatus === 'generating'}
              className={cn(
                "h-11 gap-2",
                "bg-gradient-to-r from-soma-purple to-soma-cyan",
                "hover:from-soma-purple/90 hover:to-soma-cyan/90",
                "text-white font-medium"
              )}
            >
              {generationStatus === 'generating' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Gerar
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 rounded-xl border border-border overflow-hidden bg-card"
      >
        {generationStatus === 'idle' && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-2xl bg-soma-purple/10 flex items-center justify-center mb-6">
              <Wand2 className="w-12 h-12 text-soma-purple" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Pronto para criar algo incrível?
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Descreva o aplicativo que você quer criar e o SomaDesign vai gerar o código em tempo real. 
              Você poderá visualizar o resultado instantaneamente.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'App de tarefas',
                'Dashboard analytics',
                'Landing page',
                'E-commerce',
                'Blog'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(`Crie um ${suggestion} moderno`)}
                  className="px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {generationStatus === 'generating' && (
          <div className="h-full flex flex-col">
            {/* Code Generation Stream */}
            <div className="flex-1 p-6 font-mono text-sm overflow-auto bg-[#1e1e1e]">
              <div className="text-green-400 mb-2">// SomaDesign está gerando seu código...</div>
              <div className="text-blue-400 mb-4">// Analisando requisitos e criando estrutura...</div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-purple-400">const</span>{' '}
                <span className="text-yellow-300">app</span>{' '}
                <span className="text-white">=</span>{' '}
                <span className="text-purple-400">new</span>{' '}
                <span className="text-yellow-300">TaskManager</span>
                <span className="text-white">();</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-2"
              >
                <span className="text-gray-500">// Configurando componentes visuais...</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <span className="text-purple-400">function</span>{' '}
                <span className="text-yellow-300">renderDashboard</span>
                <span className="text-white">() {'{'}</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="pl-4"
              >
                <span className="text-purple-400">return</span>{' '}
                <span className="text-white">(</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="pl-8"
              >
                <span className="text-gray-400">&lt;</span>
                <span className="text-blue-400">div</span>{' '}
                <span className="text-light-blue-400">className</span>
                <span className="text-white">=</span>
                <span className="text-green-400">&quot;dashboard&quot;</span>
                <span className="text-gray-400">&gt;</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                className="pl-12"
              >
                <span className="text-gray-400">&lt;</span>
                <span className="text-blue-400">Header</span>{' '}
                <span className="text-light-blue-400">title</span>
                <span className="text-white">=</span>
                <span className="text-green-400">&quot;TaskMaster Pro&quot;</span>{' '}
                <span className="text-gray-400">/&gt;</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5 }}
                className="mt-4 text-gray-500"
              >
                // Gerando estilos CSS...
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4 }}
              >
                <span className="text-purple-400">.gradient-bg</span>{' '}
                <span className="text-white">{'{'}</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.2 }}
                className="pl-4"
              >
                <span className="text-light-blue-400">background</span>
                <span className="text-white">:</span>{' '}
                <span className="text-yellow-300">linear-gradient</span>
                <span className="text-white">(135deg, #667eea 0%, #764ba2 100%);</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.4 }}
              >
                <span className="text-white">{'}'}</span>
              </motion.div>
            </div>
          </div>
        )}

        {generationStatus === 'completed' && (
          <AnimatePresence mode="wait">
            {viewMode === 'code' ? (
              <motion.div
                key="code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex"
              >
                {/* File Explorer */}
                <div className="w-56 border-r border-border bg-secondary/30">
                  <div className="p-3 border-b border-border">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Arquivos
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    {generatedFiles.map((file) => (
                      <button
                        key={file.name}
                        onClick={() => setSelectedFile(file)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors",
                          selectedFile.name === file.name
                            ? "bg-soma-cyan/10 text-soma-cyan"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <FileCode className="w-4 h-4" />
                        {file.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 flex flex-col">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-mono">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        ({selectedFile.language})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyCode}
                        className="gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-soma-green" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={downloadCode}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Code Content */}
                  <ScrollArea className="flex-1">
                    <pre className="p-4 font-mono text-sm text-foreground bg-[#1e1e1e]">
                      <code>{selectedFile.content}</code>
                    </pre>
                  </ScrollArea>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                {/* Preview Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Preview</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-soma-green animate-pulse" />
                      Ao vivo
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Recarregar
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Exportar
                    </Button>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 bg-white">
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0"
                    title="Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
