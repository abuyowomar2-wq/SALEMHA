"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, removeToken, removeUser } from "@/lib/api";

const navItems = [
  { href: "/marketer", label: "الرئيسية", icon: "📊" },
  { href: "/marketer/referrals", label: "الإحالات", icon: "👥" },
];

export default function MarketerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUserState] = useState<any>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "marketer") {
      removeToken();
      removeUser();
      router.push("/login");
      return;
    }
    setUserState(u);
  }, [router]);

  const handleLogout = () => {
    removeToken();
    removeUser();
    router.push("/login");
  };

  if (!user) return (
    <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 border-4 border-brand-turquoise border-t-transparent rounded-full animate-spin" /></div>
  );

  const refUrl = user.affiliate_code
    ? `${window.location.origin}/register?ref=${user.affiliate_code}&role=merchant`
    : "";

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200 bg-brand-gradient">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">س</div>
            <h1 className="text-lg font-bold text-white">سلّمها</h1>
          </div>
          <p className="text-xs text-white/70 mt-1">لوحة المسوق</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${pathname === item.href ? "bg-brand-turquoise/10 text-brand-turquoise" : "text-brand-gray hover:bg-gray-100"}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {refUrl && (
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-brand-gray mb-2">رابط الإحالة</p>
            <div className="bg-gray-50 rounded-lg p-2 text-xs text-brand-blue break-all mb-2" dir="ltr">{refUrl}</div>
            <button onClick={() => { navigator.clipboard.writeText(refUrl); }} className="w-full rounded-lg bg-brand-turquoise px-3 py-2 text-xs font-bold text-white hover:opacity-90">نسخ الرابط</button>
          </div>
        )}

        <div className="p-4 border-t border-gray-200">
          <div className="text-sm font-medium text-brand-navy">{user.name}</div>
          <div className="text-xs text-brand-gray mb-3">مسوق</div>
          <button onClick={handleLogout} className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition">تسجيل الخروج</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
