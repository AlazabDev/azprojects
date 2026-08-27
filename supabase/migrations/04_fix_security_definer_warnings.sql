-- ============================================================================
-- منظومة AzProjects لإدارة المشروعات والمقاولات المعمارية - مؤسسة العزب
-- ملف الإصلاح الأمني المخصص للتحذيرات 0029 (SECURITY DEFINER / Schema Isolation)
-- 04_fix_security_definer_warnings.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. إنشاء مخطط أمان داخلي محمي ومنعزل (Private Security Schema)
-- المخطط app_security غير مكشوف لـ PostgREST API مما يمنع إنشاء RPC endpoints للمستخدمين
-- ----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS app_security;
GRANT USAGE ON SCHEMA app_security TO authenticated, anon, service_role;

-- ----------------------------------------------------------------------------
-- 2. إعادة إنشاء الدوال الأمنية المساعدة داخل app_security بدلاً من public
-- مع تحديد مسار البحث search_path = public, pg_temp
-- ----------------------------------------------------------------------------

-- 2.1 دالة معرفة دور المستخدم الحالي
CREATE OR REPLACE FUNCTION app_security.get_current_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT role FROM public.profiles 
    WHERE id::text = (auth.uid())::text 
    LIMIT 1;
$$;

-- 2.2 دالة التحقق من صلاحية المالك أو مدير المشروعات
CREATE OR REPLACE FUNCTION app_security.is_admin_or_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::text = (auth.uid())::text 
        AND role IN ('owner', 'project_manager')
    );
$$;

-- 2.3 دالة التحقق من الطاقم الهندسي والفني
CREATE OR REPLACE FUNCTION app_security.is_staff_or_engineer()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::text = (auth.uid())::text 
        AND role IN ('owner', 'project_manager', 'architect', 'civil_engineer', 'contractor', 'consultant')
    );
$$;

-- 2.4 دالة التحقق من عضوية المستخدم في فريق عمل المشروع
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
        AND user_id::text = (auth.uid())::text
        AND is_active = TRUE
    );
$$;

-- 2.5 دالة التحقق من أن المستخدم هو العميل المالك للمشروع
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
        AND client_id::text = (auth.uid())::text
    );
$$;

-- 2.6 دالة إنشاء ملف المستخدم التلقائي عند التسجيل
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

-- منح الصلاحيات الداخلية لقاعدة البيانات
GRANT EXECUTE ON FUNCTION app_security.get_current_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_admin_or_owner() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_staff_or_engineer() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_project_member(VARCHAR) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_project_client(VARCHAR) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.handle_new_user() TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 3. تحديث مشغل إنشاء المستخدمين (Auth Trigger) للاشارة إلى الدالة المحمية
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION app_security.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. إعادة توجيه سياسات RLS لاستخدام الدوال المحمية في app_security
-- ----------------------------------------------------------------------------

-- سياسات profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (id::text = (auth.uid())::text OR app_security.is_staff_or_engineer());

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (id::text = (auth.uid())::text OR app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (id::text = (auth.uid())::text OR app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE USING (app_security.is_admin_or_owner());

-- سياسات projects
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
CREATE POLICY "projects_select_policy" ON public.projects
FOR SELECT USING (
    app_security.is_admin_or_owner() 
    OR client_id::text = (auth.uid())::text 
    OR created_by::text = (auth.uid())::text
    OR app_security.is_project_member(id)
);

DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;
CREATE POLICY "projects_insert_policy" ON public.projects
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner() 
    OR app_security.get_current_user_role() IN ('architect', 'civil_engineer')
);

DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;
CREATE POLICY "projects_update_policy" ON public.projects
FOR UPDATE USING (
    app_security.is_admin_or_owner() 
    OR (
        app_security.is_project_member(id) 
        AND EXISTS (
            SELECT 1 FROM public.project_team_members 
            WHERE project_id::text = projects.id::text 
            AND user_id::text = (auth.uid())::text 
            AND can_edit_project = TRUE
        )
    )
);

DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;
CREATE POLICY "projects_delete_policy" ON public.projects
FOR DELETE USING (app_security.is_admin_or_owner());

-- سياسات project_team_members
DROP POLICY IF EXISTS "team_members_select_policy" ON public.project_team_members;
CREATE POLICY "team_members_select_policy" ON public.project_team_members
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR user_id::text = (auth.uid())::text
    OR app_security.is_project_member(project_id)
    OR app_security.is_project_client(project_id)
);

