#!/usr/bin/env bash
# =============================================================================
# AzProjects - Automated Production Deployment Script for Ubuntu
# Server: projects.alazab.com
# =============================================================================

set -e

echo "🚀 [1/6] بدء عملية النشر للإنتاج (Deploying AzProjects to projects.alazab.com)..."

# Ensure we are in the application root
APP_DIR="/var/www/azprojects"
cd "$APP_DIR" || exit 1

# Check .env existence
if [ ! -f .env ]; then
    echo "❌ خطأ: ملف .env غير موجود في $APP_DIR. يرجى إنشاؤه بناءً على .env.example قبل النشر."
    exit 1
fi

echo "📦 [2/6] تثبيت وتحديث الحزم البرمجية (Installing dependencies)..."
npm ci --prefer-offline --no-audit

echo "🔨 [3/6] بناء وتجميع التطبيق للإنتاج (Building Vite client & Express server)..."
NODE_ENV=production npm run build

# Verify build output
if [ ! -f "dist/index.html" ] || [ ! -f "dist/server.cjs" ]; then
    echo "❌ فشل البناء: لم يتم العثور على dist/index.html أو dist/server.cjs"
    exit 1
fi

echo "🔒 [4/6] ضبط الصلاحيات الأمنية للملفات (Hardening file permissions)..."
# Restrict .env to root/service owner only
chmod 600 .env
chown -R www-data:www-data "$APP_DIR"

echo "🔄 [5/6] إعادة تشغيل خدمة التطبيق (Restarting AzProjects service)..."
if command -v systemctl &> /dev/null && systemctl list-unit-files | grep -q "azprojects.service"; then
    sudo systemctl restart azprojects
    sudo systemctl status azprojects --no-pager -l
elif command -v pm2 &> /dev/null; then
    pm2 reload deploy/pm2/ecosystem.config.cjs --update-env || pm2 start deploy/pm2/ecosystem.config.cjs
fi

echo "🌐 [6/6] فحص حالة الخادم (Health Check)..."
sleep 2
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/health || echo "failed")

if [ "$HEALTH_STATUS" -eq 200 ] || [ "$HEALTH_STATUS" -eq 503 ]; then
    echo "✅ تم النشر والتشغيل بنجاح! كود استجابة الخادم: $HEALTH_STATUS"
    echo "🌟 يمكنك زيارة المنظومة عبر الرابط: https://projects.alazab.com"
else
    echo "⚠️ تحذير: استجابة غير متوقعة من فحص الصحة: $HEALTH_STATUS. يرجى مراجعة سجلات الخادم: journalctl -u azprojects -n 50"
fi
