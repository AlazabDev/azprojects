import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Upload, 
  Award, 
  Landmark,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CompanyProfileTab: React.FC = () => {
  const { currentUser, updateCurrentUser } = useApp();

  const [companyName, setCompanyName] = useState(currentUser.companyName || 'مؤسسة العزب للمقاولات العامة والتصميم المعماري');
  const [companyNameEn, setCompanyNameEn] = useState('Al-Azab General Contracting & Architecture');
  const [crNumber, setCrNumber] = useState('1010784920');
  const [vatNumber, setVatNumber] = useState('310294857200003');
  const [sceLicense, setSceLicense] = useState(currentUser.licenseNumber || 'SCE-ENG-2024-88419');
  const [contractorClassification, setContractorClassification] = useState('الدرجة الأولى - مباني وإنشاءات متكاملة');
  const [nationalAddress, setNationalAddress] = useState('طريق الملك فهد، حي النرجس، المبنى 7412، الرياض 13324، المملكة العربية السعودية');
  const [officialEmail, setOfficialEmail] = useState(currentUser.email || 'alazab.construction@gmail.com');
  const [officialPhone, setOfficialPhone] = useState(currentUser.phone || '+966500000001');
  const [officialWhatsapp, setOfficialWhatsapp] = useState('+966551234567');
  const [bankName, setBankName] = useState('مصرف الراجحي (Al Rajhi Bank)');
  const [iban, setIban] = useState('SA0380000123456789012345');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      companyName,
      licenseNumber: sceLicense,
      email: officialEmail,
      phone: officialPhone
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 border border-indigo-800/40 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">الهوية والملف التعريفي للمؤسسة (Company Profile)</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                البيانات الرسمية المعتمدة لطباعة العقود، الفواتير الضريبية (ZATCA)، وشهادات تسليم المشاريع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>معتمد بهيئة المهندسين SCE</span>
            </span>
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>تم حفظ وتحديث بيانات المؤسسة الرسمية بنجاح!</span>
        </div>
      )}

      {/* 1. Legal & Regulatory Credentials */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>البيانات النظامية والتراخيص (Saudi Legal & Tax Data)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم المؤسسة بالعربية (الرسمي في السجل)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم المؤسسة بالإنجليزية (Official English Name)
            </label>
            <input
              type="text"
              value={companyNameEn}
              onChange={(e) => setCompanyNameEn(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              رقم السجل التجاري (Commercial Registration)
            </label>
            <input
              type="text"
              value={crNumber}
              onChange={(e) => setCrNumber(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              الرقم الضريبي للمنشأة (ZATCA VAT ID)
            </label>
            <input
              type="text"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              رقم ترخيص الهيئة السعودية للمهندسين (SCE Accreditation)
            </label>
            <input
              type="text"
              value={sceLicense}
              onChange={(e) => setSceLicense(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              تصنيف المقاولين المعتمد (Contractor Classification)
            </label>
            <input
              type="text"
              value={contractorClassification}
              onChange={(e) => setContractorClassification(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. National Address & Contact Information */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>العنوان الوطني ومعلومات التواصل الرسمية</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              العنوان الوطني المسجل (Saudi National Address)
            </label>
            <input
              type="text"
              value={nationalAddress}
              onChange={(e) => setNationalAddress(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>البريد الإلكتروني الرسمي للمراسلات</span>
            </label>
            <input
              type="email"
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>رقم الهاتف المعتمد</span>
            </label>
            <input
              type="text"
              value={officialPhone}
              onChange={(e) => setOfficialPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right"
            />
          </div>
        </div>
      </div>

      {/* 3. Banking & Escrow Accounts for Invoicing */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Landmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>الحساب البنكي المعتمد للتحويلات والدفعات المستحقة</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم البنك المعتمد
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              رقم الآيبان البنكي (IBAN)
            </label>
            <input
              type="text"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right"
            />
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          * يتم تضمين هذه البيانات تلقائياً في ترويسة خطابات التسليم وفواتير الدفعات.
        </p>

        <button
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>حفظ بيانات المؤسسة</span>
        </button>
      </div>

    </form>
  );
};
