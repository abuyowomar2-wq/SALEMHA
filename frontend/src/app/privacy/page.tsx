import Link from "next/link";

export const metadata = {
  title: "سياسة الخصوصية - سلّمها",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">س</div>
            <span className="text-xl font-bold text-brand-navy">سلّمها</span>
          </div>
          <Link href="/" className="text-sm text-brand-blue hover:underline">العودة للرئيسية</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">سياسة الخصوصية</h1>
        <p className="text-brand-gray mb-10">آخر تحديث: يونيو 2026</p>

        <div className="space-y-8 text-brand-navy leading-relaxed">

          <section>
            <h2 className="text-xl font-bold mb-3">1. مقدمة</h2>
            <p className="text-brand-gray">
              تلتزم منصة سلّمها بحماية خصوصية مستخدميها. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات الشخصية التي تقدمها عند استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. المعلومات التي نجمعها</h2>
            <h3 className="font-bold mt-4 mb-2">2.1 معلومات التاجر</h3>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li>الاسم الكامل</li>
              <li>البريد الإلكتروني</li>
              <li>رقم الجوال (اختياري)</li>
              <li>اسم المتجر</li>
            </ul>
            <h3 className="font-bold mt-4 mb-2">2.2 معلومات العميل (المخزنة من قبل التاجر)</h3>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li>الاسم</li>
              <li>رقم الجوال</li>
              <li>البريد الإلكتروني (اختياري)</li>
              <li>رقم الطلب</li>
            </ul>
            <h3 className="font-bold mt-4 mb-2">2.3 معلومات تقنية</h3>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li>عنوان IP</li>
              <li>نوع المتصفح</li>
              <li>سجلات محاولات التحقق (للأمان)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. كيفية استخدام المعلومات</h2>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li>تقديم خدمات المنصة وإدارة الحسابات</li>
              <li>تسليم المنتجات الرقمية للعملاء</li>
              <li>تحسين وتطوير خدمات المنصة</li>
              <li>منع الاحتيال وضمان أمان المنصة</li>
              <li>التواصل مع التجار بخصوص حساباتهم واشتراكاتهم</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. حماية البيانات</h2>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li>جميع الأكواد والبيانات الرقمية مشفرة بتقنية AES-256.</li>
              <li>روابط التسليم محمية بتقنية SHA-256 hashing.</li>
              <li>أرقام الجوال تُخزن بشكل مقنع (masked) في سجلات المحاولات.</li>
              <li>نستخدم بروتوكول HTTPS لتأمين جميع الاتصالات.</li>
              <li>نطبق مبدأ الحد الأدنى من الصلاحيات للوصول إلى البيانات.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. مشاركة البيانات</h2>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li>لا نبيع أو نؤجر بيانات المستخدمين لأي طرف ثالث.</li>
              <li>لا نشارك بيانات التجار أو العملاء إلا بموجب أمر قضائي.</li>
              <li>قد نشارك بيانات مجمعة (غير شخصية) لأغراض إحصائية.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. ملفات تعريف الارتباط (Cookies)</h2>
            <p className="text-brand-gray">
              تستخدم المنصة الجلسات المؤقتة (sessionStorage) لحفظ حالة تسجيل الدخول. لا نستخدم ملفات تعريف ارتباط للتتبع أو الإعلانات. معلومات الجلسة تُحذف تلقائيًا عند إغلاق المتصفح.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. حقوق المستخدم</h2>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li>للتاجر الحق في تعديل أو حذف بياناته الشخصية.</li>
              <li>للتاجر الحق في طلب نسخة من بياناته المخزنة.</li>
              <li>للتاجر الحق في حذف حسابه وجميع البيانات المرتبطة به.</li>
              <li>العميل يمكنه طلب حذف بياناته من خلال التاجر.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. الاحتفاظ بالبيانات</h2>
            <p className="text-brand-gray">
              نحتفظ ببيانات التاجر طوال مدة استخدامه للمنصة. عند حذف الحساب، يتم حذف جميع البيانات المرتبطة به خلال 30 يومًا، باستثناء البيانات المطلوبة للامتثال القانوني.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. مسؤولية التاجر عن بيانات العملاء</h2>
            <p className="text-brand-gray">
              التاجر هو المسؤول عن جمع وتخزين بيانات عملائه (الاسم، رقم الجوال) في المنصة. يتعهد التاجر بالحصول على موافقة عملائه على تخزين بياناتهم واستخدامها لغرض تسليم المنتجات الرقمية فقط.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. تعديل السياسة</h2>
            <p className="text-brand-gray">
              نحتفظ بالحق في تعديل سياسة الخصوصية هذه في أي وقت. سيتم إشعار التجار بأي تغييرات جوهرية عبر البريد الإلكتروني.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. التواصل</h2>
            <p className="text-brand-gray">
              لأي استفسارات حول سياسة الخصوصية، يرجى التواصل عبر البريد الإلكتروني.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-brand-gray">© ٢٠٢٦ سلّمها. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
