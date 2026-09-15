# دليل النشر التجريبي / الأولي على السيرفر (Production Staging)
## مشروع AzProjects - مؤسسة العزب للمقاولات العامة
### النطاق المستهدف: `projects.alazab.com`

هذا الدليل مخصص لتشغيل **النسخة الأولية للإنتاج** على سيرفرك الخاص لإجراء كافة الاختبارات الميدانية والفنية للمشروع، ومتابعة أي إصلاحات خطوة بخطوة قبل الإعلان النهائي.

---

### المتطلبات المسبقة (Prerequisites)

1. **توجيه الـ DNS**: تأكد من أن سجل الـ `A Record` للنطاق `projects.alazab.com` يشير إلى عنوان IP السيرفر الخاص بك.
2. **المنافذ المفتوحة**: تأكد من فتح المنفذين `80` (HTTP) و `443` (HTTPS) في جدار الحماية (UFW أو Security Groups).
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw reload
   ```

---

### خطوات النشر الأولي السريع (خلال 3 دقائق)

#### الخطوة 1: نسخ المشروع وتجهيز متغيرات البيئة
على السيرفر، توجه إلى مسار المشروع وأنشئ ملف `.env`:
```bash
cp .env.example .env
nano .env   # ضع مفاتيحك (Daftra, MagicPlan, Gemini, Supabase, إلخ)
```

#### الخطوة 2: تشغيل سكريبت بناء ونشر التطبيق (Deploy Script)
يقوم هذا السكريبت ببناء الواجهة والخادم المجمّع (`dist/server.cjs`) وتشغيله عبر **PM2** في الخلفية مع إعادة التشغيل التلقائي:
```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

#### الخطوة 3: تهيئة Nginx وإصدار شهادة SSL عبر Certbot
يقوم هذا السكريبت بما يلي بشكل آلي تماماً:
- فحص وتثبيت خادم Nginx و Certbot.
- إنشاء ملف الإعدادات المتقدم للنطاق `projects.alazab.com` مع دعم WebSockets ورفع ملفات ومخططات حتى 100MB.
- إصدار شهادة SSL مجانية من Let's Encrypt وتفعيل تحويل الزوار تلقائياً إلى HTTPS.
- اختبار التجديد التلقائي للشهادة.

شغّل الأمر التالي بصلاحيات المسؤول:
```bash
chmod +x scripts/setup-nginx-ssl.sh
sudo ./scripts/setup-nginx-ssl.sh
```

---

### التحقق والاختبار الأولي

بمجرد اكتمال الأمرين أعلاه:
1. افتح المتصفح على: **`https://projects.alazab.com`**
2. تأكد من ظهور القفل الأخضر (SSL Valid) بجانب العنوان.
3. فحص مسار فحص الحالة:
   ```bash
   curl -I https://projects.alazab.com/api/health
   ```
4. فحص سجلات التشغيل المباشرة عند تصفحك وتجربتك للبرنامج:
   ```bash
   pm2 logs azprojects
   ```

---

### أوامر مفيدة أثناء مرحلة الاختبار

| الإجراء | الأمر |
| :--- | :--- |
| **مراقبة سجلات الأخطاء الحية** | `pm2 logs azprojects` |
| **إعادة تشغيل التطبيق بعد أي تعديل** | `pm2 reload azprojects` |
| **فحص حالة استهلاك الذاكرة والمعالج** | `pm2 monit` |
| **فحص إعدادات Nginx** | `sudo nginx -t` |
| **إعادة تشغيل Nginx** | `sudo systemctl reload nginx` |
| **سجلات Nginx للأخطاء** | `sudo tail -f /var/log/nginx/projects_alazab_error.log` |
| **فحص تجديد شهادة SSL يدوياً** | `sudo certbot renew --dry-run` |

---
**ملاحظة**: عند رصد أي ملاحظة أو سلوك أثناء تجربة النسخة الأولية، يمكنك تزويدنا بها وسنقوم بحلها فوراً حتى نصل سوياً إلى الجاهزية الكاملة للإنتاج الفعلي.
