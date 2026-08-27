-- ============================================================================
-- منظومة AzProjects لإدارة المشروعات والمقاولات المعمارية - مؤسسة العزب
-- ملف بناء الجداول والأنواع والعلاقات المعتمدة (Supabase Linter Compliant)
-- 01_schema.sql
-- ============================================================================

-- تفعيل ملحقات بوستجرس الضرورية
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. الأنواع المخصصة والتعدادات (Custom Enum Types)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'owner',
        'project_manager',
        'architect',
        'civil_engineer',
        'contractor',
        'consultant',
        'client'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM (
        'planning',
        'active',
        'paused',
        'completed',
        'delayed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_type AS ENUM (
        'residential',
        'commercial',
        'administrative',
        'renovation',
        'interior'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM (
        'low',
        'medium',
        'high',
        'critical'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'todo',
        'in-progress',
        'review',
        'completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE phase_status AS ENUM (
        'pending',
        'in-progress',
        'completed',
        'delayed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_category AS ENUM (
        'blueprints',
        'permits',
        'contracts',
        'reports',
        'specifications',
        'invoices',
        '3d-models',
        'photos'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cost_category AS ENUM (
        'labor',
        'material',
        'equipment',
        'subcontractor',
        'administrative',
        'contingency'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cost_status AS ENUM (
        'planned',
        'committed',
        'actual',
        'paid'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'transfer',
        'cash',
        'check',
        'online'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'pending',
        'completed',
        'failed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_direction AS ENUM (
        'incoming',
        'outgoing'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'task',
        'budget',
        'phase',
        'system',
        'whatsapp',
        'approval'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM (
        'low',
        'medium',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. دالة تحديث الحقل updated_at تلقائياً (مع search_path آمن ومحدد)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. جدول ملفات المستخدمين (PROFILES) المرتبط بـ auth.users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    phone VARCHAR(50),
    avatar TEXT,
    title VARCHAR(150),
    bio TEXT,
    department VARCHAR(100),
    specialization VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. جدول المشروعات المعمارية والتنفيذية (PROJECTS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('PRJ-' || substr(md5(random()::text), 1, 8)),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    location VARCHAR(255) NOT NULL,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    project_type project_type NOT NULL DEFAULT 'residential',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    actual_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status project_status NOT NULL DEFAULT 'planning',
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    client_email VARCHAR(255),
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    lead_architect VARCHAR(255),
    lead_architect_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    contractor_name VARCHAR(255),
    contractor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    daftra_work_order_id VARCHAR(100),
    daftra_work_order_url TEXT,
    magicplan_id VARCHAR(150),
    magicplan_thumbnail_url TEXT,
    
    tags TEXT[] DEFAULT '{}',
    area_m2 NUMERIC(10, 2),
    floors_count INTEGER DEFAULT 1,
    
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. جدول أعضاء فريق المشروع وأذوناتهم المخصصة (Project Team Members)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(100) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_role VARCHAR(100) NOT NULL,
    can_edit_project BOOLEAN DEFAULT FALSE,
    can_assign_tasks BOOLEAN DEFAULT FALSE,
    can_upload_blueprints BOOLEAN DEFAULT TRUE,
    can_manage_budget BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 6. جدول المراحل الهندسية القياسية للمشروع (Project Phases)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_phases (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('PHS-' || substr(md5(random()::text), 1, 8)),
    project_id VARCHAR(100) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    order_number INTEGER NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status phase_status NOT NULL DEFAULT 'pending',
    budget NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    actual_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    deliverables TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. جدول المهام وقوائم التحقق (Tasks & Checklists)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('TSK-' || substr(md5(random()::text), 1, 8)),
    project_id VARCHAR(100) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    phase_id VARCHAR(100) REFERENCES public.project_phases(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to_name VARCHAR(255),
    assigned_to_role VARCHAR(100),
    priority task_priority NOT NULL DEFAULT 'medium',
    status task_status NOT NULL DEFAULT 'todo',
    due_date DATE,
    estimated_hours NUMERIC(6, 2) DEFAULT 0,
    actual_hours NUMERIC(6, 2) DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    checklist JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. جدول المستندات والمخططات الهندسية والتراخيص (Documents)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('DOC-' || substr(md5(random()::text), 1, 8)),
    project_id VARCHAR(100) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category document_category NOT NULL DEFAULT 'blueprints',
    file_type VARCHAR(50) NOT NULL,
    file_size VARCHAR(50),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    version VARCHAR(20) DEFAULT '1.0',
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_by_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. جدول الموردين والمقاولين الباطن (Suppliers)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suppliers (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('SUP-' || substr(md5(random()::text), 1, 8)),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    tax_number VARCHAR(100),
    commercial_register VARCHAR(100),
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5.00),
    categories TEXT[] DEFAULT '{}',
    notes TEXT,
    active_contracts_count INTEGER DEFAULT 0,
    total_billed NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. جدول بنود التكاليف والمصروفات (Cost Items)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cost_items (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('CST-' || substr(md5(random()::text), 1, 8)),
    project_id VARCHAR(100) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    phase_id VARCHAR(100) REFERENCES public.project_phases(id) ON DELETE SET NULL,
    category cost_category NOT NULL DEFAULT 'material',
    description TEXT NOT NULL,
    planned_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    actual_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    committed_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    supplier_id VARCHAR(100) REFERENCES public.suppliers(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100),
    status cost_status NOT NULL DEFAULT 'planned',
    notes TEXT,
    
    deftera_synced BOOLEAN DEFAULT FALSE,
    deftera_invoice_id VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. جدول المدفوعات والتحويلات المالية (Payments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('PAY-' || substr(md5(random()::text), 1, 8)),
    project_id VARCHAR(100) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    cost_id VARCHAR(100) REFERENCES public.cost_items(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method payment_method NOT NULL DEFAULT 'transfer',
    reference_number VARCHAR(150),
    status payment_status NOT NULL DEFAULT 'completed',
    received_by VARCHAR(255),
    recipient_name VARCHAR(255) NOT NULL,
    invoice_number VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. جدول مخططات وتصاميم MagicPlan السحابية (MagicPlan Designs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.magicplan_designs (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('MPD-' || substr(md5(random()::text), 1, 8)),
    project_id VARCHAR(100) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    design_id VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    floors JSONB DEFAULT '[]'::jsonb,
    thumbnail_url TEXT,
    sync_date TIMESTAMPTZ DEFAULT NOW(),
    total_area_m2 NUMERIC(10, 2),
    rooms_count INTEGER,
    wall_perimeter_m NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'synced',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. جدول رسائل ووسائط الواتساب الميدانية (WhatsApp Messages)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('WAM-' || substr(md5(random()::text), 1, 8)),
    project_id VARCHAR(100) REFERENCES public.projects(id) ON DELETE SET NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(50) NOT NULL,
    direction message_direction NOT NULL DEFAULT 'incoming',
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(50),
    voice_note_duration INTEGER,
    voice_transcript TEXT,
    extracted_tags TEXT[] DEFAULT '{}',
    ai_classification VARCHAR(100),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'processed',
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 14. جدول سجلات مزامنة دفترة لأوامر العمل (Daftra Sync Records)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daftra_sync_records (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('DFR-' || substr(md5(random()::text), 1, 8)),
    project_id VARCHAR(100) REFERENCES public.projects(id) ON DELETE CASCADE,
    daftra_invoice_id VARCHAR(100),
    daftra_transaction_id VARCHAR(100),
    amount NUMERIC(15, 2) NOT NULL,
    direction VARCHAR(50) DEFAULT 'outgoing',
    status VARCHAR(50) DEFAULT 'synced',
    description TEXT,
    sync_payload JSONB DEFAULT '{}'::jsonb,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 15. جدول الإشعارات والتنبيهات (Notifications)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('NOTIF-' || substr(md5(random()::text), 1, 8)),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id VARCHAR(100) REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'system',
    priority notification_priority NOT NULL DEFAULT 'medium',
    read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 16. جدول سجلات التدقيق والأمان (Audit Logs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('LOG-' || substr(md5(random()::text), 1, 8)),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(100),
    project_id VARCHAR(100) REFERENCES public.projects(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    changes JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 17. جدول إعدادات النظام وتكاملات الـ API (App Settings)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global_settings',
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'ar',
    currency VARCHAR(10) DEFAULT 'SAR',
    currency_symbol VARCHAR(10) DEFAULT 'ر.س',
    custom_domain VARCHAR(255) DEFAULT 'projects.alazab.com',
    production_url VARCHAR(255) DEFAULT 'https://projects.alazab.com',
    daftra_api_key TEXT,
    daftra_subdomain VARCHAR(100) DEFAULT 'alazab-co',
    daftra_work_order_url TEXT DEFAULT 'https://alazab-co.daftra.com/owner/work_orders/view/17',
    magicplan_api_key TEXT,
    magicplan_project_id VARCHAR(100) DEFAULT '3faed7e9-6e92-495c-b4a6-94a8f0216fcb',
    whatsapp_webhook_url TEXT,
    auto_sync_daftra BOOLEAN DEFAULT TRUE,
    auto_classify_whatsapp BOOLEAN DEFAULT TRUE,
    ai_site_inspections_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 18. الفهارس الذكية لتحسين سرعة الاستعلامات (Performance Indexes)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_team_user ON public.project_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_team_project ON public.project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_phases_project ON public.project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_docs_project ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_cost_project ON public.cost_items(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_project ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_project ON public.whatsapp_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- 19. تفعيل مشغلات التحديث التلقائي لحقول updated_at (Triggers)
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_phases_updated_at ON public.project_phases;
CREATE TRIGGER trg_phases_updated_at BEFORE UPDATE ON public.project_phases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_cost_items_updated_at ON public.cost_items;
CREATE TRIGGER trg_cost_items_updated_at BEFORE UPDATE ON public.cost_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER trg_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- نهاية ملف بناء المخطط والعلاقات والفهارس
