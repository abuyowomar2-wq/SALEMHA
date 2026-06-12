"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

type Order = { id: number; order_number: string; customer_name: string; customer_phone: string; delivery_status: string; created_at: string; };

const deliveryLabels: Record<string, string> = { not_sent: "لم يُرسل", sent: "تم الإرسال", opened: "تم الفتح", verified: "تم التحقق", product_viewed: "تم الاستلام" };
const deliveryColors: Record<string, string> = { not_sent: "bg-white/10 text-brand-gray", sent: "bg-blue-500/10 text-blue-400", opened: "bg-yellow-500/10 text-yellow-400", verified: "bg-green-500/10 text-green-400", product_viewed: "bg-emerald-500/10 text-emerald-400" };

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/admin/stats", token).then((d) => { setOrders(d.orders || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-turquoise border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">جميع الطلبات</h2>
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">رقم الطلب</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">العميل</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">الحالة</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white">{o.order_number}</td>
                <td className="px-4 py-3 text-brand-gray">{o.customer_name}<div className="text-xs text-brand-gray/60">{o.customer_phone}</div></td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${deliveryColors[o.delivery_status] || ""}`}>{deliveryLabels[o.delivery_status] || o.delivery_status}</span></td>
                <td className="px-4 py-3 text-xs text-brand-gray/60">{new Date(o.created_at).toLocaleDateString("ar")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="text-center py-8 text-brand-gray">لا توجد طلبات</div>}
      </div>
    </div>
  );
}
