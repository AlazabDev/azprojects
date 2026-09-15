#!/usr/bin/env bash
# =============================================================================
# AzProjects - Nginx & Certbot SSL Automated Setup Script
# النطاق المستهدف: projects.alazab.com
# البريد الإلكتروني للشهادة: alazab.construction@gmail.com
# =============================================================================

set -e

# ألوان الإخراج
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOMAIN="projects.alazab.com"
EMAIL="alazab.construction@gmail.com"
NGINX_AVAILABLE="/etc/nginx/sites-available/$DOMAIN"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"

echo -e "${BLUE}=====================================================${NC}"
echo -e "${GREEN}   تهيئة Nginx وإصدار شهادة SSL للنطاق: $DOMAIN${NC}"
echo -e "${BLUE}=====================================================${NC}"

# 1. التحقق من صلاحيات Root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}خطأ: يرجى تشغيل السكريبت بصلاحيات المسؤول (sudo bash scripts/setup-nginx-ssl.sh)${NC}"
  exit 1
fi

# 2. التحقق من تثبيت Nginx و Certbot وتثبيتهما إن لم يكونا موجودين
echo -e "\n${YELLOW}[1/5] التحقق من حزم Nginx و Certbot...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "جاري تثبيت Nginx..."
    apt-get update -y && apt-get install -y nginx
fi

if ! command -v certbot &> /dev/null; then
    echo -e "جاري تثبيت Certbot ومكوّن Nginx..."
    apt-get update -y && apt-get install -y certbot python3-certbot-nginx
fi

echo -e "${GREEN}✓ Nginx و Certbot جاهزان.${NC}"

# 3. تجهيز مسار التحقق وتكوين Nginx المبدئي للتحقق من Let's Encrypt
echo -e "\n${YELLOW}[2/5] إنشاء ملف تكوين Nginx للنطاق $DOMAIN...${NC}"
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R www-data:www-data /var/www/html

# التحقق مما إذا كانت شهادة الـ SSL موجودة مسبقاً
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${GREEN}تم العثور على شهادة SSL سابقة، جاري تطبيق التكوين الكامل (HTTPS)...${NC}"
    cp "$(dirname "$0")/nginx-projects.alazab.com.conf" "$NGINX_AVAILABLE"
else
    echo -e "جاري كتابة تكوين HTTP المبدئي للسماح لـ Certbot بإصدار الشهادة..."
    cat > "$NGINX_AVAILABLE" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name projects.alazab.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
fi

# تفعيل الموقع في Nginx
ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"

# إيقاف الموقع الافتراضي إن وجد لتجنب أي تعارض
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm -f /etc/nginx/sites-enabled/default
fi

# اختبار تكوين Nginx
echo -e "\n${YELLOW}[3/5] فحص سلامة تكوين Nginx...${NC}"
nginx -t

# إعادة تشغيل Nginx
systemctl reload nginx || systemctl restart nginx
echo -e "${GREEN}✓ تم تشغيل Nginx وتوجيهه إلى منفذ التطبيق 3000.${NC}"

# 4. طلب وإصدار شهادة SSL المجانية من Let's Encrypt عبر Certbot
echo -e "\n${YELLOW}[4/5] طلب شهادة SSL للنطاق $DOMAIN عبر Certbot...${NC}"
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "جاري التواصل مع Let's Encrypt للتحقق من النطاق $DOMAIN..."
    certbot --nginx \
        -d "$DOMAIN" \
        --non-interactive \
        --agree-tos \
        -m "$EMAIL" \
        --redirect

    # بعد نجاح Certbot، نطبق إعدادات الأمان المتقدمة والبروكسي المكتملة
    cp "$(dirname "$0")/nginx-projects.alazab.com.conf" "$NGINX_AVAILABLE"
    nginx -t
    systemctl reload nginx
else
    echo -e "${GREEN}الشهادة مفعلة ومثبتة مسبقاً.${NC}"
fi

# 5. التحقق من التجديد التلقائي للشهادة (Certbot Auto-renew)
echo -e "\n${YELLOW}[5/5] اختبار التجديد التلقائي لشهادة SSL...${NC}"
certbot renew --dry-run

echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN}  ✓ تمت تهيئة Nginx وشهادة SSL بنجاح للنطاق:${NC}"
echo -e "${GREEN}  🔗 https://$DOMAIN${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo -e "خادم Nginx الآن يقوم بتحويل كل الزوار تلقائياً إلى HTTPS"
echo -e "وتمرير الطلبات إلى تطبيق Node.js على المنفذ الداخلي 3000 مع دعم WebSockets وحجم ملفات حتى 100MB."
