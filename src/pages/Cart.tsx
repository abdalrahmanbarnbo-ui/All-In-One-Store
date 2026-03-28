import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Trash2, ShoppingBag, ArrowRight, Package, MapPin, Star, Loader2, Clock } from "lucide-react";
import { useCart } from "../contexts/CartContext";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
      fetchMyOrders();
    }
  }, []);

  // جلب طلبات الزبون من السيرفر مع حماية إضافية
  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // 🛡️ حماية: التأكد من أن البيانات المستقبلة هي مصفوفة فعلاً
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      }
    } catch (err) {
      console.error("فشل في جلب الطلبات", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // شارات أنيقة لحالة الطلب
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'قيد المعالجة': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">قيد المعالجة ⏳</span>;
      case 'تم الشحن': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">في الطريق إليك 🚚</span>;
      case 'تم التوصيل': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">تم التوصيل ✅</span>;
      case 'ملغي': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">ملغي ❌</span>;
      default: return <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  // دالة إرسال تقييم المنتج
  const handleRateProduct = async (rawProductId: string, rating: number) => {
    const productId = rawProductId?.split('-')[0] || rawProductId; 
    setRatingLoading(productId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/products/${productId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ rating })
      });
      if (res.ok) alert("شكراً لتقييمك! ⭐");
      else alert("تعذر حفظ التقييم.");
    } catch (err) {
      alert("حدث خطأ في الاتصال.");
    } finally {
      setRatingLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20">
      
      {/* 🛒 --- القسم الأول: سلة المشتريات الحالية --- 🛒 */}
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-emerald-600" /> سلة المشتريات {(cartItems?.length || 0) > 0 && `(${cartItems.length})`}
      </h1>

      {(!cartItems || cartItems.length === 0) ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center px-4 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm py-16">
          <div className="w-24 h-24 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">سلة المشتريات فارغة</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-center max-w-md">
            يبدو أنك لم تقم بإضافة أي منتجات إلى سلتك حتى الآن. اكتشف أحدث المنتجات وتسوق الآن!
          </p>
          <Link 
            to="/" 
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md"
          >
            العودة للتسوق <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* قسم قائمة المنتجات */}
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {cartItems.map((item) => (
                  <motion.li 
                    key={item.id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 flex flex-col sm:flex-row items-center gap-6"
                  >
                    <Link to={`/product/${item.id}`} className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </Link>

                    <div className="flex-1 text-center sm:text-right w-full">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white hover:text-emerald-600 transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-emerald-600 font-bold mt-2">{item.price} ل.س</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                      <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden h-10">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 h-full transition-colors"
                        >-</button>
                        <span className="px-4 font-bold text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="px-3 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 h-full transition-colors disabled:opacity-50"
                        >+</button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="إزالة من السلة"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* قسم ملخص الطلب */}
          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 sticky top-24">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">ملخص الطلب</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{totalPrice} ل.س</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>تكلفة الشحن</span>
                  <span className="font-bold text-emerald-600">مجاناً</span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-neutral-900 dark:text-white">الإجمالي</span>
                    <span className="font-bold text-emerald-600">{totalPrice} ل.س</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md">
                إتمام الطلب <ArrowRight className="w-5 h-5" />
              </Link>
              
              <p className="text-xs text-center text-neutral-500 mt-4">
                الأسعار تشمل ضريبة القيمة المضافة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 📦 --- القسم الثاني: حالة الطلبات السابقة للمستخدم --- 📦 */}
      {currentUser && currentUser.role !== "ADMIN" && (
        <div className="mt-20 pt-10 border-t-2 border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-8">
            <Package className="w-8 h-8 text-emerald-600" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">حالة طلباتي السابقة</h2>
          </div>

          {loadingOrders ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
              <Clock className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
              <p className="text-neutral-500 font-medium">ليس لديك أي طلبات سابقة حتى الآن.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => {
                
                // 🛡️ حماية متقدمة: ضمان أن الطلبات قابلة للقراءة (JSON.parse) حتى لو كانت نصوصاً
                let safeOrderItems = [];
                try {
                  safeOrderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                } catch (e) {
                  safeOrderItems = [];
                }

                // 🛡️ حماية الـ ID
                const safeOrderId = order.id ? order.id.split('-')[0].toUpperCase() : 'UNKNOWN';

                return (
                  <div key={order.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* رأس الطلب */}
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                      <div>
                        <p className="text-xs text-neutral-500 font-bold mb-1">رقم الطلب</p>
                        <p className="font-mono text-sm font-black text-neutral-900 dark:text-white">#{safeOrderId}</p>
                      </div>
                      <div>{getStatusBadge(order.status || '')}</div>
                    </div>

                    {/* عنوان التوصيل */}
                    <div className="mb-4">
                      <p className="text-xs text-neutral-500 font-bold mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> التوصيل إلى</p>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{order.city} - {order.address}</p>
                    </div>

                    {/* المنتجات مع التقييم */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-3">المنتجات المشتراة:</p>
                      <div className="space-y-3">
                        {safeOrderItems.map((item: any, idx: number) => {
                          const safeProductId = item.id ? item.id.split('-')[0] : '';
                          
                          return (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                              
                              <Link to={`/product/${safeProductId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <img src={item.image || "https://placehold.co/100x100"} alt="product" className="w-12 h-12 rounded-lg object-cover border border-neutral-100" />
                                <div>
                                  <p className="text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[200px]">{item.title || "منتج غير معروف"}</p>
                                  <p className="text-xs text-emerald-600 font-bold mt-0.5">الكمية: {item.quantity || 1}</p>
                                </div>
                              </Link>

                              {/* 🌟 نظام التقييم (يظهر فقط إذا استلم الزبون الطلب) 🌟 */}
                              {order.status === "تم التوصيل" && (
                                <div className="flex flex-col items-start sm:items-end bg-amber-50 dark:bg-amber-900/10 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 mb-1">قيّم المنتج بعد تجربته</p>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        onClick={() => handleRateProduct(item.id || '', star)}
                                        disabled={ratingLoading === safeProductId}
                                        className="text-amber-200 dark:text-neutral-600 hover:text-amber-500 transition-colors focus:outline-none disabled:opacity-50"
                                        title={`تقييم بـ ${star} نجوم`}
                                      >
                                        <Star className="w-5 h-5 hover:fill-amber-500 transition-all hover:scale-110" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}