"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api";

type Stats = {
  total_orders: number;
  delivered_orders: number;
  pending_orders: number;
  total_products: number;
  total_inventory: number;
  available_inventory: number;
  low_stock_alerts: { id: number; name: string; available: number }[];
  plan: string;
  plan_label: string;
  plan_limits: { products: number; inventory: number; monthly_orders: number };
  plan_percentages: { products_pct: number; inventory_pct: number; orders_pct: number };
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
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    Promise.all([
      api.get<any>("/merchant/dashboard/stats", token),
      api.get<any>("/merchant/dashboard/recent-activity", token),
    ]).then(([s, r]) => {
      setStats(s);
      setRecent(r.recent_orders || []);
      setLoading(false);
    }).catch(() => {
      setError("تعذر تحميل البيانات");
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-brand-blue hover:underline">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-navy mb-6">لوحة التحكم</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="إجمالي الطلبات" value={stats?.total_orders ?? 0} />
        <StatCard title="الطلبات المسلمة" value={stats?.delivered_orders ?? 0} />
        <StatCard title="طلبات معلقة" value={stats?.pending_orders ?? 0} />
        <StatCard title="المخزون المتاح" value={stats?.available_inventory ?? 0} />
      </div>

      {stats?.plan !== "professional" && stats?.plan_percentages && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-brand-navy">حدود الباقة - {stats.plan_label}</h3>
            <a href="/dashboard/subscription" className="text-xs text-brand-blue hover:underline">ترقية الباقة</a>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <LimitBar label="المنتجات" pct={stats.plan_percentages.products_pct} />
            <LimitBar label="المخزون" pct={stats.plan_percentages.inventory_pct} />
            <LimitBar label="الطلبات الشهرية" pct={stats.plan_percentages.orders_pct} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-brand-navy mb-4">آخر الطلبات</h3>
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

function StatCard({ title, value }: { title: string; value: number; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-1 text-brand-navy">{value}</p>
    </div>
  );
}

function LimitBar({ label, pct }: { label: string; pct: number }) {
  const color = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-yellow-500" : "bg-brand-turquoise";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-brand-gray">{label}</span>
        <span className={`font-medium ${pct >= 80 ? "text-red-500" : "text-brand-navy"}`}>{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}
