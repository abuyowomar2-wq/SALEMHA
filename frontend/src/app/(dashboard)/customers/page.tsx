"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });

  const fetchCustomers = () => {
    const token = getToken();
    if (!token) return;
    api.get<any>("/merchant/customers", token).then((data) => {
      setCustomers(data.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    await api.post("/merchant/customers", form, token);
    setShowCreate(false);
    setForm({ name: "", phone: "", email: "", notes: "" });
    fetchCustomers();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const token = getToken();
    if (!token) return;
    await api.put(`/merchant/customers/${editingCustomer.id}`, editingCustomer, token);
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("متأكد من حذف العميل؟")) return;
    const token = getToken();
    if (!token) return;
    await api.delete(`/merchant/customers/${id}`, token);
    fetchCustomers();
  };

  const downloadTemplate = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/merchant/customers/template`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "text/csv" },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "customers_template.csv"; a.click();
      window.URL.revokeObjectURL(url);
    } catch {}
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    const token = getToken();
    if (!token) return;
    const formData = new FormData();
    formData.append("file", importFile);
    try {
      const res = await fetch(`${API_BASE}/api/merchant/customers/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult(data.message);
        setImportFile(null);
        fetchCustomers();
      } else {
        setImportResult(data.message || "فشل الاستيراد");
      }
    } catch {
      setImportResult("حدث خطأ");
    }
    setImporting(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">العملاء</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">📥 استيراد Excel</button>
          <button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ عميل جديد</button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">إضافة عميل جديد</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input placeholder="اسم العميل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" required />
              <input placeholder="رقم الجوال" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" required dir="ltr" />
              <input placeholder="البريد الإلكتروني (اختياري)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" dir="ltr" />
              <textarea placeholder="ملاحظات (اختياري)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" rows={2} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">تعديل العميل</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input value={editingCustomer.name} onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" required />
              <input value={editingCustomer.phone} onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" required dir="ltr" />
              <input value={editingCustomer.email || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" dir="ltr" />
              <textarea value={editingCustomer.notes || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm" rows={2} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setEditingCustomer(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">📥 استيراد العملاء من Excel</h3>
            <div className="space-y-4">
              <button onClick={downloadTemplate} className="w-full rounded-lg border border-blue-300 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50">📥 تحميل القالب (CSV)</button>
              <div className="text-center text-xs text-gray-400">— أو —</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رفع ملف CSV أو XLSX</label>
                <input type="file" accept=".csv,.xlsx" onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600" />
                {importFile && <p className="text-xs text-gray-500 mt-1">{importFile.name}</p>}
              </div>
              {importResult && <div className={`rounded-lg p-3 text-sm ${importResult.includes("فشل") || importResult.includes("خطأ") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{importResult}</div>}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowImport(false); setImportFile(null); setImportResult(null); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">إغلاق</button>
                <button onClick={handleImport} disabled={!importFile || importing} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{importing ? "جاري..." : "استيراد"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customers Table */}
      {customers.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p className="text-lg">لا يوجد عملاء بعد</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-500">الاسم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">رقم الجوال</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">البريد</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600" dir="ltr">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-600" dir="ltr">{c.email || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditingCustomer(c)} className="text-blue-600 hover:underline text-xs">تعديل</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline text-xs">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
