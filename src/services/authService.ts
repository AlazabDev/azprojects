/**
 * AzProjects - Supabase Authentication Service
 * إدارة المصادقة الحقيقية عبر Supabase Auth حصراً دون أي Fallback وهمي
 */
import { supabase } from '../lib/supabase';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth';
import { UserRole } from '../types/permissions';

export class AuthService {
  /**
   * Get Current Session User from verified Supabase session
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        return null;
      }
      return this.mapSupabaseUserToAuthUser(session.user);
    } catch (err) {
      console.warn('Error fetching Supabase session:', err);
      return null;
    }
  }

  /**
   * Sign In with Email and Password strictly via Supabase Auth
   */
  static async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      if (!credentials.email || !credentials.password) {
        return { user: null, error: 'البريد الإلكتروني وكلمة المرور مطلوبان.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: error.message || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.' };
      }

      if (!data.user) {
        return { user: null, error: 'لم يتم العثور على بيانات المستخدم.' };
      }

      const user = this.mapSupabaseUserToAuthUser(data.user);
      return { user, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول.' };
    }
  }

  /**
   * Register a new user strictly via Supabase Auth
   */
  static async signUp(credentials: RegisterCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      if (!credentials.email || !credentials.password) {
        return { user: null, error: 'البريد الإلكتروني وكلمة المرور مطلوبان.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            role: credentials.role || 'client',
            phone: credentials.phone,
            companyName: credentials.companyName,
            licenseNumber: credentials.licenseNumber,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message || 'فشل إنشاء الحساب.' };
      }

      if (!data.user) {
        return { user: null, error: 'لم يتم إنشاء المستخدم بشكل صحيح.' };
      }

      const user = this.mapSupabaseUserToAuthUser(data.user, credentials.role);
      return { user, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'حدث خطأ أثناء إنشاء الحساب.' };
    }
  }

  /**
   * Sign Out
   */
  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  }

  /**
   * Map Supabase auth user to AuthUser format
   * Fallback role is strictly 'client' (never 'owner' or 'admin')
   */
  private static mapSupabaseUserToAuthUser(user: any, fallbackRole: UserRole = 'client'): AuthUser {
    const meta = user.user_metadata || {};
    const role: UserRole = meta.role || fallbackRole;

    return {
      id: user.id,
      email: user.email || '',
      name: meta.name || meta.full_name || user.email?.split('@')[0] || 'مستخدم النظام',
      phone: meta.phone || user.phone || '',
      role,
      companyName: meta.companyName || 'مؤسسة العزب للمقاولات',
      licenseNumber: meta.licenseNumber || '',
      lastLoginAt: user.last_sign_in_at || new Date().toISOString(),
      permissions: this.getLegacyPermissionsForRole(role),
    };
  }

  /**
   * Backward-compatible permissions helper
   */
  static getLegacyPermissionsForRole(role: UserRole) {
    const isOwner = role === 'owner';
    const isManager = role === 'project_manager' || isOwner;
    const isEngineer = role === 'architect' || role === 'civil_engineer' || isManager;

    return {
      canCreateProjects: isManager,
      canEditProjects: isManager || isEngineer,
      canDeleteProjects: isOwner,
      canManageBudget: isManager,
      canApproveCosts: isManager,
      canAssignTasks: isEngineer,
      canSyncDaftra: isManager,
      canSyncMagicPlan: isEngineer,
      canTriggerAIAgents: true,
    };
  }
}
