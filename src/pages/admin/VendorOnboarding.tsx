import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Key, Store, Plus } from "lucide-react";

export default function VendorOnboarding() {
  const [codes, setCodes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // جلب التذكرة من المتصفح
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };

      const [codesRes, vendorsRes] = await Promise.all([
        fetch("/api/admin/activation-codes", { headers }),
        fetch("/api/admin/vendors", { headers })
      ]);
      
      if (!codesRes.ok || !vendorsRes.ok) {
        throw new Error("غير مصرح لك بالدخول، أو انتهت صلاحية الجلسة.");
      }

      const codesData = await codesRes.json();
      const vendorsData = await vendorsRes.json();
      
      setCodes(codesData);
      setVendors(vendorsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      alert("لا تملك صلاحيات الآدمن لرؤية هذه الصفحة.");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/activation-codes", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` } // إرسال التذكرة
      });
      if (res.ok) {
        fetchData(); // تحديث الجدول بعد التوليد
      } else {
        alert("فشل في توليد الكود.");
      }
    } catch (error) {
      console.error("Failed to generate code", error);
    }
  };

  const toggleApproval = async (vendorId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/vendors/${vendorId}/approve`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // إرسال التذكرة
        },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to toggle approval", error);
    }
  };

  if (loading) return <div className="p-8 text-center text-emerald-600 font-bold">جاري تحميل بيانات الإدارة...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">لوحة إدارة البائعين</h1>
          <p className="text-neutral-500 mt-2">قم بتوليد أكواد التفعيل والموافقة على المتاجر الجديدة.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activation Codes Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-neutral-900">أكواد التفعيل</h2>
            </div>
            <button
              onClick={generateCode}
              className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              توليد كود جديد
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-4 py-3 rounded-r-lg font-medium text-right">الكود</th>
                  <th className="px-4 py-3 font-medium text-right">الحالة</th>
                  <th className="px-4 py-3 rounded-l-lg font-medium text-right">تاريخ الإنشاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-neutral-900 text-right">{code.code}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        code.isUsed ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {code.isUsed ? 'مُستخدم' : 'متاح'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-right">
                      {new Date(code.createdAt).toLocaleDateString('ar-SY')}
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                      لم يتم توليد أي كود بعد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendors Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <div className="flex items-center gap-2 mb-6">
            <Store className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-neutral-900">ملفات البائعين</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-4 py-3 rounded-r-lg font-medium text-right">اسم المتجر</th>
                  <th className="px-4 py-3 font-medium text-right">المالك</th>
                  <th className="px-4 py-3 font-medium text-right">الحالة</th>
                  <th className="px-4 py-3 rounded-l-lg font-medium text-right">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900 text-right">{vendor.storeName}</td>
                    <td className="px-4 py-3 text-neutral-500 text-right">{vendor.user.name}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vendor.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {vendor.isApproved ? 'مقبول' : 'قيد الانتظار'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleApproval(vendor.id, vendor.isApproved)}
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          vendor.isApproved ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'
                        }`}
                      >
                        {vendor.isApproved ? (
                          <><XCircle className="w-4 h-4" /> إلغاء القبول</>
                        ) : (
                          <><CheckCircle2 className="w-4 h-4" /> قبول المتجر</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                      لا يوجد بائعون مسجلون حتى الآن.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}