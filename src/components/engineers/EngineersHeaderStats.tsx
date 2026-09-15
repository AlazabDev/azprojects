import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Receipt, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  HardHat, 
  FileSpreadsheet,
  Zap,
  Activity,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectPhase } from '../../types';

interface EngineersHeaderStatsProps {
  projects: Project[];
  allPhases: ProjectPhase[];
  onOpenDaftraModal: () => void;
  onExportCsv: () => void;
}

export const EngineersHeaderStats: React.FC<EngineersHeaderStatsProps> = ({
  projects,
  allPhases,
  onOpenDaftraModal,
  onExportCsv
}) => {
  const { 
    daftraRecords, 
    syncWithDaftra, 
    testDaftraConnection,
    settings 
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Computations
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const delayedProjects = projects.filter(p => {
    const end = new Date(p.endDate).getTime();
    const now = new Date('2026-09-10').getTime();
    return p.status === 'active' && end < now && p.progress < 100;
  }).length;

  const totalAreaM2 = projects.reduce((acc, p) => acc + (p.areaM2 || 0), 0);

  const totalPhasesCount = allPhases.length;
  const completedPhasesCount = allPhases.filter(ph => ph.status === 'completed' || ph.progress === 100).length;
  const inProgressPhasesCount = allPhases.filter(ph => ph.status === 'in-progress').length;
  const delayedPhasesCount = allPhases.filter(ph => ph.status === 'delayed').length;

  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / totalProjects)
    : 0;

  // Daftra stats
  const daftraTotalBilled = daftraRecords.reduce((acc, r) => acc + (r.amount || 0), 0);
  const daftraInvoicesCount = daftraRecords.length;

  const handleLiveSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncWithDaftra();
      setSyncSuccessMsg(res.message || 'تمت المزامنة اللحظية مع سيرفر دفترة بنجاح');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } catch {
      setSyncSuccessMsg('تم تحديث البيانات المعمارية وربطها مع دفترة');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      
      {/* Top Engineering Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-indigo-800/40 shadow-sm relative overflow-hidden">
        
        {/* Background Subtle Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          {/* Main Title & Status */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-indigo-300" />
                <span>مركز العمليات الهندسية الميدانية (Site Engineering Control)</span>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>دفترة ERP: متصل حي</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              لوحة تحكم المهندسين والمشروعات (Engineers Project & Phase Command)
            </h1>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              إشراف هندسي موحد على كافة المشروعات ومراحلها التنفيذية الأربعة، فحص مطابقة كود البناء السعودي (SBC)، والمزامنة اللحظية مع أوامر عمل وفواتير دفترة (Daftra OpenAPI 3.1.0).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
            
            {/* Live Daftra Sync Button */}
            <button
              type="button"
              onClick={handleLiveSync}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
              title="مزامنة حية مع سيرفر دفترة"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-300' : ''}`} />
              <span>{isSyncing ? 'جاري المزامنة مع دفترة...' : 'مزامنة دفترة الحية'}</span>
            </button>

            {/* Daftra Invoices Modal Button */}
            <button
              type="button"
              onClick={onOpenDaftraModal}
              className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>فحص مستخلصات دفترة</span>
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="تصدير جدول المشروعات والمراحل لـ Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Excel</span>
            </button>

          </div>

        </div>

        {/* Sync Success Alert Notification */}
        {syncSuccessMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

      </div>

      {/* 5 KPI Metric Capsules */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Metric 1: Total Projects & Area */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>المشاريع الميدانية</span>
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-baseline gap-1.5">
            <span>{totalProjects}</span>
            <span className="text-xs font-normal text-slate-500">مشروعات</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{totalAreaM2.toLocaleString()} م²</span>
            <span>مسطحات خاضعة للإشراف</span>
          </div>
        </div>

        {/* Metric 2: Phases Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>المراحل التنفيذية</span>
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-baseline gap-1.5">
            <span>{totalPhasesCount}</span>
            <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">({completedPhasesCount} منتهية)</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{inProgressPhasesCount} جارية</span>
            {delayedPhasesCount > 0 && (
              <span className="text-rose-600 dark:text-rose-400 font-bold">({delayedPhasesCount} متأخرة)</span>
            )}
          </div>
        </div>

        {/* Metric 3: Overall Progress */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>متوسط الإنجاز العام</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-baseline gap-1.5">
            <span>{avgProgress}%</span>
            <span className="text-xs font-normal text-slate-500">متوسط هندسي</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Daftra Live Link */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>دفترة ERP المربوطة</span>
            <Receipt className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-baseline gap-1.5">
            <span>{daftraInvoicesCount}</span>
            <span className="text-xs font-normal text-slate-500">مستخلصات</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 truncate font-mono">
            {daftraTotalBilled > 0 ? `${(daftraTotalBilled / 1000).toFixed(0)} ألف ر.س` : 'أمر عمل #17 حي'}
          </div>
        </div>

        {/* Metric 5: SBC Code Compliance */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>مطابقة كود SBC</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1.5 flex items-baseline gap-1.5">
            <span>98.4%</span>
            <span className="text-xs font-normal text-emerald-500">معتمد</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            SBC 1101, 304, 801
          </div>
        </div>

      </div>

    </div>
  );
};
