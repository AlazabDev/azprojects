import React from 'react';
import { 
  DollarSign, 
  Receipt, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Building2, 
  Layers, 
  TrendingUp,
  FileText,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Project, ProjectPhase } from '../../types';
import { useApp } from '../../context/AppContext';

interface DaftraFinancialAuditViewProps {
  projects: Project[];
  phases: ProjectPhase[];
  onOpenDaftraModal: (project: Project, phase?: ProjectPhase) => void;
}

export const DaftraFinancialAuditView: React.FC<DaftraFinancialAuditViewProps> = ({
  projects,
  phases,
  onOpenDaftraModal
}) => {
  const { daftraRecords, settings, syncWithDaftra } = useApp();

  return (
    <div className="space-y-4" dir="rtl">
      
      {/* Daftra Integration Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              المطابقة الهندسية المالية لمنظومة دفترة (Daftra ERP Reconciliation)
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              مقارنة دقيقة بين نسب الإنجاز الميداني الفعلي على الأرض ومستخلصات وأوامر عمل دفترة المعتمدة لتفادي العجز المالي.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
            {settings.daftraSubdomain || 'alazab-co'}.daftra.com
          </span>
        </div>
      </div>

      {/* Projects Financial Audit Cards */}
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => {
          const projectPhases = phases.filter(ph => ph.projectId === project.id);
          const totalBudget = project.budget || 1;
          const physicalProgress = project.progress;
          const financialProgress = Math.round((project.actualCost / totalBudget) * 100);
          const variance = physicalProgress - financialProgress;

          return (
            <div 
              key={project.id} 
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {project.name}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {project.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    العميل: {project.clientName} • الميزانية التقديرية: {project.budget.toLocaleString()} ر.س
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {project.daftraWorkOrderId ? (
                    <a
                      href={project.daftraWorkOrderUrl || `https://alazab-co.daftra.com/owner/work_orders/view/${project.daftraWorkOrderId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-600" />
                      <span>أمر عمل دفترة #{project.daftraWorkOrderId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenDaftraModal(project)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ربط أمر عمل</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenDaftraModal(project)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    إصدار مستخلص
                  </button>
                </div>
              </div>

              {/* Progress Comparison Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                
                {/* Physical Progress */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-500">الإنجاز الميداني الفعلي:</span>
                    <span className="text-indigo-600 font-mono font-bold">{physicalProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${physicalProgress}%` }} />
                  </div>
                </div>

                {/* Financial Progress */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-500">المنصرف المالي:</span>
                    <span className="text-emerald-600 font-mono font-bold">{financialProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${financialProgress}%` }} />
                  </div>
                </div>

                {/* Engineering Health Status */}
                <div className="flex items-center gap-2">
                  {variance >= 0 ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>مطابقة آمنة (الإنجاز يسبق الصرف بـ {variance}%)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>تنبيه تدفق نقدي (الصرف تجاوز الإنجاز بـ {Math.abs(variance)}%)</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Phases Financial Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="text-slate-400 font-medium border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-2 px-3">المرحلة</th>
                      <th className="py-2 px-3">نسبة الإنجاز</th>
                      <th className="py-2 px-3">الميزانية المخصصة</th>
                      <th className="py-2 px-3">التكلفة الفعلية</th>
                      <th className="py-2 px-3">حالة مستخلص دفترة</th>
                      <th className="py-2 px-3 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {projectPhases.map((phase) => (
                      <tr key={phase.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-semibold">
                          {phase.orderNumber}. {phase.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                          {phase.progress}%
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {phase.budget.toLocaleString()} ر.س
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {phase.actualCost.toLocaleString()} ر.س
                        </td>
                        <td className="py-2.5 px-3">
                          {phase.progress === 100 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              ✓ مفوتر بالكامل
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              قيد الفوترة
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onOpenDaftraModal(project, phase)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-[11px]"
                          >
                            إصدار مستخلص
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
