import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Building2, Lock, Mail, ShieldCheck, ArrowLeft, ArrowRight, Eye, EyeOff, Sun, Moon, Globe, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, isLoading, error } = useAuthContext();
  const { theme, toggleTheme, setTheme, language, setLanguage, toggleLanguage, t, dir, isRtl } = useApp();
  
  // Default to the user's email for instant convenience
  const [email, setEmail] = useState('alazab.construction@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ email, password, rememberMe });
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const handleQuickDemo = async () => {
    setEmail('alazab.construction@gmail.com');
    setPassword('alazab2026');
    const success = await login({ email: 'alazab.construction@gmail.com', password: 'password', rememberMe: true });
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-between bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-200" 
      dir={dir}
    >
      {/* Subtle Geometric Dot Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />
      
      {/* Soft Ambient Brand Blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#030957]/5 dark:bg-[#030957]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#FFB900]/10 dark:bg-[#FFB900]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Control Bar: Language & Theme Switchers */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Brand Micro-Badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#030957] flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-4 h-4 text-[#FFB900]" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-black text-[#030957] dark:text-white">AzProjects</span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">مؤسسة العزب للمقاولات</span>
          </div>
        </div>

        {/* Controls: Theme & Language */}
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
              title="اللغة العربية"
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
              title="English"
            >
              <span>EN</span>
              {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFB900]" />}
            </button>
          </div>

          {/* Theme Mode Toggle (Light Primary) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-xs font-bold transition cursor-pointer"
            title={theme === 'light' ? 'التبديل إلى الوضع الليلي' : 'Switch to Light Mode'}
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

      {/* Main Login Card - Centered with high contrast & crisp typography */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-300/30 dark:shadow-2xl">
          
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#030957] text-white mb-3 shadow-lg shadow-[#030957]/20 ring-4 ring-[#030957]/10">
              <Building2 className="w-7 h-7 text-[#FFB900]" />
            </div>
            <h1 className="text-2xl font-black text-[#030957] dark:text-white tracking-tight">AzProjects</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isRtl ? 'منظومة إدارة المشاريع المعمارية والهندسية' : 'Architectural & Engineering Management System'}
            </p>
          </div>

          {/* Error Message if any */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRtl ? 'البريد الإلكتروني المهني' : 'Professional Email'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#030957] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#030957] transition"
                  placeholder="name@alazab.com"
                />
                <Mail className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isRtl ? 'left-3' : 'right-3'}`} />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'كلمة المرور' : 'Password'}
                </label>
                <button 
                  type="button" 
                  className="text-xs font-semibold text-[#030957] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#030957] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#030957] transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer ${isRtl ? 'left-3' : 'right-3'}`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & RLS Secured Badge */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#030957] focus:ring-[#030957] cursor-pointer"
                />
                <span className="font-medium">{isRtl ? 'تذكر هذا الجهاز' : 'Remember this device'}</span>
              </label>

              <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-[#030957] dark:text-blue-400" />
                <span>اتصال آمن RLS</span>
              </span>
            </div>

            {/* Primary Submit Button - Brand Royal Navy #030957 + Golden Yellow #FFB900 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#030957] hover:bg-[#07137a] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-[#030957]/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-3 ring-1 ring-[#030957]/40 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRtl ? 'تسجيل الدخول للمنظومة' : 'Sign In to Platform'}</span>
                  {isRtl ? (
                    <ArrowLeft className="w-4 h-4 text-[#FFB900] group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-[#FFB900] group-hover:translate-x-1 transition-transform" />
                  )}
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Access Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 whitespace-nowrap absolute">
              {isRtl ? 'أو الوصول المباشر' : 'or quick access'}
            </span>
          </div>

          {/* Quick Demo Access Button */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB900] group-hover:scale-125 transition-transform" />
            <span>{isRtl ? 'الدخول التجريبي المباشر (م. العزب)' : 'Quick Demo Access (Eng. Al-Azab)'}</span>
          </button>

          {/* Switch to Register link */}
          {onSwitchToRegister && (
            <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
              <span>{isRtl ? 'ليس لديك حساب بعد؟ ' : "Don't have an account? "}</span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[#030957] dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                {isRtl ? 'إنشاء حساب جديد' : 'Create new account'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 w-full text-center py-3 text-[11px] text-slate-400 font-medium">
        AzProjects v2.5 • مؤسسة العزب لإدارة المشاريع والمقاولات المعمارية
      </footer>
    </div>
  );
};
