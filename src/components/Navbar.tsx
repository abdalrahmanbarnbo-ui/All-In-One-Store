import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, Sun, Moon, Globe, LogOut, LayoutDashboard, Package, Store, Megaphone, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  
  // --- حالات شريط البحث الحي ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // حالة لحفظ بيانات المستخدم المسجل
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try { setCurrentUser(JSON.parse(userData)); } catch (e) { setCurrentUser(null); }
    } else {
      setCurrentUser(null);
    }
  }, [location.pathname]);

  // دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsProfileOpen(false);
    window.dispatchEvent(new Event("userAuthChanged")); 
    navigate("/login"); 
  };

  // البحث الحي (Debouncing)
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setLiveResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setLiveResults(data.slice(0, 5)); 
        }
      } catch (error) {
        console.error("Live search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const navLinks = [
    { name: t("home") || "Home", path: "/" },
    { name: t("women") || "Women", path: "/category/women" },
    { name: t("men") || "Men", path: "/category/men" },
    { name: t("kids") || "Kids", path: "/category/kids" },
    { name: t("beauty") || "Beauty", path: "/category/beauty" },
    { name: t("electronics") || "Electronics", path: "/category/electronics" },
  ];

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Mobile Menu */}
          <div className="flex items-center">
            <button className="p-2 -ms-2 me-2 md:hidden text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
              <span className="font-bold text-xl tracking-tight text-neutral-900 dark:text-white">All in One</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition-colors ${
                  location.pathname === link.path || (location.pathname === "/" && link.path === "/")
                    ? "text-emerald-600 dark:text-emerald-500"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium uppercase hidden lg:block">{lang}</span>
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {/* 🔍 Smart Live Search Bar (تم الإصلاح هنا) */}
            <div className="hidden sm:flex items-center">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }
                }} 
                className="flex items-center"
              >
                {isSearchOpen && (
                  <div className="relative me-2 animate-in fade-in slide-in-from-right-4 duration-300">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن منتج..."
                      className="w-48 lg:w-64 px-4 py-2 text-sm rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                      autoFocus
                    />
                    
                    {/* القائمة المنسدلة للبحث */}
                    {searchQuery.trim().length > 0 && (
                      <div className="absolute top-12 end-0 w-64 lg:w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden z-50">
                        {isSearching ? (
                          <div className="p-4 text-center text-emerald-600 flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        ) : liveResults.length > 0 ? (
                          <div className="max-h-80 overflow-y-auto">
                            {liveResults.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => {
                                  navigate(`/product/${product.id}`);
                                  setIsSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="w-full text-start flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                              >
                                <img src={product.images?.[0] || "https://placehold.co/100x100"} alt={product.title} className="w-10 h-10 object-cover rounded-md bg-neutral-100 dark:bg-neutral-800" />
                                <div className="flex-1 overflow-hidden">
                                  <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{product.title}</p>
                                  <p className="text-xs text-emerald-600 font-bold mt-0.5">{product.discountedPrice || product.price} ل.س</p>
                                </div>
                              </button>
                            ))}
                            <button 
                              type="submit"
                              className="w-full p-3 text-sm text-center font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                            >
                              عرض كل النتائج
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-neutral-500">
                            لا توجد نتائج مطابقة.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <button 
                  type={isSearchOpen && searchQuery.trim() ? "submit" : "button"}
                  onClick={() => {
                    if (!isSearchOpen) setIsSearchOpen(true);
                    else if (!searchQuery.trim()) setIsSearchOpen(false);
                  }}
                  className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white dark:bg-neutral-900 rounded-full"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1 relative"
              >
                <User className="w-5 h-5" />
                {currentUser && <span className="absolute top-1 end-1 w-2 h-2 bg-emerald-500 rounded-full"></span>}
              </button>
              
              {isProfileOpen && (
                <div className="absolute end-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-800 py-2 overflow-hidden z-50">
                  
                  {currentUser ? (
                    <>
                      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 mb-2">
                        <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-neutral-500 capitalize">{currentUser.role?.toLowerCase()}</p>
                      </div>

                      {currentUser.role === "ADMIN" && (
                        <>
                          <Link to="/admin/vendors" className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800" onClick={() => setIsProfileOpen(false)}><LayoutDashboard className="w-4 h-4" /> إدارة البائعين</Link>
                          <Link to="/admin/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800" onClick={() => setIsProfileOpen(false)}><Package className="w-4 h-4" /> إدارة الطلبات</Link>
                          <Link to="/admin/ads" className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20" onClick={() => setIsProfileOpen(false)}><Megaphone className="w-4 h-4" /> إدارة الإعلانات</Link>
                        </>
                      )}

                      {currentUser.role === "VENDOR" && (
                        <>
                          <Link to="/vendor/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800" onClick={() => setIsProfileOpen(false)}><LayoutDashboard className="w-4 h-4" /> إدارة متجري</Link>
                          <Link to="/vendor/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800" onClick={() => setIsProfileOpen(false)}><Package className="w-4 h-4" /> طلبات الزبائن</Link>
                          <Link to="/vendor/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800" onClick={() => setIsProfileOpen(false)}><Store className="w-4 h-4" /> إعدادات الدوام</Link>
                          <Link to="/vendor/ads" className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20" onClick={() => setIsProfileOpen(false)}><Megaphone className="w-4 h-4" /> طلب إعلان ممول</Link>
                        </>
                      )}

                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 mt-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition-colors"><LogOut className="w-4 h-4" /> تسجيل الخروج</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-emerald-600 dark:hover:text-emerald-400" onClick={() => setIsProfileOpen(false)}>{t("login") || "Login"}</Link>
                      <Link to="/signup" className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-emerald-600 dark:hover:text-emerald-400" onClick={() => setIsProfileOpen(false)}>{t("signup") || "Sign Up"}</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* --- أيقونة السلة --- */}
            {(currentUser?.role === "USER" || currentUser?.role === "CUSTOMER") && (
              <Link to="/cart" className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -end-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}