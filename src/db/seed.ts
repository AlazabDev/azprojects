import { db } from './index.ts';
import { projects, projectPhases, architecturalBlueprints, fieldUpdates, users, syncLogs } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seedInitialProjectsAndClients() {
  try {
    console.log('Checking if database needs initial seeding from Daftra, MagicPlan & Milano...');

    const existingUsers = await db.select().from(users);

    // 1. Seed or update Engineers & Admin
    const defaultEngineers = [
      {
        uid: 'eng_alazab_owner',
        email: 'alazab.construction@gmail.com',
        displayName: 'م. أحمد العزب (المدير العام / مهندس رئيسي)',
        role: 'owner',
        phoneNumber: '+966500000001',
        status: 'active',
      },
      {
        uid: 'eng_site_lead',
        email: 'engineer@alazab.com',
        displayName: 'م. طارق الخالدي (كبير مهندسي المواقع)',
        role: 'engineer',
        phoneNumber: '+966500000002',
        status: 'active',
      },
    ];

    for (const eng of defaultEngineers) {
      const match = existingUsers.find(u => u.email === eng.email);
      if (!match) {
        await db.insert(users).values(eng);
      }
    }

    // 2. Define the 4 Core Projects from Daftra, MagicPlan & Milano
    const coreProjects = [
      {
        code: 'PRJ-ARB-01',
        externalId: 'DFT-WO-101',
        name: 'مشروع فيلا أرابيسك المعمارية (Arabesque Villa)',
        clientEmail: 'client.arabesque@gmail.com',
        clientName: 'سعادة الشيخ سلطان بن عبدالعزيز القحطاني',
        clientPhone: '+966551234567',
        status: 'in_progress',
        progress: 68,
        budget: '2,850,000 ر.س',
        spent: '1,940,000 ر.س',
        location: 'حي النرجس، الرياض، المملكة العربية السعودية',
        source: 'daftra',
        phases: [
          { name: 'الأعمال الإنشائية والخرسانية', progress: 100, budget: '950,000 ر.س', spent: '940,000 ر.س', status: 'completed' },
          { name: 'أعمال المشربيات والأرابيسك CNC', progress: 85, budget: '620,000 ر.س', spent: '530,000 ر.س', status: 'in_progress' },
          { name: 'أعمال التكسيات الرخامية والواجهات', progress: 60, budget: '780,000 ر.س', spent: '470,000 ر.س', status: 'in_progress' },
          { name: 'التشطيبات النهائية والسمارت هوم', progress: 25, budget: '500,000 ر.س', spent: '125,000 ر.س', status: 'pending' },
        ],
        blueprints: [
          {
            title: 'المسقط الأفقي التنفيذي - الدور الأرضي (Ground Floor Plan)',
            type: '2D_PLAN',
            fileUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            magicPlanProjectId: '3faed7e9-6e92-495c-b4a6-94a8f0216fcb',
          },
          {
            title: 'تفاصيل مشربيات الأرابيسك وقص الليزر CNC',
            type: 'CAD_DWG',
            fileUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
            magicPlanProjectId: '3faed7e9-6e92-495c-b4a6-94a8f0216fcb',
          },
        ],
      },
      {
        code: 'PRJ-AND-02',
        externalId: 'DFT-WO-102',
        name: 'قصر الأندلس الفندقي والضيافة الملكية',
        clientEmail: 'client.andalus@gmail.com',
        clientName: 'د. خالد بن منصور الراجحي',
        clientPhone: '+966552345678',
        status: 'in_progress',
        progress: 82,
        budget: '5,400,000 ر.س',
        spent: '4,450,000 ر.س',
        location: 'الكورنيش الشمالي، جدة، المملكة العربية السعودية',
        source: 'magicplan',
        phases: [
          { name: 'الهيكل الإنشائي والأساسات العميقة', progress: 100, budget: '2,100,000 ر.س', spent: '2,080,000 ر.س', status: 'completed' },
          { name: 'تكسيات الرخام الإسباني والأندلسي', progress: 90, budget: '1,800,000 ر.س', spent: '1,650,000 ر.س', status: 'in_progress' },
          { name: 'القباب الجبسية والأقواس المقرنصة', progress: 75, budget: '900,000 ر.س', spent: '680,000 ر.س', status: 'in_progress' },
          { name: 'أنظمة التكييف المركزي والإضاءة الفندقية', progress: 65, budget: '600,000 ر.س', spent: '390,000 ر.س', status: 'in_progress' },
        ],
        blueprints: [
          {
            title: 'المساقط المعمارية للبهو الرئيسي والأجنحة الملكية',
            type: '2D_PLAN',
            fileUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            magicPlanProjectId: 'mp_andalus_hotel_02',
          },
        ],
      },
      {
        code: 'PRJ-MAL-03',
        externalId: 'DFT-WO-103',
        name: 'مجمع أعمال ميلانو التجاري والمكتبي (Milano Business Center)',
        clientEmail: 'client.milano@gmail.com',
        clientName: 'شركة ميلانو القابضة للاستثمار العقاري',
        clientPhone: '+966553456789',
        status: 'in_progress',
        progress: 45,
        budget: '7,200,000 ر.س',
        spent: '3,250,000 ر.س',
        location: 'طريق الملك فيصل، الخبر، المنطقة الشرقية',
        source: 'milano',
        phases: [
          { name: 'الحفر وسند جوانب التربة والأساسات', progress: 100, budget: '1,500,000 ر.س', spent: '1,490,000 ر.س', status: 'completed' },
          { name: 'الهيكل الخرساني للأدوار الخمسة', progress: 70, budget: '2,800,000 ر.س', spent: '1,960,000 ر.س', status: 'in_progress' },
          { name: 'واجهات الكيرتن وول والزجاج المعماري', progress: 30, budget: '1,700,000 ر.س', spent: '510,000 ر.س', status: 'in_progress' },
          { name: 'أنظمة مكافحة الحريق وكود البناء SBC', progress: 20, budget: '1,200,000 ر.س', spent: '240,000 ر.س', status: 'pending' },
        ],
        blueprints: [
          {
            title: 'مخططات واجهات الزجاج الذكي والمساحات المكتبية',
            type: '2D_PLAN',
            fileUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
            magicPlanProjectId: 'mp_milano_corp_03',
          },
        ],
      },
      {
        code: 'PRJ-YAS-04',
        externalId: 'DFT-WO-104',
        name: 'فيلا الياسمين المودرن الفاخرة (Al-Yasmin Modern Villa)',
        clientEmail: 'client.yasmin@gmail.com',
        clientName: 'المهندس فيصل بن سعد التميمي',
        clientPhone: '+966554567890',
        status: 'in_progress',
        progress: 30,
        budget: '3,100,000 ر.س',
        spent: '950,000 ر.س',
        location: 'حي الياسمين، الرياض، المملكة العربية السعودية',
        source: 'daftra',
        phases: [
          { name: 'الأساسات والأعمدة الخرسانية', progress: 100, budget: '800,000 ر.س', spent: '790,000 ر.س', status: 'completed' },
          { name: 'مباني البلوك والعزل الحراري المزدوج', progress: 50, budget: '550,000 ر.س', spent: '275,000 ر.س', status: 'in_progress' },
          { name: 'السباكة والكهرباء التأسيسية وتجهيزات المسابح', progress: 15, budget: '650,000 ر.س', spent: '98,000 ر.س', status: 'pending' },
          { name: 'التشطيب المودرن وتنسيق الحدائق (Lanscaping)', progress: 0, budget: '1,100,000 ر.س', spent: '0 ر.س', status: 'pending' },
        ],
        blueprints: [
          {
            title: 'المسقط المعماري المودرن واللاندسكيب الخارجي',
            type: '2D_PLAN',
            fileUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
            magicPlanProjectId: 'mp_yasmin_villa_04',
          },
        ],
      },
    ];

    for (const prj of coreProjects) {
      // 1. Create / Update Project
      const existingPrj = await db
        .select()
        .from(projects)
        .where(eq(projects.code, prj.code))
        .limit(1);

      let currentProjectId: number;

      if (existingPrj.length === 0) {
        const ins = await db
          .insert(projects)
          .values({
            code: prj.code,
            externalId: prj.externalId,
            name: prj.name,
            clientEmail: prj.clientEmail.toLowerCase(),
            clientName: prj.clientName,
            clientPhone: prj.clientPhone,
            status: prj.status,
            progress: prj.progress,
            budget: prj.budget,
            spent: prj.spent,
            location: prj.location,
            source: prj.source,
          })
          .returning();
        currentProjectId = ins[0].id;
      } else {
        currentProjectId = existingPrj[0].id;
      }

      // 2. Automatically register client in users table with role 'client'
      const clientUser = await db
        .select()
        .from(users)
        .where(eq(users.email, prj.clientEmail.toLowerCase()))
        .limit(1);

      if (clientUser.length === 0) {
        await db.insert(users).values({
          uid: `client_${prj.code.toLowerCase()}`,
          email: prj.clientEmail.toLowerCase(),
          displayName: prj.clientName,
          role: 'client',
          phoneNumber: prj.clientPhone,
          status: 'invited',
          inviteSentAt: new Date(),
        });
      }

      // 3. Phases
      for (const ph of prj.phases) {
        const existingPhases = await db
          .select()
          .from(projectPhases)
          .where(eq(projectPhases.projectId, currentProjectId));

        if (!existingPhases.some(p => p.name === ph.name)) {
          await db.insert(projectPhases).values({
            projectId: currentProjectId,
            name: ph.name,
            progress: ph.progress,
            budget: ph.budget,
            spent: ph.spent,
            status: ph.status,
          });
        }
      }

      // 4. Blueprints
      for (const bp of prj.blueprints) {
        const existingBps = await db
          .select()
          .from(architecturalBlueprints)
          .where(eq(architecturalBlueprints.projectId, currentProjectId));

        if (!existingBps.some(b => b.title === bp.title)) {
          await db.insert(architecturalBlueprints).values({
            projectId: currentProjectId,
            title: bp.title,
            type: bp.type,
            fileUrl: bp.fileUrl,
            magicPlanProjectId: bp.magicPlanProjectId,
          });
        }
      }

      // 5. Add initial field update
      const existingUpdates = await db
        .select()
        .from(fieldUpdates)
        .where(eq(fieldUpdates.projectId, currentProjectId));

      if (existingUpdates.length === 0) {
        await db.insert(fieldUpdates).values({
          projectId: currentProjectId,
          senderName: 'م. طارق الخالدي',
          senderPhone: '+966500000002',
          senderRole: 'مهندس الموقع الميداني',
          messageType: 'image',
          content: `تم توثيق سير العمل الميداني بنجاح لمشروع ${prj.name}، ومطابق تماماً للمواصفات وكود البناء السعودي.`,
          mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80',
          status: 'verified',
        });
      }
    }

    // 6. Log synchronization
    await db.insert(syncLogs).values({
      source: 'daftra',
      status: 'success',
      itemsSynced: coreProjects.length,
      details: 'تمت مزامنة المشروعات الـ 4 بنجاح وتأسيس حوكمة بريد العملاء وسياسات مستوى الصف (RLS).',
    });

    console.log('Database initial seeding completed successfully.');
  } catch (err) {
    console.error('Error seeding initial projects and clients:', err);
  }
}
