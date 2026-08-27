-- ============================================================================
-- منظومة AzProjects لإدارة المشروعات والمقاولات المعمارية - مؤسسة العزب
-- ملف غرس البيانات الأولية الحية لمشروع أرابيسك وفيلا الملقا والمستخدمين (مصحح)
-- 03_seed_data.sql
-- ============================================================================

-- 1. إدراج إعدادات النظام العامة
INSERT INTO public.app_settings (
    id,
    theme,
    language,
    currency,
    currency_symbol,
    custom_domain,
    production_url,
    daftra_api_key,
    daftra_subdomain,
    daftra_work_order_url,
    magicplan_api_key,
    magicplan_project_id,
    whatsapp_webhook_url,
    auto_sync_daftra,
    auto_classify_whatsapp,
    ai_site_inspections_enabled
) VALUES (
    'global_settings',
    'light',
    'ar',
    'SAR',
    'ر.س',
    'projects.alazab.com',
    'https://projects.alazab.com',
    'daf_live_alazab_co_998124018274aefb',
    'alazab-co',
    'https://alazab-co.daftra.com/owner/work_orders/view/17',
    'mp_sec_3faed7e9_6e92_495c_b4a6',
    '3faed7e9-6e92-495c-b4a6-94a8f0216fcb',
    'https://projects.alazab.com/api/whatsapp-webhook',
    TRUE,
    TRUE,
    TRUE
) ON CONFLICT (id) DO UPDATE SET
    custom_domain = EXCLUDED.custom_domain,
    production_url = EXCLUDED.production_url,
    updated_at = NOW();

-- 2. إدراج الموردين الرئيسيين
INSERT INTO public.suppliers (
    id, name, contact_person, phone, email, address, tax_number, rating, categories, notes, active_contracts_count, total_billed
) VALUES
('SUP-001', 'شركة الخرسانة الجاهزة السعودية', 'م. عبد الله الشمري', '+966 50 111 2233', 'sales@saudireadymix.com.sa', 'طريق الخرج، الرياض', '300124578900003', 4.9, ARRAY['خرسانة جاهزة', 'مواد أساسية', 'صبات موقعية'], 'مورد معتمد لجميع المشروعات الحية وأمر عمل #17', 3, 420000.00),
('SUP-002', 'مؤسسة إعمار للحديد والصلب', 'أ. خالد المطيري', '+966 55 444 7788', 'contact@emaarsteel.sa', 'الصناعية الثانية، الرياض', '300987654300003', 4.8, ARRAY['حديد تسليح', 'هياكل معدنية', 'شبك أرضيات'], 'توريد حديد سابك المعتمد للمشروعات السكنية والتجارية', 2, 680000.00),
('SUP-003', 'دار الزجاج والألمنيوم الفاخر', 'م. فهد السديري', '+966 56 333 9900', 'info@luxglass.sa', 'طريق الملك سلمان، الرياض', '300554433200003', 4.9, ARRAY['واجهات زجاجية', 'ألمنيوم استركشر', 'أبواب وشبابيك'], 'مورد الواجهات المودرن ونظام الزجاج المزدوج العازل', 1, 310000.00)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    total_billed = EXCLUDED.total_billed,
    updated_at = NOW();

