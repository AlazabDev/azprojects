import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus, ProjectType } from '../../types';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Copy, 
  Archive, 
  Trash2, 
  ExternalLink, 
  Layers, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Grid, 
  List, 
  Sparkles,
  ArrowUpRight,
  Share2
} from 'lucide-react';

interface ProjectListProps {
  onOpenNewProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onOpenNewProject }) => {
  const { 
    projects, 
    setSelectedProjectId, 
    setNavigationTab, 
    cloneProject, 
    archiveProject, 
    deleteProject 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesType = typeFilter === 'all' || p.projectType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">نشط وقيد التنفيذ</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">مكتمل وتم التسليم</span>;
      case 'on-hold':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">معلق مؤقتاً</span>;
      case 'archived':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">مؤرشف</span>;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: ProjectType) => {
    switch (type) {
      case 'residential': return 'سكني';
      case 'commercial': return 'تجاري ومكتبي';
      case 'governmental': return 'حكومي وثقافي';
      case 'hospitality': return 'فندقي وسياحي';
      case 'industrial': return 'صناعي';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            سجل وإدارة المشاريع المعمارية
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
            إدارة {projects.length} مشاريع معمارية، متابعة الجداول الزمنية والميزانيات المعتمدة
          </p>
        </div>

        <button
          onClick={onOpenNewProject}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs lg:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>مشروع جديد</span>
        </button>
      </div>

      {/* Filter & View Mode Controls Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، الموقع، أو اسم المالك..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pr-9 pl-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:border-blue-500 outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="completed">مكتمل</option>
            <option value="on-hold">معلق</option>
            <option value="archived">مؤرشف</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            <option value="all">جميع التصنيفات</option>
            <option value="residential">سكني</option>
            <option value="commercial">تجاري</option>
            <option value="governmental">حكومي</option>
            <option value="hospitality">فندقي</option>
          </select>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-400'}`}
              title="عرض الشبكة"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-400'}`}
              title="عرض الجدول"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Projects Grid / Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-200 flex flex-col group"
            >
              {/* Cover Image & Status Header */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={project.coverImage}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
                
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-900/80 text-white backdrop-blur-xs border border-white/20">
                    {getTypeLabel(project.projectType)}
                  </span>
                </div>

                <div className="absolute top-3 left-3">
                  {getStatusBadge(project.status)}
                </div>

                <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between text-white">
                  <div className="min-w-0 pr-2">
                    <p className="text-[11px] text-blue-300 font-semibold">{project.nameEn || project.id}</p>
                    <h3 className="text-sm font-bold text-white truncate drop-shadow-sm">{project.name}</h3>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-xl font-black text-emerald-400">{project.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Body Details */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                
                {/* Location & Client */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>المالك: {project.clientName}</span>
                    <span>{project.floorsCount} طوابق • {project.areaM2} م²</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-l from-blue-600 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>المنصرف: {(project.actualCost / 1000000).toFixed(2)}M ر.س</span>
                    <span>الميزانية: {(project.budget / 1000000).toFixed(2)}M ر.س</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setNavigationTab('project-detail');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition"
                  >
                    <span>فتح تفاصيل المشروع</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => cloneProject(project.id)}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition border border-slate-200 dark:border-slate-700"
                    title="نسخ وتكرار المشروع"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => archiveProject(project.id)}
                    className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl transition border border-slate-200 dark:border-slate-700"
                    title="أرشفة"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-4">اسم المشروع</th>
                  <th className="p-4">التصنيف</th>
                  <th className="p-4">الموقع</th>
                  <th className="p-4">الميزانية</th>
                  <th className="p-4">المنصرف</th>
                  <th className="p-4">نسبة الإنجاز</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={project.coverImage}
                          alt={project.name}
                          className="w-10 h-10 rounded-lg object-cover ring-1 ring-black/5 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{project.name}</p>
                          <p className="text-[10px] text-slate-400">{project.clientName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                      {getTypeLabel(project.projectType)}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {project.location}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {project.budget.toLocaleString()} ر.س
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {project.actualCost.toLocaleString()} ر.س
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="font-bold text-emerald-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(project.status)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setNavigationTab('project-detail');
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                          title="عرض التفاصيل"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => cloneProject(project.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
                          title="نسخ"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
