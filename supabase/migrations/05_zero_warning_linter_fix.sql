-- ============================================================================
-- منظومة AzProjects لإدارة المشروعات والمقاولات المعمارية - مؤسسة العزب
-- ملف الإصلاح الشامل لقواعد أمان Supabase Linter (0 Errors, 0 Warnings)
-- 05_zero_warning_linter_fix.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. إصلاح موضع الملحقات (0014_extension_in_public)
-- نقل ملحقات النظام من public إلى مخطط extensions المعتمد أمنياً
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
-- 2. تفعيل سياسة RLS الصارمة على كافة الجداول العامة (0013_rls_disabled_in_public)
-- ----------------------------------------------------------------------------
DO $$ 
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND rowsecurity = FALSE
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 3. مخطط الأمان الداخلي المنعزل (Private Security Schema)
-- ----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS app_security;
GRANT USAGE ON SCHEMA app_security TO authenticated, service_role;
REVOKE USAGE ON SCHEMA app_security FROM anon;

-- تنظيف أي دوال متبقية في المخطط العام public تسبب تحذيرات 0028/0029
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.is_admin_or_owner();
DROP FUNCTION IF EXISTS public.is_staff_or_engineer();
DROP FUNCTION IF EXISTS public.is_project_member(VARCHAR);
DROP FUNCTION IF EXISTS public.is_project_client(VARCHAR);

-- ----------------------------------------------------------------------------
-- 4. إعادة بناء الدوال الأمنية بأداء مثالي وأمان تام (Search Path ثابت ومحدد)
-- استخدام (SELECT auth.uid()) لمنع إعادة التقييم المتكرر (0003_auth_rls_initplan)
-- ----------------------------------------------------------------------------

-- 4.1 دالة معرفة دور المستخدم الحالي
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

-- 4.2 دالة التحقق من صلاحية المالك أو مدير المشروعات
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

-- 4.3 دالة التحقق من الطاقم الهندسي والفني
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

-- 4.4 دالة التحقق من عضوية المستخدم في فريق عمل المشروع
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

-- 4.5 دالة التحقق من أن المستخدم هو العميل المالك للمشروع
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

-- 4.6 دالة إنشاء ملف المستخدم التلقائي عند التسجيل (سحب الصلاحية المباشرة من anon وauthenticated)
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

-- سحب أي صلاحية تنفيذ مباشرة على دالة المشغل (Trigger Function) لمنع تحذيرات 0028/0029
REVOKE EXECUTE ON FUNCTION app_security.handle_new_user() FROM PUBLIC, anon, authenticated;

-- منح صلاحيات التنفيذ المخصصة لدوال الأمان الداخلية
GRANT EXECUTE ON FUNCTION app_security.get_current_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_admin_or_owner() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_staff_or_engineer() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_project_member(VARCHAR) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_project_client(VARCHAR) TO authenticated, service_role;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA app_security FROM anon;

-- تحديث المشغل (Trigger)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION app_security.handle_new_user();

-- ----------------------------------------------------------------------------
-- 5. تحديث سياسات الأمان RLS الموجهة والمحسنة بالكامل مع (SELECT auth.uid())
-- ----------------------------------------------------------------------------

-- 5.1 profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
    id::text = (SELECT auth.uid())::text OR app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (
    id::text = (SELECT auth.uid())::text OR app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
    id::text = (SELECT auth.uid())::text OR app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.2 projects
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
CREATE POLICY "projects_select_policy" ON public.projects
FOR SELECT USING (
    app_security.is_admin_or_owner() 
    OR app_security.is_project_member(id)
    OR client_id::text = (SELECT auth.uid())::text 
    OR created_by::text = (SELECT auth.uid())::text
);

DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;
CREATE POLICY "projects_insert_policy" ON public.projects
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;
CREATE POLICY "projects_update_policy" ON public.projects
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;
CREATE POLICY "projects_delete_policy" ON public.projects
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.3 project_team_members
DROP POLICY IF EXISTS "team_select_policy" ON public.project_team_members;
CREATE POLICY "team_select_policy" ON public.project_team_members
FOR SELECT USING (
    app_security.is_staff_or_engineer()
    OR user_id::text = (SELECT auth.uid())::text
    OR app_security.is_project_client(project_id)
);

DROP POLICY IF EXISTS "team_insert_policy" ON public.project_team_members;
CREATE POLICY "team_insert_policy" ON public.project_team_members
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "team_update_policy" ON public.project_team_members;
CREATE POLICY "team_update_policy" ON public.project_team_members
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "team_delete_policy" ON public.project_team_members;
CREATE POLICY "team_delete_policy" ON public.project_team_members
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.4 project_phases
DROP POLICY IF EXISTS "phases_select_policy" ON public.project_phases;
CREATE POLICY "phases_select_policy" ON public.project_phases
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_member(project_id)
    OR app_security.is_project_client(project_id)
);

