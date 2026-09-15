import { getAccessToken, googleSignIn } from './googleAuth';

export interface GoogleDriveDocFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  createdTime?: string;
  modifiedTime?: string;
  owners?: Array<{ displayName: string; emailAddress: string; photoLink?: string }>;
  size?: string;
  iconLink?: string;
}

export interface GoogleDocParagraph {
  text: string;
  style?: 'NORMAL_TEXT' | 'HEADING_1' | 'HEADING_2' | 'HEADING_3' | 'TITLE';
}

export interface GoogleDocDetail {
  documentId: string;
  title: string;
  revisionId: string;
  bodyText: string;
  paragraphs: GoogleDocParagraph[];
  webViewLink: string;
}

/**
 * Ensures a valid access token is available, prompting Google Sign In if needed
 */
async function ensureValidAccessToken(): Promise<string> {
  let token = await getAccessToken();
  if (!token) {
    const authResult = await googleSignIn();
    if (!authResult?.accessToken) {
      throw new Error('يجب تسجيل الدخول بحساب Google ومنح صلاحيات Google Docs للوصول');
    }
    token = authResult.accessToken;
  }
  return token;
}

/**
 * Lists Google Docs files from the user's Google Drive
 */
export async function listGoogleDocs(searchTerm?: string, pageSize = 25): Promise<GoogleDriveDocFile[]> {
  const token = await ensureValidAccessToken();

  let query = "mimeType = 'application/vnd.google-apps.document' and trashed = false";
  if (searchTerm && searchTerm.trim()) {
    const escapedTerm = searchTerm.replace(/'/g, "\\'");
    query += ` and name contains '${escapedTerm}'`;
  }

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.append('q', query);
  url.searchParams.append('pageSize', pageSize.toString());
  url.searchParams.append('fields', 'files(id, name, mimeType, webViewLink, createdTime, modifiedTime, owners, iconLink)');
  url.searchParams.append('orderBy', 'modifiedTime desc');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `خطأ في قراءة ملفات Google Docs: (${response.status})`);
  }

  const data = await response.json();
  return (data.files || []).map((file: any) => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    webViewLink: file.webViewLink || `https://docs.google.com/document/d/${file.id}/edit`,
    createdTime: file.createdTime,
    modifiedTime: file.modifiedTime,
    owners: file.owners,
    iconLink: file.iconLink
  }));
}

/**
 * Fetches full details and text content of a Google Doc
 */
export async function getGoogleDoc(documentId: string): Promise<GoogleDocDetail> {
  const token = await ensureValidAccessToken();

  const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `فشل في جلب مستند Google Docs: (${response.status})`);
  }

  const data = await response.json();
  const paragraphs: GoogleDocParagraph[] = [];
  let fullBodyText = '';

  const contentItems = data.body?.content || [];
  for (const item of contentItems) {
    if (item.paragraph) {
      const elements = item.paragraph.elements || [];
      let paragraphText = '';
      for (const elem of elements) {
        if (elem.textRun?.content) {
          paragraphText += elem.textRun.content;
        }
      }
      if (paragraphText) {
        paragraphs.push({
          text: paragraphText,
          style: item.paragraph.paragraphStyle?.namedStyleType || 'NORMAL_TEXT'
        });
        fullBodyText += paragraphText;
      }
    }
  }

  return {
    documentId: data.documentId,
    title: data.title || 'مستند بدون عنوان',
    revisionId: data.revisionId || '1',
    bodyText: fullBodyText,
    paragraphs,
    webViewLink: `https://docs.google.com/document/d/${data.documentId}/edit`
  };
}

/**
 * Creates a brand new Google Doc with optional structured construction initial text
 */
export async function createGoogleDoc(
  title: string,
  initialContent?: string
): Promise<{ documentId: string; title: string; url: string }> {
  const token = await ensureValidAccessToken();

  // 1. Create document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title.trim() || 'مستند مشروع جديد'
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل إنشاء المستند: (${createRes.status})`);
  }

  const createdDoc = await createRes.json();
  const docId = createdDoc.documentId;
  const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

  // 2. Insert initial content if provided
  if (initialContent && initialContent.trim()) {
    try {
      await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: initialContent.trim() + '\n\n'
              }
            }
          ]
        })
      });
    } catch (insertErr) {
      console.warn('Initial text insert failed, document was created:', insertErr);
    }
  }

  return {
    documentId: docId,
    title: createdDoc.title || title,
    url: docUrl
  };
}

/**
 * Appends text to the end of an existing Google Doc
 */
export async function appendGoogleDocText(
  documentId: string,
  textToAppend: string
): Promise<{ success: boolean; message: string }> {
  const token = await ensureValidAccessToken();

  // 1. Get current document to find the end index
  const docRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  if (!docRes.ok) {
    throw new Error('تعذر قراءة المستند لحساب نقطة الإضافة');
  }

  const docData = await docRes.json();
  const content = docData.body?.content || [];
  const lastItem = content[content.length - 1];
  const endIndex = Math.max(1, (lastItem?.endIndex || 2) - 1);

  // 2. Batch update to insert text at the end
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: endIndex },
            text: '\n' + textToAppend.trim() + '\n'
          }
        }
      ]
    })
  });

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل تحديث المستند: (${updateRes.status})`);
  }

  return {
    success: true,
    message: 'تمت إضافة النص بنجاح إلى نهاية مستند Google Docs'
  };
}

