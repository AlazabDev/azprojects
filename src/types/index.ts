export type UserRole = 
  | 'owner' 
  | 'project_manager' 
  | 'architect' 
  | 'civil_engineer' 
  | 'contractor' 
  | 'consultant' 
  | 'client' 
  | 'observer';

export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';
export type ProjectType = 'residential' | 'commercial' | 'governmental' | 'industrial' | 'hospitality';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Project {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  location: string;
  coordinates: Coordinates;
  projectType: ProjectType;
  startDate: string;
  endDate: string;
  budget: number;
  actualCost: number;
  status: ProjectStatus;
  progress: number;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  coverImage: string;
  tags: string[];
  areaM2: number;
  floorsCount: number;
  contractorName?: string;
  leadArchitect?: string;
  daftraWorkOrderId?: string;
  daftraWorkOrderUrl?: string;
  magicplanId?: string;
  magicplanThumbnailUrl?: string;
  assigneeEmail?: string;
}

export type PhaseStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold' | 'delayed';

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  nameEn: string;
  description: string;
  orderNumber: number;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  progress: number;
  status: PhaseStatus;
  budget: number;
  actualCost: number;
  deliverables: string[];
  notes?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';

export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  phaseId: string;
  phaseName?: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  assignedToRole: UserRole;
  assignedToAvatar?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  checklist?: TaskChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 
  | 'contract' 
  | 'invoice' 
  | 'design' 
  | 'blueprint' 
  | 'report' 
  | 'photo' 
  | 'legal' 
  | 'permit'
  | 'other';

export interface DocumentItem {
  id: string;
  projectId: string;
  projectName?: string;
  phaseId?: string;
  phaseName?: string;
  taskId?: string;
  name: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number; // in bytes
  version: number;
  documentType: DocumentType;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  tags: string[];
  isPublic: boolean;
  notes?: string;
  downloadCount: number;
}

export type CostCategory = 
  | 'material' 
  | 'labor' 
  | 'equipment' 
  | 'consulting' 
  | 'overhead' 
  | 'contingency' 
  | 'other';

export type CostStatus = 
  | 'planned' 
  | 'committed' 
  | 'actual' 
  | 'paid' 
  | 'pending' 
  | 'disputed';

export interface CostItem {
  id: string;
  projectId: string;
  phaseId?: string;
  phaseName?: string;
  category: CostCategory;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  committedAmount: number;
  date: string;
  supplierId?: string;
  supplierName?: string;
  invoiceNumber?: string;
  status: CostStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  defteraSynced?: boolean;
  defteraInvoiceId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  rating: number;
  categories: string[];
  notes?: string;
  activeContractsCount: number;
  totalBilled: number;
}

export type PaymentMethod = 'bank' | 'cash' | 'check' | 'transfer';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  projectId: string;
  costId?: string;
  description: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  status: PaymentStatus;
  receivedBy: string;
  notes?: string;
  invoiceNumber?: string;
  recipientName: string;
}

export interface DaftraSyncRecord {
  id: string;
  projectId: string;
  daftraInvoiceId: string;
  daftraTransactionId: string;
  amount: number;
  direction: 'incoming' | 'outgoing';
  status: 'pending' | 'synced' | 'error';
  syncDate: string;
  lastSyncAttempt: string;
  errorMessage?: string;
  description: string;
}

export interface BlueprintRoom {
  id: string;
  name: string;
  nameEn: string;
  areaM2: number;
  dimensions: string; // e.g. "6.5m x 5.2m"
  type: string;
  color: string;
  coordinates: { x: number; y: number; width: number; height: number };
  doors?: { x: number; y: number; width: number }[];
  windows?: { x: number; y: number; width: number }[];
  annotations?: string[];
}

export interface BlueprintFloor {
  floorId: string;
  floorName: string;
  level: number;
  rooms: BlueprintRoom[];
  totalAreaM2: number;
}

