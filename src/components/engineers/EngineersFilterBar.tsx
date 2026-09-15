import React, { useState } from 'react';
import { 
  Filter, 
  Search, 
  Calendar, 
  ArrowUpDown, 
  Building2, 
  Layers, 
  LayoutGrid, 
  List, 
  DollarSign, 
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  X,
  Clock
} from 'lucide-react';
import { ProjectStatus, ProjectType } from '../../types';

export type DateFilterType = 'all' | 'due-30-days' | 'due-quarter' | 'year-2026' | 'custom';
export type SortOptionType = 'startDate-desc' | 'startDate-asc' | 'endDate-asc' | 'progress-desc' | 'progress-asc' | 'budget-desc';
export type ViewModeType = 'projects-phases' | 'all-phases-grid' | 'daftra-audit';

interface EngineersFilterBarProps {
  // Status filter
  statusFilter: string;
  setStatusFilter: (status: string) => void;

  // Date filter
  dateFilter: DateFilterType;
  setDateFilter: (filter: DateFilterType) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;

  // Project type filter
  typeFilter: string;
  setTypeFilter: (type: string) => void;

  // Sort option
  sortBy: SortOptionType;
  setSortBy: (sort: SortOptionType) => void;

  // Search query
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // View mode
  viewMode: ViewModeType;
  setViewMode: (mode: ViewModeType) => void;

  // Reset filters
  onResetFilters: () => void;
  activeFiltersCount: number;
}

export const EngineersFilterBar: React.FC<EngineersFilterBarProps> = ({
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onResetFilters,
  activeFiltersCount
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5" dir="rtl">
      
      {/* Top Row: Search Input + Status Chips + View Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المشروع، الكود، العميل، أمر عمل دفترة #..."
            className="w-full pl-9 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs (Pill Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'كافة الحالات' },
            { id: 'active', label: 'قيد التنفيذ' },
            { id: 'delayed', label: 'متأخر وحرج' },
            { id: 'on-hold', label: 'قيد التخطيط' },
            { id: 'completed', label: 'مكتمل' }
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('projects-phases')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'projects-phases'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="عرض المشروعات ومراحلها الكاملة"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">المشاريع والمراحل</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('all-phases-grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'all-phases-grid'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="مصفوفة المراحل المجمعة"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مصفوفة المراحل</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('daftra-audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'daftra-audit'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="المطابقة المالية لدفترة ERP"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مطابقة دفترة</span>
          </button>
        </div>

      </div>

      {/* Second Row: Date Filter + Sort + Advanced Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>الجدول الزمني:</span>
            </span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
              className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">كافة التواريخ</option>
              <option value="due-30-days">مستحق خلال 30 يوماً</option>
              <option value="due-quarter">مستحق هذا الربع (Q3 2026)</option>
              <option value="year-2026">مستحق خلال عام 2026</option>
              <option value="custom">نطاق تاريخ مخصص...</option>
            </select>
          </div>

          {/* Project Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>النوع:</span>
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">كافة الأنواع</option>
              <option value="residential">سكني (فلل وقصور)</option>
              <option value="commercial">تجاري ومكتبي</option>
              <option value="hospitality">فندقي وسياحي</option>
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              <span>الترتيب:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOptionType)}
              className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="startDate-desc">تاريخ البدء (الأحدث أولاً)</option>
              <option value="startDate-asc">تاريخ البدء (الأقدم أولاً)</option>
              <option value="endDate-asc">تاريخ التسليم (الأقرب استحقاقاً)</option>
              <option value="progress-desc">الأعلى في نسبة الإنجاز (%)</option>
              <option value="progress-asc">الأقل في نسبة الإنجاز (%)</option>
              <option value="budget-desc">الميزانية (الأعلى أولاً)</option>
            </select>
          </div>

        </div>

        {/* Reset Filter Button */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إلغاء الفلاتر ({activeFiltersCount})</span>
          </button>
        )}

      </div>

      {/* Custom Date Range Inputs (Only visible when dateFilter === 'custom') */}
      {dateFilter === 'custom' && (
        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900/60 flex flex-wrap items-center gap-4 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">من تاريخ:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">إلى تاريخ:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono outline-none"
            />
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            تتم التصفية حسب تاريخ بدء أو انتهاء المشروع ضمن هذه الفترة
          </span>
        </div>
      )}

    </div>
  );
};
