/**
 * AzProjects - useEdgeFunction Hook
 * خطاف مخصص لاستدعاء ومتابعة حالة أي دالة حافة Edge Function
 */
import { useState, useCallback } from 'react';
import { EdgeFunctionsService } from '../services/api/edgeFunctions';
import { ApiResponse } from '../types/api';

export function useEdgeFunction<T = any>(functionName: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExecutedAt, setLastExecutedAt] = useState<string | null>(null);

  const execute = useCallback(
    async (body: any = {}): Promise<ApiResponse<T>> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await EdgeFunctionsService.invoke<T>(functionName, body);
        if (response.success && response.data) {
          setData(response.data);
          setLastExecutedAt(new Date().toISOString());
        } else {
          setError(response.error || 'Execution returned non-success status');
        }
        setIsLoading(false);
        return response;
      } catch (err: any) {
        const errMessage = err.message || 'Unknown error occurred while calling edge function';
        setError(errMessage);
        setIsLoading(false);
        return { success: false, error: errMessage };
      }
    },
    [functionName]
  );

  return {
    data,
    isLoading,
    error,
    lastExecutedAt,
    execute,
  };
}
