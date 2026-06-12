# سلّمها - Sallemha

منصة SaaS احترافية لتسليم المنتجات الرقمية تلقائيًا لعملاء متاجر سلة.

---

## فكرة المنصة

سلّمها تحل مشكلة تسليم المنتجات الرقمية (أكواد، بطاقات، مفاتيح تفعيل، ملفات، روابط، رخص) للعملاء. بدل ما التاجر يسلّم المنتج يدويًا عبر واتساب، المنصة تسلّم المنتج تلقائيًا عبر رابط آمن مع توثيق كامل.

---

## التقنيات

| المكون | التقنية |
|--------|---------|
| Backend API | Laravel 11 (PHP 8.2) |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Database | PostgreSQL 16 (إنتاج) / SQLite (تطوير) |
| المصادقة | Laravel Sanctum (Bearer Token) |
| التشفير | AES-256-CBC |
| الاستضافة | Render (Web Services + Managed PostgreSQL) |
| اللغة | العربية - RTL - خط Tajawal |

---

## الهيكل

```
sallemha/
├── backend/                          # Laravel 11 API
│   ├── app/
│   │   ├── Enums/                    # 8 تصنيفات
│   │   ├── Http/
│   │   │   ├── Controllers/Api/      # 12 وحدة تحكم
│   │   │   ├── Middleware/           # 4 وسيطين
│   │   │   ├── Requests/            # 12 نموذج تحقق
│   │   │   └── Resources/           # 8 موارد API
│   │   ├── Models/                  # 9 موديلات
│   │   └── Services/               # 3 خدمات
│   ├── database/migrations/         # 15 جدول
│   ├── routes/api.php              # 53 مسار
│   └── Dockerfile
│
├── frontend/                         # Next.js 14
│   ├── src/app/
│   │   ├── (auth)/                  # صفحات المصادقة
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/                   # لوحة سوبر أدمن
│   │   │   ├── login/
│   │   │   ├── merchants/
│   │   │   ├── subscriptions/
│   │   │   └── orders/
│   │   ├── dashboard/               # لوحة تحكم التاجر
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── subscription/
│   │   │   └── settings/
│   │   ├── d/[slug]/[token]/        # صفحة تسليم العميل
│   │   └── page.tsx                 # الصفحة التسويقية
│   ├── lib/api.ts                   # API client
│   ├── public/                      # الشعار + الملفات
│   └── tailwind.config.ts
│
├── docker/                          # Docker configs
├── docker-compose.yml
├── render.yaml                      # Render Blueprint
├── docs/                            # التوثيق
└── README.md
```

---

## الأدوار

| الدور | الصلاحيات |
|-------|-----------|
| **سوبر أدمن** | إدارة المتاجر، مراجعة الاشتراكات، إنشاء متاجر، عرض جميع الطلبات |
| **تاجر** | إدارة منتجاته ومخزونه وطلباته وعملائه، الترقية لباقة أعلى |
| **عميل** | لا يحتاج حساب. يفتح رابط التسليم ويتحقق ويستلم المنتج |

---

## قاعدة البيانات

### الجداول (15 جدول)

| # | الجدول | الوصف |
|---|--------|-------|
| 1 | `users` | المستخدمين (أدمن + تجار) |
| 2 | `merchants` | بيانات المتجر (اسم، شعار، لون، خطة) |
| 3 | `products` | المنتجات الرقمية |
| 4 | `inventory_items` | عناصر المخزون (مشفرة) |
| 5 | `orders` | الطلبات |
| 6 | `delivery_links` | روابط التسليم (token hashed) |
| 7 | `delivery_attempts` | محاولات التحقق (IP + masked phone) |
| 8 | `delivery_logs` | سجل التوصيل |
| 9 | `customers` | العملاء |
| 10 | `subscriptions` | الاشتراكات والترقيات |
| 11 | `personal_access_tokens` | Sanctum tokens |
| 12 | `sessions` | جلسات Laravel |
| 13 | `cache` | تخزين مؤقت |
| 14 | `jobs` | المهام الخلفية |
| 15 | `migrations` | سجل الترحيلات |

---

## مسارات API (53 مسار)

### المصادقة
```
POST   /api/auth/register    # تسجيل تاجر جديد
POST   /api/auth/login       # دخول
POST   /api/auth/logout      # خروج
GET    /api/auth/me          # بيانات المستخدم الحالي
```

