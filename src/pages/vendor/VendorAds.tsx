import { useState, useEffect } from "react";
import { Megaphone, Plus, AlertCircle, ImagePlus, UploadCloud, Clock, CheckCircle, XCircle, Trash2, CalendarDays } from "lucide-react";

export default function VendorAds() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تمت إضافة حقل duration هنا
  const [newAd, setNewAd] = useState({ title: "", imageUrl: "", duration: 7 });

  const fetchAds = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/vendor/ads", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setAds(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("حجم الصورة كبير جداً (أقصى حد 3MB). يفضل استخدام صورة عرضية (Banner).");
      return;
    }

    setError(""); 
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewAd({ ...newAd, imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.imageUrl) {
      setError("يجب رفع صورة الإعلان.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/vendor/ads", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(newAd) // نرسل الـ duration مع البيانات
      });

      if (res.ok) {
        setNewAd({ title: "", imageUrl: "", duration: 7 });
        fetchAds();
        alert("تم إرسال طلب الإعلان للإدارة بنجاح!");
      } else {
        setError("فشل في إرسال الطلب.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // دالة حذف الإعلان الخاصة بالبائع
  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الإعلان نهائياً؟")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/vendor/ads/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAds();
      } else {
        alert("حدث خطأ أثناء الحذف.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // تعديل الدالة لتقرأ الإعلان بالكامل لتحديد إذا كان منتهياً
  const getStatusBadge = (ad: any) => {
    if (ad.status === "APPROVED") {
      const isExpired = new Date(ad.expiresAt) < new Date();
      if (isExpired) {
        return <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3 h-3"/> انتهت صلاحيته</span>;
      }
      return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3"/> مقبول ونشط</span>;
    }
    if (ad.status === "REJECTED") {
      return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle className="w-3 h-3"/> مرفوض</span>;
    }
    return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3 h-3"/> قيد المراجعة</span>;
  };

  if (loading) return <div className="p-8 text-center text-emerald-600 font-bold">جاري تحميل الإعلانات...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
      <div className="flex items-center gap-3 mb-8">
        <Megaphone className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">إدارة الإعلانات الممولة</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* قسم تقديم طلب إعلان جديد */}
        <div className="lg:col-span-1 bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 h-fit">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" /> طلب إعلان جديد
          </h2>
          <p className="text-xs text-neutral-500 mb-6">سيتم عرض إعلانك في الصفحة الرئيسية فور موافقة الإدارة عليه.</p>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100"><AlertCircle className="w-4 h-4 inline me-1"/>{error}</div>}

          <form onSubmit={handleAddAd} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-1">عنوان الإعلان (داخلي)</label>
              <input 
                type="text" placeholder="مثال: خصومات الصيف لمتجري" required
                value={newAd.title} onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none focus:ring-2 focus:ring-purple-500" 
              />
            </div>

            {/* الحقل الجديد لاختيار مدة الإعلان */}
            <div>
              <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                <CalendarDays className="w-4 h-4"/> مدة الإعلان (بالأيام)
              </label>
              <select 
                value={newAd.duration} 
                onChange={(e) => setNewAd({...newAd, duration: parseInt(e.target.value)})} 
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={3}>3 أيام</option>
                <option value={7}>أسبوع (7 أيام)</option>
                <option value={15}>نصف شهر (15 يوم)</option>
                <option value={30}>شهر كامل (30 يوم)</option>
              </select>
            </div>
            
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <ImagePlus className="w-4 h-4" /> صورة الإعلان (Banner)
              </label>
              
              {!newAd.imageUrl ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors bg-white dark:bg-neutral-900">
                  <div className="flex flex-col items-center justify-center text-neutral-500">
                    <UploadCloud className="w-6 h-6 mb-2 text-purple-500" />
                    <p className="text-sm font-medium">اضغط لرفع صورة عرضية</p>
                    <p className="text-[10px] mt-1 text-neutral-400">يفضل نسبة 16:9</p>
                  </div>
                  <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleFileUpload} />
                </label>
              ) : (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                  <img src={newAd.imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setNewAd({ ...newAd, imageUrl: "" })} 
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 mt-4">
              {isSubmitting ? "جاري الإرسال..." : "إرسال طلب الإعلان"}
            </button>
          </form>
        </div>

        {/* قسم استعراض الإعلانات السابقة */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" /> سجل طلبات الإعلانات ({ads.length})
          </h2>
          
          <div className="space-y-4">
            {ads.map((ad) => (
              <div key={ad.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 relative">
                
                {/* زر الحذف */}
                <button 
                  onClick={() => handleDelete(ad.id)} 
                  className="absolute top-4 left-4 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors z-10"
                  title="حذف الإعلان"
                >
                  <Trash2 className="w-5 h-5"/>
                </button>

                <div className="w-full sm:w-48 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center flex-1 pe-12">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">{ad.title}</h3>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(ad)}
                    {/* عرض تاريخ الانتهاء */}
                    {ad.expiresAt && (
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                        ينتهي في: {new Date(ad.expiresAt).toLocaleDateString('ar-EG')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {ads.length === 0 && (
              <div className="py-12 text-center text-neutral-500 font-medium border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
                لم تقم بتقديم أي طلبات إعلانية بعد.
                <br/> استثمر في متجرك وضع إعلانك في الصفحة الرئيسية الآن!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}