import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ProjectsPage } from '../pages/projects/ProjectsPage';
import { ProjectDetailPage } from '../pages/projects/ProjectDetailPage';
import { PhasesPage } from '../pages/phases/PhasesPage';
import { TasksPage } from '../pages/tasks/TasksPage';
import { CostsPage } from '../pages/costs/CostsPage';
import { DocumentsPage } from '../pages/documents/DocumentsPage';
import { IntegrationsHubPage } from '../pages/integrations/IntegrationsHubPage';
import { WhatsAppPage } from '../pages/integrations/WhatsAppPage';
import { DaftraPage } from '../pages/integrations/DaftraPage';
import { MagicPlanPage } from '../pages/integrations/MagicPlanPage';
import { EdgeFunctionsPage } from '../pages/integrations/EdgeFunctionsPage';
import { AIAssistantPage } from '../pages/ai/AIAssistantPage';
import { SuppliersPage } from '../pages/suppliers/SuppliersPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

interface AppRoutesProps {
  onOpenNewProject: () => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ onOpenNewProject }) => {
  const { navigationTab } = useApp();
  const { isAuthenticated, isLoading } = useAuthContext();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">جاري التحقق من الجلسة والصلاحيات...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated and is trying to access protected area
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  // Authenticated View Router
  switch (navigationTab) {
    case 'dashboard':
      return <DashboardPage onOpenNewProject={onOpenNewProject} />;
    
    case 'projects':
      return <ProjectsPage onOpenNewProject={onOpenNewProject} />;
    
    case 'project-detail':
      return <ProjectDetailPage />;
    
    case 'phases':
      return <PhasesPage />;
    
    case 'tasks':
      return <TasksPage />;
    
    case 'costs':
      return <CostsPage />;
    
    case 'documents':
      return <DocumentsPage />;
    
    case 'integrations':
      return <IntegrationsHubPage />;
    
    case 'edge-functions':
      return <EdgeFunctionsPage />;
    
    case 'whatsapp':
      return <WhatsAppPage />;
    
    case 'daftra':
    case 'deftera':
      return <DaftraPage />;
    
    case 'magicplan':
      return <MagicPlanPage />;
    
    case 'reports':
    case 'reports-ai':
    case 'ai-assistant':
      return <AIAssistantPage />;
    
    case 'suppliers':
      return <SuppliersPage />;
    
    case 'notifications':
      return <NotificationsPage />;
    
    case 'team':
    case 'settings':
      return <SettingsPage />;
    
    default:
      return <DashboardPage onOpenNewProject={onOpenNewProject} />;
  }
};
