import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { Building2, Lock, Mail, ShieldCheck, ArrowLeft, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, isLoading, error } = useAuthContext();
  const [email, setEmail] = useState('alazab.contract@gmail.com');
  const [password, setPassword] = useState('AzProjects@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ email, password, rememberMe });
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const handleQuickDemoLogin = async (demoRole: 'owner' | 'architect' | 'manager') => {
    let demoEmail = 'alazab.contract@gmail.com';
    if (demoRole === 'architect') demoEmail = 'architect@alazab.com';
    if (demoRole === 'manager') demoEmail = 'pm@alazab.com';
    setEmail(demoEmail);
    const success = await login({ email: demoEmail, password: 'demoPassword123' });
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 px-4 py-8 relative overflow-hidden" dir="rtl">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white mb-3 shadow-lg shadow-emerald-500/20">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AzProjects</h1>
          <p className="text-sm text-slate-400 mt-1">منظومة إدارة المشاريع المعمارية والهندسية</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">البريد الإلكتروني المهني</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="name@alazab.com"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">كلمة المرور</label>
              <button type="button" className="text-xs text-emerald-400 hover:underline">نسيت كلمة المرور؟</button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900"
              />
              <span>تذكر هذا الجهاز</span>
            </label>
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>اتصال آمن RLS</span>
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>تسجيل الدخول للمنظومة</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Selector */}
        <div className="mt-6 pt-5 border-t border-slate-700/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>دخول تجريبي سريع بالصلاحيات:</span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('owner')}
              className="px-2 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-[11px] text-slate-200 transition-colors"
            >
              المالك / المدير
            </button>
            <button
              onClick={() => handleQuickDemoLogin('architect')}
              className="px-2 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-[11px] text-slate-200 transition-colors"
            >
              مهندس معماري
            </button>
            <button
              onClick={() => handleQuickDemoLogin('manager')}
              className="px-2 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-[11px] text-slate-200 transition-colors"
            >
              مدير مشروع
            </button>
          </div>
        </div>

        {onSwitchToRegister && (
          <div className="mt-5 text-center text-xs text-slate-400">
            <span>ليس لديك حساب بعد؟ </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-emerald-400 font-medium hover:underline"
            >
              إنشاء حساب جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
