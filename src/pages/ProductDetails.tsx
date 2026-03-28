import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingCart, ShieldCheck, Truck, RefreshCcw, Loader2, AlertCircle, Ruler, X, User, Tag, Store, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../contexts/CartContext";

// --- بيانات جداول القياسات العالمية ---
const SIZE_CHARTS: Record<string, { headers: string[], rows: string[][] }> = {
  "ملابس نسائية": {
    headers: ["القياس", "US", "EU", "الصدر (سم)", "الخصر (سم)", "الورك (سم)"],
    rows: [
      ["XS", "2", "34", "82", "62", "90"],
      ["S", "4", "36", "86", "66", "94"],
      ["M", "8", "38", "90", "70", "98"],
      ["L", "12", "40", "96", "76", "104"],
      ["XL", "16", "42", "102", "82", "110"],
    ]
  },
  "ملابس رجالية": {
    headers: ["القياس", "US/UK", "EU", "الصدر (سم)", "الخصر (سم)", "طول الكم (سم)"],
    rows: [
      ["S", "36", "46", "92", "78", "62"],
      ["M", "38", "48", "96", "82", "63"],
      ["L", "40", "50", "100", "86", "64"],
      ["XL", "42", "52", "106", "92", "65"],
      ["XXL", "44", "54", "112", "98", "66"],
    ]
  },
  "أطفال": {
    headers: ["العمر", "US Size", "الصدر (سم)", "طول البلوزة (سم)", "طول البنطال (سم)"],
    rows: [
      ["0-3 أشهر", "60", "44", "28", "32"],
      ["3-6 أشهر", "70", "46", "30", "36"],
      ["6-12 شهر", "80", "48", "33", "40"],
      ["1-2 سنة", "90", "52", "36", "46"],
      ["3-4 سنوات", "100", "56", "40", "54"],
      ["5-6 سنوات", "110", "60", "44", "62"],
    ]
  }
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>(""); 
  
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [sizeError, setSizeError] = useState("");
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false); 
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (data.images && data.images.length > 0) {
            setSelectedImage(data.images[0]);
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const checkIsStoreOpen = () => {
    if (!product || !product.vendor) return false;
    if (product.vendor.isManuallyClosed) return false;
    
    const daysArabic = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const currentDay = daysArabic[new Date().getDay()];
    if (product.vendor.daysOff?.includes(currentDay)) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const openTime = product.vendor.openTime || "00:00";
    const closeTime = product.vendor.closeTime || "23:59";

    return currentTime >= openTime && currentTime <= closeTime;
  };

  const isStoreCurrentlyOpen = checkIsStoreOpen();
  const currentMaxStock = selectedSize ? selectedSize.stock : (product?.sizes?.length > 0 ? 0 : product?.stock);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError("يرجى تحديد القياس المطلوب أولاً.");
      return;
    }

    setIsAdding(true);
    setSizeError("");
    
    const cartItemId = selectedSize ? `${product.id}-${selectedSize.size}` : product.id;
    const cartItemTitle = selectedSize ? `${product.title} - قياس (${selectedSize.size})` : product.title;

    const finalPrice = product.discountedPrice ? product.discountedPrice : product.price;

    addToCart({
      id: cartItemId,
      title: cartItemTitle,
      price: finalPrice, 
      image: selectedImage || "https://placehold.co/800x800",
      quantity: quantity,
      stock: currentMaxStock
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 400); 
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-emerald-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold text-lg">جاري تحميل تفاصيل المنتج...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* قسم معرض الصور */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-white border border-neutral-200 dark:border-neutral-700 relative"
          >
            {/* 🌟 شارة Best Choice 🌟 */}
            {product.isFeatured && (
              <div className="absolute top-4 start-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg z-10 animate-in fade-in zoom-in duration-300">
                <Star className="w-4 h-4 fill-white" />
                <span>Best Choice</span>
              </div>
            )}
            <img 
              src={selectedImage || "https://placehold.co/800x800?text=No+Image"} 
              alt={product.title} 
              className="w-full h-full object-contain p-4"
            />
          </motion.div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 bg-white transition-all ${
                    selectedImage === img ? "border-emerald-600 opacity-100 p-0.5" : "border-transparent opacity-60 hover:opacity-100 p-1 border-neutral-200"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* قسم تفاصيل المنتج */}
        <div className="flex flex-col">
          <p className="text-emerald-600 font-bold mb-2 uppercase tracking-wider text-sm">{product.category}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight">
            {product.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* 🌟 رابط المتجر 🌟 */}
            {product.vendorId && (
              <Link 
                to={`/store/${product.vendorId}`} 
                className="flex items-center gap-1.5 text-sm font-bold text-neutral-700 bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                title="اضغط لزيارة متجر البائع"
              >
                <Store className="w-4 h-4" /> 
                {product.vendor?.storeName || "متجر"}
              </Link>
            )}
            
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
              isStoreCurrentlyOpen 
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                : "bg-red-100 text-red-700 border border-red-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isStoreCurrentlyOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
              {isStoreCurrentlyOpen ? "مفتوح الآن" : "المتجر مغلق حالياً"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            {product.discountedPrice ? (
              <>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {product.discountedPrice} ل.س
                </span>
                <span className="text-xl font-medium text-neutral-400 line-through">
                  {product.price} ل.س
                </span>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Tag className="w-4 h-4" /> عرض خاص
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                {product.price} ل.س
              </span>
            )}
          </div>

          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8 whitespace-pre-line">
            {product.description}
          </p>

          <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800 mb-8"></div>

          {/* قسم اختيار القياسات */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <label className="block text-sm font-bold text-neutral-900 dark:text-white">القياس</label>
                  {SIZE_CHARTS[product.category] && (
                    <button 
                      onClick={() => setIsSizeChartOpen(true)}
                      className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors"
                    >
                      <Ruler className="w-4 h-4" /> دليل القياسات
                    </button>
                  )}
                </div>
                {selectedSize && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    متوفر {selectedSize.stock} قطع
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((s: any, idx: number) => {
                  const isOutOfStock = s.stock === 0;
                  const isSelected = selectedSize?.size === s.size;
                  
                  return (
                    <button
                      key={idx}
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedSize(s);
                        setQuantity(1);
                        setSizeError("");
                      }}
                      className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' 
                          : isOutOfStock 
                            ? 'border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed opacity-60' 
                            : 'border-neutral-300 hover:border-emerald-600 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
              
              {sizeError && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-4 h-4" /> {sizeError}
                </p>
              )}
            </div>
          )}

          {/* إضافة للسلة فقط للزبائن */}
          {currentUser?.role === "CUSTOMER" ? (
            <div className="flex items-end gap-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">الكمية</label>
                <div className="flex items-center border-2 border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden h-12">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 h-full transition-colors"
                  >-</button>
                  <span className="px-4 font-bold min-w-[3rem] text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(currentMaxStock, q + 1))}
                    disabled={quantity >= currentMaxStock || (!selectedSize && product.sizes?.length > 0)}
                    className="px-4 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 h-full transition-colors disabled:opacity-50"
                  >+</button>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={currentMaxStock === 0 || isAdding || !isStoreCurrentlyOpen}
                className="flex-1 h-12 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                {!isStoreCurrentlyOpen ? "المتجر مغلق حالياً" : currentMaxStock === 0 && selectedSize ? "نفدت الكمية" : isAdding ? "جاري الإضافة..." : "إضافة إلى السلة"}
              </button>
            </div>
          ) : !currentUser ? (
            <div className="mb-8">
              <Link 
                to="/login"
                className="w-full h-12 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <User className="w-5 h-5" /> يرجى تسجيل الدخول كزبون لتتمكن من الشراء
              </Link>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-auto">
            <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <span>دفع آمن 100%</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
              <Truck className="w-6 h-6 text-emerald-600" />
              <span>توصيل لجميع المحافظات</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
              <RefreshCcw className="w-6 h-6 text-emerald-600" />
              <span>استرجاع خلال 14 يوم</span>
            </div>
          </div>

        </div>
      </div>

      {/* نافذة دليل القياسات */}
      <AnimatePresence>
        {isSizeChartOpen && SIZE_CHARTS[product.category] && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-emerald-600" /> دليل قياسات ({product.category})
                </h3>
                <button onClick={() => setIsSizeChartOpen(false)} className="text-neutral-500 hover:bg-neutral-100 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-center text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 dark:bg-neutral-800">
                      {SIZE_CHARTS[product.category].headers.map((header, idx) => (
                        <th key={idx} className="p-3 border border-neutral-200 dark:border-neutral-700 font-bold text-neutral-900 dark:text-white">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CHARTS[product.category].rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className={`p-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 ${cellIdx === 0 ? "font-bold" : ""}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}