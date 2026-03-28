import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Loader2, PackageOpen } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";

const CATEGORY_MAP: Record<string, string> = {
  women: "ملابس نسائية",
  men: "ملابس رجالية",
  kids: "أطفال",
  electronics: "إلكترونيات",
  beauty: "تجميل",
};

export default function Category() {
  const { categoryName } = useParams();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const dbCategoryName = categoryName ? CATEGORY_MAP[categoryName.toLowerCase()] : "";

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error("فشل في قراءة بيانات المستخدم");
      }
    }
  }, []);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?category=${encodeURIComponent(dbCategoryName)}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("فشل في جلب منتجات القسم:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (dbCategoryName) {
      fetchCategoryProducts();
    } else {
      setIsLoading(false);
    }
  }, [categoryName, dbCategoryName]);

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); 
    // التأكد من أخذ السعر المخصوم إذا كان موجوداً
    const finalPrice = product.discountedPrice ? product.discountedPrice : product.price;

    addToCart({
      id: product.id,
      title: product.title,
      price: finalPrice, // تم التعديل هنا
      image: product.images?.[0] || "https://placehold.co/400x500",
      quantity: 1,
      stock: product.stock
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20">
      
      <div className="mb-10 pb-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white capitalize">
          {t(categoryName || "") || categoryName}
        </h1>
        <span className="text-neutral-500 font-medium">
          {products.length} منتجات
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-medium">جاري تحميل منتجات القسم...</p>
        </div>
      ) : !dbCategoryName ? (
        <div className="text-center py-20 text-red-500">القسم غير موجود! تأكد من الرابط.</div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <PackageOpen className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">لا توجد منتجات في قسم {t(categoryName || "")} حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <motion.div key={product.id} whileHover={{ y: -5 }} className="group cursor-pointer">
              <Link to={`/product/${product.id}`} className="block h-full">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  
                  <img 
                    src={product.images?.[0] || "https://placehold.co/400x500"} 
                    alt={product.title} 
                    className="w-full h-full object-contain p-2 bg-white group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* شارة نفدت الكمية */}
                  {product.stock === 0 && (
                    <div className="absolute top-2 start-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
                      نفدت الكمية
                    </div>
                  )}

                  {/* 🔴 شارة الخصم الجذابة 🔴 */}
                  {product.discountedPrice && product.stock > 0 && (
                    <div className="absolute top-2 end-2 bg-red-500 text-white text-[10px] sm:text-xs font-black px-2 py-1 rounded shadow-sm z-10 animate-pulse">
                      خصم!
                    </div>
                  )}

                  {currentUser?.role === "CUSTOMER" && (
                    <div className="absolute bottom-0 start-0 end-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        disabled={product.stock === 0}
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="w-full bg-white text-black py-2 text-sm font-bold uppercase tracking-wider rounded disabled:opacity-50 hover:bg-emerald-500 hover:text-white transition-colors shadow-lg"
                      >
                        {product.stock > 0 ? (t("quickAdd") || "أضف للسلة") : "غير متوفر"}
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-white truncate">{product.title}</h3>
                  
                  {/* 🔴 تم التعديل هنا لعرض السعر المشطوب 🔴 */}
                  <div className="flex items-center gap-2 mt-1">
                    {product.discountedPrice ? (
                      <>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {product.discountedPrice} ل.س
                        </span>
                        <span className="text-xs font-medium text-neutral-400 line-through">
                          {product.price} ل.س
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {product.price} ل.س
                      </span>
                    )}
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}