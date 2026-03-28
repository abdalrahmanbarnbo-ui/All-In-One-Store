import { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, Trash2, Loader2, AlertCircle } from "lucide-react";

export default function AdminFeatured() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/feature-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch feature requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT" | "REMOVE") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/products/${id}/feature`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        fetchRequests(); // تحديث القائمة بعد نجاح العملية
      } else {
        alert("حدث خطأ أثناء تنفيذ الإجراء.");
      }
    } catch (error) {
      alert("تعذر الاتصال بالخادم.");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  const pendingRequests = products.filter(p => p.featureRequest === "PENDING");
  const featuredProducts = products.filter(p => p.isFeatured === true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">إدارة أفضل الخيارات (Best Choice)</h1>
      </div>

      {/* قسم الطلبات المعلقة */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4 text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500" /> طلبات قيد المراجعة ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length === 0 ? (
          <p className="text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">لا توجد طلبات جديدة.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map(product => (
              <div key={product.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <img src={product.images?.[0] || "https://placehold.co/100x100"} alt={product.title} className="w-16 h-16 rounded-lg object-cover bg-neutral-100" />
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white truncate">{product.title}</h3>
                    <p className="text-xs text-neutral-500">متجر: {product.vendor?.storeName}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => handleAction(product.id, "APPROVE")} className="flex-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <CheckCircle className="w-4 h-4" /> قبول
                  </button>
                  <button onClick={() => handleAction(product.id, "REJECT")} className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <XCircle className="w-4 h-4" /> رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* قسم المنتجات المميزة حالياً */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" /> المنتجات المميزة حالياً ({featuredProducts.length})
        </h2>
        
        {featuredProducts.length === 0 ? (
          <p className="text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">لا يوجد منتجات مميزة حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <div key={product.id} className="bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 end-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">Best Choice</div>
                <div className="flex items-center gap-4">
                  <img src={product.images?.[0] || "https://placehold.co/100x100"} alt={product.title} className="w-16 h-16 rounded-lg object-cover bg-neutral-100" />
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white truncate">{product.title}</h3>
                    <p className="text-xs text-neutral-500">متجر: {product.vendor?.storeName}</p>
                  </div>
                </div>
                <button onClick={() => handleAction(product.id, "REMOVE")} className="w-full bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors mt-auto border border-transparent hover:border-red-200 dark:hover:border-red-900/50">
                  <Trash2 className="w-4 h-4" /> إزالة التمييز
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}