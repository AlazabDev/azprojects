import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus } from '../../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Building2,
  CheckCircle2,
  Clock,
  PauseCircle,
  PlayCircle,
  TrendingUp,
  Filter,
  Layers,
  ArrowUpRight,
  Sparkles,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  DollarSign,
  Briefcase
} from 'lucide-react';

export interface DashboardProps {
  onOpenNewProject?: () => void;
  className?: string;
}

interface StatusStat {
  key: ProjectStatus;
  label: string;
  count: number;
  percentage: number;
  totalBudget: number;
  totalActualCost: number;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenNewProject,
  className = ''
}) => {
  const { 
    projects, 
    setSelectedProjectId, 
    setNavigationTab,
    syncWithDaftra,
    syncWithMagicPlan 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [chartViewMode, setChartViewMode] = useState<'by-project' | 'by-tier' | 'progress-vs-cost'>('by-project');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // 1. Core Summary Calculations
  const totalProjects = projects.length;
  
  const statusStats = useMemo((): StatusStat[] => {
    const activeProjects = projects.filter(p => p.status === 'active');
    const completedProjects = projects.filter(p => p.status === 'completed');
    const onHoldProjects = projects.filter(p => p.status === 'on-hold');
    const archivedProjects = projects.filter(p => p.status === 'archived');

    const total = totalProjects || 1;

    const list: StatusStat[] = [
      {
        key: 'active',
        label: 'قيد التنفيذ',
        count: activeProjects.length,
        percentage: Math.round((activeProjects.length / total) * 100),
        totalBudget: activeProjects.reduce((acc, p) => acc + p.budget, 0),
        totalActualCost: activeProjects.reduce((acc, p) => acc + p.actualCost, 0),
        color: '#3b82f6', // blue-500
        badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
        badgeText: 'text-blue-700 dark:text-blue-300'
      },
      {
        key: 'completed',
        label: 'مكتمل',
        count: completedProjects.length,
        percentage: Math.round((completedProjects.length / total) * 100),
        totalBudget: completedProjects.reduce((acc, p) => acc + p.budget, 0),
        totalActualCost: completedProjects.reduce((acc, p) => acc + p.actualCost, 0),
        color: '#10b981', // emerald-500
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
        badgeText: 'text-emerald-700 dark:text-emerald-300'
      },
      {
        key: 'on-hold',
        label: 'متوقف مؤقتاً',
        count: onHoldProjects.length,
        percentage: Math.round((onHoldProjects.length / total) * 100),
        totalBudget: onHoldProjects.reduce((acc, p) => acc + p.budget, 0),
        totalActualCost: onHoldProjects.reduce((acc, p) => acc + p.actualCost, 0),
        color: '#f59e0b', // amber-500
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
        badgeText: 'text-amber-700 dark:text-amber-300'
      }
    ];

    if (archivedProjects.length > 0) {
      list.push({
        key: 'archived',
        label: 'مؤرشف',
        count: archivedProjects.length,
        percentage: Math.round((archivedProjects.length / total) * 100),
        totalBudget: archivedProjects.reduce((acc, p) => acc + p.budget, 0),
        totalActualCost: archivedProjects.reduce((acc, p) => acc + p.actualCost, 0),
        color: '#64748b', // slate-500
        badgeBg: 'bg-slate-100 dark:bg-slate-800',
        badgeText: 'text-slate-700 dark:text-slate-300'
      });
    }

    return list;
  }, [projects, totalProjects]);

  // Overall Average Progress
  const avgProgress = useMemo(() => {
    if (projects.length === 0) return 0;
    const sum = projects.reduce((acc, p) => acc + (p.progress || 0), 0);
    return Math.round(sum / projects.length);
  }, [projects]);

  // Total Portfolio Budget & Costs
  const totalPortfolioBudget = useMemo(() => {
    return projects.reduce((acc, p) => acc + p.budget, 0);
  }, [projects]);

  const totalPortfolioActual = useMemo(() => {
    return projects.reduce((acc, p) => acc + p.actualCost, 0);
  }, [projects]);

  // 2. Data for Status Pie/Donut Chart
  const statusPieData = useMemo(() => {
    return statusStats.map(stat => ({
      name: stat.label,
      value: stat.count,
      statusKey: stat.key,
      color: stat.color,
      percentage: stat.percentage,
      budget: stat.totalBudget,
      actualCost: stat.totalActualCost
    }));
  }, [statusStats]);

  // 3. Data for Progress BarChart (Individual Projects)
  const projectProgressData = useMemo(() => {
    return projects.map(p => {
      const budgetBurnRate = p.budget > 0 ? Math.min(100, Math.round((p.actualCost / p.budget) * 100)) : 0;
      let statusLabel = 'قيد التنفيذ';
      if (p.status === 'completed') statusLabel = 'مكتمل';
      if (p.status === 'on-hold') statusLabel = 'متوقف';
      if (p.status === 'archived') statusLabel = 'مؤرشف';

      return {
        id: p.id,
        name: p.name.length > 20 ? p.name.substring(0, 18) + '...' : p.name,
        fullName: p.name,
        progress: p.progress,
        budgetBurnRate,
        status: p.status,
        statusLabel,
        budget: p.budget,
        actualCost: p.actualCost,
        clientName: p.clientName
      };
    });
  }, [projects]);

  // 4. Data for Progress Tiers Distribution
  const progressTierData = useMemo(() => {
    const tier1 = projects.filter(p => p.progress <= 25).length;
    const tier2 = projects.filter(p => p.progress > 25 && p.progress <= 50).length;
    const tier3 = projects.filter(p => p.progress > 50 && p.progress <= 75).length;
    const tier4 = projects.filter(p => p.progress > 75).length;

    return [
      { tier: '0% - 25%', label: 'مرحلة التأسيس والتخطيط', count: tier1, color: '#f59e0b' },
      { tier: '26% - 50%', label: 'مرحلة الأعمال الإنشائية', count: tier2, color: '#3b82f6' },
      { tier: '51% - 75%', label: 'مرحلة الكسوة والتشطيبات', count: tier3, color: '#6366f1' },
      { tier: '76% - 100%', label: 'مرحلة التسليم والاعتماد', count: tier4, color: '#10b981' }
    ];
  }, [projects]);

  // 5. Filtered projects for bottom quick-list table
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
      const matchesSearch = searchQuery.trim() === '' 
        ? true 
        : p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [projects, statusFilter, searchQuery]);

  const handleSync = async () => {
    setIsSyncing(true);
    await Promise.all([syncWithDaftra(), syncWithMagicPlan()]);
    setIsSyncing(false);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10b981'; // emerald-500
    if (progress >= 40) return '#3b82f6'; // blue-500
    return '#f59e0b'; // amber-500
  };

  return (
    <div className={`space-y-5 ${className}`} dir="rtl" id="projects-dashboard-component">
      
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              الملخص المرئي لحالة المشاريع ونسب الإنجاز
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Recharts Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            متابعة دقيقة لتوزيع المشاريع حسب الحالة التشغيلية (قيد التنفيذ، مكتمل، متوقف) ومعدلات تقدم الأعمال الميدانية.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="تحديث البيانات ومزامنتها مع دفترة وMagicPlan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isSyncing ? 'جاري التحديث...' : 'تحديث البيانات'}</span>
          </button>

          {onOpenNewProject && (
            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مشروع جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Projects Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>إجمالي المشاريع</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {totalProjects}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">مشروع معماري</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            الميزانية: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{(totalPortfolioBudget / 1000000).toFixed(2)}M ر.س</span>
          </div>
        </div>

        {/* Active Projects Card */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition cursor-pointer shadow-2xs flex flex-col justify-between ${
            statusFilter === 'active' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>قيد التنفيذ</span>
            </span>
            <PlayCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {statusStats.find(s => s.key === 'active')?.count || 0}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {statusStats.find(s => s.key === 'active')?.percentage || 0}% من المحفظة
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            مواقع البناء والإنشاء الجارية
          </div>
        </div>

        {/* Completed Projects Card */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition cursor-pointer shadow-2xs flex flex-col justify-between ${
            statusFilter === 'completed' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <span>مكتمل ومسلّم</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {statusStats.find(s => s.key === 'completed')?.count || 0}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {statusStats.find(s => s.key === 'completed')?.percentage || 0}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            تسليم نهائي معتمد 100%
          </div>
        </div>

        {/* On-Hold Projects Card */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'on-hold' ? 'all' : 'on-hold')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition cursor-pointer shadow-2xs flex flex-col justify-between ${
            statusFilter === 'on-hold' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-medium">
            <span>متوقف مؤقتاً</span>
            <PauseCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {statusStats.find(s => s.key === 'on-hold')?.count || 0}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {statusStats.find(s => s.key === 'on-hold')?.percentage || 0}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            مراجعة تراخيص أو اعتماد كود SBC
          </div>
        </div>

      </div>

      {/* Main Charts Row: Status Donut Chart & Completion Rate Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* CHART 1: Donut Chart for Project Status Distribution (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>توزيع المشاريع حسب الحالة</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  نسبة المشاريع النشطة، المكتملة، والمتوقفة مؤقتاً
                </p>
              </div>

              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  إلغاء التصفية
                </button>
              )}
            </div>

            {/* Recharts Pie / Donut Chart */}
            <div className="relative h-64 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => {
                      const stat = item.payload;
                      return [
                        `${val} مشروع (${stat.percentage}%) - ميزانية ${(stat.budget / 1000).toFixed(0)}K ر.س`,
                        stat.name
                      ];
                    }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                      textAlign: 'right',
                      direction: 'rtl'
                    }}
                  />
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    onClick={(entry: any) => {
                      const key = entry?.payload?.statusKey || entry?.statusKey;
                      if (key) {
                        setStatusFilter(prev => prev === key ? 'all' : key);
                      }
                    }}
                    cursor="pointer"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                        opacity={statusFilter === 'all' || statusFilter === entry.statusKey ? 1 : 0.4}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Metrics in Donut Hole */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                  {totalProjects}
                </span>
                <span className="text-[11px] font-medium text-slate-400">إجمالي المشاريع</span>
              </div>
            </div>
          </div>

          {/* Interactive Legend with Status Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {statusStats.map(stat => (
              <button
                key={stat.key}
                onClick={() => setStatusFilter(prev => prev === stat.key ? 'all' : stat.key)}
                className={`p-2.5 rounded-xl text-right transition cursor-pointer border ${
                  statusFilter === stat.key 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30' 
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stat.label}</span>
                </div>
                <div className="flex items-baseline justify-between mt-1 font-mono">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.count}</span>
                  <span className="text-[10px] text-slate-400">{stat.percentage}%</span>
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* CHART 2: BarChart for Completion Percentages (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    نسبة الإنجاز ومعدلات التقدم الميداني
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                    متوسط: {avgProgress}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  رصد نسب الإنجاز المئوية الميدانية لكل مشروع مقارنة بخط الأساس
                </p>
              </div>

              {/* View Switcher: Individual Projects vs Tier Ranges */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto text-xs font-medium">
                <button
                  onClick={() => setChartViewMode('by-project')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] font-bold ${
                    chartViewMode === 'by-project'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  المشاريع
                </button>
                <button
                  onClick={() => setChartViewMode('by-tier')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] font-bold ${
                    chartViewMode === 'by-tier'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  فئات الإنجاز
                </button>
                <button
                  onClick={() => setChartViewMode('progress-vs-cost')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] font-bold ${
                    chartViewMode === 'progress-vs-cost'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  الإنجاز vs الصرف
                </button>
              </div>
            </div>

            {/* Recharts BarChart */}
            <div className="h-64 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                {chartViewMode === 'by-project' ? (
                  <BarChart
                    data={projectProgressData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={45}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => {
                        const p = item.payload;
                        return [
                          `${val}% (${p.statusLabel}) - العميل: ${p.clientName}`,
                          'نسبة الإنجاز الميداني'
                        ];
                      }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                        textAlign: 'right',
                        direction: 'rtl'
                      }}
                    />
                    <ReferenceLine 
                      y={avgProgress} 
                      stroke="#6366f1" 
                      strokeDasharray="4 4" 
                      label={{ 
                        value: `المتوسط ${avgProgress}%`, 
                        fill: '#6366f1', 
                        fontSize: 10, 
                        position: 'insideTopLeft' 
                      }} 
                    />
                    <Bar 
                      dataKey="progress" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={45}
                      onClick={(data: any) => {
                        const id = data?.id || data?.payload?.id;
                        if (id) {
                          setSelectedProjectId(id);
                          setNavigationTab('project-detail');
                        }
                      }}
                      cursor="pointer"
                    >
                      {projectProgressData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={getProgressColor(entry.progress)} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : chartViewMode === 'by-tier' ? (
                  <BarChart
                    data={progressTierData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                    <XAxis dataKey="tier" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => {
                        return [`${val} مشاريع`, item.payload.label];
                      }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                        textAlign: 'right',
                        direction: 'rtl'
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={55}>
                      {progressTierData.map((entry, index) => (
                        <Cell key={`tier-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart
                    data={projectProgressData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={45}
                    />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      formatter={(val: any, name: any) => {
                        return [`${val}%`, name === 'progress' ? 'الإنجاز الفعلي' : 'الميزانية المصروفة'];
                      }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                        textAlign: 'right',
                        direction: 'rtl'
                      }}
                    />
                    <Legend 
                      formatter={(value) => (value === 'progress' ? 'نسبة الإنجاز الفعلي' : 'نسبة استهلاك الميزانية')}
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    />
                    <Bar dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={25} />
                    <Bar dataKey="budgetBurnRate" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={25} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Color Meaning Guide */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>إنجاز متقدم (80% - 100%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>ضمن المخطط (40% - 79%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>مرحلة مبكرة أو متأخر (&lt; 40%)</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400">انقر على أي عمود لفتح تفاصيل المشروع</span>
          </div>

        </div>

      </div>

      {/* Projects Detailed Status & Progress Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>جدول متابعة حالة المشاريع ({filteredProjects.length})</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              عرض مفصل لنسبة الإنجاز والحالة التشغيلية والميزانية لكل مشروع
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالمشروع، العميل..."
                className="w-full bg-white dark:bg-slate-800 text-xs pr-8 pl-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                الكل ({totalProjects})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  statusFilter === 'active'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                قيد التنفيذ
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  statusFilter === 'completed'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                مكتمل
              </button>
              <button
                onClick={() => setStatusFilter('on-hold')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  statusFilter === 'on-hold'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                متوقف
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <tr>
                <th className="p-3.5">المشروع</th>
                <th className="p-3.5">العميل والموقع</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 min-w-[160px]">نسبة الإنجاز الميداني</th>
                <th className="p-3.5">الميزانية والمصروف</th>
                <th className="p-3.5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProjects.map((project) => {
                const isCompleted = project.status === 'completed';
                const isOnHold = project.status === 'on-hold';
                
                let statusBadge = {
                  label: 'قيد التنفيذ',
                  classes: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                };

                if (isCompleted) {
                  statusBadge = {
                    label: 'مكتمل ومسلّم',
                    classes: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  };
                } else if (isOnHold) {
                  statusBadge = {
                    label: 'متوقف مؤقتاً',
                    classes: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  };
                }

                return (
                  <tr
                    key={project.id}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setNavigationTab('project-detail');
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    {/* Name */}
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getProgressColor(project.progress) }}
                        />
                        <span className="truncate max-w-[200px]">{project.name}</span>
                      </div>
                    </td>

                    {/* Client & Location */}
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <div className="truncate max-w-[180px] font-medium">{project.clientName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{project.location}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge.classes}`}>
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* Progress Bar & Percentage */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {project.progress}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isCompleted ? 'مكتمل 100%' : project.progress >= 70 ? 'متقدم' : project.progress >= 40 ? 'متوسط' : 'مبكر'}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${project.progress}%`,
                              backgroundColor: getProgressColor(project.progress)
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Budget & Actual Cost */}
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {(project.actualCost).toLocaleString()} ر.س
                      </div>
                      <div className="text-[10px] text-slate-400">
                        من أصل {(project.budget).toLocaleString()} ر.س
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectId(project.id);
                          setNavigationTab('project-detail');
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                        title="عرض تفاصيل المشروع"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    لا توجد مشاريع تطابق معايير التصفية الحالية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
