#!/usr/bin/env bash
# =============================================================================
# AzProjects - Production Staging / Initial Deployment Script
# المؤسسة: مؤسسة العزب للمقاولات العامة
# النطاق: projects.alazab.com
# =============================================================================

set -e

# ألوان الإخراج
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

APP_NAME="azprojects"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}=====================================================${NC}"
echo -e "${GREEN}   نشر الإنتاج الأولي للمشروع (Staging / Production Testing)${NC}"
echo -e "${GREEN}   المسار: $APP_DIR${NC}"
echo -e "${BLUE}=====================================================${NC}"

cd "$APP_DIR"

# 1. التحقق من وجود ملف .env
echo -e "\n${YELLOW}[1/5] التحقق من ملف متغيرات البيئة .env...${NC}"
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${YELLOW}تنبيه: ملف .env غير موجود. جاري إنشاء نسخة أولية من .env.example...${NC}"
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo -e "${YELLOW}تم إنشاء .env بنجاح. يُرجى مراجعة وتعبئة المفاتيح فيه.${NC}"
else
    echo -e "${GREEN}✓ ملف .env موجود.${NC}"
fi

# 2. التحقق من Node.js و npm
echo -e "\n${YELLOW}[2/5] فحص بيئة Node.js...${NC}"
NODE_VER=$(node -v || echo "not_installed")
if [ "$NODE_VER" == "not_installed" ]; then
    echo -e "${RED}خطأ: Node.js غير مثبت على السيرفر. يرجى تثبيت Node.js v18+ أولاً.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js إصدار: $NODE_VER${NC}"

# 3. تثبيت الحزم وبناء المشروع (Production Build)
echo -e "\n${YELLOW}[3/5] تثبيت الاعتماديات وبناء تطبيق الإنتاج (npm run build)...${NC}"
npm install --production=false
npm run build

if [ ! -f "$APP_DIR/dist/server.cjs" ]; then
    echo -e "${RED}خطأ: فشل إنشاء ملف dist/server.cjs أثناء عملية البناء.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ اكتمل بناء الواجهة والسيرفر (dist/server.cjs) بنجاح.${NC}"

# 4. إدارة السيرفر عبر PM2
echo -e "\n${YELLOW}[4/5] تشغيل التطبيق في الخلفية عبر PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "جاري تثبيت PM2 عالمياً..."
    npm install -g pm2
fi

# إعادة تشغيل التطبيق إذا كان يعمل أو بدء تشغيله من جديد
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    echo -e "إعادة تحميل التطبيق في PM2..."
    pm2 reload "$APP_NAME" --update-env
else
    echo -e "بدء تشغيل التطبيق لأول مرة في PM2..."
    pm2 start "$APP_DIR/dist/server.cjs" \
        --name "$APP_NAME" \
        --max-memory-restart 1G \
        --time \
        --env NODE_ENV=production
fi

# حفظ قائمة العمليات لتعمل تلقائياً عند إعادة تشغيل السيرفر
pm2 save

# 5. اختبار الاتصال الداخلي (Health Check)
echo -e "\n${YELLOW}[5/5] فحص استجابة الخادم الداخلي (Port 3000)...${NC}"
sleep 2

HEALTH_CHECK=$(curl -s http://127.0.0.1:3000/api/health || echo "failed")
if [[ "$HEALTH_CHECK" =~ "ok" ]]; then
    echo -e "${GREEN}✓ الخادم الداخلي يعمل بكفاءة واستجاب بنجاح لـ /api/health.${NC}"
else
    echo -e "${YELLOW}تنبيه: تعذر التحقق السريع من /api/health. يمكنك مراجعة السجلات عبر: pm2 logs $APP_NAME${NC}"
fi

echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN}   ✓ تم نشر التطبيق بنجاح وهو قيد التشغيل الآن!${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo -e "• لمراقبة السجلات الحية: pm2 logs $APP_NAME"
echo -e "• لمراقبة أداء السيرفر: pm2 monit"
echo -e "• إذا لم تكن قد هيأت Nginx والـ SSL بعد، شغّل الأمر:"
echo -e "  sudo bash scripts/setup-nginx-ssl.sh"
