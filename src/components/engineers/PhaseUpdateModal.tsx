import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Percent, 
  DollarSign, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Save,
  Building2
} from 'lucide-react';
import { Project, ProjectPhase, PhaseStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface PhaseUpdateModalProps {
  phase: ProjectPhase | null;
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PhaseUpdateModal: React.FC<PhaseUpdateModalProps> = ({
  phase,
  project,
  isOpen,
  onClose
}) => {
  const { updatePhase, triggerConfetti, triggerPhaseUpdateNotification } = useApp();

  const [progress, setProgress] = useState<number>(phase?.progress || 0);
  const [status, setStatus] = useState<PhaseStatus>(phase?.status || 'in-progress');
  const [actualCost, setActualCost] = useState<number>(phase?.actualCost || 0);
  const [startDate, setStartDate] = useState<string>(phase?.startDate || '');
  const [endDate, setEndDate] = useState<string>(phase?.endDate || '');
  const [notes, setNotes] = useState<string>(phase?.notes || '');
  const [sbcApproved, setSbcApproved] = useState<boolean>(true);

  if (!isOpen || !phase || !project) return null;

  const handleProgressChange = (val: number) => {
    const p = Math.max(0, Math.min(100, val));
    setProgress(p);
    if (p === 100) {
      setStatus('completed');
    } else if (p > 0 && status === 'pending') {
      setStatus('in-progress');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const oldProgress = phase.progress;
    const newProgress = Number(progress);

    updatePhase(phase.id, {
      progress: newProgress,
      status,
      actualCost: Number(actualCost),
      startDate,
      endDate,
      notes: sbcApproved 
        ? `${notes} [معتمد طبقاً لكود البناء السعودي SBC]` 
        : notes
    });

    triggerPhaseUpdateNotification(phase.id, oldProgress, newProgress);

    if (newProgress === 100 && oldProgress < 100) {
      triggerConfetti();
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                تحديث المرحلة الهندسية #{phase.orderNumber}
              </h2>
              <p className="text-xs text-slate-400">
                {project.name} • {phase.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs overflow-y-auto">
          
          {/* Progress Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                نسبة الإنجاز الميداني الفعلي:
              </label>
              <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
                {progress}%
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => handleProgressChange(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (البدء)</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100% (اكتمال وتسليم)</span>
            </div>
          </div>

          {/* Status Selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              حالة المرحلة:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'in-progress', label: 'قيد التنفيذ', color: 'indigo' },
                { id: 'completed', label: 'مكتملة', color: 'emerald' },
                { id: 'delayed', label: 'متأخرة', color: 'rose' },
                { id: 'pending', label: 'قيد الانتظار', color: 'slate' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id as PhaseStatus)}
                  className={`py-2 px-2.5 rounded-xl font-bold border text-center transition cursor-pointer ${
                    status === st.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actual Cost & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                التكلفة الفعلية المنصرفة (ر.س):
              </label>
              <input
                type="number"
                min="0"
                value={actualCost}
                onChange={(e) => setActualCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                الميزانية المعتمدة: {phase.budget.toLocaleString()} ر.س
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                تاريخ التسليم المخطط:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* SBC Code Checkbox */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="sbcApprove"
              checked={sbcApproved}
              onChange={(e) => setSbcApproved(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
            />
            <label htmlFor="sbcApprove" className="text-emerald-900 dark:text-emerald-200 font-bold cursor-pointer">
              اعتماد الفحص الفني طبقاً لكود البناء السعودي (SBC)
            </label>
          </div>

          {/* Field Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              ملاحظات المهندس الميداني ومحضر الاستلام:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="تسجيل أية معوقات، اختبارات معملية، أو ملاحظات استلام..."
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التحديث الهندسي</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
