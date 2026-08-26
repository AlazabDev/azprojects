import React, { useState, useEffect } from 'react';
import { 
  openGooglePicker, 
  googleSignIn, 
  getAccessToken, 
  logoutGoogle, 
  initGoogleAuth, 
  GooglePickerDoc,
  GOOGLE_DRIVE_SCOPES
} from '../../services/googleAuth';
import { useApp } from '../../context/AppContext';
import { DocumentType } from '../../types';
import { 
  FolderSync, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  HardDrive, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GooglePickerButtonProps {
  phaseId?: string;
  phaseName?: string;
  onImportComplete?: (count: number) => void;
  className?: string;
  variant?: 'primary' | 'outline' | 'compact';
}

export const GooglePickerButton: React.FC<GooglePickerButtonProps> = ({
  phaseId,
  phaseName,
  onImportComplete,
  className = '',
  variant = 'primary'
}) => {
  const { selectedProject, addDocument, currentUser } = useApp();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const guessDocType = (name: string, mimeType: string): DocumentType => {
    const lowerName = name.toLowerCase();
    if (lowerName.endsWith('.dwg') || lowerName.endsWith('.dxf') || lowerName.includes('مخطط') || lowerName.includes('معماري') || lowerName.includes('plan') || lowerName.includes('cad')) {
      return 'blueprint';
    }
    if (lowerName.includes('رخصة') || lowerName.includes('ترخيص') || lowerName.includes('permit')) {
      return 'permit';
    }
    if (lowerName.includes('عقد') || lowerName.includes('اتفاقية') || lowerName.includes('contract')) {
      return 'contract';
    }
    if (lowerName.includes('فاتورة') || lowerName.includes('مستخلص') || lowerName.includes('invoice')) {
      return 'invoice';
    }
    if (lowerName.includes('تقرير') || lowerName.includes('فحص') || lowerName.includes('report')) {
      return 'report';
    }
    if (mimeType.startsWith('image/')) {
      return 'photo';
    }
    return 'blueprint';
  };

  const handlePickFromDrive = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      await openGooglePicker(
        (docs: GooglePickerDoc[]) => {
          if (!docs || docs.length === 0) return;

          if (!selectedProject) {
            setStatusMessage({ type: 'error', text: 'يرجى اختيار مشروع لإضافة الملفات إليه.' });
            return;
          }

          let addedCount = 0;
          docs.forEach((doc) => {
            const docType = guessDocType(doc.name, doc.mimeType);

            addDocument({
              projectId: selectedProject.id,
              projectName: selectedProject.name,
              phaseId: phaseId || 'ph-exec',
              phaseName: phaseName || 'مستندات ومخططات Drive',
              name: doc.name,
              description: `تم الاستيراد مباشرة عبر Google Picker من Google Drive (المعرف: ${doc.id})`,
              fileUrl: doc.url,
              fileType: doc.mimeType || 'application/pdf',
              fileSize: doc.sizeBytes || 2400000,
              version: 1,
              documentType: docType,
              uploadedBy: currentUser?.id || 'usr-eng-1',
              uploadedByName: user?.displayName || currentUser?.name || 'مهندس المشروع',
              tags: ['Google Drive', 'Picker', docType === 'blueprint' ? 'مخططات' : 'مستندات'],
              isPublic: true
            });
            addedCount++;
          });

          setStatusMessage({
            type: 'success',
            text: `تم استيراد ${addedCount} ملف(ات) بنجاح من Google Drive إلى مستندات المشروع.`
          });

          if (onImportComplete) {
            onImportComplete(addedCount);
          }

          setTimeout(() => setStatusMessage(null), 4500);
        },
        (err) => {
          console.error('Picker error:', err);
          setStatusMessage({
            type: 'error',
            text: err.message || 'تعذر فتح Google Picker. يرجى التحقق من صلاحيات الدخول.'
          });
        }
      );
    } catch (err: any) {
      console.error('Drive import error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'حدث خطأ أثناء الاتصال بخدمة Google Drive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setStatusMessage({
          type: 'success',
          text: `تم تسجيل الدخول بنجاح بحساب ${result.user.email}`
        });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'فشل تسجيل الدخول بـ Google'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handlePickFromDrive}
        disabled={isLoading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 transition shadow-2xs ${className}`}
        title="استيراد مخططات وملفات عبر Google Picker"
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
        ) : (
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" 
            alt="Google Drive" 
            className="w-3.5 h-3.5" 
          />
        )}
        <span>Google Picker</span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePickFromDrive}
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-xs ${
            variant === 'primary'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50'
          } ${className}`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" 
              alt="Google Drive" 
              className="w-4 h-4 shrink-0" 
            />
          )}
          <span>اختيار مخططات ومستندات من Google Drive (Picker)</span>
        </button>

        {!user ? (
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
            title="تسجيل الدخول بحساب Google"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            <span>ربط الحساب</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-[11px] font-mono border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate max-w-[140px]">{user.email}</span>
            <button 
              onClick={logoutGoogle}
              className="text-slate-400 hover:text-red-500 p-0.5 ml-1"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};
