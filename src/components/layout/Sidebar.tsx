import {
  LayoutDashboard,
  Palette,
  Kanban,
  Bot,
  Rocket,
  Settings,
  Terminal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import type { ViewType } from '@/types';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  badge?: number;
  color?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-soma-cyan' },
  { id: 'canvas', label: 'SomaDesign', icon: Palette, color: 'text-soma-purple', badge: 2 },
  { id: 'kanban', label: 'Kanban Board', icon: Kanban, color: 'text-soma-orange' },
  { id: 'agents', label: 'Agentes', icon: Bot, color: 'text-soma-blue' },
  { id: 'deploy', label: 'SomaHost', icon: Rocket, color: 'text-soma-red' },
  { id: 'logs', label: 'Logs', icon: Terminal, color: 'text-soma-yellow' },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarOpen ? 260 : 72,
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen",
        "bg-sidebar border-r border-sidebar-border",
        "flex flex-col"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-24 px-2 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {sidebarOpen ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center justify-center w-full h-full"
            >
              <div className="relative w-full h-full flex justify-center items-center">
                <div className="h-full w-full flex items-center justify-center overflow-hidden">
                  <img src="/somadev_v3.png" alt="SomaDev Logo" className="h-[85%] w-auto object-contain" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mx-auto"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src="/somadev_v3.png" alt="SomaDev Logo" className="w-full h-full object-contain" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-soma-green animate-pulse" />
              </div>
            </motion.div>
          )
          }
        </AnimatePresence >

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            "transition-transform duration-200",
            !sidebarOpen && "rotate-180"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div >

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {
          navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  "transition-all duration-200 group relative",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-soma-cyan"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div className={cn(
                  "relative flex items-center justify-center",
                  isActive && item.color
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                  {isActive && (
                    <div className={cn(
                      "absolute inset-0 blur-lg opacity-50",
                      item.color?.replace('text-', 'bg-')
                    )} />
                  )}
                </div>

                {/* Label */}
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-overflow flex-1 text-left"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {item.badge && sidebarOpen && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-2 py-0.5 text-xs font-mono bg-soma-cyan/20 text-soma-cyan rounded-full"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.button>
            );
          })
        }
      </nav>

      {/* Collapse Button (when collapsed) */}
      {
        !sidebarOpen && (
          <div className="p-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="w-full h-10 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )
      }

      {/* Footer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-t border-sidebar-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-soma-green to-soma-cyan flex items-center justify-center">
                <span className="text-xs font-bold text-white">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  João Developer
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  Admin
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-soma-green animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside >
  );
}
