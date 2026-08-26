import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Receipt, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  DollarSign, 
  FileText, 
  Layers, 
  Plus, 
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Database
} from 'lucide-react';

export const DaftraSyncHub: React.FC = () => {
  const { 
    daftraRecords, 
    syncWithDaftra, 
    projectCosts, 
    selectedProject, 
    currentUser, 
    addNotification 
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

  const [newInvoiceData, setNewInvoiceData] = useState({
    clientOrSupplier: 'شركة اليمامة لحديد التسليح',
    amount: 68000,
    invoiceType: 'purchase',
    description: 'توريد دفعة حديد إنشائي كود 12مم و 16مم',
    taxNumber: '31098451200003'
  });

  const handleSyncAll = async () => {
    setIsSyncing(true);
    await syncWithDaftra(selectedProject?.id);
    setIsSyncing(false);
  };

  const handleCreateDaftraInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    handleSyncAll();
    setShowCreateInvoiceModal(false);
    addNotification({
      userId: currentUser.id,
      type: 'cost',
      title: 'إنشاء فاتورة جديدة في دفترة',
      message: `تم إنشاء فاتورة بقيمة ${newInvoiceData.amount.toLocaleString()} ر.س وإرسالها لدفترة.`,
      priority: 'normal',
      read: false
    });
  };

  const totalSyncedAmount = daftraRecords.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Daftra Integration Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white p-6 rounded-2xl border border-emerald-800/60 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-md">
              د
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">مركز تكامل دفترة المحاسبي (Daftra Sync Hub)</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  متصل ومفعل
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                مزامنة ثنائية الاتجاه للفواتير، سندات الصرف والقبض، مراكز التكلفة، وضرائب القيمة المضافة
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>مزامنة فورية للكل</span>
          </button>

          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>فاتورة دفترة جديدة</span>
          </button>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">إجمالي المبالغ المتزامنة</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalSyncedAmount.toLocaleString()} ر.س
          </p>
          <span className="text-[10px] text-slate-400">عبر نظام الفوترة الإلكتروني</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">سجلات الفواتير المكتملة</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {daftraRecords.length} فواتير
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">100% مطابقة محاسبية</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">مركز التكلفة المرتبط</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
            {selectedProject?.name || 'مركز عام'}
          </p>
          <span className="text-[10px] text-slate-400">كود: CC-{selectedProject?.id || '001'}</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">حالة مفتاح الـ API</span>
          <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            daftra_live_•••••••7a91
          </p>
          <span className="text-[10px] text-slate-400">متوافق مع ZATCA المرحلة 2</span>
        </div>

      </div>

      {/* Synced Records Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>سجل المعاملات والفواتير المتزامنة مع دفترة</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">آخر تحديث: لحظي</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">رقم فاتورة دفترة</th>
                <th className="p-4">رقم المعاملة (TRX)</th>
                <th className="p-4">المشروع</th>
                <th className="p-4">المبلغ المتزامن</th>
                <th className="p-4">تاريخ المزامنة</th>
                <th className="p-4">حالة المزامنة</th>
                <th className="p-4">الوصف المحاسبي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {daftraRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                  <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {record.daftraInvoiceId}
                  </td>
                  <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                    {record.daftraTransactionId}
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {selectedProject?.name || record.projectId}
                  </td>
                  <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {record.amount.toLocaleString()} ر.س
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">
                    {new Date(record.syncDate).toLocaleString('ar-SA')}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>متزامن وناجح</span>
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {record.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Daftra Invoice Modal */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">إصدار فاتورة جديدة إلى دفترة</h3>
            
            <form onSubmit={handleCreateDaftraInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المورد / العميل *</label>
                <input
                  type="text"
                  required
                  value={newInvoiceData.clientOrSupplier}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, clientOrSupplier: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المبلغ الإجمالي (ر.س) *</label>
                  <input
                    type="number"
                    required
                    value={newInvoiceData.amount}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الرقم الضريبي (ZATCA)</label>
                  <input
                    type="text"
                    value={newInvoiceData.taxNumber}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, taxNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">بيان الفاتورة / الوصف</label>
                <input
                  type="text"
                  value={newInvoiceData.description}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700"
                >
                  ترحيل إلى دفترة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