-- 3. إدراج مشروع أرابيسك المعماري (المشروع الحي)
INSERT INTO public.projects (
    id, name, name_en, description, location, lat, lng, project_type,
    start_date, end_date, budget, actual_cost, status, progress,
    client_name, client_phone, client_email,
    lead_architect, contractor_name, daftra_work_order_id, daftra_work_order_url,
    magicplan_id, magicplan_thumbnail_url, tags, area_m2, floors_count
) VALUES (
    'PRJ-ARABESQUE',
    'مشروع أرابيسك المعماري (Arabesque)',
    'Arabesque Architectural & Interior Project',
    'مشروع معماري وتنفيذي حي متكامل يجمع بين روح العمارة الإسلامية المعاصرة وزخارف الأرابيسك المتقنة والتصاميم الداخلية الفاخرة. متصل مباشرة بأمر عمل دفترة رقم 17 ومخططات MagicPlan السحابية المعمارية.',
    'طريق الملك عبد العزيز، الرياض، المملكة العربية السعودية',
    24.7743, 46.6385,
    'residential',
    '2026-02-01', '2026-12-31',
    1850000.00, 640000.00,
    'active', 48,
    'شركة أرابيسك للتطوير المعماري (م. أحمد العزب)',
    '+966 54 892 3410',
    'alazab.contract@gmail.com',
    'م. أحمد العزب',
    'شركة العزب للمقاولات العامة',
    '17',
    'https://alazab-co.daftra.com/owner/work_orders/view/17',
    '3faed7e9-6e92-495c-b4a6-94a8f0216fcb',
    'https://assets-v2.cloud.magicplan.app/cUowVUhLV3d3SnNsdTUyYmZqNTd6b3diY3huNUVBSnBIY0paZWNldUxCL1JyL3ZIcFFHSTB2SmQ5SjBGcFR2SHF3bCthREtDU0pwYUd1cTJVUHJ1WEo1WWxVaWZ0WE1VVXo2ZEE1cnRFekg1cXI0WFZub0twNVZROTYvOEQ0N05mMVdNaXlCbzhjU3ozbkthdDh3ZUR1UUwwSHNkSDMwaGQ5TXdwblBYWGlIUXdNRzFDZWZEbzJsdWh2MVAzNlgzRGlENENrdiszOFdsSG1zSWdUMHlVdDZaZmo5SFB2M01lWjZhdXgrZ3pQVVp3MmJ5MDVXT2xqWVM3a28vcExZampLa25yZGZ3N3BrbEMxZ2N2UEVzY0E9PQ?type=thumbnail',
    ARRAY['أرابيسك', 'مشروع حي', 'MagicPlan Live', 'أمر عمل دفترة #17', 'طراز إسلامي معاصر'],
    580.00, 2
) ON CONFLICT (id) DO UPDATE SET
    progress = EXCLUDED.progress,
    actual_cost = EXCLUDED.actual_cost,
    updated_at = NOW();

-- 4. إدراج المراحل الهندسية لمشروع أرابيسك
INSERT INTO public.project_phases (
    id, project_id, name, name_en, description, order_number,
    start_date, end_date, progress, status, budget, actual_cost, deliverables
) VALUES
('PHS-ARB-01', 'PRJ-ARABESQUE', '1. التصميم المعماري والأرابيسك الداخلي', 'Architectural & Interior Design', 'إعداد المخططات المعمارية المعتمدة وتصاميم الأرابيسك وزخارف الواجهات ورفع MagicPlan الحي.', 1, '2026-02-01', '2026-03-31', 100, 'completed', 150000.00, 145000.00, ARRAY['المخططات التنفيذية 2D/3D', 'نماذج وتفاصيل الأرابيسك', 'رخصة البناء واعتماد البلدية']),
('PHS-ARB-02', 'PRJ-ARABESQUE', '2. الأعمال الإنشائية والعظم التأسيسي', 'Structural & Concrete Phase', 'أعمال الحفر وتأسيس القواعد والميد وصب الأعمدة والأسقف الخرسانية للمبنى.', 2, '2026-04-01', '2026-06-30', 85, 'in-progress', 750000.00, 320000.00, ARRAY['القواعد والميد الخرسانية', 'الأعمدة والأسقف', 'عزل الأساسات']),
('PHS-ARB-03', 'PRJ-ARABESQUE', '3. التمديدات الكهروميكانيكية (MEP)', 'MEP & Systems Installation', 'تمديدات الكهرباء والسباكة والتكييف المركزي وشبكات الإنذار الذكية.', 3, '2026-07-01', '2026-08-31', 40, 'in-progress', 320000.00, 110000.00, ARRAY['شبكة الصرف والتغذية', 'مسارات الكهرباء واللوحات', 'دكت التكييف المخفي']),
('PHS-ARB-04', 'PRJ-ARABESQUE', '4. التشطيبات المعمارية وزخارف الأرابيسك', 'Finishing & Arabesque Detailing', 'تركيب الرخام والأرضيات وألواح الأرابيسك المزخرفة والدهانات والواجهات الزجاجية.', 4, '2026-09-01', '2026-11-30', 10, 'pending', 480000.00, 45000.00, ARRAY['ألواح الأرابيسك الخشبية والمعدنية', 'أرضيات البورسلان والرخام', 'الواجهات والإنارة المخفية']),
('PHS-ARB-05', 'PRJ-ARABESQUE', '5. التسليم النهائي وإطلاق المشروع', 'Final Handover & Commissioning', 'إجراء الاختبارات النهائية، تنظيف الموقع، وإصدار شهادة الإشغال والتسليم للعميل.', 5, '2026-12-01', '2026-12-31', 0, 'pending', 150000.00, 20000.00, ARRAY['شهادة إتمام البناء', 'دليل التشغيل والصيانة', 'محضر التسليم الابتدائي والنهائي'])
ON CONFLICT (id) DO UPDATE SET
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    actual_cost = EXCLUDED.actual_cost,
    updated_at = NOW();

