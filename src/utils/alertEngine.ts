import { 
  Project, 
  ProjectPhase, 
  Task, 
  CostItem, 
  NotificationItem, 
  PeriodicAlertSettings, 
  AlertRule 
} from '../types';

export const defaultAlertRules: AlertRule[] = [
  {
    id: 'RULE-01',
    name: 'تنبيه المواعيد النهائية الحرجة للمشاريع (قبل 7 و 3 أيام)',
    category: 'deadline',
    enabled: true,
    frequency: 'immediate',
    leadDays: 7,
    targetAudience: 'all',
    soundEnabled: true,
    whatsappNotification: true
  },
  {
    id: 'RULE-02',
    name: 'تنبيه انتهاء وتأخر المراحل المعمارية والإنشائية',
    category: 'phase_update',
    enabled: true,
    frequency: 'immediate',
    leadDays: 5,
    targetAudience: 'all',
    soundEnabled: true,
    whatsappNotification: true
  },
  {
    id: 'RULE-03',
    name: 'متابعة المهام العاجلة والمتأخرة في الموقع',
    category: 'task_alert',
    enabled: true,
    frequency: 'immediate',
    leadDays: 2,
    targetAudience: 'engineers',
    soundEnabled: false,
    whatsappNotification: true
  },
  {
    id: 'RULE-04',
    name: 'تجاوزات الميزانية ونسب الصرف المالي (> 90%)',
    category: 'budget_alert',
    enabled: true,
    frequency: 'immediate',
    leadDays: 0,
    targetAudience: 'owner',
    soundEnabled: true,
    whatsappNotification: false
  },
  {
    id: 'RULE-05',
    name: 'التقرير الصباحي اليومي لسلامة المواعيد (08:30 صباحاً)',
    category: 'periodic_brief',
    enabled: true,
    frequency: 'daily',
    leadDays: 0,
    targetAudience: 'all',
    soundEnabled: false,
    whatsappNotification: true
  }
];

export const defaultPeriodicAlertSettings: PeriodicAlertSettings = {
  enablePeriodicScanning: true,
  scanIntervalMinutes: 15,
  dailyBriefingTime: '08:30',
  enableDailyBriefing: true,
  enableWeeklySummary: true,
  notifyBeforeDays: [7, 3, 1, 0],
  criticalSoundAlerts: true,
  autoSnoozeDays: 2,
  rules: defaultAlertRules
};

/**
 * Calculates days remaining between today and target date.
 * Returns negative numbers for overdue dates.
 */
export function calculateDaysRemaining(targetDateStr?: string): number {
  if (!targetDateStr) return 999;
  const now = new Date();
  // Strip time part for pure day calculation
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(targetDateStr);
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  
  const diffTime = targetDay.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats a localized human badge for days remaining
 */
export function getDeadlineBadge(daysRemaining: number): { text: string; color: string; bg: string; isOverdue: boolean } {
  if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    return {
      text: `متأخر ${overdueDays} ${overdueDays === 1 ? 'يوم' : 'أيام'}`,
      color: 'text-rose-700 dark:text-rose-300',
      bg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
      isOverdue: true
    };
  }
  if (daysRemaining === 0) {
    return {
      text: 'ينتهي اليوم!',
      color: 'text-red-700 dark:text-red-300 font-bold animate-pulse',
      bg: 'bg-red-100 dark:bg-red-950/70 border-red-300 dark:border-red-800',
      isOverdue: false
    };
  }
  if (daysRemaining === 1) {
    return {
      text: 'متبقي يوم واحد',
      color: 'text-amber-700 dark:text-amber-300 font-semibold',
      bg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      isOverdue: false
    };
  }
  if (daysRemaining <= 3) {
    return {
      text: `متبقي ${daysRemaining} أيام`,
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
      isOverdue: false
    };
  }
  if (daysRemaining <= 7) {
    return {
      text: `متبقي ${daysRemaining} أيام`,
      color: 'text-indigo-700 dark:text-indigo-300',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800',
      isOverdue: false
    };
  }
  return {
    text: `متبقي ${daysRemaining} يوم`,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    isOverdue: false
  };
}

/**
 * Plays a pleasant architectural notification chime using Web Audio API
 */
