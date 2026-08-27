import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useResponsive } from './utils/useResponsive';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MobileMoreDrawer } from './components/layout/MobileMoreDrawer';
import { QuickMobileFab } from './components/layout/QuickMobileFab';
import { OfflineSyncBanner } from './components/layout/OfflineSyncBanner';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ProjectList } from './components/projects/ProjectList';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { PhasesManager } from './components/phases/PhasesManager';
import { KanbanBoard } from './components/tasks/KanbanBoard';
import { CostManager } from './components/costs/CostManager';
import { MagicPlanViewer } from './components/integrations/MagicPlanViewer';
import { DocumentManager } from './components/documents/DocumentManager';
import { WhatsAppHub } from './components/integrations/WhatsAppHub';
import { DaftraSyncHub } from './components/integrations/DaftraSyncHub';
import { ReportsAndAiAssistant } from './components/reports/ReportsAndAiAssistant';
import { SuppliersDirectory } from './components/suppliers/SuppliersDirectory';
import { SystemSettings } from './components/settings/SystemSettings';
import { NotificationsHub } from './components/notifications/NotificationsHub';
import { CreateProjectModal } from './components/projects/CreateProjectModal';

const MainAppContent: React.FC = () => {
  const { navigationTab } = useApp();
  const { isMobile, isTablet } = useResponsive();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isTablet);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const renderCurrentView = () => {
    switch (navigationTab) {
      case 'dashboard':
        return <DashboardOverview onOpenNewProject={() => setShowCreateModal(true)} />;
      case 'notifications':
        return <NotificationsHub />;
      case 'projects':
        return <ProjectList onOpenNewProject={() => setShowCreateModal(true)} />;
      case 'project-detail':
        return <ProjectDetail />;
      case 'phases':
        return <PhasesManager />;
      case 'tasks':
        return <KanbanBoard />;
      case 'costs':
        return <CostManager />;
      case 'magicplan':
        return <MagicPlanViewer />;
      case 'documents':
        return <DocumentManager />;
      case 'whatsapp':
        return <WhatsAppHub />;
      case 'daftra':
      case 'deftera':
        return <DaftraSyncHub />;
      case 'reports':
      case 'reports-ai':
        return <ReportsAndAiAssistant />;
      case 'suppliers':
        return <SuppliersDirectory />;
      case 'team':
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardOverview onOpenNewProject={() => setShowCreateModal(true)} />;
    }
  };

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
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Scrollable Viewport Content - Mobile Bottom Inset Padding */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 lg:pb-6 transition-all duration-200 overscroll-y-contain">
            <div className="max-w-7xl mx-auto w-full">
              {renderCurrentView()}
            </div>
          </main>

          {/* Mobile Speed Dial Quick Action Button */}
          <QuickMobileFab onOpenNewProject={() => setShowCreateModal(true)} />

        </div>

      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav 
        onOpenMore={() => setIsMobileMoreOpen(true)}
        isMoreOpen={isMobileMoreOpen}
      />

      {/* Mobile More Modules Sheet / Drawer */}
      <MobileMoreDrawer 
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        onOpenNewProject={() => setShowCreateModal(true)}
      />

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
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

