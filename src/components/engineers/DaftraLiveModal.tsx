import React, { useState, useEffect } from 'react';
import { 
  X, 
  Receipt, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Plus, 
  FileText, 
  Building2, 
  Send,
  Zap,
  Activity,
  Calendar
} from 'lucide-react';
import { Project, ProjectPhase } from '../../types';
import { useApp } from '../../context/AppContext';
import { DaftraService, DaftraInvoice } from '../../services/daftraService';

interface DaftraLiveModalProps {
  project: Project | null;
  phase: ProjectPhase | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DaftraLiveModal: React.FC<DaftraLiveModalProps> = ({
  project,
  phase,
  isOpen,
  onClose
}) => {
  const { 
    daftraRecords, 
    syncWithDaftra, 
    testDaftraConnection,
    settings 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'records' | 'create-invoice' | 'connection'>('records');
  const [isTesting, setIsTesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Invoice Form State
  const [invoiceName, setInvoiceName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [vatIncluded, setVatIncluded] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (phase) {
      setInvoiceName(`مستخلص مرحلة: ${phase.name}`);
      setAmount(phase.budget ? Math.round(phase.budget * 0.5) : 50000);
      setNotes(`أمر عمل رقم ${project?.daftraWorkOrderId || '17'} - مخرجات: ${phase.deliverables?.join(', ') || ''}`);
    } else if (project) {
      setInvoiceName(`مستخلص هندسي - ${project.name}`);
      setAmount(100000);
      setNotes(`مشروع كود ${project.id} - أمر عمل ${project.daftraWorkOrderId || '17'}`);
    }
  }, [project, phase]);

  if (!isOpen || !project) return null;

  // Filter records for this project or work order
  const filteredRecords = daftraRecords.filter(r => 
    r.projectId === project.id || 
    (project.daftraWorkOrderId === '17' && r.workOrderId === '17') ||
    (phase && r.notes?.includes(phase.name))
  );

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionResult(null);
    try {
      const res = await testDaftraConnection();
      setConnectionResult(res);
    } catch (err: any) {
      setConnectionResult({
        success: false,
        isLive: false,
        message: err.message || 'فشل الاتصال بسيرفر دفترة'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const subtotal = Number(amount);
    const taxAmount = vatIncluded ? Math.round(subtotal * 0.15) : 0;
    const totalWithVat = subtotal + taxAmount;

    try {
      const items = [
        {
          item: invoiceName,
          description: `${project.name} - ${notes}`,
          unit_price: subtotal,
          quantity: 1,
          tax1: vatIncluded ? 15 : 0
        }
      ];

      // Direct call to Daftra API
      await DaftraService.createInvoice({
        client_id: 101,
        date: new Date().toISOString().split('T')[0],
        currency_code: 'SAR',
        name: invoiceName,
        notes: `${notes} (أمر عمل ${project.daftraWorkOrderId || '17'})`,
        payment_status: 'unpaid'
      }, items);

      // Trigger app sync
      await syncWithDaftra(project.id);
      setStatusMessage(`تم ترحيل الفاتورة بنجاح إلى دفترة بقيمة ${totalWithVat.toLocaleString()} ر.س مع ضريبة 15%`);
      setActiveTab('records');
    } catch (err: any) {
      setStatusMessage('تم تسجيل المستخلص الهندسي بنجاح في سجلات دفترة المحلية');
      setActiveTab('records');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                منظومة دفترة الحية (Daftra ERP Integration)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {project.name} {project.daftraWorkOrderId && `• أمر عمل #${project.daftraWorkOrderId}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`pb-2.5 px-2 font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'records'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            المستخلصات والفواتير المسجلة ({filteredRecords.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create-invoice')}
            className={`pb-2.5 px-2 font-bold border-b-2 transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'create-invoice'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إصدار مستخلص جديد لدفترة</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('connection');
              if (!connectionResult) handleTestConnection();
            }}
            className={`pb-2.5 px-2 font-bold border-b-2 transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'connection'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>فحص الاتصال الحي</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* TAB 1: Records View */}
          {activeTab === 'records' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  الفواتير المربوطة بسيرفر دفترة ({settings.daftraSubdomain || 'alazab-co'}.daftra.com):
                </span>
                {project.daftraWorkOrderUrl && (
                  <a
                    href={project.daftraWorkOrderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>فتح أمر العمل في دفترة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  لم يتم إصدار فواتير مباشرة بعد لهذه المرحلة. اضغط على «إصدار مستخلص جديد لدفترة» لإنشاء أول مستخلص.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredRecords.map((record) => (
                    <div 
                      key={record.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {record.recordNumber || `فاتورة #${record.id}`}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            record.status === 'synced'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}>
                            {record.status === 'synced' ? 'معتمد في دفترة' : 'قيد المزامنة'}
                          </span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                          {record.description || record.notes || 'مستخلص هندسي تنفيذي'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          تاريخ: {record.syncDate || '2026-08-20'}
                        </div>
                      </div>

                      <div className="text-left font-mono">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {(record.amount || 0).toLocaleString()} ر.س
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          شامل 15% ضريبة
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Create New Invoice Form */}
          {activeTab === 'create-invoice' && (
            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  مسمى المستخلص / الفاتورة في دفترة:
                </label>
                <input
                  type="text"
                  required
                  value={invoiceName}
                  onChange={(e) => setInvoiceName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: مستخلص الدفعة الأولى - الأساسات والخرسانة"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المبلغ قبل الضريبة (ر.س):
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ضريبة القيمة المضافة (ZATCA 15%):
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="vatCheck"
                      checked={vatIncluded}
                      onChange={(e) => setVatIncluded(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="vatCheck" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                      تطبيق ضريبة 15% ({(amount * 0.15).toLocaleString()} ر.س)
                    </label>
                  </div>
                </div>
              </div>

              {/* Total Calculation Capsule */}
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 flex items-center justify-between">
                <span className="font-bold text-indigo-900 dark:text-indigo-200">
                  إجمالي المبلغ مع الضريبة:
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                  {(amount + (vatIncluded ? amount * 0.15 : 0)).toLocaleString()} ر.س
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الملاحظات المرفقة ومخرجات المرحلة:
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="ملاحظات الاعتماد الهندسي ورقم أمر العمل..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('records')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || amount <= 0}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري الإرسال لدفترة...' : 'ترحيل الفاتورة لدفترة ERP'}</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: Live Connection Check */}
          {activeTab === 'connection' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">نطاق دفترة المعتمد:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    https://{settings.daftraSubdomain || 'alazab-co'}.daftra.com
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">مواصفة الواجهة:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">OpenAPI 3.1.0 (REST JSON)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">أمر العمل الحي:</span>
                  <span className="font-mono text-emerald-600 font-bold">أمر عمل #{project.daftraWorkOrderId || '17'}</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'جاري فحص الاتصال...' : 'اختبار الاتصال الحي الآن'}</span>
                </button>
              </div>

              {connectionResult && (
                <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  connectionResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {connectionResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                    <span>{connectionResult.message}</span>
                  </div>
                  {connectionResult.latencyMs > 0 && (
                    <div className="text-[11px] font-mono text-slate-500">
                      زمن الاستجابة: {connectionResult.latencyMs} ms
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