### التاجر - المنتجات
```
GET    /api/merchant/products              # قائمة المنتجات
POST   /api/merchant/products              # إنشاء منتج [plan.limit]
GET    /api/merchant/products/{id}         # تفاصيل منتج
PUT    /api/merchant/products/{id}         # تحديث
DELETE /api/merchant/products/{id}         # تعطيل
```

### التاجر - المخزون
```
GET    /api/merchant/products/{id}/inventory         # قائمة المخزون
POST   /api/merchant/products/{id}/inventory         # إضافة عنصر [plan.limit]
POST   /api/merchant/products/{id}/inventory/bulk     # إضافة جماعي [plan.limit]
PUT    /api/merchant/inventory/{id}                  # تحديث
DELETE /api/merchant/inventory/{id}                  # تعطيل
```

### التاجر - الطلبات
```
GET    /api/merchant/orders                    # قائمة الطلبات
POST   /api/merchant/orders                    # إنشاء طلب [plan.limit]
GET    /api/merchant/orders/{id}               # تفاصيل
PUT    /api/merchant/orders/{id}               # تحديث
POST   /api/merchant/orders/{id}/regenerate-link  # إعادة الرابط
GET    /api/merchant/orders/{id}/logs          # سجل التوصيل
```

### التاجر - العملاء + الاشتراك + الإعدادات
```
GET    /api/merchant/customers             # قائمة العملاء
POST   /api/merchant/customers             # إضافة عميل
GET    /api/merchant/customers/{id}        # تفاصيل
PUT    /api/merchant/customers/{id}        # تحديث
DELETE /api/merchant/customers/{id}        # حذف
GET    /api/merchant/customers/template    # قالب استيراد (معطل حاليًا)
POST   /api/merchant/customers/import      # استيراد (معطل حاليًا)

GET    /api/merchant/subscription          # الخطة الحالية
POST   /api/merchant/subscription/upgrade  # طلب ترقية
GET    /api/merchant/subscription/history   # تاريخ الاشتراكات

GET    /api/merchant/settings              # الإعدادات
PUT    /api/merchant/settings              # تحديث + رفع شعار

GET    /api/merchant/dashboard/stats       # إحصائيات + حدود الباقة
GET    /api/merchant/dashboard/recent-activity  # آخر الطلبات
```

### التسليم (عام - بدون تسجيل)
```
GET    /api/delivery/{slug}/{token}        # معلومات الرابط
POST   /api/delivery/{slug}/{token}/verify # تحقق
POST   /api/delivery/{slug}/{token}/claim  # عرض المنتج
```

### سوبر أدمن
```
GET    /api/admin/merchants                # قائمة المتاجر
POST   /api/admin/merchants                # إنشاء متجر جديد
GET    /api/admin/merchants/{id}           # تفاصيل متجر
PUT    /api/admin/merchants/{id}/status    # تفعيل/تعطيل
GET    /api/admin/stats                    # إحصائيات المنصة
GET    /api/admin/subscriptions            # طلبات الاشتراك
POST   /api/admin/subscriptions/{id}/approve  # تفعيل اشتراك
POST   /api/admin/subscriptions/{id}/reject   # رفض اشتراك
```

---

## الأمان

| الطبقة | الآلية |
|--------|--------|
| رابط التسليم | SHA-256 hashed token - لا يُخزن raw |
| تحقق ثنائي | رقم الطلب + رقم الجوال |
| Rate Limiting | 5 محاولات/دقيقة per token+IP |
| Lockout | 3 محاولات خاطئة = قفل 5 دقائق |
| Pessimistic Lock | `SELECT FOR UPDATE` يمنع تكرار الكود |
| تشفير AES-256 | الأكواد مشفرة في قاعدة البيانات |
| Session Token | مؤقت 10 دقائق + مربوط بـ IP |
| منع إعادة العرض | بعد product_viewed لا يمكن فتح المنتج |
| عزل التجار | كل تاجر يرى بياناته فقط |
| إخفاء البيانات | أرقام الجوال masked في السجلات |
| Token hashing | روابط التسليم مشفرة hash لا تُخزن raw |
| صلاحيات admin | Middleware منفصل مع role check |
| حدود الباقات | Middleware يمنع تجاوز الحدود |

---

## الباقات والأسعار

| الباقة | شهري | سنوي (أول سنة) | المنتجات | المخزون | طلبات/شهر |
|--------|------|-----------------|----------|---------|-----------|
| بداية | مجاني | مجاني | 10 | 100 | 10 |
| نمو | 75.99 ﷼ | 53 ﷼/شهر | 50 | 5,000 | 500 |
| احترافية | 99 ﷼ | 69 ﷼/شهر | ∞ | ∞ | ∞ |