DROP POLICY IF EXISTS "team_members_insert_policy" ON public.project_team_members;
CREATE POLICY "team_members_insert_policy" ON public.project_team_members
FOR INSERT WITH CHECK (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "team_members_update_policy" ON public.project_team_members;
CREATE POLICY "team_members_update_policy" ON public.project_team_members
FOR UPDATE USING (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "team_members_delete_policy" ON public.project_team_members;
CREATE POLICY "team_members_delete_policy" ON public.project_team_members
FOR DELETE USING (app_security.is_admin_or_owner());

-- سياسات project_phases
DROP POLICY IF EXISTS "phases_select_policy" ON public.project_phases;
CREATE POLICY "phases_select_policy" ON public.project_phases
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_client(project_id)
    OR app_security.is_project_member(project_id)
);

DROP POLICY IF EXISTS "phases_insert_policy" ON public.project_phases;
CREATE POLICY "phases_insert_policy" ON public.project_phases
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
    OR (
        app_security.is_project_member(project_id)
        AND app_security.get_current_user_role() IN ('architect', 'civil_engineer')
    )
);

DROP POLICY IF EXISTS "phases_update_policy" ON public.project_phases;
CREATE POLICY "phases_update_policy" ON public.project_phases
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR (
        app_security.is_project_member(project_id)
        AND app_security.get_current_user_role() IN ('architect', 'civil_engineer')
    )
);

DROP POLICY IF EXISTS "phases_delete_policy" ON public.project_phases;
CREATE POLICY "phases_delete_policy" ON public.project_phases
FOR DELETE USING (app_security.is_admin_or_owner());

-- سياسات tasks
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
CREATE POLICY "tasks_select_policy" ON public.tasks
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR assigned_to::text = (auth.uid())::text
    OR created_by::text = (auth.uid())::text
    OR (
        app_security.is_project_member(project_id)
        AND app_security.get_current_user_role() IN ('architect', 'civil_engineer', 'consultant')
    )
);

DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
CREATE POLICY "tasks_insert_policy" ON public.tasks
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
    OR (
        app_security.is_project_member(project_id) 
        AND EXISTS (
            SELECT 1 FROM public.project_team_members 
            WHERE project_id::text = tasks.project_id::text 
            AND user_id::text = (auth.uid())::text 
            AND can_assign_tasks = TRUE
        )
    )
    OR app_security.get_current_user_role() IN ('architect', 'civil_engineer')
);

DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
CREATE POLICY "tasks_update_policy" ON public.tasks
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR assigned_to::text = (auth.uid())::text
    OR created_by::text = (auth.uid())::text
    OR (
        app_security.is_project_member(project_id)
        AND app_security.get_current_user_role() IN ('architect', 'civil_engineer')
    )
);

DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;
CREATE POLICY "tasks_delete_policy" ON public.tasks
FOR DELETE USING (
    app_security.is_admin_or_owner()
    OR created_by::text = (auth.uid())::text
);

-- سياسات documents
DROP POLICY IF EXISTS "documents_select_policy" ON public.documents;
CREATE POLICY "documents_select_policy" ON public.documents
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR uploaded_by::text = (auth.uid())::text
    OR (app_security.is_project_client(project_id) AND is_public = TRUE)
    OR app_security.is_project_member(project_id)
);

DROP POLICY IF EXISTS "documents_insert_policy" ON public.documents;
CREATE POLICY "documents_insert_policy" ON public.documents
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
    OR uploaded_by::text = (auth.uid())::text
    OR (
        app_security.is_project_member(project_id)
        AND EXISTS (
            SELECT 1 FROM public.project_team_members 
            WHERE project_id::text = documents.project_id::text 
            AND user_id::text = (auth.uid())::text 
            AND can_upload_blueprints = TRUE
        )
    )
);

DROP POLICY IF EXISTS "documents_update_policy" ON public.documents;
CREATE POLICY "documents_update_policy" ON public.documents
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR uploaded_by::text = (auth.uid())::text
);

DROP POLICY IF EXISTS "documents_delete_policy" ON public.documents;
CREATE POLICY "documents_delete_policy" ON public.documents
FOR DELETE USING (
    app_security.is_admin_or_owner()
    OR uploaded_by::text = (auth.uid())::text
);

