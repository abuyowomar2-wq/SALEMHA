"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/api";

const features = [
  { icon: "⚡", title: "تسليم تلقائي", desc: "سلّم منتجاتك الرقمية تلقائيًا فور التحقق من العميل بدون تدخل يدوي" },
  { icon: "🔒", title: "روابط آمنة", desc: "كل رابط تسليم مشفر وفريد ولا يمكن تخمينه أو مشاركته مع آخرين" },
  { icon: "🛡️", title: "تشفير AES-256", desc: "جميع الأكواد والبيانات الرقمية مشفرة بأعلى معايير الأمان" },
  { icon: "📊", title: "لوحة تحكم", desc: "إحصائيات فورية، سجل توصيل كامل، وتنبيهات ذكية لنفاد المخزون" },
  { icon: "📱", title: "تجربة جوال", desc: "صفحة تسليم محسّنة للجوال، عميلك يستلم منتجه من أي جهاز" },
  { icon: "🌐", title: "دعم عربي كامل", desc: "واجهة عربية بالكامل مع دعم RTL وتجربة مستخدم احترافية" },
];

const steps = [
  { step: "١", title: "سجّل متجرك", desc: "أنشئ حساب وأضف اسم متجرك في دقيقة واحدة" },
  { step: "٢", title: "أضف منتجاتك", desc: "ارفع منتجاتك الرقمية والأكواد والمفاتيح في لوحة التحكم" },
  { step: "٣", title: "أنشئ طلب", desc: "أنشئ طلب للعميل واحصل على رابط تسليم آمن وفريد" },
  { step: "٤", title: "العميل يستلم", desc: "العميل يفتح الرابط ويتحقق من بياناته ويستلم المنتج فورًا" },
];

const plans = [
  { name: "بداية", price: "مجاني للأبد", features: ["حتى ١٠ منتجات", "حتى ١٠٠ عنصر مخزون", "١٠ طلبات شهريًا", "روابط تسليم آمنة", "لوحة تحكم أساسية"], color: "from-brand-light to-brand-gray", popular: false },
  { name: "نمو", price: "75.99 ريال/شهر", features: ["حتى ٥٠ منتج", "حتى ٥,٠٠٠ عنصر مخزون", "٥٠٠ طلب شهريًا", "شعارك + لونك", "إحصائيات متقدمة"], color: "from-brand-blue to-brand-turquoise", popular: true, yearly: "53 ريال/شهر (سنوي)" },
  { name: "احترافية", price: "99 ريال/شهر", features: ["منتجات غير محدودة", "مخزون غير محدود", "طلبات غير محدودة", "إزالة علامة سلّمها", "دعم VIP"], color: "from-brand-navy to-brand-blue", popular: false, yearly: "69 ريال/شهر (سنوي)" },
];

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="سلّمها" className="w-8 h-8 rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="text-xl font-bold text-brand-navy">سلّمها</span>
          </div>
          <Link href="/login" className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition">دخول</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-white to-brand-turquoise/5" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-turquoise/30 bg-brand-turquoise/5 px-4 py-1.5 text-sm text-brand-turquoise mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-turquoise animate-pulse" />
            المنصة في نسختها التجريبية
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-navy leading-tight mb-6">
            سلّم منتجاتك الرقمية
            <br />
            <span className="bg-brand-gradient bg-clip-text text-transparent">تلقائيًا وبأمان</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-gray max-w-2xl mx-auto mb-10 leading-relaxed">
            منصة احترافية لتسليم الأكواد، البطاقات، المفاتيح، والملفات الرقمية لعملائك
            بدون تعب واتساب، وبدون أخطاء، ومع توثيق كامل لكل عملية تسليم
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="rounded-xl bg-brand-blue px-8 py-4 text-base font-bold text-white hover:opacity-90 shadow-lg shadow-brand-blue/25 transition">
              ابدأ الآن مجانًا
            </Link>
            <Link href="/login" className="rounded-xl border-2 border-brand-navy px-8 py-4 text-base font-bold text-brand-navy hover:bg-brand-navy/5 transition">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">لماذا سلّمها؟</h2>
            <p className="text-brand-gray text-lg">كل ما تحتاجه لتسليم منتجاتك الرقمية في منصة واحدة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-gray-100 p-6 hover:border-brand-blue/30 hover:shadow-lg transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">{f.title}</h3>
                <p className="text-brand-gray text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">كيف تعمل المنصة؟</h2>
            <p className="text-brand-gray text-lg">أربع خطوات بسيطة لتسليم منتجك الرقمي</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 right-0 w-full h-0.5 bg-gradient-to-l from-brand-blue to-brand-turquoise translate-x-1/2" />
                )}
                <div className="relative z-10 w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">{s.title}</h3>
                <p className="text-brand-gray text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">الباقات والأسعار</h2>
            <p className="text-brand-gray text-lg">اختر الباقة المناسبة لاحتياجات متجرك</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl border p-6 ${plan.popular ? "border-brand-blue shadow-xl scale-105" : "border-gray-200"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 right-4 rounded-full bg-brand-gradient px-4 py-1 text-xs font-bold text-white shadow">الأكثر طلبًا</div>
                )}
                <h3 className="text-lg font-bold text-brand-navy mb-1">{plan.name}</h3>
                <div className="text-3xl font-extrabold text-brand-navy mb-1">{plan.price}</div>
                {plan.yearly && <div className="text-sm text-brand-turquoise font-medium mb-3">{plan.yearly}</div>}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-brand-gray">
                      <span className="text-brand-turquoise">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`block w-full rounded-xl py-3 text-sm font-bold text-center transition ${
                  plan.popular
                    ? "bg-brand-gradient text-white shadow-lg hover:opacity-90"
                    : "border-2 border-brand-navy text-brand-navy hover:bg-brand-navy/5"
                }`}>
                  {plan.name === "بداية" ? "ابدأ مجانًا" : "ابدأ الآن"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="سلّمها" className="w-8 h-8 rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="text-lg font-bold text-brand-navy">سلّمها</span>
          </div>
          <p className="text-sm text-brand-gray mb-4">منصة تسليم المنتجات الرقمية لمتاجر سلة</p>
          <p className="text-xs text-brand-gray/60">© ٢٠٢٦ سلّمها. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
