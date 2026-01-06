import os
import subprocess
import sys

def run_command(command, cwd=None):
    """Executa comandos no terminal e verifica erros."""
    print(f"🔄 Executando: {command}...")
    try:
        # shell=True necessário para Windows reconhecer comandos como 'npx'
        subprocess.check_call(command, shell=True, cwd=cwd)
        print("✅ Sucesso.")
    except subprocess.CalledProcessError:
        print(f"❌ Erro ao executar: {command}")
        # sys.exit(1)

def create_file(path, content):
    """Cria ou sobrescreve arquivos com o conteúdo especificado."""
    print(f"📝 Criando arquivo: {path}...")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())

# --- CONTEÚDO DOS ARQUIVOS (O VISUAL SOMA VERSO) ---

CONTENT_GLOBALS_CSS = """
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #09090b; /* Zinc 950 */
  --foreground: #fafafa;
  --sidebar: #18181b;    /* Zinc 900 */
  --accent: #eab308;     /* Yellow 500 */
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
  height: 100vh;
  overflow: hidden;
}
"""

CONTENT_SIDEBAR = """
import { 
  LayoutDashboard, 
  TerminalSquare, 
  LineChart, 
  Map, 
  Lightbulb, 
  Github, 
  GitBranch,
  Settings,
  HelpCircle
} from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between text-zinc-400 text-sm font-medium">
      
      {/* Topo: Logo */}
      <div className="p-6">
        <h1 className="text-yellow-500 text-xl font-bold tracking-tight">SomaDev</h1>
      </div>

      {/* Menu Principal */}
      <div className="flex-1 px-4 space-y-8 overflow-y-auto">
        
        {/* Seção PROJECT */}
        <div className="space-y-1">
          <p className="px-2 text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Project</p>
          
          <div className="flex items-center gap-3 px-3 py-2 bg-yellow-500/10 text-yellow-500 rounded-md cursor-pointer border border-yellow-500/20">
            <LayoutDashboard size={18} />
            <span>Kanban Board</span>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-md cursor-pointer transition-colors">
            <TerminalSquare size={18} />
            <span>Agent Terminals</span>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-md cursor-pointer transition-colors">
            <LineChart size={18} />
            <span>Insights</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-md cursor-pointer transition-colors">
            <Map size={18} />
            <span>Roadmap</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-md cursor-pointer transition-colors">
            <Lightbulb size={18} />
            <span>Ideation</span>
          </div>
        </div>

        {/* Seção TOOLS */}
        <div className="space-y-1">
          <p className="px-2 text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Tools</p>
          
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-md cursor-pointer transition-colors">
            <Github size={18} />
            <span>GitHub Issues</span>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-md cursor-pointer transition-colors">
            <GitBranch size={18} />
            <span>Worktrees</span>
          </div>
        </div>
      </div>

      {/* Rodapé: Settings */}
      <div className="p-4 border-t border-zinc-800 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-md cursor-pointer transition-colors">
          <Settings size={18} />
          <span>Settings</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-md cursor-pointer transition-colors">
          <HelpCircle size={18} />
          <span>Help</span>
        </div>
      </div>
    </div>
  );
}
"""

CONTENT_LAYOUT = """
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SomaDev | SomaVerso",
  description: "AI Powered Software Factory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex`}>
        {/* Sidebar Fixa */}
        <Sidebar />
        
        {/* Conteúdo Principal Dinâmico */}
        <main className="flex-1 bg-zinc-950 text-white overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
"""

CONTENT_PAGE = """
import { FolderPlus, FolderOpen } from 'lucide-react';

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-zinc-950">
      
      {/* Texto de Boas Vindas */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Welcome to SomaDev
        </h1>
        <p className="text-zinc-400 text-lg">
          Build software autonomously with AI-powered agents managed by Sara.
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 mb-16">
        <button className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <FolderPlus size={20} />
          New Project
        </button>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg border border-zinc-700 transition-all">
          <FolderOpen size={20} />
          Open Project
        </button>
      </div>

      {/* Área Vazia (Empty State) */}
      <div className="w-full max-w-2xl p-12 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/30">
        <FolderOpen size={48} className="mb-4 opacity-50" />
        <p className="font-medium">No projects yet</p>
        <p className="text-sm">Create a new project or open an existing one to get started</p>
      </div>
    </div>
  );
}
"""

# --- SCRIPT DE EXECUÇÃO ---

def main():
    print(f"🚀 Aplicando design SomaVerso no frontend existente...")
    
    # 2. Instalar Lucide React (Ícones)
    print("📦 Instalando biblioteca de ícones...")
    run_command("npm install lucide-react")

    # 3. Reescrever arquivos com o Design System SomaVerso
    # Assume que estamos na raiz de 'frontend'
    base_path = "src"
    
    # Criar pasta components
    os.makedirs(os.path.join(base_path, "components"), exist_ok=True)
    
    # Escrever os arquivos
    create_file(os.path.join(base_path, "app", "globals.css"), CONTENT_GLOBALS_CSS)
    create_file(os.path.join(base_path, "components", "Sidebar.tsx"), CONTENT_SIDEBAR)
    create_file(os.path.join(base_path, "app", "layout.tsx"), CONTENT_LAYOUT)
    create_file(os.path.join(base_path, "app", "page.tsx"), CONTENT_PAGE)

    print("\n" + "="*50)
    print("✅ DESIGN SOMA-DEV APLICADO!")
    print("="*50)

if __name__ == "__main__":
    main()
