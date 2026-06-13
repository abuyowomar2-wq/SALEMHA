"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    store_name: "",
    primary_color: "#1659D3",
    verification_method: "order_number_phone",
    logo_url: null as string | null,
    affiliate_code: "",
    affiliate_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/merchant/settings", token).then((data) => {
      setSettings({
        store_name: data.store_name || "",
        primary_color: data.primary_color || "#1659D3",
        verification_method: data.verification_method || "order_number_phone",
        logo_url: data.logo_url || null,
        affiliate_code: data.affiliate_code || "",
        affiliate_url: data.affiliate_url || "",
      });
      setLoading(false);
    });
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;

    const formData = new FormData();
    formData.append("store_name", settings.store_name);
    formData.append("primary_color", settings.primary_color);
    formData.append("verification_method", settings.verification_method);
    if (logoFile) {
      formData.append("logo", logoFile);
    }
    formData.append("_method", "PUT");

    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/merchant/settings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: formData,
    });

    setSaved(true);
    setLogoFile(null);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-navy mb-6">الإعدادات</h2>

      <div className="space-y-6 max-w-lg">
        {/* Logo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-brand-navy">شعار المتجر</h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
              {logoPreview || settings.logo_url ? (
                <img src={logoPreview || settings.logo_url || ""} alt="شعار المتجر" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-brand-gray">{(settings.store_name || "س")[0]}</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoChange}
                className="text-sm text-brand-gray file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-blue/10 file:text-brand-blue"
              />
              <p className="text-xs text-brand-gray mt-1">PNG, JPG, SVG - 2MB كحد أقصى</p>
            </div>
          </div>
        </div>

        {/* Store Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-brand-navy">إعدادات المتجر</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
            <input value={settings.store_name} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اللون الرئيسي</label>
            <div className="flex gap-2">
              <input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="h-10 w-16 rounded border cursor-pointer" />
              <input value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="flex-1 rounded-lg border px-4 py-2 text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">طريقة التحقق</label>
            <select value={settings.verification_method} onChange={(e) => setSettings({ ...settings, verification_method: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm outline-none">
              <option value="order_number_phone">رقم الطلب + رقم الجوال</option>
              <option value="order_number_code">رقم الطلب + رمز تحقق</option>
            </select>
          </div>
        </div>

        {/* Affiliate */}
        {settings.affiliate_code && (
          <div className="bg-white rounded-xl border border-brand-turquoise/30 p-6 space-y-4">
            <h3 className="font-semibold text-brand-navy">🤝 نظام الإحالة</h3>
            <p className="text-xs text-brand-gray">ادعُ تجار جدد واكسب عمولة على اشتراكاتهم</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كود الإحالة الخاص بك</label>
              <div className="flex gap-2">
                <input value={settings.affiliate_code} readOnly className="flex-1 rounded-lg border bg-gray-50 px-4 py-2 text-sm font-mono font-bold text-brand-navy" dir="ltr" />
                <button onClick={() => { navigator.clipboard.writeText(settings.affiliate_code); }} className="rounded-lg bg-brand-turquoise px-4 py-2 text-sm font-bold text-white hover:opacity-90">نسخ</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رابط الإحالة</label>
              <div className="flex gap-2">
                <input value={settings.affiliate_url} readOnly className="flex-1 rounded-lg border bg-gray-50 px-4 py-2 text-xs text-brand-blue" dir="ltr" />
                <button onClick={() => { navigator.clipboard.writeText(settings.affiliate_url); }} className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-bold text-white hover:opacity-90">نسخ</button>
              </div>
            </div>
            <div className="bg-brand-turquoise/5 rounded-lg p-3 text-xs text-brand-navy leading-relaxed">
              <p className="font-bold mb-1">💰 نظام العمولات:</p>
              <p>• <strong>40%</strong> من الاشتراك الشهري</p>
              <p>• <strong>20%</strong> من الاشتراك السنوي</p>
              <p className="mt-2">أي تاجر يسجل عبر رابطك وتفعل باقته المدفوعة، راح تاخذ عمولتك تلقائيًا.</p>
            </div>
          </div>
        )}

        <button onClick={handleSave} className="w-full rounded-lg bg-brand-blue py-3 text-sm font-medium text-white hover:opacity-90">
          {saved ? "تم الحفظ ✓" : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}
