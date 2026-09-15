import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Receipt, 
  ExternalLink, 
  Edit2, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  User, 
  HardHat, 
  DollarSign, 
  FileText, 
  ShieldCheck, 
  Plus,
  Sparkles,
  TrendingUp,
  Percent,
  Compass
} from 'lucide-react';
import { Project, ProjectPhase, PhaseStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProjectPhasesCardProps {
  project: Project;
  phases: ProjectPhase[];
  onOpenPhaseModal: (phase: ProjectPhase, project: Project) => void;
  onOpenDaftraModal: (project: Project, phase?: ProjectPhase) => void;
}

export const ProjectPhasesCard: React.FC<ProjectPhasesCardProps> = ({
  project,
  phases,
  onOpenPhaseModal,
  onOpenDaftraModal
}) => {
  const { updatePhase, daftraRecords, setSelectedProjectId, setNavigationTab } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);

  // Status mapping
  const getStatusBadge = (status: PhaseStatus, progress: number) => {
    if (progress === 100 || status === 'completed') {
      return {
        label: 'مكتملة',
        color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle2
      };
    }
    if (status === 'delayed') {
      return {
        label: 'متأخرة عن الموعد',
        color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        icon: AlertTriangle
      };
    }
    if (status === 'in-progress') {
      return {
        label: 'قيد التنفيذ',
        color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        icon: Clock
      };
    }
    return {
      label: 'قيد التخطيط',
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      icon: Clock
    };
  };

  // Quick increment progress
  const handleQuickIncrement = (e: React.MouseEvent, phase: ProjectPhase, increment: number) => {
    e.stopPropagation();
    const newProgress = Math.min(100, phase.progress + increment);
    const newStatus: PhaseStatus = newProgress === 100 ? 'completed' : 'in-progress';
    updatePhase(phase.id, {
      progress: newProgress,
      status: newStatus
    });
  };

  // SBC Code reference matcher per phase type
  const getSbcCodeForPhase = (phaseName: string, orderNumber: number) => {
    const lower = phaseName.toLowerCase();
    if (lower.includes('مساح') || lower.includes('magicplan') || orderNumber === 1) {
      return { code: 'SBC 201', desc: 'الاشتراطات المعمارية والمناور والارتدادات النظامية' };
    }
    if (lower.includes('تصميم') || lower.includes('أرابيسك') || orderNumber === 2) {
      return { code: 'SBC 1101', desc: 'كود البناء السكني ومواصفات الواجهات' };
    }
    if (lower.includes('دفترة') || lower.includes('اعتماد') || orderNumber === 3) {
      return { code: 'SBC 801', desc: 'معايير السلامة العامة وإجراءات التراخيص' };
    }
    return { code: 'SBC 304', desc: 'كود الخرسانة الإنشائية واختبارات كسر المكعبات' };
  };

  // Days remaining calculation
  const getDaysInfo = (endDateStr: string, isDone: boolean) => {
    if (isDone) return { text: 'منجزة في الموعد', isLate: false };
    const end = new Date(endDateStr).getTime();
    const now = new Date('2026-09-10').getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { text: `متأخرة بـ ${Math.abs(diffDays)} يوم`, isLate: true };
    }
    if (diffDays === 0) {
      return { text: 'تستحق اليوم!', isLate: true };
    }
    return { text: `متبقي ${diffDays} يوم`, isLate: false };
  };

  // Calculate project financial health
  const budgetBurnRate = project.budget > 0 
    ? Math.round((project.actualCost / project.budget) * 100) 
    : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition hover:shadow-xs" dir="rtl">
      
      {/* Project Card Master Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Project Title & Metadata */}
          <div className="flex items-start gap-3.5">
            {project.coverImage ? (
              <img
                src={project.coverImage}
                alt={project.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {project.name}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {project.id}
                </span>

                {/* Project Status Badge */}
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  project.status === 'active'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : project.status === 'completed'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}>
                  {project.status === 'active' ? 'قيد التنفيذ' : project.status === 'completed' ? 'مكتمل' : 'قيد التخطيط'}
                </span>
              </div>

              {/* Location & Key Personnel */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{project.location}</span>
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>العميل: {project.clientName}</span>
                </span>
                {project.leadArchitect && (
                  <span className="flex items-center gap-1">
                    <HardHat className="w-3.5 h-3.5 text-indigo-500" />
                    <span>المعماري المشرف: {project.leadArchitect}</span>
                  </span>
                )}
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  المساحة: {project.areaM2} م² ({project.floorsCount} طوابق)
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Daftra Work Order Link + Progress + Toggle */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Live Daftra Work Order Pill */}
            {project.daftraWorkOrderId ? (
              <div className="flex items-center gap-1.5 p-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
                <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      أمر عمل دفترة #{project.daftraWorkOrderId}
                    </span>
                    {project.daftraWorkOrderUrl && (
                      <a
                        href={project.daftraWorkOrderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-700 hover:text-amber-900 dark:text-amber-300"
                        title="فتح أمر العمل في دفترة"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 block">
                    مربوط حي مع ERP
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenDaftraModal(project)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ربط بأمر عمل في دفترة</span>
              </button>
            )}

            {/* Overall Progress Gauge */}
            <div className="text-left w-32 shrink-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">الإنجاز الكلي</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Expand / Collapse Phases Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{phases.length} مراحل</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Project Financial Summary Sub-bar */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-300">
            <span>
              <strong className="text-slate-900 dark:text-white">الميزانية: </strong>
              {project.budget.toLocaleString()} ر.س
            </span>
            <span>
              <strong className="text-slate-900 dark:text-white">المنصرف الفعلي: </strong>
              {project.actualCost.toLocaleString()} ر.س
            </span>
            <span className={`font-semibold ${budgetBurnRate > 90 ? 'text-rose-600' : 'text-emerald-600'}`}>
              (معدل الصرف: {budgetBurnRate}%)
            </span>
            <span>
              <strong className="text-slate-900 dark:text-white">التسليم المستهدف: </strong>
              {project.endDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDaftraModal(project)}
              className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>مراجعة مستخلصات دفترة للمشروع</span>
            </button>
          </div>
        </div>

      </div>

      {/* Expanded Phases Table / Cards List */}
      {isExpanded && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {phases.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              لا توجد مراحل مسجلة لهذا المشروع حالياً.
            </div>
          ) : (
            phases.map((phase) => {
              const statusObj = getStatusBadge(phase.status, phase.progress);
              const StatusIcon = statusObj.icon;
              const sbcInfo = getSbcCodeForPhase(phase.name, phase.orderNumber);
              const daysInfo = getDaysInfo(phase.endDate, phase.progress === 100);

              // Find matched Daftra records for this phase if any
              const matchedDaftra = daftraRecords.find(r => 
                r.notes?.includes(phase.name) || 
                r.description?.includes(phase.name) ||
                (project.daftraWorkOrderId === '17' && phase.orderNumber <= 3)
              );

              return (
                <div 
                  key={phase.id} 
                  className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    
                    {/* Phase Info & Number */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center font-mono">
                          {phase.orderNumber}
                        </span>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {phase.name}
                        </h3>

                        {phase.nameEn && (
                          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                            ({phase.nameEn})
                          </span>
                        )}

                        {/* Status Chip */}
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusObj.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusObj.label}</span>
                        </span>

                        {/* Days Remaining / Delay Alert */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          daysInfo.isLate
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {daysInfo.text}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-8">
                        {phase.description}
                      </p>

                      {/* Deliverables & SBC Code Badges */}
                      <div className="flex flex-wrap items-center gap-2 pr-8 pt-1 text-[11px]">
                        
                        {/* SBC Code Pill */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{sbcInfo.code}</span>
                          <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">({sbcInfo.desc})</span>
                        </span>

                        {/* Deliverables List */}
                        {phase.deliverables && phase.deliverables.map((del, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]"
                          >
                            ✓ {del}
                          </span>
                        ))}

                        {/* Matched Daftra Invoice Pill */}
                        {matchedDaftra && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-[10px]">
                            <Receipt className="w-3 h-3 text-amber-600" />
                            <span>مستخلص دفترة: {matchedDaftra.amount?.toLocaleString()} ر.س ({matchedDaftra.status === 'synced' ? 'مفوتر معتمد' : 'مسودة'})</span>
                          </span>
                        )}

                      </div>
                    </div>

                    {/* Phase Progress & Financials & Action Buttons */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end shrink-0">
                      
                      {/* Financials for Phase */}
                      <div className="text-left text-xs space-y-0.5">
                        <div className="text-slate-400 text-[11px]">الميزانية / التكلفة</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {phase.budget.toLocaleString()} ر.س
                        </div>
                        <div className="text-[10px] text-slate-500">
                          الفعلي: {phase.actualCost.toLocaleString()} ر.س
                        </div>
                      </div>

                      {/* Interactive Progress Bar */}
                      <div className="w-36 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">الإنجاز الميداني</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">{phase.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              phase.progress === 100 
                                ? 'bg-emerald-500' 
                                : phase.status === 'delayed'
                                ? 'bg-rose-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>

                        {/* Quick increment buttons */}
                        <div className="flex items-center justify-between pt-0.5 text-[10px]">
                          <button
                            type="button"
                            onClick={(e) => handleQuickIncrement(e, phase, 10)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                            title="زيادة نسبة الإنجاز 10%"
                          >
                            +10%
                          </button>
                          {phase.progress < 100 && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickIncrement(e, phase, 100)}
                              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                              title="اعتماد اكتمال المرحلة 100%"
                            >
                              إكمال 100%
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action Menu Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenPhaseModal(phase, project)}
                          className="p-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          title="تعديل المرحلة وتسجيل الملاحظات الهندسية"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">تعديل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenDaftraModal(project, phase)}
                          className="p-2 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          title="إصدار فاتورة أو مستخلص لهذه المرحلة في دفترة"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">دفترة</span>
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
