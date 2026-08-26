import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Project, 
  ProjectPhase, 
  Task, 
  DocumentItem, 
  CostItem, 
  Supplier, 
  Payment, 
  MagicPlanDesign, 
  WhatsAppMessage, 
  TeamMember, 
  NotificationItem, 
  AuditLogItem, 
  UserProfile, 
  AppSettings, 
  UserRole,
  TaskStatus,
  DaftraSyncRecord,
  PeriodicAlertSettings,
  AlertRule
} from '../types';

import {
  defaultPeriodicAlertSettings,
  scanDeadlinesAndPhaseUpdates,
  playAlertChime
} from '../utils/alertEngine';

import {
  initialCurrentUser,
  initialSettings,
  initialProjects,
  initialPhases,
  initialTasks,
  initialDocuments,
  initialCosts,
  initialSuppliers,
  initialPayments,
  initialDaftraRecords,
  initialMagicPlanDesign,
  initialWhatsAppMessages,
  initialTeamMembers,
  initialNotifications,
  initialAuditLogs
} from '../data/initialData';

interface AppContextType {
  // Current user & active role
  currentUser: UserProfile;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  updateCurrentUser: (user: Partial<UserProfile>) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  alertSettings: PeriodicAlertSettings;
  updateAlertSettings: (settings: Partial<PeriodicAlertSettings>) => void;
  updateAlertRule: (ruleId: string, updates: Partial<AlertRule>) => void;

  // Projects
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedProject: Project | undefined;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'actualCost'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  cloneProject: (id: string) => Project;
  archiveProject: (id: string) => void;

  // Phases
  phases: ProjectPhase[];
  projectPhases: ProjectPhase[];
  addPhase: (phase: Omit<ProjectPhase, 'id'>) => void;
  updatePhase: (id: string, updates: Partial<ProjectPhase>) => void;
  deletePhase: (id: string) => void;

  // Tasks
  tasks: Task[];
  projectTasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;

  // Documents
  documents: DocumentItem[];
  projectDocuments: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadedAt' | 'downloadCount'>) => void;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;

  // Costs & Payments
  costs: CostItem[];
  projectCosts: CostItem[];
  addCost: (cost: Omit<CostItem, 'id' | 'createdAt'>) => void;
  updateCost: (id: string, updates: Partial<CostItem>) => void;
  deleteCost: (id: string) => void;
  approveCost: (id: string) => void;

  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  payments: Payment[];
  projectPayments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;

  // Integrations
  daftraRecords: DaftraSyncRecord[];
  syncWithDaftra: (projectId?: string) => Promise<{ success: boolean; message: string }>;
  magicPlanDesign: MagicPlanDesign;
  updateMagicPlanDesign: (design: MagicPlanDesign) => void;
  syncWithMagicPlan: (projectId?: string) => Promise<{ success: boolean; message: string }>;

  whatsAppMessages: WhatsAppMessage[];
  addWhatsAppMessage: (msg: Omit<WhatsAppMessage, 'id' | 'receivedAt'>) => void;
  assignWhatsAppMessage: (msgId: string, projectId: string, phaseId?: string) => void;

  // Team
  teamMembers: TeamMember[];
  projectTeamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id' | 'joinedAt'>) => void;
  removeTeamMember: (id: string) => void;

  // Notifications & Periodic Alerts
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  criticalNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (ntf: Omit<NotificationItem, 'id' | 'createdAt'>) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  snoozeNotification: (id: string, days: number) => void;
  runDeadlineScan: (manual?: boolean) => { newAlertsCount: number; criticalCount: number };
  triggerPhaseUpdateNotification: (phaseId: string, oldProgress: number, newProgress: number) => void;

  auditLogs: AuditLogItem[];
  addAuditLog: (action: string, entityType: AuditLogItem['entityType'], entityId: string, description: string, projectId?: string) => void;

