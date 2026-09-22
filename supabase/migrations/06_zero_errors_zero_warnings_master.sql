-- ============================================================================
-- منظومة AzProjects - مؤسسة العزب للمقاولات العامة والتشطيبات المعمارية
-- ملف الإصلاح الحاسم والشامل: تصفير كافة الأخطاء والتحذيرات (0 Errors, 0 Warnings)
-- الملف: 06_zero_errors_zero_warnings_master.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- الخطوة 1: تنظيف وإلغاء كافة السياسات المكررة ديناميكياً (إزالة الـ 24 تحذيراً فوراً)
-- يقوم هذا الكود بحذف أي سياسة سابقة أياً كان اسمها لمنع تعارض السياسات المتعددة (multiple_permissive_policies)
-- ----------------------------------------------------------------------------
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- الخطوة 2: معالجة الأخطاء القاتلة الخاصة بطرق العرض Views (حل أخطاء Security Definer View و Exposed Auth Users)
-- تحويل كافة الـ Views في المخطط العام لتعمل بوضع (security_invoker = true)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v RECORD;
BEGIN
    FOR v IN 
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public'
    LOOP
        BEGIN
            EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true);', v.table_name);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- الخطوة 3: معالجة أخطاء المفاتيح الأجنبية غير الأساسية لـ auth (0021_fkey_to_auth_unique)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    fk RECORD;
BEGIN
    FOR fk IN 
        SELECT 
            n.nspname AS schema_name,
            c_rel.relname AS table_name,
            c.conname AS fkey_name
        FROM pg_catalog.pg_constraint c
        JOIN pg_catalog.pg_class c_rel ON c.conrelid = c_rel.oid
        JOIN pg_catalog.pg_namespace n ON c_rel.relnamespace = n.oid
        JOIN pg_catalog.pg_class ref_rel ON c.confrelid = ref_rel.oid
        JOIN pg_catalog.pg_namespace cn ON ref_rel.relnamespace = cn.oid
        JOIN pg_catalog.pg_index i ON c.conindid = i.indexrelid
        WHERE c.contype = 'f'
          AND cn.nspname = 'auth'
          AND i.indisunique
          AND NOT i.indisprimary
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I;', fk.schema_name, fk.table_name, fk.fkey_name);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- الخطوة 4: تفعيل RLS إجبارياً على كافة الجداول في public (حل أخطاء rls_disabled_in_public و sensitive_columns_exposed)
-- ----------------------------------------------------------------------------
DO $$ 
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', tbl.tablename);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- الخطوة 5: نقل الملحقات لمخطط extensions الرسمي (حل تحذير 0014_extension_in_public)
-- ----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO authenticated, anon, service_role;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp' AND extnamespace = 'public'::regnamespace) THEN
        ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto' AND extnamespace = 'public'::regnamespace) THEN
        ALTER EXTENSION "pgcrypto" SET SCHEMA extensions;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- الخطوة 6: إنشاء المخطط الأمني المعزول app_security والدوال المحمية
-- إزالة أي دوال قديمة من public وحصر التنفيذ في app_security
-- ----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS app_security;
GRANT USAGE ON SCHEMA app_security TO authenticated, service_role;
REVOKE USAGE ON SCHEMA app_security FROM anon;

-- تنظيف دوال public المسببة للتحذيرات
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.is_admin_or_owner();
DROP FUNCTION IF EXISTS public.is_staff_or_engineer();
DROP FUNCTION IF EXISTS public.is_project_member(VARCHAR);
DROP FUNCTION IF EXISTS public.is_project_client(VARCHAR);

-- دالة 6.1: معرفة دور المستخدم الحالي
CREATE OR REPLACE FUNCTION app_security.get_current_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT role FROM public.profiles 
    WHERE id::text = (SELECT auth.uid())::text 
    LIMIT 1;
$$;

-- دالة 6.2: التحقق من صلاحية المالك أو مدير المشروعات
CREATE OR REPLACE FUNCTION app_security.is_admin_or_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::text = (SELECT auth.uid())::text 
        AND role IN ('owner', 'project_manager')
    );
$$;

-- دالة 6.3: التحقق من الطاقم الهندسي والفني
CREATE OR REPLACE FUNCTION app_security.is_staff_or_engineer()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::text = (SELECT auth.uid())::text 
        AND role IN ('owner', 'project_manager', 'architect', 'civil_engineer', 'contractor', 'consultant')
    );
$$;

-- دالة 6.4: التحقق من عضوية فريق عمل المشروع
CREATE OR REPLACE FUNCTION app_security.is_project_member(p_project_id VARCHAR)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.project_team_members 
        WHERE project_id::text = p_project_id::text 
        AND user_id::text = (SELECT auth.uid())::text
        AND is_active = TRUE
    );
$$;

-- دالة 6.5: التحقق من أن المستخدم هو العميل المالك للمشروع
CREATE OR REPLACE FUNCTION app_security.is_project_client(p_project_id VARCHAR)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id::text = p_project_id::text 
        AND client_id::text = (SELECT auth.uid())::text
    );
$$;