/**
 * Permanently deletes or trashes a Google Doc file from Google Drive
 */
export async function deleteGoogleDoc(documentId: string): Promise<void> {
  const token = await ensureValidAccessToken();

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل حذف المستند: (${res.status})`);
  }
}

/**
 * Pre-defined engineering & construction templates for rapid creation
 */
export interface ConstructionDocTemplate {
  id: string;
  name: string;
  nameEn: string;
  category: 'contract' | 'inspection' | 'sbc' | 'meeting' | 'handover';
  description: string;
  defaultTitle: (projectName: string) => string;
  generateContent: (data: {
    projectName: string;
    clientName: string;
    engineerName: string;
    date: string;
    location?: string;
    costBudget?: number;
    completionPercent?: number;
  }) => string;
}

export const CONSTRUCTION_DOC_TEMPLATES: ConstructionDocTemplate[] = [
  {
    id: 'site-inspection',
    name: 'محضر فحص واستلام موقعي (Site Inspection Report)',
    nameEn: 'Site Inspection & Handover Report',
    category: 'inspection',
    description: 'توثيق بنود فحص حديد التسليح، صب الخرسانة، واختبارات الجودة وفق كود SBC',
    defaultTitle: (prj) => `محضر فحص استلام أعمال - ${prj}`,
    generateContent: (data) => `شركة العزب للمقاولات العامة
إدارة الشؤون الهندسية وضبط الجودة
==================================================
محضر فحص واستلام أعمال موقعية (Site Inspection Report)

المشروع: ${data.projectName}
المالك: ${data.clientName}
الموقع: ${data.location || 'الرياض - المملكة العربية السعودية'}
مهندس الإشراف الميداني: ${data.engineerName}
التاريخ: ${data.date}
نسبة الإنجاز الحالية: ${data.completionPercent || 0}%

أولاً: ملخص الأعمال المفحوصة
- نوع الأعمال: فحص واستلام هندسي ميداني
- كود البناء المرجعي: الكود السعودي للمباني السكنية (SBC 1101/1102)
- المخططات المعتمدة: مخططات الإنشاء والتصميم المعماري المعتمدة من أمانة المنطقة

ثانياً: نتائج التدقيق الميداني
[✓] مطابقة أبعاد المحاور ومناسيب الصفر المعماري
[✓] فحص حديد التسليح والتربيط والكانات وتأكيد طبقة الغطاء الخرساني (Cover Blocks)
[✓] معايرة ومطابقة إجهاد الخرسانة الجاهزة (C35 / C40) ورقم إرسالية محطة الخلط
[✓] اختبار الهبوط (Slump Test) وسلامة أخذ المكعبات القياسية (6 مكعبات)

ثالثاً: الملاحظات والتوصيات الهندسية
1. يتم بدء أعمال الرش والمعالجة المائية فور التصلد الابتدائي ولمدة لا تقل عن 7 أيام متتالية.
2. الالتزام بترك مسافات التداخل (Lap Length) المحددة في المخططات الإنشائية.

رابعاً: الاعتمادات والتوقيعات
مهندس المقاول المنفذ: ____________________
المهندس الاستشاري المشرف: ____________________
اعتماد الإدارة الهندسية: شركة العزب للمقاولات العامة`
  },
  {
    id: 'contract-agreement',
    name: 'عقد مقاولة وإنشاءات رئيسي (Construction Agreement)',
    nameEn: 'General Construction Contract',
    category: 'contract',
    description: 'صيغة عقد مقاولة معتمدة وفق اشتراطات الهيئة السعودية للمقاولين ونظام التعاملات',
    defaultTitle: (prj) => `عقد مقاولة وتنفيذ - ${prj}`,
    generateContent: (data) => `عقد مقاولة وتنفيذ أعمال إنشائية ومعمارية
بين شركة العزب للمقاولات العامة والمالك
==================================================
تم بحمد الله وتوفيقه في يوم ${data.date} الاتفاق بين كل من:

الطرف الأول (المالك): ${data.clientName}
الطرف الثاني (المقاول المنفذ): شركة العزب للمقاولات العامة (سجل تجاري رقم 1010892341)

موضوع العقد:
تنفيذ مشروع "${data.projectName}" الواقع في ${data.location || 'مدينة الرياض'} شاملاً أعمال الهيكل الإنشائي والتشطيبات والمخططات الهندسية المعتمدة.

البند الأول: القيمة الإجمالية والدفعات
قيمة العقد الإجمالية المتفق عليها: ${(data.costBudget || 850000).toLocaleString()} ريال سعودي غير شاملة ضريبة القيمة المضافة.
يتم سداد المستحقات بناءً على مستخلصات دورية معتمدة وفق نسب الإنجاز الفعلي لكل مرحلة.

البند الثاني: مدة التنفيذ
يلتزم الطرف الثاني بإنجاز وتسليم كامل الأعمال موضوع هذا العقد في مدة أقصاها (12) شهراً تقويمياً من تاريخ استلام الموقع ورخصة البناء.

البند الثالث: المواصفات وضمان الأعمال
يلتزم المقاول بكافة متطلبات كود البناء السعودي (SBC) وتوفير ضمان لمدة 10 سنوات على الهيكل الإنشائي وسلامة الأساسات ضد العيوب الخفية.

الطرف الأول (المالك): ____________________
الطرف الثاني (شركة العزب): ____________________`
  },
  {
    id: 'sbc-compliance',
    name: 'تقرير تقييم السلامة وكود البناء SBC (SBC Compliance Evaluation)',
    nameEn: 'SBC Safety & Code Evaluation Report',
    category: 'sbc',
    description: 'تقرير دوري للسلامة المهنية واشتراطات الكود السعودي للحماية والوقاية',
    defaultTitle: (prj) => `تقرير تدقيق كود البناء SBC - ${prj}`,
    generateContent: (data) => `تقرير تدقيق السلامة والامتثال لكود البناء السعودي (SBC)
مشروع: ${data.projectName}
التاريخ: ${data.date}
==================================================
إعداد: إدارة التدقيق الهندسي والسلامة - شركة العزب للمقاولات

1. المرجعية الفنية:
- كود البناء الإنشائي (SBC 304 - الخرسانة المسلحة)
- كود الحماية من الحريق والسلامة (SBC 801)
- الكود الكهربائي والميكانيكي الموحد

2. حالة الامتثال في الموقع:
- مسارات الهروب وسلالم الطوارئ: مطابقة للمواصفات القياسية.
- أجهزة الإطفاء ومصادر المياه المؤقتة: متوفرة وجاهزة للاستخدام.
- معدات الوقاية الشخصية (PPE) لعمال الموقع: التزام بنسبة 98%.

3. التوصيات الميدانية العاجلة:
- تحديث لوحات الإرشاد التحذيرية حول الحفر والارتفاعات.
- مراجعة تغليف ومسارات الكيابل الأرضية المؤقتة لتفادي التلف.

المعتمد:
رئيس قسم السلامة والجودة: ${data.engineerName}`
  },
  {
    id: 'consultant-meeting',
    name: 'محضر اجتماع وتنسيق استشاري (Consultant Meeting Minutes)',
    nameEn: 'Consultant Coordination Minutes',
    category: 'meeting',
    description: 'توثيق الاجتماعات الدورية بين المقاول المنفذ، الاستشاري المشرف، والمالك',
    defaultTitle: (prj) => `محضر اجتماع التنسيق الاستشاري - ${prj}`,
    generateContent: (data) => `محضر اجتماع التنسيق الهندسي والاستشاري الدوري
المشروع: ${data.projectName}
التاريخ: ${data.date}
مكان الاجتماع: قاعة الاجتماعات بمقر إدارة مشروع ${data.projectName}
==================================================
الحاضرون:
1. ممثل المالك: ${data.clientName}
2. مدير المشروع (شركة العزب): ${data.engineerName}
3. المهندس الاستشاري المشرف

جدول الأعمال والمواضيع المطروحة:
1. استعراض الجدول الزمني ونسبة الإنجاز الفعلية (${data.completionPercent || 0}%).
2. مناقشة عينات مواد التشطيب المعتمدة (الأرضيات، الدهانات، العوازل الحرارية).
3. اعتماد المستخلص المالي رقم (4) المرفوع على منصة دفترة المحاسبية.

القرارات المتخذة:
- اعتماد مورد العزل المائي والحراري المعتمد لدى وزارة الطاقة والبلديات.
- تكثيف فرق العمل في الطابق الثاني لتسريع وتيرة الصب قبل نهاية الأسبوع.
- موعد الاجتماع القادم: بعد أسبوعين لمراجعة تقرير الاختبارات المعملية.

توقيع الحضور:
ممثل المالك: _______________  المهندس المشرف: _______________  شركة العزب: _______________`
  }
];
