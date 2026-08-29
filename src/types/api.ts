/**
 * AzProjects - API & Edge Functions Response & Request Types
 * تعريفات واجهات برمجة التطبيقات ودوال الحافة
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  statusCode?: number;
}

export interface EdgeFunctionInvokeOptions {
  functionName: string;
  payload?: any;
  headers?: Record<string, string>;
}

export interface WhatsAppIngestRequest {
  from: string;
  senderName?: string;
  message?: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaName?: string;
  projectId?: string;
}

export interface DaftraSyncRequest {
  projectId: string;
  syncType?: 'all' | 'invoices' | 'payments' | 'expenses' | 'clients';
  workOrderId?: number;
}

export interface MagicPlanSyncRequest {
  projectId: string;
  designId?: string;
  planId?: string;
}

export interface VisionAnalysisRequest {
  imageBase64?: string;
  imageUrl?: string;
  mimeType?: string;
  projectId?: string;
  projectContext?: string;
}

export interface DocumentProcessRequest {
  documentId?: string;
  fileUrl?: string;
  fileName: string;
  fileType: string;
  projectId?: string;
}

export interface AIChatRequest {
  message: string;
  conversationId?: string;
  projectId?: string;
  projectContext?: any;
  includeAudio?: boolean;
}
