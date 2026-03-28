import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    home: "Home",
    women: "Women",
    men: "Men",
    kids: "Kids",
    beauty: "Beauty",
    electronics: "Electronics",
    search: "Search",
    login: "Login",
    signup: "Sign Up",
    heroTitle: "SUMMER SALE",
    heroSub: "Up to 70% off across all categories",
    shopNow: "Shop Now",
    shopByCategory: "Shop by Category",
    recommended: "Recommended for You",
    quickAdd: "Quick Add",
    sellWithUs: "Sell with us"
  },
  ar: {
    home: "الرئيسية",
    women: "نساء",
    men: "رجال",
    kids: "أطفال",
    beauty: "تجميل",
    electronics: "إلكترونيات",
    search: "بحث",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    heroTitle: "تخفيضات الصيف",
    heroSub: "خصم يصل إلى 70% على جميع الفئات",
    shopNow: "تسوق الآن",
    shopByCategory: "تسوق حسب الفئة",
    recommended: "موصى به لك",
    quickAdd: "إضافة سريعة",
    sellWithUs: "البيع معنا"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
