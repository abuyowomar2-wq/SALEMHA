"use client";

import { useEffect, useState } from "react";
import { api, getToken, getUser } from "@/lib/api";

type Order = {
  id: number;
  order_number: string;
  product_id: number | null;
  product_name: string | null;
  customer_name: string;
  customer_phone: string;
  status: string;
  delivery_status: string;
  notes: string | null;
  delivery_link: { hash: string; is_active: boolean; last_accessed_at: string | null } | null;
  created_at: string;
};

type ProductOption = {
  id: number;
  name: string;
};

type DeliveryLog = {
  id: number;
  event: string;
  details: any;
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

const logLabels: Record<string, string> = {
  link_created: "تم إنشاء الرابط",
  link_sent: "تم إرسال الرابط",
  link_opened: "تم فتح الرابط",
  link_resent: "تم إعادة إنشاء الرابط",
  verification_success: "تم التحقق بنجاح",
  verification_failed: "فشل التحقق",
  product_viewed: "تم استلام المنتج",
  order_cancelled: "تم إلغاء الطلب",
};

// Sallemha Orders Page v2
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [form, setForm] = useState({
    order_number: "",
    customer_name: "",
    customer_phone: "",
    product_id: "",
    notes: "",
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [logs, setLogs] = useState<DeliveryLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const saveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token || !selectedOrder) return;
    try {
      await api.put(`/merchant/orders/${selectedOrder.id}`, {
        customer_name: selectedOrder.customer_name,
        customer_phone: selectedOrder.customer_phone,
        status: selectedOrder.status,
      }, token);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || "فشل حفظ التغييرات");
    }
  };

  const fetchOrders = () => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/merchant/orders", token).then((data) => {
      setOrders(data.data || []);
      setLoading(false);
    });
  };

  const fetchProducts = () => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/merchant/products", token).then((data) => {
      setProducts(data.data || []);
    });
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
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

  const openOrder = async (order: Order) => {
    setSelectedOrder(order);
    setLogs([]);
    setLogsLoading(true);
    const token = getToken();
    if (!token) return;
    const data = await api.get<any>(`/merchant/orders/${order.id}/logs`, token);
    setLogs(data.data || []);
    setLogsLoading(false);
  };

  const regenerateLink = async () => {
    if (!selectedOrder) return;
    const token = getToken();
    if (!token) return;
    const data = await api.post<any>(`/merchant/orders/${selectedOrder.id}/regenerate-link`, {}, token);
    if (data.raw_token) {
      const slug = user?.merchant?.store_slug || "";
      setCreatedLink(`${window.location.origin}/d/${slug}/${data.raw_token}`);
    }
    setSelectedOrder(null);
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
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + طلب جديد
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">إنشاء طلب جديد</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input placeholder="رقم الطلب" value={form.order_number} onChange={(e) => setForm({ ...form, order_number: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" required />
              <input placeholder="اسم العميل" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" required />
              <input placeholder="رقم جوال العميل" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" required dir="ltr" />
              <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm">
                <option value="">بدون منتج</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">إنشاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {createdLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg text-center">
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold mb-2">رابط التسليم</h3>
            <p className="text-sm text-gray-500 mb-4">انسخ الرابط وأرسله للعميل</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-blue-600 break-all text-left" dir="ltr">{createdLink}</div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { navigator.clipboard.writeText(createdLink); }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">نسخ الرابط</button>
              <button onClick={() => setCreatedLink(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-10 overflow-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">طلب #{selectedOrder.order_number}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <form onSubmit={saveOrder} className="space-y-3 mb-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">اسم العميل</label>
                <input
                  value={selectedOrder.customer_name}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, customer_name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">رقم الجوال</label>
                <input
                  value={selectedOrder.customer_phone}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, customer_phone: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">حالة الطلب</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="processing">قيد المعالجة</option>
                  <option value="delivered">تم التسليم</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">
                  حالة التسليم: <span className={`inline-flex mr-1 rounded-full px-2 py-0.5 text-xs font-medium ${deliveryColors[selectedOrder.delivery_status] || ""}`}>{deliveryLabels[selectedOrder.delivery_status] || selectedOrder.delivery_status}</span>
                  {selectedOrder.product_name && <span className="mr-2 text-gray-400">| المنتج: {selectedOrder.product_name}</span>}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">حفظ التغييرات</button>
                <button type="button" onClick={regenerateLink} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">🔄 إعادة إنشاء الرابط</button>
              </div>
            </form>

            {/* Delivery Logs */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">سجل التوصيل</h4>
              {logsLoading ? (
                <div className="text-center py-4"><div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" /></div>
              ) : logs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">لا يوجد سجل</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400 text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="text-gray-600">{logLabels[log.event] || log.event}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
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
                <tr key={o.id} onClick={() => openOrder(o)} className="hover:bg-gray-50 cursor-pointer">
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
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-600">الرابط نشط</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">معطل</span>
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