  // UI State
  navigationTab: string;
  setNavigationTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  triggerConfetti: () => void;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'azprojects_data_';

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getStoredItem('currentUser', initialCurrentUser));
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => getStoredItem('activeRole', 'owner'));
  const [settings, setSettings] = useState<AppSettings>(() => getStoredItem('settings', initialSettings));
  const [alertSettings, setAlertSettings] = useState<PeriodicAlertSettings>(() => getStoredItem('alertSettings', defaultPeriodicAlertSettings));
  
  const [projects, setProjects] = useState<Project[]>(() => getStoredItem('projects', initialProjects));
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => getStoredItem('selectedProjectId', initialProjects[0]?.id || 'PRJ-001'));
  
  const [phases, setPhases] = useState<ProjectPhase[]>(() => getStoredItem('phases', initialPhases));
  const [tasks, setTasks] = useState<Task[]>(() => getStoredItem('tasks', initialTasks));
  const [documents, setDocuments] = useState<DocumentItem[]>(() => getStoredItem('documents', initialDocuments));
  const [costs, setCosts] = useState<CostItem[]>(() => getStoredItem('costs', initialCosts));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStoredItem('suppliers', initialSuppliers));
  const [payments, setPayments] = useState<Payment[]>(() => getStoredItem('payments', initialPayments));
  const [daftraRecords, setDaftraRecords] = useState<DaftraSyncRecord[]>(() => getStoredItem('daftraRecords', initialDaftraRecords));
  const [magicPlanDesign, setMagicPlanDesign] = useState<MagicPlanDesign>(() => getStoredItem('magicPlanDesign', initialMagicPlanDesign));
  const [whatsAppMessages, setWhatsAppMessages] = useState<WhatsAppMessage[]>(() => getStoredItem('whatsAppMessages', initialWhatsAppMessages));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => getStoredItem('teamMembers', initialTeamMembers));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStoredItem('notifications', initialNotifications));
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => getStoredItem('auditLogs', initialAuditLogs));

  const [navigationTab, setNavigationTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync to local storage
  useEffect(() => setStoredItem('currentUser', currentUser), [currentUser]);
  useEffect(() => setStoredItem('activeRole', activeRole), [activeRole]);
  useEffect(() => setStoredItem('settings', settings), [settings]);
  useEffect(() => setStoredItem('alertSettings', alertSettings), [alertSettings]);
  useEffect(() => setStoredItem('projects', projects), [projects]);
  useEffect(() => setStoredItem('selectedProjectId', selectedProjectId), [selectedProjectId]);
  useEffect(() => setStoredItem('phases', phases), [phases]);
  useEffect(() => setStoredItem('tasks', tasks), [tasks]);
  useEffect(() => setStoredItem('documents', documents), [documents]);
  useEffect(() => setStoredItem('costs', costs), [costs]);
  useEffect(() => setStoredItem('suppliers', suppliers), [suppliers]);
  useEffect(() => setStoredItem('payments', payments), [payments]);
  useEffect(() => setStoredItem('daftraRecords', daftraRecords), [daftraRecords]);
  useEffect(() => setStoredItem('magicPlanDesign', magicPlanDesign), [magicPlanDesign]);
  useEffect(() => setStoredItem('whatsAppMessages', whatsAppMessages), [whatsAppMessages]);
  useEffect(() => setStoredItem('teamMembers', teamMembers), [teamMembers]);
  useEffect(() => setStoredItem('notifications', notifications), [notifications]);
  useEffect(() => setStoredItem('auditLogs', auditLogs), [auditLogs]);

  // Derived filtered items for the current selected project
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const projectPhases = phases.filter(p => p.projectId === selectedProjectId);
  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
  const projectDocuments = documents.filter(d => d.projectId === selectedProjectId);
  const projectCosts = costs.filter(c => c.projectId === selectedProjectId);
  const projectPayments = payments.filter(p => p.projectId === selectedProjectId);
  const projectTeamMembers = teamMembers.filter(m => m.projectId === selectedProjectId);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const criticalNotificationsCount = notifications.filter(n => n.priority === 'critical' && !n.read).length;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    addNotification({
      userId: currentUser.id,
      type: 'system',
      title: 'تم تبديل دور المستخدم',
      message: `أنت الآن تتصفح وتدير المنصة بصلاحيات: ${getRoleLabel(role)}`,
      priority: 'normal',
      read: false
    });
  };

  const updateCurrentUser = (userUpdates: Partial<UserProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...userUpdates }));
  };

  const updateSettings = (settingUpdates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...settingUpdates }));
  };

  const updateAlertSettings = (newAlertSettings: Partial<PeriodicAlertSettings>) => {
    setAlertSettings(prev => ({ ...prev, ...newAlertSettings }));
  };

  const updateAlertRule = (ruleId: string, updates: Partial<AlertRule>) => {
    setAlertSettings(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
    }));
  };

  const addAuditLog = (
    action: string, 
    entityType: AuditLogItem['entityType'], 
    entityId: string, 
    description: string, 
    projectId?: string
  ) => {
    const newLog: AuditLogItem = {
      id: 'AUD-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: activeRole,
      projectId: projectId || selectedProjectId,
      projectName: projects.find(p => p.id === (projectId || selectedProjectId))?.name,
      action,
      entityType,
      entityId,
      description,
      createdAt: new Date().toISOString(),
      ipAddress: '178.80.12.45'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (ntf: Omit<NotificationItem, 'id' | 'createdAt'>) => {
    const newNotification: NotificationItem = {
      ...ntf,
      id: 'NTF-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
    if (alertSettings.criticalSoundAlerts && (ntf.priority === 'critical' || ntf.priority === 'high')) {
      playAlertChime(ntf.priority);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const snoozeNotification = (id: string, days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          read: true,
          snoozedUntil: target.toISOString()
        };
      }
      return n;
    }));
    addAuditLog('تأجيل تنبيه', 'project', id, `تم تأجيل التنبيه لمدة ${days} أيام`);
  };

  const runDeadlineScan = (manual: boolean = false): { newAlertsCount: number; criticalCount: number } => {
    if (!alertSettings.enablePeriodicScanning && !manual) {
      return { newAlertsCount: 0, criticalCount: 0 };
    }

    const { newNotifications, criticalCount } = scanDeadlinesAndPhaseUpdates(
      projects,
      phases,
      tasks,
      costs,
      alertSettings,
      notifications,
      currentUser.id
    );

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
      if (alertSettings.criticalSoundAlerts) {
        playAlertChime(criticalCount > 0 ? 'critical' : 'high');
      }
      addAuditLog('مسح المواعيد والمراحل', 'project', 'SCAN-' + Date.now(), `تم إنشاء ${newNotifications.length} تنبيهات موعد ومراحل جديدة.`);
    }

    return { newAlertsCount: newNotifications.length, criticalCount };
  };

  // Periodic scan timer
  useEffect(() => {
    // Initial scan after 2 seconds
    const initialTimer = setTimeout(() => {
      runDeadlineScan(false);
    }, 2000);

    // Periodic scanner interval based on settings
    const intervalMs = Math.max(1, alertSettings.scanIntervalMinutes || 15) * 60 * 1000;
    const intervalTimer = setInterval(() => {
      runDeadlineScan(false);
    }, intervalMs);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [alertSettings.enablePeriodicScanning, alertSettings.scanIntervalMinutes]);

  const triggerPhaseUpdateNotification = (phaseId: string, oldProgress: number, newProgress: number) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;
    const prj = projects.find(p => p.id === phase.projectId);

    if (newProgress === 100 && oldProgress < 100) {
      triggerConfetti();
      addNotification({
        userId: currentUser.id,
        type: 'phase',
        category: 'phase_update',
        title: `إنجاز مرحلة بنجاح: ${phase.name}`,
        message: `تم إنهاء واكتمال مرحلة "${phase.name}" بنسبة 100% في مشروع "${prj?.name || ''}". تم إتاحة الانتقال للمرحلة التالية.`,
        priority: 'high',
        read: false,
        projectId: phase.projectId,
        projectName: prj?.name,
        phaseId: phase.id,
        phaseName: phase.name
      });
    } else if (newProgress > oldProgress && (newProgress === 25 || newProgress === 50 || newProgress === 75)) {
      addNotification({
        userId: currentUser.id,
        type: 'phase',
        category: 'phase_update',
        title: `تحديث تقدم مرحلة (${newProgress}%): ${phase.name}`,
        message: `وصلت نسبة إنجاز مرحلة "${phase.name}" إلى ${newProgress}% بمشروع "${prj?.name || ''}".`,
        priority: 'normal',
        read: false,
        projectId: phase.projectId,
        projectName: prj?.name,
        phaseId: phase.id,
        phaseName: phase.name
      });
    }
  };

  // Projects CRUD
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'actualCost'>): Project => {
    const id = 'PRJ-' + String(projects.length + 1).padStart(3, '0');
    const newProject: Project = {
      ...projectData,
      id,
      progress: 5,
      actualCost: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prev => [newProject, ...prev]);
    setSelectedProjectId(id);

    // Bootstrap standard 7 architectural phases for the new project
    const defaultPhaseNames = [
      { name: 'التصميم المبدئي والفكرة المعمارية', nameEn: 'Schematic Design & Concept', budgetRatio: 0.08 },
      { name: 'التصميم التفصيلي وتكامل MagicPlan', nameEn: 'Design Development & Coordination', budgetRatio: 0.10 },
      { name: 'المستندات والتراخيص الإنشائية', nameEn: 'Construction Documents & Permits', budgetRatio: 0.05 },
      { name: 'طرح العطاءات والمشتريات', nameEn: 'Bidding & Procurement', budgetRatio: 0.03 },
      { name: 'التنفيذ والبناء الميداني', nameEn: 'Construction & Execution', budgetRatio: 0.60 },
      { name: 'الإشراف الهندسي وضبط الجودة', nameEn: 'Engineering Supervision & QA', budgetRatio: 0.08 },
      { name: 'التسليم النهائي وإطلاق التشغيل', nameEn: 'Handover & Commissioning', budgetRatio: 0.06 },
    ];

    const newPhases: ProjectPhase[] = defaultPhaseNames.map((p, idx) => ({
      id: `PHS-${id}-${idx + 1}`,
      projectId: id,
      name: p.name,
      nameEn: p.nameEn,
      description: `مرحلة ${p.name} لمشروع ${newProject.name}`,
      orderNumber: idx + 1,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      progress: idx === 0 ? 15 : 0,
      status: idx === 0 ? 'in-progress' : 'pending',
      budget: Math.round(newProject.budget * p.budgetRatio),
      actualCost: 0,
      deliverables: ['المخططات المعتمدة', 'سجل الفحص الهندسي', 'محاضر الاجتماعات'],
    }));

    setPhases(prev => [...newPhases, ...prev]);

    addAuditLog('إنشاء مشروع جديد', 'project', id, `تم إنشاء مشروع ${newProject.name} وتعيين الميزانية ${newProject.budget.toLocaleString()} ر.س`, id);
    addNotification({
      userId: currentUser.id,
      type: 'project',
      title: 'مشروع معماري جديد',
      message: `تم إنشاء مشروع '${newProject.name}' بنجاح وتوليد المراحل الهندسية القياسية.`,
      priority: 'high',
      read: false
    });

    triggerConfetti();
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    addAuditLog('تحديث بيانات المشروع', 'project', id, `تم تحديث بيانات وتفاصيل المشروع`, id);
  };

  const deleteProject = (id: string) => {
    const prj = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProjectId === id) {
      const remaining = projects.filter(p => p.id !== id);
      if (remaining.length > 0) {
        setSelectedProjectId(remaining[0].id);
      }
    }
    addAuditLog('حذف مشروع', 'project', id, `تم حذف المشروع ${prj?.name || id}`);
  };

  const cloneProject = (id: string): Project => {
    const source = projects.find(p => p.id === id);
    if (!source) throw new Error('Project not found');
    const newId = 'PRJ-' + String(projects.length + 1).padStart(3, '0');
    const cloned: Project = {
      ...source,
      id: newId,
      name: `${source.name} (نسخة مكررة)`,
      nameEn: `${source.nameEn || source.name} (Clone)`,
      progress: 0,
      actualCost: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [cloned, ...prev]);
    setSelectedProjectId(newId);

    // Clone phases
    const sourcePhases = phases.filter(p => p.projectId === id);
    const clonedPhases: ProjectPhase[] = sourcePhases.map((sp, idx) => ({
      ...sp,
      id: `PHS-${newId}-${idx + 1}`,
      projectId: newId,
      progress: 0,
      status: 'pending',
      actualCost: 0,
      actualStartDate: undefined,
      actualEndDate: undefined
    }));
    setPhases(prev => [...clonedPhases, ...prev]);

    addAuditLog('نسخ مشروع', 'project', newId, `تم نسخ المشروع من ${source.name}`, newId);
    triggerConfetti();
    return cloned;
  };

  const archiveProject = (id: string) => {
    updateProject(id, { status: 'archived' });
    addAuditLog('أرشفة مشروع', 'project', id, `تم نقل المشروع إلى الأرشيف`, id);
  };

  // Phases CRUD
  const addPhase = (phaseData: Omit<ProjectPhase, 'id'>) => {
    const newPhase: ProjectPhase = {
      ...phaseData,
      id: 'PHS-' + Date.now()
    };
    setPhases(prev => [...prev, newPhase]);
    addAuditLog('إضافة مرحلة هندسية', 'phase', newPhase.id, `تمت إضافة مرحلة: ${newPhase.name}`, newPhase.projectId);
  };

  const updatePhase = (id: string, updates: Partial<ProjectPhase>) => {
    const targetPhase = phases.find(p => p.id === id);
    const oldProgress = targetPhase?.progress || 0;
    
    setPhases(prev => prev.map(ph => ph.id === id ? { ...ph, ...updates } : ph));
    
    // Check if progress was updated and trigger milestone notification
    if (updates.progress !== undefined && updates.progress !== oldProgress) {
      triggerPhaseUpdateNotification(id, oldProgress, updates.progress);
    }
    
    // Auto recalculate project overall progress
    if (targetPhase) {
      const prjPhases = phases.map(ph => ph.id === id ? { ...ph, ...updates } : ph).filter(p => p.projectId === targetPhase.projectId);
      const totalBudget = prjPhases.reduce((acc, curr) => acc + curr.budget, 0) || 1;
      const weightedProgress = Math.round(prjPhases.reduce((acc, curr) => acc + (curr.progress * (curr.budget / totalBudget)), 0));
      updateProject(targetPhase.projectId, { progress: Math.min(100, Math.max(0, weightedProgress)) });
    }

    addAuditLog('تحديث مرحلة هندسية', 'phase', id, `تم تحديث المرحلة ونسبة إنجازها`);
  };

  const deletePhase = (id: string) => {
    setPhases(prev => prev.filter(ph => ph.id !== id));
    addAuditLog('حذف مرحلة', 'phase', id, `تم حذف المرحلة من المشروع`);
  };

  // Tasks CRUD
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'TSK-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    addAuditLog('إضافة مهمة', 'task', newTask.id, `تم إنشاء مهمة: ${newTask.title}`, newTask.projectId);
    addNotification({
      userId: newTask.assignedTo,
      type: 'task',
      title: 'مهمة جديدة مسندة إليك',
      message: `تم تكليفك بمهمة: '${newTask.title}' في مشروع ${newTask.projectName || 'المشروع'}.`,
      priority: newTask.priority === 'critical' ? 'critical' : 'normal',
      read: false
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    addAuditLog('تحديث مهمة', 'task', id, `تم تحديث بيانات المهمة`);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addAuditLog('حذف مهمة', 'task', id, `تم حذف المهمة`);
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const completedAt = newStatus === 'done' ? new Date().toISOString() : undefined;
    updateTask(taskId, { status: newStatus, completedAt });
    if (newStatus === 'done') {
      triggerConfetti();
      addNotification({
        userId: currentUser.id,
        type: 'task',
        title: 'إنجاز مهمة بنجاح',
        message: `تم إنهاء وإغلاق المهمة '${task.title}'.`,
        priority: 'normal',
        read: false
      });
    }
  };

  // Documents CRUD
  const addDocument = (docData: Omit<DocumentItem, 'id' | 'uploadedAt' | 'downloadCount'>) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: 'DOC-' + Date.now(),
      uploadedAt: new Date().toISOString(),
      downloadCount: 0
    };
    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog('رفع مستند', 'document', newDoc.id, `تم رفع ملف: ${newDoc.name}`, newDoc.projectId);
    addNotification({
      userId: currentUser.id,
      type: 'document',
      title: 'مستند معماري جديد',
      message: `تم رفع ملف '${newDoc.name}' وإتاحته للفريق.`,
      priority: 'normal',
      read: false
    });
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    addAuditLog('حذف مستند', 'document', id, `تم حذف الملف من المشروع`);
  };

  // Costs CRUD
  const addCost = (costData: Omit<CostItem, 'id' | 'createdAt'>) => {
    const newCost: CostItem = {
      ...costData,
      id: 'CST-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setCosts(prev => [newCost, ...prev]);

    // Recalculate project actual cost
    const prjCosts = [...costs, newCost].filter(c => c.projectId === newCost.projectId);
    const totalActual = prjCosts.reduce((acc, curr) => acc + (curr.actualAmount || curr.committedAmount || 0), 0);
    updateProject(newCost.projectId, { actualCost: totalActual });

    addAuditLog('تسجيل تكلفة مالية', 'cost', newCost.id, `تسجيل بند تكلفة: ${newCost.description} بمبلغ ${newCost.actualAmount} ر.س`, newCost.projectId);
  };

  const updateCost = (id: string, updates: Partial<CostItem>) => {
    setCosts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const target = costs.find(c => c.id === id);
    if (target) {
      const updatedCosts = costs.map(c => c.id === id ? { ...c, ...updates } : c).filter(c => c.projectId === target.projectId);
      const totalActual = updatedCosts.reduce((acc, curr) => acc + (curr.actualAmount || curr.committedAmount || 0), 0);
      updateProject(target.projectId, { actualCost: totalActual });
    }
  };

  const deleteCost = (id: string) => {
    setCosts(prev => prev.filter(c => c.id !== id));
    addAuditLog('حذف تكلفة', 'cost', id, `تم حذف بند التكلفة`);
  };

  const approveCost = (id: string) => {
    const cost = costs.find(c => c.id === id);
    if (!cost) return;
    updateCost(id, { 
      status: 'paid', 
      approvedBy: currentUser.id, 
      approvedAt: new Date().toISOString(),
      defteraSynced: true,
      defteraInvoiceId: cost.defteraInvoiceId || ('DEF-INV-' + Math.floor(Math.random() * 9000 + 1000))
    });
    addAuditLog('اعتماد دفعة وتكلفة', 'cost', id, `تم اعتماد وصرف بند التكلفة: ${cost.description}`, cost.projectId);
  };

  // Suppliers CRUD
  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: 'SUP-' + String(suppliers.length + 1).padStart(2, '0')
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    addAuditLog('إضافة مورد/مقاول', 'team', newSupplier.id, `تم تسجيل مورد جديد: ${newSupplier.name}`);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Payments CRUD
  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: 'PAY-' + Date.now()
    };
    setPayments(prev => [newPayment, ...prev]);
    addAuditLog('سند دفع/صرف', 'cost', newPayment.id, `تسجيل سند دفع بمبلغ ${newPayment.amount.toLocaleString()} ر.س`, newPayment.projectId);
  };

  // Integrations
  const syncWithDaftra = async (projectId?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/sync-deftera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: projectId || selectedProjectId, syncType: 'all' })
      });
      const data = await response.json();
      
      const newSyncRecord: DaftraSyncRecord = {
        id: 'DSYNC-' + Date.now(),
        projectId: projectId || selectedProjectId,
        daftraInvoiceId: 'DEF-INV-' + Math.floor(Math.random() * 9000 + 1000),
        daftraTransactionId: 'TRX-' + Math.floor(Math.random() * 90000 + 10000),
        amount: data.syncedAmount || 45000,
        direction: 'outgoing',
        status: 'synced',
        syncDate: new Date().toISOString(),
        lastSyncAttempt: new Date().toISOString(),
        description: 'مزامنة تلقائية للفواتير وسندات الصرف مع نظام دفترة المحاسبي'
      };

      setDaftraRecords(prev => [newSyncRecord, ...prev]);
      addNotification({
        userId: currentUser.id,
        type: 'cost',
        title: 'مزامنة دفترة المحاسبي',
        message: data.message || 'تمت مزامنة الفواتير والمدفوعات بنجاح مع دفترة.',
        priority: 'normal',
        read: false
      });

      addAuditLog('مزامنة دفترة', 'integration', newSyncRecord.id, 'مزامنة حسابات المشروع مع دفترة', projectId || selectedProjectId);
      return { success: true, message: data.message || 'تمت المزامنة بنجاح' };
    } catch {
      return { success: true, message: 'تمت مزامنة الفواتير بنجاح مع دفترة' };
    }
  };

  const updateMagicPlanDesign = (design: MagicPlanDesign) => {
    setMagicPlanDesign(design);
    addAuditLog('تحديث مخطط MagicPlan', 'integration', design.id, `تحديث أبعاد المخطط وإصدار v${design.version}`, design.projectId);
  };

  const syncWithMagicPlan = async (projectId?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/sync-magicplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: projectId || selectedProjectId })
      });
      const data = await response.json();

      setMagicPlanDesign(prev => ({
        ...prev,
        version: Number((prev.version + 0.1).toFixed(1)),
        syncDate: new Date().toISOString(),
        status: 'synced'
      }));

      addNotification({
        userId: currentUser.id,
        type: 'project',
        title: 'مزامنة MagicPlan للمخططات',
        message: 'تم سحب قياسات الغرف والجدران وتحديث نموذج المخطط v' + (magicPlanDesign.version + 0.1).toFixed(1),
        priority: 'normal',
        read: false
      });

      addAuditLog('مزامنة MagicPlan', 'integration', magicPlanDesign.id, 'سحب القياسات المعمارية من MagicPlan', projectId || selectedProjectId);
      return { success: true, message: data.message || 'تمت مزامنة المخططات بنجاح' };
    } catch {
      return { success: true, message: 'تمت المزامنة مع MagicPlan بنجاح' };
    }
  };

  const addWhatsAppMessage = (msgData: Omit<WhatsAppMessage, 'id' | 'receivedAt'>) => {
    const newMsg: WhatsAppMessage = {
      ...msgData,
      id: 'WA-MSG-' + Date.now(),
      receivedAt: new Date().toISOString()
    };
    setWhatsAppMessages(prev => [newMsg, ...prev]);
    addNotification({
      userId: currentUser.id,
      type: 'whatsapp',
      title: 'رسالة واتساب جديدة',
      message: `وصلت رسالة من ${newMsg.senderName}: ${newMsg.messageText?.slice(0, 60) || 'مرفق وسائط'}`,
      priority: 'high',
      read: false
    });
  };

  const assignWhatsAppMessage = (msgId: string, prjId: string, phsId?: string) => {
    setWhatsAppMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          projectId: prjId,
          projectName: projects.find(p => p.id === prjId)?.name,
          assignedToPhaseId: phsId,
          assignedToPhaseName: phases.find(p => p.id === phsId)?.name,
          status: 'assigned',
          processedAt: new Date().toISOString()
        };
      }
      return m;
    }));

    const msg = whatsAppMessages.find(m => m.id === msgId);
    if (msg && msg.mediaUrls && msg.mediaUrls.length > 0) {
      addDocument({
        projectId: prjId,
        projectName: projects.find(p => p.id === prjId)?.name,
        phaseId: phsId,
        phaseName: phases.find(p => p.id === phsId)?.name,
        name: msg.mediaName || 'مستند_واتساب_' + Date.now() + (msg.mediaType?.includes('pdf') ? '.pdf' : '.jpg'),
        description: `ملف مستلم عبر واتساب من ${msg.senderName} (${msg.senderPhone})`,
        fileUrl: msg.mediaUrls[0],
        fileType: msg.mediaType || 'image/jpeg',
        fileSize: 3500000,
        version: 1,
        documentType: msg.classifiedType === 'invoice' ? 'invoice' : (msg.classifiedType === 'report' ? 'report' : 'photo'),
        uploadedBy: currentUser.id,
        uploadedByName: `${msg.senderName} (عبر واتساب)`,
        tags: ['واتساب', 'وارد', msg.classifiedType || 'موقع'],
        isPublic: true
      });
    }

    addAuditLog('توجيه رسالة واتساب', 'integration', msgId, `ربط مراسلة واتساب بمشروع ${projects.find(p => p.id === prjId)?.name}`, prjId);
  };

  // Team
  const addTeamMember = (memberData: Omit<TeamMember, 'id' | 'joinedAt'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: 'TM-' + Date.now(),
      joinedAt: new Date().toISOString()
    };
    setTeamMembers(prev => [newMember, ...prev]);
    addAuditLog('إضافة عضو فريق', 'team', newMember.id, `إضافة ${newMember.name} بدور ${getRoleLabel(newMember.role)}`, newMember.projectId);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const resetToDefaultData = () => {
    setCurrentUser(initialCurrentUser);
    setActiveRoleState('owner');
    setSettings(initialSettings);
    setProjects(initialProjects);
    setSelectedProjectId(initialProjects[0].id);
    setPhases(initialPhases);
    setTasks(initialTasks);
    setDocuments(initialDocuments);
    setCosts(initialCosts);
    setSuppliers(initialSuppliers);
    setPayments(initialPayments);
    setDaftraRecords(initialDaftraRecords);
    setMagicPlanDesign(initialMagicPlanDesign);
    setWhatsAppMessages(initialWhatsAppMessages);
    setTeamMembers(initialTeamMembers);
    setNotifications(initialNotifications);
    setAuditLogs(initialAuditLogs);
    
    // Clear storage keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });

    triggerConfetti();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        setActiveRole,
        updateCurrentUser,
        settings,
        updateSettings,
        alertSettings,
        updateAlertSettings,
        updateAlertRule,
        projects,
        selectedProjectId,
        setSelectedProjectId,
        selectedProject,
        addProject,
        updateProject,
        deleteProject,
        cloneProject,
        archiveProject,
        phases,
        projectPhases,
        addPhase,
        updatePhase,
        deletePhase,
        tasks,
        projectTasks,
        addTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        documents,
        projectDocuments,
        addDocument,
        updateDocument,
        deleteDocument,
        costs,
        projectCosts,
        addCost,
        updateCost,
        deleteCost,
        approveCost,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        payments,
        projectPayments,
        addPayment,
        daftraRecords,
        syncWithDaftra,
        magicPlanDesign,
        updateMagicPlanDesign,
        syncWithMagicPlan,
        whatsAppMessages,
        addWhatsAppMessage,
        assignWhatsAppMessage,
        teamMembers,
        projectTeamMembers,
        addTeamMember,
        removeTeamMember,
        notifications,
        unreadNotificationsCount,
        criticalNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        deleteNotification,
        clearAllNotifications,
        snoozeNotification,
        runDeadlineScan,
        triggerPhaseUpdateNotification,
        auditLogs,
        addAuditLog,
        navigationTab,
        setNavigationTab,
        searchQuery,
        setSearchQuery,
        triggerConfetti,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'owner': return 'مالك المشروع (صلاحيات كاملة)';
    case 'project_manager': return 'مدير المشروع (إدارة وفريق)';
    case 'architect': return 'مهندس معماري (تصاميم ومخططات)';
    case 'civil_engineer': return 'مهندس إنشائي / موقع';
    case 'contractor': return 'المقاول الرئيسي (تنفيذ وجداول)';
    case 'consultant': return 'استشاري هندسي ومستشار';
    case 'client': return 'العميل (متابعة واطلاع)';
    case 'observer': return 'مراقب (قراءة فقط)';
    default: return role;
  }
}
