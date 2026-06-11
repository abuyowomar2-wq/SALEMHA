"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
  inventory_count: number;
  available_count: number;
  created_at: string;
};

const typeLabels: Record<string, string> = {
  code: "كود",
  file: "ملف",
  link: "رابط",
  credential: "بيانات دخول",
  key: "مفتاح تفعيل",
  other: "أخرى",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", type: "code", instructions: "", description: "" });

  const fetchProducts = () => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/merchant/products", token).then((data) => {
      setProducts(data.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    await api.post("/merchant/products", form, token);
    setShowCreate(false);
    setForm({ name: "", type: "code", instructions: "", description: "" });
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">المنتجات</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + منتج جديد
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">إضافة منتج جديد</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                placeholder="اسم المنتج"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 text-sm"
                required
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 text-sm"
              >
                {Object.entries(typeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <textarea
                placeholder="تعليمات الاستخدام للعميل"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 text-sm"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  إلغاء
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">لا توجد منتجات بعد</p>
          <p className="text-sm mt-1">أضف منتجك الرقمي الأول</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  p.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {p.is_active ? "نشط" : "معطل"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{typeLabels[p.type] || p.type}</p>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-400">المخزون:</span>{" "}
                  <span className="font-medium">{p.inventory_count}</span>
                </div>
                <div>
                  <span className="text-gray-400">المتاح:</span>{" "}
                  <span className="font-medium text-green-600">{p.available_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
