/**
 * AzProjects - Application Routes Configuration
 * مسارات التوجيه والتنقل
 */

export interface AppRouteItem {
  id: string;
  path: string;
  label: string;
  labelEn: string;
  icon: string;
  badgeKey?: string;
  roles?: string[];
  isSubItem?: boolean;
  category?: 'main' | 'operations' | 'integrations' | 'system';
}

export const APP_ROUTES: AppRouteItem[] = [
  { id: 'dashboard', path: '/', label: 'لوحة المؤشرات', labelEn: 'Dashboard', icon: 'LayoutDashboard', category: 'main' },
  { id: 'projects', path: '/projects', label: 'المشاريع الهندسية', labelEn: 'Projects', icon: 'Building2', category: 'main' },
  { id: 'phases', path: '/phases', label: 'المراحل والجدول الزمني', labelEn: 'Phases', icon: 'Layers', category: 'operations' },
  { id: 'tasks', path: '/tasks', label: 'المهام وميدان العمل (Kanban)', labelEn: 'Tasks', icon: 'CheckSquare', category: 'operations' },
  { id: 'costs', path: '/costs', label: 'التكاليف والمستخلصات', labelEn: 'Costs & Cashflow', icon: 'DollarSign', category: 'operations' },
  { id: 'documents', path: '/documents', label: 'المستندات والمخططات', labelEn: 'Documents & Vault', icon: 'FolderKanban', category: 'operations' },
  
  // Integrations & AI
  { id: 'ai-assistant', path: '/ai-assistant', label: 'المستشار الذكي (AI)', labelEn: 'AI Consultant', icon: 'Bot', category: 'integrations' },
  { id: 'magicplan', path: '/magicplan', label: 'مخططات MagicPlan', labelEn: 'MagicPlan Blueprints', icon: 'Ruler', category: 'integrations' },
  { id: 'daftra', path: '/daftra', label: 'تكامل دفترة ERP', labelEn: 'Daftra Integration', icon: 'Receipt', category: 'integrations' },
  { id: 'whatsapp', path: '/whatsapp', label: 'مركز واتساب للمشاريع', labelEn: 'WhatsApp Hub', icon: 'MessageSquare', category: 'integrations' },
  { id: 'edge-functions', path: '/edge-functions', label: 'بوابة دوال الحافة (Edge)', labelEn: 'Edge Functions Hub', icon: 'Cpu', category: 'integrations' },

  // System & Management
  { id: 'suppliers', path: '/suppliers', label: 'الموردون والمقاولون', labelEn: 'Suppliers Directory', icon: 'Truck', category: 'system' },
  { id: 'notifications', path: '/notifications', label: 'مركز التنبيهات', labelEn: 'Alerts & Briefings', icon: 'Bell', category: 'system' },
  { id: 'settings', path: '/settings', label: 'إعدادات النظام والأمان', labelEn: 'Settings & Security', icon: 'Settings', category: 'system' },
];
