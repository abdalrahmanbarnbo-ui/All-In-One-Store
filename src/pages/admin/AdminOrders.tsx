import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
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
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders(); // تحديث الجدول بعد تغيير الحالة
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 text-center text-emerald-600 font-bold">جاري تحميل الطلبات...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-8 h-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">إدارة طلبات الزبائن</h1>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-medium text-right">رقم الطلب</th>
                <th className="px-6 py-4 font-medium text-right">الزبون والاتصال</th>
                <th className="px-6 py-4 font-medium text-right">العنوان</th>
                <th className="px-6 py-4 font-medium text-right">الإجمالي والدفع</th>
                <th className="px-6 py-4 font-medium text-right">تغيير الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-neutral-500">{order.id.split('-')[0].toUpperCase()}</td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-neutral-900 dark:text-white">{order.user?.name}</p>
                    <p className="text-neutral-500 text-xs mt-1">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-medium text-neutral-900 dark:text-white">{order.city}</p>
                    <p className="text-neutral-500 text-xs mt-1 truncate max-w-[150px]">{order.address}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-emerald-600">{order.total} ل.س</p>
                    <p className="text-neutral-500 text-xs mt-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded inline-block">{order.paymentMethod}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-bold border-2 outline-none transition-colors cursor-pointer ${
                        order.status === 'قيد المعالجة' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        order.status === 'تم الشحن' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        order.status === 'تم التوصيل' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <option value="قيد المعالجة">قيد المعالجة ⏳</option>
                      <option value="تم الشحن">تم الشحن 🚚</option>
                      <option value="تم التوصيل">تم التوصيل ✅</option>
                      <option value="ملغي">إلغاء الطلب ❌</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-medium">
                    لا توجد طلبات مسجلة حتى الآن.
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