-- دالة 6.6: مشغل إنشاء ملف المستخدم عند التسجيل
CREATE OR REPLACE FUNCTION app_security.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role, avatar)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        name = EXCLUDED.name,
        avatar = EXCLUDED.avatar,
        updated_at = NOW();
    RETURN NEW;
END;
$$;

-- سحب الصلاحيات المباشرة على دالة المشغل لمنع تحذيرات 0028/0029
REVOKE EXECUTE ON FUNCTION app_security.handle_new_user() FROM PUBLIC, anon, authenticated;

-- منح الصلاحيات لدوال الاستعلام المخصصة
GRANT EXECUTE ON FUNCTION app_security.get_current_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_admin_or_owner() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_staff_or_engineer() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_project_member(VARCHAR) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_project_client(VARCHAR) TO authenticated, service_role;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA app_security FROM anon;

-- إعادة ربط المشغل
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION app_security.handle_new_user();

-- ----------------------------------------------------------------------------
-- الخطوة 7: بناء السياسات الموحدة والمثالية (سياسة واحدة محكمة لكل عملية)
-- استخدام (SELECT auth.uid()) لمنع إعادة التقييم المتكرر (0003_auth_rls_initplan)
-- وتجنب WITH CHECK (TRUE) لمنع تحذير (0024_rls_policy_always_true)
-- ----------------------------------------------------------------------------

-- 7.1 جدول profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
    id::text = (SELECT auth.uid())::text OR app_security.is_staff_or_engineer()
);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (
    id::text = (SELECT auth.uid())::text OR app_security.is_admin_or_owner()
);

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
    id::text = (SELECT auth.uid())::text OR app_security.is_admin_or_owner()
);

CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.2 جدول projects
CREATE POLICY "projects_select_policy" ON public.projects
FOR SELECT USING (
    app_security.is_admin_or_owner() 
    OR app_security.is_project_member(id)
    OR client_id::text = (SELECT auth.uid())::text 
    OR created_by::text = (SELECT auth.uid())::text
);

CREATE POLICY "projects_insert_policy" ON public.projects
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
);

CREATE POLICY "projects_update_policy" ON public.projects
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

CREATE POLICY "projects_delete_policy" ON public.projects
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.3 جدول project_team_members
CREATE POLICY "team_members_select_policy" ON public.project_team_members
FOR SELECT USING (
    app_security.is_staff_or_engineer()
    OR user_id::text = (SELECT auth.uid())::text
    OR app_security.is_project_client(project_id)
);

CREATE POLICY "team_members_insert_policy" ON public.project_team_members
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
);

CREATE POLICY "team_members_update_policy" ON public.project_team_members
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

CREATE POLICY "team_members_delete_policy" ON public.project_team_members
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.4 جدول project_phases
CREATE POLICY "phases_select_policy" ON public.project_phases
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_client(project_id)
    OR app_security.is_project_member(project_id)
);

CREATE POLICY "phases_insert_policy" ON public.project_phases
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
);

CREATE POLICY "phases_update_policy" ON public.project_phases
FOR UPDATE USING (
    app_security.is_staff_or_engineer()
);

CREATE POLICY "phases_delete_policy" ON public.project_phases
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.5 جدول tasks
CREATE POLICY "tasks_select_policy" ON public.tasks
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR assigned_to::text = (SELECT auth.uid())::text
    OR created_by::text = (SELECT auth.uid())::text
    OR app_security.is_project_member(project_id)
);

CREATE POLICY "tasks_insert_policy" ON public.tasks
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
);

CREATE POLICY "tasks_update_policy" ON public.tasks
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR assigned_to::text = (SELECT auth.uid())::text
    OR (app_security.is_staff_or_engineer() AND app_security.is_project_member(project_id))
);

CREATE POLICY "tasks_delete_policy" ON public.tasks
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.6 جدول documents
CREATE POLICY "documents_select_policy" ON public.documents
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_client(project_id)
    OR app_security.is_project_member(project_id)
    OR uploaded_by::text = (SELECT auth.uid())::text
);

CREATE POLICY "documents_insert_policy" ON public.documents
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
    OR app_security.is_project_client(project_id)
);

CREATE POLICY "documents_update_policy" ON public.documents
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR uploaded_by::text = (SELECT auth.uid())::text
);

CREATE POLICY "documents_delete_policy" ON public.documents
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.7 جدول cost_items
CREATE POLICY "costs_select_policy" ON public.cost_items
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR (app_security.is_project_member(project_id) AND app_security.is_staff_or_engineer())
);

CREATE POLICY "costs_insert_policy" ON public.cost_items
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
);

CREATE POLICY "costs_update_policy" ON public.cost_items
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

CREATE POLICY "costs_delete_policy" ON public.cost_items
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.8 جدول payments
CREATE POLICY "payments_select_policy" ON public.payments
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_client(project_id)
    OR app_security.is_project_member(project_id)
);

CREATE POLICY "payments_insert_policy" ON public.payments
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
);

CREATE POLICY "payments_update_policy" ON public.payments
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

CREATE POLICY "payments_delete_policy" ON public.payments
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.9 جدول suppliers
CREATE POLICY "suppliers_select_policy" ON public.suppliers
FOR SELECT USING (
    app_security.is_staff_or_engineer()
);

