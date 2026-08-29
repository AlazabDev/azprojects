/**
 * AzProjects - Application Constants
 * الثوابت والتعريفات الأساسية
 */

export const USER_ROLES_MAP: Record<string, { label: string; labelEn: string; color: string }> = {
  owner: { label: 'المالك / المدير العام', labelEn: 'Owner / Executive', color: 'indigo' },
  project_manager: { label: 'مدير المشروع', labelEn: 'Project Manager', color: 'blue' },
  architect: { label: 'مهندس معماري', labelEn: 'Architect', color: 'emerald' },
  civil_engineer: { label: 'مهندس إنشائي / مدني', labelEn: 'Civil Engineer', color: 'amber' },
  contractor: { label: 'المقاول الرئيسي', labelEn: 'General Contractor', color: 'orange' },
  consultant: { label: 'الاستشاري الهندسي', labelEn: 'Consultant', color: 'purple' },
  client: { label: 'العميل', labelEn: 'Client', color: 'sky' },
  observer: { label: 'مراقب / مدقق', labelEn: 'Observer', color: 'slate' },
};

export const PROJECT_STATUS_MAP: Record<string, { label: string; color: string; badgeClass: string }> = {
  active: { label: 'نشط وجار التنفيذ', color: 'emerald', badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  'on-hold': { label: 'متوقف مؤقتاً', color: 'amber', badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  completed: { label: 'مكتمل ومسلّم', color: 'blue', badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  archived: { label: 'مؤرشف', color: 'slate', badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
};

export const TASK_STATUS_MAP: Record<string, { label: string; color: string }> = {
  todo: { label: 'قيد الانتظار', color: 'slate' },
  'in-progress': { label: 'قيد التنفيذ', color: 'blue' },
  review: { label: 'قيد المراجعة والاعتماد', color: 'amber' },
  done: { label: 'مكتملة', color: 'emerald' },
  blocked: { label: 'معلقة / متوقفة', color: 'rose' },
};

export const TASK_PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: 'منخفضة', color: 'slate' },
  medium: { label: 'متوسطة', color: 'blue' },
  high: { label: 'عالية', color: 'amber' },
  critical: { label: 'حرجة / طارئة', color: 'rose' },
};

export const COST_CATEGORIES_MAP: Record<string, { label: string; icon: string }> = {
  material: { label: 'مواد وتوريدات', icon: 'Box' },
  labor: { label: 'أجور وعمالة', icon: 'Users' },
  equipment: { label: 'معدات وآليات', icon: 'Truck' },
  consulting: { label: 'استشارات واعتمادات', icon: 'FileCheck' },
  overhead: { label: 'مصاريف عمومية وإدارية', icon: 'Building' },
  contingency: { label: 'احتياطي وطوارئ', icon: 'ShieldAlert' },
  other: { label: 'أخرى', icon: 'MoreHorizontal' },
};

export const EDGE_FUNCTIONS_LIST = [
  { id: 'wa-ingestor', name: 'استقبال وتصنيف واتساب', nameEn: 'WhatsApp Ingestor', category: 'communication', status: 'healthy' },
  { id: 'agent-router', name: 'توزيع واستجابة الوكلاء الذكية', nameEn: 'Agent Router', category: 'ai', status: 'healthy' },
  { id: 'vision-processor', name: 'تحليل الصور والموقع بالرؤية الحاسوبية', nameEn: 'Vision Processor', category: 'ai', status: 'healthy' },
  { id: 'document-processor', name: 'تحليل المستندات والعقود (PDF / DOCX)', nameEn: 'Document Processor', category: 'ai', status: 'healthy' },
  { id: 'deftera-connector', name: 'موصل ومزامنة دفترة للمحاسبة', nameEn: 'Daftra Connector', category: 'erp', status: 'healthy' },
  { id: 'magicplan-connector', name: 'موصل مخططات MagicPlan Cloud', nameEn: 'MagicPlan Connector', category: 'cad', status: 'healthy' },
  { id: 'file-manager', name: 'إدارة وتصنيف ملفات المشاريع', nameEn: 'File Manager', category: 'storage', status: 'healthy' },
  { id: 'minio-storage', name: 'تخزين كائني آمن عبر MinIO S3', nameEn: 'MinIO Storage', category: 'storage', status: 'healthy' },
  { id: 'chatbot', name: 'المساعد الذكي الصوتي والنصي', nameEn: 'Voice/Text Chatbot', category: 'ai', status: 'healthy' },
  { id: 'project-notifier', name: 'إشعارات وتنبيهات المشاريع الدورية', nameEn: 'Project Notifier', category: 'alerts', status: 'healthy' },
  { id: 'conversation-manager', name: 'إدارة جلسات وسياق المحادثات', nameEn: 'Conversation Manager', category: 'ai', status: 'healthy' },
  { id: 'context-updater', name: 'تحديث الذاكرة الهندسية وسياق المشاريع', nameEn: 'Context Updater', category: 'ai', status: 'healthy' },
  { id: 'agent-proxy', name: 'جسر وكلاء Azure AI Foundry & Gemini', nameEn: 'Agent Proxy', category: 'ai', status: 'healthy' },
  { id: 'health-check', name: 'فحص جاهزية ومراقبة المنظومة', nameEn: 'System Health Check', category: 'system', status: 'healthy' },
];
