import React, { useState } from 'react';
import { 
  Sliders, 
  Sun, 
  Moon, 
  Globe, 
  ShieldCheck, 
  Check, 
  CheckCircle2, 
  UserCheck, 
  Compass, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const PreferencesRbacTab: React.FC = () => {
  const { theme, toggleTheme, activeRole, setActiveRole } = useApp();

  const [currency, setCurrency] = useState('SAR');
  const [currencySymbol, setCurrencySymbol] = useState('ر.س');
  const [measurementUnit, setMeasurementUnit] = useState('m2');
  const [dateFormat, setDateFormat] = useState('hijri_gregorian');
  const [isSaved, setIsSaved] = useState(false);

  const rolesList: { id: UserRole; name: string; nameEn: string; desc: string; permissions: string[] }[] = [
    {
      id: 'owner',
      name: 'مالك المشروع (Project Owner)',
      nameEn: 'Owner',
      desc: 'بوابة المالك الخاصة للاطلاع على نسب الإنجاز والمستخلصات والمعاينة واعتماد الدفعات دون تفاصيل وهوامش الباطن.',
      permissions: ['مشاهدة مشروعه فقط', 'اعتماد الدفعات', 'تنزيل التقارير', 'ملاحظات المخططات']
    },
    {
      id: 'architect',
      name: 'المعماري والاستشاري المشرف (Architect / Consultant)',
      nameEn: 'Architect',
      desc: 'إدارة المخططات المعمارية MagicPlan، مراجعة مطابقة كود البناء السعودي، واعتماد مراحل التسليم.',
      permissions: ['كافة المشروعات', 'مخططات MagicPlan', 'فحص SBC', 'اعتماد الجودة']
    },
    {
      id: 'contractor',
      name: 'المقاول العام ومدير المشاريع (General Contractor)',
      nameEn: 'Contractor',
      desc: 'إدارة وتوجيه فرق العمل، جدولة مهام كانبان، مزامنة فواتير دفترة وأوامر الشغل، والتحكم في تكاليف الباطن.',
      permissions: ['صلاحيات كاملة', 'تزامن دفترة ERP', 'إدارة الميزانية', 'تكاليف الباطن']
    },
    {
      id: 'civil_engineer',
      name: 'مهندس الإشراف الميداني (Site Engineer / Inspector)',
      nameEn: 'Site Engineer',
      desc: 'توثيق الموقع بالصور اليومية، مطابقة أبعاد وتفاصيل التنفيذ، وتسجيل نسب الإنجاز الميدانية فورياً.',
      permissions: ['رفع الصور الميدانية', 'تحديث نسبة المهام', 'تقارير السلامة', 'تنبيهات الموقع']
    }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 border border-indigo-800/40 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">التفضيلات ومصفوفة الصلاحيات (Preferences & RBAC Simulator)</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                تخصيص المظهر والوحدات الهندسية، ومحاكاة تجربة الاستخدام من منظور المالك أو المهندس
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>الدور الحالي: {rolesList.find(r => r.id === activeRole)?.nameEn}</span>
            </span>
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>تم حفظ التفضيلات وتحديث الدور النشط بنجاح!</span>
        </div>
      )}

      {/* 1. Theme & Localization Options */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>المظهر والوحدات الهندسية (Theme & Engineering Units)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          {/* Theme Toggle */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">مظهر التطبيق</span>
              <span className="text-[11px] text-slate-400">
                {theme === 'dark' ? 'الوضع الليلي (Dark Mode)' : 'الوضع النهاري (Light Mode)'}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:scale-105 transition shadow-2xs border border-slate-200 dark:border-slate-600 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          {/* Currency */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block font-bold text-slate-900 dark:text-white mb-1">
              العملة الرسمية
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-medium outline-none"
            >
              <option value="SAR">الريال السعودي (SAR - ر.س)</option>
              <option value="AED">الدرهم الإماراتي (AED)</option>
              <option value="USD">الدولار الأمريكي (USD - $)</option>
            </select>
          </div>

          {/* Measurement Units */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block font-bold text-slate-900 dark:text-white mb-1">
              وحدات القياس الهندسية
            </label>
            <select
              value={measurementUnit}
              onChange={(e) => setMeasurementUnit(e.target.value)}
              className="w-full bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-medium outline-none"
            >
              <option value="m2">المتر المربع (م²) والمسافات بالأمتار</option>
              <option value="sqft">القدم المربع (Sq Ft)</option>
            </select>
          </div>

        </div>
      </div>

      {/* 2. RBAC Simulation Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>محاكي الأدوار والصلاحيات (RBAC Live Simulator)</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            اختر دوراً لمعاينة واجهة النظام من وجهة نظر هذا المستخدم
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {rolesList.map((role) => (
            <div
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                activeRole === role.id
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 shadow-xs ring-1 ring-indigo-500'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{role.name}</span>
                  {activeRole === role.id && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>نشط الآن</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {role.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                {role.permissions.map((perm, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    ✓ {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Action */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>حفظ التفضيلات</span>
        </button>
      </div>

    </form>
  );
};
