import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { MapPin, CreditCard, Banknote, Smartphone, Wallet, Loader2, Copy, CheckCircle2 } from "lucide-react";

export default function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingDetails, setShippingDetails] = useState({ city: "دمشق", address: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("COD"); 
  const [receiptRef, setReceiptRef] = useState(""); // حالة جديدة لحفظ رقم الإشعار
  const [copied, setCopied] = useState(false); // حالة لتأثير نسخ الرمز

  useEffect(() => {
    if (cartItems.length === 0 && !isSubmitting) navigate('/cart');
  }, [cartItems, navigate, isSubmitting]);

  // دالة لنسخ رقم المحفظة الطويل بضغطة زر
  const handleCopyWallet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) return alert("سلتك فارغة!");
    if (!shippingDetails.address || !shippingDetails.phone) return alert("يرجى تعبئة تفاصيل التوصيل.");
    
    // التحقق من إدخال رقم الإشعار إذا كان الدفع إلكترونياً
    if (paymentMethod !== "COD" && !receiptRef.trim()) {
      return alert("يرجى إدخال رقم إشعار التحويل لتأكيد دفعك.");
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("يرجى تسجيل الدخول مجدداً.");
        navigate("/login");
        return;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          items: cartItems,
          total: totalPrice,
          paymentMethod: paymentMethod,
          city: shippingDetails.city,
          address: shippingDetails.address,
          phone: shippingDetails.phone,
          receiptRef: receiptRef // إرسال رقم الإشعار للسيرفر
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (clearCart) clearCart(); 
        alert("تم استلام طلبك بنجاح! سيتم مراجعة الدفعة وتجهيز الطلب.");
        navigate("/"); 
      } else {
        alert(data.error || "حدث خطأ أثناء معالجة الطلب.");
      }
    } catch (error) {
      alert("تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20">
      <h1 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-white">إتمام الطلب (Checkout)</h1>
      
      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* العمود الأيمن: التفاصيل وطرق الدفع */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* قسم تفاصيل التوصيل */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-600">
              <MapPin className="w-6 h-6" /> تفاصيل التوصيل
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">المدينة</label>
                <select value={shippingDetails.city} onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="دمشق">دمشق</option>
                  <option value="حلب">حلب</option>
                  <option value="حمص">حمص</option>
                  <option value="اللاذقية">اللاذقية</option>
                  <option value="حماة">حماة</option>
                  <option value="طرطوس">طرطوس</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">رقم الهاتف</label>
                <input type="tel" required placeholder="09xxxxxxxx" dir="ltr" value={shippingDetails.phone} onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500 text-right" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">العنوان التفصيلي</label>
                <textarea required rows={2} placeholder="المنطقة، الشارع، البناء، الطابق..." value={shippingDetails.address} onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>
          
          {/* قسم طرق الدفع */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold mb-6 text-neutral-900 dark:text-white">طريقة الدفع</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* خيارات الدفع */}
              <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'COD' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-neutral-200 dark:border-neutral-700 hover:border-emerald-400'}`}>
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                <div className={`p-3 rounded-lg ${paymentMethod === 'COD' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}><Banknote className="w-6 h-6" /></div>
                <div><h3 className="font-bold text-neutral-900 dark:text-white">نقدي عند الوصول</h3><p className="text-xs text-neutral-500">ادفع نقداً عند استلام طلبك</p></div>
              </label>

              <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'SyriatelCash' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-neutral-200 dark:border-neutral-700 hover:border-emerald-400'}`}>
                <input type="radio" name="payment" value="SyriatelCash" checked={paymentMethod === 'SyriatelCash'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                <div className={`p-3 rounded-lg ${paymentMethod === 'SyriatelCash' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}><Smartphone className="w-6 h-6" /></div>
                <div><h3 className="font-bold text-neutral-900 dark:text-white">سيريتل كاش</h3><p className="text-xs text-neutral-500">الدفع عبر تطبيق أقرب إليك</p></div>
              </label>

              <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'MTNCash' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-neutral-200 dark:border-neutral-700 hover:border-emerald-400'}`}>
                <input type="radio" name="payment" value="MTNCash" checked={paymentMethod === 'MTNCash'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                <div className={`p-3 rounded-lg ${paymentMethod === 'MTNCash' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}><Smartphone className="w-6 h-6" /></div>
                <div><h3 className="font-bold text-neutral-900 dark:text-white">MTN Cash</h3><p className="text-xs text-neutral-500">الدفع عبر تطبيق كاش موبايل</p></div>
              </label>

              <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'ChamCash' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-neutral-200 dark:border-neutral-700 hover:border-emerald-400'}`}>
                <input type="radio" name="payment" value="ChamCash" checked={paymentMethod === 'ChamCash'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                <div className={`p-3 rounded-lg ${paymentMethod === 'ChamCash' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}><Wallet className="w-6 h-6" /></div>
                <div><h3 className="font-bold text-neutral-900 dark:text-white">شام كاش</h3><p className="text-xs text-neutral-500">الدفع عبر محفظة شام كاش</p></div>
              </label>

              <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'BankCard' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-neutral-200 dark:border-neutral-700 hover:border-emerald-400'}`}>
                <input type="radio" name="payment" value="BankCard" checked={paymentMethod === 'BankCard'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                <div className={`p-3 rounded-lg ${paymentMethod === 'BankCard' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}><CreditCard className="w-6 h-6" /></div>
                <div><h3 className="font-bold text-neutral-900 dark:text-white">بطاقة بنكية</h3><p className="text-xs text-neutral-500">الدفع الإلكتروني السوري (ميزة)</p></div>
              </label>
            </div>

            {/* 🌟 واجهة تعليمات الدفع التفاعلية (تظهر فقط إذا لم يكن الدفع عند الاستلام) 🌟 */}
            {paymentMethod !== 'COD' && (
              <div className="mt-8 p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700 animate-in fade-in slide-in-from-top-4 duration-500">
                <h3 className="font-bold text-lg mb-4 text-neutral-900 dark:text-white text-center">تعليمات الدفع</h3>
                
                {/* تعليمات شام كاش */}
                {paymentMethod === 'ChamCash' && (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-neutral-200">
                      <img src="/chamcash-qr.jpg" alt="ChamCash QR" className="w-48 h-48 object-contain rounded-xl" />
                    </div>
                    <div className="text-center w-full max-w-md">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">امسح الباركود، أو انسخ رمز المحفظة أدناه لتحويل مبلغ <span className="font-bold text-emerald-600">{totalPrice} ل.س</span></p>
                      
                      <button 
                        type="button"
                        onClick={() => handleCopyWallet("e15417b43c4a2cde43985781f9dce738")}
                        className="w-full flex items-center justify-between p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-emerald-500 transition-colors group"
                      >
                        <span className="font-mono text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-200 truncate" dir="ltr">e15417b43c4a2cde43985781f9dce738</span>
                        {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-neutral-400 group-hover:text-emerald-500" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* تعليمات سيريتل كاش */}
                {paymentMethod === 'SyriatelCash' && (
                  <div className="text-center">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">يرجى تحويل مبلغ <span className="font-bold text-emerald-600">{totalPrice} ل.س</span> إلى الرقم التالي:</p>
                    <div className="font-mono text-2xl font-bold tracking-widest text-neutral-900 dark:text-white my-4 p-4 bg-white dark:bg-neutral-900 border rounded-xl w-fit mx-auto shadow-sm">0933 333 333</div>
                  </div>
                )}

                {/* تعليمات إم تي إن كاش */}
                {paymentMethod === 'MTNCash' && (
                  <div className="text-center">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">يرجى تحويل مبلغ <span className="font-bold text-emerald-600">{totalPrice} ل.س</span> إلى الرقم التالي:</p>
                    <div className="font-mono text-2xl font-bold tracking-widest text-neutral-900 dark:text-white my-4 p-4 bg-white dark:bg-neutral-900 border rounded-xl w-fit mx-auto shadow-sm">0944 444 444</div>
                  </div>
                )}

                {/* تعليمات البطاقة البنكية */}
                {paymentMethod === 'BankCard' && (
                  <div className="text-center">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">يرجى تحويل مبلغ <span className="font-bold text-emerald-600">{totalPrice} ل.س</span> إلى الحساب البنكي التالي:</p>
                    <div className="font-mono text-xl font-bold text-neutral-900 dark:text-white my-4 p-4 bg-white dark:bg-neutral-900 border rounded-xl w-fit mx-auto shadow-sm">1234-5678-9012-3456</div>
                  </div>
                )}

                {/* حقل إدخال رقم الإشعار (المشترك لجميع طرق الدفع الإلكتروني) */}
                <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                  <label className="block text-sm font-bold text-emerald-700 dark:text-emerald-500 mb-2">رقم إشعار التحويل (مطلوب لتأكيد الدفع)</label>
                  <input 
                    type="text" 
                    required={paymentMethod !== 'COD'} 
                    placeholder="أدخل رقم العملية أو إشعار التحويل هنا..." 
                    value={receiptRef} 
                    onChange={(e) => setReceiptRef(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                  <p className="text-xs text-neutral-500 mt-2">* لن يتم معالجة طلبك إلا بعد التأكد من مطابقة رقم الإشعار.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* العمود الأيسر: الفاتورة */}
        <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-4">الفاتورة النهائية</h2>
          
          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
            {cartItems.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-neutral-600 dark:text-neutral-400 truncate pe-4">{item.quantity}x {item.title}</span>
                <span className="font-bold whitespace-nowrap">{item.price * item.quantity} ل.س</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-neutral-200 dark:border-neutral-800 pt-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">المجموع الفرعي</span>
              <span className="font-bold">{totalPrice} ل.س</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">رسوم التوصيل</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">تُحدد لاحقاً</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-black pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <span>الإجمالي المطلوب</span>
            <span className="text-emerald-600">{totalPrice} ل.س</span>
          </div>
           
           <button 
             type="submit" 
             disabled={isSubmitting || cartItems.length === 0}
             className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-8 transition-colors disabled:opacity-50"
           >
             {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
             {isSubmitting ? "جاري تأكيد الطلب..." : "تأكيد الطلب الآن"}
           </button>
           
           <p className="text-[10px] text-center text-neutral-400 mt-4">بالضغط على تأكيد الطلب، أنت توافق على شروط وأحكام المتجر.</p>
        </div>

      </form>
    </div>
  );
}