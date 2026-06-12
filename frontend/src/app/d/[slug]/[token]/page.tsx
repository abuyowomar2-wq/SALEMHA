"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;

type DeliveryInfo = {
  store_name: string;
  store_logo: string | null;
  primary_color: string;
  verification_method: string;
  order_status: string;
  delivery_status: string;
};

type VerificationResult = {
  success: boolean;
  message: string;
  session_token?: string;
};

type ProductClaim = {
  success: boolean;
  message?: string;
  product_name?: string;
  product_type?: string;
  data?: string;
  instructions?: string | null;
};

type Step = "loading" | "error" | "form" | "verified" | "claimed";

export default function DeliveryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const token = params.token as string;

  const [step, setStep] = useState<Step>("loading");
  const [info, setInfo] = useState<DeliveryInfo | null>(null);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [product, setProduct] = useState<ProductClaim | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/delivery/${slug}/${token}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.message && !data.store_name) {
          setError(data.message);
          setStep("error");
          return;
        }
        setInfo(data);

        if (data.delivery_status === "product_viewed") {
          setStep("claimed");
        } else {
          setStep("form");
        }
      })
      .catch(() => {
        setError("حدث خطأ في الاتصال");
        setStep("error");
      });
  }, [slug, token]);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/delivery/${slug}/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          order_number: orderNumber,
          customer_phone: customerPhone,
        }),
      });

      const data: VerificationResult = await res.json();

      if (data.success && data.session_token) {
        setSessionToken(data.session_token);
        setStep("verified");
      } else {
        setError(data.message || "بيانات غير صحيحة");
      }
    } catch {
      setError("حدث خطأ في التحقق");
    } finally {
      setVerifying(false);
    }
  };

  const handleClaim = async () => {
    setVerifying(true);

    try {
      const res = await fetch(`${API_URL}/delivery/${slug}/${token}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ session_token: sessionToken }),
      });

      const data = await res.json();

      if (data.success) {
        setProduct(data);
        setStep("claimed");
      } else {
        setError(data.message || "تعذر عرض المنتج");
        setStep("form");
      }
    } catch {
      setError("حدث خطأ");
      setStep("form");
    } finally {
      setVerifying(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const primaryColor = info?.primary_color || "#1659D3";

  if (step === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div
          className="h-10 w-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${primaryColor}40`, borderTopColor: primaryColor }}
        />
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">تعذر الوصول</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header storeName={info?.store_name || ""} logo={info?.store_logo || null} color={primaryColor} />

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {step === "form" && (
            <VerificationForm
              orderNumber={orderNumber}
              onOrderNumberChange={setOrderNumber}
              customerPhone={customerPhone}
              onCustomerPhoneChange={setCustomerPhone}
              onSubmit={handleVerify}
              loading={verifying}
              error={error}
              color={primaryColor}
            />
          )}

          {step === "verified" && (
            <VerifiedCard
              storeName={info?.store_name || ""}
              onClaim={handleClaim}
              loading={verifying}
              color={primaryColor}
            />
          )}

          {step === "claimed" && !product && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">تم استلام المنتج مسبقًا</h2>
              <p className="text-gray-500 text-sm">تم تسليم المنتج الرقمي لهذا الطلب بالفعل</p>
            </div>
          )}

          {step === "claimed" && product && (
            <ProductCard
              product={product}
              onCopy={handleCopy}
              copied={copied}
              color={primaryColor}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Header({ storeName, logo, color }: { storeName: string; logo: string | null; color: string }) {
  return (
    <div className="bg-white border-b border-gray-200 py-4 px-4">
      <div className="max-w-md mx-auto flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: color }}
        >
          {logo ? (
            <img src={logo} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            (storeName || "س")[0]
          )}
        </div>
        <div>
          <h1 className="font-bold text-gray-900">{storeName || "استلام المنتج"}</h1>
          <p className="text-xs text-gray-400">صفحة تسليم المنتج الرقمي</p>
        </div>
      </div>
    </div>
  );
}

function VerificationForm({
  orderNumber,
  onOrderNumberChange,
  customerPhone,
  onCustomerPhoneChange,
  onSubmit,
  loading,
  error,
  color,
}: {
  orderNumber: string;
  onOrderNumberChange: (v: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  error: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🔐</div>
        <h2 className="text-lg font-bold text-gray-900">التحقق من الطلب</h2>
        <p className="text-sm text-gray-500 mt-1">أدخل بيانات الطلب للتحقق من هويتك</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            رقم الطلب
          </label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => onOrderNumberChange(e.target.value)}
            placeholder="مثال: 12345"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 outline-none text-center"
            style={{ borderColor: error ? "#dc2626" : "", "--tw-ring-color": color + "40" } as any}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            رقم الجوال
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            placeholder="05xxxxxxxx"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 outline-none text-center"
            dir="ltr"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-60"
          style={{ backgroundColor: color }}
        >
          {loading ? "جاري التحقق..." : "تحقق من الطلب"}
        </button>
      </form>
    </div>
  );
}

function VerifiedCard({
  storeName,
  onClaim,
  loading,
  color,
}: {
  storeName: string;
  onClaim: () => void;
  loading: boolean;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">تم التحقق بنجاح</h2>
      <p className="text-gray-500 text-sm mb-6">
        أنت عميل موثوق لدى {storeName}. اضغط الزر أدناه لعرض منتجك الرقمي.
      </p>
      <button
        onClick={onClaim}
        disabled={loading}
        className="w-full rounded-xl py-3.5 text-base font-bold text-white transition disabled:opacity-60"
        style={{ backgroundColor: color }}
      >
        {loading ? "جاري تجهيز المنتج..." : "عرض المنتج الرقمي 🎁"}
      </button>
    </div>
  );
}

function ProductCard({
  product,
  onCopy,
  copied,
  color,
}: {
  product: ProductClaim;
  onCopy: (text: string) => void;
  copied: boolean;
  color: string;
}) {
  const typeLabels: Record<string, string> = {
    code: "كود",
    file: "ملف",
    link: "رابط",
    credential: "بيانات دخول",
    key: "مفتاح تفعيل",
    other: "منتج رقمي",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div
        className="px-6 py-4 text-white text-center"
        style={{ backgroundColor: color }}
      >
        <div className="text-3xl mb-1">🎉</div>
        <h2 className="text-lg font-bold">تم تسليم المنتج بنجاح</h2>
      </div>

      <div className="p-5 space-y-4">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">{typeLabels[product.product_type || "other"] || "منتج رقمي"}</p>
          <p className="text-lg font-bold text-gray-900">{product.product_name}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">البيانات الرقمية</span>
            <button
              onClick={() => onCopy(product.data || "")}
              className="text-xs font-medium px-3 py-1 rounded-lg border transition"
              style={{ borderColor: color, color }}
            >
              {copied ? "تم النسخ ✓" : "نسخ"}
            </button>
          </div>
          <div
            className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 font-mono break-all text-left"
            dir="ltr"
          >
            {product.data}
          </div>
        </div>

        {product.instructions && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">تعليمات الاستخدام</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="py-4 px-4 text-center">
      <p className="text-xs text-gray-300">
        سلّمها - منصة تسليم المنتجات الرقمية
      </p>
    </div>
  );
}
