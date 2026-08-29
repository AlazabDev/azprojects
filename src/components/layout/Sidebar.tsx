import React from 'react';
import { useApp, getRoleLabel } from '../../context/AppContext';
import { useAuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard,
  Building2,
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
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  onToggleCollapse 
}) => {
  const { 
    navigationTab, 
    setNavigationTab, 
    projects,
    tasks,
    activeRole
  } = useApp();

  const { user: authUser } = useAuthContext();

  const displayRole = authUser?.role || activeRole || 'owner';
  const roleLabel = getRoleLabel(displayRole).split(' ')[0] || 'المالك';

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
      id: 'whatsapp',
      label: 'واتساب الميداني والوسائط',
      icon: MessageSquare
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
          fixed lg:static top-0 right-0 z-40
          h-screen bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex flex-col shrink-0
          border-l border-slate-200 dark:border-slate-800 transition-all duration-200 ease-in-out select-none
          ${isOpen ? 'translate-x-0' : 'translate-x-0'}
          ${isCollapsed ? 'w-[68px]' : 'w-64'}
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
                  className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="توسيع القائمة (إظهار الأسماء بجوار الأيقونات)"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          )}

        </div>

        {/* Navigation Items List */}
        <nav className={`flex-1 py-3 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-none ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = 
              navigationTab === item.id || 
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

                      {/* Clean Badge Dot anchored to the top-left of the icon (safely within the 68px box) */}
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

        {/* Footer info (when expanded) */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 text-center shrink-0">
            AzProjects v2.5 • مؤسسة العزب
          </div>
        )}

      </aside>
    </>
  );
};
