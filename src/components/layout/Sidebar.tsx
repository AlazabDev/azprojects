import React, { useState } from 'react';
import { useApp, getRoleLabel } from '../../context/AppContext';
import { useAuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard,
  Building2,
  HardHat,
  ShieldCheck,
  Layers,
  CheckSquare,
  Compass,
  DollarSign,
  FileText,
  Bot,
  MessageSquare,
  Users,
  Calendar,
  Sliders,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Camera,
  RefreshCw,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenNewProject?: () => void;
  onOpenGallery?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeColor?: string;
  isAi?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  onOpenNewProject,
  onOpenGallery
}) => {
  const { 
    navigationTab, 
    setNavigationTab, 
    projects,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    tasks,
    whatsAppMessages,
    activeRole,
    syncWithDaftra,
    syncWithMagicPlan
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([syncWithDaftra(), syncWithMagicPlan()]);
    } catch (e) {
      console.warn('Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const { user: authUser } = useAuthContext();

  const displayRole = authUser?.role || activeRole || 'owner';
  const roleLabel = getRoleLabel(displayRole).split(' ')[0] || 'المالك';
  const unlinkedWhatsAppCount = whatsAppMessages?.filter(m => !m.assignedToPhaseId).length || 0;

  // Navigation Items - Each item has an Icon beside the Page Name
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: LayoutDashboard
    },
    {
      id: 'projects',
      label: 'المشاريع المعمارية',
      icon: Building2,
      badge: projects.length > 0 ? projects.length : undefined
    },
    {
      id: 'engineers-hub',
      label: 'لوحة تحكم المهندسين',
      icon: HardHat,
      badge: 'SBC & دفترة',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-400/30'
    },
    {
      id: 'client-governance',
      label: 'حوكمة ومزامنة العملاء (RLS)',
      icon: ShieldCheck,
      badge: '4 حية'
    },
    {
      id: 'phases',
      label: 'المراحل الهندسية',
      icon: Layers
    },
    {
      id: 'tasks',
      label: 'المهام ومتابعة التنفيذ',
      icon: CheckSquare,
      badge: tasks.filter(t => t.status !== 'done').length || undefined
    },
    {
      id: 'magicplan',
      label: 'مخططات MagicPlan',
      icon: Compass
    },
    {
      id: 'costs',
      label: 'التكاليف ودفترة (ZATCA)',
      icon: DollarSign
    },
    {
      id: 'documents',
      label: 'المستندات والمخططات',
      icon: FileText
    },
    {
      id: 'reports',
      label: 'وكيل المشروعات (Foundry AI)',
      icon: Bot,
      isAi: true
    },
    {
      id: 'field-communication',
      label: 'الاتصالات الميدانية (WhatsApp)',
      icon: MessageSquare,
      badge: unlinkedWhatsAppCount > 0 ? unlinkedWhatsAppCount : undefined
    },
    {
      id: 'suppliers',
      label: 'دليل الموردين والمقاولين',
      icon: Users
    },
    {
      id: 'notifications',
      label: 'المواعيد والتنبيهات',
      icon: Calendar
    },
    {
      id: 'integrations',
      label: 'التكاملات والربط السحابي',
      icon: Sliders
    },
    {
      id: 'settings',
      label: 'الإعدادات والصلاحيات',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop (only on small screen overlay mode) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          relative z-30
          h-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex flex-col shrink-0
          border-l border-slate-200 dark:border-slate-800 transition-all duration-200 ease-in-out select-none
          ${isCollapsed ? 'w-16' : 'w-64'}
        `} 
        dir="rtl"
      >
        
        {/* Header inside Sidebar */}
        <div className="h-16 px-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
          
          {/* Expanded Header */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                القائمة الرئيسية ({roleLabel})
              </span>
              
              {/* Collapse Button */}
              {onToggleCollapse && (
                <button 
                  onClick={onToggleCollapse}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="طي القائمة (إظهار الأيقونات فقط)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Collapsed Header - Centered Expand Button */
            <div className="flex items-center justify-center w-full">
              {onToggleCollapse && (
                <button 
                  onClick={onToggleCollapse}
                  className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="توسيع القائمة (إظهار الأسماء بجوار الأيقونات)"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          )}

        </div>

        {/* Transferred Actions from Header into Sidebar */}
        <div className={`border-b border-slate-200/80 dark:border-slate-800 shrink-0 ${isCollapsed ? 'p-2 space-y-2' : 'p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-850/40'}`}>
          {!isCollapsed ? (
            <>
              {/* Prominent New Project Action Button */}
              {onOpenNewProject && (
                <button
                  onClick={onOpenNewProject}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>مشروع جديد</span>
                </button>
              )}

              {/* Quick Actions Row: Gallery & Global Sync */}
              <div className="grid grid-cols-2 gap-1.5">
                {onOpenGallery && (
                  <button
                    onClick={onOpenGallery}
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    title="معرض المخططات والصور 2D/3D"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">المعرض</span>
                  </button>
                )}

                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  title="مزامنة شاملة مع دفترة و MagicPlan"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="truncate">{isSyncing ? 'مزامنة...' : 'مزامنة'}</span>
                </button>
              </div>

              {/* Active Project Switcher */}
              <div className="pt-0.5">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400">المشروع النشط</span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {selectedProject?.progress || 0}% إنجاز
                  </span>
                </div>
                <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1.5" />
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-0.5"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium">
                        {p.name} ({p.progress}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            /* Collapsed Quick Action Icons */
            <div className="flex flex-col items-center gap-1.5">
              {onOpenNewProject && (
                <button
                  onClick={onOpenNewProject}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
                  title="مشروع جديد"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}

              {onOpenGallery && (
                <button
                  onClick={onOpenGallery}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  title="المعرض و MagicPlan"
                >
                  <Camera className="w-4 h-4 text-blue-500" />
                </button>
              )}

              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="مزامنة مع دفترة و MagicPlan"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items List */}
        <nav className={`flex-1 py-3 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-none ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = 
              navigationTab === item.id || 
              (item.id === 'field-communication' && (navigationTab === 'whatsapp' || navigationTab === 'communication' || navigationTab === 'field-communication')) ||
              (item.id === 'reports' && (navigationTab === 'reports-ai' || navigationTab === 'ai-assistant')) ||
              (item.id === 'costs' && (navigationTab === 'daftra' || navigationTab === 'deftera')) ||
              (item.id === 'projects' && navigationTab === 'project-detail');

            return (
              <button
                key={item.id}
                onClick={() => {
                  setNavigationTab(item.id);
                  onCloseMobile();
                }}
                className={`
                  relative w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer group
                  ${isCollapsed 
                    ? 'justify-center h-10 w-full p-0' 
                    : 'justify-between px-3 py-2.5'
                  }
                  ${isActive 
                    ? item.isAi
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800/60 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                {/* When Collapsed: Single Centered Icon with Badge Dot securely anchored to Icon */}
                {isCollapsed ? (
                  <div className="flex items-center justify-center relative w-full h-full">
                    
                    {/* Centered Icon Container with Anchor for Badge Dot */}
                    <div className="relative flex items-center justify-center">
                      <Icon className={`
                        w-5 h-5 shrink-0 stroke-[2]
                        ${isActive 
                          ? item.isAi ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white' 
                          : item.isAi ? 'text-indigo-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                        }
                      `} />

                      {/* Clean Badge Dot anchored to the top-left of the icon */}
                      {item.badge !== undefined && (
                        <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </div>

                    {/* Collapsed Tooltip on Hover (Pops out to the left in RTL) */}
                    <div className="absolute right-full mr-2 hidden group-hover:flex items-center px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="mr-1.5 px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* When Expanded: Icon + Text Beside It */
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`
                        w-5 h-5 shrink-0 stroke-[2]
                        ${isActive 
                          ? item.isAi ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white' 
                          : item.isAi ? 'text-indigo-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                        }
                      `} />
                      
                      <span className="truncate text-right">
                        {item.label}
                      </span>

                      {item.isAi && (
                        <span className="px-1.5 py-0.2 rounded-md bg-indigo-600 text-white text-[9px] font-bold">
                          AI
                        </span>
                      )}
                    </div>

                    {/* Numeric Badge */}
                    {item.badge !== undefined && (
                      <span className="min-w-5 h-5 px-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sync trigger button & Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0 space-y-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              isSyncing 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' 
                : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-800'
            }`}
            title="تزامن فعلي مع دفترة و MagicPlan"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            {!isCollapsed && (
              <span className="truncate">
                {isSyncing ? 'جاري المزامنة...' : 'مزامنة دفترة & ماجيك بلان'}
              </span>
            )}
          </button>

          {!isCollapsed && (
            <div className="text-[11px] text-slate-400 text-center">
              AzProjects v2.5 • مؤسسة العزب
            </div>
          )}
        </div>

      </aside>
    </>
  );
};
