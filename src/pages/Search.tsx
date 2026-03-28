import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Loader2, SearchX, Tag } from "lucide-react";
import { useCart } from "../contexts/CartContext";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || ""; // سحب الكلمة المبحوث عنها من الرابط
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try { setCurrentUser(JSON.parse(userData)); } catch (error) {}
    }
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        if (response.ok) {
          setProducts(await response.json());
        }
      } catch (error) {
        console.error("فشل في جلب نتائج البحث:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setProducts([]);
      setIsLoading(false);
    }
  }, [query]);

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); 
    const finalPrice = product.discountedPrice ? product.discountedPrice : product.price;
    addToCart({
      id: product.id, title: product.title, price: finalPrice,
      image: product.images?.[0] || "https://placehold.co/400x500",
      quantity: 1, stock: product.stock
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20">
      
      {/* ترويسة البحث */}
      <div className="mb-10 pb-6 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            نتائج البحث عن: <span className="text-emerald-600">"{query}"</span>
          </h1>
        </div>
        <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
          وجدنا {products.length} منتج
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-emerald-600">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="font-bold text-lg">جاري البحث في المتجر...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
          <SearchX className="w-20 h-20 mb-6 text-neutral-300 dark:text-neutral-600" />
          <h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">عذراً، لم نجد ما تبحث عنه!</h2>
          <p className="text-neutral-500 max-w-md text-center">
            تأكد من كتابة الكلمة بشكل صحيح، أو جرب استخدام كلمات مفتاحية أخرى (مثل: فستان، حذاء، هاتف...).
          </p>
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
                  
                  {product.stock === 0 && (
                    <div className="absolute top-2 start-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">نفدت الكمية</div>
                  )}

                  {product.discountedPrice && product.stock > 0 && (
                    <div className="absolute top-2 end-2 bg-red-500 text-white text-[10px] sm:text-xs font-black px-2 py-1 rounded shadow-sm z-10 animate-pulse">
                      خصم!
                    </div>
                  )}

                  {(currentUser?.role === "USER" || currentUser?.role === "CUSTOMER") && (
                    <div className="absolute bottom-0 start-0 end-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        disabled={product.stock === 0}
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="w-full bg-white text-black py-2 text-sm font-bold uppercase tracking-wider rounded disabled:opacity-50 hover:bg-emerald-500 hover:text-white transition-colors shadow-lg"
                      >
                        {product.stock > 0 ? "أضف للسلة" : "غير متوفر"}
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
                        <span className="text-sm font-bold text-emerald-600">{product.discountedPrice} ل.س</span>
                        <span className="text-xs font-medium text-neutral-400 line-through">{product.price} ل.س</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-emerald-600">{product.price} ل.س</span>
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