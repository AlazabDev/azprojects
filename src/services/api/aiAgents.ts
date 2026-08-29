/**
 * AzProjects - Multi-Agent & AI Services Connector
 * خدمات الوكلاء الأذكياء (Azure AI Foundry, Gemini 2.5 Flash, Vision, Documents, Chatbot)
 */
import { EdgeFunctionsService } from './edgeFunctions';
import { apiClient } from './client';
import { ApiResponse, AIChatRequest, VisionAnalysisRequest } from '../../types/api';

export class AIAgentsService {
  /**
   * Universal Architectural AI Consultant Chat
   * يستدعي وكيل Microsoft Azure AI Foundry أو وكيل Gemini الذكي
   */
  static async sendChatMessage(request: AIChatRequest): Promise<ApiResponse<any>> {
    // 1. Try Azure AI Foundry Agent endpoint
    try {
      const res = await apiClient.post<any>('/api/azure-agent/chat', {
        message: request.message,
        conversationId: request.conversationId,
        projectContext: request.projectContext,
      });

      if (res.success && (res.data as any)?.reply) {
        return res;
      }
    } catch {
      // ignore
    }

    // 2. Try Gemini Chatbot endpoint
    try {
      const geminiRes = await apiClient.post<any>('/api/ai-chat-assistant', {
        message: request.message,
        projectContext: request.projectContext,
      });

      if (geminiRes.success && (geminiRes.data as any)?.reply) {
        return geminiRes;
      }
    } catch {
      // ignore
    }

    // 3. Fallback to Edge function chatbot
    return EdgeFunctionsService.invoke('chatbot', {
      message: request.message,
      conversationId: request.conversationId,
    });
  }

  /**
   * Analyze site inspection image / progress photo
   */
  static async analyzeSiteImage(request: VisionAnalysisRequest): Promise<ApiResponse<any>> {
    // 1. Local Gemini Vision API
    try {
      const res = await apiClient.post<any>('/api/ai-site-analysis', {
        imageBase64: request.imageBase64,
        imageMimeType: request.mimeType || 'image/jpeg',
        projectContext: request.projectContext,
      });

      if (res.success && (res.data as any)?.analysis) {
        return res;
      }
    } catch {
      // ignore
    }

    // 2. Fallback to Edge function vision-processor
    return EdgeFunctionsService.invoke('vision-processor', request);
  }

  /**
   * Run AI Cost Variance & Financial Forecasting
   */
  static async forecastProjectCosts(projectName: string, budget: number, actualCost: number, phasesData: any = {}): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.post<any>('/api/ai-cost-forecast', {
        projectName,
        budget,
        actualCost,
        phasesData,
      });

      if (res.success) {
        return res;
      }
    } catch {
      // ignore
    }

    return EdgeFunctionsService.invoke('agent-router', {
      task: 'cost_forecast',
      projectName,
      budget,
      actualCost,
    });
  }

  /**
   * Test Microsoft Azure AI Foundry Agent
   */
  static async testAzureAgent(message?: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/api/azure-agent/test', { message });
  }

  /**
   * Get Azure Agent Status
   */
  static async getAzureAgentStatus(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/api/azure-agent/status');
  }
}
