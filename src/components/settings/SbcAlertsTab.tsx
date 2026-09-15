import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  DollarSign,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playAlertChime } from '../../utils/alertEngine';

export const SbcAlertsTab: React.FC = () => {
  const { alertSettings, updateAlertSettings } = useApp();

  const [enableScanning, setEnableScanning] = useState(alertSettings?.enablePeriodicScanning ?? true);
  const [scanInterval, setScanInterval] = useState(alertSettings?.scanIntervalMinutes ?? 15);
  const [dailyBriefingTime, setDailyBriefingTime] = useState(alertSettings?.dailyBriefingTime ?? '08:30');
  const [enableDailyBriefing, setEnableDailyBriefing] = useState(alertSettings?.enableDailyBriefing ?? true);
  const [criticalSounds, setCriticalSounds] = useState(alertSettings?.criticalSoundAlerts ?? true);

  // Saudi Building Code (SBC) Rules
  const [sbc1101, setSbc1101] = useState(true); // كود البناء السكني
  const [sbc201, setSbc201] = useState(true);   // الاشتراطات المعمارية العامة
  const [sbc304, setSbc304] = useState(true);   // الخرسانة الإنشائية واختبارات القوة
  const [sbc801, setSbc801] = useState(true);   // الحماية من الحريق والسلامة

  // Budget alert percentage
  const [budgetThreshold, setBudgetThreshold] = useState('85');

  const [isSaved, setIsSaved] = useState(false);

  const handleTestSound = () => {
    playAlertChime('high');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAlertSettings({
      enablePeriodicScanning: enableScanning,
      scanIntervalMinutes: Number(scanInterval),
      dailyBriefingTime,
      enableDailyBriefing,
      criticalSoundAlerts: criticalSounds
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">كود البناء السعودي (SBC) ونظام الإنذار المبكر</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                فحص آلي مستمر لاشتراطات كود البناء، وتنبيهات استباقية لمواعيد التسليم وتجاوز الميزانيات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>فحص ذكي نشط</span>
            </span>
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>تم حفظ إعدادات الفحص والتنبيهات بنجاح!</span>
        </div>
      )}

      {/* 1. Saudi Building Code (SBC) Standards Checklist */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>معايير كود البناء السعودي المفعلة للفحص التلقائي (SBC Compliance)</span>
          </h3>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
            اللجنة الوطنية لكود البناء
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={sbc1101}
              onChange={(e) => setSbc1101(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 border-slate-300"
            />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">SBC 1101 - كود المباني السكنية</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">الارتدادات، المناور، الارتفاعات الصافية وعزل الواجهات</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={sbc304}
              onChange={(e) => setSbc304(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 border-slate-300"
            />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">SBC 304 - كود الخرسانة الإنشائية</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">فحوصات الهبوط (Slump test) ومقاومة كسر المكعبات 28 يوماً</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={sbc201}
              onChange={(e) => setSbc201(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 border-slate-300"
            />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">SBC 201 - الاشتراطات المعمارية العامة</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">المداخل ومسارات الطوارئ والأبعاد القياسية للغرف والسلالم</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={sbc801}
              onChange={(e) => setSbc801(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 border-slate-300"
            />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">SBC 801 - كود الحماية والسلامة من الحريق</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">مخارج الطوارئ ومواد العزل الحراري المقاومة للهب</span>
            </div>
          </label>
        </div>
      </div>

      {/* 2. Periodic Alert Scanning & Daily Executive Briefing */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>جدول الفحص الدوري والتنبيهات الميدانية (Automated Scanning Engine)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              تكرار الفحص التلقائي في الخلفية
            </label>
            <select
              value={scanInterval}
              onChange={(e) => setScanInterval(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="15">كل 15 دقيقة (موصى به للمشاريع النشطة)</option>
              <option value="30">كل 30 دقيقة</option>
              <option value="60">كل ساعة</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              موعد الإيجاز التنفيذي الصباحي اليومي
            </label>
            <input
              type="time"
              value={dailyBriefingTime}
              onChange={(e) => setDailyBriefingTime(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              عتبة الإنذار لتجاوز الميزانية (%)
            </label>
            <select
              value={budgetThreshold}
              onChange={(e) => setBudgetThreshold(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="80">تنبيه عند بلوغ 80% من الميزانية المحددة</option>
              <option value="85">تنبيه عند بلوغ 85% (الافتراضي)</option>
              <option value="90">تنبيه عند بلوغ 90%</option>
              <option value="95">تنبيه حرج عند 95%</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={criticalSounds}
              onChange={(e) => setCriticalSounds(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 border-slate-300"
            />
            <span>تشغيل نغمة تنبيه صوتية عند التنبيهات الحرجة وتأخر التسليم</span>
          </label>

          <button
            type="button"
            onClick={handleTestSound}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>تجربة نغمة التنبيه الصوتية</span>
          </button>
        </div>
      </div>

      {/* Save Action */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>حفظ إعدادات كود البناء والتنبيهات</span>
        </button>
      </div>

    </form>
  );
};
