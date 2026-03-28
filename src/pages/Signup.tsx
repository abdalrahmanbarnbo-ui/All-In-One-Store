import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Store, User, AlertCircle, ArrowRight } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<"CUSTOMER" | "VENDOR">("CUSTOMER");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "+963",
    activationCode: "",
    storeName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (accountType === "VENDOR" && !formData.activationCode) {
      setError("Activation code is required for vendor accounts");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: accountType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Success
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Create an Account</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Join All in One Store today
          </p>
        </div>

        {/* Account Type Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setAccountType("CUSTOMER")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              accountType === "CUSTOMER" 
                ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                : "border-neutral-200 hover:border-emerald-200 text-neutral-500"
            }`}
          >
            <User className="w-6 h-6 mb-2" />
            <span className="font-medium">Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("VENDOR")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              accountType === "VENDOR" 
                ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                : "border-neutral-200 hover:border-emerald-200 text-neutral-500"
            }`}
          >
            <Store className="w-6 h-6 mb-2" />
            <span className="font-medium">Vendor</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Mobile Number (Syria)</label>
            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="+963 9XX XXX XXX"
            />
          </div>

          {accountType === "VENDOR" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 pt-4 border-t border-neutral-100"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  required={accountType === "VENDOR"}
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Your Store Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Activation Code (Admin Generated)</label>
                <input
                  type="text"
                  name="activationCode"
                  required={accountType === "VENDOR"}
                  value={formData.activationCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                  placeholder="e.g. VEND-2026-XYZ"
                />
                <p className="mt-2 text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  To create a vendor account, you must have a unique activation code generated by the All in One Store Super Admin. Please contact our support to receive your code.
                </p>
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || (accountType === "VENDOR" && !formData.activationCode)}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : accountType === "VENDOR" ? "Create Vendor Account" : "Create Account"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-neutral-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
