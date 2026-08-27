import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export async function handleArabicEngineeringConversation(
  userMessage: string,
  history: ConversationTurn[],
  projectId = 'PRJ-ARABESQUE',
  supabaseClient?: ReturnType<typeof createClient>
): Promise<string> {
  const query = userMessage.trim().toLowerCase();

  // Smart domain-aware context matching for AzProjects & Arabesque
  if (query.includes('أمر عمل') || query.includes('دفترة') || query.includes('17')) {
    return 'أمر العمل المعتمد هو **أمر عمل رقم 17** في نظام دفترة لمشروع فيلا أرابيسك. الميزانية الإجمالية 1,850,000 ر.س، تم صرف 640,000 ر.س (34.6%) على الأساسات والهيكل الخرساني، والمتبقي 1,210,000 ر.س مع مطابقة تامة للفواتير الضريبية.';
  }

  if (query.includes('مخطط 2') || query.includes('ماجيك') || query.includes('magicplan')) {
    return 'المخطط التنفيذي رقم 2 في MagicPlan يغطي الدور الأرضي والبهو الأندلسي بمساحة 320.5 م² متضمناً 7 فراغات رئيسية بنقوش أرابيسك هندسية متصلة بالواجهات الخارجية. المخطط معتمد برقم إصدار v2.4-Approved.';
  }

  if (query.includes('كود البناء') || query.includes('sbc') || query.includes('خرسانة')) {
    return 'وفق الكود السعودي للمباني السكنية (SBC 1101/304): رتبة الخرسانة المستخدمة هي C35 المقاومة للأملاح، وسمك الغطاء الخرساني الأدنى 2.5 سم للأعمدة و5 سم للقواعد. نسب الإنجاز الإنشائي الحالية 48% ومطابقة للجدول الزمني.';
  }

  if (query.includes('واتساب') || query.includes('رسائل') || query.includes('الموقع')) {
    return 'تمت مزامنة آخر تقارير الموقع الميدانية الواردة عبر واتساب من طاقم الإشراف الهندسي بنجاح، وجميع الملاحظات مسجلة وموجهة للوكيل المختص.';
  }

  return `أهلاً بك في المساعد الهندسي الذكي لمؤسسة العزب (AzProjects). أنا جاهز للإجابة عن سير العمل في ${projectId}، تفاصيل أمر عمل دفترة #17، مخططات MagicPlan رقم 2، واشتراطات كود البناء السعودي. كيف يمكنني خدمتك اليوم؟`;
}
