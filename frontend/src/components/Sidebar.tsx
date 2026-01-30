"use client";

import {
  LayoutDashboard,
  TerminalSquare,
  LineChart,
  Map,
  Lightbulb,
  Github,
  GitBranch,
  Settings,
  HelpCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Helper para renderizar o Link com o estilo unificado
  const SidebarLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = isActive(href);
    return (
      <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all relative overflow-hidden group ${active
        ? 'bg-gradient-to-r from-zinc-900 to-zinc-800 text-orange-400 border-l-2 border-orange-500 shadow-md'
        : 'hover:bg-white/5 hover:text-white'
        }`}>
        {active && <div className="absolute inset-0 bg-orange-500/5 transition-colors" />}
        <Icon size={18} className="relative z-10" />
        <span className={`relative z-10 ${active ? 'font-bold' : ''}`}>{label}</span>
      </Link>
    );
  };

  return (
    <div className="w-64 h-screen relative flex flex-col justify-between text-zinc-400 text-sm font-medium z-50 bg-zinc-950 border-r border-white/10">

      {/* Conteúdo */}
      <div className="relative z-30 flex flex-col h-full">

        {/* Topo: Logo */}
        <div className="p-6 flex justify-center relative items-center h-40">
          <div className="absolute bg-orange-500/10 blur-3xl w-40 h-40 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
          <img src="/logo.png" alt="SomaDev" className="h-[103px] w-auto max-w-full object-contain relative z-10" />
        </div>

        {/* Menu Principal */}
        <div className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar">

          {/* Seção PROJECT */}
          <div className="space-y-1">
            <p className="px-2 text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Project</p>
            <SidebarLink href="/" icon={LayoutDashboard} label="Kanban Board" />
            <SidebarLink href="/canvas" icon={Eye} label="Canvas Preview" />
            <SidebarLink href="/agents" icon={TerminalSquare} label="Agent Terminals" />
            <SidebarLink href="/insights" icon={LineChart} label="Insights" />
            <SidebarLink href="/roadmap" icon={Map} label="Roadmap" />
            <SidebarLink href="/ideation" icon={Lightbulb} label="Ideation" />
          </div>

          {/* Seção TOOLS */}
          <div className="space-y-1">
            <p className="px-2 text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Tools</p>
            <SidebarLink href="/github" icon={Github} label="GitHub Issues" />
            <SidebarLink href="/worktrees" icon={GitBranch} label="Worktrees" />
          </div>
        </div>

        {/* Rodapé: Settings */}
        <div className="p-4 border-t border-white/5 space-y-1 bg-black/10 backdrop-blur-md">
          <SidebarLink href="/settings" icon={Settings} label="Settings" />
          <SidebarLink href="/help" icon={HelpCircle} label="Help" />
        </div>
      </div>
    </div>
  );
}