DROP POLICY IF EXISTS "phases_insert_policy" ON public.project_phases;
CREATE POLICY "phases_insert_policy" ON public.project_phases
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "phases_update_policy" ON public.project_phases;
CREATE POLICY "phases_update_policy" ON public.project_phases
FOR UPDATE USING (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "phases_delete_policy" ON public.project_phases;
CREATE POLICY "phases_delete_policy" ON public.project_phases
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.5 tasks
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
CREATE POLICY "tasks_select_policy" ON public.tasks
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_member(project_id)
    OR assigned_to::text = (SELECT auth.uid())::text
    OR created_by::text = (SELECT auth.uid())::text
    OR app_security.is_project_client(project_id)
);

DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
CREATE POLICY "tasks_insert_policy" ON public.tasks
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
CREATE POLICY "tasks_update_policy" ON public.tasks
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_member(project_id)
    OR assigned_to::text = (SELECT auth.uid())::text
    OR created_by::text = (SELECT auth.uid())::text
);

DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;
CREATE POLICY "tasks_delete_policy" ON public.tasks
FOR DELETE USING (
    app_security.is_admin_or_owner()
    OR created_by::text = (SELECT auth.uid())::text
);

-- 5.6 documents
DROP POLICY IF EXISTS "documents_select_policy" ON public.documents;
CREATE POLICY "documents_select_policy" ON public.documents
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_member(project_id)
    OR uploaded_by::text = (SELECT auth.uid())::text
    OR (is_confidential = FALSE AND app_security.is_project_client(project_id))
);

DROP POLICY IF EXISTS "documents_insert_policy" ON public.documents;
CREATE POLICY "documents_insert_policy" ON public.documents
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
    OR uploaded_by::text = (SELECT auth.uid())::text
);

DROP POLICY IF EXISTS "documents_update_policy" ON public.documents;
CREATE POLICY "documents_update_policy" ON public.documents
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR uploaded_by::text = (SELECT auth.uid())::text
);

DROP POLICY IF EXISTS "documents_delete_policy" ON public.documents;
CREATE POLICY "documents_delete_policy" ON public.documents
FOR DELETE USING (
    app_security.is_admin_or_owner()
    OR uploaded_by::text = (SELECT auth.uid())::text
);

-- 5.7 suppliers
DROP POLICY IF EXISTS "suppliers_select_policy" ON public.suppliers;
CREATE POLICY "suppliers_select_policy" ON public.suppliers
FOR SELECT USING (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "suppliers_insert_policy" ON public.suppliers;
CREATE POLICY "suppliers_insert_policy" ON public.suppliers
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "suppliers_update_policy" ON public.suppliers;
CREATE POLICY "suppliers_update_policy" ON public.suppliers
FOR UPDATE USING (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "suppliers_delete_policy" ON public.suppliers;
CREATE POLICY "suppliers_delete_policy" ON public.suppliers
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.8 cost_items
DROP POLICY IF EXISTS "cost_select_policy" ON public.cost_items;
CREATE POLICY "cost_select_policy" ON public.cost_items
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_member(project_id)
);

DROP POLICY IF EXISTS "cost_insert_policy" ON public.cost_items;
CREATE POLICY "cost_insert_policy" ON public.cost_items
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "cost_update_policy" ON public.cost_items;
CREATE POLICY "cost_update_policy" ON public.cost_items
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "cost_delete_policy" ON public.cost_items;
CREATE POLICY "cost_delete_policy" ON public.cost_items
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.9 payments
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
CREATE POLICY "payments_select_policy" ON public.payments
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_member(project_id)
);

DROP POLICY IF EXISTS "payments_insert_policy" ON public.payments;
CREATE POLICY "payments_insert_policy" ON public.payments
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "payments_update_policy" ON public.payments;
CREATE POLICY "payments_update_policy" ON public.payments
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "payments_delete_policy" ON public.payments;
CREATE POLICY "payments_delete_policy" ON public.payments
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.10 magicplan_designs
DROP POLICY IF EXISTS "magicplan_select_policy" ON public.magicplan_designs;
CREATE POLICY "magicplan_select_policy" ON public.magicplan_designs
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_member(project_id)
    OR app_security.is_project_client(project_id)
);

