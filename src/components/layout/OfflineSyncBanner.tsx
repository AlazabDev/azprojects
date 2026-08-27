import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useResponsive } from '../../utils/useResponsive';
import { useApp } from '../../context/AppContext';

export const OfflineSyncBanner: React.FC = () => {
  const { isOnline } = useResponsive();
  const { syncWithDaftra, syncWithMagicPlan } = useApp();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncSuccess, setSyncSuccess] = React.useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await Promise.all([syncWithDaftra(), syncWithMagicPlan()]);
    setIsSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  if (isOnline && !syncSuccess) return null;

  return (
    <div className={`px-4 py-2 text-xs flex items-center justify-between transition-colors z-50 ${
      !isOnline 
        ? 'bg-rose-600 text-white font-medium' 
        : 'bg-emerald-600 text-white font-medium'
    }`}>
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
              <span>أنت تعمل في <strong>الوضع غير المتصل (Offline Mode)</strong>. التغييرات مخزنة محلياً وسيتم مزامنتها تلقائياً عند استعادة الاتصال.</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>تمت مزامنة البيانات الميدانية مع الخادم بنجاح.</span>
            </>
          )}
        </div>

        {!isOnline && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 transition"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>إعادة المحاولة</span>
          </button>
        )}
      </div>
    </div>
  );
};
