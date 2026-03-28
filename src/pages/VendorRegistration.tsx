import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Store, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function VendorRegistration() {
  const [step, setStep] = useState(1);
  const [activationCode, setActivationCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // بيانات البائع
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    storeName: ""
  });

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (activationCode.length < 5) {
      setError("كود التفعيل غير صالح.");
      return;
    }
    setError("");
    setStep(2); // ننتقل للخطوة الثانية لجمع باقي البيانات
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "VENDOR",
          activationCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل التسجيل");
      }

      alert("تم تسجيل متجرك بنجاح! بانتظار موافقة الإدارة.");
      navigate("/login"); // نوجهه لتسجيل الدخول

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-20 px-4 mb-20"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">انضم كبائع</h1>
        <p className="text-neutral-500 mt-2">افتح متجرك في السوق الأول في سوريا.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerifyCode}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">كود التفعيل (Activation Code)</label>
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="مثال: VEND-2026-XXXX"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-neutral-900 text-white py-3 rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>تحقق من الكود</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="font-medium">الكود جاهز!</p>
                <p className="text-sm opacity-80">أكمل بيانات متجرك الآن.</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmitRegistration}>
              <input 
                type="text" placeholder="اسمك الكامل" required
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 outline-none" 
              />
              <input 
                type="text" placeholder="اسم المتجر (Store Name)" required
                value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 outline-none" 
              />
              <input 
                type="email" placeholder="البريد الإلكتروني" required
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 outline-none" 
              />
              <input 
                type="text" placeholder="رقم الهاتف (+963...)" required
                value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 outline-none" 
              />
              <input 
                type="password" placeholder="كلمة المرور" required
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 outline-none" 
              />
              <button
                type="submit" disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors mt-6 disabled:opacity-50"
              >
                {isLoading ? "جاري التسجيل..." : "إكمال التسجيل"}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}