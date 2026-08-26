import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CostItem, CostCategory, CostStatus, Payment } from '../../types';
import { 
  DollarSign, 
  Plus, 
  Receipt, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ExternalLink, 
  Trash2,
  Check,
  RefreshCw,
  Building2
} from 'lucide-react';

export const CostManager: React.FC = () => {
  const { 
    projectCosts, 
    addCost, 
    deleteCost, 
    approveCost, 
    suppliers, 
    projectPhases, 
    selectedProject, 
    syncWithDaftra, 
    projectPayments, 
    addPayment 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncingDaftra, setIsSyncingDaftra] = useState(false);

  // New cost form state
  const [newCostData, setNewCostData] = useState({
    description: '',
    category: 'material' as CostCategory,
    phaseId: projectPhases[0]?.id || '',
    supplierId: suppliers[0]?.id || '',
    plannedAmount: 25000,
    actualAmount: 25000,
    invoiceNumber: 'INV-' + Math.floor(Math.random() * 9000 + 1000),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'توريد دفعة مواد حسب المواصفات وجدول الكميات'
  });

  const totalBudget = selectedProject?.budget || 1;
  const totalActual = projectCosts.reduce((acc, c) => acc + (c.actualAmount || c.committedAmount || 0), 0);
  const remainingBudget = totalBudget - totalActual;
  const variancePercentage = Math.round((totalActual / totalBudget) * 100);

  const filteredCosts = projectCosts.filter(c => {
    const matchesSearch = c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.supplierName && c.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.invoiceNumber && c.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleSyncDaftra = async () => {
    setIsSyncingDaftra(true);
    await syncWithDaftra(selectedProject?.id);
    setIsSyncingDaftra(false);
  };

  const handleAddCostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newCostData.description) return;

    const supplier = suppliers.find(s => s.id === newCostData.supplierId);
    const phase = projectPhases.find(p => p.id === newCostData.phaseId);

    addCost({
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      phaseId: newCostData.phaseId || projectPhases[0]?.id || 'PHS-DEFAULT',
      phaseName: phase?.name || 'مرحلة تنفيذية',
      description: newCostData.description,
      category: newCostData.category,
      plannedAmount: Number(newCostData.plannedAmount),
      committedAmount: Number(newCostData.actualAmount),
      actualAmount: Number(newCostData.actualAmount),
      variance: Number(newCostData.actualAmount) - Number(newCostData.plannedAmount),
      currency: 'SAR',
      status: 'pending',
      supplierId: newCostData.supplierId,
      supplierName: supplier?.name || 'مورد عام',
      invoiceNumber: newCostData.invoiceNumber,
      dueDate: newCostData.dueDate,
      defteraSynced: false,
      notes: newCostData.notes
    });

    setShowAddModal(false);
    setNewCostData({
      description: '',
      category: 'material',
      phaseId: projectPhases[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      plannedAmount: 25000,
      actualAmount: 25000,
      invoiceNumber: 'INV-' + Math.floor(Math.random() * 9000 + 1000),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'توريد دفعة مواد حسب المواصفات وجدول الكميات'
    });
  };

  const getCategoryBadge = (cat: CostCategory) => {
    switch (cat) {
      case 'material': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">مواد وخامات</span>;
      case 'labor': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">عمالة ومقاول</span>;
      case 'equipment': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">معدات وأنظمة</span>;
      case 'consulting': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">استشارات هندسية</span>;
      case 'overhead': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">إدارية وتراخيص</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">طوارئ واحتياطي</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Financial Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>إدارة التكاليف والميزانية وتكامل دفترة المحاسبي</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تتبع المصاريف، الفواتير، المستخلصات والمطابقة المحاسبية اللحظية مع Daftra
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncDaftra}
            disabled={isSyncingDaftra}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDaftra ? 'animate-spin' : ''}`} />
            <span>مزامنة فواتير دفترة</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل بند تكلفة / فاتورة</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">الميزانية التقديرية الكلية</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalBudget.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span>
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">إجمالي المنصرف الفعلي</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalActual.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span>
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(variancePercentage, 100)}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">المتبقي من الميزانية</span>
          <p className={`text-2xl font-black mt-1 ${remainingBudget >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600'}`}>
            {remainingBudget.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            نسبة الاستهلاك: {variancePercentage}%
          </span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالوصف، المورد، أو رقم الفاتورة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs pr-9 pl-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            <option value="all">كل التصنيفات</option>
            <option value="material">مواد وخامات</option>
            <option value="labor">عمالة ومقاول</option>
            <option value="equipment">معدات وأنظمة</option>
            <option value="consulting">استشارات</option>
            <option value="overhead">إدارية</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            <option value="all">كل الحالات</option>
            <option value="paid">مدفوع ومعتمد</option>
            <option value="pending">بانتظار الصرف</option>
            <option value="approved">معتمد</option>
          </select>
        </div>
      </div>

      {/* Cost Items Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">بند التكلفة والمصروف</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">المورد / المقاول</th>
                <th className="p-4">المبلغ الفعلي</th>
                <th className="p-4">الفاتورة</th>
                <th className="p-4">تكامل دفترة</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredCosts.map((cost) => (
                <tr key={cost.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-white">{cost.description}</p>
                    <span className="text-[10px] text-slate-400">{cost.phaseName}</span>
                  </td>
                  <td className="p-4">
                    {getCategoryBadge(cost.category)}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                    {cost.supplierName || '—'}
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {cost.actualAmount.toLocaleString()} ر.س
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {cost.invoiceNumber || '—'}
                  </td>
                  <td className="p-4">
                    {cost.defteraSynced ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        ✓ متزامن ({cost.defteraInvoiceId || 'DEF'})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        غير مزامن
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {cost.status === 'paid' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        تم الصرف
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        معلق للصرف
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {cost.status !== 'paid' && (
                        <button
                          onClick={() => approveCost(cost.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                          title="اعتماد وصرف الفاتورة ومزامنتها مع دفترة"
                        >
                          <Check className="w-3 h-3" />
                          <span>اعتماد</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteCost(cost.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-md transition"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Cost Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">تسجيل بند تكلفة / فاتورة جديدة</h3>
            
            <form onSubmit={handleAddCostSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">وصف البند / الفاتورة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دفعة حديد سابك تسليح السقف"
                  value={newCostData.description}
                  onChange={(e) => setNewCostData({ ...newCostData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">التصنيف المحاسبي</label>
                  <select
                    value={newCostData.category}
                    onChange={(e) => setNewCostData({ ...newCostData, category: e.target.value as CostCategory })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="material">مواد وخامات إنشائية</option>
                    <option value="labor">عمالة ومقاول رئيسي</option>
                    <option value="equipment">معدات وتكييف</option>
                    <option value="consulting">استشارات وإشراف</option>
                    <option value="overhead">إدارية وتراخيص</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المرحلة الهندسية</label>
                  <select
                    value={newCostData.phaseId}
                    onChange={(e) => setNewCostData({ ...newCostData, phaseId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white cursor-pointer"
                  >
                    {projectPhases.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المبلغ الفعلي (ر.س) *</label>
                  <input
                    type="number"
                    required
                    value={newCostData.actualAmount}
                    onChange={(e) => setNewCostData({ ...newCostData, actualAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الفاتورة الضريبية</label>
                  <input
                    type="text"
                    value={newCostData.invoiceNumber}
                    onChange={(e) => setNewCostData({ ...newCostData, invoiceNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المورد / المقاول</label>
                  <select
                    value={newCostData.supplierId}
                    onChange={(e) => setNewCostData({ ...newCostData, supplierId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white cursor-pointer"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={newCostData.dueDate}
                    onChange={(e) => setNewCostData({ ...newCostData, dueDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700"
                >
                  حفظ الفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