**التحويل البنكي:**
```
البنك: مصرف الراجحي
المستفيد: سلطان محمد مشبب الأحمري
الآيبان: SA7580000659608016092953
رقم الحساب: 659000010006086092953
```

---

## تدفق التسليم (End-to-End)

```
1. تاجر يسجل ← ينشئ منتج ← يرفع مخزون
2. تاجر ينشئ طلب ← يتولّد رابط تسليم آمن (64 حرف عشوائي)
3. التاجر يرسل الرابط للعميل
4. العميل يفتح الرابط ← يشوف شعار المتجر
5. العميل يدخل رقم الطلب + رقم الجوال
6. ❌ خطأ ← 3 محاولات كحد أقصى خلال 5 دقائق
7. ✅ نجاح ← جلسة مؤقتة 10 دقائق
8. يضغط "عرض المنتج" ← Pessimistic Lock يخصص كود
9. يُفك تشفير الكود ويعرض للعميل
10. يسجل في سجل التوصيل: product_viewed
```

---

## التشغيل المحلي

### المتطلبات
- PHP 8.2+
- Composer
- Node.js 20+
- SQLite (تطوير) أو PostgreSQL (إنتاج)

```bash
# 1. Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000

# 2. Frontend
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev

# 3. افتح
# لوحة التاجر: http://localhost:3000/dashboard
# لوحة الأدمن: http://localhost:3000/admin/login
# الصفحة التسويقية: http://localhost:3000
```

### بيانات افتراضية

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| سوبر أدمن | abuyowomar2@gmail.com | Salemha@Admin2030 |
| تاجر | (سجل حساب جديد) | - |

---

## النشر على Render

### الخدمات المطلوبة

| الخدمة | النوع | Root Directory | Environment |
|--------|-------|---------------|-------------|
| `sallemha-db` | PostgreSQL | - | - |
| `salemha` (API) | Web Service | `backend` | Docker |
| `salemha-1` (Frontend) | Web Service | `frontend` | Node |

### متغيرات البيئة للـ API

```
APP_NAME=سلمها
APP_ENV=production
APP_DEBUG=false
APP_TIMEZONE=Asia/Riyadh
APP_LOCALE=ar
DB_CONNECTION=pgsql
DB_HOST=(من Render PostgreSQL)
DB_PORT=5432
DB_DATABASE=sallemha
DB_USERNAME=sallemha
DB_PASSWORD=(من Render PostgreSQL)
APP_KEY=(اضغط Generate)
FRONTEND_URL=https://salemha-1.onrender.com
```

### متغيرات البيئة للـ Frontend

```
NEXT_PUBLIC_API_URL=https://salemha.onrender.com
```

---

## الهوية البصرية

| العنصر | اللون | HEX |
|--------|-------|-----|
| الأساسي (أزرار) | أزرق رقمي | `#1659D3` |
| العناوين | كحلي عميق | `#021E4B` |
| CTA + تمييز | تركواز حيوي | `#08CFB9` |
| النصوص الثانوية | رمادي بارد | `#7B88A2` |
| التدرج | أزرق → تركواز | `#1659D3 → #0F7BBC → #08CFB9` |

---

## صفحات المنصة (18 صفحة)

| المسار | الصفحة | النوع |
|--------|--------|-------|
| `/` | الصفحة التسويقية | عامة |
| `/login` | تسجيل دخول التاجر | عامة |
| `/register` | تسجيل تاجر جديد | عامة |
| `/d/[slug]/[token]` | صفحة تسليم العميل | عامة |
| `/dashboard` | لوحة تحكم التاجر | تاجر |
| `/dashboard/products` | المنتجات + المخزون | تاجر |
| `/dashboard/orders` | الطلبات | تاجر |
| `/dashboard/customers` | العملاء | تاجر |
| `/dashboard/subscription` | الاشتراكات | تاجر |
| `/dashboard/settings` | الإعدادات + الشعار | تاجر |
| `/admin/login` | دخول سوبر أدمن | أدمن |
| `/admin` | لوحة سوبر أدمن | أدمن |
| `/admin/merchants` | إدارة المتاجر | أدمن |
| `/admin/subscriptions` | مراجعة الاشتراكات | أدمن |
| `/admin/orders` | جميع الطلبات | أدمن |

---

## الإصدار

**النسخة:** 1.0.0 (MVP)

**تاريخ الإصدار:** يونيو 2026

**المطور:** منصة سلّمها - Sallemha
