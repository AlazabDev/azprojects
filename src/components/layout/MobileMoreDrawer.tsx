import React from 'react';
import { useApp, getRoleLabel } from '../../context/AppContext';
import { 
  X, 
  Building2, 
  Layers, 
  Compass, 
  Receipt, 
  MessageSquare, 
  FileText, 
  Users, 
  Sparkles, 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone,
  ChevronLeft
} from 'lucide-react';

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewProject: () => void;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({
  isOpen,
  onClose,
  onOpenNewProject
}) => {
  const { 
    navigationTab, 
    setNavigationTab, 
    projects, 
    selectedProjectId, 
    setSelectedProjectId,
    currentUser,
    activeRole,
    setActiveRole,
    syncWithDaftra,
    syncWithMagicPlan,
    whatsAppMessages
  } = useApp();

  const [isSyncing, setIsSyncing] = React.useState(false);

  if (!isOpen) return null;

  const unassignedWhatsAppCount = whatsAppMessages.filter(w => w.status === 'received' || w.status === 'processing').length;

  const secondaryModules = [
    {
      id: 'project-detail',
      label: 'تفاصيل المشروع النشط',
      desc: 'المواصفات، المخططات، والمراحل',
      icon: Building2,
      color: 'bg-blue-500 text-white'
    },
    {
      id: 'phases',
      label: 'المراحل المعمارية (7 Phases)',
      desc: 'مسار Gantt ونسب الإنجاز',
      icon: Layers,
      color: 'bg-indigo-500 text-white'
    },
    {
      id: 'magicplan',
      label: 'مخططات MagicPlan',
      desc: 'المساقط الأفقية 2D ونماذج 3D',
      icon: Compass,
      color: 'bg-cyan-500 text-white'
    },
    {
      id: 'deftera',
      label: 'تكامل دفترة المحاسبي',
      desc: 'الفواتير، القيود، وأمر عمل #17',
      icon: Receipt,
      color: 'bg-emerald-500 text-white'
    },
    {
      id: 'whatsapp',
      label: 'مركز وسائط واتساب',
      desc: 'صور الموقع، التقارير والرسائل',
      icon: MessageSquare,
      badge: unassignedWhatsAppCount > 0 ? String(unassignedWhatsAppCount) : null,
      color: 'bg-green-600 text-white'
    },
    {
      id: 'documents',
      label: 'المستندات والمخططات',
      desc: 'ملفات PDF و DWG والتراخيص',
      icon: FileText,
      color: 'bg-amber-500 text-white'
    },
    {
      id: 'suppliers',
      label: 'الموردون والمقاولون',
      desc: 'دليل المقاولين والتوريدات',
      icon: Building2,
      color: 'bg-orange-500 text-white'
    },
    {
      id: 'reports-ai',
      label: 'التقارير ومساعد AI',
      desc: 'تحليلات ذكية واستشارات Gemini',
      icon: Sparkles,
      color: 'bg-purple-600 text-white'
    },
    {
      id: 'team',
      label: 'الفريق والصلاحيات',
      desc: 'إدارة الأدوار والمستخدمين',
      icon: Users,
      color: 'bg-rose-500 text-white'
    },
    {
      id: 'settings',
      label: 'الإعدادات وقاعدة البيانات',
      desc: 'النسخ الاحتياطي والمزامنة',
      icon: Database,
      color: 'bg-slate-700 text-white'
    }
  ];

  const handleSync = async () => {
    setIsSyncing(true);
    await Promise.all([syncWithDaftra(), syncWithMagicPlan()]);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Tap backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Modal Sheet */}
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        
        {/* Drag Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">كافة أدوات المنظومة</h3>
              <p className="text-[11px] text-slate-500">الوصول السريع لجميع الخدمات والوحدات الهندسية</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Active Project Selector Card */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">المشروع النشط المحدد:</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenNewProject();
                }}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 underline"
              >
                + مشروع جديد
              </button>
            </div>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.progress}%)
                </option>
              ))}
            </select>
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {secondaryModules.map((item) => {
              const Icon = item.icon;
              const isActive = navigationTab === item.id || (item.id === 'reports-ai' && navigationTab === 'reports');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setNavigationTab(item.id);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between min-h-[90px] relative ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 shadow-xs' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* User Role & Sync Section */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                {currentUser?.name?.slice(0, 2) || 'AZ'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500">{getRoleLabel(activeRole)}</div>
              </div>
            </div>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>مزامنة</span>
            </button>
          </div>

        </div>

        {/* Drawer Bottom Safe Inset */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 pb-[env(safe-area-inset-bottom,16px)]">
          <span className="font-mono text-[11px]">AzProjects v2.4 (Hybrid Engine)</span>
          <button
            onClick={onClose}
            className="font-bold text-indigo-600 dark:text-indigo-400"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
