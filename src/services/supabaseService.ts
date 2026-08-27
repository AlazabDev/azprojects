/**
 * AzProjects - Supabase Client & Backend Data Service
 * خدمة الربط مع قاعدة بيانات Supabase مع الحفاظ على الأمان وسياسات RLS
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
  AppSettings 
} from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://xvtnollwvrzpdojgkcbi.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * فئة إدارة خدمات البيانات المتوافقة مع سياسات الأمان RLS
 */
export class SupabaseBackendService {
  
  // 1. Projects
  static async getProjects(): Promise<{ data: Project[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      return { data: data as Project[], error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  static async getProjectById(projectId: string): Promise<{ data: Project | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      return { data: data as Project, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // 2. Tasks (RLS: Employees see their assigned tasks, Managers see project tasks)
  static async getTasks(projectId?: string): Promise<{ data: Task[] | null; error: any }> {
    try {
      let query = supabase.from('tasks').select('*');
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      const { data, error } = await query.order('due_date', { ascending: true });
      return { data: data as Task[], error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  static async updateTaskStatus(taskId: string, status: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      return { error };
    } catch (err) {
      return { error: err };
    }
  }

  // 3. Phases
  static async getProjectPhases(projectId: string): Promise<{ data: ProjectPhase[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('project_phases')
        .select('*')
        .eq('project_id', projectId)
        .order('order_number', { ascending: true });
      return { data: data as ProjectPhase[], error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // 4. Documents & Blueprints
  static async getProjectDocuments(projectId: string): Promise<{ data: DocumentItem[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      return { data: data as DocumentItem[], error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // 5. Cost Items
  static async getProjectCosts(projectId: string): Promise<{ data: CostItem[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('cost_items')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });
      return { data: data as CostItem[], error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // 6. WhatsApp Messages
  static async getWhatsAppMessages(projectId?: string): Promise<{ data: WhatsAppMessage[] | null; error: any }> {
    try {
      let query = supabase.from('whatsapp_messages').select('*');
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      const { data, error } = await query.order('received_at', { ascending: false });
      return { data: data as WhatsAppMessage[], error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // 7. Notifications
  static async getUserNotifications(): Promise<{ data: NotificationItem[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      return { data: data as NotificationItem[], error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // 8. Audit Logs
  static async logAction(entry: Omit<AuditLogItem, 'id' | 'createdAt'>): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: entry.userId,
          user_name: entry.userName,
          user_role: entry.userRole,
          project_id: entry.projectId,
          action: entry.action,
          entity_type: entry.entityType,
          entity_id: entry.entityId,
          description: entry.description,
          ip_address: entry.ipAddress || 'client'
        }]);
      return { error };
    } catch (err) {
      return { error: err };
    }
  }
}