-- سياسات cost_items
DROP POLICY IF EXISTS "costs_select_policy" ON public.cost_items;
CREATE POLICY "costs_select_policy" ON public.cost_items
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR (
        app_security.is_project_member(project_id)
        AND app_security.get_current_user_role() IN ('architect', 'civil_engineer', 'consultant')
    )
);

DROP POLICY IF EXISTS "costs_insert_policy" ON public.cost_items;
CREATE POLICY "costs_insert_policy" ON public.cost_items
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
    OR (
        app_security.is_project_member(project_id)
        AND EXISTS (
            SELECT 1 FROM public.project_team_members 
            WHERE project_id::text = cost_items.project_id::text 
            AND user_id::text = (auth.uid())::text 
            AND can_manage_budget = TRUE
        )
    )
);

DROP POLICY IF EXISTS "costs_update_policy" ON public.cost_items;
CREATE POLICY "costs_update_policy" ON public.cost_items
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR (
        app_security.is_project_member(project_id)
        AND EXISTS (
            SELECT 1 FROM public.project_team_members 
            WHERE project_id::text = cost_items.project_id::text 
            AND user_id::text = (auth.uid())::text 
            AND can_manage_budget = TRUE
        )
    )
);

DROP POLICY IF EXISTS "costs_delete_policy" ON public.cost_items;
CREATE POLICY "costs_delete_policy" ON public.cost_items
FOR DELETE USING (app_security.is_admin_or_owner());

-- سياسات payments
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
CREATE POLICY "payments_select_policy" ON public.payments
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_client(project_id)
    OR app_security.is_project_member(project_id)
);

