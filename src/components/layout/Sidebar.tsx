import React from 'react';
import { useApp, getRoleLabel } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Layers, 
  CheckSquare, 
  Compass, 
  DollarSign, 
  Receipt, 
  MessageSquare, 
  FileText, 
  Users, 
  Sparkles, 
  Database, 
  Building2, 
  RotateCcw,
  ChevronLeft,
  Bell
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { 
    navigationTab, 
    setNavigationTab, 
    selectedProject, 
    resetToDefaultData, 
    whatsAppMessages,
    tasks,
    currentUser,
    activeRole,
    unreadNotificationsCount,
    criticalNotificationsCount
  } = useApp();

  const pendingTasksCount = tasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length;
  const unassignedWhatsAppCount = whatsAppMessages.filter(w => w.status === 'received' || w.status === 'processing').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم المركزية',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'notifications',
      label: 'التنبيهات والمواعيد',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? String(unreadNotificationsCount) : null,
      badgeColor: criticalNotificationsCount > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-white'
    },
    {
      id: 'projects',
      label: 'إدارة المشاريع',
      icon: FolderKanban,
      badge: null
    },
    {
      id: 'project-detail',
      label: 'المشروع الحالي النشط',
      icon: Building2,
      highlight: true
    },
    {
      id: 'phases',
      label: 'المراحل الهندسية (Phases)',
      icon: Layers,
      badge: null
    },
    {
      id: 'tasks',
      label: 'المهام ولوحة كانبان',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? String(pendingTasksCount) : null
    },
    {
      id: 'magicplan',
      label: 'المخططات و MagicPlan',
      icon: Compass,
      badge: '2D/3D'
    },
    {
      id: 'costs',
      label: 'الميزانية والتكاليف',
      icon: DollarSign,
      badge: null
    },
    {
      id: 'deftera',
      label: 'تكامل دفترة المحاسبي',
      icon: Receipt,
      badge: 'ZATCA'
    },
    {
      id: 'whatsapp',
      label: 'مركز وسائط واتساب',
      icon: MessageSquare,
      badge: unassignedWhatsAppCount > 0 ? String(unassignedWhatsAppCount) : null,
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'documents',
      label: 'المستندات والمخططات',
      icon: FileText,
      badge: null
    },
    {
      id: 'suppliers',
      label: 'الموردون والمقاولون',
      icon: Building2,
      badge: null
    },
    {
      id: 'reports-ai',
      label: 'التقارير ومساعد AI',
      icon: Sparkles,
      badge: 'Gemini',
      badgeColor: 'bg-indigo-500 text-white'
    },
    {
      id: 'team',
      label: 'الفريق والصلاحيات',
      icon: Users,
      badge: null
    },
    {
      id: 'settings',
      label: 'الإعدادات وقاعدة البيانات',
      icon: Database,
      badge: null
    }
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]} ${parts[1][0]}`;
    return name.slice(0, 2);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed lg:static top-0 right-0 z-40
        h-screen w-64 bg-slate-900 text-white flex flex-col shrink-0
        border-l border-slate-800 transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-4 lg:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-base text-white shadow-xs">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">AzProjects</span>
                <span className="text-[9px] px-1 py-0.2 font-bold uppercase rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">v2.4</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">إدارة المشاريع المعمارية</p>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-white lg:hidden rounded-md hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Project Quick Status Card */}
        {selectedProject && (
          <div className="mx-2.5 mt-2.5 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">المشروع النشط</span>
              <span className="text-[11px] font-bold text-emerald-400">{selectedProject.progress}%</span>
            </div>
            <p className="text-xs font-bold text-slate-100 truncate" title={selectedProject.name}>
              {selectedProject.name}
            </p>
            {/* High Density Mini Progress Bar */}
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${selectedProject.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>الميزانية: {(selectedProject.budget / 1000).toFixed(0)}K ر.س</span>
              <span>{selectedProject.floorsCount} طوابق</span>
            </div>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = navigationTab === item.id || (item.id === 'reports-ai' && navigationTab === 'reports') || (item.id === 'deftera' && navigationTab === 'daftra');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setNavigationTab(item.id);
                  onCloseMobile();
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition group
                  ${isActive 
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs' 
                    : item.highlight
                    ? 'text-indigo-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700')}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Card & Footer Actions */}
        <div className="p-3 border-t border-slate-800 flex flex-col gap-2">
          {/* User Badge */}
          <div 
            onClick={() => setNavigationTab('settings')}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer transition"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold text-xs shrink-0">
              {getInitials(currentUser.name || 'أحمد محمد')}
            </div>
            <div className="min-w-0 flex-1 text-right">
              <div className="text-xs font-bold text-slate-100 truncate">{currentUser.name || 'أحمد محمد'}</div>
              <div className="text-[10px] text-slate-400 truncate">{getRoleLabel(activeRole)}</div>
            </div>
          </div>

          <button
            onClick={resetToDefaultData}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md border border-slate-800 transition"
            title="استعادة البيانات النموذجية الأولية"
          >
            <RotateCcw className="w-3 h-3" />
            <span>استعادة البيانات</span>
          </button>
        </div>

      </aside>
    </>
  );
};

