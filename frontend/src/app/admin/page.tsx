"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.get("/admin/stats", token).then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-navy mb-6">لوحة سوبر أدمن</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="إجمالي المتاجر" value={stats?.total_merchants ?? 0} color="blue" />
        <StatCard title="المتاجر النشطة" value={stats?.active_merchants ?? 0} color="green" />
        <StatCard title="إجمالي الطلبات" value={stats?.total_orders ?? 0} color="purple" />
        <StatCard title="الطلبات المسلمة" value={stats?.delivered_orders ?? 0} color="turquoise" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LinkCard href="/admin/merchants" icon="🏪" title="إدارة المتاجر" desc="عرض وتفعيل وتعطيل المتاجر" />
        <LinkCard href="/admin/subscriptions" icon="💳" title="طلبات الاشتراك" desc="مراجعة وتفعيل طلبات الترقية" />
        <LinkCard href="/admin/orders" icon="📋" title="جميع الطلبات" desc="عرض جميع طلبات المنصة" />
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colors: Record<string, string> = { blue: "bg-blue-50 text-blue-700", green: "bg-green-50 text-green-700", purple: "bg-purple-50 text-purple-700", turquoise: "bg-brand-turquoise/10 text-brand-turquoise" };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-brand-gray">{title}</p>
      <p className="text-3xl font-bold mt-1 text-brand-navy">{value}</p>
    </div>
  );
}

function LinkCard({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <a href={href} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-blue/40 hover:shadow transition block">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-bold text-brand-navy">{title}</h3>
      <p className="text-sm text-brand-gray mt-1">{desc}</p>
    </a>
  );
}
