import React, { useState, useEffect } from 'react';
import { useApp, getRoleLabel } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Bell, 
  Search, 
  Plus, 
  Layers, 
  ShieldCheck, 
  RefreshCw, 
  MessageSquare, 
  CheckCircle2,
  X,
  Menu
} from 'lucide-react';

interface HeaderProps {
  onOpenNewProject: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewProject, onToggleSidebar }) => {
  const { 
    currentUser, 
    activeRole, 
    setActiveRole, 
    projects, 
    selectedProjectId, 
    setSelectedProjectId,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    searchQuery,
    setSearchQuery,
    syncWithDaftra,
    syncWithMagicPlan,
    setNavigationTab,
    navigationTab
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: 'owner', title: 'مالك المشروع (Owner)', desc: 'صلاحيات إدارية ومالية كاملة' },
    { role: 'project_manager', title: 'مدير المشروع (PM)', desc: 'إدارة المهام والتكاليف والتقارير' },
    { role: 'architect', title: 'مهندس معماري (Architect)', desc: 'إدارة المخططات ونماذج MagicPlan' },
    { role: 'civil_engineer', title: 'مهندس إنشائي / موقع', desc: 'متابعة التنفيذ وضبط الجودة' },
    { role: 'contractor', title: 'المقاول الرئيسي (Contractor)', desc: 'تحديث التنفيذ ورفع الفواتير' },
    { role: 'consultant', title: 'استشاري هندسي (Consultant)', desc: 'مراجعة المخططات والاعتمادات' },
    { role: 'client', title: 'العميل (Client)', desc: 'متابعة الإنجاز والتقارير' },
  ];

  const handleGlobalSync = async () => {
    setIsSyncing(true);
    await Promise.all([syncWithDaftra(), syncWithMagicPlan()]);
    setTimeout(() => setIsSyncing(false), 800);
  };

  const getPageTitle = () => {
    switch (navigationTab) {
      case 'dashboard': return 'لوحة المعلومات المركزية';
      case 'projects': return 'إدارة المشاريع المعمارية';
      case 'project-detail': return 'بيانات وتفاصيل المشروع';
      case 'phases': return 'المراحل الهندسية السبع';
      case 'tasks': return 'لوحة المهام ومتابعة التنفيذ';
      case 'magicplan': return 'مستعرض مخططات MagicPlan';
      case 'costs': return 'الميزانية والتدفقات المالية';
      case 'deftera':
      case 'daftra': return 'مركز تكامل دفترة المحاسبي';
      case 'whatsapp': return 'مركز وسائط واتساب الميداني';
      case 'documents': return 'المستندات والمخططات الهندسية';
      case 'suppliers': return 'دليل الموردين والمقاولين';
      case 'reports':
      case 'reports-ai': return 'المستشار الذكي والتقارير';
      case 'settings': return 'إعدادات النظام والصلاحيات';
      default: return 'لوحة المعلومات المركزية';
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 transition-colors z-30">
      
      {/* Right / Start: Mobile Toggle & Page Title & Project Selector */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900 dark:text-white truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Quick Project Select Dropdown */}
        <div className="relative hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
          <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-transparent font-medium text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer pr-1"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                {p.name} ({p.progress}%)
              </option>
            ))}
          </select>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden xl:block w-64">
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث سريع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs rounded-lg pr-8 pl-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Left / End Section: Time Indicator, Sync, Role Switcher, Notifications, New Project */}
      <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-slate-500 shrink-0">
        
        {/* Live Clock Indicator */}
        {currentTime && (
          <span className="hidden sm:inline text-xs font-mono text-slate-500 dark:text-slate-400">
            الساعة: {currentTime}
          </span>
        )}

        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

        {/* Manual Sync Trigger */}
        <button
          onClick={handleGlobalSync}
          disabled={isSyncing}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition"
          title="مزامنة شاملة مع دفترة و MagicPlan"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* RBAC Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
            title="تبديل دور المستخدم لمعاينة الصلاحيات (RBAC)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline font-semibold">{getRoleLabel(activeRole).split(' ')[0]}</span>
            <span className="text-[9px] opacity-75">▼</span>
          </button>

          {showRoleMenu && (
            <div 
              className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowRoleMenu(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  تبديل دور المستخدم (صلاحيات RBAC)
                </p>
              </div>
              {rolesList.map((item) => (
                <button
                  key={item.role}
                  onClick={() => setActiveRole(item.role)}
                  className={`w-full text-right px-3 py-1.5 text-xs flex flex-col gap-0.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                    activeRole === item.role ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.title}</span>
                    {activeRole === item.role && <CheckCircle2 className="w-3 h-3 text-indigo-600" />}
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">{item.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition"
            title="الإشعارات والتنبيهات"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-3 z-50">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">الإشعارات</span>
                </div>
                {unreadNotificationsCount > 0 && (
                  <button 
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">لا توجد إشعارات جديدة</p>
                ) : (
                  notifications.map((ntf) => (
                    <div 
                      key={ntf.id}
                      onClick={() => markNotificationAsRead(ntf.id)}
                      className={`p-3 text-right transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 ${
                        !ntf.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${!ntf.read ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {ntf.title}
                        </p>
                        <span className="text-[9px] text-slate-400 shrink-0">
                          {new Date(ntf.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {ntf.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* High Density CTA Button */}
        <button
          onClick={onOpenNewProject}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-1.5 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>مشروع جديد</span>
        </button>

      </div>
    </header>
  );
};

