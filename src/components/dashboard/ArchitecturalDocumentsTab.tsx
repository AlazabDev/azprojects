import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Compass, 
  Download, 
  FileText, 
  Layers, 
  Search, 
  Filter, 
  Eye, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileCode, 
  Maximize2, 
  FolderDown, 
  ExternalLink, 
  Share2, 
  Tag, 
  Grid, 
  List, 
  Info,
  Calendar,
  UserCheck,
  Check,
  X,
  Printer,
  ChevronDown
} from 'lucide-react';
import { BlueprintFloor, BlueprintRoom } from '../../types';

export interface ArchitecturalBlueprintItem {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  code: string;
  category: 'floor_plan' | 'elevation' | 'section' | 'arabesque_detail' | 'bim_model' | 'safety_plan';
  categoryLabel: string;
  floorName?: string;
  floorLevel?: number;
  totalAreaM2: number;
  roomsCount?: number;
  wallPerimeterM?: number;
  version: string;
  updatedAt: string;
  magicplanId: string;
  thumbnailUrl: string;
  description: string;
  approvedBy: string;
  rooms?: BlueprintRoom[];
  availableFormats: Array<{
    format: 'PDF' | 'DWG' | 'DXF' | 'PNG' | 'SVG' | 'JSON';
    label: string;
    fileSize: string;
  }>;
}

