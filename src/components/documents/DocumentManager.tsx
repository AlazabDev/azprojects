import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentItem, DocumentType } from '../../types';
import { GooglePickerButton } from './GooglePickerButton';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Plus, 
  File, 
  Image, 
  Folder, 
  Layers, 
  Tag, 
  Check, 
  Share2,
  ExternalLink,
  HardDrive
} from 'lucide-react';

export const DocumentManager: React.FC = () => {
  const { projectDocuments, addDocument, deleteDocument, selectedProject, projectPhases, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    name: '',
    description: '',
    documentType: 'blueprint' as DocumentType,
    phaseId: projectPhases[0]?.id || '',
    fileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&auto=format&fit=crop&q=80',
    tags: 'مخططات، معماري، معتمد'
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !uploadData.name) return;

    const phase = projectPhases.find(p => p.id === uploadData.phaseId);

    addDocument({
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      phaseId: uploadData.phaseId || projectPhases[0]?.id,
      phaseName: phase?.name || 'مخططات عامة',
      name: uploadData.name,
      description: uploadData.description || 'مستند هندسي معتمد',
      fileUrl: uploadData.fileUrl,
      fileType: uploadData.documentType === 'photo' ? 'image/jpeg' : 'application/pdf',
      fileSize: 4500000,
      version: 1,
      documentType: uploadData.documentType,
      uploadedBy: currentUser.id,
      uploadedByName: currentUser.name,
      tags: uploadData.tags.split('،').map(t => t.trim()).filter(Boolean),
      isPublic: true
    });

    setShowUploadModal(false);
    setUploadData({
      name: '',
      description: '',
      documentType: 'blueprint',
      phaseId: projectPhases[0]?.id || '',
      fileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&auto=format&fit=crop&q=80',
      tags: 'مخططات، معماري، معتمد'
    });
  };

  const filteredDocuments = projectDocuments.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || d.documentType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'contract': return { label: 'عقد هندسي / قانوني', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
      case 'blueprint': return { label: 'مخطط CAD / معماري', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'permit': return { label: 'رخصة بناء معتمدة', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'invoice': return { label: 'فاتورة ضريبية', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      case 'report': return { label: 'تقرير فحص هندسي', bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' };
      case 'photo': return { label: 'صورة توثيق ميداني', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
      default: return { label: 'مستند عام', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>المستندات، المخططات الهندسية ورخص البناء ({projectDocuments.length} ملفات)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            مستودع الوثائق الرقمية المعتمدة، تصاميم CAD، عقود المقاولين وتقارير الاستشاري متكامل مع Google Drive
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <GooglePickerButton />
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>إضافة رابط مخصص</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، الوسم، أو الوصف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs pr-9 pl-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            <option value="all">جميع التصنيفات</option>
            <option value="blueprint">مخططات CAD وتصاميم</option>
            <option value="permit">رخص بناء وتراخيص</option>
            <option value="contract">عقود واتفاقيات</option>
            <option value="invoice">فواتير ومستخلصات</option>
            <option value="report">تقارير فحص</option>
            <option value="photo">صور الموقع</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => {
          const typeBadge = getTypeLabel(doc.documentType);

          return (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-2.5">
                
                {/* Header Badge & Version */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${typeBadge.bg}`}>
                    {typeBadge.label}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">v{doc.version}.0</span>
                </div>

                {/* Name & Phase */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {doc.phaseName || 'مستندات المشروع العامة'}
                  </p>
                </div>

                {/* Preview Thumbnail if image */}
                {doc.fileUrl && doc.fileUrl.startsWith('http') && (
                  <div 
                    onClick={() => setPreviewDoc(doc)}
                    className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer border border-slate-100 dark:border-slate-700"
                  >
                    <img
                      src={doc.fileUrl}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <Eye className="w-5 h-5 drop-shadow" />
                    </div>
                  </div>
                )}

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

              </div>

              {/* Footer Meta & Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
                <span>{new Date(doc.uploadedAt).toLocaleDateString('ar-SA')}</span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                    title="معاينة المستند"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                    title="تحميل الملف"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                    title="حذف المستند"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{previewDoc.name}</h3>
                <span className="text-xs text-slate-400">{previewDoc.uploadedByName} • v{previewDoc.version}.0</span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[450px] overflow-hidden">
              <img src={previewDoc.fileUrl} alt={previewDoc.name} className="max-h-[420px] object-contain rounded-lg" />
            </div>

            <div className="p-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">{previewDoc.description}</span>
              <a
                href={previewDoc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-xs"
              >
                تحميل الملف الأصلي
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">رفع وثيقة / مخطط معماري جديد</h3>
            
            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم الملف / المخطط *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: المخططات الإنشائية المعتمدة - البلدية.dwg"
                  value={uploadData.name}
                  onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نوع المستند</label>
                  <select
                    value={uploadData.documentType}
                    onChange={(e) => setUploadData({ ...uploadData, documentType: e.target.value as DocumentType })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="blueprint">مخططات CAD وتصاميم</option>
                    <option value="permit">رخصة بناء وتراخيص</option>
                    <option value="contract">عقد هندسي / اتفاقية</option>
                    <option value="invoice">فاتورة / مستخلص</option>
                    <option value="report">تقرير فحص موقع</option>
                    <option value="photo">صورة توثيقية</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المرحلة المرتبطة</label>
                  <select
                    value={uploadData.phaseId}
                    onChange={(e) => setUploadData({ ...uploadData, phaseId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white cursor-pointer"
                  >
                    {projectPhases.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رابط الملف / الصورة</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={uploadData.fileUrl}
                    onChange={(e) => setUploadData({ ...uploadData, fileUrl: e.target.value })}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  />
                  <GooglePickerButton 
                    variant="compact"
                    onImportComplete={() => setShowUploadModal(false)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الوسوم (مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700"
                >
                  تأكيد الرفع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
