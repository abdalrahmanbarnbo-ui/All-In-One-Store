import { useState, useEffect } from "react";
import { Package, Clock, AlertCircle, User, MapPin, ShoppingBag } from "lucide-react";

export default function VendorOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/vendor/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setError("فشل في جلب الطلبات.");
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ في الاتصال بالسيرفر.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/vendor/orders/${orderId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchOrders(); // تحديث القائمة فوراً بعد تغيير الحالة
      } else {
        alert("فشل في تحديث حالة الطلب.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الاتصال.");
    }
  };

  // دالة مساعدة لاختيار لون منسدل الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'قيد المعالجة': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'تم الشحن': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'تم التوصيل': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ملغي': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-emerald-600 font-bold">جاري تحميل طلبات الزبائن...</div>;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
      
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-8 h-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">طلبات الزبائن</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-16 text-center">
          <div className="flex flex-col items-center justify-center text-neutral-500">
            <Clock className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium text-lg">لم تستقبل أي طلبات حتى الآن.</p>
            <p className="text-sm mt-1">عندما يقوم الزبائن بشراء منتجاتك، ستظهر هنا.</p>
          </div>
        </div>
      ) : (
        <>
          {/* 📱 عرض الموبايل: بطاقات أنيقة (يظهر فقط على الشاشات الصغيرة) 📱 */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm flex flex-col gap-4">
                
                {/* الهيدر: رقم الطلب وحالته */}
                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <span className="font-mono text-sm font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                    #{order.id.split('-')[0].toUpperCase()}
                  </span>
                  <select 
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none transition-colors cursor-pointer ${getStatusColor(order.status)}`}
                  >
                    <option value="قيد المعالجة">قيد المعالجة ⏳</option>
                    <option value="تم الشحن">تم الشحن 🚚</option>
                    <option value="تم التوصيل">تم التوصيل ✅</option>
                    <option value="ملغي">إلغاء ❌</option>
                  </select>
                </div>

                {/* معلومات الزبون والتوصيل (Grid) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-neutral-500 text-xs flex items-center gap-1 mb-1 font-bold"><User className="w-3.5 h-3.5"/> الزبون</p>
                    <p className="font-bold text-neutral-900 dark:text-white text-sm">{order.user?.name || "زبون"}</p>
                    <p className="text-neutral-500 text-xs mt-0.5" dir="ltr">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs flex items-center gap-1 mb-1 font-bold"><MapPin className="w-3.5 h-3.5"/> التوصيل</p>
                    <p className="font-bold text-neutral-900 dark:text-white text-sm">{order.city}</p>
                    <p className="text-neutral-500 text-xs mt-0.5 truncate" title={order.address}>{order.address}</p>
                  </div>
                </div>

                {/* المنتجات المطلوبة */}
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3 mt-1 border border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600"/> المنتجات المطلوبة
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="text-xs bg-white dark:bg-neutral-900 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-between shadow-sm">
                        <span className="font-medium truncate pe-2">{item.title}</span>
                        <span className="font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded shrink-0">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* 💻 عرض الكمبيوتر: الجدول الكلاسيكي (يظهر فقط على الشاشات المتوسطة والكبيرة) 💻 */}
          <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                  <tr>
                    <th className="px-6 py-4 font-bold text-right">رقم الطلب</th>
                    <th className="px-6 py-4 font-bold text-right">الزبون والاتصال</th>
                    <th className="px-6 py-4 font-bold text-right">تفاصيل التوصيل</th>
                    <th className="px-6 py-4 font-bold text-right">المنتجات (خاصتك)</th>
                    <th className="px-6 py-4 font-bold text-right">حالة الطلب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      
                      <td className="px-6 py-4 font-mono text-xs text-neutral-500 font-bold">
                        #{order.id.split('-')[0].toUpperCase()}
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-neutral-900 dark:text-white">{order.user?.name || "زبون"}</p>
                        <p className="text-neutral-500 text-xs mt-1" dir="ltr">{order.phone}</p>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <p className="font-medium text-neutral-900 dark:text-white">{order.city}</p>
                        <p className="text-neutral-500 text-xs mt-1 max-w-[150px] truncate" title={order.address}>
                          {order.address}
                        </p>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="space-y-2">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="text-xs bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                              <span className="font-medium truncate max-w-[120px]">{item.title}</span>
                              <span className="font-bold text-emerald-600 mx-2">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 outline-none transition-colors cursor-pointer w-full ${getStatusColor(order.status)}`}
                        >
                          <option value="قيد المعالجة">قيد المعالجة ⏳</option>
                          <option value="تم الشحن">تم الشحن 🚚</option>
                          <option value="تم التوصيل">تم التوصيل ✅</option>
                          <option value="ملغي">إلغاء الطلب ❌</option>
                        </select>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}