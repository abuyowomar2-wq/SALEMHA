"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getUser } from "@/lib/api";

export default function AffiliatePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (getToken()) {
      const user = getUser();
      router.replace(user?.role === "admin" ? "/admin" : "/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark">
      <div className="h-10 w-10 border-4 border-brand-turquoise border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Nav */}
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">س</div>
            <span className="text-xl font-bold text-white">سلّمها</span>
            <span className="text-xs text-brand-turquoise mr-2">برنامج المسوقين</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 transition">دخول</Link>
            <Link href="/register" className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition">تسجيل</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-turquoise/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-turquoise/30 bg-brand-turquoise/10 px-4 py-1.5 text-sm text-brand-turquoise mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-turquoise animate-pulse" />
            برنامج المسوقين
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            اكسب عمولة من كل
            <br />
            <span className="bg-brand-gradient bg-clip-text text-transparent">تاجر تجيبه للمنصة</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-gray max-w-2xl mx-auto mb-10 leading-relaxed">
            شارك كود الإحالة حقك مع تجار المنتجات الرقمية، وكل ما واحد منهم رقّى باقة مدفوعة، تاخذ عمولتك تلقائيًا
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="rounded-xl bg-brand-gradient px-8 py-4 text-base font-bold text-white hover:opacity-90 shadow-lg shadow-brand-blue/20 transition">
              ابدأ الآن مجانًا
            </Link>
            <Link href="/login" className="rounded-xl border-2 border-white/20 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition">
              عندي حساب
            </Link>
          </div>
        </div>
      </section>

      {/* Commissions */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">نظام العمولات</h2>
          <p className="text-brand-gray text-lg mb-12">عمولتك تزيد مع كل تاجر يرقّي</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
              <div className="text-5xl font-extrabold text-brand-turquoise mb-2">40%</div>
              <p className="text-white font-bold text-lg mb-1">الاشتراك الشهري</p>
              <p className="text-brand-gray text-sm">مثال: باقة نمو 75.99 ﷼ = <span className="text-brand-turquoise font-bold">30.40 ﷼</span> لك</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
              <div className="text-5xl font-extrabold text-brand-turquoise mb-2">20%</div>
              <p className="text-white font-bold text-lg mb-1">الاشتراك السنوي</p>
              <p className="text-brand-gray text-sm">مثال: باقة نمو سنوي 636 ﷼ = <span className="text-brand-turquoise font-bold">127 ﷼</span> لك</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="text-xs text-brand-gray">باقة نمو شهري</div>
              <div className="text-lg font-bold text-white">30.40 ﷼</div>
              <div className="text-xs text-brand-turquoise">لكل اشتراك</div>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="text-xs text-brand-gray">باقة احترافية شهري</div>
              <div className="text-lg font-bold text-white">39.60 ﷼</div>
              <div className="text-xs text-brand-turquoise">لكل اشتراك</div>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="text-xs text-brand-gray">باقة نمو سنوي</div>
              <div className="text-lg font-bold text-white">127 ﷼</div>
              <div className="text-xs text-brand-turquoise">لكل اشتراك</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">كيف تبدأ؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "١", title: "سجّل", desc: "أنشئ حسابك في سلّمها مجانًا" },
              { step: "٢", title: "خذ كودك", desc: "انسخ كود الإحالة حقك من الإعدادات" },
              { step: "٣", title: "شارك", desc: "أرسل رابط الإحالة للتجار" },
              { step: "٤", title: "اكسب", desc: "تقبض عمولتك مع كل تاجر يرقّي" },
            ].map((s, i) => (
              <div key={s.title} className="relative text-center">
                {i < 3 && <div className="hidden md:block absolute top-8 right-0 w-full h-0.5 bg-gradient-to-l from-brand-blue to-brand-turquoise translate-x-1/2" />}
                <div className="relative z-10 w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-2xl font-bold shadow-lg">{s.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-brand-gray text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-4">جاهز تبدأ تكسب؟</h2>
          <p className="text-brand-gray text-lg mb-8">سجّل الآن مجانًا وابدأ بمشاركة كود الإحالة حقك</p>
          <Link href="/register" className="inline-flex rounded-xl bg-brand-gradient px-10 py-4 text-base font-bold text-white hover:opacity-90 shadow-lg shadow-brand-blue/20 transition">
            ابدأ الآن مجانًا
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">س</div>
            <span className="text-lg font-bold text-white">سلّمها</span>
          </div>
          <div className="flex justify-center gap-4 mb-4">
            <Link href="/terms" className="text-xs text-brand-gray hover:text-white transition">الشروط والأحكام</Link>
            <Link href="/privacy" className="text-xs text-brand-gray hover:text-white transition">سياسة الخصوصية</Link>
          </div>
          <p className="text-xs text-brand-gray/60">© ٢٠٢٦ سلّمها. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
