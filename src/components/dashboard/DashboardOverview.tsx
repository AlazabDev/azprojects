import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CostAnalysisChart } from './CostAnalysisChart';
import { ArchitecturalDocumentsTab } from './ArchitecturalDocumentsTab';
import { Dashboard } from './Dashboard';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Layers, 
  ArrowUpRight, 
  MessageSquare, 
  Receipt, 
  Sparkles, 
  Plus, 
  Compass,
  HardHat,
  FileDown,
  Bell,
  ChevronLeft,
  LayoutDashboard,
  RefreshCw,
  FileText,
  Download,
  Eye,
  BarChart2
} from 'lucide-react';

interface DashboardOverviewProps {
  onOpenNewProject: () => void;
  initialTab?: 'overview' | 'projects-status' | 'architectural-docs';
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onOpenNewProject, initialTab = 'overview' }) => {
  const { 
    projects, 
    phases, 
    tasks, 
    costs, 
    whatsAppMessages, 
    notifications,
    unreadNotificationsCount,
    criticalNotificationsCount,
    setSelectedProjectId, 
    setNavigationTab,
    syncWithDaftra,
    syncWithMagicPlan 
  } = useApp();

  const [dashboardTab, setDashboardTab] = useState<'overview' | 'projects-status' | 'architectural-docs'>(initialTab);
  const [isSyncing, setIsSyncing] = useState(false);

  // High-level KPI aggregations
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const avgProgress = Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / (totalProjects || 1));
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalActualCost = projects.reduce((acc, p) => acc + p.actualCost, 0);
  const remainingBudget = totalBudget - totalActualCost;
  
  const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in-progress');
  const delayedTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'done');

  const handleSyncAll = async () => {
    setIsSyncing(true);
    await Promise.all([syncWithDaftra(), syncWithMagicPlan()]);
    setIsSyncing(false);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-5 pb-8">
      
      {/* Top Dashboard Tabs Navigation Switcher */}
      <div className="flex items-center justify-between pb-2 flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setDashboardTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              dashboardTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>لوحة المؤشرات والمتابعة</span>
          </button>

          <button
            onClick={() => setDashboardTab('projects-status')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              dashboardTab === 'projects-status'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <span>ملخص حالة المشاريع (Recharts)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              توزيع & إنجاز
            </span>
          </button>

          <button
            onClick={() => setDashboardTab('architectural-docs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              dashboardTab === 'architectural-docs'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>المستندات المعمارية ومخططات MagicPlan</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              7 مخططات
            </span>
          </button>

          <button
            onClick={() => setNavigationTab('engineers-hub')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
            title="الانتقال إلى لوحة تحكم المهندسين المخصصة لكافة المشروعات ومراحلها"
          >
            <HardHat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>لوحة تحكم المهندسين (المشروعات والمراحل)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              دفترة & SBC
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="مزامنة شاملة للبيانات والمخططات"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة السحابة'}</span>
          </button>
          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>مشروع جديد</span>
          </button>
        </div>
      </div>

      {/* Conditionally Render Tabs */}
      {dashboardTab === 'architectural-docs' ? (
        <ArchitecturalDocumentsTab />
      ) : dashboardTab === 'projects-status' ? (
        <Dashboard onOpenNewProject={onOpenNewProject} />
      ) : (
        <div className="space-y-4">
          
          {/* Top 4 KPI Metrics Grid (High Density) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1: Active Projects */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 flex items-center justify-between">
                <span>المشاريع النشطة</span>
                <Building2 className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{activeProjects}</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-0.5">
                  <span>↑ 2 هذا الشهر</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">إجمالي {totalProjects} مشاريع معمارية</p>
            </div>

            {/* Metric 2: Overall Progress */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 flex items-center justify-between">
                <span>نسبة الإنجاز الكلية</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{avgProgress}%</span>
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden self-center">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${avgProgress}%` }}></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">متوسط تقدم كافة المواقع الميدانية</p>
            </div>

            {/* Metric 3: Spent Budget */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 flex items-center justify-between">
                <span>الميزانية المصروفة</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {(totalActualCost / 1000).toFixed(1)}K
                </span>
                <span className="text-slate-400 text-xs font-normal">ريال</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                من إجمالي {(totalBudget / 1000).toFixed(1)}K ر.س المعتمدة
              </p>
            </div>

            {/* Metric 4: Delayed/Critical Tasks */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 flex items-center justify-between">
                <span>المهام المتأخرة والعاجلة</span>
                <Clock className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{delayedTasks.length || 4}</span>
                <span className="text-rose-600 dark:text-rose-400 text-xs font-medium">تتطلب تدخل</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">من أصل {pendingTasks.length} مهام جارية</p>
            </div>

          </section>

          {/* Dual Action Strip: Architectural Blueprints & Real-Time Field Communication */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Architectural Blueprints Showcase */}
            <div className="bg-gradient-to-r from-indigo-900/90 to-slate-900 text-white p-4 rounded-xl border border-indigo-800/50 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      مستودع المخططات المعمارية (MagicPlan)
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/40 text-indigo-200">
                      جاهز للتحميل
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    مساقط أفقية ومخططات تنفيذية بصيغ PDF و CAD جاهزة للتنفيذ.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDashboardTab('architectural-docs')}
                className="px-3 py-1.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs self-start"
              >
                <span>فتح المستندات المعمارية</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Real-Time Field Communication & WhatsApp Phase Linker */}
            <div className="bg-gradient-to-r from-emerald-950/90 to-slate-900 text-white p-4 rounded-xl border border-emerald-800/50 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      الاتصالات الميدانية (WhatsApp Live)
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/40 text-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      بث مباشر
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    متابعة تحديثات المهندسين والموقع لحظياً وربط الرسائل بالمراحل.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNavigationTab('field-communication')}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs self-start"
              >
                <span>فتح الاتصالات الميدانية والمراحل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* RECHARTS INTEGRATION: Visual Summary of Projects Status & Progress */}
          <Dashboard onOpenNewProject={onOpenNewProject} />

          {/* RECHARTS INTEGRATION: Cost Distribution & Variance vs Budget for Project Arabesque */}
          <CostAnalysisChart 
            projectId="PRJ-ARABESQUE" 
            onNavigateToProject={(pId) => {
              setSelectedProjectId(pId);
              setNavigationTab('project-detail');
            }}
            onNavigateToCosts={() => {
              setNavigationTab('costs');
            }}
          />

      {/* Main High Density 12-Col Dashboard Grid */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Left Section (8 Columns): Projects Tracking Table & Phases Timeline */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          
          {/* Projects Table Card */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">تتبع المشاريع الحالية</h3>
              <button
                onClick={() => setNavigationTab('projects')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                عرض الكل ({projects.length})
              </button>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px] uppercase">
                  <tr>
                    <th className="p-3 font-semibold">المشروع</th>
                    <th className="p-3 font-semibold">المرحلة</th>
                    <th className="p-3 font-semibold text-center">الإنجاز</th>
                    <th className="p-3 font-semibold">الميزانية</th>
                    <th className="p-3 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {projects.map((project) => {
                    const statusBadge = project.status === 'completed' 
                      ? { text: 'مكتمل', bg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' }
                      : project.status === 'delayed'
                      ? { text: 'متأخر', bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' }
                      : project.progress >= 70
                      ? { text: 'نشط', bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' }
                      : { text: 'قيد العمل', bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' };

                    return (
                      <tr 
                        key={project.id}
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setNavigationTab('project-detail');
                        }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                      >
                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${project.id === 'PRJ-ARABESQUE' ? 'bg-amber-500' : 'bg-indigo-500'}`}></span>
                            <span className="truncate max-w-[160px] sm:max-w-[220px]">{project.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">
                          {project.currentPhaseName || 'التصميم والتنفيذ'}
                        </td>
                        <td className="p-3 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getProgressColor(project.progress)}`} 
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 w-8 text-left">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {(project.budget).toLocaleString()} ريال
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge.bg}`}>
                            {statusBadge.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Architectural Phases (Gantt Tracker) */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>المراحل المعمارية السبع (Gantt Tracker)</span>
              </h3>
              <button
                onClick={() => setNavigationTab('phases')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                إدارة المراحل
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {phases.slice(0, 4).map((phase, idx) => (
                <div 
                  key={phase.id} 
                  onClick={() => setNavigationTab('phases')}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-400 cursor-pointer transition space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{phase.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      {phase.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${phase.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Section (4 Columns): Deadlines Widget, Smart Integrations & Annual Financial Overview */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          
          {/* Active Deadlines & Alerts Widget */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">تنبيهات المواعيد والمراحل</h3>
              </div>
              <button 
                onClick={() => setNavigationTab('notifications')}
                className="text-[11px] text-amber-600 hover:text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-0.5"
              >
                <span>مركز التنبيهات</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {notifications.slice(0, 3).map((ntf) => (
                <div
                  key={ntf.id}
                  onClick={() => {
                    if (ntf.projectId) setSelectedProjectId(ntf.projectId);
                    setNavigationTab('notifications');
                  }}
                  className={`p-2.5 rounded-lg border text-right cursor-pointer transition ${
                    ntf.priority === 'critical' 
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30' 
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`text-xs font-bold truncate ${ntf.priority === 'critical' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {ntf.title}
                    </span>
                    {ntf.targetDate && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 shrink-0 font-medium font-mono">
                        {ntf.targetDate}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {ntf.message}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Smart Integrations Status Card */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-3">حالة التكاملات الذكية</h3>
            <div className="space-y-2.5">
              
              {/* Daftra Integration */}
              <div 
                onClick={() => setNavigationTab('deftera')}
                className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs shadow-xs">
                    💼
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">دفترة (Daftra ERP)</div>
                    <div className="text-[10px] text-slate-500">مزامنة الفواتير والقيود المحاسبية</div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
              </div>

              {/* MagicPlan Integration */}
              <div 
                onClick={() => setNavigationTab('magicplan')}
                className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs shadow-xs">
                    📐
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">MagicPlan Cloud</div>
                    <div className="text-[10px] text-slate-500">سحب المخططات والأبعاد المترية</div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
              </div>

              {/* WhatsApp Webhook Integration */}
              <div 
                onClick={() => setNavigationTab('whatsapp')}
                className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs shadow-xs">
                    📱
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">WhatsApp Webhook</div>
                    <div className="text-[10px] text-slate-500">استقبال صور الموقع والتقارير</div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
              </div>

            </div>
          </section>

          {/* High Density Annual Financial Summary (Deep Indigo Card) */}
          <section className="bg-indigo-900 text-white rounded-xl shadow-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-xs sm:text-sm text-white">الملخص المالي للمشاريع</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-indigo-200 font-mono">2026</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-70">إجمالي الميزانية المعتمدة</span>
                  <span className="font-mono font-bold">{(totalBudget).toLocaleString()} ريال</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(Math.round((totalActualCost / (totalBudget || 1)) * 100), 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] opacity-70">المدفوعات</div>
                    <div className="text-sm font-bold font-mono">{(totalActualCost / 1000000).toFixed(2)}M</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] opacity-70">المتبقي</div>
                    <div className="text-sm font-bold font-mono">{(remainingBudget / 1000000).toFixed(2)}M</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/10">
              <button 
                onClick={() => setNavigationTab('costs')}
                className="w-full py-2 bg-white text-indigo-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition shadow-xs"
              >
                تحميل التقرير المالي PDF
              </button>
            </div>
          </section>

        </div>

      </div>
    </div>
  )}

    </div>
  );
};

