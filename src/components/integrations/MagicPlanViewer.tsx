import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BlueprintFloor, BlueprintRoom } from '../../types';
import { 
  Compass, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  RefreshCw, 
  Info, 
  CheckCircle2,
  Image,
  ExternalLink,
  UserCheck
} from 'lucide-react';

export const MagicPlanViewer: React.FC = () => {
  const { magicPlanDesign, syncWithMagicPlan, selectedProject } = useApp();
  const [selectedFloorIndex, setSelectedFloorIndex] = useState<number>(0);
  const [selectedRoom, setSelectedRoom] = useState<BlueprintRoom | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'interactive' | 'thumbnail'>('interactive');

  const activeFloor = magicPlanDesign.floors[selectedFloorIndex] || magicPlanDesign.floors[0];
  const currentRooms = activeFloor?.rooms || [];
  const totalFloorArea = activeFloor?.totalAreaM2 || 0;

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithMagicPlan(selectedProject?.id);
    setIsSyncing(false);
  };

  const getRoomFill = (type: string) => {
    switch (type) {
      case 'living': return 'rgba(59, 130, 246, 0.2)'; // Blue
      case 'dining': return 'rgba(16, 185, 129, 0.2)'; // Emerald
      case 'kitchen': return 'rgba(245, 158, 11, 0.2)'; // Amber
      case 'bedroom': return 'rgba(168, 85, 247, 0.2)'; // Purple
      case 'bathroom': return 'rgba(6, 182, 212, 0.2)'; // Cyan
      case 'service': return 'rgba(139, 92, 246, 0.2)'; // Violet
      case 'garden': return 'rgba(34, 197, 94, 0.2)'; // Green
      default: return 'rgba(148, 163, 184, 0.2)';
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

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header and Sync Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                مستعرض مخططات وتصاميم MagicPlan التفاعلية
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                v{magicPlanDesign.version} متزامن
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              سحب القياسات الدقيقة للغرف والجدران تلقائياً من تطبيق MagicPlan عبر الـ Cloud API
            </p>
          </div>
        </div>

        {/* Sync & Export CTA */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'interactive'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>مخطط تفاعلي 2D</span>
            </button>
            <button
              onClick={() => setViewMode('thumbnail')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'thumbnail'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>المعاينة السحابية</span>
            </button>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>مزامنة من MagicPlan</span>
          </button>

          <button
            onClick={() => alert('تم تصدير المخطط المعماري بصيغتي PDF و DWG بنجاح!')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير DWG/PDF</span>
          </button>
        </div>
      </div>

      {/* Blueprint Visual Canvas & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Floor Plan Canvas (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[580px]">
          
          {/* Blueprint Grid Texture Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />
          
          {/* Canvas Top Bar: Floor Switcher, Zoom, Layers */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            
            {/* Floor Switcher Tabs */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              {magicPlanDesign.floors.map((floor, idx) => (
                <button
                  key={floor.floorId}
                  onClick={() => { setSelectedFloorIndex(idx); setSelectedRoom(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedFloorIndex === idx 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {floor.floorName}
                </button>
              ))}
            </div>

            {/* Canvas Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDimensions(!showDimensions)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                  showDimensions 
                    ? 'bg-blue-600/30 text-blue-300 border-blue-500' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="إظهار الأبعاد والقياسات المترية"
              >
                📏 الأبعاد
              </button>

              <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.5))}
                  className="p-1 text-slate-300 hover:text-white"
                  title="تكبير"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-slate-400 px-1 font-mono">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
                  className="p-1 text-slate-300 hover:text-white"
                  title="تصغير"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 text-slate-300 hover:text-white"
                  title="إعادة ضبط"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* 2D Interactive Architectural SVG Floor Plan OR MagicPlan Cloud Thumbnail */}
          <div className="relative z-10 flex-1 flex items-center justify-center py-6 overflow-hidden">
            {viewMode === 'thumbnail' ? (
              <div className="w-full max-w-[650px] flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 animate-in fade-in">
                <div className="relative w-full max-h-[380px] rounded-lg overflow-hidden border border-slate-700/80 bg-slate-900 flex items-center justify-center">
                  <img
                    src={magicPlanDesign.thumbnailUrl}
                    alt="MagicPlan Cloud Blueprint Thumbnail"
                    referrerPolicy="no-referrer"
                    className="max-h-[360px] w-auto object-contain rounded transition-transform hover:scale-105"
                  />
                </div>
                <div className="w-full flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                  <span>ID: {magicPlanDesign.designId}</span>
                  <span className="text-sky-400 font-bold">MagicPlan Live Cloud Asset</span>
                </div>
              </div>
            ) : (
              <div 
                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
                className="w-full max-w-[650px] aspect-[4/3] relative select-none"
              >
                <svg
                  viewBox="0 0 700 450"
                  className="w-full h-full drop-shadow-2xl"
                >
                  {/* External Property Boundary Wall */}
                  <rect
                    x="15"
                    y="15"
                    width="670"
                    height="420"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity="0.3"
                  />

                  {/* Building Main Perimeter Walls */}
                  <rect
                    x="25"
                    y="25"
                    width="650"
                    height="400"
                    fill="#0f172a"
                    stroke="#475569"
                    strokeWidth="6"
                    rx="4"
                  />

                  {/* Render Rooms for Current Selected Floor */}
                  {currentRooms.map((room) => {
                    const isSelected = selectedRoom?.id === room.id;
                    const { x, y, width, height } = room.coordinates;

                    return (
                      <g
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className="cursor-pointer transition-all duration-200"
                      >
                        {/* Room Area Rectangle */}
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={isSelected ? 'rgba(59, 130, 246, 0.45)' : getRoomFill(room.type)}
                          stroke={isSelected ? '#60a5fa' : getRoomStroke(room.type)}
                          strokeWidth={isSelected ? '3' : '1.5'}
                          rx="3"
                        />

                        {/* Room Label & Area */}
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

                        {/* Dimension Indicators if enabled */}
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
            )}
          </div>

          {/* Canvas Bottom Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500"></span>معيشة وضيافة</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>طعام</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span>مطبخ وخدمات</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500"></span>غرف نوم</span>
            </div>
            <div>
              <span>إجمالي مساحة الطابق: <strong className="text-white font-mono">{totalFloorArea} م²</strong></span>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Selected Room Inspector & MagicPlan Metadata */}
        <div className="space-y-4">
          
          {/* Room Inspector Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>مفتش الغرفة والفراغ</span>
              </h3>
              {selectedRoom && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  محدد
                </span>
              )}
            </div>

            {selectedRoom ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">اسم الغرفة / الفراغ</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{selectedRoom.name}</p>
                  <p className="text-xs text-slate-500">{selectedRoom.nameEn}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/60 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">المساحة الصافية</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedRoom.areaM2} م²</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">الأبعاد المترية</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedRoom.dimensions}</span>
                  </div>
                </div>

                {/* Annotations */}
                {selectedRoom.annotations && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">الملاحظات المعمارية:</span>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      {selectedRoom.annotations.map((a, i) => (
                        <p key={i}>• {a}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Compass className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
                <p>انقر على أي غرفة في المخطط التفاعلي لعرض تفاصيلها ومساحتها المعتمدة.</p>
              </div>
            )}
          </div>

          {/* MagicPlan Cloud Sync Status */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">سجل مزامنة MagicPlan Cloud</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>متزامن</span>
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
              <p className="truncate"><strong>Design ID:</strong> {magicPlanDesign.designId}</p>
              <p><strong>المساحة الإجمالية:</strong> {magicPlanDesign.totalAreaM2} م² ({magicPlanDesign.roomsCount} فراغ)</p>
              <p><strong>المحيط الإجمالي:</strong> {magicPlanDesign.wallPerimeterM} م</p>
              {selectedProject?.assigneeEmail && (
                <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-sans pt-1 border-t border-slate-200 dark:border-slate-700">
                  <UserCheck className="w-3 h-3 text-sky-500" />
                  <span>المسؤول: {selectedProject.assigneeEmail}</span>
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
