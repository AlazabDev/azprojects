import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectType } from '../../types';
import { X, Building2, MapPin, DollarSign, Calendar, User, FileText, Check } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject, currentUser } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    location: 'حي الملقا، الرياض، المملكة العربية السعودية',
    lat: 24.8124,
    lng: 46.6128,
    projectType: 'residential' as ProjectType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 2500000,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    areaM2: 650,
    floorsCount: 3,
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=80',
    tags: 'مودرن, سكني فاخر, كود البناء السعودي'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addProject({
      name: formData.name,
      nameEn: formData.nameEn || formData.name,
      description: formData.description || 'مشروع معماري متكامل قيد التطوير والتنفيذ.',
      location: formData.location,
      coordinates: { lat: Number(formData.lat), lng: Number(formData.lng) },
      projectType: formData.projectType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: Number(formData.budget),
      status: 'active',
      clientId: 'usr-cli-' + Date.now(),
      clientName: formData.clientName || 'عميل معتمد',
      clientPhone: formData.clientPhone || '+966 50 000 0000',
      clientEmail: formData.clientEmail || 'client@example.com',
      createdBy: currentUser.id,
      coverImage: formData.coverImage,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      areaM2: Number(formData.areaM2),
      floorsCount: Number(formData.floorsCount),
      contractorName: 'شركة المقاولات المعتمدة',
      leadArchitect: currentUser.name
    });

    onClose();
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=900&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">إنشاء مشروع معماري جديد</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">توليد المراحل الهندسية القياسية والميزانية التخطيطية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[80vh] sm:max-h-[75vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,16px)+1rem)] sm:pb-6">
          
          {/* Project Name & English Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المشروع المعماري (بالعربية) *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: فيلا النرجس المودرن"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الاسم بالإنجليزية (English Name)
              </label>
              <input
                type="text"
                placeholder="e.g. Al-Narjis Modern Luxury Villa"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Classification & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تصنيف المشروع *
              </label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="residential">سكني (فلل / قصور / عمائر)</option>
                <option value="commercial">تجاري ومكتبي (Plaza / Malls)</option>
                <option value="governmental">حكومي وثقافي</option>
                <option value="hospitality">فندقي وسياحي</option>
                <option value="industrial">صناعي ومستودعات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الميزانية الإجمالية (ر.س) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="50000"
                  step="10000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المساحة الإجمالية (م²)
              </label>
              <input
                type="number"
                value={formData.areaM2}
                onChange={(e) => setFormData({ ...formData, areaM2: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Location & GPS Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                العنوان وموقع المشروع *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عدد الطوابق
              </label>
              <input
                type="number"
                min="1"
                max="80"
                value={formData.floorsCount}
                onChange={(e) => setFormData({ ...formData, floorsCount: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تاريخ البدء المخطط *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تاريخ التسليم النهائي المتوقع *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>بيانات المالك / العميل</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="اسم المالك / الشركة"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none"
              />
              <input
                type="tel"
                placeholder="رقم الهاتف (+966)"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Description & Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              الوصف المعماري والملاحظات
            </label>
            <textarea
              rows={2}
              placeholder="وصف الفكرة التصميمية، المواد المستخدمة، المتطلبات الخاصة..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none leading-relaxed"
            />
          </div>

          {/* Cover Photo Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              صورة الواجهة / المنظور المعماري الرئيسي
            </label>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {sampleImages.map((imgUrl, i) => (
                <div
                  key={i}
                  onClick={() => setFormData({ ...formData, coverImage: imgUrl })}
                  className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition ${
                    formData.coverImage === imgUrl ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="Sample" className="w-full h-full object-cover" />
                  {formData.coverImage === imgUrl && (
                    <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>تأكيد وإنشاء المشروع</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
