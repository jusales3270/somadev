import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import {
  Dashboard,
  Canvas,
  KanbanBoard,
  Agents,
  Deploy,
  Logs
} from '@/sections';
import { useUIStore } from '@/store';
import { Settings } from '@/sections/Settings';

function ViewTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const { currentView } = useUIStore();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'canvas':
        return <Canvas />;
      case 'kanban':
        return <KanbanBoard />;
      case 'agents':
        return <Agents />;
      case 'deploy':
        return <Deploy />;
      case 'logs':
        return <Logs />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <ViewTransition key={currentView}>
        {renderView()}
      </ViewTransition>
    </AnimatePresence>
  );
}

import NeuralBackground from '@/components/ui-custom/NeuralBackground';

function App() {
  return (
    <>
      <NeuralBackground color="#FB923C" speed={0.5} />
      <Layout>
        <AppContent />
      </Layout>
    </>
  );
}

export default App;
