"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  type: string;
  instructions: string | null;
  is_active: boolean;
  inventory_count: number;
  available_count: number;
  created_at: string;
};

type InventoryItem = {
  id: number;
  product_id: number;
  status: string;
  order_id: number | null;
  used_at: string | null;
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

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invLoading, setInvLoading] = useState(false);

  const [invForm, setInvForm] = useState({ data: "", username: "", password: "" });
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const fetchProducts = () => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/merchant/products", token).then((data) => {
      setProducts(data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
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

  const openProduct = async (product: Product) => {
    setSelectedProduct(product);
    setInvForm({ data: "", username: "", password: "" });
    setBulkText("");
    setShowBulk(false);
    setInvLoading(true);
    const token = getToken();
    if (!token) return;
    const data = await api.get<any>(`/merchant/products/${product.id}/inventory`, token);
    setInventory(data.data || []);
    setInvLoading(false);
  };

  const addInventoryItem = async () => {
    const token = getToken();
    if (!token || !selectedProduct) return;

    let dataToSend = invForm.data;

    if (selectedProduct.type === "credential" && invForm.username && invForm.password) {
      dataToSend = `البريد: ${invForm.username}\nكلمة المرور: ${invForm.password}`;
    }

    if (!dataToSend.trim()) return;

    await api.post(`/merchant/products/${selectedProduct.id}/inventory`, { data: dataToSend }, token);
    setInvForm({ data: "", username: "", password: "" });
    openProduct(selectedProduct);
  };

  const addBulkInventory = async () => {
    const token = getToken();
    if (!token || !selectedProduct || !bulkText.trim()) return;

    await api.post(`/merchant/products/${selectedProduct.id}/inventory/bulk`, { items: bulkText }, token);
    setBulkText("");
    setShowBulk(false);
    openProduct(selectedProduct);
  };

  const disableItem = async (itemId: number) => {
    const token = getToken();
    if (!token || !selectedProduct) return;
    await api.delete(`/merchant/inventory/${itemId}`, token);
    openProduct(selectedProduct);
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
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + منتج جديد
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">إضافة منتج جديد</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input placeholder="اسم المنتج" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" required />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm">
                {Object.entries(typeLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
              </select>
              <textarea placeholder="تعليمات الاستخدام للعميل" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" rows={3} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-10 overflow-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedProduct.name}</h3>
                <p className="text-xs text-gray-500">{typeLabels[selectedProduct.type] || selectedProduct.type}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">إجمالي المخزون</p>
                <p className="text-xl font-bold">{selectedProduct.inventory_count}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">المتاح</p>
                <p className="text-xl font-bold text-green-600">{selectedProduct.available_count}</p>
              </div>
            </div>

            {/* Add Inventory */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">إضافة للمخزون</h4>
                <button onClick={() => setShowBulk(!showBulk)} className="text-xs text-blue-600 hover:underline">
                  {showBulk ? "إضافة فردية" : "إضافة جماعية"}
                </button>
              </div>

              {showBulk ? (
                <div className="space-y-2">
                  <textarea
                    placeholder="ضع الأكواد هنا - كل كود في سطر..."
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    rows={5}
                    dir="ltr"
                  />
                  <button onClick={addBulkInventory} className="w-full rounded-lg bg-blue-600 py-2 text-sm text-white hover:bg-blue-700">إضافة الأكواد</button>
                </div>
              ) : selectedProduct.type === "credential" ? (
                <div className="space-y-2">
                  <input placeholder="البريد الإلكتروني أو اسم المستخدم" value={invForm.username} onChange={(e) => setInvForm({ ...invForm, username: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" dir="ltr" />
                  <input placeholder="كلمة المرور" value={invForm.password} onChange={(e) => setInvForm({ ...invForm, password: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" dir="ltr" />
                  <button onClick={addInventoryItem} className="w-full rounded-lg bg-blue-600 py-2 text-sm text-white hover:bg-blue-700">إضافة</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    placeholder={selectedProduct.type === "link" ? "الرابط" : selectedProduct.type === "key" ? "مفتاح التفعيل" : "البيانات الرقمية"}
                    value={invForm.data}
                    onChange={(e) => setInvForm({ ...invForm, data: e.target.value })}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                    dir="ltr"
                  />
                  <button onClick={addInventoryItem} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">إضافة</button>
                </div>
              )}
            </div>

            {/* Inventory List */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">المخزون الحالي</h4>
              {invLoading ? (
                <div className="text-center py-4"><div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" /></div>
              ) : inventory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">لا يوجد مخزون</p>
              ) : (
                <div className="space-y-1 max-h-60 overflow-auto">
                  {inventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.status === "available" ? "bg-green-500" : item.status === "used" ? "bg-blue-500" : "bg-gray-400"}`} />
                        <span className="text-xs text-gray-500">#{item.id}</span>
                        <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("ar")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === "used" && item.order_id && (
                          <span className="text-xs text-blue-600">طلب #{item.order_id}</span>
                        )}
                        {item.status === "available" && (
                          <button onClick={() => disableItem(item.id)} className="text-xs text-red-500 hover:underline">تعطيل</button>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "available" ? "bg-green-100 text-green-600" : item.status === "used" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                          {item.status === "available" ? "متاح" : item.status === "used" ? "مستخدم" : "معطل"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">لا توجد منتجات بعد</p>
          <p className="text-sm mt-1">أضف منتجك الرقمي الأول</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => openProduct(p)}
              className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                  {p.is_active ? "نشط" : "معطل"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{typeLabels[p.type] || p.type}</p>
              <div className="flex gap-4 text-sm">
                <div><span className="text-gray-400">المخزون:</span> <span className="font-medium">{p.inventory_count}</span></div>
                <div><span className="text-gray-400">المتاح:</span> <span className="font-medium text-green-600">{p.available_count}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
