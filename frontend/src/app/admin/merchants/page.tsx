"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

type Merchant = {
  id: number;
  store_name: string;
  store_slug: string;
  plan: string;
  is_active: boolean;
  user: { name: string; email: string; is_active: boolean };
  created_at: string;
};

export default function AdminMerchants() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMerchants = () => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/admin/merchants", token).then((d) => {
      setMerchants(d.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchMerchants(); }, []);

  const toggleStatus = async (m: Merchant) => {
    const token = getToken();
    if (!token || !confirm(`متأكد من ${m.is_active ? "تعطيل" : "تفعيل"} متجر ${m.store_name}؟`)) return;
    await api.put(`/admin/merchants/${m.id}/status`, { is_active: !m.is_active }, token);
    fetchMerchants();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-navy mb-6">إدارة المتاجر</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-gray-500">المتجر</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">المالك</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">الباقة</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">الحالة</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {merchants.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-brand-navy">{m.store_name}</td>
                <td className="px-4 py-3 text-gray-600">{m.user.name}<div className="text-xs text-gray-400">{m.user.email}</div></td>
                <td className="px-4 py-3"><span className="inline-flex rounded-full bg-brand-blue/10 text-brand-blue px-2.5 py-0.5 text-xs font-medium">{m.plan}</span></td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${m.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{m.is_active ? "نشط" : "معطل"}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(m)} className={`text-xs font-medium ${m.is_active ? "text-red-500 hover:underline" : "text-green-500 hover:underline"}`}>
                    {m.is_active ? "تعطيل" : "تفعيل"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
