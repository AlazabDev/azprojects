# GEMINI.md - تعليمات مشروع AzProjects لوكلاء Gemini

## 🛡️ قواعد دائمة وغير قابلة للتعديل (Non-Negotiable Directives)

### 1. الحفاظ على ملف `.env` وعدم حذفه (Preserve `.env` Always)
* يُمنع منعاً باتاً حذف ملف `.env` في جذر المشروع أو استبداله بملف فارغ أو مسح قيمه.

---

### 2. الحظر الأمني القاطع: لا أسرار في متغيرات Vite نهائياً (ZERO Secrets in `VITE_`)
* **مبدأ الأمان الأساسي:** كل متغير يحمل بادئة `VITE_` يتم تضمينه داخل حزمة المتصفح العامة (Client-side bundle)، وبالتالي أي مفتاح سر يُوضع كـ `VITE_` يُعد تسريباً أمنياً خطيراً.
* **المسموح به فقط في `VITE_`:**
  - روابط وعناوين عامة: `VITE_APP_URL`, `VITE_PRODUCTION_DOMAIN`, `VITE_CUSTOM_DOMAIN`, `VITE_DAFTRA_BASE_URL`, `VITE_MAGICPLAN_BASE_URL`, `VITE_MINIO_ENDPOINT`, `VITE_MINIO_BUCKET_NAME`.
  - معرفات النطاق والنسخة: `VITE_DAFTRA_SUBDOMAIN`, `VITE_AZURE_AI_AGENT_NAME`, `VITE_AZURE_AI_AGENT_VERSION`.
  - مفاتيح Supabase العامة المخصصة للواجهة والمحمية بسياسات RLS: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
* **المفاتيح السرية الحصرية للخادم (Server-Side Only بدون VITE_):**
  - `DAFTRA_API_KEY` (ممنوع في Vite)
  - `MAGICPLAN_API_KEY` و `MAGICPLAN_CUSTOMER_KEY` (ممنوع في Vite)
  - `SUPABASE_SERVICE_ROLE_KEY` (ممنوع في Vite)
  - `GEMINI_API_KEY` (ممنوع في Vite)
  - `MINIO_ACCESS_KEY` و `MINIO_SECRET_KEY` (ممنوع في Vite)
  - `WHATSAPP_ACCESS_TOKEN` و `WHATSAPP_WEBHOOK_SECRET` (ممنوع في Vite)
  - `SQL_PASSWORD` (ممنوع في Vite)
  - `AZURE_AI_PROJECTS_ENDPOINT` (ممنوع في Vite)

---

### 3. مسارات البروكسي الخلفية (Backend Proxy Pattern)
* كافة الخدمات الخارجية التي تتطلب مفاتيح سرية (Daftra, MagicPlan, Azure AI, MinIO, WhatsApp, Gemini) يتم التعامل معها حصرياً عبر مسارات السيرفر `/api/*` في `server.ts`.
* كود الواجهة الأمامية يستدعي مسارات `/api/*` ولا يتعامل أبداً مع المفاتيح السرية.
