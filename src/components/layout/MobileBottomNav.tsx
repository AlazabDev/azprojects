import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  DollarSign, 
  Menu,
  Bell
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMore: () => void;
  isMoreOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMore, isMoreOpen }) => {
  const { 
    navigationTab, 
    setNavigationTab, 
    tasks, 
    unreadNotificationsCount, 
    criticalNotificationsCount 
  } = useApp();

  const pendingTasksCount = tasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length;

  const mainTabs = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'projects',
      label: 'المشاريع',
      icon: FolderKanban,
      badge: null
    },
    {
      id: 'tasks',
      label: 'المهام',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? (pendingTasksCount > 9 ? '+9' : pendingTasksCount) : null,
      badgeColor: 'bg-blue-600'
    },
    {
      id: 'costs',
      label: 'التكاليف',
      icon: DollarSign,
      badge: null
    },
    {
      id: 'notifications',
      label: 'التنبيهات',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? (unreadNotificationsCount > 9 ? '+9' : unreadNotificationsCount) : null,
      badgeColor: criticalNotificationsCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'
    }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1 pb-[env(safe-area-inset-bottom,6px)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = navigationTab === tab.id && !isMoreOpen;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setNavigationTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1 rounded-xl transition-all relative ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {/* Active Indicator Pill */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className={`absolute -top-1.5 -right-2 text-[9px] font-bold text-white px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs ${tab.badgeColor || 'bg-indigo-600'}`}>
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* More Drawer Trigger */}
        <button
          onClick={onOpenMore}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1 rounded-xl transition-all relative ${
            isMoreOpen 
              ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {isMoreOpen && (
            <span className="absolute top-0 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
          <Menu className={`w-5 h-5 transition-transform ${isMoreOpen ? 'scale-110 rotate-90' : ''}`} />
          <span className={`text-[10px] mt-0.5 tracking-tight ${isMoreOpen ? 'font-bold' : 'font-medium'}`}>
            المزيد
          </span>
        </button>

      </div>
    </div>
  );
};
