import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { PackageOpen, Loader2, ChevronLeft, ChevronRight, TrendingUp, Tag, Store } from "lucide-react";

const CATEGORIES = [
  { id: "women", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop" },
  { id: "men", image: "https://images.unsplash.com/photo-1490578474895-699bc4e3f444?q=80&w=400&auto=format&fit=crop" },
  { id: "kids", image: "https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=400&auto=format&fit=crop" },
  { id: "beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop" },
  { id: "home", image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=400&auto=format&fit=crop" },
  { id: "electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=400&auto=format&fit=crop" },
];

export default function Home() {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // حالات شريط الإعلانات العرضية (اللافتات)
  const [ads, setAds] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {}
    }
  }, []);

  // جلب المنتجات المميزة (Best Choice) والإعلانات النشطة
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. جلب الإعلانات العرضية (البنرات)
        const adsRes = await fetch("/api/ads/active");
        if (adsRes.ok) setAds(await adsRes.json());

        // 2. جلب المنتجات المميزة فقط (بإرسال featured=true)
        const productsRes = await fetch("/api/products?featured=true");
        if (productsRes.ok) setProducts(await productsRes.json());
      } catch (error) {
        console.error("فشل في جلب البيانات:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // تحريك شريط الإعلانات تلقائياً
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); 
    const finalPrice = product.discountedPrice ? product.discountedPrice : product.price;

    addToCart({
      id: product.id,
      title: product.title,
      price: finalPrice,
      image: product.images?.[0] || "https://placehold.co/400x500",
      quantity: 1,
      stock: product.stock
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20">
      
      {/* 🚀 1. شريط الإعلانات المدفوعة (Sponsored Banner Ads) 🚀 */}
      {ads.length > 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <Link 
            to={`/store/${ads[currentAdIndex].vendorId}`} 
            className="block relative w-full h-56 md:h-80 rounded-[2rem] overflow-hidden shadow-xl group cursor-pointer bg-violet-50"
          >
            
            {/* طبقة التظليل البنفسجية المتدرجة */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-600/90 to-transparent rtl:bg-gradient-to-l z-10 pointer-events-none"></div>

            {/* المحتوى النصي (ثابت في جهة واحدة) */}
            <div className="absolute top-0 start-0 h-full flex flex-col justify-center px-8 md:px-16 z-20 text-white w-full md:w-1/2">
              <motion.div
                key={`text-${currentAdIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-4xl md:text-6xl font-black italic tracking-wider flex items-center gap-2 drop-shadow-lg">
                  <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-violet-200" />
                  TRENDING
                </h2>
                <h3 className="text-2xl md:text-4xl font-black italic tracking-wider mt-1 drop-shadow-lg">
                  NOW
                </h3>
                
                <p className="font-medium text-violet-200 mt-3 text-sm md:text-lg drop-shadow-md">
                  # Discover The Best
                </p>

                {/* شارة اسم المتجر الزجاجية */}
                <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/30 text-white px-5 py-2.5 rounded-2xl shadow-lg w-fit">
                  <Store className="w-6 h-6 text-violet-200" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-violet-200 leading-none">برعاية المتجر المميز</span>
                    <span className="font-bold text-sm md:text-base leading-tight mt-1">
                      {ads[currentAdIndex].vendor?.storeName || "جارِ التحميل"}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* صورة الإعلان (تتلاشى تحت التدرج) */}
            <AnimatePresence mode="wait">
              <motion.img
                key={`img-${currentAdIndex}`}
                initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                src={ads[currentAdIndex].imageUrl}
                alt={ads[currentAdIndex].title}
                className="absolute inset-y-0 end-0 w-full md:w-2/3 h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
              />
            </AnimatePresence>

            {/* أزرار التنقل - تم وضع e.preventDefault لمنع الانتقال لصفحة المتجر عند تقليب الصور */}
            {ads.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.preventDefault(); setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length); }} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md z-30 shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); setCurrentAdIndex((prev) => (prev + 1) % ads.length); }} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md z-30 shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* نقاط التقليب (Dots) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                  {ads.map((_, idx) => (
                    <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentAdIndex ? "w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "w-2 bg-white/40 hover:bg-white/60"}`} />
                  ))}
                </div>
              </>
            )}
          </Link>
        </div>
      ) : (
        /* الغلاف الافتراضي إذا لم يكن هناك إعلانات مدفوعة */
        <div className="relative w-full h-[60vh] bg-neutral-900 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920&auto=format&fit=crop" alt="Hero" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center z-10">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">{t("heroTitle") || "SUMMER SALE"}</h1>
            <p className="text-lg md:text-2xl mb-8 font-medium">{t("heroSub") || "Up to 70% off across all categories"}</p>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">{t("shopByCategory") || "Shop by Category"}</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat, idx) => (
            <Link key={idx} to={`/category/${cat.id}`} className="flex flex-col items-center min-w-[100px] group">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-emerald-500 transition-colors">
                <img src={cat.image} alt={t(cat.id)} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{t(cat.id) || cat.id}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 🚀 2. قسم Best Choice (المنتجات المدفوعة / المعتمدة) 🚀 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-emerald-600" /> {t("bestChoice") || "Best Choice"}
          </h2>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium">جاري جلب المنتجات المميزة...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <PackageOpen className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">لا توجد منتجات في قائمة Best Choice حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div key={product.id} whileHover={{ y: -5 }} className="group cursor-pointer">
                <Link to={`/product/${product.id}`} className="block h-full">
                  
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0] : "https://placehold.co/400x500?text=No+Image"} 
                      alt={product.title} 
                      className="w-full h-full object-contain p-2 bg-white group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {product.stock === 0 && (
                      <div className="absolute top-2 start-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
                        نفدت الكمية
                      </div>
                    )}

                    {product.discountedPrice && product.stock > 0 && (
                      <div className="absolute top-2 end-2 bg-red-500 text-white text-[10px] sm:text-xs font-black px-2 py-1 rounded shadow-sm z-10 animate-pulse">
                        خصم!
                      </div>
                    )}

                    {/* الإضافة السريعة تظهر للزبون فقط وتستخدم دالة addToCart الحقيقية */}
                    {(currentUser?.role === "USER" || currentUser?.role === "CUSTOMER") && (
                      <div className="absolute bottom-0 start-0 end-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          disabled={product.stock === 0}
                          onClick={(e) => handleQuickAdd(e, product)}
                          className="w-full bg-white text-black py-2 text-sm font-bold uppercase tracking-wider rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 hover:text-white transition-colors shadow-lg"
                        >
                          {product.stock > 0 ? (t("quickAdd") || "أضف للسلة") : "غير متوفر"}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{product.category}</p>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white truncate" title={product.title}>{product.title}</h3>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {product.discountedPrice ? (
                        <>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{product.discountedPrice} ل.س</span>
                          <span className="text-xs font-medium text-neutral-400 line-through">{product.price} ل.س</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{product.price} ل.س</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}