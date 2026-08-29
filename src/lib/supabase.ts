/**
 * AzProjects - Supabase Central Client
 * تهيئة عميل سوبابيس المركزي مع دعم المصادقة والجلسات والتخزين المحلي
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';

export const supabase: SupabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  global: {
    headers: {
      'x-application-name': 'AzProjects-Architectural-System',
    },
  },
});

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (err) {
    console.warn('Could not retrieve Supabase session token:', err);
    return null;
  }
};
