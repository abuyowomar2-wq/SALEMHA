"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, removeToken, removeUser } from "@/lib/api";

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

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    const u = getUser();
    if (!u || u.role !== "admin") {
      removeToken();
      removeUser();
      router.push("/admin/login");
      return;
    }
    setUserState(u);
  }, [router, pathname, isLoginPage]);

  const handleLogout = () => {
    removeToken();
    removeUser();
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark"><div className="h-10 w-10 border-4 border-brand-turquoise border-t-transparent rounded-full animate-spin" /></div>
  );

  return (
    <div className="flex h-screen bg-brand-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-navy border-l border-brand-navy/50 flex flex-col">
        <div className="p-5 border-b border-brand-navy/50 bg-gradient-to-l from-brand-navy to-brand-dark">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-blue/20">س</div>
            <div>
              <h1 className="text-lg font-bold text-white">سلّمها</h1>
              <span className="text-[10px] text-brand-turquoise tracking-wider">SUPER ADMIN</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                pathname === item.href
                  ? "bg-brand-blue/20 text-white border-r-2 border-brand-turquoise"
                  : "text-brand-gray hover:bg-brand-blue/10 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-navy/50">
          <div className="text-sm font-bold text-white mb-0.5">{user.name}</div>
          <div className="text-xs text-brand-turquoise mb-3">سوبر أدمن</div>
          <button onClick={handleLogout} className="w-full rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition">
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
