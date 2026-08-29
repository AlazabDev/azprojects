import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Layers, 
  Cpu, 
  MessageSquare, 
  Receipt, 
  Ruler, 
  Bot, 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const IntegrationsHubPage: React.FC = () => {
  const { setNavigationTab } = useApp();

  const integrations = [
    {
      id: 'edge-functions',
      title: 'بوابة دوال الحافة (Edge Functions)',
      subtitle: '14 دالة معالجة سحابية على Deno & Supabase Edge Runtime',
      icon: Cpu,
      color: 'from-indigo-600 to-blue-600',
      badge: '14 Functions Live',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      action: () => setNavigationTab('edge-functions'),
    },
    {
      id: 'daftra',
      title: 'دفترة ERP (المحاسبة وأوامر العمل)',
      subtitle: 'مزامنة فواتير ومستخلصات وسندات أمر العمل رقم 17',
      icon: Receipt,
      color: 'from-blue-600 to-cyan-600',
      badge: 'متصل مع alazab-co',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      action: () => setNavigationTab('daftra'),
    },
    {
      id: 'magicplan',
      title: 'MagicPlan Cloud (المخططات ورفع المساحة)',
      subtitle: 'سحب المخططات المعمارية 2D/3D وجداول الكميات والحجوم',
      icon: Ruler,
      color: 'from-amber-600 to-orange-600',
      badge: '580 م² متزامنة',
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      action: () => setNavigationTab('magicplan'),
    },
    {
      id: 'whatsapp',
      title: 'مركز واتساب للمشاريع الميدانية',
      subtitle: 'استقبال الصور والتقارير وتصنيفها بالذكاء الاصطناعي',
      icon: MessageSquare,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Webhook Active',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      action: () => setNavigationTab('whatsapp'),
    },
    {
      id: 'reports-ai',
      title: 'المستشار الذكي (Azure AI & Gemini)',
      subtitle: 'فحص الموقع بالرؤية الحاسوبية والامتثال لكود البناء السعودي SBC',
      icon: Bot,
      color: 'from-purple-600 to-pink-600',
      badge: 'az-agent-project v2',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      action: () => setNavigationTab('reports-ai'),
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/80 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">منظومة التكامل والربط المركزي</span>
        </div>
        <h1 className="text-2xl font-bold">بوابات التكامل مع الأنظمة والخدمات الخارجية</h1>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          إدارة قنوات الربط المباشرة مع دفترة للمحاسبة، وMagicPlan للمخططات، وواتساب للميدان، وبوابة دوال الحافة المعالجة.
        </p>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={item.action}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>فتح لوحة التحكم</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
