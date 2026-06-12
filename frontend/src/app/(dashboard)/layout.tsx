"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, removeToken, removeUser } from "@/lib/api";

const navItems = [
  { href: "/", label: "الرئيسية", icon: "📊" },
  { href: "/products", label: "المنتجات", icon: "📦" },
  { href: "/orders", label: "الطلبات", icon: "📋" },
  { href: "/customers", label: "العملاء", icon: "👥" },
  { href: "/settings", label: "الإعدادات", icon: "⚙️" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUserState] = useState<any>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
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

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">سلّمها</h1>
          <p className="text-xs text-gray-500 mt-1">{user.merchant?.store_name}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-3">{user.name}</div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
