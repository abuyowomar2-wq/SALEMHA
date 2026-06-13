"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

type Affiliate = {
  id: number;
  name: string;
  affiliate_code: string;
  total_referrals: number;
  active_subs: number;
  total_commission: number;
};

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAffiliates = () => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/admin/affiliates", token).then((d) => {
      setAffiliates(d.affiliates || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchAffiliates(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-turquoise border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">المسوقين والعمولات</h2>
        <p className="text-sm text-brand-gray mt-1">متابعة المسوقين ونسب العمولات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
          <p className="text-sm text-brand-gray">إجمالي المسوقين</p>
          <p className="text-3xl font-bold mt-1 text-white">{affiliates.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
          <p className="text-sm text-brand-gray">إجمالي الإحالات</p>
          <p className="text-3xl font-bold mt-1 text-white">{affiliates.reduce((s, a) => s + a.total_referrals, 0)}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
          <p className="text-sm text-brand-gray">إجمالي العمولات</p>
          <p className="text-3xl font-bold mt-1 text-brand-turquoise">{affiliates.reduce((s, a) => s + a.total_commission, 0)} ﷼</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">المسوق</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">كود الإحالة</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">عدد الإحالات</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">اشتراكات نشطة</th>
              <th className="px-4 py-3 text-right font-medium text-brand-gray">إجمالي العمولة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {affiliates.map((a) => (
              <tr key={a.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white">{a.name}</td>
                <td className="px-4 py-3 text-brand-gray"><code className="bg-white/10 rounded px-2 py-0.5 text-xs">{a.affiliate_code}</code></td>
                <td className="px-4 py-3 text-white">{a.total_referrals}</td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${a.active_subs > 0 ? "bg-green-500/10 text-green-400" : "bg-white/10 text-brand-gray"}`}>{a.active_subs} نشط</span></td>
                <td className="px-4 py-3 font-bold text-brand-turquoise">{a.total_commission} ﷼</td>
              </tr>
            ))}
          </tbody>
        </table>
        {affiliates.length === 0 && <div className="text-center py-8 text-brand-gray">لا يوجد مسوقين بعد</div>}
      </div>

      <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h3 className="font-bold text-white mb-3">كيف تعمل الإحالة؟</h3>
        <div className="space-y-2 text-sm text-brand-gray">
          <p>1. المسوق يسجل في المنصة ويحصل على كود إحالة خاص فيه.</p>
          <p>2. أي تاجر يسجل عبر رابط فيه كود الإحالة، ينضاف للمسوق تلقائيًا.</p>
          <p>3. لما التاجر يرقّي باقة مدفوعة، المسوق ياخذ عمولته:</p>
          <div className="bg-white/5 rounded-lg p-3 mt-2 space-y-1">
            <p>• <strong className="text-white">40%</strong> من قيمة الاشتراك الشهري</p>
            <p>• <strong className="text-white">20%</strong> من قيمة الاشتراك السنوي</p>
          </div>
          <p className="mt-2">4. العمولة تضاف تلقائيًا مع كل اشتراك مفعّل.</p>
        </div>
      </div>
    </div>
  );
}
