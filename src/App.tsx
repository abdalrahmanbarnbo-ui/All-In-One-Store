import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext"; // <-- استدعاء السلة
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Category from "./pages/Category";
import VendorRegistration from "./pages/VendorRegistration";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VendorOnboarding from "./pages/admin/VendorOnboarding";
import VendorDashboard from "./pages/vendor/Dashboard";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminOrders from "./pages/admin/AdminOrders";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorSettings from "./pages/vendor/VendorSettings";
import VendorAds from "./pages/vendor/VendorAds";
import AdminAds from "./pages/admin/AdminAds";
import VendorStore from "./pages/VendorStore";
import Search from "./pages/Search";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <LanguageProvider>
      <CartProvider>
        <BrowserRouter>
          {/* 🌟 هذا المكون سيعيد الشاشة للأعلى مع كل انتقال 🌟 */}
          <ScrollToTop />
          
          <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300 font-cairo flex flex-col">
            <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/category/:categoryName" element={<Category />} />
                  <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                  <Route path="/vendor/register" element={<VendorRegistration />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                 <Route path="/search" element={<Search />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/vendor/orders" element={<VendorOrders />} />
                  <Route path="/store/:vendorId" element={<VendorStore />} />
                  <Route path="/vendor/ads" element={<VendorAds />} />
                  <Route path="/admin/ads" element={<AdminAds />} />
                  <Route path="/checkout" element={<Checkout />} />
                 <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/vendor/settings" element={<VendorSettings />} />
                  <Route path="/admin/vendors" element={<VendorOnboarding />} />
                </Routes>
              </main>
            </div>
            <Footer />
          </BrowserRouter>
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}