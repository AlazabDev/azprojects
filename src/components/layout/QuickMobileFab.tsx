import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  X, 
  Building2, 
  CheckSquare, 
  DollarSign, 
  Camera, 
  Bot,
  Compass
} from 'lucide-react';

interface QuickMobileFabProps {
  onOpenNewProject: () => void;
}

export const QuickMobileFab: React.FC<QuickMobileFabProps> = ({ onOpenNewProject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setNavigationTab } = useApp();

  return (
    <>
      {/* Backdrop overlay when speed dial is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Action Button Container */}
      <div className="fixed left-5 bottom-5 z-40 flex flex-col items-start select-none" dir="rtl">
        
        {/* Speed Dial Menu Items - Stacked cleanly above the FAB button */}
        {isOpen && (
          <div className="flex flex-col items-start gap-2 mb-3 animate-in slide-in-from-bottom-2 fade-in duration-150">
            
            {/* 1. Foundry AI Agent Chat Link (Featured) */}
            <button
              onClick={() => {
                setIsOpen(false);
                setNavigationTab('reports');
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white pl-4 pr-3.5 py-2.5 rounded-2xl shadow-xl border border-indigo-400/30 text-xs font-bold active:scale-95 transition-transform hover:shadow-indigo-500/25 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col text-right">
                <span className="leading-tight">وكيل المشروعات (Foundry AI)</span>
                <span className="text-[10px] text-indigo-200 font-normal">دردشة واستشارة هندسية وفنية</span>
              </div>
            </button>

            {/* 2. New Project */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenNewProject();
              }}
              className="flex items-center gap-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-3 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-bold active:scale-95 transition hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span>مشروع معماري جديد</span>
            </button>

            {/* 3. New Task */}
            <button
              onClick={() => {
                setIsOpen(false);
                setNavigationTab('tasks');
              }}
              className="flex items-center gap-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-3 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-bold active:scale-95 transition hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <CheckSquare className="w-3.5 h-3.5" />
              </div>
              <span>مهمة تنفيذية</span>
            </button>

            {/* 4. New Cost */}
            <button
              onClick={() => {
                setIsOpen(false);
                setNavigationTab('costs');
              }}
              className="flex items-center gap-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-3 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-bold active:scale-95 transition hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span>تسجيل تكلفة / فاتورة</span>
            </button>

            {/* 5. MagicPlan */}
            <button
              onClick={() => {
                setIsOpen(false);
                setNavigationTab('magicplan');
              }}
              className="flex items-center gap-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-3 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-bold active:scale-95 transition hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span>مخططات MagicPlan</span>
            </button>

            {/* 6. WhatsApp Media */}
            <button
              onClick={() => {
                setIsOpen(false);
                setNavigationTab('whatsapp');
              }}
              className="flex items-center gap-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-3 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-bold active:scale-95 transition hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <span>صورة موقع / واتساب</span>
            </button>

          </div>
        )}

        {/* Main Floating Action Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-200 active:scale-90 cursor-pointer ${
            isOpen 
              ? 'bg-slate-900 dark:bg-slate-700 text-white rotate-90 scale-95' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30'
          }`}
          title={isOpen ? 'إغلاق القائمة' : 'الإجراءات السريعة ووكيل المشروعات'}
          aria-label="إجراء سريع"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5 stroke-[2.5]" />
          )}
        </button>

      </div>
    </>
  );
};
