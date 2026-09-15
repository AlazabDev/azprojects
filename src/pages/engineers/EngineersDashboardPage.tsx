import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectPhase, PhaseStatus } from '../../types';
import { EngineersHeaderStats } from '../../components/engineers/EngineersHeaderStats';
import { 
  EngineersFilterBar, 
  DateFilterType, 
  SortOptionType, 
  ViewModeType 
} from '../../components/engineers/EngineersFilterBar';
import { ProjectPhasesCard } from '../../components/engineers/ProjectPhasesCard';
import { AllPhasesMatrixView } from '../../components/engineers/AllPhasesMatrixView';
import { DaftraFinancialAuditView } from '../../components/engineers/DaftraFinancialAuditView';
import { DaftraLiveModal } from '../../components/engineers/DaftraLiveModal';
import { PhaseUpdateModal } from '../../components/engineers/PhaseUpdateModal';
import { 
  Building2, 
  Layers, 
  AlertCircle, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const EngineersDashboardPage: React.FC = () => {
  const { projects, phases, daftraRecords } = useApp();

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-01-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-12-31');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOptionType>('startDate-desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewModeType>('projects-phases');

  // Modals State
  const [daftraModal, setDaftraModal] = useState<{
    isOpen: boolean;
    project: Project | null;
    phase: ProjectPhase | null;
  }>({
    isOpen: false,
    project: null,
    phase: null
  });

  const [phaseModal, setPhaseModal] = useState<{
    isOpen: boolean;
    project: Project | null;
    phase: ProjectPhase | null;
  }>({
    isOpen: false,
    project: null,
    phase: null
  });

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (dateFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [statusFilter, dateFilter, typeFilter, searchQuery]);

  const handleResetFilters = () => {
    setStatusFilter('all');
    setDateFilter('all');
    setTypeFilter('all');
    setSearchQuery('');
    setSortBy('startDate-desc');
  };

  // Filter & Sort Projects
  const filteredProjects = useMemo(() => {
    const now = new Date('2026-09-10').getTime();

    return projects.filter((project) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          project.name?.toLowerCase().includes(q) ||
          project.nameEn?.toLowerCase().includes(q) ||
          project.id?.toLowerCase().includes(q) ||
          project.clientName?.toLowerCase().includes(q) ||
          project.location?.toLowerCase().includes(q) ||
          project.leadArchitect?.toLowerCase().includes(q) ||
          project.contractorName?.toLowerCase().includes(q) ||
          (project.daftraWorkOrderId && project.daftraWorkOrderId.toString().includes(q));
        if (!matches) return false;
      }

      // 2. Status filter
      if (statusFilter !== 'all') {
        const projectPhases = phases.filter(ph => ph.projectId === project.id);
        const hasDelayedPhase = projectPhases.some(ph => ph.status === 'delayed');
        const isLate = project.status === 'active' && new Date(project.endDate).getTime() < now && project.progress < 100;

        if (statusFilter === 'delayed') {
          if (!isLate && !hasDelayedPhase) return false;
        } else if (statusFilter === 'active') {
          if (project.status !== 'active') return false;
        } else if (statusFilter === 'completed') {
          if (project.status !== 'completed' && project.progress !== 100) return false;
        } else if (statusFilter === 'on-hold') {
          if (project.status !== 'on-hold' && project.status !== 'planning') return false;
        }
      }

      // 3. Project Type filter
      if (typeFilter !== 'all' && project.projectType !== typeFilter) {
        return false;
      }

      // 4. Date Filter
      if (dateFilter !== 'all') {
        const projectEnd = new Date(project.endDate).getTime();
        const projectStart = new Date(project.startDate).getTime();

        if (dateFilter === 'due-30-days') {
          const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;
          if (projectEnd < now || projectEnd > thirtyDaysFromNow) return false;
        } else if (dateFilter === 'due-quarter') {
          // Q3 2026 or next 90 days
          const ninetyDaysFromNow = now + 90 * 24 * 60 * 60 * 1000;
          if (projectEnd > ninetyDaysFromNow) return false;
        } else if (dateFilter === 'year-2026') {
          const year2026Start = new Date('2026-01-01').getTime();
          const year2026End = new Date('2026-12-31').getTime();
          if (projectEnd < year2026Start || projectStart > year2026End) return false;
        } else if (dateFilter === 'custom') {
          const customStart = new Date(customStartDate).getTime();
          const customEnd = new Date(customEndDate).getTime();
          if (projectEnd < customStart || projectStart > customEnd) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'startDate-desc') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      if (sortBy === 'startDate-asc') {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      if (sortBy === 'endDate-asc') {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      if (sortBy === 'progress-desc') {
        return b.progress - a.progress;
      }
      if (sortBy === 'progress-asc') {
        return a.progress - b.progress;
      }
      if (sortBy === 'budget-desc') {
        return b.budget - a.budget;
      }
      return 0;
    });
  }, [projects, phases, searchQuery, statusFilter, typeFilter, dateFilter, customStartDate, customEndDate, sortBy]);

  // Filtered Phases across all filtered projects
  const filteredPhases = useMemo(() => {
    const projectIds = new Set(filteredProjects.map(p => p.id));
    return phases.filter(ph => projectIds.has(ph.projectId));
  }, [phases, filteredProjects]);

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Project ID',
      'Project Name',
      'Status',
      'Area M2',
      'Client',
      'Daftra Work Order',
      'Start Date',
      'End Date',
      'Project Progress %',
      'Phase Order',
      'Phase Name',
      'Phase Status',
      'Phase Budget (SAR)',
      'Phase Actual Cost (SAR)',
      'Phase Progress %'
    ];

    const rows: string[][] = [];

    filteredProjects.forEach(proj => {
      const projPhases = phases.filter(ph => ph.projectId === proj.id);
      if (projPhases.length === 0) {
        rows.push([
          proj.id,
          proj.name,
          proj.status,
          (proj.areaM2 || 0).toString(),
          proj.clientName,
          proj.daftraWorkOrderId || '',
          proj.startDate,
          proj.endDate,
          proj.progress.toString(),
          '-',
          'لا توجد مراحل',
          '-',
          '0',
          '0',
          '0'
        ]);
      } else {
        projPhases.forEach(ph => {
          rows.push([
            proj.id,
            proj.name,
            proj.status,
            (proj.areaM2 || 0).toString(),
            proj.clientName,
            proj.daftraWorkOrderId || '',
            proj.startDate,
            proj.endDate,
            proj.progress.toString(),
            ph.orderNumber.toString(),
            ph.name,
            ph.status,
            ph.budget.toString(),
            ph.actualCost.toString(),
            ph.progress.toString()
          ]);
        });
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `engineers_projects_phases_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir="rtl">
      
      {/* 1. Header & Quick KPIs Bar */}
      <EngineersHeaderStats
        projects={projects}
        allPhases={phases}
        onOpenDaftraModal={() => setDaftraModal({
          isOpen: true,
          project: projects.find(p => p.id === 'PRJ-ARABESQUE') || projects[0] || null,
          phase: null
        })}
        onExportCsv={handleExportCsv}
      />

      {/* 2. Advanced Engineering Filtering Bar */}
      <EngineersFilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onResetFilters={handleResetFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* 3. Main Content Views */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            لا توجد مشروعات مطابقة لمعايير التصفية والبحث
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            جرب تعديل حالة المشروع أو النطاق الزمني أو تفريغ نص البحث لاستعراض كافة المشروعات.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط كافة الفلاتر</span>
          </button>
        </div>
      ) : (
        <>
          {/* VIEW 1: Projects & All Phases Breakdown */}
          {viewMode === 'projects-phases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  عرض <strong className="text-slate-900 dark:text-white">{filteredProjects.length}</strong> مشاريع تضم <strong className="text-slate-900 dark:text-white">{filteredPhases.length}</strong> مرحلة هندسية
                </span>
                <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                  ربط حي مع دفترة ERP: نشط
                </span>
              </div>

              {filteredProjects.map((project) => {
                const projectPhases = phases.filter(ph => ph.projectId === project.id);
                return (
                  <ProjectPhasesCard
                    key={project.id}
                    project={project}
                    phases={projectPhases}
                    onOpenPhaseModal={(ph, proj) => setPhaseModal({
                      isOpen: true,
                      project: proj,
                      phase: ph
                    })}
                    onOpenDaftraModal={(proj, ph) => setDaftraModal({
                      isOpen: true,
                      project: proj,
                      phase: ph || null
                    })}
                  />
                );
              })}
            </div>
          )}

          {/* VIEW 2: All Phases Flat Matrix */}
          {viewMode === 'all-phases-grid' && (
            <AllPhasesMatrixView
              projects={filteredProjects}
              phases={filteredPhases}
              onOpenPhaseModal={(ph, proj) => setPhaseModal({
                isOpen: true,
                project: proj,
                phase: ph
              })}
              onOpenDaftraModal={(proj, ph) => setDaftraModal({
                isOpen: true,
                project: proj,
                phase: ph || null
              })}
            />
          )}

          {/* VIEW 3: Daftra Financial Audit & Reconciliation */}
          {viewMode === 'daftra-audit' && (
            <DaftraFinancialAuditView
              projects={filteredProjects}
              phases={filteredPhases}
              onOpenDaftraModal={(proj, ph) => setDaftraModal({
                isOpen: true,
                project: proj,
                phase: ph || null
              })}
            />
          )}
        </>
      )}

      {/* Interactive Modals */}
      <DaftraLiveModal
        project={daftraModal.project}
        phase={daftraModal.phase}
        isOpen={daftraModal.isOpen}
        onClose={() => setDaftraModal({ isOpen: false, project: null, phase: null })}
      />

      <PhaseUpdateModal
        project={phaseModal.project}
        phase={phaseModal.phase}
        isOpen={phaseModal.isOpen}
        onClose={() => setPhaseModal({ isOpen: false, project: null, phase: null })}
      />

    </div>
  );
};
