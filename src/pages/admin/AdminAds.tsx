import { useState, useEffect } from "react";
import { Megaphone, CheckCircle, XCircle, Clock, Store, Loader2, Trash2 } from "lucide-react";

export default function AdminAds() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/ads", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setAds(await res.json());
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!window.confirm(`هل أنت متأكد أنك تريد ${newStatus === 'APPROVED' ? 'قبول' : 'رفض'} هذا الإعلان؟`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/ads/${id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchAds();
      } else {
        alert("فشل في تحديث حالة الإعلان.");
      }
    } catch (error) {
      alert("حدث خطأ في الاتصال.");
    }
  };

  // دالة الحذف الخاصة بالآدمن
  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الإعلان نهائياً من النظام؟")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/ads/${id}`, { 
        method: "DELETE", 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      if (res.ok) {
        fetchAds();
      } else {
        alert("فشل في حذف الإعلان.");
      }
    } catch (err) {
      alert("حدث خطأ أثناء الحذف.");
    }
  };

  // تحديث الشارات لتشمل حالة "منتهي الصلاحية"
  const getStatusBadge = (ad: any) => {
    if (ad.status === "APPROVED") {
      const isExpired = new Date(ad.expiresAt) < new Date();
      if (isExpired) {
        return <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> منتهي الصلاحية</span>;
      }
      return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> مقبول ونشط</span>;
    }
    if (ad.status === "REJECTED") {
      return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3"/> مرفوض</span>;
    }
    return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> بانتظار المراجعة</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-emerald-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold text-lg">جاري تحميل طلبات الإعلانات...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20">
      <div className="flex items-center gap-3 mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
          <Megaphone className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">إدارة الإعلانات</h1>
          <p className="text-neutral-500 mt-1">مراجعة وقبول الإعلانات المدفوعة من البائعين لعرضها في الصفحة الرئيسية.</p>
        </div>
      </div>

      {ads.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <Megaphone className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-700 dark:text-neutral-300">لا توجد طلبات إعلانية حالياً.</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow flex flex-col relative">
              
              {/* زر الحذف للآدمن */}
              <button 
                onClick={() => handleDelete(ad.id)} 
                className="absolute top-2 left-2 z-20 bg-white/90 dark:bg-neutral-900/90 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded-full shadow transition-colors" 
                title="حذف نهائي"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* صورة الإعلان */}
              <div className="w-full h-48 bg-neutral-100 dark:bg-neutral-800 relative">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 end-3 z-10">
                  {getStatusBadge(ad)}
                </div>
              </div>

              {/* تفاصيل الإعلان */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-3 line-clamp-1" title={ad.title}>
                  {ad.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  <Store className="w-4 h-4" />
                  <span className="font-medium">المتجر:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{ad.vendor?.storeName || "غير معروف"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">المدة المطلوبة:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{ad.duration} أيام</span>
                </div>

                {/* عرض تاريخ الانتهاء إذا كان الإعلان مقبولاً */}
                {ad.expiresAt && (
                  <div className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 p-2 rounded-lg font-bold mb-4 text-center">
                    تاريخ الانتهاء: {new Date(ad.expiresAt).toLocaleDateString('ar-EG')}
                  </div>
                )}

                {/* أزرار التحكم (تظهر فقط إذا كان الإعلان قيد الانتظار) */}
                <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800 flex gap-3">
                  {ad.status === "PENDING" ? (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(ad.id, "APPROVED")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> قبول
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(ad.id, "REJECTED")}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> رفض
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center text-sm font-bold text-neutral-500 bg-neutral-50 dark:bg-neutral-800 py-2 rounded-xl">
                      تمت مراجعة هذا الطلب
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}