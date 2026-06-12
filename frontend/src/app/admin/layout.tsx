"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, removeToken, removeUser, api, getToken } from "@/lib/api";

const navItems = [
  { href: "/admin", label: "الرئيسية", icon: "📊" },
  { href: "/admin/merchants", label: "المتاجر", icon: "🏪" },
  { href: "/admin/subscriptions", label: "الاشتراكات", icon: "💳" },
  { href: "/admin/orders", label: "الطلبات", icon: "📋" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUserState] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "admin") {
      router.push("/login");
      return;
    }

    const token = getToken();
    if (token) {
      api.get("/auth/me", token).then((data: any) => {
        const me = data.data || data;
        if (me.role !== "admin") {
          router.push("/dashboard");
          return;
        }
        setUserState(me);
        setChecking(false);
      }).catch(() => router.push("/login"));
    }
  }, [router]);

  const handleLogout = () => {
    removeToken();
    removeUser();
    router.push("/login");
  };

  if (checking && !user) return (
    <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" /></div>
  );

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200 bg-brand-navy">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">س</div>
            <h1 className="text-lg font-bold text-white">سلّمها</h1>
          </div>
          <p className="text-xs text-brand-light mt-1 mr-10">لوحة سوبر أدمن</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                pathname === item.href ? "bg-brand-blue/10 text-brand-blue" : "text-brand-gray hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-sm font-medium text-brand-navy mb-1">{user.name}</div>
          <div className="text-xs text-brand-gray mb-3">سوبر أدمن</div>
          <button onClick={handleLogout} className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition">تسجيل الخروج</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