DROP POLICY IF EXISTS "payments_insert_policy" ON public.payments;
CREATE POLICY "payments_insert_policy" ON public.payments
FOR INSERT WITH CHECK (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "payments_update_policy" ON public.payments;
CREATE POLICY "payments_update_policy" ON public.payments
FOR UPDATE USING (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "payments_delete_policy" ON public.payments;
CREATE POLICY "payments_delete_policy" ON public.payments
FOR DELETE USING (app_security.is_admin_or_owner());

-- سياسات suppliers
DROP POLICY IF EXISTS "suppliers_select_policy" ON public.suppliers;
CREATE POLICY "suppliers_select_policy" ON public.suppliers
FOR SELECT USING (app_security.is_staff_or_engineer());

DROP POLICY IF EXISTS "suppliers_insert_policy" ON public.suppliers;
CREATE POLICY "suppliers_insert_policy" ON public.suppliers
FOR INSERT WITH CHECK (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "suppliers_update_policy" ON public.suppliers;
CREATE POLICY "suppliers_update_policy" ON public.suppliers
FOR UPDATE USING (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "suppliers_delete_policy" ON public.suppliers;
CREATE POLICY "suppliers_delete_policy" ON public.suppliers
FOR DELETE USING (app_security.is_admin_or_owner());

-- سياسات magicplan_designs
DROP POLICY IF EXISTS "magicplan_select_policy" ON public.magicplan_designs;
CREATE POLICY "magicplan_select_policy" ON public.magicplan_designs
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR app_security.is_project_client(project_id)
    OR app_security.is_project_member(project_id)
);

DROP POLICY IF EXISTS "magicplan_insert_policy" ON public.magicplan_designs;
CREATE POLICY "magicplan_insert_policy" ON public.magicplan_designs
FOR INSERT WITH CHECK (
    app_security.is_admin_or_owner()
    OR (app_security.is_project_member(project_id) AND app_security.is_staff_or_engineer())
);

DROP POLICY IF EXISTS "magicplan_update_policy" ON public.magicplan_designs;
CREATE POLICY "magicplan_update_policy" ON public.magicplan_designs
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR (app_security.is_project_member(project_id) AND app_security.is_staff_or_engineer())
);

DROP POLICY IF EXISTS "magicplan_delete_policy" ON public.magicplan_designs;
CREATE POLICY "magicplan_delete_policy" ON public.magicplan_designs
FOR DELETE USING (app_security.is_admin_or_owner());

-- سياسات daftra_sync_records
DROP POLICY IF EXISTS "daftra_records_select_policy" ON public.daftra_sync_records;
CREATE POLICY "daftra_records_select_policy" ON public.daftra_sync_records
FOR SELECT USING (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "daftra_records_insert_policy" ON public.daftra_sync_records;
CREATE POLICY "daftra_records_insert_policy" ON public.daftra_sync_records
FOR INSERT WITH CHECK (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "daftra_records_update_policy" ON public.daftra_sync_records;
CREATE POLICY "daftra_records_update_policy" ON public.daftra_sync_records
FOR UPDATE USING (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "daftra_records_delete_policy" ON public.daftra_sync_records;
CREATE POLICY "daftra_records_delete_policy" ON public.daftra_sync_records
FOR DELETE USING (app_security.is_admin_or_owner());

-- سياسات whatsapp_messages
DROP POLICY IF EXISTS "whatsapp_select_policy" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_select_policy" ON public.whatsapp_messages
FOR SELECT USING (
    app_security.is_admin_or_owner()
    OR assigned_to::text = (auth.uid())::text
    OR (project_id IS NOT NULL AND app_security.is_project_member(project_id))
);

DROP POLICY IF EXISTS "whatsapp_insert_policy" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_insert_policy" ON public.whatsapp_messages
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    OR app_security.is_staff_or_engineer()
    OR current_user = 'service_role'
);

DROP POLICY IF EXISTS "whatsapp_update_policy" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_update_policy" ON public.whatsapp_messages
FOR UPDATE USING (
    app_security.is_admin_or_owner()
    OR assigned_to::text = (auth.uid())::text
);

DROP POLICY IF EXISTS "whatsapp_delete_policy" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_delete_policy" ON public.whatsapp_messages
FOR DELETE USING (app_security.is_admin_or_owner());

-- سياسات notifications
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy" ON public.notifications
FOR SELECT USING (
    user_id::text = (auth.uid())::text OR app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
CREATE POLICY "notifications_insert_policy" ON public.notifications
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    OR app_security.is_admin_or_owner()
    OR current_user = 'service_role'
);

DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy" ON public.notifications
FOR UPDATE USING (
    user_id::text = (auth.uid())::text OR app_security.is_admin_or_owner()
);

DROP POLICY IF EXISTS "notifications_delete_policy" ON public.notifications;
CREATE POLICY "notifications_delete_policy" ON public.notifications
FOR DELETE USING (
    user_id::text = (auth.uid())::text OR app_security.is_admin_or_owner()
);

-- سياسات audit_logs
DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
FOR SELECT USING (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    OR current_user = 'service_role'
    OR app_security.is_staff_or_engineer()
);

DROP POLICY IF EXISTS "audit_logs_update_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_update_policy" ON public.audit_logs
FOR UPDATE USING (FALSE);

DROP POLICY IF EXISTS "audit_logs_delete_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_delete_policy" ON public.audit_logs
FOR DELETE USING (app_security.is_admin_or_owner());

-- سياسات app_settings
DROP POLICY IF EXISTS "settings_select_policy" ON public.app_settings;
CREATE POLICY "settings_select_policy" ON public.app_settings
FOR SELECT USING (app_security.is_staff_or_engineer());

DROP POLICY IF EXISTS "settings_insert_policy" ON public.app_settings;
CREATE POLICY "settings_insert_policy" ON public.app_settings
FOR INSERT WITH CHECK (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "settings_update_policy" ON public.app_settings;
CREATE POLICY "settings_update_policy" ON public.app_settings
FOR UPDATE USING (app_security.is_admin_or_owner());

DROP POLICY IF EXISTS "settings_delete_policy" ON public.app_settings;
CREATE POLICY "settings_delete_policy" ON public.app_settings
FOR DELETE USING (app_security.is_admin_or_owner());

-- ----------------------------------------------------------------------------
-- 5. حذف الدوال القديمة المسببة للتحذير من المخطط العام public (حذف نهائي)
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.is_admin_or_owner();
DROP FUNCTION IF EXISTS public.is_staff_or_engineer();
DROP FUNCTION IF EXISTS public.is_project_member(VARCHAR);
DROP FUNCTION IF EXISTS public.is_project_client(VARCHAR);
DROP FUNCTION IF EXISTS public.handle_new_user();

-- نهاية ملف إصلاح تحذيرات الأمان
