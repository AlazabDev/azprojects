/**
 * AzProjects - Central HTTP API Client
 * عميل الطلبات الشبكية مع إدارة الرؤوس والأخطاء والمصادقة
 */
import { getAuthToken } from '../../lib/supabase';
import { ApiResponse } from '../../types/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(customHeaders: Record<string, string> = {}): Promise<HeadersInit> {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string, headers: Record<string, string> = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: await this.getHeaders(headers),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? (data.error || data.message || 'Request failed') : undefined,
        statusCode: response.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error occurred',
        statusCode: 500,
      };
    }
  }

  async post<T>(endpoint: string, body: any = {}, headers: Record<string, string> = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await this.getHeaders(headers),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? (data.error || data.message || 'Request failed') : undefined,
        statusCode: response.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error occurred',
        statusCode: 500,
      };
    }
  }

  async put<T>(endpoint: string, body: any = {}, headers: Record<string, string> = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await this.getHeaders(headers),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? (data.error || data.message || 'Request failed') : undefined,
        statusCode: response.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error occurred',
        statusCode: 500,
      };
    }
  }

  async delete<T>(endpoint: string, headers: Record<string, string> = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await this.getHeaders(headers),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? (data.error || data.message || 'Request failed') : undefined,
        statusCode: response.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error occurred',
        statusCode: 500,
      };
    }
  }
}

export const apiClient = new ApiClient();
