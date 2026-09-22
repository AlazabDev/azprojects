/**
 * AzProjects - Server-side Supabase Client
 * عميل سوبابيس الآمن للخادم للتحقق من رموز JWT والوصول الإداري
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xvtnollwvrzpdojgkcbi.supabase.co';
// Use Service Role Key for server-side operations; fallback to Anon key if not provided
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabaseServer: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
