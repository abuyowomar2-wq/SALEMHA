"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    store_name: "",
    primary_color: "#2563EB",
    verification_method: "order_number_phone",
    salla_api_key: "",
    salla_store_url: "",
    whatsapp_phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/merchant/settings", token).then((data) => {
      setSettings({
        store_name: data.store_name || "",
        primary_color: data.primary_color || "#2563EB",
        verification_method: data.verification_method || "order_number_phone",
        salla_api_key: data.salla_api_key || "",
        salla_store_url: data.salla_store_url || "",
        whatsapp_phone: data.whatsapp_phone || "",
      });
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;
    await api.put("/merchant/settings", settings, token);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSync = async () => {
    const token = getToken();
    if (!token) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const data = await api.post<any>("/merchant/sync/salla", {}, token);
      setSyncResult(data.message);
    } catch (err: any) {
      setSyncResult(err.message || "فشل المزامنة");
    }
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">الإعدادات</h2>

      <div className="space-y-6 max-w-lg">

        {/* Store Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">إعدادات المتجر</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
            <input value={settings.store_name} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اللون الرئيسي</label>
            <div className="flex gap-2">
              <input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="h-10 w-16 rounded border cursor-pointer" />
              <input value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="flex-1 rounded-lg border px-4 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">طريقة التحقق</label>
            <select value={settings.verification_method} onChange={(e) => setSettings({ ...settings, verification_method: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm">
              <option value="order_number_phone">رقم الطلب + رقم الجوال</option>
              <option value="order_number_code">رقم الطلب + رمز تحقق</option>
            </select>
          </div>
        </div>

        {/* Salla Integration */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">ربط متجر سلة</h3>
          <p className="text-xs text-gray-500">أدخل مفتاح API من لوحة تحكم متجرك في سلة</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">مفتاح API</label>
            <input
              type="password"
              value={settings.salla_api_key}
              onChange={(e) => setSettings({ ...settings, salla_api_key: e.target.value })}
              placeholder="sk_live_xxxxxxxxxxxx"
              className="w-full rounded-lg border px-4 py-2 text-sm"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط المتجر</label>
            <input
              value={settings.salla_store_url}
              onChange={(e) => setSettings({ ...settings, salla_store_url: e.target.value })}
              placeholder="https://your-store.salla.sa"
              className="w-full rounded-lg border px-4 py-2 text-sm"
              dir="ltr"
            />
          </div>
          {settings.salla_api_key && settings.salla_store_url && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {syncing ? "جاري المزامنة..." : "🔄 مزامنة طلبات سلة"}
            </button>
          )}
          {syncResult && (
            <div className="bg-blue-50 text-blue-700 rounded-lg p-3 text-sm">{syncResult}</div>
          )}
        </div>

        {/* WhatsApp Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">واتساب (قريبًا)</h3>
          <p className="text-xs text-gray-500">رقم الواتساب لإرسال روابط التسليم للعملاء</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الواتساب</label>
            <input
              value={settings.whatsapp_phone}
              onChange={(e) => setSettings({ ...settings, whatsapp_phone: e.target.value })}
              placeholder="9665xxxxxxxx"
              className="w-full rounded-lg border px-4 py-2 text-sm"
              dir="ltr"
            />
          </div>
          <p className="text-xs text-gray-400">سيتم إرسال رابط التسليم تلقائيًا للعميل عبر واتساب بعد استيراد الطلب</p>
        </div>

        <button onClick={handleSave} className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700">
          {saved ? "تم الحفظ ✓" : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}
