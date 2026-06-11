"use client";

import { useEffect, useState } from "react";
import { api, getToken, getUser } from "@/lib/api";

type Order = {
  id: number;
  order_number: string;
  product_name: string | null;
  customer_name: string;
  customer_phone: string;
  status: string;
  delivery_status: string;
  delivery_link: { hash: string; is_active: boolean } | null;
  created_at: string;
};

const deliveryLabels: Record<string, string> = {
  not_sent: "لم يُرسل",
  sent: "تم الإرسال",
  opened: "تم الفتح",
  verified: "تم التحقق",
  product_viewed: "تم الاستلام",
};

const deliveryColors: Record<string, string> = {
  not_sent: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-600",
  opened: "bg-yellow-100 text-yellow-600",
  verified: "bg-green-100 text-green-600",
  product_viewed: "bg-emerald-100 text-emerald-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    order_number: "",
    customer_name: "",
    customer_phone: "",
    product_id: "",
    notes: "",
  });

  const fetchOrders = () => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/merchant/orders", token).then((data) => {
      setOrders(data.data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
    setUser(getUser());
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    const data = await api.post<any>("/merchant/orders", {
      ...form,
      product_id: form.product_id ? Number(form.product_id) : null,
    }, token);
    if (data.raw_token) {
      const slug = user?.merchant?.store_slug || "";
      setCreatedLink(`${window.location.origin}/d/${slug}/${data.raw_token}`);
    }
    setShowCreate(false);
    setForm({ order_number: "", customer_name: "", customer_phone: "", product_id: "", notes: "" });
    fetchOrders();
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">الطلبات</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + طلب جديد
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">إنشاء طلب جديد</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input placeholder="رقم الطلب" value={form.order_number} onChange={(e) => setForm({ ...form, order_number: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" required />
              <input placeholder="اسم العميل" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" required />
              <input placeholder="رقم جوال العميل" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" required dir="ltr" />
              <input placeholder="رقم المنتج (اختياري)" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">إنشاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {createdLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg text-center">
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold mb-2">تم إنشاء الطلب</h3>
            <p className="text-sm text-gray-500 mb-4">رابط التسليم للعميل:</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-blue-600 break-all text-left" dir="ltr">
              {createdLink}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => { navigator.clipboard.writeText(createdLink); }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                نسخ الرابط
              </button>
              <button
                onClick={() => setCreatedLink(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-500">رقم الطلب</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">العميل</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">المنتج</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">حالة التسليم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">الرابط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{o.order_number}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {o.customer_name}
                    <div className="text-xs text-gray-400">{o.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.product_name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${deliveryColors[o.delivery_status] || ""}`}>
                      {deliveryLabels[o.delivery_status] || o.delivery_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {o.delivery_link?.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-600">
                        الرابط نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                        معطل
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
