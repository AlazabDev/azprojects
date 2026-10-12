# دليل النشر والتدقيق الأمني لإنتاج AzProjects
**النطاق المعتمد:** `https://projects.alazab.com`  
**بيئة التشغيل:** Ubuntu 22.04 / 24.04 LTS + Nginx Reverse Proxy + Node.js (Express + Vite)

---

## 🛡️ أولاً: نتائج الفحص والتدقيق الأمني الشامل (Security Audit Report)

تم إجراء تدقيق برمجي وأمني صارم للمشروع للتأكد من خلوّه من الثغرات البرمجية قبل النشر:

1. **فحص تسريب الأسرار (Zero Secrets in `VITE_`):**
   - تم التحقق من حزمة المتصفح العميل (`src/config/env.ts` و `.env.example`).
   - لا توجد أي مفاتيح سرية (`DAFTRA_API_KEY`, `MAGICPLAN_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) في الفرونت إند أو ببادئة `VITE_`.
   - كافة المفاتيح الحساسة محصورة 100% في السيرفر الخلفي (`server.ts`).

2. **ترويسات الأمان الصارمة (HTTP Security Headers):**
   - تم تفعيل `X-Content-Type-Options: nosniff` لمنع هجمات انتحال أنواع الملفات.
   - تفعيل `X-Frame-Options: SAMEORIGIN` و Content-Security-Policy لمنع هجمات الـ Clickjacking.
   - حجب بصمة الخادم `x-powered-by: Express` تماماً لمنع الاستكشاف التقني.
   - تطبيق `Strict-Transport-Security (HSTS)` لمدة عامين مع `includeSubDomains; preload`.

3. **حماية مسارات الـ API وتحديد معدل الطلبات (Rate Limiting & Anti-DDoS):**
   - إضافة طبقة حماية ومحدد طلبات على مستوى السيرفر الداخلي ومستوى Nginx (`zone=az_auth_limit` و `zone=az_api_limit`).
   - حماية مسارات الذكاء الاصطناعي والمزامنة مع دفترة وماجيك بلان ضد الإغراق والتعطيل.

4. **حوكمة وأمان قاعدة البيانات (Row-Level Security):**
   - استعلامات قاعدة البيانات محصورة عبر دوال Drizzle ORM المؤمّنة ضد الـ SQL Injection.
   - التحقق من صلاحيات الأدوار (RBAC) ومصادقة التوكن (Bearer JWT) قبل الوصول لبيانات المشاريع والتحديثات الميدانية.

5. **الإغلاق الآمن ومعالجة الإشارات (Graceful Shutdown):**
   - دعم كامل لإشارات `SIGTERM` و `SIGINT` لضمان عدم انقطاع أي اتصال نشط أثناء التحديث أو إعادة تشغيل السيرفر.

---

## 🚀 ثانياً: خطوات التثبيت والإعداد على سيرفر Ubuntu

### 1. المتطلبات الأولية على السيرفر
قم بتحديث النظام وتثبيت الحزم الأساسية:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx build-essential
```

تثبيت **Node.js v20 أو v22 LTS**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v # يجب أن يكون v20.x أو أحدث
npm -v
```

---

### 2. تجهيز مجلد المشروع وسحب الكود
قم بإنشاء مجلد النشر في المسار القياسي:
```bash
sudo mkdir -p /var/www/azprojects
sudo chown -R $USER:$USER /var/www/azprojects

# انسخ ملفات المشروع إلى /var/www/azprojects
cd /var/www/azprojects
```

---

### 3. إعداد ملف البيئة السري `.env`
قم بإنشاء ملف `.env` بناءً على ملف `.env.example`:
```bash
cp .env.example .env
nano .env
```
> **تنبيه أمني هام:**  
> - قم بملء المفاتيح السرية الحقيقية (`GEMINI_API_KEY`, `DAFTRA_API_KEY`, `MAGICPLAN_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SQL_PASSWORD`).  
> - تأكد من صلاحية الملف:  
>   `chmod 600 .env` (لضمان عدم قراءته إلا من قِبل مدير النظام).

---

### 4. بناء وتجميع المشروع (Production Build)
```bash
npm ci
NODE_ENV=production npm run build
```
سيقوم هذا الأمر بتوليد:
- مجلد `dist/` يحتوي على ملفات الواجهة الأمامية المجمعة والمضغوطة.
- ملف `dist/server.cjs` الذي يضم خادم Express مجمعاً ومجهّزاً للعمل مباشرة.

---

### 5. إعداد وتفعيل خدمة Systemd (التشغيل التلقائي)
انسخ ملف الخدمة الجاهز إلى مجلد خدمات النظام:
```bash
sudo cp deploy/systemd/azprojects.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable azprojects
sudo systemctl start azprojects
sudo systemctl status azprojects
```

*(اختياري) إذا كنت تفضل استخدام **PM2** بدلاً من Systemd:*
```bash
sudo npm install -g pm2
pm2 start deploy/pm2/ecosystem.config.cjs
pm2 save
pm2 startup
```

---

### 6. استخراج شهادة الأمان SSL (Let's Encrypt) للنطاق
قبل تفعيل Nginx، تأكد أن سجل الـ DNS من نوع **A Record** للنطاق `projects.alazab.com` يشير إلى عنوان الـ IP الخاص بسيرفر الأوبينتو.

قم بإصدار شهادة SSL:
```bash
sudo certbot certonly --nginx -d projects.alazab.com
```

---

### 7. ضبط وتفعيل Nginx
انسخ ملف التكوين المحمي والمعدّ مسبقاً:
```bash
sudo cp deploy/nginx/projects.alazab.com.conf /etc/nginx/sites-available/projects.alazab.com.conf
sudo ln -s /etc/nginx/sites-available/projects.alazab.com.conf /etc/nginx/sites-enabled/

# اختبار صحة تكوين Nginx
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

---

### 8. تأمين جدار الحماية (UFW Firewall)
احظر الوصول الخارجي المباشر إلى المنفذ الداخلي `3000` واقصر الاتصال الخارجي على المنافذ الآمنة فقط:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh     # منفذ 22
sudo ufw allow http    # منفذ 80
sudo ufw allow https   # منفذ 443
sudo ufw enable
sudo ufw status
```

---

## 🔍 ثالثاً: فحص التحقق من الجاهزية والتشغيل (Post-Deployment Verification)

1. **فحص نقطة الصحة (Health Check):**
   ```bash
   curl -I https://projects.alazab.com/api/health
   # النتيجة المتوقعة: HTTP/2 200 OK
   ```

2. **فحص ترويسات الأمان:**
   ```bash
   curl -I https://projects.alazab.com/
   # تأكد من ظهور:
   # Strict-Transport-Security
   # X-Frame-Options: SAMEORIGIN
   # X-Content-Type-Options: nosniff
   ```

3. **مراقبة السجلات الحية للخادم:**
   ```bash
   # سجلات خدمة التطبيق
   journalctl -u azprojects -f
   
   # سجلات وصول وأخطاء Nginx
   tail -f /var/log/nginx/azprojects_access.log
   tail -f /var/log/nginx/azprojects_error.log
   ```

---

## ⚡ رابعاً: التحديثات الدورية (One-Click Update)

لتحديث الكود مستقبلاً وإعادة النشر بنقرة واحدة، استخدم السكربت المؤتمت المرفق:
```bash
chmod +x /var/www/azprojects/deploy/deploy.sh
sudo /var/www/azprojects/deploy/deploy.sh
```
يقوم هذا السكربت تلقائياً بسحب التحديثات، إعادة التجميع، فحص الصلاحيات، وإعادة تحميل الخدمة دون توقف.
