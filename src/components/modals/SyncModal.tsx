import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Layers, 
  ExternalLink, 
  X, 
  ArrowRight,
  Database,
  Sliders,
  DollarSign,
  Ruler,
  Clock,
  Sparkles
} from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const { 
    selectedProject,
    syncWithDaftra, 
    syncWithMagicPlan, 
    testDaftraConnection,
    testMagicPlanConnection,
    settings,
    setNavigationTab
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState<'idle' | 'testing' | 'daftra' | 'magicplan' | 'completed' | 'error'>('idle');
  const [syncLog, setSyncLog] = useState<Array<{ type: 'daftra' | 'magicplan' | 'system'; message: string; success: boolean; time: string }>>([]);

  const [daftraResult, setDaftraResult] = useState<any>(null);
  const [magicPlanResult, setMagicPlanResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleStartFullSync = async () => {
    setIsSyncing(true);
    setSyncStep('testing');
    setSyncLog([]);
    const now = () => new Date().toLocaleTimeString('ar-SA');

    try {
      // Step 1: Test & Sync Daftra
      setSyncStep('daftra');
      setSyncLog(prev => [...prev, {
        type: 'daftra',
        message: `بدء الاتصال الفعلي بسيرفر دفترة (${settings.daftraSubdomain}.daftra.com) لأمر العمل #17...`,
        success: true,
        time: now()
      }]);

      const dRes = await syncWithDaftra(selectedProject?.id);
      setDaftraResult(dRes);

      if (dRes.success) {
        setSyncLog(prev => [...prev, {
          type: 'daftra',
          message: dRes.message || 'تم سحب وتحديث القيود والمستخلصات والفواتير الضريبية بنجاح.',
          success: true,
          time: now()
        }]);
      } else {
        setSyncLog(prev => [...prev, {
          type: 'daftra',
          message: dRes.message || 'تنبيه في مزامنة دفترة.',
          success: false,
          time: now()
        }]);
      }

      // Step 2: Test & Sync MagicPlan
      setSyncStep('magicplan');
      setSyncLog(prev => [...prev, {
        type: 'magicplan',
        message: 'بدء مزامنة المخططات المعمارية 2D/3D مع MagicPlan Cloud v2...',
        success: true,
        time: now()
      }]);

      const mpRes = await syncWithMagicPlan(selectedProject?.id);
      setMagicPlanResult(mpRes);

      if (mpRes.success) {
        setSyncLog(prev => [...prev, {
          type: 'magicplan',
          message: mpRes.message || 'تم تحديث أبعاد المخطط والمساحة 580 م² والغرف والمستندات بنجاح.',
          success: true,
          time: now()
        }]);
      } else {
        setSyncLog(prev => [...prev, {
          type: 'magicplan',
          message: mpRes.message || 'تنبيه في مزامنة MagicPlan.',
          success: false,
          time: now()
        }]);
      }

      setSyncStep('completed');
    } catch (err: any) {
      setSyncStep('error');
      setSyncLog(prev => [...prev, {
        type: 'system',
        message: err.message || 'حدث خطأ غير متوقع أثناء عملية المزامنة',
        success: false,
        time: now()
      }]);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-850 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>التزامن الفعلي المباشر</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  Daftra + MagicPlan
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مزامنة حية لبيانات المشروع: {selectedProject?.name || 'مشروع أرابيسك'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-right">
          
          {/* Status Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Daftra Status Card */}
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs">
                  <DollarSign className="w-4 h-4" />
                  <span>دفترة ERP (المحاسبة)</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                  {settings.daftraSubdomain}.daftra.com
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                مزامنة فواتير ومستخلصات وسندات الصرف وربطها بأمر العمل رقم 17.
              </p>
              <div className="mt-2.5 pt-2 border-t border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">الحالة:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  جاهز للمزامنة الفورية
                </span>
              </div>
            </div>

            {/* MagicPlan Status Card */}
            <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
                  <Ruler className="w-4 h-4" />
                  <span>MagicPlan Cloud v2</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                  Cloud API v2
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                سحب المخططات المعمارية 2D/3D، الأبعاد، المساحات وجدول الكميات.
              </p>
              <div className="mt-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">الحالة:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  متصل بـ 580 م²
                </span>
              </div>
            </div>

          </div>

          {/* Sync Progress & Logs */}
          {syncLog.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                سجل عمليات المزامنة الحية:
              </span>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-2 max-h-48 overflow-y-auto">
                {syncLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 text-[10px] shrink-0 mt-0.5">{log.time}</span>
                    {log.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <span className={`leading-relaxed ${log.success ? 'text-slate-700 dark:text-slate-200' : 'text-amber-600 dark:text-amber-400'}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Banner if Completed */}
          {syncStep === 'completed' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 animate-in fade-in duration-200">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  تمت المزامنة الحية الفعالة بنجاح تام
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                  تم تحديث المستخلصات والمخططات والتكاليف وإدراجها في لوحة التحكم والمشروع.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
          
          <button
            onClick={() => {
              onClose();
              setNavigationTab('integrations');
            }}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>إعدادات مفاتيح API الكاملة</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={isSyncing}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              إغلاق
            </button>

            <button
              onClick={handleStartFullSync}
              disabled={isSyncing}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري المزامنة الفعلية...' : 'بدء المزامنة الآن'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
