import React from 'react';
import { 
  Layers, 
  Building2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Receipt, 
  Edit2, 
  ShieldCheck, 
  DollarSign, 
  Percent,
  ExternalLink
} from 'lucide-react';
import { Project, ProjectPhase, PhaseStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface AllPhasesMatrixViewProps {
  projects: Project[];
  phases: ProjectPhase[];
  onOpenPhaseModal: (phase: ProjectPhase, project: Project) => void;
  onOpenDaftraModal: (project: Project, phase?: ProjectPhase) => void;
}

export const AllPhasesMatrixView: React.FC<AllPhasesMatrixViewProps> = ({
  projects,
  phases,
  onOpenPhaseModal,
  onOpenDaftraModal
}) => {
  const { updatePhase, daftraRecords } = useApp();

  const getProjectForPhase = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getDaysLeft = (endDate: string, isCompleted: boolean) => {
    if (isCompleted) return { text: 'مكتملة', isLate: false };
    const end = new Date(endDate).getTime();
    const now = new Date('2026-09-10').getTime();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: `متأخرة بـ ${Math.abs(diff)} يوم`, isLate: true };
    if (diff === 0) return { text: 'اليوم!', isLate: true };
    return { text: `${diff} يوم متبقي`, isLate: false };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden" dir="rtl">
      
      {/* Table Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            مصفوفة المراحل الهندسية المجمعة لكافة المشاريع ({phases.length} مرحلة)
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          جدول الإشراف التنفيذي اليومي للمهندسين
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">المشروع التابع</th>
              <th className="py-3 px-4">المرحلة الهندسية</th>
              <th className="py-3 px-4">الحالة</th>
              <th className="py-3 px-4">الجدول الزمني</th>
              <th className="py-3 px-4">الإنجاز الميداني</th>
              <th className="py-3 px-4">الميزانية / التكلفة</th>
              <th className="py-3 px-4">ربط دفترة ERP</th>
              <th className="py-3 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {phases.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  لا توجد مراحل مطابقة لمعايير البحث والتصفية المحددة.
                </td>
              </tr>
            ) : (
              phases.map((phase) => {
                const proj = getProjectForPhase(phase.projectId);
                const days = getDaysLeft(phase.endDate, phase.progress === 100);
                const hasDaftraRecord = daftraRecords.some(r => 
                  r.notes?.includes(phase.name) || 
                  (proj?.daftraWorkOrderId === '17' && phase.orderNumber <= 3)
                );

                return (
                  <tr key={phase.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    
                    {/* Index */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {phase.orderNumber}
                    </td>

                    {/* Project */}
                    <td className="py-3.5 px-4">
                      {proj ? (
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {proj.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {proj.id} • {proj.location}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">غير محدد</span>
                      )}
                    </td>

                    {/* Phase Name & Description */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {phase.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {phase.description}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        phase.progress === 100 || phase.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : phase.status === 'delayed'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                      }`}>
                        {phase.progress === 100 ? 'مكتملة' : phase.status === 'delayed' ? 'متأخرة' : 'قيد التنفيذ'}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                        {phase.startDate} إلى {phase.endDate}
                      </div>
                      <div className={`text-[10px] font-semibold ${days.isLate ? 'text-rose-600' : 'text-slate-400'}`}>
                        {days.text}
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-mono font-bold">
                          <span>{phase.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              phase.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {phase.budget.toLocaleString()} ر.س
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        الفعلي: {phase.actualCost.toLocaleString()} ر.س
                      </div>
                    </td>

                    {/* Daftra ERP */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {proj?.daftraWorkOrderId ? (
                        <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                          <Receipt className="w-3.5 h-3.5" />
                          <span>أمر عمل #{proj.daftraWorkOrderId}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">غير مربوط</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => proj && onOpenPhaseModal(phase, proj)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-lg"
                          title="تعديل المرحلة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => proj && onOpenDaftraModal(proj, phase)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 rounded-lg"
                          title="فحص فواتير دفترة"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
