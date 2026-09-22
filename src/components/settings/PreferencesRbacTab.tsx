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
  const { 
    theme, 
    toggleTheme, 
    setTheme,
    language, 
    setLanguage, 
    toggleLanguage, 
    activeRole, 
    setActiveRole,
    t,
    dir,
    isRtl
  } = useApp();

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
    <form onSubmit={handleSave} className="space-y-6 text-right" dir={dir}>
      
      {/* Header Banner - Brand Royal Navy #030957 */}
      <div className="bg-[#030957] rounded-2xl p-5 border border-[#030957]/80 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#FFB900] shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">التفضيلات ومصفوفة الصلاحيات (Preferences & RBAC Simulator)</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                تخصيص المظهر ثنائي اللغة (العربي الأساسي)، والوضع النهاري/الليلي (النهاري الأساسي)، والوحدات الهندسية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FFB900]" />
              <UserCheck className="w-3.5 h-3.5 text-[#FFB900]" />
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

      {/* 1. Theme, Language & Localization Options */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#030957] dark:text-blue-400" />
          <span>{t('language')} والمظهر والوحدات الهندسية (Localization, Theme & Units)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Language Selector (Arabic Primary) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">{t('language')} (Primary Language)</span>
              <span className="text-[11px] text-slate-400">
                {language === 'ar' ? 'العربية (اللغة الافتراضية)' : 'English (Bilingual Mode)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                  language === 'ar'
                    ? 'bg-[#030957] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <span>العربية</span>
                {language === 'ar' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFB900]" />}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                  language === 'en'
                    ? 'bg-[#030957] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <span>English</span>
                {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFB900]" />}
              </button>
            </div>
          </div>

          {/* Theme Mode Toggle (Light Primary) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">{t('theme')} (Light Primary)</span>
              <span className="text-[11px] text-slate-400">
                {theme === 'dark' ? 'الوضع الليلي (Dark Mode)' : 'الوضع النهاري (الافتراضي)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-[#030957] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-[#FFB900]' : 'text-amber-500'}`} />
                <span>{t('lightMode')}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-[#030957] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('darkMode')}</span>
              </button>
            </div>
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

        {/* Brand Palette Summary Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">ألوان الهوية المعتمدة:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#030957] text-white text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>الأساسي #030957 (كحلي ملكي)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 dark:bg-slate-800 text-slate-100 text-[11px] font-bold border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#FFB900]" />
              <span>التمييز #FFB900 (أصفر ذهبي دقيق)</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            اللون الأصفر الذهبي مخصص للمؤشرات الدقيقة والنقاط لتجنب إجهاد العين
          </span>
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
                  ? 'bg-slate-50 dark:bg-slate-800/90 border-[#030957] dark:border-blue-500 shadow-xs ring-1.5 ring-[#030957] dark:ring-blue-500'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{role.name}</span>
                  {activeRole === role.id && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB900]" />
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
          className="px-6 py-2.5 bg-[#030957] hover:bg-[#07137a] text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-2 group ring-1 ring-[#030957]/30"
        >
          <Check className="w-4 h-4 text-[#FFB900] group-hover:scale-110 transition-transform" />
          <span>حفظ التفضيلات (Save Preferences)</span>
        </button>
      </div>

    </form>
  );
};
