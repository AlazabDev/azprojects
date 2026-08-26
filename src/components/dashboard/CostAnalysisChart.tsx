import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sparkles, 
  ArrowUpRight,
  Filter,
  DollarSign,
  PieChart as PieIcon,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface CostAnalysisChartProps {
  projectId?: string;
  className?: string;
  showControls?: boolean;
  onNavigateToProject?: (projectId: string) => void;
  onNavigateToCosts?: () => void;
}

export const CostAnalysisChart: React.FC<CostAnalysisChartProps> = ({
  projectId = 'PRJ-ARABESQUE',
  className = '',
  showControls = true,
  onNavigateToProject,
  onNavigateToCosts
}) => {
  const { projects, phases, costs, setSelectedProjectId, setNavigationTab } = useApp();
  
  const [selectedProjectIdState, setSelectedProjectIdState] = useState<string>(projectId);
  const [chartMode, setChartMode] = useState<'comparison' | 'variance' | 'categories'>('comparison');
  const [filterActiveOnly, setFilterActiveOnly] = useState<boolean>(false);

  // Target Project
  const currentProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectIdState) || 
           projects.find(p => p.id === 'PRJ-ARABESQUE') || 
           projects[0];
  }, [projects, selectedProjectIdState]);

  // Project Phases for Arabesque or selected project
  const projectPhases = useMemo(() => {
    if (!currentProject) return [];
    return phases
      .filter(p => p.projectId === currentProject.id)
      .sort((a, b) => a.orderNumber - b.orderNumber);
  }, [phases, currentProject]);

  // Project Costs
  const projectCosts = useMemo(() => {
    if (!currentProject) return [];
    return costs.filter(c => c.projectId === currentProject.id);
  }, [costs, currentProject]);

  // Build Phase-Level Cost vs Budget Data
  const phaseComparisonData = useMemo(() => {
    if (!projectPhases || projectPhases.length === 0) {
      // Fallback for Arabesque if phases not yet populated in context
      return [
        {
          id: 'PHS-ARA-01',
          name: 'الرفع المساحي',
          fullName: 'الرفع المساحي ونمذجة MagicPlan',
          budget: 95000,
          actual: 90000,
          variance: 5000, // positive means savings
          status: 'completed',
          burnRate: 94.7
        },
        {
          id: 'PHS-ARA-02',
          name: 'التصميم المعماري',
          fullName: 'التصميم المعماري وديكور الأرابيسك',
          budget: 160000,
          actual: 155000,
          variance: 5000,
          status: 'completed',
          burnRate: 96.8
        },
        {
          id: 'PHS-ARA-03',
          name: 'التراخيص الهندسية',
          fullName: 'التراخيص البلدية والموافقات',
          budget: 45000,
          actual: 40000,
          variance: 5000,
          status: 'completed',
          burnRate: 88.8
        },
        {
          id: 'PHS-ARA-04',
          name: 'الهيكل و MEP',
          fullName: 'التنفيذ الميداني، الهيكل وتأسيسات MEP',
          budget: 650000,
          actual: 325000,
          variance: 325000,
          status: 'in-progress',
          burnRate: 50.0
        },
        {
          id: 'PHS-ARA-05',
          name: 'تكسيات الأرابيسك',
          fullName: 'تركيب تكسيات الأرابيسك والرخام و CNC',
          budget: 450000,
          actual: 160000,
          variance: 290000,
          status: 'in-progress',
          burnRate: 35.5
        },
        {
          id: 'PHS-ARA-06',
          name: 'الأنظمة الذكية',
          fullName: 'التجهيزات الميكانيكية والأنظمة الذكية',
          budget: 280000,
          actual: 0,
          variance: 280000,
          status: 'pending',
          burnRate: 0
        },
        {
          id: 'PHS-ARA-07',
          name: 'التسليم والاعتماد',
          fullName: 'التسليم النهائي وإصدار شهادة الإشغال',
          budget: 170000,
          actual: 0,
          variance: 170000,
          status: 'pending',
          burnRate: 0
        }
      ];
    }

    return projectPhases.map(p => {
      // Find actual costs tied to this phase
      const phaseCostItems = projectCosts.filter(c => c.phaseId === p.id);
      const totalActualForPhase = phaseCostItems.reduce((acc, c) => acc + (c.actualAmount || c.committedAmount || 0), 0);
      const effectiveActual = totalActualForPhase > 0 ? totalActualForPhase : p.actualCost || 0;
      const effectiveBudget = p.budget || 1;
      const variance = effectiveBudget - effectiveActual;
      const burnRate = Math.min(100, Math.round((effectiveActual / effectiveBudget) * 100));

      const shortName = p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name;

      return {
        id: p.id,
        name: shortName,
        fullName: p.name,
        budget: effectiveBudget,
        actual: effectiveActual,
        budgetK: Math.round(effectiveBudget / 1000),
        actualK: Math.round(effectiveActual / 1000),
        varianceK: Math.round(variance / 1000),
        variance: variance,
        status: p.status,
        burnRate: burnRate
      };
    });
  }, [projectPhases, projectCosts]);

  // Filtered dataset
  const displayedPhaseData = useMemo(() => {
    if (!filterActiveOnly) return phaseComparisonData;
    return phaseComparisonData.filter(d => d.status === 'in-progress' || d.actual > 0);
  }, [phaseComparisonData, filterActiveOnly]);

  // Aggregate Category Data for selected project
  const categoryData = useMemo(() => {
    const categoryMap: Record<string, { name: string; planned: number; actual: number; color: string }> = {
      material: { name: 'مواد البناء والتكسيات (أرابيسك/رخام)', planned: 690000, actual: 160000, color: '#3b82f6' },
      labor: { name: 'المقاولات والعمالة الميدانية', planned: 550000, actual: 325000, color: '#10b981' },
      consulting: { name: 'التصميم المعماري والاستشارات', planned: 255000, actual: 245000, color: '#8b5cf6' },
      equipment: { name: 'معدات ونقوش الـ CNC', planned: 180000, actual: 0, color: '#f59e0b' },
      overhead: { name: 'تراخيص وإشراف هندسي', planned: 95000, actual: 40000, color: '#ec4899' },
      subcontractor: { name: 'الأعمال الكهروميكانيكية MEP', planned: 80000, actual: 0, color: '#06b6d4' }
    };

    projectCosts.forEach(c => {
      const catKey = c.category || 'material';
      if (categoryMap[catKey]) {
        categoryMap[catKey].actual = (categoryMap[catKey].actual || 0) + (c.actualAmount || 0);
      }
    });

    return Object.values(categoryMap).map(item => ({
      name: item.name,
      plannedK: Math.round(item.planned / 1000),
      actualK: Math.round(item.actual / 1000),
      varianceK: Math.round((item.planned - item.actual) / 1000),
      value: item.actual > 0 ? item.actual : item.planned,
      color: item.color
    }));
  }, [projectCosts]);

  // Financial KPIs for the project
  const totalBudget = currentProject?.budget || 1850000;
  const totalActual = currentProject?.actualCost || 640000;
  const totalVariance = totalBudget - totalActual;
  const totalBurnRate = Math.round((totalActual / (totalBudget || 1)) * 100);

  const handleProjectDetailClick = () => {
    if (onNavigateToProject) {
      onNavigateToProject(currentProject.id);
    } else {
      setSelectedProjectId(currentProject.id);
      setNavigationTab('project-detail');
    }
  };

  const handleCostsClick = () => {
    if (onNavigateToCosts) {
      onNavigateToCosts();
    } else {
      setSelectedProjectId(currentProject.id);
      setNavigationTab('costs');
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-4 ${className}`}>
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 rounded-lg text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>مخطط تحليل التكاليف والميزانية</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 font-sans">
                  {currentProject?.name?.includes('أرابيسك') ? 'مشروع أرابيسك (أمر عمل #17)' : currentProject?.name}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مقارنة تفصيلية للفروقات والانحراف المالي بين الميزانية المقدرة والتكاليف الفعلية
              </p>
            </div>
          </div>
        </div>

        {/* Controls & Filter */}
        {showControls && (
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            {/* Project Switcher */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedProjectIdState}
                onChange={(e) => setSelectedProjectIdState(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.id === 'PRJ-ARABESQUE' ? '★ أرابيسك (Arabesque)' : p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartMode('comparison')}
                className={`px-2.5 py-1 rounded-md transition ${
                  chartMode === 'comparison'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                المقارنة المزدوجة
              </button>
              <button
                type="button"
                onClick={() => setChartMode('variance')}
                className={`px-2.5 py-1 rounded-md transition ${
                  chartMode === 'variance'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                الفروقات والمتبقي
              </button>
              <button
                type="button"
                onClick={() => setChartMode('categories')}
                className={`px-2.5 py-1 rounded-md transition ${
                  chartMode === 'categories'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                حسب الفئات
              </button>
            </div>

            {/* Toggle Active Phases */}
            <button
              type="button"
              onClick={() => setFilterActiveOnly(!filterActiveOnly)}
              className={`px-2 py-1 rounded-lg text-xs font-medium border transition ${
                filterActiveOnly 
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {filterActiveOnly ? 'المراحل النشطة فقط' : 'جميع المراحل'}
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center justify-between">
            <span>الميزانية المقدرة</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
            {totalBudget.toLocaleString()} <span className="text-[10px] font-sans font-normal text-slate-500">ر.س</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">معتمدة بالعقد</div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center justify-between">
            <span>التكاليف الفعلية (دفترة)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {totalActual.toLocaleString()} <span className="text-[10px] font-sans font-normal text-slate-500">ر.س</span>
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>مرحلة الهيكل والتكسيات</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center justify-between">
            <span>الفارق / المتاح للصرف</span>
            <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
            {totalVariance.toLocaleString()} <span className="text-[10px] font-sans font-normal text-slate-500">ر.س</span>
          </div>
          <div className="text-[10px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">
            +{(100 - totalBurnRate)}% سيولة متبقية
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center justify-between">
            <span>نسبة الاستهلاك الفعلي</span>
            <span className="text-[10px] font-mono text-amber-500 font-bold">{totalBurnRate}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(totalBurnRate, 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>المنفذ</span>
            <span>الهدف (45%)</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Section */}
      <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-3.5 sm:p-4 border border-slate-100 dark:border-slate-800">
        
        {/* Comparison Dual Bar Chart Mode */}
        {chartMode === 'comparison' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  مقارنة الميزانية المقدرة مقابل التكاليف الفعلية لمراحل المشروع (بالألف ريال - K SAR)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                المشروع: {currentProject?.name}
              </span>
            </div>

            <div className="h-[280px] sm:h-[320px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayedPhaseData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    unit="K"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                      direction: 'rtl',
                      padding: '10px 14px'
                    }}
                    formatter={(value: any, name: any) => [
                      `${Number(value).toLocaleString()} ألف ر.س (${(Number(value) * 1000).toLocaleString()} ر.س)`,
                      name === 'budgetK' ? 'الميزانية المقدرة' : 'التكلفة الفعلية المنفذة'
                    ]}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item?.fullName || label;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(value) => (
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {value === 'budgetK' ? 'الميزانية المقدرة (Estimated Budget)' : 'التكلفة الفعلية (Actual Cost)'}
                      </span>
                    )}
                  />
                  <Bar 
                    dataKey="budgetK" 
                    name="budgetK"
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="actualK" 
                    name="actualK"
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Variance & Differences Mode */}
        {chartMode === 'variance' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  الفروقات المالية والمتبقي المتاح لكل مرحلة معمارية (Variance K SAR)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span>
                  وفر محقق / متبقي للصرف
                </span>
              </div>
            </div>

            <div className="h-[280px] sm:h-[320px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayedPhaseData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    unit="K"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                      direction: 'rtl'
                    }}
                    formatter={(value: any) => [
                      `${Number(value).toLocaleString()} ألف ر.س`,
                      'الفارق (الميزانية - الفعلي)'
                    ]}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item?.fullName || label;
                    }}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} />
                  <Bar 
                    dataKey="varianceK" 
                    name="varianceK"
                    radius={[4, 4, 0, 0]}
                  >
                    {displayedPhaseData.map((entry, index) => (
                      <Cell 
                        key={`cell-var-${index}`} 
                        fill={entry.varianceK >= 0 ? '#10b981' : '#f43f5e'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Categories Breakdown Mode */}
        {chartMode === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                مقارنة الميزانية والتكاليف الفعلية بحسب الفئة الإنشائية (K SAR)
              </span>
              <span className="text-[11px] text-slate-400">
                مشروع أرابيسك
              </span>
            </div>

            <div className="h-[280px] sm:h-[320px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit="K" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 10, fill: '#475569' }} 
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                      direction: 'rtl'
                    }}
                    formatter={(value: any, name: any) => [
                      `${Number(value).toLocaleString()} ألف ر.س`,
                      name === 'plannedK' ? 'الميزانية التقديرية' : 'المصروف الفعلي'
                    ]}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                    formatter={(val) => val === 'plannedK' ? 'الميزانية المقدرة' : 'التكلفة الفعلية'}
                  />
                  <Bar dataKey="plannedK" fill="#3b82f6" radius={[0, 4, 4, 0]} name="plannedK" />
                  <Bar dataKey="actualK" fill="#10b981" radius={[0, 4, 4, 0]} name="actualK" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Footer Info & Quick Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            يتم تحديث الفروقات والمطابقة تلقائياً مع نظام <strong>دفترة المحاسبي (أمر عمل 17)</strong> ومخططات <strong>MagicPlan</strong>.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCostsClick}
            className="flex-1 sm:flex-initial px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition"
          >
            سجل التكاليف المفصل
          </button>
          <button
            type="button"
            onClick={handleProjectDetailClick}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-2xs"
          >
            <span>ملف مشروع أرابيسك</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