-- 5. إدراج المهام لمشروع أرابيسك
INSERT INTO public.tasks (
    id, project_id, phase_id, title, description, assigned_to_name, assigned_to_role,
    priority, status, due_date, estimated_hours, actual_hours, tags, checklist
) VALUES
('TSK-ARB-01', 'PRJ-ARABESQUE', 'PHS-ARB-02', 'صب أعمدة الدور الأول وفحص الخرسانة SBC 304', 'متابعة وصول خلاطات الخرسانة الجاهزة واختبار الهبوط (Slump Test) وأخذ المكعبات القياسية وفق كود البناء.', 'م. طارق العلي', 'civil_engineer', 'critical', 'in-progress', '2026-08-28', 16, 12, ARRAY['خرسانة', 'أعمدة', 'SBC 304', 'موقع'], '[{"id":"chk-1","title":"فحص الشاقولية والتدعيم الخشبي","completed":true},{"id":"chk-2","title":"اعتماد حديد التسسليح والكانات","completed":true},{"id":"chk-3","title":"اختبار الهبوط Slump Test للخلاطات","completed":false}]'::jsonb),
('TSK-ARB-02', 'PRJ-ARABESQUE', 'PHS-ARB-03', 'تمديد مواسير التكييف والتغذية في بهو الأرابيسك', 'مراجعة مخططات المسارات المخفية للتكييف والسباكة لضمان عدم تعارضها مع أشكال الأسقف وزخارف الأرابيسك.', 'م. عمر حسني', 'contractor', 'high', 'in-progress', '2026-09-05', 24, 18, ARRAY['MEP', 'تكييف', 'سباكة', 'تنسيق معماري'], '[{"id":"chk-4","title":"مراجعة مناسيب الجبس والزخارف","completed":true},{"id":"chk-5","title":"ضغط شبكة التغذية على 10 بار","completed":false}]'::jsonb),
('TSK-ARB-03', 'PRJ-ARABESQUE', 'PHS-ARB-04', 'اعتماد عينات قواطع الأرابيسك الخشبية المفرغة بالحاسب CNC', 'فحص عينات خشب السنديان المعالج المقاوم للرطوبة وتدقيق تفاصيل النقوش الإسلامية مع العميل.', 'م. أحمد العزب', 'architect', 'medium', 'todo', '2026-09-15', 8, 2, ARRAY['عينات', 'أرابيسك', 'CNC', 'اعتماد معمار'], '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    actual_hours = EXCLUDED.actual_hours,
    updated_at = NOW();

-- 6. إدراج بنود التكاليف لمشروع أرابيسك المتصلة بدفترة
INSERT INTO public.cost_items (
    id, project_id, phase_id, category, description, planned_amount, actual_amount, committed_amount, date,
    supplier_id, invoice_number, status, deftera_synced, deftera_invoice_id
) VALUES
('CST-ARB-01', 'PRJ-ARABESQUE', 'PHS-ARB-02', 'material', 'توريد خرسانة جاهزة رتبة C35 لأعمدة وسقف الدور الأول (أمر عمل دفترة #17)', 120000.00, 115000.00, 115000.00, '2026-08-20', 'SUP-001', 'INV-SAUDIMIX-8841', 'paid', TRUE, 'DEF-INV-1701'),
('CST-ARB-02', 'PRJ-ARABESQUE', 'PHS-ARB-02', 'material', 'توريد حديد تسليح سابك عالي المقاومة 16 ملم و14 ملم', 180000.00, 168000.00, 168000.00, '2026-08-15', 'SUP-002', 'INV-EMAAR-9921', 'paid', TRUE, 'DEF-INV-1702'),
('CST-ARB-03', 'PRJ-ARABESQUE', 'PHS-ARB-03', 'equipment', 'تأجير مضخة خرسانة 42 متر ورافعة برجية للموقع', 35000.00, 28000.00, 28000.00, '2026-08-22', 'SUP-001', 'INV-PUMP-441', 'actual', TRUE, 'DEF-INV-1703')
ON CONFLICT (id) DO UPDATE SET
    actual_amount = EXCLUDED.actual_amount,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 7. إدراج المخطط المعماري الحي لـ MagicPlan (تم تصحيح اسم العمود إلى thumbnail_url)
INSERT INTO public.magicplan_designs (
    id, project_id, design_id, title, version, thumbnail_url, total_area_m2, rooms_count, wall_perimeter_m, status
) VALUES (
    'MPD-ARB-001',
    'PRJ-ARABESQUE',
    '3faed7e9-6e92-495c-b4a6-94a8f0216fcb',
    'مخطط أرابيسك الحي المعماري - MagicPlan Cloud Live',
    2,
    'https://assets-v2.cloud.magicplan.app/cUowVUhLV3d3SnNsdTUyYmZqNTd6b3diY3huNUVBSnBIY0paZWNldUxCL1JyL3ZIcFFHSTB2SmQ5SjBGcFR2SHF3bCthREtDU0pwYUd1cTJVUHJ1WEo1WWxVaWZ0WE1VVXo2ZEE1cnRFekg1cXI0WFZub0twNVZROTYvOEQ0N05mMVdNaXlCbzhjU3ozbkthdDh3ZUR1UUwwSHNkSDMwaGQ5TXdwblBYWGlIUXdNRzFDZWZEbzJsdWh2MVAzNlgzRGlENENrdiszOFdsSG1zSWdUMHlVdDZaZmo5SFB2M01lWjZhdXgrZ3pQVVp3MmJ5MDVXT2xqWVM3a28vcExZampLa25yZGZ3N3BrbEMxZ2N2UEVzY0E9PQ?type=thumbnail',
    580.00, 12, 340.50, 'synced'
) ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    thumbnail_url = EXCLUDED.thumbnail_url,
    total_area_m2 = EXCLUDED.total_area_m2;

-- 8. إدراج سجل مزامنة دفترة لأمر عمل 17
INSERT INTO public.daftra_sync_records (
    id, project_id, daftra_invoice_id, daftra_transaction_id, amount, direction, status, description
) VALUES (
    'DFR-ARB-01',
    'PRJ-ARABESQUE',
    'DEF-WO-17-INV-01',
    'TXN-991823',
    640000.00,
    'outgoing',
    'synced',
    'مزامنة التكاليف الفعلية لأمر عمل دفترة رقم 17 مع بنود المشروع الحية'
) ON CONFLICT (id) DO NOTHING;

-- نهاية ملف البيانات الأولية
