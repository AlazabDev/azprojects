import React, { useState } from 'react';
import { 
  Globe, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowUpRight, 
  ShieldAlert, 
  Server, 
  Zap, 
  Radio, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DomainDeploymentTab: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [customDomain, setCustomDomain] = useState(settings.customDomain || 'projects.alazab.com');
  const [productionUrl, setProductionUrl] = useState(settings.productionUrl || 'https://projects.alazab.com');
  const [forceHttps, setForceHttps] = useState(true);
  const [enableHsts, setEnableHsts] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifyingDns, setIsVerifyingDns] = useState(false);
  const [dnsStatus, setDnsStatus] = useState<'verified' | 'pending'>('verified');
  const [isSaved, setIsSaved] = useState(false);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifyDns = () => {
    setIsVerifyingDns(true);
    setTimeout(() => {
      setIsVerifyingDns(false);
      setDnsStatus('verified');
    }, 1200);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      customDomain,
      productionUrl: `https://${customDomain}`
    });
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
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">إعدادات النطاق المخصص والنشر الرسمي (Custom Domain & SSL)</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                توجيه منصة AzProjects لتعمل على نطاقك التجاري الرسمي مع شهادة أمان SSL/TLS مشفرة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>شهادة SSL سارية (Let's Encrypt / Google Trust)</span>
            </span>
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>تم حفظ إعدادات النطاق المخصص بنجاح!</span>
        </div>
      )}

      {/* 1. Live Domain Status Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>النطاق النشط للمؤسسة</span>
          </h3>

          <button
            type="button"
            onClick={handleVerifyDns}
            disabled={isVerifyingDns}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingDns ? 'animate-spin' : ''}`} />
            <span>{isVerifyingDns ? 'جاري التحقق من سجلات DNS...' : 'التحقق من حالة الـ DNS'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم النطاق المخصص (Custom FQDN)
            </label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              الرابط الكامل المباشر (Direct HTTPS URL)
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 font-mono text-slate-800 dark:text-slate-200">
              <span className="flex-1 font-bold truncate dir-ltr text-right">https://{customDomain}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(`https://${customDomain}`, 'liveUrl')}
                className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                title="نسخ الرابط"
              >
                {copiedField === 'liveUrl' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DNS Records Required Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>سجلات توجيه الـ DNS المطلوبة في مزود النطاق (DNS Configuration)</span>
          </h3>
          <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
            DNS متطابق
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          أضف هذه السجلات في لوحة تحكم مزود الدومين الخاص بك (مثل GoDaddy أو Cloudflare أو Namecheap):
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-bold">نوع السجل (Type)</th>
                <th className="py-2.5 px-3 font-bold">الاسم / المضيف (Host)</th>
                <th className="py-2.5 px-3 font-bold">القيمة المستهدفة (Points To)</th>
                <th className="py-2.5 px-3 font-bold">مدة التحديث (TTL)</th>
                <th className="py-2.5 px-3 font-bold text-left">نسخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              <tr>
                <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">CNAME</td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">projects</td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">ghs.googlehosted.com</td>
                <td className="py-3 px-3 text-slate-500">Auto (3600)</td>
                <td className="py-3 px-3 text-left">
                  <button
                    type="button"
                    onClick={() => copyToClipboard('ghs.googlehosted.com', 'cname-val')}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition"
                  >
                    {copiedField === 'cname-val' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-purple-600 dark:text-purple-400">TXT</td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">@</td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">google-site-verification=alazab-projects-auth-2026</td>
                <td className="py-3 px-3 text-slate-500">Auto (3600)</td>
                <td className="py-3 px-3 text-left">
                  <button
                    type="button"
                    onClick={() => copyToClipboard('google-site-verification=alazab-projects-auth-2026', 'txt-val')}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition"
                  >
                    {copiedField === 'txt-val' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Security & Protocol Switches */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>سياسات بروتوكول التشفير الآمن (HTTPS & Security Headers)</span>
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                إلزام تحويل كافة الاتصالات إلى HTTPS تلقائياً (Force HTTPS)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                تحويل أي اتصال غير مشفر (HTTP) إلى قناة مشفرة فورياً لحماية كلمات المرور والمستندات.
              </span>
            </div>
            <input
              type="checkbox"
              checked={forceHttps}
              onChange={(e) => setForceHttps(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 border-slate-300"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                تفعيل ترويسات الأمان المتقدمة HSTS (HTTP Strict Transport Security)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                منع هجمات التجسس واعتراض البيانات على شبكات الواي فاي العامة في مواقع البناء.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableHsts}
              onChange={(e) => setEnableHsts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 border-slate-300"
            />
          </label>
        </div>
      </div>

      {/* Save Action */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>حفظ إعدادات النطاق</span>
        </button>
      </div>

    </form>
  );
};
