# AGENTS.md - إرشادات وقواعد عمل وكلاء الذكاء الاصطناعي (AzProjects System)

## 📌 تعليمات وقواعد إلزامية دائمة (Permanent Directives)

### 1. قاعدة الحفاظ الدائم على ملف البيئة `.env` وعدم حذفه (DO NOT DELETE .ENV)
* **القاعدة الصارمة:** يُحظر تماماً وبشكل قاطع حذف ملف `.env` في جذر المشروع، أو تفريغ محتواه، أو استبدال قيمه بالقيم الافتراضية الفارغة في أي وقت أو أثناء أي دورة عمل مستقبلية.

---

### 2. القاعدة الأمنية الصارمة: حظر إضافة المفاتيح السرية في متغيرات فيت (NO SECRETS IN VITE_)
* **التحذير الأمني الحاسم:** أي متغير يبدأ بـ `VITE_` يتم تضمينه وحقنه مباشرة في كود الجافاسكربت في المتصفح (Client Bundle) ويكون مكشوفاً لأي مستخدم يفتح أدوات المطورين (DevTools).
* **يُمنع منعاً باتاً ومطلقاً:** وضع أي مفتاح API سري أو رمز وصول (Secret Key / API Key / Access Token / Password) ببادئة `VITE_`.
* **الفصل الأمني المعماري:**
  1. **متغيرات فيت المسموحة (`VITE_`):** فقط العناوين العامة غير الحساسة ومفاتيح Supabase المخصصة للمتصفح المحمية بـ RLS:
     - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`
     - `VITE_APP_URL`, `VITE_PRODUCTION_DOMAIN`, `VITE_CUSTOM_DOMAIN`
     - `VITE_DAFTRA_SUBDOMAIN`, `VITE_DAFTRA_BASE_URL` (عناوين عامة فقط بدون مفاتيح)
     - `VITE_MAGICPLAN_BASE_URL` (عنوان فقط بدون مفاتيح)
     - `VITE_MINIO_ENDPOINT`, `VITE_MINIO_BUCKET_NAME` (نطاق التخزين فقط)
     - `VITE_AZURE_AI_AGENT_NAME`, `VITE_AZURE_AI_AGENT_VERSION` (اسم النسخة فقط)
  2. **المفاتيح السرية الحصرية للسيرفر (Server-Only Secrets - بدون بادئة VITE_):**
     - `DAFTRA_API_KEY` (يُستدعى فقط في Express Server عبر مسارات `/api/daftra/*`)
     - `MAGICPLAN_API_KEY` و `MAGICPLAN_CUSTOMER_KEY` (تُستدعى فقط في Express Server عبر `/api/magicplan/*`)
     - `SUPABASE_SERVICE_ROLE_KEY` (مفتاح الإدارة السري - سيرفر فقط)
     - `GEMINI_API_KEY` (سيرفر فقط)
     - `MINIO_ACCESS_KEY` و `MINIO_SECRET_KEY` (سيرفر فقط)
     - `WHATSAPP_ACCESS_TOKEN` و `WHATSAPP_WEBHOOK_SECRET` (سيرفر فقط)
     - `SQL_PASSWORD` (سيرفر فقط)
     - `AZURE_AI_PROJECTS_ENDPOINT` (سيرفر فقط)

---

### 3. بنية المنظومة المعمارية والتقنية (Architecture Rules)
* **المصادقة وقاعدة البيانات السحابية:** سوبابيس (Supabase) هو المزود الأساسي للمصادقة وتخزين المستندات.
* **تكوين الواجهة الأمامية:** يتم استدعاء المتغيرات العامة في الفرونت إند عبر `src/config/env.ts` المقروء من `import.meta.env` وخالٍ تماماً من أي أسرار.
* **منفذ السيرفر والشبكة:** السيرفر يعمل دائماً على المنفذ `3000` والمضيف `0.0.0.0`.
* **سياسات الأمان RLS:** أي استعلامات أو دوال أمان في PostgreSQL يجب أن تستخدم `(SELECT auth.uid())` لمنع تحذيرات `auth_rls_initplan`.
