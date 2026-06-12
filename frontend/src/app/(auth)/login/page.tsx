"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setToken, setUser } from "@/lib/api";

export default function LoginPage() {
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
      setToken(data.token);
      setUser(data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-navy">سلّمها</h1>
          <p className="mt-2 text-sm text-brand-gray">تسجيل الدخول للوحة التحكم</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" required dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" required dir="ltr" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand-blue py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition">
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-gray">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-brand-blue hover:underline">إنشاء حساب جديد</Link>
        </p>
      </div>
    </div>
  );
}
