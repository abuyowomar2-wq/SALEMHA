"use client";

import { useEffect, useState } from "react";
import { api, getToken, getUser } from "@/lib/api";

export default function MarketerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([
      api.get<any>("/admin/affiliates", token),
      api.get<any>(`/admin/affiliates/${user?.merchant?.id || 0}/referrals`, token).catch(() => ({ referrals: [] })),
    ]).then(([affData]) => {
      const me = (affData.affiliates || []).find((a: any) => a.affiliate_code === user?.affiliate_code);
      setStats(me || { total_referrals: 0, active_subs: 0, total_commission: 0 });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-turquoise border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-navy mb-6">لوحة المسوق</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="عدد الإحالات" value={stats?.total_referrals || 0} />
        <StatCard title="اشتراكات نشطة" value={stats?.active_subs || 0} />
        <StatCard title="إجمالي العمولات" value={`${stats?.total_commission || 0} ﷼`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-brand-navy mb-3">كود الإحالة</h3>
          <div className="flex gap-2 mb-4">
            <input value={user?.affiliate_code || ""} readOnly className="flex-1 rounded-lg border bg-gray-50 px-4 py-2 text-sm font-mono font-bold text-brand-navy" dir="ltr" />
            <button onClick={() => { navigator.clipboard.writeText(user?.affiliate_code || ""); }} className="rounded-lg bg-brand-turquoise px-4 py-2 text-sm font-bold text-white hover:opacity-90">نسخ</button>
          </div>
          <p className="text-xs text-brand-gray">شارك الكود مع تجار المنتجات الرقمية</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-brand-navy mb-3">رابط الإحالة</h3>
          <div className="flex gap-2 mb-4">
            <input value={user?.affiliate_code ? `${window.location.origin}/register?ref=${user.affiliate_code}&role=merchant` : ""} readOnly className="flex-1 rounded-lg border bg-gray-50 px-4 py-2 text-xs text-brand-blue" dir="ltr" />
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user?.affiliate_code}&role=merchant`); }} className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-bold text-white hover:opacity-90">نسخ</button>
          </div>
          <p className="text-xs text-brand-gray">أي تاجر يسجل من هالرابط ينضاف لإحالاتك</p>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-l from-brand-turquoise/5 to-brand-blue/5 rounded-xl border border-brand-turquoise/20 p-6">
        <h3 className="font-bold text-brand-navy mb-3">💰 نظام العمولات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4"><span className="text-brand-gray">الاشتراك الشهري:</span> <span className="font-bold text-brand-turquoise">40%</span> عمولة</div>
          <div className="bg-white rounded-lg p-4"><span className="text-brand-gray">الاشتراك السنوي:</span> <span className="font-bold text-brand-turquoise">20%</span> عمولة</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-brand-gray">{title}</p>
      <p className="text-3xl font-bold mt-1 text-brand-navy">{value}</p>
    </div>
  );
}
