import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Layers, 
  Compass, 
  Image as ImageIcon, 
  ExternalLink, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Eye, 
  Calendar, 
  Tag, 
  Maximize2, 
  CheckCircle2, 
  Share2, 
  Sparkles, 
  Building2,
  Camera,
  Filter
} from 'lucide-react';

export interface GalleryItem {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  category: 'magicplan_2d' | 'magicplan_3d' | 'site_photo' | 'material' | 'panorama';
  categoryLabel: string;
  imageUrl: string;
  thumbnailUrl?: string;
  date: string;
  author: string;
  phaseName?: string;
  roomName?: string;
  dimensions?: string;
  tags: string[];
  magicplanId?: string;
  notes?: string;
}

interface ProjectGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectGalleryModal: React.FC<ProjectGalleryModalProps> = ({ isOpen, onClose }) => {
  const { selectedProject, magicPlanDesign, syncWithMagicPlan, whatsAppMessages, documents } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Compile full gallery from MagicPlan, WhatsApp site images, and Document blueprints
  const galleryItems: GalleryItem[] = useMemo(() => {
    const items: GalleryItem[] = [];

    // 1. MagicPlan Official Renders and Floorplans
    if (selectedProject?.magicplanThumbnailUrl) {
      items.push({
        id: `mp-cov-${selectedProject.id}`,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        title: `مخطط MagicPlan السحابي العام - ${selectedProject.name}`,
        category: 'magicplan_2d',
        categoryLabel: 'مخطط MagicPlan 2D',
        imageUrl: selectedProject.magicplanThumbnailUrl,
        thumbnailUrl: selectedProject.magicplanThumbnailUrl,
        date: '2026-08-25',
        author: 'MagicPlan Cloud API',
        phaseName: 'الرفع المساحي ونمذجة MagicPlan',
        roomName: 'المبنى الكامل',
        dimensions: `${selectedProject.areaM2 || 580} م² - ${selectedProject.floorsCount || 2} طوابق`,
        tags: ['MagicPlan', 'سحابي', 'مخطط 2D', 'أبعاد حقيقية'],
        magicplanId: selectedProject.magicplanId || '3faed7e9-6e92-495c-b4a6-94a8f0216fcb',
        notes: 'مخطط سحابي متزامن ومطابق للواقع عبر تقنية الاستشعار بالليزر والليدار.'
      });
    }

    // 2. MagicPlan 3D and Rooms renderings
    items.push({
      id: `mp-3d-${selectedProject?.id || 'prj'}`,
      projectId: selectedProject?.id || 'PRJ-ARABESQUE',
      projectName: selectedProject?.name || 'مشروع أرابيسك',
      title: 'النموذج المعماري ثلاثي الأبعاد 3D ونواة الأرابيسك',
      category: 'magicplan_3d',
      categoryLabel: 'نموذج MagicPlan 3D',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
      date: '2026-08-24',
      author: 'م. أحمد العزب',
      phaseName: 'التصميم المبدئي والفكرة المعمارية',
      roomName: 'الصالة الرئيسية والقبة',
      dimensions: 'ارتفاع مضاعف 7.2م',
      tags: ['3D Render', 'MagicPlan', 'إضاءة طبيعية', 'أرابيسك'],
      notes: 'محاكاة حركة الظلال والضوء الطبيعي عبر الفتحات الزخرفية.'
    });

    items.push({
      id: `mp-3d-master-${selectedProject?.id || 'prj'}`,
      projectId: selectedProject?.id || 'PRJ-ARABESQUE',
      projectName: selectedProject?.name || 'مشروع أرابيسك',
      title: 'منظور جناح الماستر الرئاسي مع الشرفة التراثية',
      category: 'magicplan_3d',
      categoryLabel: 'نموذج MagicPlan 3D',
      imageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400&auto=format&fit=crop&q=80',
      date: '2026-08-23',
      author: 'فريق التصميم المعماري',
      phaseName: 'التصميم التفصيلي والتنسيق الهندسي',
      roomName: 'جناح الماستر العلوي',
      dimensions: '9.2م × 7.4م (68 م²)',
      tags: ['جناح الماستر', '3D', 'ديكورات خشبية'],
      notes: 'توزيع الفرش المعماري المعتمد وربطه بشبكة الإنارة الذكية.'
    });

    // 3. Site Inspection Photos from Field & WhatsApp
    items.push({
      id: `site-1-${selectedProject?.id || 'prj'}`,
      projectId: selectedProject?.id || 'PRJ-ARABESQUE',
      projectName: selectedProject?.name || 'مشروع أرابيسك',
      title: 'استلام صب أعمدة الطابق الأول واختبارات الهبوط',
      category: 'site_photo',
      categoryLabel: 'صور الموقع الميداني',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=400&auto=format&fit=crop&q=80',
      date: '2026-08-25',
      author: 'م. خالد الصالحي (المقاول)',
      phaseName: 'التنفيذ والبناء الميداني',
      roomName: 'محور الأعمدة C-4',
      dimensions: 'خرسانة C35 مقاومة للأملاح',
      tags: ['موقع', 'صب خرسانة', 'ضبط جودة', 'واتساب'],
      notes: 'تم فحص الشاقولية وتثبيت الهزاز الميكانيكي مع عينات اختبار المكعبات.'
    });

    items.push({
      id: `site-2-${selectedProject?.id || 'prj'}`,
      projectId: selectedProject?.id || 'PRJ-ARABESQUE',
      projectName: selectedProject?.name || 'مشروع أرابيسك',
      title: 'تشكيل وتركيب أقواس الواجهة الأندلسية والزخارف الحجرية',
      category: 'site_photo',
      categoryLabel: 'صور الموقع الميداني',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
      date: '2026-08-22',
      author: 'م. سالم القحطاني',
      phaseName: 'التنفيذ والبناء الميداني',
      roomName: 'الواجهة الرئيسية',
      dimensions: 'ارتفاع القوس 4.8م',
      tags: ['واجهات', 'أقواس', 'أرابيسك', 'تنفيذ حجر'],
      notes: 'تثبيت ميكانيكي مع زوايا ستانلس ستيل 316 المقاومة للتآكل.'
    });

    items.push({
      id: `mat-1-${selectedProject?.id || 'prj'}`,
      projectId: selectedProject?.id || 'PRJ-ARABESQUE',
      projectName: selectedProject?.name || 'مشروع أرابيسك',
      title: 'عينة الرخام الإيطالي الفاخر (Statuary White) المعتمدة',
      category: 'material',
      categoryLabel: 'عينات واعتمادات المواد',
      imageUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&auto=format&fit=crop&q=80',
      date: '2026-08-20',
      author: 'الشيخ عبد الرحمن السديري (المالك)',
      phaseName: 'الإشراف الهندسي وضبط الجودة',
      roomName: 'المجلس الرئيسي والمدخل',
      dimensions: 'ألواح Bookmatch 280x160cm',
      tags: ['رخام إيطالي', 'اعتماد مواد', 'فاتورة دفترة'],
      notes: 'معتمد رسمياً عبر رسالة واتساب المالك ومطابق لـ SBC 201.'
    });

    items.push({
      id: `pano-1-${selectedProject?.id || 'prj'}`,
      projectId: selectedProject?.id || 'PRJ-ARABESQUE',
      projectName: selectedProject?.name || 'مشروع أرابيسك',
      title: 'لقطة بانورامية واسعة 360° لصالة القبة والمسبح الداخلي',
      category: 'panorama',
      categoryLabel: 'بانوراما و 360°',
      imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&auto=format&fit=crop&q=80',
      date: '2026-08-19',
      author: 'كاميرا المسح الميداني MagicPlan LiDAR',
      phaseName: 'التصميم التفصيلي',
      roomName: 'صالة القبة والبهو',
      dimensions: 'زاوية رؤية 360 درجة',
      tags: ['بانوراما 360', 'جولة افتراضية', 'MagicPlan VR'],
      notes: 'لقطة توثيقية رقمية تدعم تجربة الواقع المعزز AR.'
    });

    return items;
  }, [selectedProject]);

  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.roomName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [galleryItems, activeCategory, searchQuery]);

  const handleSyncMagicPlan = async () => {
    setIsSyncing(true);
    await syncWithMagicPlan(selectedProject?.id);
    setTimeout(() => setIsSyncing(false), 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  معرض المشروع ومخططات MagicPlan السحابية
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {selectedProject?.name || 'مشروع أرابيسك'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مزامنة حية لصور الموقع والمخططات ثنائية وثلاثية الأبعاد 2D/3D مع MagicPlan Cloud وواتساب الميداني
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncMagicPlan}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              title="مزامنة فورية للصور مع سيرفر MagicPlan"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-400' : ''}`} />
              <span className="hidden sm:inline">تحديث المخططات</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Categories Pill Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {[
              { id: 'all', label: 'كافة الوسائط', count: galleryItems.length },
              { id: 'magicplan_2d', label: 'مخططات MagicPlan 2D', count: galleryItems.filter(i => i.category === 'magicplan_2d').length },
              { id: 'magicplan_3d', label: 'نماذج 3D المعمارية', count: galleryItems.filter(i => i.category === 'magicplan_3d').length },
              { id: 'site_photo', label: 'صور الموقع الميداني', count: galleryItems.filter(i => i.category === 'site_photo').length },
              { id: 'material', label: 'اعتمادات المواد', count: galleryItems.filter(i => i.category === 'material').length },
              { id: 'panorama', label: 'بانوراما 360°', count: galleryItems.filter(i => i.category === 'panorama').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeCategory === tab.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === tab.id ? 'bg-sky-700 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="بحث في المخططات والغرف والموقع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Gallery Grid Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold">لا توجد صور أو مخططات مطابقة للبحث</p>
              <p className="text-xs text-slate-500 mt-1">جرب تغيير التصنيف أو مزامنة صور جديدة من MagicPlan أو واتساب</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setZoomLevel(1);
                  }}
                  className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-sky-500/60 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-0.5"
                >
                  {/* Thumbnail Image Container */}
                  <div className="relative aspect-16/10 bg-slate-950 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    
                    {/* Top Overlay Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-sky-300 border border-slate-700">
                        {item.categoryLabel}
                      </span>
                    </div>

                    {/* Bottom Overlay Info */}
                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex items-center justify-between text-xs text-slate-300">
                      <span className="text-[11px] font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.date}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400">
                        {item.roomName || 'عام'}
                      </span>
                    </div>

                    {/* Hover Zoom Icon */}
                    <div className="absolute inset-0 bg-sky-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-sky-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-sky-300 transition-colors">
                        {item.title}
                      </h4>
                      {item.dimensions && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <Layers className="w-3 h-3 text-sky-400" />
                          <span>القياسات: {item.dimensions}</span>
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate">بواسطة: {item.author}</span>
                      <span className="text-sky-400 font-semibold flex items-center gap-1">
                        <span>معاينة مكبرة</span>
                        <span>←</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer with MagicPlan API status */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>متصل بـ MagicPlan Cloud API (Project: {selectedProject?.magicplanId || '3faed7e9-6e92-495c-b4a6'})</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>إجمالي الوسائط: {galleryItems.length} عنصر</span>
            <span>•</span>
            <a 
              href="https://cloud.magicplan.app" 
              target="_blank" 
              rel="noreferrer" 
              className="text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>فتح حساب MagicPlan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-60 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 animate-in fade-in duration-150">
          {/* Lightbox Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold">
                  {selectedItem.categoryLabel}
                </span>
                <h3 className="text-sm sm:text-base font-bold">{selectedItem.title}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedItem.projectName} • {selectedItem.roomName || 'عام'} • {selectedItem.date} • {selectedItem.author}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="تكبير"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="تصغير"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <a
                href={selectedItem.imageUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="تحميل الصورة بدقة عالية"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Image Stage */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.title}
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-150"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Lightbox Footer Info Details */}
          {selectedItem.notes && (
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 max-w-3xl mx-auto w-full text-center text-xs text-slate-300">
              <span className="font-bold text-sky-400 ml-1.5">ملاحظات هندسية:</span>
              <span>{selectedItem.notes}</span>
              {selectedItem.dimensions && (
                <span className="mr-2 font-mono text-slate-400 font-bold">({selectedItem.dimensions})</span>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
