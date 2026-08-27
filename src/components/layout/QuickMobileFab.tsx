import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  X, 
  Building2, 
  CheckSquare, 
  DollarSign, 
  Camera, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface QuickMobileFabProps {
  onOpenNewProject: () => void;
}

export const QuickMobileFab: React.FC<QuickMobileFabProps> = ({ onOpenNewProject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setNavigationTab } = useApp();

  return (
    <div className="lg:hidden fixed left-4 bottom-20 z-40 flex flex-col items-start select-none">
      
      {/* Speed Dial Menu Items */}
      {isOpen && (
        <div className="flex flex-col gap-2 mb-3 animate-in slide-in-from-bottom-5 duration-200">
          
          {/* New Project */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenNewProject();
            }}
            className="flex items-center gap-2.5 bg-indigo-600 text-white px-3.5 py-2 rounded-full shadow-lg text-xs font-bold active:scale-95 transition"
          >
            <Building2 className="w-4 h-4" />
            <span>مشروع جديد</span>
          </button>

          {/* New Task */}
          <button
            onClick={() => {
              setIsOpen(false);
              setNavigationTab('tasks');
            }}
            className="flex items-center gap-2.5 bg-blue-600 text-white px-3.5 py-2 rounded-full shadow-lg text-xs font-bold active:scale-95 transition"
          >
            <CheckSquare className="w-4 h-4" />
            <span>مهمة تنفيذية</span>
          </button>

          {/* New Expense */}
          <button
            onClick={() => {
              setIsOpen(false);
              setNavigationTab('costs');
            }}
            className="flex items-center gap-2.5 bg-emerald-600 text-white px-3.5 py-2 rounded-full shadow-lg text-xs font-bold active:scale-95 transition"
          >
            <DollarSign className="w-4 h-4" />
            <span>تسجيل تكلفة</span>
          </button>

          {/* Field Media / WhatsApp */}
          <button
            onClick={() => {
              setIsOpen(false);
              setNavigationTab('whatsapp');
            }}
            className="flex items-center gap-2.5 bg-green-600 text-white px-3.5 py-2 rounded-full shadow-lg text-xs font-bold active:scale-95 transition"
          >
            <Camera className="w-4 h-4" />
            <span>صورة موقع / واتساب</span>
          </button>

        </div>
      )}

      {/* Main Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-transform duration-200 active:scale-90 ${
          isOpen 
            ? 'bg-slate-800 text-white rotate-45' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
        aria-label="إجراء سريع"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

    </div>
  );
};
