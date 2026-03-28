import { useState, useEffect } from "react";
import { Package, Plus, Trash2, AlertCircle, ImagePlus, X, UploadCloud, Ruler, Store, Tag, Percent, Star } from "lucide-react";

// خريطة القياسات الديناميكية
const SIZE_CATEGORIES: Record<string, string[]> = {
  "ملابس نسائية": ["XS", "S", "M", "L", "XL", "XXL", "38", "40", "42", "44"],
  "ملابس رجالية": ["S", "M", "L", "XL", "XXL", "3XL", "40", "42", "44", "46"],
  "أطفال": ["0-3 أشهر", "3-6 أشهر", "6-12 شهر", "1-2 سنة", "3-4 سنوات", "5-6 سنوات", "7-8 سنوات"],
  "إلكترونيات": ["قياسي"],
  "تجميل": ["قياسي", "عبوة صغيرة 50ml", "عبوة كبيرة 100ml"],
};

export default function VendorDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // حالة إضافة منتج جديد
  const [newProduct, setNewProduct] = useState({ 
    title: "", description: "", price: "", discountedPrice: "", category: "ملابس نسائية", images: [] as string[],
    sizes: [] as { size: string, stock: number }[] 
  });
  
  const [currentSize, setCurrentSize] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالات النافذة المنبثقة للخصم السريع
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedProductForDiscount, setSelectedProductForDiscount] = useState<any>(null);
  const [quickDiscountValue, setQuickDiscountValue] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === "VENDOR" && parsedUser.vendorStatus === true) {
        setIsApproved(true);
        fetchProducts();
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/vendor/settings", { headers: { "Authorization": `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setIsStoreOpen(!data.isManuallyClosed); 
        }
      } catch (err) {}
    };
    if (isApproved) fetchSettings();
  }, [isApproved]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/vendor/products", { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) setProducts(await res.json());
    } catch (err) {} finally { setLoading(false); }
  };
  
  const toggleStoreStatus = async () => {
    const newStatus = !isStoreOpen;
    setIsStoreOpen(newStatus); 
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/vendor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ isManuallyClosed: !newStatus }) 
      });
    } catch (error) { setIsStoreOpen(!newStatus); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setError("حجم الصورة كبير جداً (أقصى حد 2MB).");
    setError(""); 
    const reader = new FileReader();
    reader.onloadend = () => setNewProduct(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setNewProduct({ ...newProduct, images: newProduct.images.filter((_, i) => i !== indexToRemove) });
  };

  const handleAddSize = () => {
    if (currentSize && currentStock && parseInt(currentStock) > 0) {
      if (newProduct.sizes.findIndex(s => s.size === currentSize) >= 0) return setError("تمت إضافة هذا القياس مسبقاً.");
      setNewProduct(prev => ({ ...prev, sizes: [...prev.sizes, { size: currentSize, stock: parseInt(currentStock) }] }));
      setCurrentSize(""); setCurrentStock(""); setError("");
    }
  };

  const handleRemoveSize = (indexToRemove: number) => {
    setNewProduct({ ...newProduct, sizes: newProduct.sizes.filter((_, i) => i !== indexToRemove) });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.images.length === 0) return setError("يجب إضافة صورة واحدة على الأقل.");
    if (newProduct.sizes.length === 0) return setError("يجب إضافة قياس واحد وكميته على الأقل.");
    
    if (newProduct.discountedPrice && parseFloat(newProduct.discountedPrice) >= parseFloat(newProduct.price)) {
      return setError("يجب أن يكون سعر الخصم أقل من السعر الأساسي!");
    }
    
    setIsSubmitting(true); setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setNewProduct({ title: "", description: "", price: "", discountedPrice: "", category: "ملابس نسائية", images: [], sizes: [] }); 
        fetchProducts(); 
      } else setError("فشل الإضافة.");
    } catch (err) { setError("حدث خطأ في الاتصال."); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/vendor/products/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) fetchProducts();
    } catch (err) { console.error(err); }
  };

  const openDiscountModal = (product: any) => {
    setSelectedProductForDiscount(product);
    setQuickDiscountValue(product.discountedPrice ? product.discountedPrice.toString() : "");
    setDiscountModalOpen(true);
  };

  const handleApplyQuickDiscount = async () => {
    if (quickDiscountValue && parseFloat(quickDiscountValue) >= selectedProductForDiscount.price) {
      alert("سعر الخصم يجب أن يكون أقل من السعر الأساسي للمنتج!");
      return;
    }

    setIsApplyingDiscount(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/vendor/products/${selectedProductForDiscount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ discountedPrice: quickDiscountValue }) 
      });
      if (res.ok) {
        fetchProducts();
        setDiscountModalOpen(false);
      } else {
        alert("فشل في تطبيق الخصم.");
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال.");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // 🌟 دالة إرسال طلب التمييز (Best Choice) للآدمن 🌟
  const requestFeature = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/vendor/products/${productId}/request-feature`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("تم إرسال طلب التمييز بنجاح للآدمن!");
        fetchProducts(); // تحديث القائمة لإظهار حالة "قيد المراجعة"
      } else {
        alert(data.error || "حدث خطأ أثناء إرسال الطلب.");
      }
    } catch (error) {
      alert("تعذر الاتصال بالخادم.");
    }
  };

  if (loading) return <div className="p-8 text-center text-emerald-600 font-bold">جاري تحميل بيانات متجرك...</div>;
  if (!isApproved) return <div className="text-center mt-20 text-amber-600 font-bold text-xl">حسابك قيد المراجعة من الإدارة.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
          <Store className="w-8 h-8 text-emerald-600" /> لوحة تحكم المتجر
        </h1>
        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-neutral-700">حالة المتجر الآن:</span>
            <span className={`text-xs font-bold ${isStoreOpen ? 'text-emerald-600' : 'text-red-600'}`}>
              {isStoreOpen ? 'يستقبل الطلبات' : 'مغلق مؤقتاً'}
            </span>
          </div>
          <button onClick={toggleStoreStatus} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isStoreOpen ? 'bg-emerald-500' : 'bg-neutral-300'}`}>
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isStoreOpen ? '-translate-x-7' : '-translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- قسم إضافة منتج جديد --- */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 h-fit">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> إضافة منتج</h2>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100"><AlertCircle className="w-4 h-4 inline me-1"/>{error}</div>}

          <form onSubmit={handleAddProduct} className="space-y-4">
            <input type="text" placeholder="اسم المنتج" required value={newProduct.title} onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500" />
            <textarea placeholder="وصف المنتج" required rows={3} value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500" />
            
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="السعر الأساسي" required min="0" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
              
              <div className="relative">
                <Tag className="w-4 h-4 text-emerald-500 absolute top-3 start-3" />
                <input type="number" placeholder="سعر الخصم (اختياري)" min="0" value={newProduct.discountedPrice} onChange={(e) => setNewProduct({...newProduct, discountedPrice: e.target.value})} className="w-full px-4 py-2 ps-9 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <select value={newProduct.category} onChange={(e) => {setNewProduct({...newProduct, category: e.target.value, sizes: []}); setCurrentSize("")}} className="w-full px-4 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500 font-medium">
              <option value="ملابس نسائية">ملابس نسائية</option>
              <option value="ملابس رجالية">ملابس رجالية</option>
              <option value="أطفال">أطفال</option>
              <option value="إلكترونيات">إلكترونيات</option>
              <option value="تجميل">تجميل</option>
            </select>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <label className="block text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2"><Ruler className="w-4 h-4" /> القياسات والكميات</label>
              <div className="flex gap-2 mb-3">
                <select value={currentSize} onChange={(e) => setCurrentSize(e.target.value)} className="flex-1 px-3 py-2 text-sm rounded-lg border border-emerald-200 outline-none">
                  <option value="">القياس...</option>
                  {SIZE_CATEGORIES[newProduct.category]?.map(size => <option key={size} value={size}>{size}</option>)}
                </select>
                <input type="number" placeholder="الكمية" min="1" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} className="w-20 px-3 py-2 text-sm rounded-lg border border-emerald-200 outline-none" />
                <button type="button" onClick={handleAddSize} className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors">إضافة</button>
              </div>
              
              {newProduct.sizes.length > 0 && (
                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto pr-1 scrollbar-hide">
                  {newProduct.sizes.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-2 rounded-lg border border-emerald-100 text-sm shadow-sm">
                      <span className="font-bold">القياس: {item.size}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-600 font-medium">الكمية: {item.stock}</span>
                        <button type="button" onClick={() => handleRemoveSize(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <label className="block text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2"><ImagePlus className="w-4 h-4" /> صور المنتج</label>
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors bg-white">
                <div className="flex flex-col items-center justify-center text-neutral-500">
                  <UploadCloud className="w-6 h-6 mb-2 text-emerald-500" />
                  <p className="text-sm font-medium">اضغط لرفع صورة</p>
                </div>
                <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleFileUpload} />
              </label>

              {newProduct.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {newProduct.images.map((img, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg border border-neutral-200 bg-white shadow-sm">
                      <img src={img} className="w-full h-full object-contain p-1 rounded-lg" />
                      {index === 0 && <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[10px] text-center py-0.5 font-bold">الرئيسية</div>}
                      <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-white text-red-600 p-1 rounded-full shadow hover:bg-red-50"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 mt-4">
              {isSubmitting ? "جاري النشر..." : "نشر المنتج الآن"}
            </button>
          </form>
        </div>

        {/* --- قسم استعراض المنتجات والجدول --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2"><Package className="w-5 h-5 text-emerald-600" /> المخزون الحالي ({products.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-4 font-bold text-right">الصورة</th>
                  <th className="px-4 py-4 font-bold text-right">المنتج والسعر</th>
                  <th className="px-4 py-4 font-bold text-right">القياسات والكمية</th>
                  <th className="px-4 py-4 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-4">
                      <img src={product.images?.[0] || "https://placehold.co/100x100"} alt="Product" className="w-14 h-14 object-contain bg-white p-1 rounded-lg border border-neutral-200 shadow-sm" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="font-bold text-neutral-900">{product.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {product.discountedPrice ? (
                          <>
                            <span className="text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded">{product.discountedPrice} ل.س</span>
                            <span className="text-neutral-400 line-through text-xs">{product.price} ل.س</span>
                          </>
                        ) : (
                          <span className="text-emerald-600 font-bold">{product.price} ل.س</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {product.sizes?.map((s:any, i:number) => (
                          <span key={i} className="bg-white text-neutral-700 px-2 py-1 rounded text-xs border border-neutral-200 shadow-sm font-medium">
                            {s.size} (<span className={s.stock > 0 ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>{s.stock}</span>)
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2 items-center h-full flex-wrap">
                        
                        {/* 🌟 زر/حالة التمييز (Best Choice) 🌟 */}
                        {product.isFeatured ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded-lg flex items-center gap-1 cursor-default" title="منتج مميز ومقبول">
                            <Star className="w-3 h-3 fill-amber-500" /> مميز
                          </span>
                        ) : product.featureRequest === "PENDING" ? (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1.5 rounded-lg flex items-center gap-1 cursor-default" title="قيد المراجعة من الإدارة">
                            ⏳ مراجعة
                          </span>
                        ) : (
                          <button onClick={() => requestFeature(product.id)} className="text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition-colors" title="طلب عرض المنتج كـ Best Choice">
                            <Star className="w-4 h-4" />
                          </button>
                        )}

                        {/* زر الخصم السريع */}
                        <button onClick={() => openDiscountModal(product)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors" title="إضافة / تعديل الخصم">
                          <Percent className="w-4 h-4" />
                        </button>
                        {/* زر الحذف */}
                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="حذف المنتج">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-16 text-center text-neutral-500 font-medium">لم تقم بإضافة أي منتجات بعد.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* النافذة المنبثقة للخصم السريع */}
      {discountModalOpen && selectedProductForDiscount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setDiscountModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 bg-neutral-100 rounded-full p-1"><X className="w-5 h-5"/></button>
            
            <h3 className="text-xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" /> إضافة خصم سريع
            </h3>
            <p className="text-sm text-neutral-500 mb-6">قم بتحديد السعر الجديد للمنتج: <span className="font-bold text-neutral-900">{selectedProductForDiscount.title}</span></p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">السعر الأساسي الحالي</label>
                <div className="w-full px-4 py-3 bg-neutral-100 text-neutral-500 rounded-xl font-bold line-through border border-neutral-200">
                  {selectedProductForDiscount.price} ل.س
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-1">سعر التخفيض الجديد (اتركه فارغاً لإلغاء الخصم)</label>
                <input 
                  type="number" 
                  min="0"
                  value={quickDiscountValue} 
                  onChange={(e) => setQuickDiscountValue(e.target.value)}
                  placeholder="أدخل السعر بعد الخصم..."
                  className="w-full px-4 py-3 border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-bold rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button onClick={() => setDiscountModalOpen(false)} className="flex-1 py-3 text-neutral-700 font-bold bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors">إلغاء</button>
                <button onClick={handleApplyQuickDiscount} disabled={isApplyingDiscount} className="flex-1 py-3 text-white font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50">
                  {isApplyingDiscount ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}