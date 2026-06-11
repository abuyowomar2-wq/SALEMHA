# سلّمها - Sallemha

منصة SaaS احترافية لتسليم المنتجات الرقمية تلقائيًا لعملاء متاجر سلة.

## التقنيات

- **Backend:** Laravel 11 (PHP 8.2+)
- **Frontend:** Next.js 14 (TypeScript, Tailwind CSS, RTL)
- **Database:** SQLite (dev) / PostgreSQL 16 (production)
- **Cache/Queue:** Redis 7 (production)

## التشغيل المحلي

### المتطلبات

- PHP 8.2+
- Composer
- Node.js 20+

### الإعداد

```bash
# Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed

# Frontend
cd frontend
npm install
npm run dev
```

### التشغيل

```bash
# Terminal 1: Backend
cd backend && php artisan serve --port=8000

# Terminal 2: Frontend
cd frontend && npm run dev
```

### بيانات الدخول الافتراضية

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| Admin | admin@sallemha.com | password |
| تاجر | (سجل حساب جديد) | - |

## الهيكل

```
sallemha/
├── backend/          # Laravel 11 API
├── frontend/         # Next.js 14 Dashboard + Delivery
├── docker/           # Docker configs
├── docs/             # Architecture docs
├── docker-compose.yml
└── README.md
```

## الميزات الأمنية

- **Token Hashing:** روابط التسليم تستخدم SHA-256 hashing، لا تخزن raw tokens
- **تشفير البيانات:** الأكواد الرقمية مشفرة بـ AES-256 في قاعدة البيانات
- **Pessimistic Locking:** منع تخصيص نفس الكود لأكثر من طلب
- **Rate Limiting:** 5 محاولات/دقيقة لكل رابط تحقق
- **Lockout:** 3 محاولات خاطئة = قفل 5 دقائق
- **إخفاء البيانات:** أرقام الجوال masked في delivery_attempts
- **عزل التجار:** كل تاجر يرى منتجاته وطلباته فقط
- **Admin middleware:** صلاحيات منفصلة مع role check
