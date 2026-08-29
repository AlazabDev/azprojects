/**
 * AzProjects - Daftra ERP API Service
 * خدمة الربط والمزامنة مع نظام دفترة المحاسبي (أوامر العمل، الفواتير، السندات، القيود)
 */
import { EdgeFunctionsService } from './edgeFunctions';
import { apiClient } from './client';
import { ApiResponse, DaftraSyncRequest } from '../../types/api';

export class DaftraApiService {
  /**
   * Fetch site information from Daftra
   */
  static async getSiteInfo(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/daftra/site_info');
  }

  /**
   * Fetch clients list
   */
  static async getClients(params: Record<string, string> = {}): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params).toString();
    return apiClient.get(`/api/daftra/clients${qs ? `?${qs}` : ''}`);
  }

  /**
   * Create client in Daftra
   */
  static async createClient(clientData: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/daftra/clients', clientData);
  }

  /**
   * Fetch invoices from Daftra
   */
  static async getInvoices(params: Record<string, string> = {}): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params).toString();
    return apiClient.get(`/api/daftra/invoices${qs ? `?${qs}` : ''}`);
  }

  /**
   * Create invoice in Daftra
   */
  static async createInvoice(invoiceData: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/daftra/invoices', invoiceData);
  }

  /**
   * Record expense in Daftra
   */
  static async createExpense(expenseData: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/daftra/expenses', expenseData);
  }

  /**
   * Record payment receipt
   */
  static async recordPayment(paymentData: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/daftra/invoice_payments', paymentData);
  }

  /**
   * Synchronize Project Accounting with Daftra Work Order
   */
  static async syncProject(request: DaftraSyncRequest): Promise<ApiResponse<any>> {
    // 1. Try Edge function deftera-connector
    const edgeRes = await EdgeFunctionsService.invoke('deftera-connector', request);
    if (edgeRes.success && edgeRes.data) {
      return edgeRes;
    }

    // 2. Fallback to Express backend
    return apiClient.post('/api/sync-deftera', request);
  }
}
