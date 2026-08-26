import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectPhase, PhaseStatus } from '../../types';
import { 
  Layers, 
  Plus, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  Sparkles,
  ChevronDown,
  CheckSquare
} from 'lucide-react';

export const PhasesManager: React.FC = () => {
  const { projectPhases, updatePhase, addPhase, deletePhase, selectedProject } = useApp();
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newPhaseData, setNewPhaseData] = useState({
    name: '',
    nameEn: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 150000,
    deliverables: 'المخططات التنفيذية، رخص البناء، محضر استلام'
  });

  const handleAddPhaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newPhaseData.name) return;

    addPhase({
      projectId: selectedProject.id,
      name: newPhaseData.name,
      nameEn: newPhaseData.nameEn || newPhaseData.name,
      description: newPhaseData.description || `مرحلة ${newPhaseData.name}`,
      orderNumber: projectPhases.length + 1,
      startDate: newPhaseData.startDate,
      endDate: newPhaseData.endDate,
      progress: 0,
      status: 'pending',
      budget: Number(newPhaseData.budget),
      actualCost: 0,
      deliverables: newPhaseData.deliverables.split('،').map(d => d.trim()).filter(Boolean)
    });

    setShowAddModal(false);
    setNewPhaseData({
      name: '',
      nameEn: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 150000,
      deliverables: 'المخططات التنفيذية، رخص البناء، محضر استلام'
    });
  };

  const getStatusBadge = (status: PhaseStatus) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">مكتملة 100%</span>;
      case 'in-progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">قيد التنفيذ</span>;
      case 'delayed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">متأخرة</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">قيد الانتظار</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>المراحل الهندسية السبع القياسية ({projectPhases.length} مراحل)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تتبع مراحل المشروع من الفكرة المعمارية حتى الاعتمادات والتنفيذ والتسليم النهائي
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مرحلة جديدة</span>
        </button>
      </div>

      {/* Phase Cards Timeline List */}
      <div className="space-y-4">
        {projectPhases.sort((a, b) => a.orderNumber - b.orderNumber).map((phase, index) => {
          const isEditing = editingPhaseId === phase.id;

          return (
            <div
              key={phase.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all shadow-xs p-5 space-y-4 ${
                phase.status === 'in-progress' 
                  ? 'border-blue-500/80 dark:border-blue-500/80 ring-1 ring-blue-500/20' 
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                    phase.status === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : phase.status === 'in-progress'
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{phase.name}</h3>
                      {getStatusBadge(phase.status)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{phase.nameEn || phase.description}</p>
                  </div>
                </div>

                {/* Progress Control and Actions */}
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="text-xs text-slate-400 block">نسبة الإنجاز</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">{phase.progress}%</span>
                  </div>

                  <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-3 mr-1">
                    <button
                      onClick={() => setEditingPhaseId(isEditing ? null : phase.id)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                      title="تعديل المرحلة ونسب الإنجاز"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePhase(phase.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                      title="حذف المرحلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Slider (Active or Editable) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>تقدم أعمال المرحلة</span>
                  <span>{phase.progress}% من المستهدف</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={phase.progress}
                  onChange={(e) => {
                    const newProg = Number(e.target.value);
                    const newStatus: PhaseStatus = newProg === 100 ? 'completed' : (newProg > 0 ? 'in-progress' : 'pending');
                    updatePhase(phase.id, { progress: newProg, status: newStatus });
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Specs & Deliverables Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-400 block text-[11px] mb-0.5">الميزانية المرصودة للمرحلة</span>
                  <span className="font-bold text-slate-900 dark:text-white">{phase.budget.toLocaleString()} ر.س</span>
                  <p className="text-[10px] text-emerald-600 mt-1">المنصرف: {phase.actualCost.toLocaleString()} ر.س</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-400 block text-[11px] mb-0.5">الفترة الزمنية المحددة</span>
                  <span className="font-bold text-slate-900 dark:text-white">{phase.startDate} إلى {phase.endDate}</span>
                  <p className="text-[10px] text-slate-400 mt-1">الجدول الزمني المعتمد</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-400 block text-[11px] mb-0.5">المخرجات والاعتمادات المطلوبة</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {phase.deliverables?.map((del, dIdx) => (
                      <span key={dIdx} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium">
                        ✓ {del}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Add New Phase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">إضافة مرحلة هندسية جديدة</h3>
            
            <form onSubmit={handleAddPhaseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المرحلة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أعمال العزل والتشطيبات الفاخرة"
                  value={newPhaseData.name}
                  onChange={(e) => setNewPhaseData({ ...newPhaseData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    value={newPhaseData.startDate}
                    onChange={(e) => setNewPhaseData({ ...newPhaseData, startDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={newPhaseData.endDate}
                    onChange={(e) => setNewPhaseData({ ...newPhaseData, endDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الميزانية المرصودة (ر.س)</label>
                <input
                  type="number"
                  value={newPhaseData.budget}
                  onChange={(e) => setNewPhaseData({ ...newPhaseData, budget: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المخرجات المستلمة (مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={newPhaseData.deliverables}
                  onChange={(e) => setNewPhaseData({ ...newPhaseData, deliverables: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md"
                >
                  إضافة المرحلة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
