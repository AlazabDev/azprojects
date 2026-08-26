import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
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
import { CreateProjectModal } from './components/projects/CreateProjectModal';

const MainAppContent: React.FC = () => {
  const { navigationTab } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const renderCurrentView = () => {
    switch (navigationTab) {
      case 'dashboard':
        return <DashboardOverview onOpenNewProject={() => setShowCreateModal(true)} />;
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
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden" dir="rtl">
      
      {/* Navigation Sidebar (RTL Right side) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onCloseMobile={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <Header 
          onOpenNewProject={() => setShowCreateModal(true)} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Scrollable Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-200">
          <div className="max-w-7xl mx-auto w-full">
            {renderCurrentView()}
          </div>
        </main>

      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
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

