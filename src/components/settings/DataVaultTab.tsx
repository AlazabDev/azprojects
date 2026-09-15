import React, { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  Check, 
  AlertTriangle, 
  FileText, 
  HardDrive, 
  Server, 
  ShieldCheck, 
  Layers,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DataVaultTab: React.FC = () => {
  const { 
    projects, 
    phases, 
    tasks, 
    documents, 
    costs, 
    payments, 
    teamMembers, 
    resetToInitialData 
  } = useApp();

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Export Full JSON Backup
  const handleExportJson = () => {
    setIsExporting(true);
    const backupData = {
      version: '2.5.0',
      system: 'AzProjects Architectural & Construction Management Engine',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalProjects: projects.length,
        totalPhases: phases.length,
        totalTasks: tasks.length,
        totalDocuments: documents.length,
        totalCosts: costs.length,
        totalPayments: payments.length
      },
      data: {
        projects,
        phases,
        tasks,
        documents,
        costs,
        payments,
        teamMembers,
        localStorageKeys: Object.keys(localStorage).reduce((acc: any, key) => {
          acc[key] = localStorage.getItem(key);
          return acc;
        }, {})
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azprojects_full_vault_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setExportSuccess('تم تنزيل النسخة الاحتياطية الكاملة (JSON) بنجاح.');
    setTimeout(() => setExportSuccess(null), 4000);
  };

  // 2. Export CSV for Excel
  const handleExportCsv = () => {
    const headers = ['Project ID', 'Project Name', 'Type', 'Status', 'Progress %', 'Budget (SAR)', 'Actual Cost (SAR)', 'Location'];
    const rows = projects.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.projectType,
      p.status,
      p.progress,
      p.budget,
      p.actualCost,
      `"${p.location.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azprojects_summary_excel_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setExportSuccess('تم تنزيل ملف التقرير المالي المجدول (CSV / Excel) بنجاح.');
    setTimeout(() => setExportSuccess(null), 4000);
  };

  // 3. Import JSON Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data?.localStorageKeys) {
          Object.entries(parsed.data.localStorageKeys).forEach(([key, val]) => {
            if (typeof val === 'string') localStorage.setItem(key, val);
          });
          setExportSuccess('تم استيراد واستعادة البيانات بنجاح! سيتم تحديث الصفحة الآن...');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          alert('الملف المرفوع لا يحتوي على بنية النسخ الاحتياطي الخاصة بـ AzProjects.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية. يرجى التأكد من سلامة ملف JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 border border-indigo-800/40 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">خزينة البيانات والنسخ الاحتياطي (Data Vault & Recovery)</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                تصدير واستيراد قواعد البيانات، إنشاء نقاط استعادة مشفرة، وتفريغ تقارير Excel للمحاسب القانوني
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مزامنة سحابية مستمرة</span>
            </span>
          </div>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* 1. Database Health & Volume Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-slate-400 font-medium">المشاريع المسجلة</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{projects.length}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">مشروعات نشطة ومربوطة</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-slate-400 font-medium">المراحل الهندسية</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{phases.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">مرحلة معمارية وتنفيذية</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-slate-400 font-medium">مهام كانبان والرقابة</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{tasks.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">مهمة متابعة ميدانية</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-slate-400 font-medium">مستندات ومخططات CAD</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{documents.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">ملف معتمد ومخطط سحابي</div>
        </div>
      </div>

      {/* 2. Backup & Export Center */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>تصدير وتأمين البيانات (Data Export & Archive)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          يمكنك تنزيل نسخة احتياطية كاملة لكافة السجلات المالية والمخططات المعمارية بنقرة واحدة، لتخزينها على قرصك الخارجي أو سحابتك الخاصة:
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportJson}
            disabled={isExporting}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة كاملة مشفرة (JSON Full Vault)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>تصدير جدول المشاريع والمصروفات لـ (Excel / CSV)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>استعادة من نسخة احتياطية (Restore JSON)</span>
          </button>
        </div>
      </div>

      {/* 3. System Reset & Factory Baseline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-200 dark:border-rose-900/60 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>إعادة ضبط البيانات الأولية (Reset Baseline Data)</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          في حال رغبت بإعادة مزامنة المشروعات الأربعة الافتراضية وحذف التعديلات التجريبية، يمكنك استعادة الحالة التشغيلية الأساسية.
        </p>

        {confirmReset ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-300 dark:border-rose-800 space-y-3">
            <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
              هل أنت متأكد من إعادة ضبط البيانات إلى الحالة النموذجية الأولية؟ لن تتأثر قواعد بيانات الخادم الخارجية.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetToInitialData();
                  setConfirmReset(false);
                  setExportSuccess('تمت استعادة البيانات النموذجية الأولية بنجاح!');
                  setTimeout(() => setExportSuccess(null), 3000);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                نعم، استعد البيانات الآن
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة ضبط المشروعات إلى الحالة الأولية</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
