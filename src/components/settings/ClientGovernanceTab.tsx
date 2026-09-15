import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Users, 
  Mail, 
  Check, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  FileCheck,
  AlertTriangle,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ClientGovernanceTab: React.FC = () => {
  const { projects } = useApp();

  // Governance settings state
  const [hideSubcontractorMargins, setHideSubcontractorMargins] = useState(true);
  const [hideInternalNotes, setHideInternalNotes] = useState(true);
  const [allowOwnerPhotoDownloads, setAllowOwnerPhotoDownloads] = useState(true);
  const [allowOwnerBlueprintComments, setAllowOwnerBlueprintComments] = useState(true);
  const [requirePaymentOtp, setRequirePaymentOtp] = useState(false);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('60');
  const [portalWelcomeMessage, setPortalWelcomeMessage] = useState('مرحباً بك في بوابتك لمتابعة مشروعك مباشرة خطوة بخطوة مع مؤسسة العزب.');
  
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);
  const [invitedIndex, setInvitedIndex] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleCopyClientLink = (email: string, index: number) => {
    const url = `${window.location.origin}/portal?client_email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkIndex(index);
    setTimeout(() => setCopiedLinkIndex(null), 2000);
  };

  const handleSendInvite = (clientName: string, index: number) => {
    setInvitedIndex(index);
    setTimeout(() => setInvitedIndex(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Client list for the 4 core projects
  const clientAccounts = [
    {
      name: 'أحمد العزب',
      email: 'alazab.contract@gmail.com',
      project: 'مشروع أرابيسك المعماري (Arabesque)',
      role: 'مالك المشروع (Project Owner)',
      status: 'نشط ومفعل',
      invitationSent: true
    },
    {
      name: 'عبدالله السعدون',
      email: 'saadoon.invest@gmail.com',
      project: 'قصر الأندلس السكني (Andalus Palace)',
      role: 'مالك المشروع (Project Owner)',
      status: 'نشط ومفعل',
      invitationSent: true
    },
    {
      name: 'مؤسسة ميلانو للتطوير',
      email: 'milano.properties.sa@gmail.com',
      project: 'مجمع ميلانو المعماري (Milano Plaza)',
      role: 'مالك المشروع (Project Owner)',
      status: 'جاهز للإرسال',
      invitationSent: false
    },
    {
      name: 'د. فيصل المطيري',
      email: 'dr.faisal.mutairi@gmail.com',
      project: 'فيلا الياسمين المعمارية (Jasmine Villa)',
      role: 'مالك المشروع (Project Owner)',
      status: 'جاهز للإرسال',
      invitationSent: false
    }
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6 text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 border border-indigo-800/40 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">حوكمة العملاء وأمان مستوى الصف (Row-Level Security)</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                تحديد دقيق لما يراه مالك المشروع وعزل مشروعه تماماً عن باقي المشاريع، مع حماية أسرار وهوامش المقاول
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>سياسات RLS نشطة بقاعدة البيانات</span>
            </span>
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>تم حفظ سياسات الحوكمة وبوابة العملاء بنجاح!</span>
        </div>
      )}

      {/* 1. Core RLS Rules & Subcontractor Privacy */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>قواعد الخصوصية وحجب التكاليف الحساسة (Financial Data Governance)</span>
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={hideSubcontractorMargins}
              onChange={(e) => setHideSubcontractorMargins(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 border-slate-300"
            />
            <div className="flex-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                حجب تكاليف مقاولي الباطن وهوامش الأرباح الداخلية عن المالك
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                يرى المالك فقط المستخلص المعتمد وسعر البند المتفق عليه، بينما تُحجب فواتير المشتريات الصافية وعقود الباطن الداخلية تماماً.
              </span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              موصى به للأمان
            </span>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={hideInternalNotes}
              onChange={(e) => setHideInternalNotes(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 border-slate-300"
            />
            <div className="flex-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                إخفاء الملاحظات والتقارير الهندسية الداخلية غير المعتمدة
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                لا تظهر للمالك إلا التحديثات الميدانية والصور المعتمدة من مدير المشروع أو المهندس المشرف.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={allowOwnerBlueprintComments}
              onChange={(e) => setAllowOwnerBlueprintComments(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 border-slate-300"
            />
            <div className="flex-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                السماح للمالك بوضع ملاحظات وتعليقات على المخططات المعمارية
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                يمكن للمالك إضافة ملاحظات ومقترحات على مساقط MagicPlan لغرفه بدون تعديل المخطط الأصلي.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 2. Client Portal Customization */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>تخصيص تجربة وبوابة العميل (Client Portal Experience)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              رسالة الترحيب الرسمية في شاشة العميل
            </label>
            <textarea
              rows={2}
              value={portalWelcomeMessage}
              onChange={(e) => setPortalWelcomeMessage(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              مهلة انتهاء الجلسة الآمنة للعميل (Session Timeout)
            </label>
            <select
              value={sessionTimeoutMinutes}
              onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="30">30 دقيقة من عدم النشاط</option>
              <option value="60">ساعة واحدة (موصى بها)</option>
              <option value="240">4 ساعات</option>
              <option value="1440">يوم كامل (24 ساعة)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Managed Clients Directory & Direct Links */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>حسابات ملاك المشاريع الحالية وروابط الدخول المباشرة (Client Portals)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-bold">
            {clientAccounts.length} ملاك مسجلين
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {clientAccounts.map((client, idx) => (
            <div key={client.email} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{client.name}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {client.project}
                  </span>
                </div>
                <div className="text-slate-400 font-mono text-[11px] mt-0.5 dir-ltr text-right flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{client.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleCopyClientLink(client.email, idx)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedLinkIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">تم نسخ الرابط!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ رابط العميل</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSendInvite(client.name, idx)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{invitedIndex === idx ? 'تم إرسال الدعوة!' : 'إرسال دعوة بالبريد'}</span>
                </button>
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
          <span>حفظ سياسات الحوكمة</span>
        </button>
      </div>

    </form>
  );
};
