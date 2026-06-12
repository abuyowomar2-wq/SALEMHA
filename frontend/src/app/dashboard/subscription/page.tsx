"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

const planLabels: Record<string, string> = {
  starter: "بداية (مجاني)",
  growth: "نمو",
  professional: "احترافية",
};

const bankInfo = {
  bank: "مصرف الراجحي",
  name: "سلطان محمد مشبب الأحمري",
  iban: "SA7580000659608016092953",
  account: "659000010006086092953",
};

export default function SubscriptionPage() {
  const [current, setCurrent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [form, setForm] = useState({ plan: "growth", billing_cycle: "monthly", bank_reference: "" });
  const [message, setMessage] = useState({ text: "", type: "" });

  const prices: Record<string, Record<string, number>> = {
    growth: { monthly: 75.99, yearly: 53 },
    professional: { monthly: 99, yearly: 69 },
  };

  const fetchCurrent = () => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/merchant/subscription", token).then((data) => {
      setCurrent(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchCurrent(); }, []);

  const handleUpgrade = async () => {
    if (!form.bank_reference.trim()) {
      setMessage({ text: "الرجاء إدخال رقم مرجع التحويل", type: "error" });
      return;
    }
    const token = getToken();
    if (!token) return;
    try {
      await api.post("/merchant/subscription/upgrade", form, token);
      setMessage({ text: "تم إرسال الطلب! سنراجع التحويل ونفعل اشتراكك.", type: "success" });
      setUpgrading(false);
      fetchCurrent();
    } catch (err: any) {
      setMessage({ text: err.message || "فشل", type: "error" });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-navy mb-6">الاشتراكات</h2>

      {/* Current Plan */}
      {current && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 max-w-2xl">
          <h3 className="font-semibold text-brand-navy mb-4">خطتك الحالية</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-gradient text-white rounded-xl px-4 py-2 font-bold text-lg">{planLabels[current.plan] || current.plan}</div>
            {current.pending_upgrade && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">طلب ترقية قيد المراجعة</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <LimitBar label="المنتجات" used={current.usage.products} max={current.limits.products} pct={current.percentages.products_pct} />
            <LimitBar label="المخزون" used={current.usage.inventory} max={current.limits.inventory} pct={current.percentages.inventory_pct} />
            <LimitBar label="الطلبات الشهرية" used={current.usage.monthly_orders} max={current.limits.monthly_orders} pct={current.percentages.orders_pct} />
          </div>

          {!current.pending_upgrade && current.plan === "starter" && (
            <button onClick={() => setUpgrading(true)} className="bg-brand-gradient text-white rounded-lg px-6 py-2.5 text-sm font-bold hover:opacity-90">رقّي باقتك</button>
          )}
        </div>
      )}

      {/* Upgrade Modal */}
      {upgrading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-brand-navy mb-4">ترقية الباقة</h3>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">الباقة</label>
                <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm">
                  <option value="growth">نمو - {prices.growth.monthly} ريال/شهر</option>
                  <option value="professional">احترافية - {prices.professional.monthly} ريال/شهر</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">دورة الدفع</label>
                <select value={form.billing_cycle} onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm">
                  <option value="monthly">شهري</option>
                  <option value="yearly">سنوي (خصم 30%)</option>
                </select>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-2xl font-extrabold text-brand-navy">
                  {prices[form.plan]?.[form.billing_cycle] || 0} ريال
                </span>
                <span className="text-sm text-brand-gray"> / {form.billing_cycle === "monthly" ? "شهر" : "شهر (السنة الأولى)"}</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4 text-xs leading-relaxed">
              <p className="font-bold text-brand-navy mb-2">معلومات التحويل البنكي:</p>
              <p>البنك: {bankInfo.bank}</p>
              <p>المستفيد: {bankInfo.name}</p>
              <p>الآيبان: <span dir="ltr" className="font-mono text-xs">{bankInfo.iban}</span></p>
              <p>رقم الحساب: <span dir="ltr" className="font-mono text-xs">{bankInfo.account}</span></p>
              <p className="mt-2 font-bold">المبلغ: {prices[form.plan]?.[form.billing_cycle] || 0} ريال</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">رقم مرجع التحويل</label>
              <input value={form.bank_reference} onChange={(e) => setForm({ ...form, bank_reference: e.target.value })} placeholder="أدخل رقم مرجع التحويل بعد إتمام الدفع" className="w-full rounded-lg border px-3 py-2 text-sm" dir="ltr" />
            </div>

            {message.text && (
              <div className={`rounded-lg p-3 text-sm mb-4 ${message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{message.text}</div>
            )}

            <div className="flex gap-2 justify-end">
              <button onClick={() => setUpgrading(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">إغلاق</button>
              <button onClick={handleUpgrade} className="bg-brand-gradient text-white rounded-lg px-6 py-2 text-sm font-bold hover:opacity-90">إرسال الطلب</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LimitBar({ label, used, max, pct }: { label: string; used: number; max: number; pct: number }) {
  const isUnlimited = max > 999999;
  const color = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-yellow-500" : "bg-brand-turquoise";

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-brand-gray">{label}</span>
        <span className="font-medium text-brand-navy">
          {isUnlimited ? "∞" : `${used}/${max}`}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition ${color}`} style={{ width: `${isUnlimited ? 0 : Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}
