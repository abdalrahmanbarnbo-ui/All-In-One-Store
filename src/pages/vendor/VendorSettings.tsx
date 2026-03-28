import { useState, useEffect } from "react";
import { Clock, CalendarDays, Save, Store, Loader2, AlertCircle } from "lucide-react";

const DAYS_OF_WEEK = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function VendorSettings() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // حالات الإعدادات
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const [daysOff, setDaysOff] = useState<string[]>([]);

  // جلب الإعدادات الحالية من قاعدة البيانات عند فتح الصفحة
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/vendor/settings", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setOpenTime(data.openTime || "09:00");
          setCloseTime(data.closeTime || "22:00");
          setDaysOff(data.daysOff || []);
        }
      } catch (error) {
        setMessage({ type: "error", text: "فشل في جلب الإعدادات. تأكد من اتصالك." });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // دالة اختيار أو إلغاء اختيار يوم العطلة
  const toggleDayOff = (day: string) => {
    if (daysOff.includes(day)) {
      setDaysOff(daysOff.filter(d => d !== day));
    } else {
      setDaysOff([...daysOff, day]);
    }
  };

  // دالة حفظ التعديلات
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/vendor/settings", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ openTime, closeTime, daysOff })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "تم تحديث أوقات الدوام بنجاح!" });
        // إخفاء رسالة النجاح بعد 3 ثوانٍ
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: "حدث خطأ أثناء حفظ الإعدادات." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "تعذر الاتصال بالخادم." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-emerald-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold">جاري تحميل إعدادات متجرك...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20">
      <div className="flex items-center gap-3 mb-8">
        <Store className="w-8 h-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">إعدادات المتجر وأوقات الدوام</h1>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <form onSubmit={handleSaveSettings} className="p-6 md:p-8 space-y-8">
          
          {/* رسائل التنبيه والنجاح */}
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-2 font-bold ${
              message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}>
              <AlertCircle className="w-5 h-5" />
              {message.text}
            </div>
          )}

          {/* قسم ساعات العمل */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" /> ساعات العمل اليومية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">وقت الافتتاح</label>
                <input 
                  type="time" 
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-emerald-500 outline-none text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">وقت الإغلاق</label>
                <input 
                  type="time" 
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-emerald-500 outline-none text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* قسم أيام العطل */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" /> أيام العطل الأسبوعية
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">اختر الأيام التي لا تستقبل فيها طلبات، وسيظهر متجرك كمغلق للزبائن خلالها.</p>
            
            <div className="flex flex-wrap gap-3 mt-4">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = daysOff.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDayOff(day)}
                    className={`px-5 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                      isSelected 
                        ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20" 
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {day} {isSelected && "🔴"}
                  </button>
                );
              })}
            </div>
            {daysOff.length === 0 && (
              <p className="text-xs font-bold text-emerald-600 mt-2">متجرك مفتوح طوال أيام الأسبوع.</p>
            )}
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 mt-8">
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full md:w-auto px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}