export function playAlertChime(priority: 'critical' | 'high' | 'normal' | 'low' = 'normal') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (priority === 'critical') {
      // Two-tone warning beep
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Soft modern chime (F# -> A)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch {
    // Audio context may be restricted by browser gesture policies
  }
}

/**
 * Core engine scanner:
 * Checks projects, phases, tasks, and budgets for deadlines and phase transitions,
 * generating fresh, actionable notifications.
 */
export function scanDeadlinesAndPhaseUpdates(
  projects: Project[],
  phases: ProjectPhase[],
  tasks: Task[],
  costs: CostItem[],
  settings: PeriodicAlertSettings,
  existingNotifications: NotificationItem[],
  userId: string = 'usr-azab-01'
): { newNotifications: NotificationItem[]; criticalCount: number } {
  const generated: NotificationItem[] = [];
  const nowStr = new Date().toISOString();

  // Helper to check if an alert with identical action/entity already exists within the last 24h
  const isDuplicate = (targetKey: string) => {
    return existingNotifications.some(n => {
      const isSameAction = (n.taskId && n.taskId === targetKey) ||
                           (n.phaseId && n.phaseId === targetKey) ||
                           (n.projectId && n.projectId === targetKey && n.category === 'deadline');
      if (!isSameAction) return false;
      // If created in the last 20 hours, treat as already notified
      const ageHours = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 60 * 60);
      return ageHours < 20;
    });
  };

  // 1. Scan Phase Deadlines & Stage Status
  phases.forEach(phase => {
    if (phase.status === 'completed') return;
    const days = calculateDaysRemaining(phase.endDate);
    const prj = projects.find(p => p.id === phase.projectId);

    // Overdue Phase
    if (days < 0 && !isDuplicate(phase.id)) {
      generated.push({
        id: `NTF-PHS-OVD-${phase.id}-${Date.now()}`,
        userId,
        type: 'phase',
        category: 'phase_update',
        title: `تأخر موعد إنجاز المرحلة: ${phase.name}`,
        message: `المرحلة "${phase.name}" بمشروع "${prj?.name || ''}" تجاوزت موعد التسليم المحدد (${phase.endDate}) بنسبة إنجاز ${phase.progress}%. يتطلب الأمر مراجعة جدول التنفيذ.`,
        priority: 'critical',
        read: false,
        createdAt: nowStr,
        projectId: phase.projectId,
        projectName: prj?.name,
        phaseId: phase.id,
        phaseName: phase.name,
        targetDate: phase.endDate,
        daysRemaining: days
      });
    } 
    // Approaching Phase Deadline (within 7 days)
    else if (days >= 0 && days <= 7 && !isDuplicate(phase.id)) {
      const isCritical = days <= 2;
      generated.push({
        id: `NTF-PHS-APPR-${phase.id}-${Date.now()}`,
        userId,
        type: 'phase',
        category: 'phase_update',
        title: `اقتراب الموعد النهائي لمرحلة: ${phase.name}`,
        message: `متبقي ${days === 0 ? 'اليوم فقط' : `${days} أيام`} على موعد إنهاء مرحلة "${phase.name}" (تاريخ ${phase.endDate}) والإنجاز الحالي ${phase.progress}%.`,
        priority: isCritical ? 'critical' : 'high',
        read: false,
        createdAt: nowStr,
        projectId: phase.projectId,
        projectName: prj?.name,
        phaseId: phase.id,
        phaseName: phase.name,
        targetDate: phase.endDate,
        daysRemaining: days
      });
    }
  });

  // 2. Scan Task Deadlines & Critical Site Operations
  tasks.forEach(task => {
    if (task.status === 'done') return;
    const days = calculateDaysRemaining(task.dueDate);
    const prj = projects.find(p => p.id === task.projectId);

    // Overdue Task
    if (days < 0 && !isDuplicate(task.id)) {
      generated.push({
        id: `NTF-TSK-OVD-${task.id}-${Date.now()}`,
        userId,
        type: 'task',
        category: 'deadline',
        title: `مهمة متأخرة: ${task.title}`,
        message: `المهمة "${task.title}" المسندة إلى (${task.assignedToName}) متأخرة عن موعدها المحدد ${task.dueDate}. الأولوية: ${task.priority === 'critical' ? 'حرجة جداً' : 'عالية'}.`,
        priority: task.priority === 'critical' ? 'critical' : 'high',
        read: false,
        createdAt: nowStr,
        projectId: task.projectId,
        projectName: prj?.name,
        phaseId: task.phaseId,
        phaseName: task.phaseName,
        taskId: task.id,
        taskTitle: task.title,
        targetDate: task.dueDate,
        daysRemaining: days
      });
    }
    // Task Due in 1 to 3 days
    else if (days >= 0 && days <= 3 && !isDuplicate(task.id)) {
      generated.push({
        id: `NTF-TSK-DUE-${task.id}-${Date.now()}`,
        userId,
        type: 'task',
        category: 'deadline',
        title: `تذكير بموعد تسليم مهمة: ${task.title}`,
        message: `تستحق المهمة "${task.title}" خلال ${days === 0 ? 'اليوم' : `${days} أيام`} (${task.dueDate}) المسؤولة بواسطة ${task.assignedToName}.`,
        priority: days <= 1 ? 'high' : 'normal',
        read: false,
        createdAt: nowStr,
        projectId: task.projectId,
        projectName: prj?.name,
        phaseId: task.phaseId,
        phaseName: task.phaseName,
        taskId: task.id,
        taskTitle: task.title,
        targetDate: task.dueDate,
        daysRemaining: days
      });
    }
  });

  // 3. Scan Project Overall Completion Deadlines (within 30 days or overdue)
  projects.forEach(project => {
    if (project.status === 'completed') return;
    const days = calculateDaysRemaining(project.endDate);

    if (days < 0 && !isDuplicate(project.id)) {
      generated.push({
        id: `NTF-PRJ-OVD-${project.id}-${Date.now()}`,
        userId,
        type: 'project',
        category: 'deadline',
        title: `تجاوز الموعد التعاقدي النهائي: ${project.name}`,
        message: `المشروع تجاوز تاريخ التسليم المتفق عليه (${project.endDate}) مع العميل (${project.clientName}). الإنجاز الحالي: ${project.progress}%.`,
        priority: 'critical',
        read: false,
        createdAt: nowStr,
        projectId: project.id,
        projectName: project.name,
        targetDate: project.endDate,
        daysRemaining: days
      });
    } else if (days > 0 && days <= 14 && !isDuplicate(project.id)) {
      generated.push({
        id: `NTF-PRJ-APPR-${project.id}-${Date.now()}`,
        userId,
        type: 'project',
        category: 'deadline',
        title: `اقتراب موعد التسليم النهائي للمشروع: ${project.name}`,
        message: `متبقي ${days} يوماً على الموعد النهائي لتسليم المشروع (${project.endDate}). نسبة الإنجاز: ${project.progress}%.`,
        priority: 'high',
        read: false,
        createdAt: nowStr,
        projectId: project.id,
        projectName: project.name,
        targetDate: project.endDate,
        daysRemaining: days
      });
    }
  });

  // 4. Scan Phase Budget Limits (> 95% consumed)
  phases.forEach(phase => {
    if (phase.budget > 0 && phase.actualCost >= phase.budget * 0.95) {
      const overKey = `BUDGET-${phase.id}`;
      if (!isDuplicate(overKey)) {
        const prj = projects.find(p => p.id === phase.projectId);
        const pct = Math.round((phase.actualCost / phase.budget) * 100);
        generated.push({
          id: `NTF-BUD-${phase.id}-${Date.now()}`,
          userId,
          type: 'cost',
          category: 'budget_alert',
          title: `تنبيه مالي: تجاوز ميزانية مرحلة ${phase.name}`,
          message: `المرحلة استهلكت ${pct}% من ميزانيتها المخصصة (${phase.actualCost.toLocaleString()} من أصل ${phase.budget.toLocaleString()} ر.س) بمشروع ${prj?.name || ''}.`,
          priority: pct > 100 ? 'critical' : 'high',
          read: false,
          createdAt: nowStr,
          projectId: phase.projectId,
          projectName: prj?.name,
          phaseId: phase.id,
          phaseName: phase.name
        });
      }
    }
  });

  const criticalCount = generated.filter(n => n.priority === 'critical').length;
  return { newNotifications: generated, criticalCount };
}
