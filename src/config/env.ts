/**
 * AzProjects - Application Environment Configuration
 * إعدادات البيئة ومتغيرات الربط للواجهة الأمامية
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
  SUPABASE_ANON_KEY: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dG5vbGx3dnJ6cGRvamdrY2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTQ5ODUsImV4cCI6MjA1NTkzMDk4NX0.dummy',
  
  // Daftra ERP
  DAFTRA_BASE_URL: (import.meta as any).env?.VITE_DAFTRA_BASE_URL || 'https://alazab-co.daftra.com',
  DAFTRA_SUBDOMAIN: (import.meta as any).env?.VITE_DAFTRA_SUBDOMAIN || 'alazab-co',
  DAFTRA_API_KEY: (import.meta as any).env?.VITE_DAFTRA_API_KEY || 'daf_live_alazab_co_998124018274aefb',
  
  // MagicPlan Cloud
  MAGICPLAN_BASE_URL: (import.meta as any).env?.VITE_MAGICPLAN_BASE_URL || 'https://cloud.magicplan.app/api/v2',
  MAGICPLAN_API_KEY: (import.meta as any).env?.VITE_MAGICPLAN_API_KEY || '',
  MAGICPLAN_CUSTOMER_KEY: (import.meta as any).env?.VITE_MAGICPLAN_CUSTOMER_KEY || '',
  
  // MinIO / Storage
  MINIO_ENDPOINT: (import.meta as any).env?.VITE_MINIO_ENDPOINT || 'storage.alazab.com',
  MINIO_BUCKET: (import.meta as any).env?.VITE_MINIO_BUCKET_NAME || 'azprojects-vault',
  
  // Azure AI Foundry
  AZURE_AI_ENDPOINT: (import.meta as any).env?.VITE_AZURE_AI_PROJECTS_ENDPOINT || 'https://az-ai-resource.services.ai.azure.com/api/projects/az-ai-gateway',
  AZURE_AI_AGENT_NAME: (import.meta as any).env?.VITE_AZURE_AI_AGENT_NAME || 'az-agent-project',
  AZURE_AI_AGENT_VERSION: (import.meta as any).env?.VITE_AZURE_AI_AGENT_VERSION || '2',

  // Feature Flags
  IS_PRODUCTION: (import.meta as any).env?.PROD || false,
  ENABLE_OFFLINE_CACHE: true,
  ENABLE_AI_VOICE: true,
  ENABLE_EDGE_FUNCTIONS: true,
};
