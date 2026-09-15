import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  FolderSync, 
  Send, 
  Edit3, 
  Eye, 
  ShieldCheck, 
  Layers, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  FileCheck, 
  FileCode, 
  Share2, 
  Copy,
  LogOut,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  listGoogleDocs, 
  getGoogleDoc, 
  createGoogleDoc, 
  appendGoogleDocText, 
  deleteGoogleDoc, 
  GoogleDriveDocFile, 
  GoogleDocDetail, 
  CONSTRUCTION_DOC_TEMPLATES, 
  ConstructionDocTemplate 
} from '../../services/googleDocsService';
import { 
  initGoogleAuth, 
  googleSignIn, 
  logoutGoogle, 
  openGooglePicker, 
  GooglePickerDoc 
} from '../../services/googleAuth';
import { User } from 'firebase/auth';

export const GoogleDocsHub: React.FC = () => {
  const { selectedProject, currentUser, addDocument } = useApp();

  // Auth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Document List State
  const [docsList, setDocsList] = useState<GoogleDriveDocFile[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals & Active Document View
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConstructionDocTemplate | null>(CONSTRUCTION_DOC_TEMPLATES[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Document Reader / Inspector Modal
  const [activeDocDetail, setActiveDocDetail] = useState<GoogleDocDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Append / Edit Confirmation Modal (Mandated by Workspace Security rules)
  const [showAppendModal, setShowAppendModal] = useState(false);
  const [docToAppend, setDocToAppend] = useState<GoogleDriveDocFile | null>(null);
  const [textToAppend, setTextToAppend] = useState('');
  const [isAppending, setIsAppending] = useState(false);

  // Delete Confirmation Modal
  const [docToDelete, setDocToDelete] = useState<GoogleDriveDocFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Notification Helper
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, _token) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch documents
  const loadDocs = useCallback(async (query = '') => {
    setIsLoadingDocs(true);
    setErrorMsg(null);
    try {
      const files = await listGoogleDocs(query);
      setDocsList(files);
    } catch (err: any) {
      console.error('Failed to list Google Docs:', err);
      setErrorMsg(err.message || 'تعذر جلب ملفات Google Docs');
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    loadDocs(searchQuery);
  }, [loadDocs]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        showToast(`تم تسجيل الدخول بنجاح بحساب ${result.user.email}`);
        loadDocs();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل الدخول بـ Google', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Template Selection in Create Modal
  const handleSelectTemplate = (template: ConstructionDocTemplate) => {
    setSelectedTemplate(template);
    const projectName = selectedProject?.name || 'مشروع فيلا الأندلس';
    setCustomTitle(template.defaultTitle(projectName));
    setCustomContent(
      template.generateContent({
        projectName,
        clientName: selectedProject?.clientName || 'المهندس / فيصل العتيبي',
        engineerName: currentUser?.name || 'م. خالد العزب',
        date: new Date().toLocaleDateString('ar-SA'),
        location: selectedProject?.location || 'الرياض - حي الياسمين',
        costBudget: selectedProject?.contractValue || 850000,
        completionPercent: selectedProject?.progress || 35
      })
    );
  };

  // Open Create Modal and set initial defaults
  const handleOpenCreateModal = () => {
    handleSelectTemplate(CONSTRUCTION_DOC_TEMPLATES[0]);
    setShowCreateModal(true);
  };

  // Submit Create Google Doc
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      showToast('يرجى تحديد عنوان للمستند', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const newDoc = await createGoogleDoc(customTitle, customContent);
      showToast(`تم إنشاء مستند Google Docs بنجاح: "${newDoc.title}"`);

      // Optionally link to project documents
      if (selectedProject) {
        addDocument({
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          phaseId: 'ph-exec',
          phaseName: 'المراسلات والعقود الهندسية',
          name: newDoc.title,
          description: `مستند Google Docs هندسي مُنشأ آلياً (${selectedTemplate?.name || 'مستند مخصص'})`,
          fileUrl: newDoc.url,
          fileType: 'application/vnd.google-apps.document',
          fileSize: 102400,
          version: 1,
          documentType: selectedTemplate?.category === 'contract' ? 'contract' : 'report',
          uploadedBy: currentUser.id,
          uploadedByName: currentUser.name,
          tags: ['Google Docs', selectedTemplate?.nameEn || 'Document', 'Google Workspace'],
          isPublic: true
        });
      }

      setShowCreateModal(false);
      loadDocs();
      // Open in Google Docs
      window.open(newDoc.url, '_blank');
    } catch (err: any) {
      console.error('Error creating Google Doc:', err);
      showToast(err.message || 'فشل إنشاء مستند Google Docs', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Open Document Reader
  const handleViewDoc = async (file: GoogleDriveDocFile) => {
    setIsLoadingDetail(true);
    try {
      const detail = await getGoogleDoc(file.id);
      setActiveDocDetail(detail);
    } catch (err: any) {
      console.error('Error reading Google Doc:', err);
      showToast(err.message || 'فشل قراءة محتوى المستند من Google Docs', 'error');
      // Fallback: open directly
      window.open(file.webViewLink, '_blank');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Open Append Modal with Pre-filled template text
  const handlePrepareAppend = (doc: GoogleDriveDocFile) => {
    setDocToAppend(doc);
    setTextToAppend(
      `--------------------------------------------------\n` +
      `إفادة فحص ميداني إضافية - ${new Date().toLocaleDateString('ar-SA')}\n` +
      `المهندس المشرف: ${currentUser?.name || 'م. المشرف'}\n` +
      `الملاحظة: تم تدقيق البنود التنفيذية ومطابقتها للمواصفات.\n` +
      `حالة الاعتماد: معتمد من إدارة المشاريع بشركة العزب.\n`
    );
    setShowAppendModal(true);
  };

  // Confirm and Execute Append (Workspace security mandate: explicit confirmation)
  const handleConfirmAppend = async () => {
    if (!docToAppend || !textToAppend.trim()) return;

    setIsAppending(true);
    try {
      await appendGoogleDocText(docToAppend.id, textToAppend);
      showToast(`تمت إضافة الملاحظة والاعتماد بنجاح إلى "${docToAppend.name}"`);
      setShowAppendModal(false);
      setDocToAppend(null);
      setTextToAppend('');
      // If currently viewing, reload
      if (activeDocDetail && activeDocDetail.documentId === docToAppend.id) {
        handleViewDoc(docToAppend);
      }
    } catch (err: any) {
      console.error('Error appending text:', err);
      showToast(err.message || 'فشل تحديث المستند', 'error');
    } finally {
      setIsAppending(false);
    }
  };

  // Confirm and Execute Delete (Workspace security mandate: explicit confirmation)
  const handleConfirmDelete = async () => {
    if (!docToDelete) return;

    setIsDeleting(true);
    try {
      await deleteGoogleDoc(docToDelete.id);
      showToast(`تم حذف المستند "${docToDelete.name}" من Google Drive بنجاح`);
      setDocToDelete(null);
      if (activeDocDetail && activeDocDetail.documentId === docToDelete.id) {
        setActiveDocDetail(null);
      }
      loadDocs();
    } catch (err: any) {
      console.error('Error deleting doc:', err);
      showToast(err.message || 'فشل حذف المستند', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Import via Picker
  const handlePickerImport = async () => {
    try {
      await openGooglePicker((docs: GooglePickerDoc[]) => {
        if (!docs || docs.length === 0) return;
        docs.forEach((doc) => {
          if (selectedProject) {
            addDocument({
              projectId: selectedProject.id,
              projectName: selectedProject.name,
              phaseId: 'ph-exec',
              phaseName: 'مستندات Google Drive المعتمدة',
              name: doc.name,
              description: `مستند مستورد عبر Google Picker (معرّف Drive: ${doc.id})`,
              fileUrl: doc.url,
              fileType: doc.mimeType,
              fileSize: doc.sizeBytes || 50000,
              version: 1,
              documentType: 'report',
              uploadedBy: currentUser.id,
              uploadedByName: currentUser.name,
              tags: ['Google Docs', 'Picker', 'Drive'],
              isPublic: true
            });
          }
        });
        showToast(`تم استيراد ${docs.length} مستند بنجاح من Google Drive`);
        loadDocs();
      });
    } catch (err: any) {
      showToast(err.message || 'فشل فتح Google Picker', 'error');
    }
  };

  return (
    <div className="space-y-5" dir="rtl">

      {/* Top Banner / Integration Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-5 border border-blue-800/40 text-white shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  مركز وثائق ومستندات Google Docs (Google Workspace Integration)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Docs & Drive v3 API
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                إنشاء العقود، محاضر الاستلام، تقارير فحص كود البناء SBC وتنسيق العمل مع الاستشاري عبر Google Docs لحظياً
              </p>
            </div>
          </div>

          {/* Account Status / Login */}
          <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto">
            {googleUser ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-300 font-mono text-[11px] truncate max-w-[170px]">{googleUser.email}</span>
                <button
                  onClick={logoutGoogle}
                  className="text-slate-400 hover:text-red-400 p-1 rounded-md transition"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                {isAuthenticating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                )}
                <span>تسجيل الدخول بحساب Google</span>
              </button>
            )}

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>مستند Docs جديد</span>
            </button>
          </div>

        </div>
      </div>

      {/* Notification Toast */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadDocs(searchQuery)}
            placeholder="بحث في مستندات Google Docs المعتمدة..."
            className="w-full bg-slate-50 dark:bg-slate-800 pr-9 pl-4 py-2 rounded-xl text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => loadDocs(searchQuery)}
            disabled={isLoadingDocs}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="تحديث قائمة مستندات Docs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs ? 'animate-spin text-blue-600' : ''}`} />
            <span>تحديث</span>
          </button>

          <button
            onClick={handlePickerImport}
            className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="استعراض مستندات Google Drive عبر Google Picker"
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>استيراد من Drive</span>
          </button>
        </div>

      </div>

      {/* Document Grid / List */}
      {isLoadingDocs ? (
        <div className="py-16 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-semibold">جاري تحميل مستندات Google Docs من سحابة Google...</p>
        </div>
      ) : docsList.length === 0 ? (
        <div className="py-14 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">لم يتم العثور على مستندات Google Docs</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            يمكنك إنشاء أول مستند عقود أو محضر استلام هندسي عبر القوالب الجاهزة بنقرة زر واحدة أو استيراد ملفات موجودة من حسابك في Drive.
          </p>
          <div className="pt-2">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء مستند Docs الآن</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docsList.map((doc) => {
            const isContract = doc.name.includes('عقد') || doc.name.toLowerCase().includes('contract');
            const isInspection = doc.name.includes('فحص') || doc.name.includes('استلام') || doc.name.toLowerCase().includes('inspection');
            const isSBC = doc.name.includes('SBC') || doc.name.includes('كود') || doc.name.includes('سلامة');

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-400/60 dark:hover:border-blue-600/60 transition flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isContract
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : isInspection
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : isSBC
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {isContract ? 'عقد هندسي' : isInspection ? 'محضر استلام' : isSBC ? 'كود SBC' : 'Google Doc'}
                        </span>
                      </div>
                    </div>

                    <a
                      href={doc.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-blue-600 p-1 transition"
                      title="فتح في Google Docs ↗"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2.5 line-clamp-2 leading-relaxed">
                    {doc.name}
                  </h4>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {doc.modifiedTime ? new Date(doc.modifiedTime).toLocaleDateString('ar-SA') : 'محدث حديثاً'}
                    </span>
                    {doc.owners && doc.owners[0] && (
                      <span className="truncate max-w-[120px]">
                        • {doc.owners[0].displayName || doc.owners[0].emailAddress}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                  
                  <div className="flex items-center gap-1">
                    {/* View / Read Button */}
                    <button
                      onClick={() => handleViewDoc(doc)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1 transition"
                      title="معاينة وقراءة المستند داخل التطبيق"
                    >
                      <Eye className="w-3 h-3 text-blue-600" />
                      <span>قراءة</span>
                    </button>

                    {/* Append Note / Approval Button */}
                    <button
                      onClick={() => handlePrepareAppend(doc)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1 transition"
                      title="إضافة ملاحظة فحص أو ختم اعتماد هندسي"
                    >
                      <Edit3 className="w-3 h-3 text-indigo-600" />
                      <span>إضافة ملاحظة</span>
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDocToDelete(doc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="حذف المستند من Google Drive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW GOOGLE DOC WITH PRESET CONSTRUCTION TEMPLATES */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8 animate-fadeIn">
            
            <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-300" />
                <h3 className="text-sm font-bold">إنشاء مستند جديد في Google Docs</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold p-1 leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              
              {/* Template Selection Chips */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  اختر نموذج الوثيقة الهندسية:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CONSTRUCTION_DOC_TEMPLATES.map((tmpl) => {
                    const isSelected = selectedTemplate?.id === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => handleSelectTemplate(tmpl)}
                        className={`p-3 rounded-xl border cursor-pointer transition text-right ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-200 shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{tmpl.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {tmpl.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  عنوان مستند Google Docs: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="عنوان المستند في Google Docs..."
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  required
                />
              </div>

              {/* Content Preview / Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    محتوى المستند الأولي (Initial Content):
                  </label>
                  <span className="text-[10px] text-slate-400">
                    سيتم إدراجه تلقائياً في المستند ويمكن تعديله في Google Docs
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px] leading-relaxed"
                  placeholder="أدخل نص المستند أو بنود العقد..."
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>{isCreating ? 'جاري الإنشاء في Google Docs...' : 'إنشاء وفتح المستند'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: IN-APP DOCUMENT READER & INSPECTOR */}
      {/* ========================================================================= */}
      {activeDocDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8 animate-fadeIn flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-blue-900/40">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold truncate max-w-md">{activeDocDetail.title}</h3>
                  <span className="text-[10px] text-blue-300 font-mono">
                    معرف المستند: {activeDocDetail.documentId}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeDocDetail.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-2xs"
                >
                  <span>فتح في Google Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setActiveDocDetail(null)}
                  className="text-slate-300 hover:text-white text-lg font-bold p-1 leading-none ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body View */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950 text-right space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 font-sans text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {activeDocDetail.bodyText.trim() ? (
                  activeDocDetail.bodyText
                ) : (
                  <p className="text-slate-400 italic text-center py-8">المستند فارغ حالياً.</p>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="text-[11px] text-slate-400 font-mono">
                {activeDocDetail.paragraphs.length} فقرة • مأخوذ مباشرة عبر Google Docs API v1
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const docItem = docsList.find(d => d.id === activeDocDetail.documentId);
                    if (docItem) handlePrepareAppend(docItem);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>إضافة ملاحظة / اعتماد</span>
                </button>

                <button
                  onClick={() => setActiveDocDetail(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                >
                  إغلاق
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EXPLICIT USER CONFIRMATION FOR APPENDING DATA (Workspace Mandate) */}
      {/* ========================================================================= */}
      {showAppendModal && docToAppend && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fadeIn">
            
            <div className="p-4 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-300" />
                <h3 className="text-sm font-bold">تأكيد تعديل وإضافة نص لمستند Google Docs</h3>
              </div>
              <button
                onClick={() => setShowAppendModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold p-1 leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">تأكيد عملية الكتابة والتحديث (Workspace Authorization):</p>
                  <p className="text-[11px] mt-0.5 opacity-90">
                    أنت على وشك إضافة النص التالي إلى نهاية مستند: <strong>"{docToAppend.name}"</strong>
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  النص المراد إضافته واعتماده:
                </label>
                <textarea
                  rows={6}
                  value={textToAppend}
                  onChange={(e) => setTextToAppend(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAppendModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAppend}
                  disabled={isAppending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  {isAppending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isAppending ? 'جاري الحفظ في المستند...' : 'تأكيد الإضافة والحفظ'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EXPLICIT USER CONFIRMATION FOR DELETION (Workspace Mandate) */}
      {/* ========================================================================= */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-rose-300 dark:border-rose-900 shadow-xl overflow-hidden animate-fadeIn">
            
            <div className="p-4 bg-rose-600 text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-sm font-bold">تأكيد حذف مستند من Google Drive</h3>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف مستند: <strong className="text-rose-600 dark:text-rose-400">"{docToDelete.name}"</strong> من سحابة Google Drive نهائياً؟
              </p>
              <p className="text-[11px] text-slate-400">
                لا يمكن التراجع عن هذه العملية بعد التأكيد.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDocToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>{isDeleting ? 'جاري الحذف...' : 'نعم، احذف المستند'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
