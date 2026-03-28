import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../contexts/CartContext";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();

  // حالة السلة الفارغة
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-neutral-400" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">سلة المشتريات فارغة</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-center max-w-md">
          يبدو أنك لم تقم بإضافة أي منتجات إلى سلتك حتى الآن. اكتشف أحدث المنتجات وتسوق الآن!
        </p>
        <Link 
          to="/" 
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          العودة للتسوق <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">سلة المشتريات ({cartItems.length})</h1>

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
                  {/* صورة المنتج */}
                  <Link to={`/product/${item.id}`} className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </Link>

                  {/* تفاصيل المنتج */}
                  <div className="flex-1 text-center sm:text-right w-full">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-emerald-600 font-bold mt-2">{item.price} ل.س</p>
                  </div>

                  {/* التحكم بالكمية والحذف */}
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

            <Link to="/checkout" className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-4 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
              إتمام الطلب <ArrowRight className="w-5 h-5" />
            </Link>
            
            <p className="text-xs text-center text-neutral-500 mt-4">
              الأسعار تشمل ضريبة القيمة المضافة.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}