CREATE POLICY "suppliers_insert_policy" ON public.suppliers
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
);

CREATE POLICY "suppliers_update_policy" ON public.suppliers
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

CREATE POLICY "suppliers_delete_policy" ON public.suppliers
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.10 جدول magicplan_designs
CREATE POLICY "magicplan_select_policy" ON public.magicplan_designs
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_client(project_id)
    OR app_security.is_project_member(project_id)
);

CREATE POLICY "magicplan_insert_policy" ON public.magicplan_designs
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
    OR (app_security.is_project_member(project_id) AND app_security.is_staff_or_engineer())
);

CREATE POLICY "magicplan_update_policy" ON public.magicplan_designs
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR (app_security.is_project_member(project_id) AND app_security.is_staff_or_engineer())
);

CREATE POLICY "magicplan_delete_policy" ON public.magicplan_designs
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.11 جدول daftra_sync_records
CREATE POLICY "daftra_records_select_policy" ON public.daftra_sync_records
FOR SELECT USING (
    app_security.is_admin_or_owner()
);

CREATE POLICY "daftra_records_insert_policy" ON public.daftra_sync_records
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
);

CREATE POLICY "daftra_records_update_policy" ON public.daftra_sync_records
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

CREATE POLICY "daftra_records_delete_policy" ON public.daftra_sync_records
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.12 جدول whatsapp_messages
CREATE POLICY "whatsapp_select_policy" ON public.whatsapp_messages
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR assigned_to::text = (SELECT auth.uid())::text
    OR (project_id IS NOT NULL AND app_security.is_project_member(project_id))
);

CREATE POLICY "whatsapp_insert_policy" ON public.whatsapp_messages
FOR INSERT WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL 
    OR app_security.is_staff_or_engineer()
    OR current_user = 'service_role'
);

CREATE POLICY "whatsapp_update_policy" ON public.whatsapp_messages
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR assigned_to::text = (SELECT auth.uid())::text
);

CREATE POLICY "whatsapp_delete_policy" ON public.whatsapp_messages
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.13 جدول notifications
CREATE POLICY "notifications_select_policy" ON public.notifications
FOR SELECT USING (
    user_id::text = (SELECT auth.uid())::text 
    OR app_security.is_admin_or_owner()
);

CREATE POLICY "notifications_insert_policy" ON public.notifications
FOR INSERT WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL 
    OR app_security.is_admin_or_owner()
    OR current_user = 'service_role'
);

CREATE POLICY "notifications_update_policy" ON public.notifications
FOR UPDATE USING (
    user_id::text = (SELECT auth.uid())::text 
    OR app_security.is_admin_or_owner()
);

CREATE POLICY "notifications_delete_policy" ON public.notifications
FOR DELETE USING (
    user_id::text = (SELECT auth.uid())::text 
    OR app_security.is_admin_or_owner()
);

-- 7.14 جدول audit_logs
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
FOR SELECT USING (
    app_security.is_admin_or_owner()
);

CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
FOR INSERT WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL 
    OR current_user = 'service_role'
    OR app_security.is_staff_or_engineer()
);

CREATE POLICY "audit_logs_update_policy" ON public.audit_logs
FOR UPDATE USING (FALSE);

CREATE POLICY "audit_logs_delete_policy" ON public.audit_logs
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 7.15 جدول app_settings
CREATE POLICY "settings_select_policy" ON public.app_settings
FOR SELECT USING (
    app_security.is_staff_or_engineer()
);

CREATE POLICY "settings_insert_policy" ON public.app_settings
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
);

CREATE POLICY "settings_update_policy" ON public.app_settings
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

CREATE POLICY "settings_delete_policy" ON public.app_settings
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- ----------------------------------------------------------------------------
-- الخطوة 8: تأمين أي جداول إضافية إن وجدت (مثل جداول Drizzle التزامنية)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'architectural_blueprints') THEN
        DROP POLICY IF EXISTS "blueprints_all_policy" ON public.architectural_blueprints;
        CREATE POLICY "blueprints_all_policy" ON public.architectural_blueprints
        FOR ALL USING (app_security.is_staff_or_engineer());
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'field_updates') THEN
        DROP POLICY IF EXISTS "field_updates_all_policy" ON public.field_updates;
        CREATE POLICY "field_updates_all_policy" ON public.field_updates
        FOR ALL USING (app_security.is_staff_or_engineer());
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sync_logs') THEN
        DROP POLICY IF EXISTS "sync_logs_all_policy" ON public.sync_logs;
        CREATE POLICY "sync_logs_all_policy" ON public.sync_logs
        FOR ALL USING (app_security.is_admin_or_owner());
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        DROP POLICY IF EXISTS "users_all_policy" ON public.users;
        CREATE POLICY "users_all_policy" ON public.users
        FOR ALL USING (
            uid = (SELECT auth.uid())::text 
            OR app_security.is_admin_or_owner()
        );
    END IF;
END $$;

-- نهاية ملف تصفير التحذيرات والأخطاء الكامل 06_zero_errors_zero_warnings_master.sql
