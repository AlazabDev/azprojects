import React, { useState, useEffect } from 'react';
import { useApp, getRoleLabel } from '../../context/AppContext';
import { useAuthContext } from '../../context/AuthContext';
import { ProjectGalleryModal } from '../gallery/ProjectGalleryModal';
import { 
  Bell, 
  Search, 
  Layers, 
  RefreshCw, 
  Building2, 
  Plus, 
  Clock, 
  CheckSquare, 
  DollarSign, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  X, 
  Camera,
  Bot,
  Compass
} from 'lucide-react';

interface HeaderProps {
  onOpenNewProject: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenNewProject, 
  onToggleSidebar,
  isSidebarCollapsed 
}) => {
  const { 
    currentUser, 
    activeRole, 
    navigationTab, 
    setNavigationTab, 
    projects, 
    selectedProjectId, 
    setSelectedProjectId,
    selectedProject,
    notifications,
    unreadNotificationsCount,
    criticalNotificationsCount,
    markAllNotificationsAsRead,
    syncAllIntegrations
  } = useApp();

  const { user: authUser } = useAuthContext();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleGlobalSync = async () => {
    setIsSyncing(true);
    await syncAllIntegrations();
    setIsSyncing(false);
  };

  const getPageTitle = () => {
    switch (navigationTab) {
      case 'dashboard': return 'لوحة التحكم المركزية';
      case 'projects': return 'المشاريع المعمارية';
      case 'project-detail': return 'تفاصيل المشروع النشط';
      case 'phases': return 'المراحل الهندسية (المراحل السبع)';
      case 'tasks': return 'المهام ومتابعة التنفيذ';
      case 'magicplan': return 'مخططات وتصاميم MagicPlan السحابية';
      case 'costs': return 'الميزانية والتكاليف ودفترة (ZATCA)';
      case 'deftera':
      case 'daftra': return 'تكامل دفترة المحاسبي (ZATCA Phase 2)';
      case 'whatsapp': return 'واتساب الميداني والوسائط الهندسية';
      case 'documents': return 'المستندات والمخططات الهندسية';
      case 'suppliers': return 'دليل الموردين والمقاولين';
      case 'notifications': return 'المواعيد والتنبيهات الدورية';
      case 'reports':
      case 'reports-ai':
      case 'ai-assistant': return 'وكيل المشروعات الذكي (Foundry AI)';
      case 'edge-functions': return 'دوال الحافة (Edge Functions)';
      case 'settings': return 'إعدادات النظام والصلاحيات';
      default: return 'لوحة التحكم';
    }
  };

  const getNotificationIcon = (category?: string, priority?: string) => {
    switch (category) {
      case 'deadline': return <Clock className="w-4 h-4 text-rose-500" />;
      case 'phase_update': return <Layers className="w-4 h-4 text-blue-500" />;
      case 'task_alert': return <CheckSquare className="w-4 h-4 text-amber-500" />;
      case 'budget_alert': return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'whatsapp_media': return <MessageSquare className="w-4 h-4 text-green-500" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  const displayName = authUser?.name || currentUser.name || 'م. أحمد العزب';
  const displayRole = authUser?.role || activeRole || 'owner';
  const roleLabel = getRoleLabel(displayRole);

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 transition-colors z-30 relative" dir="rtl">
        
        {/* Full-width Mobile Search Bar Overlay */}
        {showMobileSearch && (
          <div className="absolute inset-0 bg-white dark:bg-slate-900 z-50 flex items-center px-4 gap-2 animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="بحث في المشاريع، المهام، التكاليف والمستندات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none border border-slate-200 dark:border-slate-700"
            />
            <button
              onClick={() => {
                setShowMobileSearch(false);
                setSearchQuery('');
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Right / Start: Brand & Page Title */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          
          {/* App Brand Identity */}
          <div 
            onClick={() => setNavigationTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">
                AzProjects
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5 hidden sm:inline">
                مؤسسة العزب لإدارة المشاريع المعمارية
              </span>
            </div>
          </div>

          {/* Current Page Title Separator */}
          <div className="hidden md:flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-800 min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
              {getPageTitle()}
            </h1>
          </div>

        </div>

        {/* Left / End Section: Quick Actions, AI Foundry Link, Project Selector, Gallery, Notifications, New Project */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 shrink-0">
          
          {/* Quick AI Agent Shortcut */}
          <button
            onClick={() => setNavigationTab('reports')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-xl font-bold text-xs hover:bg-indigo-100 transition cursor-pointer"
            title="فتح وكيل المشروعات على منصة فوندري"
          >
            <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>وكيل المشروعات (Foundry)</span>
          </button>

          {/* Quick Project Select Dropdown */}
          <div className="relative hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none cursor-pointer pr-1"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium">
                  {p.name} ({p.progress}%)
                </option>
              ))}
            </select>
          </div>

          {/* Search Icon */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="بحث سريع"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Project Gallery Button */}
          <button
            onClick={() => setShowGalleryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="معرض المخططات والصور 2D/3D"
          >
            <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline">المعرض و MagicPlan</span>
          </button>

          {/* Sync Trigger */}
          <button
            onClick={handleGlobalSync}
            disabled={isSyncing}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="مزامنة شاملة مع دفترة و MagicPlan"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Quick Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition relative cursor-pointer"
              title="التنبيهات والمواعيد"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 ${criticalNotificationsCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'} text-white text-[9px] font-bold rounded-full flex items-center justify-center`}>
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div 
                className="absolute left-0 mt-2 w-80 sm:w-96 max-w-[94vw] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="flex items-center justify-between px-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">الإشعارات والتنبيهات</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {unreadNotificationsCount} جديد
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button 
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold cursor-pointer"
                    >
                      تحديد الكل كمقروء
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">لا توجد إشعارات جديدة حالياً</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((ntf) => (
                      <div 
                        key={ntf.id}
                        onClick={() => {
                          setShowNotifications(false);
                          setNavigationTab('notifications');
                        }}
                        className={`px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer ${
                          !ntf.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                          {getNotificationIcon(ntf.category, ntf.priority)}
                        </div>

                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center justify-between gap-1.5">
                            <h4 className={`text-xs font-semibold truncate ${!ntf.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                              {ntf.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {ntf.createdAt ? new Date(ntf.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-normal">
                            {ntf.message}
                          </p>
                        </div>

                        {!ntf.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 self-center" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="px-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setNavigationTab('notifications');
                    }}
                    className="w-full py-1.5 text-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  >
                    عرض جميع الإشعارات والجدول الزمني ({notifications.length}) ←
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* New Project CTA Button */}
          <button
            onClick={onOpenNewProject}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">مشروع جديد</span>
            <span className="xs:hidden">جديد</span>
          </button>

        </div>

      </header>

      {/* Project Gallery Modal */}
      {showGalleryModal && (
        <ProjectGalleryModal 
          isOpen={showGalleryModal} 
          onClose={() => setShowGalleryModal(false)} 
        />
      )}
    </>
  );
};
