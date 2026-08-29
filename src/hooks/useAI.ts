/**
 * AzProjects - useAI Hook
 * خطاف إدارة استشارات الذكاء الاصطناعي وتحليل الصور والتنبؤ بالتكاليف
 */
import { useState, useCallback } from 'react';
import { AIAgentsService } from '../services/api/aiAgents';
import { AIChatRequest, VisionAnalysisRequest } from '../types/api';

export function useAI() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [visionAnalysis, setVisionAnalysis] = useState<any | null>(null);
  const [costForecast, setCostForecast] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const askConsultant = useCallback(async (request: AIChatRequest) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await AIAgentsService.sendChatMessage(request);
      if (res.success && res.data) {
        const text = res.data.reply || res.data.outputText || res.data.text || '';
        setChatResponse(text);
        return text;
      } else {
        setError(res.error || 'Failed to get consultant response');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const analyzeImage = useCallback(async (request: VisionAnalysisRequest) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await AIAgentsService.analyzeSiteImage(request);
      if (res.success && res.data) {
        const analysis = res.data.analysis || res.data;
        setVisionAnalysis(analysis);
        return analysis;
      } else {
        setError(res.error || 'Failed to analyze image');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const forecastCosts = useCallback(async (projectName: string, budget: number, actualCost: number, phasesData: any = {}) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await AIAgentsService.forecastProjectCosts(projectName, budget, actualCost, phasesData);
      if (res.success && res.data) {
        const forecast = res.data.forecast || res.data;
        setCostForecast(forecast);
        return forecast;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    chatResponse,
    visionAnalysis,
    costForecast,
    error,
    askConsultant,
    analyzeImage,
    forecastCosts,
  };
}
