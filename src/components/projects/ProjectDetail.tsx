import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Layers, 
  CheckSquare, 
  Compass, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  Sparkles, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  TrendingUp, 
  ArrowLeft, 
  Share2, 
  Edit3, 
  ShieldCheck,
  Download,
  AlertCircle
} from 'lucide-react';

import { PhasesManager } from '../phases/PhasesManager';
import { KanbanBoard } from '../tasks/KanbanBoard';
import { MagicPlanViewer } from '../integrations/MagicPlanViewer';
import { CostManager } from '../costs/CostManager';
import { DocumentManager } from '../documents/DocumentManager';
import { WhatsAppHub } from '../integrations/WhatsAppHub';
import { ReportsAndAiAssistant } from '../reports/ReportsAndAiAssistant';

export const ProjectDetail: React.FC = () => {
  const { selectedProject, projects, setSelectedProjectId, setNavigationTab, teamMembers } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'tasks' | 'magicplan' | 'costs' | 'documents' | 'whatsapp' | 'reports'>('overview');

  if (!selectedProject) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500">لم يتم اختيار أي مشروع. يرجى اختيار مشروع من القائمة.</p>
        <button
          onClick={() => setNavigationTab('projects')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          العودة لقائمة المشاريع
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'نظرة عامة ومؤشرات', icon: Building2 },
    { id: 'phases', label: 'المراحل الهندسية (7)', icon: Layers },
    { id: 'tasks', label: 'المهام وكانبان', icon: CheckSquare },
    { id: 'magicplan', label: 'المخططات و MagicPlan', icon: Compass },
    { id: 'costs', label: 'التكاليف والميزانية', icon: DollarSign },
    { id: 'documents', label: 'المستندات والملفات', icon: FileText },
    { id: 'whatsapp', label: 'مراسلات واتساب', icon: MessageSquare },
    { id: 'reports', label: 'التقارير ومساعد AI', icon: Sparkles }
  ];

  const projectTeam = teamMembers.filter(m => m.projectId === selectedProject.id || !m.projectId);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Project Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        
        {/* Cover with Overlay */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
          <img
            src={selectedProject.coverImage}
            alt={selectedProject.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-black/30" />

          {/* Top Switcher & Actions */}
          <div className="absolute top-4 right-4 left-4 flex items-center justify-between">
            <button
              onClick={() => setNavigationTab('projects')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium backdrop-blur-xs border border-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>قائمة المشاريع</span>
            </button>

            <div className="flex items-center gap-2">
              <select
                value={selectedProject.id}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-slate-900/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20 outline-none backdrop-blur-xs cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Title & Specs */}
          <div className="absolute bottom-4 right-4 left-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white">
                  {selectedProject.projectType === 'residential' ? 'سكني' : 'تجاري'}
                </span>
                <span className="text-xs text-blue-300 font-mono font-medium">{selectedProject.id}</span>
                <span className="text-xs text-slate-300">• {selectedProject.location}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
                {selectedProject.name}
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl line-clamp-1">
                {selectedProject.description}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/70 p-3 rounded-xl backdrop-blur-xs border border-white/10 shrink-0">
              <div>
                <span className="text-[10px] text-slate-400 block">نسبة الإنجاز</span>
                <span className="text-2xl font-black text-emerald-400">{selectedProject.progress}%</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <span className="text-[10px] text-slate-400 block">الميزانية الإجمالية</span>
                <span className="text-sm font-bold text-white">{(selectedProject.budget / 1000000).toFixed(2)}M ر.س</span>
              </div>
            </div>
          </div>

        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center overflow-x-auto border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-4 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all
                  ${isActive 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800' 
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Tab Content Panels */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Overview Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">المساحة الإجمالية</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{selectedProject.areaM2} م²</p>
                <span className="text-[11px] text-slate-400">{selectedProject.floorsCount} طوابق إنشائية</span>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">تاريخ الانطلاق</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{selectedProject.startDate}</p>
                <span className="text-[11px] text-slate-400">التسليم: {selectedProject.endDate}</span>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">المنصرف حتى الآن</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {(selectedProject.actualCost / 1000000).toFixed(2)}M ر.س
                </p>
                <span className="text-[11px] text-slate-400">
                  {Math.round((selectedProject.actualCost / selectedProject.budget) * 100)}% من الميزانية
                </span>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">المقاول المعتمد</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">{selectedProject.contractorName || 'شركة المقاولات الحديثة'}</p>
                <span className="text-[11px] text-blue-600 dark:text-blue-400">المهندس المسؤول: {selectedProject.leadArchitect || 'م. عبد العزيز'}</span>
              </div>
            </div>

            {/* Two Columns: Client & Map / Specifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Client & Stakeholders Info Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>بيانات المالك والعميل</span>
                </h3>
                
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">اسم المالك:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedProject.clientName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">رقم الهاتف:</span>
                    <span className="font-mono text-slate-900 dark:text-white" dir="ltr">{selectedProject.clientPhone}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">البريد الإلكتروني:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{selectedProject.clientEmail}</span>
                  </div>
                </div>

                {/* Team Members Working on this Project */}
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-4">فريق العمل المعماري والهندسي:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {projectTeam.map((member) => (
                    <div key={member.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/40">
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{member.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{member.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architectural Location & Map Coordinate Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>موقع المشروع والإحداثيات الميدانية</span>
                </h3>

                <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  {/* Simulated Blueprint / Satellite Map Visual */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 opacity-90"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  
                  <div className="relative z-10 text-center text-white space-y-2 p-4">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-600/40 animate-bounce">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold">{selectedProject.location}</p>
                    <p className="text-[11px] font-mono text-blue-300">
                      Lat: {selectedProject.coordinates?.lat || 24.8124}, Lng: {selectedProject.coordinates?.lng || 46.6128}
                    </p>
                  </div>
                </div>

                {/* Project Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedProject.tags?.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'phases' && <PhasesManager />}
        {activeTab === 'tasks' && <KanbanBoard />}
        {activeTab === 'magicplan' && <MagicPlanViewer />}
        {activeTab === 'costs' && <CostManager />}
        {activeTab === 'documents' && <DocumentManager />}
        {activeTab === 'whatsapp' && <WhatsAppHub />}
        {activeTab === 'reports' && <ReportsAndAiAssistant />}
      </div>

    </div>
  );
};
