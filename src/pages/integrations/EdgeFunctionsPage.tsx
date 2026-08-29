import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Terminal, 
  Clock, 
  Layers, 
  Server, 
  Database, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Eye, 
  Share2 
} from 'lucide-react';
import { EDGE_FUNCTIONS_LIST } from '../../config/constants';
import { EdgeFunctionsService } from '../../services/api/edgeFunctions';

export const EdgeFunctionsPage: React.FC = () => {
  const [selectedFunc, setSelectedFunc] = useState(EDGE_FUNCTIONS_LIST[0]);
  const [payloadInput, setPayloadInput] = useState<string>('{\n  "action": "test",\n  "projectId": "PRJ-ARABESQUE"\n}');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [functionStatuses, setFunctionStatuses] = useState<Record<string, 'ready' | 'running' | 'success' | 'error'>>({});

  useEffect(() => {
    // Default payload template based on selected function
    const templates: Record<string, any> = {
      'wa-ingestor': {
        from: '+966501234567',
        senderName: 'المهندس المشرف',
        message: 'مرفق تقرير استلام حديد التسليح للدور الأرضي',
        mediaType: 'image/jpeg',
        projectId: 'PRJ-ARABESQUE'
      },
      'agent-router': {
        query: 'ما هي معايير خرسانة الأساسات وفق SBC 304؟',
        category: 'architectural_compliance',
        projectId: 'PRJ-ARABESQUE'
      },
      'vision-processor': {
        projectId: 'PRJ-ARABESQUE',
        task: 'detect_construction_phase',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7'
      },
      'document-processor': {
        fileName: 'Arabesque_BOQ_Final.pdf',
        fileType: 'application/pdf',
        documentId: 'DOC-9901'
      },
      'deftera-connector': {
        projectId: 'PRJ-ARABESQUE',
        workOrderId: 17,
        syncType: 'all'
      },
      'magicplan-connector': {
        projectId: 'PRJ-ARABESQUE',
        designId: '3faed7e9-6e92-495c-b4a6-94a8f0216fcb'
      },
      'file-manager': {
        projectId: 'PRJ-ARABESQUE',
        action: 'list_vault_files'
      },
      'minio-storage': {
        action: 'verify_bucket_health',
        bucket: 'azprojects-vault'
      },
      'chatbot': {
        message: 'لخص لي الوضع المالي الحالي لمشروع أرابيسك',
        conversationId: 'conv-test-01'
      },
      'project-notifier': {
        projectId: 'PRJ-ARABESQUE',
        type: 'deadline_warning',
        daysRemaining: 3
      },
      'health-check': {
        checkType: 'full_system_diagnostic'
      }
    };

    const template = templates[selectedFunc.id] || { action: 'test', timestamp: new Date().toISOString() };
    setPayloadInput(JSON.stringify(template, null, 2));
    setExecutionResult(null);
  }, [selectedFunc]);

  const handleExecute = async () => {
    setIsExecuting(true);
    setFunctionStatuses(prev => ({ ...prev, [selectedFunc.id]: 'running' }));
    
    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(payloadInput);
      } catch (pErr) {
        // use raw if not json
        parsedPayload = { raw: payloadInput };
      }

      const res = await EdgeFunctionsService.invoke(selectedFunc.id, parsedPayload);
      setExecutionResult(res);
      setFunctionStatuses(prev => ({ ...prev, [selectedFunc.id]: res.success ? 'success' : 'error' }));
    } catch (err: any) {
      setExecutionResult({ success: false, error: err.message });
      setFunctionStatuses(prev => ({ ...prev, [selectedFunc.id]: 'error' }));
    } finally {
      setIsExecuting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'communication': return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'erp': return <Database className="w-4 h-4 text-blue-400" />;
      case 'cad': return <Layers className="w-4 h-4 text-amber-400" />;
      case 'storage': return <Server className="w-4 h-4 text-teal-400" />;
      default: return <Cpu className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                14 دالة حافة Edge Function جاهزة
              </span>
              <span className="text-xs text-slate-400">Deno & Supabase Edge Runtime</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">بوابة واختبار دوال الحافة (Edge Functions Gateway)</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              إدارة واستدعاء دوال المعالجة الموزعة للرؤية الحاسوبية، وتوزيع طلبات الوكلاء الأذكياء، وتكامل دفترة وواتساب وميجيك بلان.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                EDGE_FUNCTIONS_LIST.forEach(f => {
                  EdgeFunctionsService.invoke(f.id, { check: true });
                });
              }}
              className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>فحص جاهزية جميع الدوال</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Functions List + Live Test Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Functions Directory (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <span>دوال الحافة المسجلة في المشروع ({EDGE_FUNCTIONS_LIST.length})</span>
            </h2>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {EDGE_FUNCTIONS_LIST.map((fn) => {
              const isSelected = selectedFunc.id === fn.id;
              const status = functionStatuses[fn.id];

              return (
                <div
                  key={fn.id}
                  onClick={() => setSelectedFunc(fn)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700/60 flex items-center justify-center shrink-0">
                      {getCategoryIcon(fn.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {fn.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                        supabase/functions/{fn.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {status === 'running' && (
                      <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    )}
                    {status === 'success' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    {status === 'error' && (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                      POST
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Test & Output Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Function Card & Editor */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Active Edge Function
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedFunc.name}</span>
                  <span className="text-xs font-normal text-slate-400">({selectedFunc.nameEn})</span>
                </h3>
              </div>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isExecuting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>استدعاء الدالة (Invoke)</span>
              </button>
            </div>

            {/* Request Payload JSON Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>حمولة الطلب (Request Payload JSON)</span>
                </span>
                <span className="font-mono text-[11px]">POST /functions/v1/{selectedFunc.id}</span>
              </div>
              <textarea
                value={payloadInput}
                onChange={(e) => setPayloadInput(e.target.value)}
                rows={6}
                className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
                dir="ltr"
              />
            </div>
          </div>

          {/* Response Console Output */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-100">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>مخرجات الاستجابة (Execution Response)</span>
              </div>
              {executionResult && (
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                  executionResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {executionResult.success ? 'HTTP 200 OK' : 'HTTP Error'}
                </span>
              )}
            </div>

            <div className="min-h-[160px] max-h-[320px] overflow-y-auto font-mono text-xs" dir="ltr">
              {isExecuting ? (
                <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Executing edge function runtime...</span>
                </div>
              ) : executionResult ? (
                <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs font-sans">
                  اضغط على زر "استدعاء الدالة" بالأعلى لاختبار وتنفيذ الدالة المحددة وعرض النتائج.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
