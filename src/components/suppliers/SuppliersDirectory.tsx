import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Search, 
  Plus, 
  DollarSign, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Truck
} from 'lucide-react';

export const SuppliersDirectory: React.FC = () => {
  const { suppliers, addSupplier, costs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    category: 'مواد بناء وحديد',
    contactPerson: '',
    phone: '+966 5',
    email: '',
    rating: 4.8,
    commercialRegister: '1010' + Math.floor(Math.random() * 900000 + 100000),
    taxNumber: '300' + Math.floor(Math.random() * 900000000000 + 100000000000) + '3',
    address: 'الرياض، المملكة العربية السعودية'
  });

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || s.category.includes(categoryFilter);
    return matchesSearch && matchesCat;
  });

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) return;

    addSupplier({
      ...newSupplier,
      totalInvoiced: 0,
      activeProjectsCount: 1,
      paymentTerms: '30 يوماً من تاريخ اعتماد مستخلص التوريد',
      bankDetails: {
        bankName: 'مصرف الراجحي',
        iban: 'SA4480000' + Math.floor(Math.random() * 9000000000000000 + 1000000000000000),
        accountName: newSupplier.name
      }
    });

    setShowAddModal(false);
    setNewSupplier({
      name: '',
      category: 'مواد بناء وحديد',
      contactPerson: '',
      phone: '+966 5',
      email: '',
      rating: 4.8,
      commercialRegister: '1010' + Math.floor(Math.random() * 900000 + 100000),
      taxNumber: '300' + Math.floor(Math.random() * 900000000000 + 100000000000) + '3',
      address: 'الرياض، المملكة العربية السعودية'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>دليل الموردين، مقاولي الباطن وشركاء التنفيذ ({suppliers.length})</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            إدارة سجل الموردين المعتمدين، السجلات التجارية، الحسابات البنكية والتقييمات الفنية
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مورد / مقاول جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث باسم المورد، المسؤول، أو نوع التوريد..."
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
            <option value="all">جميع التخصصات</option>
            <option value="حديد">حديد وتسليح</option>
            <option value="خرسانة">خرسانة جاهزة</option>
            <option value="تشطيبات">تشطيبات ورخام</option>
            <option value="كهرباء">كهرباء وأنظمة ذكية</option>
          </select>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => {
          // Calculate supplier costs
          const supplierCosts = costs.filter(c => c.supplierId === supplier.id);
          const totalPaid = supplierCosts.reduce((acc, c) => acc + (c.actualAmount || 0), 0);

          return (
            <div
              key={supplier.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{supplier.name}</h3>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5 block">
                      {supplier.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg text-xs font-bold border border-amber-200 dark:border-amber-900">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{supplier.rating}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <span className="text-slate-400">المسؤول:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{supplier.contactPerson}</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono" dir="ltr">{supplier.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{supplier.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{supplier.address}</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">السجل التجاري:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{supplier.commercialRegister}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">إجمالي المعاملات:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {(totalPaid || supplier.totalInvoiced || 140000).toLocaleString()} ر.س
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">شروط السداد: {supplier.paymentTerms}</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>معتمد</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">إضافة مورد / مقاول معتمد جديد</h3>
            
            <form onSubmit={handleAddSupplierSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المورد / الشركة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة الجزيرة لدهانات الديكور"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">التخصص</label>
                  <input
                    type="text"
                    required
                    value={newSupplier.category}
                    onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الشخص المسؤول</label>
                  <input
                    type="text"
                    required
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
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
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700"
                >
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
