/**
 * AzProjects - Authentication & Authorization Types
 * أنواع بيانات المصادقة والصلاحيات
 */

import { UserRole } from './index';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  companyName?: string;
  licenseNumber?: string;
  token?: string;
  createdAt?: string;
  lastLoginAt?: string;
  permissions: {
    canCreateProjects: boolean;
    canEditProjects: boolean;
    canDeleteProjects: boolean;
    canManageBudget: boolean;
    canApproveCosts: boolean;
    canAssignTasks: boolean;
    canSyncDaftra: boolean;
    canSyncMagicPlan: boolean;
    canTriggerAIAgents: boolean;
  };
}

export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  companyName?: string;
  licenseNumber?: string;
}
