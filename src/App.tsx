import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { useResponsive } from './utils/useResponsive';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { QuickMobileFab } from './components/layout/QuickMobileFab';
import { OfflineSyncBanner } from './components/layout/OfflineSyncBanner';
import { CreateProjectModal } from './components/projects/CreateProjectModal';
import { AppRoutes } from './routes/AppRoutes';

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // If not logged in, render the Auth views cleanly
  if (!isAuthenticated) {
    return <AppRoutes onOpenNewProject={() => setShowCreateModal(true)} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden select-none sm:select-auto" dir="rtl">
      
      {/* Real-time Field Connectivity & Offline Sync Banner */}
      <OfflineSyncBanner />

      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        
        {/* Navigation Sidebar (Desktop Full / Tablet Rail / Mobile Drawer) */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onCloseMobile={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Area with Header and Scrollable Body */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
          {/* Top Header */}
          <Header 
            onOpenNewProject={() => setShowCreateModal(true)} 
            onToggleSidebar={() => {
              setIsSidebarCollapsed(prev => !prev);
            }}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          {/* Scrollable Viewport Content - Modular AppRoutes */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-6 transition-all duration-200 overscroll-y-contain">
            <div className="max-w-7xl mx-auto w-full">
              <AppRoutes onOpenNewProject={() => setShowCreateModal(true)} />
            </div>
          </main>

          {/* Mobile Speed Dial Quick Action Button */}
          <QuickMobileFab onOpenNewProject={() => setShowCreateModal(true)} />

        </div>

      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)} 
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}
