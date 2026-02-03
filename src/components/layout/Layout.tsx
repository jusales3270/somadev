import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

import { ChatWidget } from './ChatWidget';
import { useUIStore } from '@/store';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="relative z-10 min-h-screen bg-transparent">


      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 min-h-screen",
          "transition-all duration-300"
        )}
        style={{
          marginLeft: sidebarOpen ? '260px' : '72px',
          width: `calc(100% - ${sidebarOpen ? '260px' : '72px'})`
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="p-6"
        >
          {children}
        </motion.div>
      </main>



      {/* Chat Widget - Always visible */}
      <ChatWidget />
    </div>
  );
}