DROP POLICY IF EXISTS "magicplan_insert_policy" ON public.magicplan_designs;
CREATE POLICY "magicplan_insert_policy" ON public.magicplan_designs
FOR INSERT WITH CHECK (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "magicplan_update_policy" ON public.magicplan_designs;
CREATE POLICY "magicplan_update_policy" ON public.magicplan_designs
FOR UPDATE USING (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "magicplan_delete_policy" ON public.magicplan_designs;
CREATE POLICY "magicplan_delete_policy" ON public.magicplan_designs
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.11 whatsapp_messages
DROP POLICY IF EXISTS "whatsapp_select_policy" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_select_policy" ON public.whatsapp_messages
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR (project_id IS NOT NULL AND app_security.is_project_member(project_id))
    OR assigned_to::text = (SELECT auth.uid())::text
);

DROP POLICY IF EXISTS "whatsapp_insert_policy" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_insert_policy" ON public.whatsapp_messages
FOR INSERT WITH CHECK (
    TRUE
);

DROP POLICY IF EXISTS "whatsapp_update_policy" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_update_policy" ON public.whatsapp_messages
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR assigned_to::text = (SELECT auth.uid())::text
);

DROP POLICY IF EXISTS "whatsapp_delete_policy" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_delete_policy" ON public.whatsapp_messages
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.12 daftra_sync_records
DROP POLICY IF EXISTS "daftra_select_policy" ON public.daftra_sync_records;
CREATE POLICY "daftra_select_policy" ON public.daftra_sync_records
FOR SELECT USING (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "daftra_insert_policy" ON public.daftra_sync_records;
CREATE POLICY "daftra_insert_policy" ON public.daftra_sync_records
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "daftra_update_policy" ON public.daftra_sync_records;
CREATE POLICY "daftra_update_policy" ON public.daftra_sync_records
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "daftra_delete_policy" ON public.daftra_sync_records;
CREATE POLICY "daftra_delete_policy" ON public.daftra_sync_records
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.13 notifications
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy" ON public.notifications
FOR SELECT USING (
    user_id::text = (SELECT auth.uid())::text OR app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
CREATE POLICY "notifications_insert_policy" ON public.notifications
FOR INSERT WITH CHECK (
    TRUE
);

DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy" ON public.notifications
FOR UPDATE USING (
    user_id::text = (SELECT auth.uid())::text OR app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "notifications_delete_policy" ON public.notifications;
CREATE POLICY "notifications_delete_policy" ON public.notifications
FOR DELETE USING (
    user_id::text = (SELECT auth.uid())::text OR app_security.is_admin_or_owner()
);

-- 5.14 audit_logs
DROP POLICY IF EXISTS "audit_select_policy" ON public.audit_logs;
CREATE POLICY "audit_select_policy" ON public.audit_logs
FOR SELECT USING (
    app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "audit_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_insert_policy" ON public.audit_logs
FOR INSERT WITH CHECK (
    TRUE
);

DROP POLICY IF EXISTS "audit_update_policy" ON public.audit_logs;
CREATE POLICY "audit_update_policy" ON public.audit_logs
FOR UPDATE USING (
    FALSE
);

DROP POLICY IF EXISTS "audit_delete_policy" ON public.audit_logs;
CREATE POLICY "audit_delete_policy" ON public.audit_logs
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.15 app_settings
DROP POLICY IF EXISTS "settings_select_policy" ON public.app_settings;
CREATE POLICY "settings_select_policy" ON public.app_settings
FOR SELECT USING (
    app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "settings_insert_policy" ON public.app_settings;
CREATE POLICY "settings_insert_policy" ON public.app_settings
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "settings_update_policy" ON public.app_settings;
CREATE POLICY "settings_update_policy" ON public.app_settings
FOR UPDATE USING (
    app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "settings_delete_policy" ON public.app_settings;
CREATE POLICY "settings_delete_policy" ON public.app_settings
FOR DELETE USING (
    app_security.is_admin_or_owner()
);

-- 5.16 تأمين أي جداول إضافية إن وجدت (architectural_blueprints, field_updates, sync_logs, users)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'architectural_blueprints') THEN
        ALTER TABLE public.architectural_blueprints ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "architectural_blueprints_policy" ON public.architectural_blueprints;
        CREATE POLICY "architectural_blueprints_policy" ON public.architectural_blueprints
        FOR ALL USING (app_security.is_staff_or_engineer());
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'field_updates') THEN
        ALTER TABLE public.field_updates ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "field_updates_policy" ON public.field_updates;
        CREATE POLICY "field_updates_policy" ON public.field_updates
        FOR ALL USING (app_security.is_staff_or_engineer());
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sync_logs') THEN
        ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "sync_logs_policy" ON public.sync_logs;
        CREATE POLICY "sync_logs_policy" ON public.sync_logs
        FOR ALL USING (app_security.is_admin_or_owner());
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "users_policy" ON public.users;
        CREATE POLICY "users_policy" ON public.users
        FOR ALL USING (app_security.is_admin_or_owner());
    END IF;
END $$;
