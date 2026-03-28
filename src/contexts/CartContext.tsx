import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 1. تحميل السلة الخاصة بالمستخدم فور دخوله
  const loadUserCart = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      // إنشاء مفتاح فريد لكل مستخدم بناءً على إيميله أو المعرف الخاص به
      const userCartKey = `cart_${user.email || user.id}`;
      const savedCart = localStorage.getItem(userCartKey);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]); // سلة جديدة لمستخدم جديد
      }
    } else {
      setCartItems([]); // تفريغ السلة إذا كان زائراً
    }
  };

  useEffect(() => {
    loadUserCart();
    // نستمع لحدث مخصص سنطلقه عند تسجيل الدخول أو الخروج لتحديث السلة فوراً
    window.addEventListener("userAuthChanged", loadUserCart);
    return () => window.removeEventListener("userAuthChanged", loadUserCart);
  }, []);

  // 2. حفظ السلة في التخزين المحلي بالاسم الفريد للمستخدم عند أي تعديل
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      const userCartKey = `cart_${user.email || user.id}`;
      localStorage.setItem(userCartKey, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (newItem: CartItem) => {
    // 🔴 حماية: منع الزائر من إضافة منتجات للسلة وتوجيهه لتسجيل الدخول
    if (!localStorage.getItem("user")) {
      alert("يرجى تسجيل الدخول أولاً لتتمكن من إضافة المنتجات إلى السلة.");
      window.location.href = "/login";
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === newItem.id);
      if (existing) {
        return prev.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.stock) }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}