export interface MagicPlanDesign {
  id: string;
  projectId: string;
  designId: string;
  title: string;
  version: number;
  floors: BlueprintFloor[];
  thumbnailUrl: string;
  syncDate: string;
  status: 'synced' | 'pending' | 'error';
  totalAreaM2: number;
  roomsCount: number;
  wallPerimeterM: number;
  exportedFormats: string[];
}

export type WhatsAppMessageType = 'text' | 'image' | 'document' | 'audio' | 'video';
export type WhatsAppProcessingStatus = 'received' | 'processing' | 'assigned' | 'done' | 'error';

export interface WhatsAppMessage {
  id: string;
  projectId?: string;
  projectName?: string;
  senderName: string;
  senderPhone: string;
  messageText?: string;
  mediaUrls?: string[];
  mediaType?: string;
  mediaName?: string;
  messageType: WhatsAppMessageType;
  receivedAt: string;
  processedAt?: string;
  status: WhatsAppProcessingStatus;
  assignedTo?: string;
  assignedToPhaseId?: string;
  assignedToPhaseName?: string;
  notes?: string;
  classifiedType?: 'photo' | 'invoice' | 'report' | 'query' | 'modification';
  autoReplySent?: boolean;
}

export interface TeamMember {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  role: UserRole;
  avatar: string;
  joinedAt: string;
  isActive: boolean;
  permissions: {
    canEditProject: boolean;
    canManageBudget: boolean;
    canAssignTasks: boolean;
    canUploadBlueprints: boolean;
    canApproveCosts: boolean;
  };
}

export type NotificationType = 
  | 'project' 
  | 'task' 
  | 'cost' 
  | 'payment' 
  | 'document' 
  | 'system' 
  | 'whatsapp' 
  | 'ai'
  | 'deadline'
  | 'phase'
  | 'periodic';

export type AlertCategory = 
  | 'deadline' 
  | 'phase_update' 
  | 'task_alert' 
  | 'budget_alert' 
  | 'periodic_brief' 
  | 'system_sync' 
  | 'whatsapp_media';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  category?: AlertCategory;
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  createdAt: string;
  // Deep-linking & contextual metadata
  projectId?: string;
  projectName?: string;
  phaseId?: string;
  phaseName?: string;
  taskId?: string;
  taskTitle?: string;
  targetDate?: string;
  daysRemaining?: number;
  snoozedUntil?: string;
  soundAlerted?: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  category: AlertCategory;
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  leadDays: number; // e.g. 7 days before deadline, 3 days, 1 day, 0 days
  targetAudience: 'all' | 'owner' | 'manager' | 'engineers';
  soundEnabled: boolean;
  whatsappNotification: boolean;
  lastTriggeredAt?: string;
}

export interface PeriodicAlertSettings {
  enablePeriodicScanning: boolean;
  scanIntervalMinutes: number; // e.g. 15 mins, 30 mins, 60 mins
  dailyBriefingTime: string; // e.g. "08:30"
  enableDailyBriefing: boolean;
  enableWeeklySummary: boolean;
  notifyBeforeDays: number[]; // [7, 3, 1, 0]
  criticalSoundAlerts: boolean;
  autoSnoozeDays: number;
  rules: AlertRule[];
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  projectId?: string;
  projectName?: string;
  action: string;
  entityType: 'project' | 'phase' | 'task' | 'cost' | 'document' | 'integration' | 'team';
  entityId: string;
  description: string;
  createdAt: string;
  ipAddress?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  companyName: string;
  licenseNumber: string;
  bio: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ar' | 'en';
  currency: string;
  currencySymbol: string;
  customDomain?: string;
  productionUrl?: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  daftraApiKey: string;
  daftraSubdomain: string;
  daftraWorkOrderUrl?: string;
  daftraBaseUrl?: string;
  magicplanApiKey: string;
  magicplanProjectId?: string;
  whatsappWebhookUrl: string;
  autoSyncDaftra: boolean;
  autoClassifyWhatsApp: boolean;
  aiSiteInspectionsEnabled: boolean;
}
