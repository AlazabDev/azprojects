import React, { useState } from 'react';
import { 
  Building2, 
  Key, 
  ShieldCheck, 
  Globe, 
  Bell, 
  Database, 
  Sliders, 
  CheckCircle2, 
  Server, 
  Sparkles,
  Lock,
  ChevronLeft
} from 'lucide-react';
import { CompanyProfileTab } from '../../components/settings/CompanyProfileTab';
import { IntegrationsTab } from '../../components/settings/IntegrationsTab';
import { ClientGovernanceTab } from '../../components/settings/ClientGovernanceTab';
import { DomainDeploymentTab } from '../../components/settings/DomainDeploymentTab';
import { SbcAlertsTab } from '../../components/settings/SbcAlertsTab';
import { DataVaultTab } from '../../components/settings/DataVaultTab';
import { PreferencesRbacTab } from '../../components/settings/PreferencesRbacTab';

type SettingsTabId = 'company' | 'integrations' | 'governance' | 'domain' | 'sbc' | 'vault' | 'preferences';

interface TabItem {
  id: SettingsTabId;
  title: string;
  titleEn: string;
  icon: React.ElementType;
  badge?: string;
}

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('company');

  const tabs: TabItem[] = [
    { id: 'company', title: 'الهوية والملف المؤسسي', titleEn: 'Company Profile', icon: Building2 },
    { id: 'integrations', title: 'إعدادات الربط الميداني (Daftra & MagicPlan)', titleEn: 'Field Integrations & API', icon: Key, badge: 'ربط حي متصل' },
    { id: 'governance', title: 'حوكمة العملاء و RLS', titleEn: 'Client RLS Governance', icon: ShieldCheck, badge: 'نشط' },
    { id: 'domain', title: 'النطاق المخصص والإنتاج', titleEn: 'Custom Domain & SSL', icon: Globe },
    { id: 'sbc', title: 'كود البناء SBC والتنبيهات', titleEn: 'SBC Standards & Alerts', icon: Bell },
    { id: 'vault', title: 'خزينة البيانات والنسخ', titleEn: 'Data Vault & Backups', icon: Database },
    { id: 'preferences', title: 'التفضيلات والصلاحيات', titleEn: 'Preferences & RBAC', icon: Sliders }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 text-right" dir="rtl">
      
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <span>لوحة التحكم الرئيسية</span>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="text-slate-500 dark:text-slate-400">إعدادات المنظومة الشاملة</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            مركز التحكم والإعدادات المتقدمة (Enterprise Settings Hub)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إدارة الهوية الرسمية، مفاتيح دفترة وماجيك بلان، حوكمة عزل العملاء (RLS)، وسلامة قواعد البيانات
          </p>
        </div>

        {/* Live System Status Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cloud SQL: متصل</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
            <Lock className="w-3.5 h-3.5" />
            <span>RLS: عزل تام للعملاء</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
            <span>projects.alazab.com</span>
          </span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{tab.title}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="mt-2">
        {activeTab === 'company' && <CompanyProfileTab />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'governance' && <ClientGovernanceTab />}
        {activeTab === 'domain' && <DomainDeploymentTab />}
        {activeTab === 'sbc' && <SbcAlertsTab />}
        {activeTab === 'vault' && <DataVaultTab />}
        {activeTab === 'preferences' && <PreferencesRbacTab />}
      </div>

    </div>
  );
};
