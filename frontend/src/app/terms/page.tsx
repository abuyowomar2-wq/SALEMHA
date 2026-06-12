import Link from "next/link";

export const metadata = {
  title: "الشروط والأحكام - سلّمها",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-brand-navy mb-2">الشروط والأحكام</h1>
        <p className="text-brand-gray mb-10">آخر تحديث: يونيو 2026</p>

        <div className="space-y-8 text-brand-navy leading-relaxed">

          <section>
            <h2 className="text-xl font-bold mb-3">1. مقدمة</h2>
            <p className="text-brand-gray">
              مرحبًا بك في منصة سلّمها. باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. التعريفات</h2>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li><strong>المنصة:</strong> موقع وتطبيق سلّمها وجميع الخدمات المرتبطة به.</li>
              <li><strong>التاجر:</strong> الشخص أو الجهة المسجلة في المنصة لاستخدام خدمات التسليم.</li>
              <li><strong>العميل:</strong> المستفيد النهائي الذي يستلم المنتج الرقمي.</li>
              <li><strong>المنتج الرقمي:</strong> أي منتج غير مادي يتم تسليمه عبر المنصة (أكواد، مفاتيح، ملفات، روابط).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. التسجيل والحساب</h2>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li>يجب على التاجر تقديم معلومات صحيحة ودقيقة عند التسجيل.</li>
              <li>التاجر مسؤول عن الحفاظ على سرية بيانات حسابه وكلمة المرور.</li>
              <li>يمنع مشاركة الحساب مع أي شخص آخر أو جهة أخرى.</li>
              <li>تحتفظ المنصة بالحق في تعليق أو إنهاء أي حساب يخالف هذه الشروط.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. استخدام المنصة</h2>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li>المنصة مخصصة لتسليم المنتجات الرقمية النظامية فقط.</li>
              <li>يمنع استخدام المنصة لتسليم منتجات مخالفة للقوانين السعودية أو الدولية.</li>
              <li>التاجر هو المسؤول الوحيد عن قانونية المنتجات التي يبيعها عبر المنصة.</li>
              <li>يمنع استخدام المنصة في أي نشاط غير قانوني أو احتيالي.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. الاشتراكات والمدفوعات</h2>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li>تتوفر باقات اشتراك متعددة حسب احتياج التاجر.</li>
              <li>الباقة المجانية (بداية) متاحة بدون مقابل وبحدود استخدام محددة.</li>
              <li>الباقات المدفوعة تتطلب تحويلًا بنكيًا وتفعيلًا من إدارة المنصة.</li>
              <li>المبالغ المدفوعة غير قابلة للاسترداد بعد تفعيل الاشتراك.</li>
              <li>يحق للمنصة تعديل أسعار الباقات مع إشعار التاجر قبل 30 يومًا.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. حدود المسؤولية</h2>
            <ul className="list-disc list-inside space-y-2 text-brand-gray">
              <li>المنصة غير مسؤولة عن طبيعة أو قانونية المنتجات التي يبيعها التاجر.</li>
              <li>المنصة غير مسؤولة عن أي خسائر أو أضرار ناتجة عن استخدام المنصة.</li>
              <li>المنصة تبذل قصارى جهدها لضمان أمان البيانات وتوفر الخدمة.</li>
              <li>في حالة انقطاع الخدمة، تعمل المنصة على استعادتها في أسرع وقت ممكن.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. الملكية الفكرية</h2>
            <p className="text-brand-gray">
              جميع حقوق الملكية الفكرية للمنصة بما في ذلك الاسم والشعار والتصميم والكود المصدري محفوظة لسلّمها. لا يجوز نسخ أو إعادة استخدام أي جزء من المنصة بدون إذن كتابي.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. الإنهاء</h2>
            <p className="text-brand-gray">
              يحق للمنصة إنهاء أو تعليق حساب أي تاجر يخالف هذه الشروط دون سابق إنذار. كما يحق للتاجر إلغاء اشتراكه في أي وقت.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. تعديل الشروط</h2>
            <p className="text-brand-gray">
              تحتفظ المنصة بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار التجار بأي تغييرات جوهرية. استمرار استخدام المنصة بعد التعديل يعتبر موافقة على الشروط الجديدة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. التواصل</h2>
            <p className="text-brand-gray">
              لأي استفسارات حول هذه الشروط، يرجى التواصل عبر البريد الإلكتروني.
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
