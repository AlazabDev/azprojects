import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Layers, 
  ChevronRight, 
  ChevronLeft, 
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { 
    projectTasks, 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    moveTaskStatus, 
    selectedProject, 
    projectPhases, 
    teamMembers 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    phaseId: projectPhases[0]?.id || '',
    priority: 'high' as TaskPriority,
    assignedTo: teamMembers[0]?.id || 'usr-pm-01',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: 8,
    checklists: 'مراجعة المخططات الإنشائية، مطابقة الأبعاد الموقعية، توقيع محضر الاستلام'
  });

  const columns: { id: TaskStatus; label: string; bg: string; dot: string }[] = [
    { id: 'todo', label: 'قيد الانتظار', bg: 'bg-slate-100 dark:bg-slate-800/80', dot: 'bg-slate-400' },
    { id: 'in-progress', label: 'قيد التنفيذ', bg: 'bg-blue-50 dark:bg-blue-950/20', dot: 'bg-blue-500' },
    { id: 'review', label: 'مراجعة واعتماد هندسي', bg: 'bg-amber-50 dark:bg-amber-950/20', dot: 'bg-amber-500' },
    { id: 'done', label: 'مكتملة ومعتمدة', bg: 'bg-emerald-50 dark:bg-emerald-950/20', dot: 'bg-emerald-500' }
  ];

  const filteredTasks = projectTasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesPhase = phaseFilter === 'all' || t.phaseId === phaseFilter;
    return matchesSearch && matchesPriority && matchesPhase;
  });

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskData.title) return;

    const assignedMember = teamMembers.find(m => m.id === newTaskData.assignedTo);
    const targetPhase = projectPhases.find(p => p.id === newTaskData.phaseId);

    const checklistItems = newTaskData.checklists
      .split('،')
      .map(c => c.trim())
      .filter(Boolean)
      .map((text, idx) => ({ id: 'chk-' + idx, text, completed: false }));

    addTask({
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      phaseId: newTaskData.phaseId || projectPhases[0]?.id || 'PHS-DEFAULT',
      phaseName: targetPhase?.name || 'المرحلة الحالية',
      title: newTaskData.title,
      description: newTaskData.description || 'مهمة هندسية تنفيذية',
      status: 'todo',
      priority: newTaskData.priority,
      assignedTo: newTaskData.assignedTo,
      assignedToName: assignedMember?.name || 'م. عبد العزيز',
      assignedToAvatar: assignedMember?.avatar,
      dueDate: newTaskData.dueDate,
      estimatedHours: Number(newTaskData.estimatedHours),
      checklists: checklistItems
    });

    setShowAddModal(false);
    setNewTaskData({
      title: '',
      description: '',
      phaseId: projectPhases[0]?.id || '',
      priority: 'high',
      assignedTo: teamMembers[0]?.id || 'usr-pm-01',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 8,
      checklists: 'مراجعة المخططات الإنشائية، مطابقة الأبعاد الموقعية، توقيع محضر الاستلام'
    });
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">حرجة وعاجلة</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">عالية</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">متوسطة</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">منخفضة</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span>لوحة كانبان وتتبع المهام الهندسية ({filteredTasks.length} مهام)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            توزيع المهام الإنشائية، متابعة نسب الإنجاز، واعتمادات الاستشاري والمقاول
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهمة جديدة</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث في أسماء وتفاصيل المهام..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs pr-9 pl-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
          >
            <option value="all">كل الأولويات</option>
            <option value="critical">حرجة</option>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">منخفضة</option>
          </select>

          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none max-w-[200px] truncate"
          >
            <option value="all">جميع المراحل</option>
            {projectPhases.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl p-3.5 ${col.bg} border border-slate-200/80 dark:border-slate-700/80 flex flex-col min-h-[480px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{col.label}</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Stack */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] scrollbar-thin">
                {colTasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    لا توجد مهام في هذا العمود
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition space-y-2.5 group"
                    >
                      {/* Priority & Phase Tag */}
                      <div className="flex items-center justify-between gap-1">
                        {getPriorityBadge(task.priority)}
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={task.phaseName}>
                          {task.phaseName}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      {/* Checklists Progress */}
                      {task.checklists && task.checklists.length > 0 && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>قائمة التحقق</span>
                            <span>{task.checklists.filter(c => c.completed).length} / {task.checklists.length}</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${(task.checklists.filter(c => c.completed).length / task.checklists.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Due Date & Assignee */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.dueDate}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {task.assignedToAvatar ? (
                            <img src={task.assignedToAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[9px]">
                              {task.assignedToName?.charAt(0) || 'م'}
                            </div>
                          )}
                          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                            {task.assignedToName}
                          </span>
                        </div>
                      </div>

                      {/* Quick Shift Status Actions */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                        <div className="flex items-center gap-1">
                          {col.id !== 'todo' && (
                            <button
                              onClick={() => {
                                const prevStatus: Record<TaskStatus, TaskStatus> = {
                                  'in-progress': 'todo',
                                  'review': 'in-progress',
                                  'done': 'review',
                                  'todo': 'todo',
                                  'blocked': 'todo'
                                };
                                moveTaskStatus(task.id, prevStatus[col.id]);
                              }}
                              className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded flex items-center gap-0.5"
                              title="نقل للعمود السابق"
                            >
                              <ChevronRight className="w-3 h-3" />
                              <span>السابق</span>
                            </button>
                          )}

                          {col.id !== 'done' && (
                            <button
                              onClick={() => {
                                const nextStatus: Record<TaskStatus, TaskStatus> = {
                                  'todo': 'in-progress',
                                  'in-progress': 'review',
                                  'review': 'done',
                                  'done': 'done',
                                  'blocked': 'todo'
                                };
                                moveTaskStatus(task.id, nextStatus[col.id]);
                              }}
                              className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded flex items-center gap-0.5 font-bold"
                              title="نقل للعمود التالي"
                            >
                              <span>التالي</span>
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="حذف المهمة"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">إسناد مهمة هندسية جديدة</h3>
            
            <form onSubmit={handleAddTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان المهمة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فحص صبة النظافة والتأكد من استواء السطح"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المرحلة الهندسية</label>
                  <select
                    value={newTaskData.phaseId}
                    onChange={(e) => setNewTaskData({ ...newTaskData, phaseId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white cursor-pointer"
                  >
                    {projectPhases.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الأولوية</label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as TaskPriority })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="critical">حرجة وعاجلة (Critical)</option>
                    <option value="high">عالية (High)</option>
                    <option value="medium">متوسطة (Medium)</option>
                    <option value="low">منخفضة (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المسؤول / المهندس</label>
                  <select
                    value={newTaskData.assignedTo}
                    onChange={(e) => setNewTaskData({ ...newTaskData, assignedTo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white cursor-pointer"
                  >
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.title})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={newTaskData.dueDate}
                    onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عناصر قائمة التحقق (مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={newTaskData.checklists}
                  onChange={(e) => setNewTaskData({ ...newTaskData, checklists: e.target.value })}
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
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md"
                >
                  حفظ وإسناد المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
