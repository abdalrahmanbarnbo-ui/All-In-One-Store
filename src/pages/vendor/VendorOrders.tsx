import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";

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
        fetchOrders(); // تحديث الجدول فوراً بعد تغيير الحالة
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

      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
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
                  
                  {/* رقم الطلب */}
                  <td className="px-6 py-4 font-mono text-xs text-neutral-500 font-bold">
                    #{order.id.split('-')[0].toUpperCase()}
                  </td>
                  
                  {/* بيانات الزبون */}
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-neutral-900 dark:text-white">{order.user?.name || "زبون"}</p>
                    <p className="text-neutral-500 text-xs mt-1" dir="ltr">{order.phone}</p>
                  </td>
                  
                  {/* العنوان */}
                  <td className="px-6 py-4 text-right">
                    <p className="font-medium text-neutral-900 dark:text-white">{order.city}</p>
                    <p className="text-neutral-500 text-xs mt-1 max-w-[150px] truncate" title={order.address}>
                      {order.address}
                    </p>
                  </td>
                  
                  {/* المنتجات المطلوبة من هذا المتجر */}
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
                  
                  {/* تغيير الحالة */}
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
              
              {/* حالة عدم وجود طلبات */}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-neutral-500">
                      <Clock className="w-12 h-12 mb-4 opacity-50" />
                      <p className="font-medium text-lg">لم تستقبل أي طلبات حتى الآن.</p>
                      <p className="text-sm mt-1">عندما يقوم الزبائن بشراء منتجاتك، ستظهر هنا.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}