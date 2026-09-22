import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuthContext } from '../../context/AuthContext';
import { SyncModal } from '../modals/SyncModal';
import { 
  Bell, 
  Search, 
  LayoutGrid, 
  User, 
  Settings, 
  LogOut, 
  CheckCheck, 
  Info, 
  ClipboardList, 
  LayoutDashboard, 
  Building2, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  Users, 
  FileText, 
  MessageCircle, 
  Network, 
  X,
  CheckSquare,
  Camera,
  ShieldCheck,
  RefreshCw,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  onOpenNewProject: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

interface ProjectNotification {
  id: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  read: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar,
  isSidebarCollapsed 
}) => {
  const { 
    navigationTab, 
    setNavigationTab, 
    projects, 
    setSelectedProjectId,
    tasks,
    costs,
    documents,
    searchQuery,
    setSearchQuery,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    t,
    isRtl
  } = useApp();

  const { user: authUser, logout } = useAuthContext();

  // Dropdown States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppsGrid, setShowAppsGrid] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Notification items matching architectural / construction operations
  const [projectNotifications, setProjectNotifications] = useState<ProjectNotification[]>([
    {
      id: 'ntf-1',
      title: 'اعتماد المخططات المعمارية',
      subtitle: 'تم اعتماد المخططات التنفيذية بنجاح من مكتب الاستشاري',
      timeAgo: 'منذ ساعتين',
      read: false
    },
    {
      id: 'ntf-2',
      title: 'صب خرسانة المسلحة',
      subtitle: 'تم الانتهاء من صب خرسانة الدور الأول لمشروع الأرابيسك بنجاح',
      timeAgo: 'منذ 5 ساعات',
      read: false
    },
    {
      id: 'ntf-3',
      title: 'تسجيل سداد مستخلص',
      subtitle: 'تم تسجيل سداد مستخلص الأعمال الإنشائية من العميل',
      timeAgo: 'منذ يوم',
      read: false
    },
    {
      id: 'ntf-4',
      title: 'إصدار فاتورة ضريبية',
      subtitle: 'تم إصدار الفاتورة الضريبية لمشروع برج اليمامة عبر دفترة',
      timeAgo: 'منذ يومين',
      read: false
    },
    {
      id: 'ntf-5',
      title: 'فحص كود البناء السعودي SBC',
      subtitle: 'تم اجتياز فحص السلامة والإنشاءات بنجاح للمرحلة الجارية',
      timeAgo: 'منذ 3 أيام',
      read: false
    }
  ]);

  // Click Outside Handlers
  const notificationsRef = useRef<HTMLDivElement>(null);
  const appsGridRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (appsGridRef.current && !appsGridRef.current.contains(target)) {
        setShowAppsGrid(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    setProjectNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Apps launcher items tailored to AzProjects ERP
  const appsList = [
    { id: 'projects', label: 'المشاريع', icon: Building2, bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600', route: 'projects' },
    { id: 'tasks', label: 'المهام الإنشائية', icon: ClipboardList, bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600', route: 'tasks' },
    { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-500', route: 'dashboard' },
    { id: 'costs', label: 'التكاليف والفواتير', icon: DollarSign, bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600', route: 'costs' },
    { id: 'phases', label: 'الجدول الزمني', icon: Calendar, bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-green-600', route: 'phases' },
    { id: 'reports', label: 'التقارير', icon: BarChart3, bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600', route: 'reports' },
    { id: 'documents', label: 'المخططات والمستندات', icon: FileText, bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-600', route: 'documents' },
    { id: 'suppliers', label: 'الموردين والمقاولين', icon: Users, bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-600', route: 'suppliers' },
    { id: 'gallery', label: 'المعرض و MagicPlan', icon: Camera, bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-600', route: 'gallery' },
    { id: 'whatsapp', label: 'تواصل الموقع', icon: MessageCircle, bg: 'bg-lime-50 dark:bg-lime-950/40', text: 'text-lime-600', route: 'field-communication' },
    { id: 'sbc', label: 'كود البناء SBC', icon: ShieldCheck, bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600', route: 'sbc-compliance' },
    { id: 'portal', label: 'بوابة العملاء', icon: Network, bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600', route: 'client-governance' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', route: 'settings' }
  ];

  // Search Results Filtering
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchResults = trimmedQuery.length > 0 ? {
    projects: projects.filter(p => p.name.toLowerCase().includes(trimmedQuery) || p.clientName.toLowerCase().includes(trimmedQuery)).slice(0, 3),
    tasks: tasks.filter(t => t.title.toLowerCase().includes(trimmedQuery) || t.description?.toLowerCase().includes(trimmedQuery)).slice(0, 3),
    costs: costs.filter(c => c.description.toLowerCase().includes(trimmedQuery) || c.invoiceNumber?.toLowerCase().includes(trimmedQuery)).slice(0, 3),
    documents: documents.filter(d => d.name.toLowerCase().includes(trimmedQuery)).slice(0, 3)
  } : null;

  const totalResultsCount = searchResults 
    ? searchResults.projects.length + searchResults.tasks.length + searchResults.costs.length + searchResults.documents.length
    : 0;

  // Display user information
  const userName = authUser?.name || 'م. أحمد العزب';
  const userEmail = authUser?.email || 'alazab.construction@gmail.com';
  const userRole = 'المالك';
  const avatarLetter = 'ع';

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 shrink-0 transition-colors z-30 relative select-none" dir="rtl">
      
      {/* 1. Right Side (RTL Start): Sidebar Toggle & Brand Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        
        {/* Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isSidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
          >
            <svg 
              className="w-5 h-5 transition-transform duration-200" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2.5" />
              <path d="M15 3v18" />
            </svg>
          </button>
        )}

        {/* Brand Logo & Name: AzProjects / لوحة التحكم المركزية */}
        <div 
          onClick={() => setNavigationTab('dashboard')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          title={`${t('appName')} - ${t('appSubtitle')}`}
        >
          {/* Logo Badge: Royal Navy (#030957) with Golden Accent (#FFB900) */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#030957] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform relative ring-1 ring-[#030957]/30">
            <Building2 className="w-5 h-5 text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFB900] ring-1.5 ring-white dark:ring-slate-900 shadow-2xs" />
          </div>

          <div className="flex flex-col text-right">
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1">
              <span>AzProjects</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB900] inline-block" />
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-none mt-0.5">
              {t('appSubtitle')}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Middle Section: Preserved Modern Search Box */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-sm md:max-w-md lg:max-w-lg mx-2 sm:mx-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl pr-9 pl-8 py-2 outline-none border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#030957] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#030957] dark:focus:ring-blue-500 transition shadow-2xs"
          />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              className="absolute left-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Popover */}
        {showSearchResults && trimmedQuery.length > 0 && (
          <div className="absolute top-full right-0 left-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
            {totalResultsCount === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                لا توجد نتائج مطابقة لـ "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-3 px-2">
                
                {/* Matching Projects */}
                {searchResults && searchResults.projects.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 px-3 py-1 flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-blue-500" />
                      <span>المشاريع</span>
                    </div>
                    {searchResults.projects.map(prj => (
                      <button
                        key={prj.id}
                        onClick={() => {
                          setSelectedProjectId(prj.id);
                          setNavigationTab('project-detail');
                          setShowSearchResults(false);
                        }}
                        className="w-full text-right px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{prj.name}</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold shrink-0">{prj.progress}%</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Matching Tasks */}
                {searchResults && searchResults.tasks.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 px-3 py-1 flex items-center gap-1.5">
                      <CheckSquare className="w-3 h-3 text-emerald-500" />
                      <span>المهام الإنشائية</span>
                    </div>
                    {searchResults.tasks.map(tsk => (
                      <button
                        key={tsk.id}
                        onClick={() => {
                          setSelectedProjectId(tsk.projectId);
                          setNavigationTab('tasks');
                          setShowSearchResults(false);
                        }}
                        className="w-full text-right px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="text-slate-800 dark:text-slate-200 truncate">{tsk.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{tsk.status === 'done' ? 'مكتملة' : 'قيد التنفيذ'}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Matching Costs/Invoices */}
                {searchResults && searchResults.costs.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 px-3 py-1 flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3 text-amber-500" />
                      <span>التكاليف والفواتير</span>
                    </div>
                    {searchResults.costs.map(cst => (
                      <button
                        key={cst.id}
                        onClick={() => {
                          setSelectedProjectId(cst.projectId);
                          setNavigationTab('costs');
                          setShowSearchResults(false);
                        }}
                        className="w-full text-right px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="text-slate-800 dark:text-slate-200 truncate">{cst.description}</span>
                        <span className="text-[10px] font-bold text-emerald-600 shrink-0">
                          {cst.actualAmount.toLocaleString()} ر.س
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Matching Documents */}
                {searchResults && searchResults.documents.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 px-3 py-1 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-indigo-500" />
                      <span>المستندات والمخططات</span>
                    </div>
                    {searchResults.documents.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setSelectedProjectId(doc.projectId);
                          setNavigationTab('documents');
                          setShowSearchResults(false);
                        }}
                        className="w-full text-right px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="text-slate-800 dark:text-slate-200 truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{doc.documentType}</span>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Actions: Language Switcher, Theme Mode, Sync, Notifications, Apps, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

        {/* 3.0 Bilingual Language Switcher (Arabic Primary / English) */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs group"
          title={language === 'ar' ? 'Switch to English (تحويل للإنجليزية)' : 'التبديل إلى العربية (Switch to Arabic)'}
        >
          <Globe className="w-3.5 h-3.5 text-[#030957] dark:text-blue-400 group-hover:rotate-12 transition-transform" />
          <span className="font-bold tracking-wider text-[11px]">
            {language === 'ar' ? 'EN' : 'عربي'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFB900] shadow-2xs" />
        </button>

        {/* 3.1 Theme Mode Switcher (Light Mode is Primary / Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer border border-slate-200/80 dark:border-slate-800"
          title={theme === 'dark' 
            ? (language === 'ar' ? 'التبديل إلى الوضع النهاري (Light Mode)' : 'Switch to Light Mode')
            : (language === 'ar' ? 'التبديل إلى الوضع الليلي (Dark Mode)' : 'Switch to Dark Mode')
          }
        >
          {theme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-[#FFB900]" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-[#030957]" />
          )}
        </button>

        {/* 3.2 Live Sync Trigger Button with Daftra & MagicPlan */}
        <button
          onClick={() => setShowSyncModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-850 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
          title="التزامن الفعلي مع دفترة و MagicPlan"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">مزامنة دفترة & ماجيك بلان</span>
          <span className="xl:hidden inline">{t('sync')}</span>
        </button>

        {/* 3.1 Notifications Bell with Red Badge "50" (matching Image 5 & 4) */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowAppsGrid(false);
              setShowProfileMenu(false);
            }}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition relative cursor-pointer"
            title="الإشعارات والتنبيهات"
          >
            <Bell className="w-5 h-5" />
            {/* Red Circle Badge showing "50" as requested in screenshots */}
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-900 leading-none">
              {unreadNotificationsCount > 0 ? unreadNotificationsCount : 50}
            </span>
          </button>

          {/* Notifications Popover (Pixel-perfect matching Image 4) */}
          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 max-w-[94vw] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-right">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  الإشعارات
                </h3>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>تحديد الكل كمقروء</span>
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                {projectNotifications.map((ntf) => (
                  <div
                    key={ntf.id}
                    onClick={() => {
                      setProjectNotifications(prev => prev.map(item => item.id === ntf.id ? { ...item, read: true } : item));
                    }}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer ${
                      !ntf.read ? 'bg-blue-50/25 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {/* Blue Info Circle Icon matching Image 4 */}
                    <div className="p-1 rounded-full text-blue-500 bg-blue-50 dark:bg-blue-950 shrink-0 mt-0.5">
                      <Info className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {ntf.title}
                        </h4>
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {ntf.subtitle}
                      </p>

                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 block">
                        {ntf.timeAgo}
                      </span>
                    </div>

                    {/* Unread blue dot indicator */}
                    {!ntf.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                    )}
                  </div>
                ))}
              </div>

              {/* View All Notifications CTA */}
              <div className="px-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    setNavigationTab('notifications');
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  عرض جميع الإشعارات والجدول الزمني ←
                </button>
              </div>

            </div>
          )}
        </div>

        {/* 3.2 Apps Grid Launcher Button (matching Image 5 & 3) */}
        <div ref={appsGridRef} className="relative">
          <button
            onClick={() => {
              setShowAppsGrid(!showAppsGrid);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="التطبيقات"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          {/* Apps Grid Popover (Pixel-perfect matching Image 3) */}
          {showAppsGrid && (
            <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-100 text-right">
              
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  التطبيقات
                </h3>
              </div>

              {/* 3-Column Apps Grid matching Image 3 */}
              <div className="grid grid-cols-3 gap-3">
                {appsList.map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        setNavigationTab(app.route);
                        setShowAppsGrid(false);
                      }}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition cursor-pointer group"
                    >
                      {/* Colorful rounded icon container */}
                      <div className={`w-12 h-12 rounded-2xl ${app.bg} ${app.text} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform mb-1.5`}>
                        <Icon className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 text-center truncate max-w-full leading-tight">
                        {app.label}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* 3.3 User Profile Trigger (matching Image 5 & 2: Avatar "M" + "مستخدم / المالك") */}
        <div ref={profileMenuRef} className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
              setShowAppsGrid(false);
            }}
            className="flex items-center gap-2 sm:gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 sm:px-2 sm:py-1 rounded-xl transition cursor-pointer"
          >
            {/* User Details (Text next to avatar) */}
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {userName}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                {userRole}
              </span>
            </div>

            {/* Circular Avatar: Royal Navy #030957 with subtle gold accent */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#030957] text-white font-bold text-sm sm:text-base flex items-center justify-center shadow-xs ring-2 ring-[#FFB900]/40 shrink-0 relative">
              {avatarLetter}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
          </button>

          {/* User Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 ${isRtl ? 'text-right' : 'text-left'}`}>
              
              {/* User Header Profile Card */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-2">
                <div className="w-12 h-12 rounded-full bg-[#030957] text-white font-bold text-lg flex items-center justify-center shadow-xs shrink-0 ring-2 ring-[#FFB900]/40">
                  {avatarLetter}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {userName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5" dir="ltr">
                    {userEmail}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md">
                    {userRole}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1.5" />

              {/* Menu Options */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setNavigationTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{t('myProfile')}</span>
                </button>

                <button
                  onClick={() => {
                    setNavigationTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{t('accountSettings')}</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1.5" />

              {/* Logout Option in Red */}
              <button
                onClick={async () => {
                  setShowProfileMenu(false);
                  await logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{t('logout')}</span>
              </button>

            </div>
          )}
        </div>

      </div>

      {/* Real-time Daftra & MagicPlan Live Sync Modal */}
      {showSyncModal && (
        <SyncModal
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
        />
      )}

    </header>
  );
};
