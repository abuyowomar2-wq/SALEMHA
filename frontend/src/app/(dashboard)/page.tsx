"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

type Stats = {
  total_orders: number;
  delivered_orders: number;
  pending_orders: number;
  total_products: number;
  total_inventory: number;
  available_inventory: number;
  low_stock_alerts: { id: number; name: string; available: number }[];
};

type RecentOrder = {
  id: number;
  order_number: string;
  product_name: string | null;
  customer_name: string;
  delivery_status: string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  not_sent: "لم يُرسل",
  sent: "تم الإرسال",
  opened: "تم الفتح",
  verified: "تم التحقق",
  product_viewed: "تم الاستلام",
};

const statusColors: Record<string, string> = {
  not_sent: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-600",
  opened: "bg-yellow-100 text-yellow-600",
  verified: "bg-green-100 text-green-600",
  product_viewed: "bg-emerald-100 text-emerald-600",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    Promise.all([
      api.get<any>("/merchant/dashboard/stats", token),
      api.get<any>("/merchant/dashboard/recent-activity", token),
    ]).then(([s, r]) => {
      setStats(s);
      setRecent(r.recent_orders || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">لوحة التحكم</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="إجمالي الطلبات" value={stats?.total_orders ?? 0} color="blue" />
        <StatCard title="الطلبات المسلمة" value={stats?.delivered_orders ?? 0} color="green" />
        <StatCard title="طلبات معلقة" value={stats?.pending_orders ?? 0} color="yellow" />
        <StatCard title="المخزون المتاح" value={stats?.available_inventory ?? 0} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">آخر الطلبات</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400">لا توجد طلبات بعد</p>
          ) : (
            <div className="space-y-3">
              {recent.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {order.product_name || "بدون منتج"} · {order.customer_name}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[order.delivery_status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statusLabels[order.delivery_status] || order.delivery_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تنبيهات المخزون</h3>
          {stats?.low_stock_alerts?.length === 0 ? (
            <p className="text-sm text-gray-400">المخزون بحالة جيدة</p>
          ) : (
            <div className="space-y-3">
              {stats?.low_stock_alerts?.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <p className="text-sm text-gray-900">{alert.name}</p>
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                    {alert.available} متبقي
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color] || ""} bg-transparent`}>
        {value}
      </p>
    </div>
  );
}
