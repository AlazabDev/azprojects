// Comprehensive Bilingual Dictionary for AzProjects (Arabic primary & English)

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface Translations {
  // Brand & General
  appName: string;
  appSubtitle: string;
  companyName: string;
  companySubtitle: string;
  version: string;

  // Language & Themes
  language: string;
  arabic: string;
  english: string;
  currentLanguage: string;
  switchLanguage: string;
  appearance: string;
  theme: string;
  lightMode: string;
  darkMode: string;
  systemMode: string;
  themeDescription: string;
  brandColorsTitle: string;
  brandNavyTitle: string;
  brandGoldTitle: string;
  brandGoldWarning: string;

  // Common Actions
  search: string;
  searchPlaceholder: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  edit: string;
  add: string;
  create: string;
  newProject: string;
  close: string;
  back: string;
  next: string;
  filter: string;
  all: string;
  export: string;
  import: string;
  print: string;
  sync: string;
  syncNow: string;
  syncing: string;
  syncSuccess: string;
  refresh: string;
  status: string;
  actions: string;
  details: string;
  viewAll: string;
  loading: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  retry: string;

  // Navigation Items
  navDashboard: string;
  navProjects: string;
  navEngineersHub: string;
  navClientGovernance: string;
  navPhases: string;
  navTasks: string;
  navMagicPlan: string;
  navCosts: string;
  navDocuments: string;
  navReportsAi: string;
  navFieldCommunication: string;
  navSuppliers: string;
  navNotifications: string;
  navIntegrations: string;
  navSettings: string;
  navGallery: string;

  // Header & Controls
  notifications: string;
  markAllRead: string;
  noNotifications: string;
  unreadCount: string;
  appsLauncher: string;
  userProfile: string;
  myProfile: string;
  accountSettings: string;
  logout: string;
  activeProject: string;
  progress: string;
  online: string;
  offline: string;
  syncedWithCloud: string;

  // Roles
  roleOwner: string;
  roleProjectManager: string;
  roleArchitect: string;
  roleCivilEngineer: string;
  roleContractor: string;
  roleConsultant: string;
  roleClient: string;
  roleObserver: string;

  // Projects & Stages
  totalProjects: string;
  activeProjects: string;
  completedProjects: string;
  delayedProjects: string;
  projectBudget: string;
  actualCost: string;
  variance: string;
  stageConcrete: string;
  stageFinishes: string;
  stageMep: string;
  stageHandover: string;
  stagePlanning: string;

  // Tasks & Kanban
  taskTodo: string;
  taskInProgress: string;
  taskReview: string;
  taskDone: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  dueDate: string;
  assignee: string;

  // Integrations
  daftraSyncTitle: string;
  daftraSyncDesc: string;
  magicplanTitle: string;
  magicplanDesc: string;
  geminiAiTitle: string;
  geminiAiDesc: string;
  whatsappTitle: string;
  whatsappDesc: string;

  // Settings Tabs
  tabPreferences: string;
  tabCompanyProfile: string;
  tabIntegrations: string;
  tabClientGovernance: string;
  tabSbcAlerts: string;
  tabDataVault: string;
  tabDomainDeployment: string;

  // Currency & Measurement
  currency: string;
  currencySymbol: string;
  sqm: string;
  sar: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    // Brand & General
    appName: 'AzProjects',
    appSubtitle: 'لوحة التحكم المركزية',
    companyName: 'مؤسسة العزب للمقاولات العامة والتشطيبات',
    companySubtitle: 'المنظومة السحابية الموحدة لإدارة المشاريع الهندسية والتشطيبات المعمارية',
    version: 'الإصدار 2.5.0',

    // Language & Themes
    language: 'اللغة',
    arabic: 'العربية (AR)',
    english: 'English (EN)',
    currentLanguage: 'اللغة الحالية: العربية',
    switchLanguage: 'تغيير اللغة',
    appearance: 'مظهر التطبيق',
    theme: 'المظهر',
    lightMode: 'الوضع النهاري',
    darkMode: 'الوضع الليلي',
    systemMode: 'تلقائي (حسب النظام)',
    themeDescription: 'التبديل بين الواجهة الفاتحة المريحة والواجهة الليلية الداكنة',
    brandColorsTitle: 'الهوية اللونية المعتمدة للمنظومة',
    brandNavyTitle: 'الكحلي الملكي (#030957) - اللون الأساسي والوقور للمنظومة',
    brandGoldTitle: 'الأصفر الذهبي (#FFB900) - لون التميز الثانوي للعناصر الدقيقة',
    brandGoldWarning: 'يتم استخدام الأصفر الذهبي بعناية فائقة فقط للمؤشرات والتنبيهات الدقيقة حتى لا يُجهد العين.',

    // Common Actions
    search: 'بحث',
    searchPlaceholder: 'بحث في المشاريع، المهام، التكاليف والمستندات...',
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    create: 'إنشاء',
    newProject: 'مشروع جديد',
    close: 'إغلاق',
    back: 'رجوع',
    next: 'التالي',
    filter: 'تصفية',
    all: 'الكل',
    export: 'تصدير',
    import: 'استيراد',
    print: 'طباعة',
    sync: 'مزامنة',
    syncNow: 'مزامنة الآن',
    syncing: 'جاري المزامنة...',
    syncSuccess: 'تمت المزامنة بنجاح',
    refresh: 'تحديث',
    status: 'الحالة',
    actions: 'الإجراءات',
    details: 'التفاصيل',
    viewAll: 'عرض الكل',
    loading: 'جاري التحميل...',
    success: 'تمت العملية بنجاح',
    error: 'حدث خطأ',
    warning: 'تنبيه',
    info: 'معلومات',
    retry: 'إعادة المحاولة',

    // Navigation Items
    navDashboard: 'الرئيسية',
    navProjects: 'المشاريع المعمارية',
    navEngineersHub: 'لوحة تحكم المهندسين',
    navClientGovernance: 'حوكمة ومزامنة العملاء (RLS)',
    navPhases: 'المراحل الهندسية',
    navTasks: 'المهام ومتابعة التنفيذ',
    navMagicPlan: 'مخططات MagicPlan',
    navCosts: 'التكاليف ودفترة (ZATCA)',
    navDocuments: 'المستندات والمخططات',
    navReportsAi: 'وكيل المشروعات (Foundry AI)',
    navFieldCommunication: 'الاتصالات الميدانية (WhatsApp)',
    navSuppliers: 'دليل الموردين والمقاولين',
    navNotifications: 'المواعيد والتنبيهات',
    navIntegrations: 'التكاملات والربط السحابي',
    navSettings: 'الإعدادات والصلاحيات',
    navGallery: 'المعرض و MagicPlan',

    // Header & Controls
    notifications: 'الإشعارات والتنبيهات',
    markAllRead: 'تحديد الكل كمقروء',
    noNotifications: 'لا توجد إشعارات جديدة حالياً',
    unreadCount: 'غير مقروء',
    appsLauncher: 'قائمة التطبيقات والوحدات',
    userProfile: 'الملف الشخصي',
    myProfile: 'ملفي الشخصي',
    accountSettings: 'إعدادات الحساب',
    logout: 'تسجيل الخروج',
    activeProject: 'المشروع النشط',
    progress: 'نسبة الإنجاز',
    online: 'متصل بالسحابة',
    offline: 'وضع عدم الاتصال',
    syncedWithCloud: 'البيانات متزامنة بالكامل',

    // Roles
    roleOwner: 'مالك المشروع (صلاحيات كاملة)',
    roleProjectManager: 'مدير المشروع (إدارة وفريق)',
    roleArchitect: 'مهندس معماري (تصاميم ومخططات)',
    roleCivilEngineer: 'مهندس إنشائي / موقع',
    roleContractor: 'المقاول الرئيسي (تنفيذ وجداول)',
    roleConsultant: 'استشاري هندسي ومستشار',
    roleClient: 'العميل (متابعة واطلاع)',
    roleObserver: 'مراقب (قراءة فقط)',

    // Projects & Stages
    totalProjects: 'إجمالي المشاريع',
    activeProjects: 'المشاريع النشطة',
    completedProjects: 'المشاريع المكتملة',
    delayedProjects: 'المشاريع المتأخرة',
    projectBudget: 'الميزانية المعتمدة',
    actualCost: 'المصروف الفعلي',
    variance: 'الفارق المالي',
    stageConcrete: 'أعمال العظم والخرسانات',
    stageFinishes: 'التشطيبات المعمارية',
    stageMep: 'الكهروميكانيكا (MEP)',
    stageHandover: 'التسليم النهائي',
    stagePlanning: 'التخطيط والموافقات',

    // Tasks & Kanban
    taskTodo: 'قيد الانتظار',
    taskInProgress: 'قيد التنفيذ',
    taskReview: 'قيد المراجعة والاعتماد',
    taskDone: 'مكتمل',
    priorityHigh: 'أولوية عاجلة',
    priorityMedium: 'أولوية متوسطة',
    priorityLow: 'أولوية عادية',
    dueDate: 'تاريخ الاستحقاق',
    assignee: 'المسؤول',

    // Integrations
    daftraSyncTitle: 'مزامنة دفترة ERP',
    daftraSyncDesc: 'ربط مباشر مع الحسابات، قيود اليومية، والفواتير الضريبية',
    magicplanTitle: 'رسومات MagicPlan Cloud',
    magicplanDesc: 'استيراد المخططات ثنائية وثلاثية الأبعاد وحساب المساحات آلياً',
    geminiAiTitle: 'المساعد الهندسي الذكي Gemini',
    geminiAiDesc: 'تحليل الموقع وتقدير الكميات والمطابقة مع كود البناء',
    whatsappTitle: 'إشعارات WhatsApp التفاعلية',
    whatsappDesc: 'تواصل مباشر مع العملاء وفرق الموقع الميدانية',

    // Settings Tabs
    tabPreferences: 'التفضيلات والصلاحيات',
    tabCompanyProfile: 'الملف المؤسسي والبيانات',
    tabIntegrations: 'التكاملات السحابية',
    tabClientGovernance: 'حوكمة العملاء (RLS)',
    tabSbcAlerts: 'تنبيهات كود البناء SBC',
    tabDataVault: 'خزينة البيانات والنسخ الاحتياطي',
    tabDomainDeployment: 'إدارة النطاقات والنشر',

    // Currency & Measurement
    currency: 'العملة',
    currencySymbol: 'ر.س',
    sqm: 'م²',
    sar: 'ريال سعودي'
  },

  en: {
    // Brand & General
    appName: 'AzProjects',
    appSubtitle: 'Central Control Hub',
    companyName: 'Al-Azab General Contracting & Finishes',
    companySubtitle: 'Unified Cloud Enterprise Platform for Engineering & Architecture Management',
    version: 'Version 2.5.0',

    // Language & Themes
    language: 'Language',
    arabic: 'العربية (AR)',
    english: 'English (EN)',
    currentLanguage: 'Current Language: English',
    switchLanguage: 'Switch Language',
    appearance: 'Appearance & Theme',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    systemMode: 'System (Auto)',
    themeDescription: 'Toggle between comfortable daylight view and sleek dark mode',
    brandColorsTitle: 'Official Corporate Brand Palette',
    brandNavyTitle: 'Royal Navy (#030957) - Primary Authoritative Brand Color',
    brandGoldTitle: 'Warm Gold (#FFB900) - Secondary Accent for Refined Highlights',
    brandGoldWarning: 'Golden yellow is deliberately restricted to delicate accents and indicators to prevent eye fatigue.',

    // Common Actions
    search: 'Search',
    searchPlaceholder: 'Search projects, tasks, expenses, documents...',
    save: 'Save Changes',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    create: 'Create',
    newProject: 'New Project',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    filter: 'Filter',
    all: 'All',
    export: 'Export',
    import: 'Import',
    print: 'Print',
    sync: 'Sync',
    syncNow: 'Sync Now',
    syncing: 'Syncing...',
    syncSuccess: 'Synced successfully',
    refresh: 'Refresh',
    status: 'Status',
    actions: 'Actions',
    details: 'Details',
    viewAll: 'View All',
    loading: 'Loading...',
    success: 'Operation completed successfully',
    error: 'An error occurred',
    warning: 'Warning',
    info: 'Information',
    retry: 'Retry',

    // Navigation Items
    navDashboard: 'Dashboard',
    navProjects: 'Architectural Projects',
    navEngineersHub: 'Engineers Hub',
    navClientGovernance: 'Client Governance (RLS)',
    navPhases: 'Engineering Phases',
    navTasks: 'Tasks & Execution',
    navMagicPlan: 'MagicPlan Blueprints',
    navCosts: 'Costs & Daftra (ZATCA)',
    navDocuments: 'Documents & Blueprints',
    navReportsAi: 'Foundry AI Agent',
    navFieldCommunication: 'Field Comm (WhatsApp)',
    navSuppliers: 'Suppliers Directory',
    navNotifications: 'Schedule & Alerts',
    navIntegrations: 'Integrations & Cloud',
    navSettings: 'Settings & Permissions',
    navGallery: 'Gallery & MagicPlan',

    // Header & Controls
    notifications: 'Notifications & Alerts',
    markAllRead: 'Mark all as read',
    noNotifications: 'No new notifications currently',
    unreadCount: 'unread',
    appsLauncher: 'Applications & Modules',
    userProfile: 'User Profile',
    myProfile: 'My Profile',
    accountSettings: 'Account Settings',
    logout: 'Log Out',
    activeProject: 'Active Project',
    progress: 'Progress',
    online: 'Connected to Cloud',
    offline: 'Offline Mode',
    syncedWithCloud: 'All data fully synced',

    // Roles
    roleOwner: 'Project Owner (Full Access)',
    roleProjectManager: 'Project Manager (Team & Ops)',
    roleArchitect: 'Architect (Designs & Plans)',
    roleCivilEngineer: 'Civil / Site Engineer',
    roleContractor: 'General Contractor (Execution)',
    roleConsultant: 'Consultant & Engineering Advisor',
    roleClient: 'Client (Viewer & Approver)',
    roleObserver: 'Observer (Read Only)',

    // Projects & Stages
    totalProjects: 'Total Projects',
    activeProjects: 'Active Projects',
    completedProjects: 'Completed Projects',
    delayedProjects: 'Delayed Projects',
    projectBudget: 'Approved Budget',
    actualCost: 'Actual Cost',
    variance: 'Cost Variance',
    stageConcrete: 'Structural & Concrete',
    stageFinishes: 'Architectural Finishes',
    stageMep: 'MEP Engineering',
    stageHandover: 'Final Handover',
    stagePlanning: 'Planning & Permits',

    // Tasks & Kanban
    taskTodo: 'To Do',
    taskInProgress: 'In Progress',
    taskReview: 'Under Review',
    taskDone: 'Completed',
    priorityHigh: 'Urgent Priority',
    priorityMedium: 'Medium Priority',
    priorityLow: 'Normal Priority',
    dueDate: 'Due Date',
    assignee: 'Assignee',

    // Integrations
    daftraSyncTitle: 'Daftra ERP Sync',
    daftraSyncDesc: 'Direct sync with general ledger, journals & ZATCA invoices',
    magicplanTitle: 'MagicPlan Cloud 2D/3D',
    magicplanDesc: 'Automated 2D/3D blueprint import and room area calculations',
    geminiAiTitle: 'Gemini AI Assistant',
    geminiAiDesc: 'Site inspection analytics, takeoff estimations & SBC checks',
    whatsappTitle: 'Interactive WhatsApp Bot',
    whatsappDesc: 'Real-time updates to clients and field teams',

    // Settings Tabs
    tabPreferences: 'Preferences & RBAC',
    tabCompanyProfile: 'Company Profile & Info',
    tabIntegrations: 'Cloud Integrations',
    tabClientGovernance: 'Client Governance (RLS)',
    tabSbcAlerts: 'SBC Code Alerts',
    tabDataVault: 'Data Vault & Backups',
    tabDomainDeployment: 'Domain & Deployments',

    // Currency & Measurement
    currency: 'Currency',
    currencySymbol: 'SAR',
    sqm: 'm²',
    sar: 'Saudi Riyal'
  }
};
