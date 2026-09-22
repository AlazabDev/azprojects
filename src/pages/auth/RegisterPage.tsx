import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Building2, Lock, Mail, User, Phone, Briefcase, Award, ArrowLeft, ArrowRight, Sun, Moon } from 'lucide-react';
import { UserRole } from '../../types';

interface RegisterPageProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register, isLoading, error } = useAuthContext();
  const { theme, toggleTheme, language, setLanguage, t, dir, isRtl } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('architect');
  const [companyName, setCompanyName] = useState('مؤسسة العزب للمقاولات المعمارية');
  const [licenseNumber, setLicenseNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register({
      name,
      email,
      phone,
      password,
      role,
      companyName,
      licenseNumber,
    });
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-between bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-200" 
      dir={dir}
    >
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />
      
      {/* Ambient Blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#030957]/5 dark:bg-[#030957]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#FFB900]/10 dark:bg-[#FFB900]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Control Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#030957] flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-4 h-4 text-[#FFB900]" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-black text-[#030957] dark:text-white">AzProjects</span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">مؤسسة العزب للمقاولات</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-2xs text-xs font-bold">
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                language === 'ar' 
                  ? 'bg-[#030957] text-white shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>عربي</span>
              {language === 'ar' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFB900]" />}
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                language === 'en' 
                  ? 'bg-[#030957] text-white shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>EN</span>
              {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFB900]" />}
            </button>
          </div>

          {/* Theme Toggle (Light Primary) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-xs font-bold transition cursor-pointer"
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-4 h-4 text-[#FFB900]" />
                <span className="hidden sm:inline">نهاري</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-300" />
                <span className="hidden sm:inline">ليلي</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Register Form Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-300/30 dark:shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#030957] text-white mb-2 shadow-lg shadow-[#030957]/20 ring-4 ring-[#030957]/10">
              <Building2 className="w-6 h-6 text-[#FFB900]" />
            </div>
            <h1 className="text-xl font-bold text-[#030957] dark:text-white">
              {isRtl ? 'انضمام مهندس جديد لمنظومة AzProjects' : 'New Engineer Registration - AzProjects'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isRtl ? 'سجل حسابك للوصول إلى لوحات المشاريع وإدارات التنفيذ' : 'Register to access project boards & engineering management'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isRtl ? 'م. محمد علي' : 'Eng. Name'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#030957] dark:focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'الدور الهندسي / الصلاحية' : 'Engineering Role'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#030957] dark:focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="architect">مهندس معماري (Architect)</option>
                  <option value="civil_engineer">مهندس إنشائي / مدني (Civil)</option>
                  <option value="project_manager">مدير مشروع (PM)</option>
                  <option value="contractor">مقاول رئيسي / فرعي (Contractor)</option>
                  <option value="consultant">استشاري هندسي (Consultant)</option>
                  <option value="observer">مراقب ميداني (Inspector)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="architect@alazab.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#030957] dark:focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'رقم الجوال (واتساب)' : 'Phone Number (WhatsApp)'}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+96650..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#030957] dark:focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'المؤسسة / الشركة' : 'Company / Firm'}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#030957] dark:focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'رقم الترخيص / الاعتماد' : 'License / SCE Number'}
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="SCE-88910"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#030957] dark:focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'كلمة المرور' : 'Password'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#030957] dark:focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#030957] hover:bg-[#07137a] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-[#030957]/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-3 ring-1 ring-[#030957]/40 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRtl ? 'إنشاء الحساب والبدء' : 'Create Account & Start'}</span>
                  {isRtl ? (
                    <ArrowLeft className="w-4 h-4 text-[#FFB900] group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-[#FFB900] group-hover:translate-x-1 transition-transform" />
                  )}
                </>
              )}
            </button>
          </form>

          {onSwitchToLogin && (
            <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
              <span>{isRtl ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}</span>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#030957] dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                {isRtl ? 'تسجيل الدخول' : 'Sign in'}
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 w-full text-center py-3 text-[11px] text-slate-400 font-medium">
        AzProjects v2.5 • مؤسسة العزب لإدارة المشاريع والمقاولات المعمارية
      </footer>
    </div>
  );
};
