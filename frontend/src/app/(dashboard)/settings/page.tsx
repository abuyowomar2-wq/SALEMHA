"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    store_name: "",
    primary_color: "#2563EB",
    verification_method: "order_number_phone",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/merchant/settings", token).then((data) => {
      setSettings({
        store_name: data.store_name || "",
        primary_color: data.primary_color || "#2563EB",
        verification_method: data.verification_method || "order_number_phone",
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

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-lg">
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
        <button onClick={handleSave} className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700">
          {saved ? "تم الحفظ ✓" : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}
