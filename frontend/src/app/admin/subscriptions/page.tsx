"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

type Sub = {
  id: number; store_name: string; plan: string; billing_cycle: string; amount: number; status: string; bank_reference: string; created_at: string;
};

const statusLabels: Record<string, string> = { pending: "قيد المراجعة", active: "نشط", rejected: "مرفوض", expired: "منتهي" };

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");

  const fetchSubs = () => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/admin/subscriptions", token).then((d) => { setSubs(d.subscriptions || []); setLoading(false); });
  };

  useEffect(() => { fetchSubs(); }, []);

  const approve = async (id: number) => {
    const token = getToken(); if (!token) return;
    await api.post(`/admin/subscriptions/${id}/approve`, { notes }, token); fetchSubs();
  };

  const reject = async (id: number) => {
    const token = getToken(); if (!token || !notes.trim()) { alert("اكتب سبب الرفض"); return; }
    await api.post(`/admin/subscriptions/${id}/reject`, { notes }, token); fetchSubs();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-turquoise border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">طلبات الاشتراك</h2>
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">المتجر</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">الباقة</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">المبلغ</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">المرجع</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">الحالة</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">ملاحظات + إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white">{s.store_name}</td>
                <td className="px-4 py-3 text-brand-gray">{s.plan} · {s.billing_cycle}</td>
                <td className="px-4 py-3 font-medium text-white">{s.amount} ريال</td>
                <td className="px-4 py-3 text-brand-gray" dir="ltr">{s.bank_reference || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : s.status === "active" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{statusLabels[s.status] || s.status}</span>
                </td>
                <td className="px-4 py-3">
                  {s.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <input placeholder="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-20 rounded border border-white/10 bg-white/5 text-white px-2 py-1 text-xs" />
                      <button onClick={() => approve(s.id)} className="text-xs bg-green-500/20 text-green-400 rounded px-2 py-1 hover:bg-green-500/30">تفعيل</button>
                      <button onClick={() => reject(s.id)} className="text-xs bg-red-500/20 text-red-400 rounded px-2 py-1 hover:bg-red-500/30">رفض</button>
                    </div>
                  ) : <span className="text-xs text-brand-gray/40">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subs.length === 0 && <div className="text-center py-8 text-brand-gray">لا توجد طلبات</div>}
      </div>
    </div>
  );
}
