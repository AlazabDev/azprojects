import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  ShieldCheck, 
  Key, 
  Database, 
  Globe, 
  Moon, 
  Sun, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  Sparkles,
  Layers,
  Building2,
  RefreshCw
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    activeRole, 
    setActiveRole, 
    currentUser, 
    resetToInitialData, 
    syncWithDaftra, 
    syncWithMagicPlan 
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [apiKeyDaftra, setApiKeyDaftra] = useState('daftra_live_79a2410f99b1c');
  const [apiKeyMagicPlan, setApiKeyMagicPlan] = useState('mp_cloud_v2_810984920');
  const [apiKeyGemini, setApiKeyGemini] = useState('gemini_2.5_flash_configured');

  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportAllData = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      app: 'AzProjects Architectural Management System',
      data: localStorage
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azprojects_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>إعدادات النظام، التخصيص والربط التقني (Settings & Integrations)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          إدارة إعدادات المظهر، مفاتيح الـ API للتكاملات الخارجية، النسخ الاحتياطي والصلاحيات
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>تم حفظ الإعدادات ومفاتيح الربط بنجاح!</span>
        </div>
      )}

      {/* 1. Theme & Regional Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <span>التفضيلات والمظهر العام (Localization & Theme)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">الوضع الليلي / النهاري</span>
              <span className="text-[11px] text-slate-400">التبديل بين الواجهة الداكنة والفاتحة</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:scale-105 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">العملة والوحدات الهندسية</span>
              <span className="text-[11px] text-slate-400">الريال السعودي (SAR) • المتر المربع (م²)</span>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold rounded-lg">
              SAR / م²
            </span>
          </div>
        </div>
      </div>

      {/* 2. Active Role Simulation (RBAC) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>مصفوفة الصلاحيات وتغيير الدور (RBAC Simulator)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          اختر الدور الحالي لتجربة المنظومة من منظور مالك المشروع، المهندس المعماري، أو المقاول العام:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {[
            { id: 'owner', name: 'مالك المشروع (Owner)', desc: 'رؤية مالية، نسب الإنجاز، واعتماد الدفعات' },
            { id: 'architect', name: 'المعماري والاستشاري', desc: 'إدارة المخططات، فحص الجودة، وتحديث المراحل' },
            { id: 'contractor', name: 'المقاول العام (Contractor)', desc: 'تحديث مهام كانبان، رفع الصور والفواتير' },
            { id: 'supervisor', name: 'مهندس الإشراف الميداني', desc: 'توثيق الموقع، تقارير السلامة والمطابقة' }
          ].map((role) => (
            <div
              key={role.id}
              onClick={() => setActiveRole(role.id as any)}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                activeRole === role.id
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div>
                <span className="font-bold block">{role.name}</span>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{role.desc}</p>
              </div>
              {activeRole === role.id && (
                <span className="text-[10px] font-bold text-blue-600 mt-2 block">✓ الدور النشط حالياً</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. API Integrations Config */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-600" />
          <span>مفاتيح الربط والـ API للتكاملات (API Configuration)</span>
        </h2>

        <form onSubmit={handleSaveIntegrations} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              مفتاح ربط دفترة المحاسبي (Daftra Secret API Key)
            </label>
            <input
              type="text"
              value={apiKeyDaftra}
              onChange={(e) => setApiKeyDaftra(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              مفتاح ربط MagicPlan Cloud API
            </label>
            <input
              type="text"
              value={apiKeyMagicPlan}
              onChange={(e) => setApiKeyMagicPlan(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              محرك الذكاء الاصطناعي (Gemini 2.5 Flash Server-Side)
            </label>
            <input
              type="text"
              disabled
              value="تم التكوين عبر بيئة خادم AI Studio الآمنة بنجاح"
              className="w-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 font-medium"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
          >
            حفظ مفاتيح الربط
          </button>
        </form>
      </div>

      {/* 4. Backup, Export, & Data Reset */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span>النسخ الاحتياطي واستعادة البيانات (Backup & Reset)</span>
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportAllData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية كاملة (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('هل تريد استعادة البيانات النموذجية الأولية للمشاريع والمراحل؟')) {
                resetToInitialData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>استعادة البيانات الأولية للمشروع</span>
          </button>
        </div>
      </div>

    </div>
  );
};
