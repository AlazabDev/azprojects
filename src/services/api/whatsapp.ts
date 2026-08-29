/**
 * AzProjects - WhatsApp Ingestion & Communication API Service
 * خدمة إدارة رسائل ومرفقات واتساب الميدانية للمشاريع
 */
import { EdgeFunctionsService } from './edgeFunctions';
import { apiClient } from './client';
import { ApiResponse, WhatsAppIngestRequest } from '../../types/api';
import { WhatsAppMessage } from '../../types';

export class WhatsAppApiService {
  /**
   * Process incoming WhatsApp webhook or manual field ingestion
   */
  static async ingestMessage(request: WhatsAppIngestRequest): Promise<ApiResponse<any>> {
    // Call Edge function wa-ingestor
    const edgeRes = await EdgeFunctionsService.invoke('wa-ingestor', request);
    if (edgeRes.success) return edgeRes;

    // Fallback to local server endpoint
    return apiClient.post('/api/whatsapp-webhook', request);
  }

  /**
   * Send automated field update or reply via WhatsApp
   */
  static async sendReply(to: string, message: string, projectId?: string): Promise<ApiResponse<any>> {
    return EdgeFunctionsService.invoke('wa-ingestor', {
      action: 'send_reply',
      to,
      message,
      projectId,
    });
  }

  /**
   * Classify WhatsApp media attachment using AI
   */
  static async classifyMedia(mediaUrl: string, mediaType: string, projectId?: string): Promise<ApiResponse<any>> {
    return EdgeFunctionsService.invoke('vision-processor', {
      mediaUrl,
      mediaType,
      projectId,
      task: 'classify_and_tag',
    });
  }
}
