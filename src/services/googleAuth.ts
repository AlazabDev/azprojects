import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

const provider = new GoogleAuthProvider();
GOOGLE_DRIVE_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

// Cache the access token in-memory ONLY as mandated by security guidelines
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token needs refresh / re-login
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('لم نتمكن من استخراج رمز الوصول (OAuth Access Token) من Google');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export interface GooglePickerDoc {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  iconUrl?: string;
  sizeBytes?: number;
  lastEditedUtc?: number;
  description?: string;
}

/**
 * Loads the Google API client and Picker library dynamically if not yet loaded
 */
export const loadGooglePickerScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.picker) {
      resolve();
      return;
    }

    const checkGapi = () => {
      if (window.gapi) {
        window.gapi.load('picker', {
          callback: () => resolve(),
          onerror: () => reject(new Error('Failed to load Google Picker library')),
          timeout: 10000,
          ontimeout: () => reject(new Error('Google Picker library load timed out'))
        });
      } else {
        // Dynamically inject script
        const existingScript = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if (window.gapi) {
              window.gapi.load('picker', {
                callback: () => resolve(),
                onerror: () => reject(new Error('Failed to load Google Picker library'))
              });
            }
          };
          script.onerror = () => reject(new Error('Failed to load Google API script'));
          document.body.appendChild(script);
        } else {
          setTimeout(checkGapi, 200);
        }
      }
    };

    checkGapi();
  });
};

/**
 * Opens Google Picker dialog to select files or blueprints directly from Google Drive
 */
export const openGooglePicker = async (
  onSelect: (docs: GooglePickerDoc[]) => void,
  onError?: (error: any) => void
): Promise<void> => {
  try {
    let token = await getAccessToken();

    if (!token) {
      // Prompt sign in
      const authResult = await googleSignIn();
      if (!authResult) {
        throw new Error('يجب تسجيل الدخول بحساب Google للوصول إلى Google Drive');
      }
      token = authResult.accessToken;
    }

    await loadGooglePickerScript();

    if (!window.google || !window.google.picker) {
      throw new Error('مكتبة Google Picker غير متوفرة في المتصفح');
    }

    const pickerOrigin =
      window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
        ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
        : window.location.origin;

    // View for Google Drive documents, blueprints, and files
    const docsView = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setParent('root');

    // View for uploading directly to Google Drive
    const uploadView = new window.google.picker.DocsUploadView();

    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .addView(docsView)
      .addView(uploadView)
      .setOAuthToken(token)
      .setOrigin(pickerOrigin)
      .setTitle('اختر مستندات أو مخططات المشروع من Google Drive')
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const pickedDocs: GooglePickerDoc[] = (data.docs || []).map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
            url: doc.url || `https://drive.google.com/file/d/${doc.id}/view`,
            iconUrl: doc.iconUrl,
            sizeBytes: doc.sizeBytes,
            lastEditedUtc: doc.lastEditedUtc,
            description: doc.description || ''
          }));
          onSelect(pickedDocs);
        }
      })
      .build();

    picker.setVisible(true);
  } catch (error: any) {
    console.error('Error opening Google Picker:', error);
    if (onError) onError(error);
  }
};
