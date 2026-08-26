import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Search, 
  SlidersHorizontal, 
  RefreshCw, 
  CheckCheck, 
  Sparkles, 
  Layers, 
  CheckSquare, 
  DollarSign, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Send, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Building2, 
  ShieldAlert
} from 'lucide-react';
import { NotificationItem, AlertCategory } from '../../types';
import { getDeadlineBadge, playAlertChime } from '../../utils/alertEngine';

export const NotificationsHub: React.FC = () => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    criticalNotificationsCount,
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification, 
    clearAllNotifications, 
    snoozeNotification,
    runDeadlineScan,
    alertSettings,
    updateAlertSettings,
    updateAlertRule,
    projects,
    phases,
    setSelectedProjectId,
    setNavigationTab,
    addNotification
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [onlyUnread, setOnlyUnread] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResultToast, setScanResultToast] = useState<string | null>(null);
  
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showCreateReminderModal, setShowCreateReminderModal] = useState<boolean>(false);
  const [snoozeMenuOpenId, setSnoozeMenuOpenId] = useState<string | null>(null);

  // New Custom Reminder Form State
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderMessage, setNewReminderMessage] = useState('');
  const [newReminderProjectId, setNewReminderProjectId] = useState(projects[0]?.id || '');
  const [newReminderPhaseId, setNewReminderPhaseId] = useState('');
  const [newReminderDueDate, setNewReminderDueDate] = useState('2026-08-30');
  const [newReminderPriority, setNewReminderPriority] = useState<'normal' | 'high' | 'critical'>('high');
  const [newReminderCategory, setNewReminderCategory] = useState<AlertCategory>('deadline');

  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const result = runDeadlineScan(true);
      setIsScanning(false);
      if (result.newAlertsCount > 0) {
        setScanResultToast(`تم رصد وتحديث ${result.newAlertsCount} تنبيهات موعد ومراحل جديدة بنجاح!`);
      } else {
        setScanResultToast('تم فحص جميع المواعيد والمراحل: لا توجد تنبيهات متأخرة غير مسجلة.');
      }
      setTimeout(() => setScanResultToast(null), 4000);
    }, 600);
  };

  const handleNavigateToEntity = (ntf: NotificationItem) => {
    markNotificationAsRead(ntf.id);
    if (ntf.projectId) {
      setSelectedProjectId(ntf.projectId);
    }
    if (ntf.type === 'phase' || ntf.category === 'phase_update' || ntf.phaseId) {
      setNavigationTab('phases');
    } else if (ntf.type === 'task' || ntf.taskId) {
      setNavigationTab('tasks');
    } else if (ntf.type === 'cost' || ntf.category === 'budget_alert') {
      setNavigationTab('costs');
    } else if (ntf.type === 'whatsapp') {
      setNavigationTab('whatsapp');
    } else {
      setNavigationTab('project-detail');
    }
  };

  const handleSendWhatsAppShare = (ntf: NotificationItem) => {
    const text = encodeURIComponent(`*تنبيه منصة AzProjects المعمارية*\n📌 *${ntf.title}*\n🏢 المشروع: ${ntf.projectName || 'المشروع'}\n📝 التفاصيل: ${ntf.message}\n⏰ التاريخ: ${new Date(ntf.createdAt).toLocaleDateString('ar-SA')}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCreateCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    const prj = projects.find(p => p.id === newReminderProjectId);
    const phs = phases.find(p => p.id === newReminderPhaseId);

    addNotification({
      userId: 'usr-azab-01',
      type: newReminderCategory === 'phase_update' ? 'phase' : (newReminderCategory === 'task_alert' ? 'task' : 'deadline'),
      category: newReminderCategory,
      title: newReminderTitle,
      message: newReminderMessage || `تذكير مخصص لمشروع ${prj?.name || ''} بموعد نهائي ${newReminderDueDate}`,
      priority: newReminderPriority,
      read: false,
      projectId: newReminderProjectId,
      projectName: prj?.name,
      phaseId: newReminderPhaseId || undefined,
      phaseName: phs?.name || undefined,
      targetDate: newReminderDueDate
    });

    setShowCreateReminderModal(false);
    setNewReminderTitle('');
    setNewReminderMessage('');
    setScanResultToast('تم إنشاء التذكير المخصص بنجاح!');
    setTimeout(() => setScanResultToast(null), 3000);
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    // Category match
    if (activeCategoryFilter === 'deadlines') {
      if (n.category !== 'deadline' && n.type !== 'deadline' && !n.targetDate) return false;
    } else if (activeCategoryFilter === 'phases') {
      if (n.category !== 'phase_update' && n.type !== 'phase' && !n.phaseId) return false;
    } else if (activeCategoryFilter === 'tasks') {
      if (n.category !== 'task_alert' && n.type !== 'task' && !n.taskId) return false;
    } else if (activeCategoryFilter === 'costs') {
      if (n.category !== 'budget_alert' && n.type !== 'cost' && n.type !== 'payment') return false;
    } else if (activeCategoryFilter === 'whatsapp') {
      if (n.type !== 'whatsapp') return false;
    }

    // Priority match
    if (filterPriority !== 'all' && n.priority !== filterPriority) return false;

    // Project match
    if (filterProject !== 'all' && n.projectId !== filterProject) return false;

    // Read/Unread match
    if (onlyUnread && n.read) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchMsg = n.message.toLowerCase().includes(q);
      const matchPrj = n.projectName?.toLowerCase().includes(q) || false;
      const matchPhs = n.phaseName?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchMsg && !matchPrj && !matchPhs) return false;
    }

    return true;
  });

  const deadlineAlertsCount = notifications.filter(n => n.category === 'deadline' || n.type === 'deadline' || !!n.targetDate).length;
  const phaseAlertsCount = notifications.filter(n => n.category === 'phase_update' || n.type === 'phase').length;

  return (
    <div className="space-y-6" dir="rtl" id="notifications-hub-main">
      
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                نظام التنبيهات والمواعيد الدورية
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500 text-white animate-pulse">
                    {unreadNotificationsCount} جديد
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                متابعة آلية حية للمواعيد النهائية (Deadlines)، استحقاقات المراحل الإنشائية، والمهام الحرجة بالموقع
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleManualScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 transition-all rounded-xl shadow-xs disabled:opacity-50"
            title="فحص فوري لقواعد البيانات وجداول المراحل"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'جارٍ فحص المواعيد...' : 'فحص فوري للمواعيد'}
          </button>

          <button
            onClick={() => setShowCreateReminderModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            تذكير مخصص
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all rounded-xl"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            قواعد التنبيه
          </button>

          {unreadNotificationsCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              تحديد الكل كمقروء
            </button>
          )}
        </div>
      </div>

      {/* Live Toast Banner */}
      {scanResultToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl flex items-center justify-between text-emerald-800 dark:text-emerald-200 text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{scanResultToast}</span>
          </div>
          <button onClick={() => setScanResultToast(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Total Alerts */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">إجمالي التنبيهات</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{notifications.length}</div>
            <span className="text-[10px] text-slate-400">محدثة لحظياً</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Critical Deadlines */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">مواعيد حرجة ومتأخرة</span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{criticalNotificationsCount}</div>
            <span className="text-[10px] text-rose-500/80">تتطلب إجراءً فورياً</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Phase Deadlines */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">تحديثات المراحل المعمارية</span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{phaseAlertsCount}</div>
            <span className="text-[10px] text-amber-500/80">نسب إنجاز وتسليمات</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Periodic Engine Status */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">المسح الدوري التلقائي</span>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {alertSettings.enablePeriodicScanning ? `نشط كل ${alertSettings.scanIntervalMinutes} دقيقة` : 'متوقف مؤقتاً'}
            </div>
            <span className="text-[10px] text-slate-400">فحص تلقائي مستمر</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Category Tabs and Filter Row */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Category Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          {[
            { id: 'all', label: 'جميع الإشعارات', count: notifications.length, icon: Bell },
            { id: 'deadlines', label: 'المواعيد النهائية والمهام', count: deadlineAlertsCount, icon: Calendar },
            { id: 'phases', label: 'تحديثات المراحل', count: phaseAlertsCount, icon: Layers },
            { id: 'tasks', label: 'مهام الموقع', count: notifications.filter(n => n.type === 'task').length, icon: CheckSquare },
            { id: 'costs', label: 'المالية والتكاليف', count: notifications.filter(n => n.type === 'cost' || n.type === 'payment').length, icon: DollarSign },
            { id: 'whatsapp', label: 'وارد واتساب الميداني', count: notifications.filter(n => n.type === 'whatsapp').length, icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeCategoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث في نص التنبيه أو المشروع..."
              className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-900 dark:text-white"
            >
              <option value="all">جميع المشاريع المعمارية</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-900 dark:text-white"
            >
              <option value="all">جميع مستويات الأهمية</option>
              <option value="critical">🚨 حرج جداً (Critical)</option>
              <option value="high">⚠️ مرتفع (High)</option>
              <option value="normal">ℹ️ عادي (Normal)</option>
              <option value="low">منخفض (Low)</option>
            </select>
          </div>

          {/* Unread Switch & Clear Button */}
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyUnread}
                onChange={e => setOnlyUnread(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>غير المقروء فقط</span>
            </label>

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[11px] text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="مسح جميع الإشعارات"
              >
                <Trash2 className="w-3.5 h-3.5" />
                مسح الكل
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Notifications List Card Grid */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">لا توجد تنبيهات مطابقة</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              جميع المواعيد والمراحل والمهام تسير وفق الجداول المحددة دون تأخير، أو تم قراءة جميع التنبيهات.
            </p>
            <button
              onClick={handleManualScan}
              className="mt-4 px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 rounded-xl transition-all"
            >
              تشغيل فحص يدوي الآن
            </button>
          </div>
        ) : (
          filteredNotifications.map(ntf => {
            const isCritical = ntf.priority === 'critical';
            const isHigh = ntf.priority === 'high';
            const deadlineInfo = ntf.daysRemaining !== undefined ? getDeadlineBadge(ntf.daysRemaining) : null;

            return (
              <div
                key={ntf.id}
                className={`relative bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                  !ntf.read 
                    ? (isCritical 
                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20 shadow-xs' 
                        : isHigh 
                          ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20' 
                          : 'border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30')
                    : 'border-slate-200 dark:border-slate-800 opacity-90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  
                  {/* Icon & Details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    
                    {/* Priority / Type Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' 
                        : isHigh 
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' 
                          : ntf.type === 'phase' 
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400' 
                            : ntf.type === 'whatsapp' 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {isCritical ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : ntf.type === 'phase' ? (
                        <Layers className="w-5 h-5" />
                      ) : ntf.type === 'whatsapp' ? (
                        <MessageSquare className="w-5 h-5" />
                      ) : ntf.type === 'cost' ? (
                        <DollarSign className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        
                        <h4 className={`text-sm font-bold truncate ${!ntf.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {ntf.title}
                        </h4>

                        {/* Priority Badge */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          isCritical 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800' 
                            : isHigh 
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' 
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {isCritical ? 'حرج' : isHigh ? 'مرتفع' : 'عادي'}
                        </span>

                        {/* Deadline Remaining Badge */}
                        {deadlineInfo && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${deadlineInfo.bg} ${deadlineInfo.color}`}>
                            {deadlineInfo.text}
                          </span>
                        )}

                        {!ntf.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {ntf.message}
                      </p>

                      {/* Meta Context Badges */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        {ntf.projectName && (
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Building2 className="w-3 h-3" />
                            {ntf.projectName}
                          </span>
                        )}

                        {ntf.phaseName && (
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Layers className="w-3 h-3" />
                            {ntf.phaseName}
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ntf.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} - {new Date(ntf.createdAt).toLocaleDateString('ar-SA')}
                        </span>

                        {ntf.targetDate && (
                          <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                            <Calendar className="w-3 h-3" />
                            تاريخ الاستحقاق: {ntf.targetDate}
                          </span>
                        )}

                        {ntf.snoozedUntil && (
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-sm">
                            مؤجل حتى {new Date(ntf.snoozedUntil).toLocaleDateString('ar-SA')}
                          </span>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Action Buttons Right/End */}
                  <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    
                    {/* Primary Jump Action */}
                    <button
                      onClick={() => handleNavigateToEntity(ntf)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all shadow-2xs"
                    >
                      <span>الانتقال للموقع</span>
                      <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                    </button>

                    <div className="flex items-center gap-1">
                      
                      {/* WhatsApp Share */}
                      <button
                        onClick={() => handleSendWhatsAppShare(ntf)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                        title="إرسال التنبيه عبر واتساب"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      {/* Snooze Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setSnoozeMenuOpenId(snoozeMenuOpenId === ntf.id ? null : ntf.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          title="تأجيل التذكير"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        {snoozeMenuOpenId === ntf.id && (
                          <div className="absolute left-0 mt-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1 z-20 text-xs text-slate-700 dark:text-slate-200">
                            <div className="px-2 py-1 text-[10px] text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                              تأجيل التنبيه
                            </div>
                            <button
                              onClick={() => { snoozeNotification(ntf.id, 1); setSnoozeMenuOpenId(null); }}
                              className="w-full text-right px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                              + يوم واحد
                            </button>
                            <button
                              onClick={() => { snoozeNotification(ntf.id, 3); setSnoozeMenuOpenId(null); }}
                              className="w-full text-right px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                              + 3 أيام
                            </button>
                            <button
                              onClick={() => { snoozeNotification(ntf.id, 7); setSnoozeMenuOpenId(null); }}
                              className="w-full text-right px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                              + أسبوع كامل
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Toggle Read */}
                      <button
                        onClick={() => markNotificationAsRead(ntf.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          ntf.read 
                            ? 'text-slate-400 hover:text-slate-600' 
                            : 'text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        }`}
                        title={ntf.read ? 'مقروء' : 'تحديد كمقروء'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteNotification(ntf.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="حذف التنبيه"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Settings & Rules Config Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">إعدادات وقواعد التنبيهات الدورية</h3>
                  <p className="text-xs text-slate-500">تخصيص فترات المسح، قنوات الإشعار، والنغمات الصوتية</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Engine Options */}
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">المسح الدوري التلقائي (Background Scanner)</h4>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertSettings.enablePeriodicScanning}
                      onChange={e => updateAlertSettings({ enablePeriodicScanning: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>تفعيل المسح الدوري الآلي للمشاريع والمراحل</span>
                  </label>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">تكرار الفحص:</span>
                    <select
                      value={alertSettings.scanIntervalMinutes}
                      onChange={e => updateAlertSettings({ scanIntervalMinutes: Number(e.target.value) })}
                      className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    >
                      <option value={5}>كل 5 دقائق</option>
                      <option value={15}>كل 15 دقيقة</option>
                      <option value={30}>كل 30 دقيقة</option>
                      <option value={60}>كل ساعة</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertSettings.criticalSoundAlerts}
                      onChange={e => updateAlertSettings({ criticalSoundAlerts: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>تنبيه صوتي مميز عند رصد مواعيد حرجة (Chime Tone)</span>
                  </label>

                  <button
                    onClick={() => playAlertChime('critical')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>تجربة النغمة</span>
                  </button>
                </div>

              </div>

              {/* Rules List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">قواعد التنبيه النشطة</h4>
                
                {alertSettings.rules.map(rule => (
                  <div 
                    key={rule.id}
                    className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span>{rule.name}</span>
                        {rule.leadDays > 0 && (
                          <span className="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded-md">
                            قبل {rule.leadDays} أيام
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        القناة: داخل التطبيق {rule.whatsappNotification ? '+ واتساب' : ''} | الجمهور: {rule.targetAudience === 'all' ? 'جميع الفريق' : rule.targetAudience}
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={rule.enabled} 
                        onChange={e => updateAlertRule(rule.id, { enabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                ))}
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all"
              >
                حفظ الإعدادات
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Create Custom Reminder Modal */}
      {showCreateReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" />
                إنشاء تذكير موعد مخصص
              </h3>
              <button onClick={() => setShowCreateReminderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomReminder} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">عنوان التنبيه *</label>
                <input
                  type="text"
                  required
                  value={newReminderTitle}
                  onChange={e => setNewReminderTitle(e.target.value)}
                  placeholder="مثال: موعد تسليم اعتماد واجهات الحجر الطبيعي"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">المشروع المعماري</label>
                  <select
                    value={newReminderProjectId}
                    onChange={e => setNewReminderProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">المرحلة المرتبطة (اختياري)</label>
                  <select
                    value={newReminderPhaseId}
                    onChange={e => setNewReminderPhaseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="">بدون مرحلة محددة</option>
                    {phases.filter(ph => ph.projectId === newReminderProjectId).map(ph => (
                      <option key={ph.id} value={ph.id}>{ph.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">تاريخ الموعد النهائي (Deadline)</label>
                  <input
                    type="date"
                    required
                    value={newReminderDueDate}
                    onChange={e => setNewReminderDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">الأولوية</label>
                  <select
                    value={newReminderPriority}
                    onChange={e => setNewReminderPriority(e.target.value as 'normal' | 'high' | 'critical')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="critical">🚨 حرج (Critical)</option>
                    <option value="high">⚠️ عاجل (High)</option>
                    <option value="normal">ℹ️ عادي (Normal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">تفاصيل وملاحظات التذكير</label>
                <textarea
                  rows={2}
                  value={newReminderMessage}
                  onChange={e => setNewReminderMessage(e.target.value)}
                  placeholder="اكتب التوجيهات أو الملاحظات الواجب مراعاتها مع المقاول أو الاستشاري..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateReminderModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all"
                >
                  إنشاء التذكير
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
