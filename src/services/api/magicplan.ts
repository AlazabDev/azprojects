/**
 * AzProjects - MagicPlan Cloud API Service
 * خدمة الربط والمزامنة مع منصة MagicPlan Cloud ومطابقة المخططات والقياسات المعمارية
 */
import { EdgeFunctionsService } from './edgeFunctions';
import { apiClient } from './client';
import { ApiResponse, MagicPlanSyncRequest } from '../../types/api';

export class MagicPlanApiService {
  /**
   * List all projects from MagicPlan Cloud
   */
  static async getProjects(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/magicplan/projects');
  }

  /**
   * Get single project details
   */
  static async getProject(projectId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/magicplan/projects/${projectId}`);
  }

  /**
   * Get project architectural floor plan and room statistics
   */
  static async getProjectPlan(projectId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/magicplan/projects/${projectId}/plan`);
  }

  /**
   * Get project cost estimates and material takeoffs
   */
  static async getProjectEstimates(projectId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/magicplan/projects/${projectId}/estimates`);
  }

  /**
   * Get project CAD / DWG / PDF files
   */
  static async getProjectFiles(projectId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/magicplan/projects/${projectId}/files`);
  }

  /**
   * Synchronize Project Blueprint with MagicPlan Connector
   */
  static async syncProjectPlan(request: MagicPlanSyncRequest): Promise<ApiResponse<any>> {
    // 1. Try Edge function magicplan-connector
    const edgeRes = await EdgeFunctionsService.invoke('magicplan-connector', request);
    if (edgeRes.success && edgeRes.data) {
      return edgeRes;
    }

    // 2. Fallback to Express backend
    return apiClient.post('/api/sync-magicplan', request);
  }
}
