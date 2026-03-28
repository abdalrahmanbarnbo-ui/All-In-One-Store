import { useState, useEffect } from "react";
import { Package, Clock, Star, MapPin, Loader2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'قيد المعالجة': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">قيد المعالجة ⏳</span>;
      case 'تم الشحن': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">في الطريق إليك 🚚</span>;
      case 'تم التوصيل': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">تم التوصيل ✅</span>;
      case 'ملغي': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">ملغي ❌</span>;
      default: return <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  // دالة التقييم التفاعلية
  const handleRateProduct = async (rawProductId: string, rating: number) => {
    // استخراج ID المنتج الأصلي (لأن الـ ID في السلة قد يحتوي على القياس مثل 123-XL)
    const productId = rawProductId.split('-')[0]; 
    setRatingLoading(productId);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/products/${productId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ rating })
      });

      if (res.ok) {
        alert("شكراً لتقييمك! ⭐");
      } else {
        alert("تعذر حفظ التقييم.");
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال.");
    } finally {
      setRatingLoading(null);
    }
  };

  if (loading) return <div className="p-20 text-center text-emerald-600 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mb-20">
      <div className="flex items-center gap-3 mb-8 border-b border-neutral-200 pb-4">
        <Package className="w-8 h-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">مشترياتي السابقة</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200">
          <Clock className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
          <p className="text-lg font-bold text-neutral-600">لم تقم بأي طلبات بعد.</p>
          <Link to="/" className="mt-4 inline-block bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700">تصفح المنتجات</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <p className="text-xs text-neutral-500 font-bold mb-1">رقم الطلب</p>
                  <p className="font-mono text-sm font-black text-neutral-900 dark:text-white">#{order.id.split('-')[0].toUpperCase()}</p>
                </div>
                <div>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-neutral-500 font-bold mb-2 flex items-center gap-1"><MapPin className="w-4 h-4"/> عنوان التوصيل</p>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{order.city} - {order.address}</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4">
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-3">المنتجات التي طلبتها:</p>
                <div className="space-y-3">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700">
                      
                      <div className="flex items-center gap-3">
                        <img src={item.image || "https://placehold.co/100x100"} alt="product" className="w-12 h-12 rounded-md object-cover border" />
                        <div>
                          <p className="text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[200px]">{item.title}</p>
                          <p className="text-xs text-emerald-600 font-bold">الكمية: {item.quantity}</p>
                        </div>
                      </div>

                      {/* 🌟 نظام التقييم يظهر فقط إذا تم التوصيل 🌟 */}
                      {order.status === "تم التوصيل" && (
                        <div className="flex flex-col items-start sm:items-end">
                          <p className="text-[10px] font-bold text-neutral-500 mb-1">ما رأيك بالمنتج؟</p>
                          <div className="flex items-center gap-1 group">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRateProduct(item.id, star)}
                                disabled={ratingLoading === item.id.split('-')[0]}
                                className="text-neutral-300 hover:text-amber-500 transition-colors focus:outline-none"
                                title={`تقييم بـ ${star} نجوم`}
                              >
                                <Star className="w-5 h-5 hover:fill-amber-500" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}