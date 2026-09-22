/**
 * AzProjects - Application Environment Configuration
 * إعدادات البيئة ومتغيرات الربط للواجهة الأمامية
 * خالية تماماً من أي مفاتيح سرية ثابتة (Zero Hardcoded Secrets)
 */

export const ENV = {
  // Application Info
  APP_NAME: 'AzProjects Architectural System',
  APP_NAME_AR: 'منظومة العزب لإدارة المشاريع المعمارية',
  APP_VERSION: '2.5.0',
  APP_URL: (import.meta as any).env?.VITE_APP_URL || 'https://projects.alazab.com',
  PRODUCTION_DOMAIN: (import.meta as any).env?.VITE_PRODUCTION_DOMAIN || 'projects.alazab.com',
  
  // Supabase
  SUPABASE_URL: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://xvtnollwvrzpdojgkcbi.supabase.co',
  SUPABASE_ANON_KEY: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  
  // Daftra ERP (Accessed securely via server backend /api/daftra proxy)
  DAFTRA_BASE_URL: (import.meta as any).env?.VITE_DAFTRA_BASE_URL || 'https://alazab-co.daftra.com',
  DAFTRA_SUBDOMAIN: (import.meta as any).env?.VITE_DAFTRA_SUBDOMAIN || 'alazab-co',
  
  // MagicPlan Cloud (Accessed securely via server backend /api/magicplan proxy)
  MAGICPLAN_BASE_URL: (import.meta as any).env?.VITE_MAGICPLAN_BASE_URL || 'https://cloud.magicplan.app/api/v2',
  
  // MinIO / Storage (Public asset endpoint and bucket)
  MINIO_ENDPOINT: (import.meta as any).env?.VITE_MINIO_ENDPOINT || 'storage.alazab.com',
  MINIO_BUCKET: (import.meta as any).env?.VITE_MINIO_BUCKET_NAME || 'azprojects-vault',
  
  // Azure AI Agent Metadata
  AZURE_AI_AGENT_NAME: (import.meta as any).env?.VITE_AZURE_AI_AGENT_NAME || 'az-agent-project',
  AZURE_AI_AGENT_VERSION: (import.meta as any).env?.VITE_AZURE_AI_AGENT_VERSION || '2',

  // Feature Flags
  IS_PRODUCTION: (import.meta as any).env?.PROD || false,
  ENABLE_OFFLINE_CACHE: true,
  ENABLE_AI_VOICE: true,
  ENABLE_EDGE_FUNCTIONS: true,
};
