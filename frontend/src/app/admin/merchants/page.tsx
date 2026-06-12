"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

type Merchant = {
  id: number; store_name: string; store_slug: string; plan: string; is_active: boolean;
  user: { name: string; email: string; is_active: boolean };
};

export default function AdminMerchants() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", store_name: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });

  const fetchMerchants = () => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/admin/merchants", token).then((d) => {
      setMerchants(Array.isArray(d.data) ? d.data : (d.data?.data || []));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchMerchants(); }, []);

  const toggleStatus = async (m: Merchant) => {
    const token = getToken();
    if (!token || !confirm(`متأكد من ${m.is_active ? "تعطيل" : "تفعيل"} متجر ${m.store_name}؟`)) return;
    await api.put(`/admin/merchants/${m.id}/status`, { is_active: !m.is_active }, token);
    fetchMerchants();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    try {
      await api.post("/admin/merchants", form, token);
      setMsg({ text: "تم إنشاء المتجر بنجاح", type: "success" });
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", store_name: "" });
      fetchMerchants();
    } catch (err: any) {
      setMsg({ text: err.message || "فشل", type: "error" });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-turquoise border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">إدارة المتاجر</h2>
        <button onClick={() => setShowCreate(true)} className="bg-brand-gradient text-white rounded-lg px-4 py-2 text-sm font-bold hover:opacity-90">+ إنشاء متجر</button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-navy rounded-2xl border border-white/10 p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">إنشاء متجر جديد</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input placeholder="اسم المالك" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-4 py-2.5 text-sm outline-none" required />
              <input placeholder="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-4 py-2.5 text-sm outline-none" required dir="ltr" />
              <input placeholder="كلمة المرور" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-4 py-2.5 text-sm outline-none" required dir="ltr" />
              <input placeholder="اسم المتجر" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-4 py-2.5 text-sm outline-none" required />
              {msg.text && <div className={`text-sm p-2 rounded ${msg.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{msg.text}</div>}
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setMsg({ text: "", type: "" }); }} className="px-4 py-2 text-sm text-brand-gray hover:text-white">إلغاء</button>
                <button type="submit" className="bg-brand-gradient text-white rounded-lg px-6 py-2 text-sm font-bold hover:opacity-90">إنشاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">المتجر</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">المالك</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">الباقة</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">الحالة</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {merchants.map((m) => (
              <tr key={m.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white">{m.store_name}</td>
                <td className="px-4 py-3 text-brand-gray">{m.user.name}<div className="text-xs text-brand-gray/60">{m.user.email}</div></td>
                <td className="px-4 py-3"><span className="inline-flex rounded-full bg-brand-turquoise/10 text-brand-turquoise px-2.5 py-0.5 text-xs font-medium">{m.plan}</span></td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${m.is_active ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{m.is_active ? "نشط" : "معطل"}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(m)} className={`text-xs font-medium ${m.is_active ? "text-red-400 hover:underline" : "text-green-400 hover:underline"}`}>
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
