"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setToken, setUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    store_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.post<any>("/auth/register", form);
      setToken(data.token);
      setUser(data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || Object.values(err.errors || {}).flat().join(", "));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: "name", label: "الاسم الكامل", type: "text", required: true },
    { id: "email", label: "البريد الإلكتروني", type: "email", required: true, dir: "ltr" },
    { id: "phone", label: "رقم الجوال (اختياري)", type: "tel", dir: "ltr" },
    { id: "password", label: "كلمة المرور", type: "password", required: true },
    { id: "password_confirmation", label: "تأكيد كلمة المرور", type: "password", required: true },
    { id: "store_name", label: "اسم المتجر", type: "text", required: true },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-brand-navy">سلّمها</h1>
          <p className="mt-2 text-sm text-brand-gray">إنشاء حساب تاجر جديد</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((f) => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.id]}
                onChange={handleChange(f.id)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                required={f.required}
                dir={(f as any).dir || "rtl"}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition mt-2"
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          لديك حساب؟{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
