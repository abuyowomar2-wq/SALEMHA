"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, setToken, setUser } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.post<any>("/auth/login", { email, password });

      if (data.user.role !== "admin") {
        setError("هذا الحساب ليس حساب أدمن. استخدم صفحة تسجيل دخول التجار.");
        setLoading(false);
        return;
      }

      setToken(data.token);
      setUser(data.user);
      router.push("/admin");
    } catch (err: any) {
      setError("بريد إلكتروني أو كلمة مرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-turquoise/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-gradient flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-blue/20">س</div>
          <h1 className="text-2xl font-bold text-white">سلّمها</h1>
          <p className="text-sm text-brand-gray mt-2">لوحة تحكم سوبر أدمن</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/20 outline-none transition"
                required
                dir="ltr"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray mb-1.5">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/20 outline-none transition"
                required
                dir="ltr"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-brand-blue/20"
            >
              {loading ? "جاري الدخول..." : "دخول"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-brand-gray">
              هذه الصفحة مخصصة للأدمن فقط.
              <br />
              للتجار: استخدم <a href="/login" className="text-brand-turquoise hover:underline">صفحة الدخول العادية</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
