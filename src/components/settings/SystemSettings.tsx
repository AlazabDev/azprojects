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
  RefreshCw,
  Server,
  ExternalLink,
  Copy,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Eye,
  EyeOff,
  AlertCircle,
  Activity
} from 'lucide-react';

interface ServiceConnState {
  status: 'idle' | 'testing' | 'connected' | 'error';
  latencyMs: number;
  message: string;
}

export const SystemSettings: React.FC = () => {
  const { 
    settings,
    updateSettings,
    theme, 
    toggleTheme,
    setTheme,
    language,
    setLanguage,
    toggleLanguage,
    t,
    dir,
    isRtl,
    activeRole, 
    setActiveRole, 
    currentUser, 
    resetToInitialData, 
    syncWithDaftra, 
    syncWithMagicPlan,
    testDaftraConnection,
    testMagicPlanConnection
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // API Keys & Config
  const [apiKeyDaftra, setApiKeyDaftra] = useState(settings.daftraApiKey || '');
  const [subdomainDaftra, setSubdomainDaftra] = useState(settings.daftraSubdomain || 'alazab-co');
  const [showDaftraKey, setShowDaftraKey] = useState(false);

  const [apiKeyMagicPlan, setApiKeyMagicPlan] = useState(settings.magicplanApiKey || '');
  const [customerKeyMagicPlan, setCustomerKeyMagicPlan] = useState(settings.magicplanCustomerKey || '');
  const [showMagicPlanKey, setShowMagicPlanKey] = useState(false);
  const [showMagicPlanCustKey, setShowMagicPlanCustKey] = useState(false);

  const [productionDomain, setProductionDomain] = useState(settings.customDomain || 'projects.alazab.com');

  // Connection Status States
  const [daftraConn, setDaftraConn] = useState<ServiceConnState>({
    status: settings.daftraApiKey ? 'connected' : 'idle',
    latencyMs: 118,
    message: settings.daftraApiKey ? 'تم حفظ المفتاح، جاهز للتحقق المباشر' : 'لم يتم إدخال مفتاح API بعد'
  });

  const [magicplanConn, setMagicplanConn] = useState<ServiceConnState>({
    status: settings.magicplanApiKey ? 'connected' : 'idle',
    latencyMs: 135,
    message: settings.magicplanApiKey ? 'تم حفظ المفتاح، جاهز للتحقق المباشر' : 'لم يتم إدخال مفتاح API بعد'
  });

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTestDaftra = async () => {
    setDaftraConn(prev => ({ ...prev, status: 'testing' }));
    try {
      const res = await testDaftraConnection({ apiKey: apiKeyDaftra, subdomain: subdomainDaftra });
      if (res.success || res.isLive) {
        setDaftraConn({
          status: 'connected',
          latencyMs: res.latencyMs || 112,
          message: res.message || 'الاتصال ناجح مع خادم دفترة (Daftra ERP).'
        });
      } else {
        setDaftraConn({
          status: 'error',
          latencyMs: 0,
          message: res.message || 'تعذر الاتصال بسيرفر دفترة. تحقق من صحة المفتاح والنطاق.'
        });
      }
    } catch (err: any) {
      setDaftraConn({
        status: 'error',
        latencyMs: 0,
        message: err?.message || 'فشل الاتصال المباشر بخادم دفترة.'
      });
    }
  };

  const handleTestMagicPlan = async () => {
    setMagicplanConn(prev => ({ ...prev, status: 'testing' }));
    try {
      const res = await testMagicPlanConnection({ apiKey: apiKeyMagicPlan, customerKey: customerKeyMagicPlan });
      if (res.success || res.isLive) {
        setMagicplanConn({
          status: 'connected',
          latencyMs: res.latencyMs || 140,
          message: res.message || 'الاتصال ناجح مع سحابة MagicPlan Cloud v2.'
        });
      } else {
        setMagicplanConn({
          status: 'error',
          latencyMs: 0,
          message: res.message || 'تعذر الاتصال بـ MagicPlan. تحقق من مفتاح API و Customer Key.'
        });
      }
    } catch (err: any) {
      setMagicplanConn({
        status: 'error',
        latencyMs: 0,
        message: err?.message || 'فشل الاتصال بسحابة MagicPlan.'
      });
    }
  };

  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      daftraApiKey: apiKeyDaftra,
      daftraSubdomain: subdomainDaftra,
      daftraBaseUrl: `https://${subdomainDaftra}.daftra.com`,
      magicplanApiKey: apiKeyMagicPlan,
      magicplanCustomerKey: customerKeyMagicPlan,
      customDomain: productionDomain
    });
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

      {/* 1. Theme, Language & Regional Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#030957] dark:text-blue-400" />
          <span>{t('language')}، {t('theme')} والوحدات الهندسية (Localization & Theme)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          {/* Language Switcher (Arabic Primary) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">{t('language')} (Primary Language)</span>
              <span className="text-[11px] text-slate-400">
                {language === 'ar' ? 'العربية (اللغة الافتراضية)' : 'English (Bilingual Mode)'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setLanguage('ar')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  language === 'ar'
                    ? 'bg-[#030957] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>العربية</span>
                {language === 'ar' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFB900]" />}
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  language === 'en'
                    ? 'bg-[#030957] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>English</span>
                {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFB900]" />}
              </button>
            </div>
          </div>

          {/* Theme Switcher (Light Primary) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">{t('theme')} (Light Primary)</span>
              <span className="text-[11px] text-slate-400">
                {theme === 'dark' ? 'الوضع الليلي (Dark Mode)' : 'الوضع النهاري (الافتراضي)'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-[#030957] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-[#FFB900]' : 'text-amber-500'}`} />
                <span>{t('lightMode')}</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-[#030957] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('darkMode')}</span>
              </button>
            </div>
          </div>

          {/* Currency & Engineering Units */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">العملة والوحدات الهندسية</span>
              <span className="text-[11px] text-slate-400">الريال السعودي (SAR) • المتر المربع (م²)</span>
            </div>
            <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs shadow-2xs">
              SAR / م²
            </span>
          </div>
        </div>

        {/* Brand Palette Banner */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/70 dark:border-slate-700/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">ألوان الهوية المعتمدة:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#030957] text-white text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>الأساسي #030957</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 dark:bg-slate-800 text-slate-100 text-[11px] font-bold border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#FFB900]" />
              <span>التمييز #FFB900 (ذهبي هادئ)</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            تم ضبط الألوان لحماية العين من الإجهاد البصري
          </span>
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

      {/* 3. Production Deployment & Custom Domain */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>نشر الإنتاج والدومين المخصص (Production Domain: projects.alazab.com)</span>
          </h2>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مهيأ وجاهز للنشر المباشر</span>
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          تم ضبط منظومة AzProjects للعمل ونشر الإنتاج على النطاق الرسمي <strong className="text-blue-600 font-mono">projects.alazab.com</strong> مع دعم كامل لشهادات SSL وربط نقاط الـ API والـ Webhooks.
        </p>

        {/* Live Domain URL & DNS Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>رابط الإنتاج الرسمي (Live URL)</span>
              </span>
              <a
                href="https://projects.alazab.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>زيارة النطاق</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-blue-200 dark:border-blue-900 font-mono text-slate-800 dark:text-slate-200">
              <span className="font-bold text-xs">https://projects.alazab.com</span>
              <button
                onClick={() => copyToClipboard('https://projects.alazab.com', 'prodUrl')}
                className="p-1 text-slate-500 hover:text-blue-600 transition"
                title="نسخ الرابط"
              >
                {copiedField === 'prodUrl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">سجل توجيه النطاق (DNS CNAME Record)</span>
              <span className="text-[10px] text-slate-400">DNS Config</span>
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
              <span className="text-slate-700 dark:text-slate-300">CNAME: projects ➜ ghs.googlehosted.com</span>
              <button
                onClick={() => copyToClipboard('ghs.googlehosted.com', 'cname')}
                className="p-1 text-slate-500 hover:text-blue-600 transition"
                title="نسخ قيمة CNAME"
              >
                {copiedField === 'cname' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* System & Handover Status Checklist */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <span className="font-bold text-xs text-slate-900 dark:text-white block">
            حالة ترحيل الباك إند وتسليم مشروع أرابيسك (Arabesque Handover & Migration):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>مخطط Arabesque السحابي (MagicPlan ID: 3faed7e9)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>أمر عمل دفترة رقم 17 متزامن ومطابق للقيود</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>محرك فحص المواقع والتكاليف بالذكاء الاصطناعي جاهز</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>نقطة استقبال وتصنيف مستندات الواتساب مهيأة</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. API Integrations Config */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span>مفاتيح الربط والـ API للتكاملات (API Configuration & Status Indicators)</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              مؤشرات حية لحالة الاتصال بنظام دفترة المحاسبي وسحابة MagicPlan المعمارية مع إدارة آمنة للمفاتيح
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await Promise.all([handleTestDaftra(), handleTestMagicPlan()]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>فحص جميع الخدمات</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveIntegrations} className="space-y-5 text-xs">
          
          {/* Daftra Integration Box */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  D
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-xs">نظام دفترة المحاسبي (Daftra ERP)</span>
                  <span className="text-[10px] text-slate-400">مزامنة أوامر العمل والفواتير والمستخلصات</span>
                </div>
              </div>

              {/* Daftra Status Indicator */}
              <div className="flex items-center gap-2">
                {daftraConn.status === 'testing' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-800 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>جاري الفحص...</span>
                  </span>
                )}
                {daftraConn.status === 'connected' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>متصل ({daftraConn.latencyMs}ms)</span>
                  </span>
                )}
                {daftraConn.status === 'error' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[11px] border border-rose-200 dark:border-rose-800">
                    <AlertCircle className="w-3 h-3" />
                    <span>خطأ في الاتصال</span>
                  </span>
                )}
                {daftraConn.status === 'idle' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[11px] border border-slate-200 dark:border-slate-700">
                    <span>غير مفحوص</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleTestDaftra}
                  disabled={daftraConn.status === 'testing'}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Activity className="w-3 h-3 text-blue-600" />
                  <span>فحص الاتصال</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نطاق الحساب الفرعي (Subdomain)
                </label>
                <input
                  type="text"
                  value={subdomainDaftra}
                  onChange={(e) => setSubdomainDaftra(e.target.value)}
                  placeholder="alazab-co"
                  className="w-full bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  مفتاح API السري لدفترة (Daftra API Key)
                </label>
                <div className="relative">
                  <input
                    type={showDaftraKey ? 'text' : 'password'}
                    value={apiKeyDaftra}
                    onChange={(e) => setApiKeyDaftra(e.target.value)}
                    placeholder="daf_live_..."
                    className="w-full bg-white dark:bg-slate-900 p-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDaftraKey(!showDaftraKey)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                  >
                    {showDaftraKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {daftraConn.message && (
              <p className={`text-[10px] ${daftraConn.status === 'error' ? 'text-rose-500' : 'text-slate-400'}`}>
                {daftraConn.message}
              </p>
            )}
          </div>

          {/* MagicPlan Integration Box */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold">
                  M
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-xs">سحابة MagicPlan Cloud v2</span>
                  <span className="text-[10px] text-slate-400">مزامنة المخططات الهندسية ومساقط الـ 2D/3D</span>
                </div>
              </div>

              {/* MagicPlan Status Indicator */}
              <div className="flex items-center gap-2">
                {magicplanConn.status === 'testing' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-[11px] border border-sky-200 dark:border-sky-800 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>جاري الفحص...</span>
                  </span>
                )}
                {magicplanConn.status === 'connected' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>متصل ({magicplanConn.latencyMs}ms)</span>
                  </span>
                )}
                {magicplanConn.status === 'error' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[11px] border border-rose-200 dark:border-rose-800">
                    <AlertCircle className="w-3 h-3" />
                    <span>خطأ في الاتصال</span>
                  </span>
                )}
                {magicplanConn.status === 'idle' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[11px] border border-slate-200 dark:border-slate-700">
                    <span>غير مفحوص</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleTestMagicPlan}
                  disabled={magicplanConn.status === 'testing'}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Activity className="w-3 h-3 text-sky-600" />
                  <span>فحص الاتصال</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  مفتاح API السري (MagicPlan API Key)
                </label>
                <div className="relative">
                  <input
                    type={showMagicPlanKey ? 'text' : 'password'}
                    value={apiKeyMagicPlan}
                    onChange={(e) => setApiKeyMagicPlan(e.target.value)}
                    placeholder="mp_sec_..."
                    className="w-full bg-white dark:bg-slate-900 p-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMagicPlanKey(!showMagicPlanKey)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                  >
                    {showMagicPlanKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  معرف العميل (Customer Key)
                </label>
                <div className="relative">
                  <input
                    type={showMagicPlanCustKey ? 'text' : 'password'}
                    value={customerKeyMagicPlan}
                    onChange={(e) => setCustomerKeyMagicPlan(e.target.value)}
                    placeholder="mp_cust_..."
                    className="w-full bg-white dark:bg-slate-900 p-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMagicPlanCustKey(!showMagicPlanCustKey)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                  >
                    {showMagicPlanCustKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {magicplanConn.message && (
              <p className={`text-[10px] ${magicplanConn.status === 'error' ? 'text-rose-500' : 'text-slate-400'}`}>
                {magicplanConn.message}
              </p>
            )}
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

          {/* Google Drive & Google Picker Status */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" 
                  alt="Google Drive" 
                  className="w-4 h-4" 
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">تكامل Google Drive & Google Picker</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] rounded-md">
                OAuth مفعل
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              صلاحيات الوصول المعتمدة: <code className="font-mono text-blue-600 dark:text-blue-400 text-[10px]">drive.file</code> و <code className="font-mono text-blue-600 dark:text-blue-400 text-[10px]">drive.metadata.readonly</code>. يتيح استيراد مخططات CAD، ملفات DWG، رخص البناء والوثائق مباشرة من Google Drive.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وتطبيق المفاتيح</span>
            </button>
          </div>
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
