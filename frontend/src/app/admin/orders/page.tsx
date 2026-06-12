"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_status: string;
  created_at: string;
};

const deliveryLabels: Record<string, string> = {
  not_sent: "لم يُرسل", sent: "تم الإرسال", opened: "تم الفتح", verified: "تم التحقق", product_viewed: "تم الاستلام",
};

const deliveryColors: Record<string, string> = {
  not_sent: "bg-gray-100 text-gray-600", sent: "bg-blue-100 text-blue-600", opened: "bg-yellow-100 text-yellow-600", verified: "bg-green-100 text-green-600", product_viewed: "bg-emerald-100 text-emerald-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/admin/stats", token).then((d) => {
      setOrders(d.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-navy mb-6">جميع الطلبات</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-gray-500">رقم الطلب</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">العميل</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">حالة التسليم</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-brand-navy">{o.order_number}</td>
                <td className="px-4 py-3 text-gray-600">{o.customer_name}<div className="text-xs text-gray-400">{o.customer_phone}</div></td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${deliveryColors[o.delivery_status] || ""}`}>{deliveryLabels[o.delivery_status] || o.delivery_status}</span></td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString("ar")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="text-center py-8 text-gray-400">لا توجد طلبات</div>}
      </div>
    </div>
  );
}
