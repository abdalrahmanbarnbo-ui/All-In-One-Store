import { Link } from "react-router-dom";
import { ShoppingBag, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 pt-16 pb-8 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* القسم العلوي: الروابط والمعلومات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* 1. عن المتجر */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
              <span className="font-bold text-2xl tracking-tight text-neutral-900 dark:text-white">All in One</span>
            </Link>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              منصتك الأولى للتسوق الإلكتروني. نجمع لك أفضل المتاجر والمنتجات في مكان واحد لنجعل تجربة تسوقك أسهل وأسرع وأكثر أماناً.
            </p>
          </div>

          {/* 2. روابط سريعة */}
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-4">روابط سريعة</h3>
            <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-400">
              <li><Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">الرئيسية</Link></li>
              <li><Link to="/category/women" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">الأزياء النسائية</Link></li>
              <li><Link to="/category/electronics" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">الإلكترونيات الذكية</Link></li>
              <li><Link to="/cart" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">سلة المشتريات</Link></li>
            </ul>
          </div>

          {/* 3. خدمة العملاء */}
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-4">خدمة العملاء</h3>
            <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-400">
              <li><Link to="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">تتبع الطلبات</Link></li>
              <li><Link to="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">سياسة الاسترجاع</Link></li>
              <li><Link to="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">الشروط والأحكام</Link></li>
              <li><Link to="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          {/* 4. تواصل معنا */}
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-4">تواصل معنا</h3>
            <ul className="space-y-4 text-sm text-neutral-500 dark:text-neutral-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>سوريا، دمشق، البرامكة</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span dir="ltr">+963 996281510</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span dir="ltr">abdalrahmanbarnbo@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* القسم السفلي: حقوق النشر والتطوير */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 text-center md:text-start">
            &copy; {currentYear} المتجر الشامل (All in One). جميع الحقوق محفوظة.
          </div>

          {/* توقيع المطور الجاد والاحترافي */}
          <div 
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-sm"
            dir="ltr"
          >
            Design by 
            <a 
              href="https://www.linkedin.com/in/abdalrahman-barnbo-79201b3b6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-neutral-800 dark:text-neutral-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ml-1" 
              title="عرض حساب LinkedIn المهني"
            >
              ENG. AbdAlrahman Barnbo
            </a>
          </div>

        </div>
        
      </div>
    </footer>
  );
}