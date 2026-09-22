-- استعلام تشخيصي سريع لمعرفة أسباب الأخطاء والتحذيرات في Supabase Database Linter
-- قم بلصق هذا الاستعلام وتشغيله في Supabase SQL Editor لعرض المشاكل إن وجدت:

WITH active_policies AS (
    SELECT 
        schemaname, 
        tablename, 
        COUNT(*) as policy_count,
        array_agg(policyname) as policy_names
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename
    HAVING COUNT(*) > 4
),
unsecured_tables AS (
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' AND rowsecurity = FALSE
),
views_check AS (
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public'
)
SELECT 'Multiple Policies Warning' as issue_type, tablename as object_name, policy_count::text as detail FROM active_policies
UNION ALL
SELECT 'Unsecured Table (RLS Disabled - ERROR)' as issue_type, tablename as object_name, 'RLS is not enabled' as detail FROM unsecured_tables
UNION ALL
SELECT 'Public View (Check Security Invoker)' as issue_type, table_name as object_name, 'View in public schema' as detail FROM views_check;