export const ArchitecturalDocumentsTab: React.FC = () => {
  const { 
    projects, 
    selectedProjectId, 
    setSelectedProjectId, 
    magicPlanDesign, 
    syncWithMagicPlan,
    addNotification,
    setNavigationTab
  } = useApp();

  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'grid' | 'interactive'>('grid');
  
  // Interactive Inspector Modal State
  const [inspectingBlueprint, setInspectingBlueprint] = useState<ArchitecturalBlueprintItem | null>(null);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState<number>(0);
  const [selectedRoom, setSelectedRoom] = useState<BlueprintRoom | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Pre-compiled rich architectural blueprint database integrated from MagicPlan and Project files
  const blueprintsData: ArchitecturalBlueprintItem[] = [
    {
      id: 'BP-ARA-01',
      projectId: 'PRJ-ARABESQUE',
      projectName: 'مشروع أرابيسك المعماري (Arabesque)',
      title: 'المسقط الأفقي للطابق الأرضي - مجلس الأرابيسك والصالة الملكية',
      code: 'ARC-ARA-FL00-MP',
      category: 'floor_plan',
      categoryLabel: 'مسقط أفقي (Floor Plan)',
      floorName: 'الطابق الأرضي (Ground Floor)',
      floorLevel: 0,
      totalAreaM2: 310,
      roomsCount: 6,
      wallPerimeterM: 135.4,
      version: 'v1.2',
      updatedAt: '2026-08-25',
      magicplanId: '3faed7e9-6e92-495c-b4a6-94a8f0216fcb',
      thumbnailUrl: 'https://assets-v2.cloud.magicplan.app/cUowVUhLV3d3SnNsdTUyYmZqNTd6b3diY3huNUVBSnBIY0paZWNldUxCL1JyL3ZIcFFHSTB2SmQ5SjBGcFR2SHF3bCthREtDU0pwYUd1cTJVUHJ1WEo1WWxVaWZ0WE1VVXo2ZEE1cnRFekg1cXI0WFZub0twNVZROTYvOEQ0N05mMVdNaXlCbzhjU3ozbkthdDh3ZUR1UUwwSHNkSDMwaGQ5TXdwblBYWGlIUXdNRzFDZWZEbzJsdWh2MVAzNlgzRGlENENrdiszOFdsSG1zSWdUMHlVdDZaZmo5SFB2M01lWjZhdXgrZ3pQVVp3MmJ5MDVXT2xqWVM3a28vcExZampLa25yZGZ3N3BrbEMxZ2N2UEVzY0E9PQ?type=thumbnail',
      description: 'مخطط تفصيلي للرفع المساحي والأبعاد المترية المعتمدة للبهو، المجلس، الفناء الأندلسي وصالة القبة الإسلامية.',
      approvedBy: 'م. أحمد العزب',
      rooms: magicPlanDesign.floors[0]?.rooms || [],
      availableFormats: [
        { format: 'PDF', label: 'مخطط تنفيذي معتمد PDF', fileSize: '14.2 MB' },
        { format: 'DWG', label: 'أوتوكاد AutoCAD 2026 DWG', fileSize: '28.5 MB' },
        { format: 'SVG', label: 'متجه دقيق عالي الوضوح SVG', fileSize: '2.1 MB' },
        { format: 'JSON', label: 'بيانات كميات BIM MagicPlan', fileSize: '850 KB' }
      ]
    },
    {
      id: 'BP-ARA-02',
      projectId: 'PRJ-ARABESQUE',
      projectName: 'مشروع أرابيسك المعماري (Arabesque)',
      title: 'المسقط الأفقي للطابق الأول - الأجنحة العائلية والتراس المظلل',
      code: 'ARC-ARA-FL01-MP',
      category: 'floor_plan',
      categoryLabel: 'مسقط أفقي (Floor Plan)',
      floorName: 'الطابق الأول (First Floor)',
      floorLevel: 1,
      totalAreaM2: 270,
      roomsCount: 4,
      wallPerimeterM: 110.4,
      version: 'v1.1',
      updatedAt: '2026-08-24',
      magicplanId: '3faed7e9-6e92-495c-b4a6-94a8f0216fcb',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      description: 'مخطط جناح الماستر الرئاسي مع تفاصيل غرفة الملابس المدمجة، صالة المعيشة العلوية، والشرفات الخشبية التراثية.',
      approvedBy: 'م. أحمد العزب',
      rooms: magicPlanDesign.floors[1]?.rooms || [],
      availableFormats: [
        { format: 'PDF', label: 'مخطط تنفيذي معتمد PDF', fileSize: '12.8 MB' },
        { format: 'DWG', label: 'أوتوكاد AutoCAD 2026 DWG', fileSize: '24.1 MB' },
        { format: 'PNG', label: 'صورة مسقط عالي الدقة 4K', fileSize: '5.4 MB' },
        { format: 'JSON', label: 'بيانات كميات BIM MagicPlan', fileSize: '620 KB' }
      ]
    },
    {
      id: 'BP-ARA-03',
      projectId: 'PRJ-ARABESQUE',
      projectName: 'مشروع أرابيسك المعماري (Arabesque)',
      title: 'تفاصيل قواطع ونقوش الأرابيسك المفرغة بالـ CNC والمشربيات',
      code: 'DET-ARA-CNC-04',
      category: 'arabesque_detail',
      categoryLabel: 'تفاصيل ديكور وأرابيسك (Details)',
      totalAreaM2: 85,
      version: 'v2.0',
      updatedAt: '2026-08-20',
      magicplanId: 'mp-cnc-ara-994',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
      description: 'مخططات تفريغ الخشب الزان والبلوط بنقوش إسلامية هندسية ثلاثية الأبعاد بدقة 3 مم لكسوة الجدران والأسقف.',
      approvedBy: 'م. أحمد العزب',
      availableFormats: [
        { format: 'DXF', label: 'ملف ماكينات CNC الصناعية DXF', fileSize: '18.4 MB' },
        { format: 'PDF', label: 'كتيب التفاصيل الهندسية PDF', fileSize: '8.9 MB' },
        { format: 'DWG', label: 'تفاصيل الواجهات الأوتوكاد DWG', fileSize: '15.2 MB' }
      ]
    },
    {
      id: 'BP-MLQ-01',
      projectId: 'PRJ-001',
      projectName: 'فيلا الملقا المعمارية المودرن',
      title: 'المسقط المعماري الإنشائي الشامل - فيلا الملقا السكنية',
      code: 'ARC-MLQ-MAIN-MP',
      category: 'floor_plan',
      categoryLabel: 'مسقط أفقي (Floor Plan)',
      floorName: 'المسقط العام لكامل المبنى',
      totalAreaM2: 780,
      roomsCount: 14,
      wallPerimeterM: 320.0,
      version: 'v3.0',
      updatedAt: '2026-08-15',
      magicplanId: 'mp-mlq-villa-2026',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
      description: 'المساقط المعمارية المعتمدة من منصة بلدي والأمانة، شاملاً توزيع الأثاث والتسليح ومسارات السباكة والتكييف المخفي.',
      approvedBy: 'م. أحمد العزب',
      availableFormats: [
        { format: 'PDF', label: 'المخطط الهندسي التنفيذي PDF', fileSize: '22.4 MB' },
        { format: 'DWG', label: 'مخطط أوتوكاد الشامل DWG', fileSize: '45.0 MB' },
        { format: 'PNG', label: 'صورة ثلاثية الأبعاد عالية الدقة', fileSize: '8.1 MB' },
        { format: 'JSON', label: 'بيانات الرفع المساحي BIM JSON', fileSize: '1.2 MB' }
      ]
    },
    {
      id: 'BP-MLQ-02',
      projectId: 'PRJ-001',
      projectName: 'فيلا الملقا المعمارية المودرن',
      title: 'مخطط الواجهات الأربع وقطاعات تركيب رخام ترافنتينو ميكانيكياً',
      code: 'ARC-MLQ-ELEV-02',
      category: 'elevation',
      categoryLabel: 'واجهات وقطاعات (Elevations)',
      totalAreaM2: 450,
      version: 'v2.1',
      updatedAt: '2026-08-18',
      magicplanId: 'mp-mlq-elev-01',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80',
      description: 'تفاصيل تثبيت شاسيهات الألمنيوم للواجهات الميكانيكية، العوازل الحرارية والمائية، وإضاءات الليد المخفية.',
      approvedBy: 'م. ياسمين الخالدي',
      availableFormats: [
        { format: 'PDF', label: 'لوحات الواجهات المعتمدة PDF', fileSize: '16.5 MB' },
        { format: 'DWG', label: 'أوتوكاد تفاصيل الواجهات DWG', fileSize: '32.0 MB' }
      ]
    },
    {
      id: 'BP-AQE-01',
      projectId: 'PRJ-002',
      projectName: 'مجمع العقيق التجاري والمكتبي',
      title: 'المسقط المعماري لمستوى البلازا والمحلات التجارية المفتوحة',
      code: 'ARC-AQE-PLAZA-01',
      category: 'floor_plan',
      categoryLabel: 'مسقط أفقي تجاري (Plaza Plan)',
      totalAreaM2: 4600,
      roomsCount: 22,
      wallPerimeterM: 680.0,
      version: 'v2.4',
      updatedAt: '2026-08-22',
      magicplanId: 'mp-aqe-comm-440',
      thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      description: 'مخطط مساحات التأجير التجاري، مسارات حركة المشاة، كود الإتاحة لذوي الاحتياجات، ومواقف السيارات الذكية.',
      approvedBy: 'م. ياسمين الخالدي',
      availableFormats: [
        { format: 'PDF', label: 'مخطط البلازا والمكاتب PDF', fileSize: '38.0 MB' },
        { format: 'DWG', label: 'أوتوكاد المشروع الكامل DWG', fileSize: '72.0 MB' },
        { format: 'JSON', label: 'بيانات جداول المساحات BIM JSON', fileSize: '3.4 MB' }
      ]
    },
    {
      id: 'BP-AQE-02',
      projectId: 'PRJ-002',
      projectName: 'مجمع العقيق التجاري والمكتبي',
      title: 'مخطط مسارات الهروب ومكافحة الحريق المعتمد من الدفاع المدني',
      code: 'SAF-AQE-FIRE-01',
      category: 'safety_plan',
      categoryLabel: 'مخطط سلامة ودفاع مدني (Safety Plan)',
      totalAreaM2: 4600,
      version: 'v1.0',
      updatedAt: '2026-08-24',
      magicplanId: 'mp-aqe-safety-12',
      thumbnailUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
      description: 'شبكة الرشاشات الأوتوماتيكية، مضخات الحريق، أبواب الطوارئ المقاومة للحريق لمدة ساعتين وتوزيع كواشف الدخان.',
      approvedBy: 'م. طارق الخضير',
      availableFormats: [
        { format: 'PDF', label: 'مخطط السلامة المعتمد PDF', fileSize: '19.8 MB' },
        { format: 'DWG', label: 'أوتوكاد أنظمة السلامة DWG', fileSize: '31.2 MB' }
      ]
    }
  ];

  // Filtering
  const filteredBlueprints = blueprintsData.filter(bp => {
    const matchesProject = selectedProjectFilter === 'all' || bp.projectId === selectedProjectFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || bp.category === selectedCategoryFilter;
    const matchesFormat = selectedFormatFilter === 'all' || bp.availableFormats.some(f => f.format === selectedFormatFilter);
    const matchesSearch = 
      bp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesProject && matchesCategory && matchesFormat && matchesSearch;
  });

  // Summary Metrics
  const totalBlueprintsCount = blueprintsData.length;
  const totalSurveyedArea = blueprintsData.reduce((acc, bp) => acc + bp.totalAreaM2, 0);
  const totalRoomsMapped = blueprintsData.reduce((acc, bp) => acc + (bp.roomsCount || 0), 0);

  // Sync Handler
  const handleSyncMagicPlanCloud = async () => {
    setIsSyncing(true);
    await syncWithMagicPlan();
    setIsSyncing(false);
    addNotification({
      title: 'تم تحديث المخططات المعمارية',
      message: 'تم سحب أحدث المساقط والأبعاد المترية من MagicPlan Cloud v2 بنجاح.',
      priority: 'normal'
    });
  };

  // Real Download Trigger Generator
  const handleDownloadFile = (blueprint: ArchitecturalBlueprintItem, format: string, label: string) => {
    const filename = `${blueprint.code}_${blueprint.version}_${format}.${format.toLowerCase()}`;
    
    let content = '';
    let mimeType = 'text/plain';

    if (format === 'JSON') {
      content = JSON.stringify({
        project: blueprint.projectName,
        blueprintCode: blueprint.code,
        magicplanId: blueprint.magicplanId,
        version: blueprint.version,
        totalAreaM2: blueprint.totalAreaM2,
        approvedBy: blueprint.approvedBy,
        syncDate: new Date().toISOString(),
        floors: magicPlanDesign.floors,
        system: 'AzProjects Architecture Cloud v2.5'
      }, null, 2);
      mimeType = 'application/json';
    } else if (format === 'SVG') {
      content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 450" width="700" height="450">
        <rect width="100%" height="100%" fill="#0f172a"/>
        <text x="350" y="40" fill="#38bdf8" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">
          ${blueprint.title} - ${blueprint.code}
        </text>
        <text x="350" y="65" fill="#94a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">
          المساحة الإجمالية: ${blueprint.totalAreaM2} م² | معتمد: ${blueprint.approvedBy}
        </text>
        <rect x="30" y="90" width="640" height="320" fill="#1e293b" stroke="#38bdf8" stroke-width="3" rx="8"/>
        <text x="350" y="250" fill="#f8fafc" font-size="14" font-family="sans-serif" text-anchor="middle">
          MagicPlan Architectural Vector CAD Data
        </text>
      </svg>`;
      mimeType = 'image/svg+xml';
    } else {
      // For PDF / DWG / DXF: generate clean structured document payload
      content = `%PDF-1.4 Architectural Drawing
Title: ${blueprint.title}
Code: ${blueprint.code}
Project: ${blueprint.projectName}
Total Area: ${blueprint.totalAreaM2} m2
Approved by: ${blueprint.approvedBy}
MagicPlan Cloud Asset ID: ${blueprint.magicplanId}
Generated via AzProjects Architecture Engine.`;
      mimeType = format === 'PDF' ? 'application/pdf' : 'application/octet-stream';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessMsg(`تم بدء تحميل ملف ${format} (${blueprint.code})`);
    setTimeout(() => setDownloadSuccessMsg(null), 4000);

    addNotification({
      title: 'تحميل مخطط معماري',
      message: `تم تنزيل ${label} (${blueprint.code}) بنجاح.`,
      priority: 'normal'
    });
  };

  // Download All Bundle
  const handleDownloadAllBundle = () => {
    filteredBlueprints.forEach((bp, idx) => {
      setTimeout(() => {
        handleDownloadFile(bp, 'PDF', `المخطط التنفيذي ${bp.code}`);
      }, idx * 250);
    });
  };

  const getRoomFill = (type: string) => {
    switch (type) {
      case 'living': return 'rgba(59, 130, 246, 0.25)';
      case 'dining': return 'rgba(16, 185, 129, 0.25)';
      case 'kitchen': return 'rgba(245, 158, 11, 0.25)';
      case 'bedroom': return 'rgba(168, 85, 247, 0.25)';
      case 'service': return 'rgba(139, 92, 246, 0.25)';
      case 'garden': return 'rgba(34, 197, 94, 0.25)';
      default: return 'rgba(148, 163, 184, 0.25)';
    }
  };

  const getRoomStroke = (type: string) => {
    switch (type) {
      case 'living': return '#3b82f6';
      case 'dining': return '#10b981';
      case 'kitchen': return '#f59e0b';
      case 'bedroom': return '#a855f7';
      case 'service': return '#8b5cf6';
      case 'garden': return '#22c55e';
      default: return '#64748b';
    }
  };

  const activeFloor = magicPlanDesign.floors[selectedFloorIndex] || magicPlanDesign.floors[0];
  const activeRooms = activeFloor?.rooms || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200" dir="rtl">
      
      {/* Toast Download Notification */}
      {downloadSuccessMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/50 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold">
            {downloadSuccessMsg}
          </div>
        </div>
      )}

      {/* Top Banner: Cloud MagicPlan Sync Status & Fast Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-900/50 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/90 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                المستندات والمخططات المعمارية (MagicPlan Cloud)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>متزامن وموثق هندسياً</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              استعراض المخططات الهندسية والمساقط المرفوعة من MagicPlan مع الأبعاد المترية، وقابلة للتحميل بصيغ PDF و CAD DWG و SVG.
            </p>
          </div>
        </div>

        {/* Sync & Batch Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleSyncMagicPlanCloud}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
            title="مزامنة فورية للمخططات من سيرفر MagicPlan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة MagicPlan'}</span>
          </button>

          <button
            onClick={handleDownloadAllBundle}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition cursor-pointer"
            title="تحميل كافة المخططات المعمارية المعتمدة كحزمة واحدة"
          >
            <FolderDown className="w-3.5 h-3.5 text-indigo-300" />
            <span>تحميل الحزمة الكاملة PDF</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards: High Density Architectural Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
              المخططات واللوحات المعتمدة
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalBlueprintsCount} <span className="text-xs font-normal text-slate-400">لوحة</span>
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              جاهزة للتنفيذ والطباعة
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
              مساحات الرفع المعماري الموثق
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              {(totalSurveyedArea).toLocaleString()} <span className="text-xs font-normal text-slate-400 font-sans">م²</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              مسح ليزري دقيق عبر MagicPlan
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
              صيغ التصدير والتحميل المتاحة
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-bold">PDF</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold">DWG</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold">DXF</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">SVG</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold">JSON</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              متوافقة مع AutoCAD و Revit و BIM
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
            <FileCode className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Field */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم المخطط، اسم المشروع، أو الفراغ المعماري..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Filters Group */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Project Filter */}
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all">كافة المشاريع ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all">كافة أنواع المخططات</option>
              <option value="floor_plan">مساقط أفقية (Floor Plans)</option>
              <option value="elevation">واجهات وقطاعات (Elevations)</option>
              <option value="arabesque_detail">تفاصيل أرابيسك و CNC</option>
              <option value="safety_plan">مخططات السلامة والدفاع المدني</option>
            </select>

            {/* Format Filter */}
            <select
              value={selectedFormatFilter}
              onChange={(e) => setSelectedFormatFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all">كافة الصيغ (All Formats)</option>
              <option value="PDF">ملفات PDF</option>
              <option value="DWG">ملفات AutoCAD DWG</option>
              <option value="DXF">ملفات DXF (CNC)</option>
              <option value="SVG">ملفات SVG</option>
              <option value="JSON">بيانات BIM JSON</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${activeViewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-500'}`}
                title="عرض البطاقات المنظمة"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveViewMode('interactive')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${activeViewMode === 'interactive' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-500'}`}
                title="المستعرض التفاعلي المباشر"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Main Content Area */}
      {activeViewMode === 'grid' ? (
        
        /* Grid of Organized Downloadable Blueprint Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBlueprints.map((blueprint) => (
            <div 
              key={blueprint.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                
                {/* Thumbnail Image / Preview Header with Badges */}
                <div className="relative h-48 bg-slate-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={blueprint.thumbnailUrl}
                    alt={blueprint.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85 group-hover:opacity-100"
                  />
                  
                  {/* Subtle Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-md">
                      {blueprint.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-slate-200 text-[10px] font-mono font-bold border border-slate-700">
                      {blueprint.version}
                    </span>
                  </div>

                  {/* Bottom Quick Overlay: Area & Rooms */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                    <span className="font-bold flex items-center gap-1 text-[11px] bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-xs">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>{blueprint.totalAreaM2} م²</span>
                    </span>
                    {blueprint.roomsCount && (
                      <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-xs font-mono text-slate-300">
                        {blueprint.roomsCount} فراغ معماري
                      </span>
                    )}
                  </div>

                </div>

                {/* Card Details */}
                <div className="p-4 space-y-3">
                  
                  {/* Project Name & Category */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="truncate max-w-[200px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {blueprint.projectName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium">
                      {blueprint.categoryLabel}
                    </span>
                  </div>

                  {/* Blueprint Title */}
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {blueprint.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {blueprint.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>معتمد: {blueprint.approvedBy}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{blueprint.updatedAt}</span>
                    </span>
                  </div>

                </div>

              </div>

              {/* Card Footer: Download Buttons Grid & Preview CTA */}
              <div className="p-4 pt-0 space-y-2.5">
                
                {/* Download Formats Buttons Grid */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400">تحميل المخطط بالصيغ المعتمدة:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {blueprint.availableFormats.map((fmt) => (
                      <button
                        key={fmt.format}
                        onClick={() => handleDownloadFile(blueprint, fmt.format, fmt.label)}
                        className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer group/btn"
                        title={`تحميل ${fmt.label} (${fmt.fileSize})`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Download className="w-3 h-3 text-slate-400 group-hover/btn:text-indigo-600" />
                          <span className="font-mono font-bold text-[10px]">{fmt.format}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">{fmt.fileSize}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inspect Blueprint Interactive Modal Trigger */}
                <button
                  onClick={() => {
                    setInspectingBlueprint(blueprint);
                    setSelectedRoom(null);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>معاينة وفحص الأبعاد الهندسية</span>
                </button>

              </div>

            </div>
          ))}
        </div>

      ) : (
        
        /* Interactive Live SVG Blueprint Viewer Mode */
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-xl space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">طابق العرض:</span>
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                {magicPlanDesign.floors.map((flr, idx) => (
                  <button
                    key={flr.floorId}
                    onClick={() => {
                      setSelectedFloorIndex(idx);
                      setSelectedRoom(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${selectedFloorIndex === idx ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {flr.floorName}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDimensions(!showDimensions)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${showDimensions ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
              >
                📏 الأبعاد
              </button>

              <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.5))}
                  className="p-1 text-slate-300 hover:text-white cursor-pointer"
                  title="تكبير"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-slate-400 px-1 font-mono">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
                  className="p-1 text-slate-300 hover:text-white cursor-pointer"
                  title="تصغير"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 text-slate-300 hover:text-white cursor-pointer"
                  title="إعادة ضبط"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* SVG Floor Canvas & Room Inspector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SVG Canvas (2 Cols) */}
            <div className="lg:col-span-2 relative min-h-[460px] bg-slate-950 rounded-xl border border-slate-800 p-4 flex items-center justify-center overflow-hidden">
              <div 
                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
                className="w-full max-w-[620px] aspect-[4/3] relative select-none"
              >
                <svg viewBox="0 0 700 450" className="w-full h-full drop-shadow-2xl">
                  {/* Outer Boundary */}
                  <rect x="15" y="15" width="670" height="420" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" opacity="0.3" />
                  {/* Building Main Perimeter Wall */}
                  <rect x="25" y="25" width="650" height="400" fill="#0f172a" stroke="#475569" strokeWidth="6" rx="4" />

                  {/* Rooms Render */}
                  {activeRooms.map((room) => {
                    const isSelected = selectedRoom?.id === room.id;
                    const { x, y, width, height } = room.coordinates;

                    return (
                      <g
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className="cursor-pointer transition-all duration-200"
                      >
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={isSelected ? 'rgba(99, 102, 241, 0.5)' : getRoomFill(room.type)}
                          stroke={isSelected ? '#818cf8' : getRoomStroke(room.type)}
                          strokeWidth={isSelected ? '3' : '1.5'}
                          rx="3"
                        />
                        <text
                          x={x + width / 2}
                          y={y + height / 2 - 6}
                          fill="#f8fafc"
                          fontSize="12"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none drop-shadow-md"
                        >
                          {room.name}
                        </text>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + 12}
                          fill="#38bdf8"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none font-mono"
                        >
                          {room.areaM2} m²
                        </text>
                        {showDimensions && (
                          <text
                            x={x + width / 2}
                            y={y - 4}
                            fill="#94a3b8"
                            fontSize="9"
                            textAnchor="middle"
                            className="font-mono"
                          >
                            {room.dimensions}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Room Inspector Details (1 Col) */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-400" />
                    <span>مفتش الغرفة والفراغ</span>
                  </h4>
                  {selectedRoom && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-900 text-indigo-300">
                      محدد
                    </span>
                  )}
                </div>

                {selectedRoom ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400">اسم الغرفة</span>
                      <p className="text-base font-bold text-white">{selectedRoom.name}</p>
                      <p className="text-[11px] text-slate-400">{selectedRoom.nameEn}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-900/80 rounded-lg border border-slate-700 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">المساحة</span>
                        <span className="text-sm font-bold text-indigo-400">{selectedRoom.areaM2} م²</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">الأبعاد</span>
                        <span className="text-xs font-bold text-slate-200">{selectedRoom.dimensions}</span>
                      </div>
                    </div>

                    {selectedRoom.annotations && (
                      <div className="space-y-1">
                        <span className="font-bold text-slate-300 text-[11px]">ملاحظات التنفيذ:</span>
                        <div className="space-y-1 text-[10px] text-slate-400">
                          {selectedRoom.annotations.map((a, i) => (
                            <p key={i}>• {a}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    <Compass className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p>انقر على أي فراغ معماري داخل المخطط لفحص تفاصيله الدقيقة.</p>
                  </div>
                )}
              </div>

              {/* Direct Download Action */}
              <button
                onClick={() => handleDownloadFile(blueprintsData[0], 'PDF', 'المسقط المعماري المعتمد')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل المخطط المفتوح PDF</span>
              </button>

            </div>

          </div>

        </div>
      )}

      {/* Interactive Blueprint Inspector Modal */}
      {inspectingBlueprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {inspectingBlueprint.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    الكود الهندسي: {inspectingBlueprint.code} | {inspectingBlueprint.version}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingBlueprint(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Image Preview Large */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-[380px]">
                <img
                  src={inspectingBlueprint.thumbnailUrl}
                  alt={inspectingBlueprint.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[360px] w-auto object-contain"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-slate-300 px-2.5 py-1 rounded text-xs font-mono">
                  MagicPlan ID: {inspectingBlueprint.magicplanId}
                </div>
              </div>

              {/* Description & Technical Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">المساحة الإجمالية</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{inspectingBlueprint.totalAreaM2} م²</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">المشروع المرتبط</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate block">{inspectingBlueprint.projectName}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">المهندس المعتمد</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{inspectingBlueprint.approvedBy}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">الوصف الهندسي:</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {inspectingBlueprint.description}
                </p>
              </div>

              {/* Download Bar Inside Modal */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">
                  تحميل فوري للمخطط بالصيغ الهندسية:
                </span>
                <div className="flex flex-wrap gap-2">
                  {inspectingBlueprint.availableFormats.map((fmt) => (
                    <button
                      key={fmt.format}
                      onClick={() => handleDownloadFile(inspectingBlueprint, fmt.format, fmt.label)}
                      className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{fmt.label}</span>
                      <span className="text-[10px] opacity-70 font-mono">({fmt.fileSize})</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 font-mono">
                آخر تحديث: {inspectingBlueprint.updatedAt}
              </span>
              <button
                onClick={() => setInspectingBlueprint(null)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
