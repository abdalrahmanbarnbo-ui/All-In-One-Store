import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // هذه الدالة تجبر المتصفح على الصعود لأعلى نقطة
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}