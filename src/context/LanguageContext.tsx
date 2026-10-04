import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

const dictionary: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.store': 'Store',
    'nav.kits': 'Kits',
    'nav.digital': 'Digital',
    'nav.printing': 'Printing',
    'nav.custom': 'Custom',
    'nav.wishlist': 'Wishlist',
    'nav.orders': 'Orders',
    'nav.account': 'Account',
    'nav.admin': 'Admin',
    'search.placeholder': 'Search gear...',
    'cart.title': 'Cart',
    'app.tagline': 'Egyptian Universities Official Student Store',
    'onboarding.welcome': 'Welcome to Student Hub 👋',
    'onboarding.subtitle': 'Choose your college to personalize your tools, curated kits, and campus recommendations.',
    'onboarding.skip': 'Skip for now and explore all products',
    'onboarding.greatChoice': 'Great choice!',
    'onboarding.personalizing': 'Personalizing store catalog...',
    'order.history': 'Order History & Tracking',
    'order.history.subtitle': 'Track active campus courier deliveries, view itemized receipts, and manage student orders.',
    'order.none': 'No orders found',
    'order.none.desc': "You haven't placed any student orders yet.",
    'order.reorder': 'Reorder',
    'order.unauthorized': 'Please sign in or complete onboarding to view your order history.',
    'order.unauthorized.title': 'Authentication Required',
    'account.verified': 'Verified Student',
    'account.academic': 'Academic Profile Details',
    'account.save': 'Save Profile Changes',
    'account.personalization': 'Store Personalization',
    'account.activeContext': 'Active Faculty Context:',
    'account.relaunch': 'Relaunch Welcome Onboarding Flow',
    'view.store': 'View Store',
    'admin.dashboard': 'Dashboard',
    'admin.products': 'Products',
    'admin.categories': 'Categories',
    'admin.orders': 'Orders',
    'admin.customers': 'Customers',
    'admin.kits': 'Student Kits',
    'admin.digital': 'Digital Files',
    'admin.printing': 'Printing Orders',
    'admin.custom': 'Custom Orders',
    'admin.coupons': 'Coupons',
    'admin.banners': 'Banners',
    'admin.reviews': 'Reviews',
    'admin.notifications': 'Notifications',
    'admin.settings': 'Store Settings',
    'admin.quickActions': 'Quick Actions',
    'admin.activityLog': 'Admin Activity Log',
    'admin.preview': 'Preview',
    'admin.draft': 'Draft',
    'admin.published': 'Published',
    'admin.scheduled': 'Scheduled',
    'admin.deleteProduct': 'Delete Product',
    'admin.deleteCategory': 'Delete Category',
    'admin.cancelOrder': 'Cancel Order',
    'admin.deleteBanner': 'Delete Banner',
    'admin.globalSearch': 'Global Search',
    
    // Extended Storefront translations
    'home.hero.badge': 'The University Student Store · Egyptian Campuses',
    'home.hero.title': 'Everything students need. One place.',
    'home.hero.subtitle': 'Hand-curated faculty tools, certified drawing equipment, medical diagnostic instruments, and verified semester bundles delivered directly to your campus gate.',
    'home.hero.cta.primary': 'Shop Store',
    'home.hero.cta.secondary': 'Explore Kits',
    'home.announcement': '🔥 Use code STUDENT10 for 10% off your first semester kit! Free campus delivery on orders over 500 EGP.',
    'home.sec.colleges.title': 'Browse by College',
    'home.sec.colleges.subtitle': 'Select your faculty to access syllabus-specific gear and bundles.',
    'home.sec.trending.title': 'Trending on Campus',
    'home.sec.trending.subtitle': 'Top required supplies across Cairo, Ain Shams, Alexandria and Egyptian universities.',
    'home.sec.kits.title': 'Faculty Starter Kits',
    'home.sec.kits.subtitle': 'Complete course gear curated with professors and senior students.',
    'home.sec.why.title': 'Why Student Hub?',
    'home.sec.why.subtitle': 'Built specifically around Egyptian university semesters and deadlines.',
    'home.why.original.title': 'Faculty Approved',
    'home.why.original.desc': 'Every instrument and kit is certified by university departments for midterm and practical exams.',
    'home.why.delivery.title': 'Direct Gate Delivery',
    'home.why.delivery.desc': 'Handed over by our couriers at your faculty gate, matching your tight class schedules.',
    'home.why.savings.title': 'Semester Student Prices',
    'home.why.savings.desc': 'We negotiate directly with major brands like Casio, Rotring, and Littmann to offer affordable campus pricing.',
    'product.addCart': 'Add to Cart',
    'product.quickView': 'Quick View',
    'product.outStock': 'Out of Stock',
    'product.lowStock': 'Low Stock',
    'product.inStock': 'In Stock',
    'cart.empty': 'Your cart is empty',
    'cart.empty.desc': 'Add tools or curated starter kits to get started.',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Campus Delivery',
    'cart.freeShipping': 'Free',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.coupon.placeholder': 'Promo Code',
    'cart.coupon.apply': 'Apply',
    'footer.copyright': '© 2026 Student Hub. Approved university supplies vendor in Egypt.',
    'footer.madeBy': 'Serving Cairo, Ain Shams, Alexandria and Helwan Universities.',
    'checkout.title': 'Secure Checkout',
    'checkout.subtitle': 'Campus delivery matches your official lecture schedule',
    'checkout.name': 'Student Full Name',
    'checkout.phone': 'WhatsApp Number',
    'checkout.email': 'University Email',
    'checkout.university': 'University Branch',
    'checkout.pickup': 'Faculty Delivery Gate',
    'checkout.payment': 'Payment Method',
    'checkout.placeOrder': 'Place Student Order',
    'checkout.cod': 'Cash on Campus Delivery (COD)',
    'checkout.online': 'Online Card / InstaPay',
    'checkout.vodafone': 'Vodafone Cash Transfer',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.store': 'المتجر',
    'nav.kits': 'المجموعات الطلابية',
    'nav.digital': 'المنتجات الرقمية',
    'nav.printing': 'خدمات الطباعة',
    'nav.custom': 'طلبات خاصة',
    'nav.wishlist': 'المفضلة',
    'nav.orders': 'الطلبات',
    'nav.account': 'حساب الطالب',
    'nav.admin': 'لوحة التحكم',
    'search.placeholder': 'ابحث عن الأدوات...',
    'cart.title': 'السلة',
    'app.tagline': 'المتجر الطلابي الرسمي للجامعات المصرية',
    'onboarding.welcome': 'مرحباً بك في ستودنت هب 👋',
    'onboarding.subtitle': 'اختر كليتك لتخصيص الأدوات والمجموعات المنسقة والتوصيات الخاصة بحرمك الجامعي.',
    'onboarding.skip': 'تخطي الآن وتصفح جميع المنتجات',
    'onboarding.greatChoice': 'اختيار رائع!',
    'onboarding.personalizing': 'جاري تخصيص كاتالوج المتجر...',
    'order.history': 'تاريخ وتتبع الطلبات',
    'order.history.subtitle': 'تتبع تسليم المندوبين داخل الحرم الجامعي، واعرض الإيصالات المفصلة، وأدر طلباتك الدراسية.',
    'order.none': 'لم يتم العثور على طلبات',
    'order.none.desc': 'لم تقم بإنشاء أي طلبات طلابية بعد.',
    'order.reorder': 'إعادة الطلب',
    'order.unauthorized': 'يرجى إكمال التوجيه لعرض تاريخ طلباتك.',
    'order.unauthorized.title': 'مطلوب تسجيل الدخول',
    'account.verified': 'طالب موثق',
    'account.academic': 'بيانات الملف الأكاديمي',
    'account.save': 'حفظ التغييرات',
    'account.personalization': 'تخصيص المتجر',
    'account.activeContext': 'سياق الكلية الفعال:',
    'account.relaunch': 'إعادة إطلاق شاشة الترحيب',
    'view.store': 'عرض المتجر',
    'admin.dashboard': 'لوحة الإحصائيات',
    'admin.products': 'المنتجات',
    'admin.categories': 'التصنيفات',
    'admin.orders': 'الطلبات والمبيعات',
    'admin.customers': 'العملاء الطلاب',
    'admin.kits': 'الحزم الطلابية',
    'admin.digital': 'الملفات الرقمية',
    'admin.printing': 'طلبات الطباعة',
    'admin.custom': 'الطلبات الخاصة',
    'admin.coupons': 'كوبونات الخصم',
    'admin.banners': 'البانرات الإعلانية',
    'admin.reviews': 'تقييمات الطلاب',
    'admin.notifications': 'التنبيهات الإدارية',
    'admin.settings': 'إعدادات المتجر',
    'admin.quickActions': 'الإجراءات السريعة',
    'admin.activityLog': 'سجل نشاط الإدارة',
    'admin.preview': 'معاينة',
    'admin.draft': 'مسودة',
    'admin.published': 'منشور',
    'admin.scheduled': 'مجدول',
    'admin.deleteProduct': 'حذف المنتج',
    'admin.deleteCategory': 'حذف التصنيف',
    'admin.cancelOrder': 'إلغاء الطلب',
    'admin.deleteBanner': 'حذف البانر',
    'admin.globalSearch': 'البحث الشامل للإدارة',
    
    // Extended Storefront translations
    'home.hero.badge': 'المتجر الطلابي الجامعي الرسمي • الجامعات المصرية',
    'home.hero.title': 'كل احتياجاتك الجامعية في مكان واحد.',
    'home.hero.subtitle': 'أدوات مخصصة لكل كلية، أدوات رسم هندسي معتمدة، مستلزمات طبية، وحزم طلابية مجهزة تصلك حتى بوابة الكلية.',
    'home.hero.cta.primary': 'تسوق الآن',
    'home.hero.cta.secondary': 'تصفح المجموعات',
    'home.announcement': '🔥 استخدم كود STUDENT10 للحصول على خصم 10%! شحن مجاني للحرم الجامعي للطلبات فوق 500 ج.م.',
    'home.sec.colleges.title': 'تصفح حسب كليتك',
    'home.sec.colleges.subtitle': 'اختر كليتك للوصول للأدوات والكتب والمستلزمات الدراسية المخصصة لقسمك.',
    'home.sec.trending.title': 'الأكثر طلباً بالجامعات',
    'home.sec.trending.subtitle': 'الأدوات والمستلزمات الدراسية الأكثر طلباً بجامعات القاهرة، عين شمس، الإسكندرية وحلوان.',
    'home.sec.kits.title': 'حزم الكليات والمستجدين',
    'home.sec.kits.subtitle': 'مجموعات أدوات كاملة تم إعدادها بالتعاون مع أساتذة الكلية والطلاب الكبار لتوفير وقتك.',
    'home.sec.why.title': 'لماذا ستودنت هب؟',
    'home.sec.why.subtitle': 'متجر مخصص ومصمم بالكامل لتلبية مواعيد الامتحانات وتسليمات المشاريع بالجامعات المصرية.',
    'home.why.original.title': 'معتمد من الكلية',
    'home.why.original.desc': 'كل الأدوات والمجموعات معتمدة ومطابقة لمواصفات الأقسام والامتحانات العملية والمنتصف.',
    'home.why.delivery.title': 'توصيل لبوابة الكلية',
    'home.why.delivery.desc': 'يقوم مندوبونا بتسليمك طلبك يداً بيد عند بوابات كليتك ليتناسب مع جدول محاضراتك المزدحم.',
    'home.why.savings.title': 'أسعار طلابية مخفضة',
    'home.why.savings.desc': 'نتفاوض مباشرة مع كبرى العلامات التجارية مثل كاسيو وروترنج لتقديم أفضل خصومات للطلاب.',
    'product.addCart': 'أضف للسلة',
    'product.quickView': 'نظرة سريعة',
    'product.outStock': 'نفذت الكمية',
    'product.lowStock': 'كمية محدودة',
    'product.inStock': 'متوفر',
    'cart.empty': 'سلتك فارغة',
    'cart.empty.desc': 'أضف بعض الأدوات الأكاديمية أو مجموعات الكليات لبدء التجهيز.',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.shipping': 'التوصيل للحرم الجامعي',
    'cart.freeShipping': 'مكفول / مجاني',
    'cart.total': 'الإجمالي الكلي',
    'cart.checkout': 'إتمام الطلب والدفع',
    'cart.coupon.placeholder': 'رمز الخصم (الكوبون)',
    'cart.coupon.apply': 'تطبيق',
    'footer.copyright': '© 2026 ستودنت هب. الموزع الجامعي المعتمد للمستلزمات الأكاديمية في مصر.',
    'footer.madeBy': 'نخدم جامعات القاهرة، عين شمس، حلوان، والإسكندرية.',
    'checkout.title': 'تأمين طلبك',
    'checkout.subtitle': 'التوصيل للحرم الجامعي يتوافق مع مواعيد محاضراتك الرسمية',
    'checkout.name': 'اسم الطالب ثلاثي',
    'checkout.phone': 'رقم الواتساب (للتنسيق)',
    'checkout.email': 'البريد الإلكتروني الجامعي',
    'checkout.university': 'الجامعة',
    'checkout.pickup': 'بوابة التسليم المفضل بالكلية',
    'checkout.payment': 'طريقة الدفع',
    'checkout.placeOrder': 'تأكيد طلب الطالب',
    'checkout.cod': 'الدفع نقداً عند الاستلام بالكلية (COD)',
    'checkout.online': 'بطاقة بنكية / إنستا باي (InstaPay)',
    'checkout.vodafone': 'تحويل فودافون كاش (Vodafone Cash)',
  },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('studenthub_language') as Language;
    return saved === 'en' || saved === 'ar' ? saved : 'en';
  });

  const [isSwitching, setIsSwitching] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    if (language === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.classList.add('rtl-mode');
    } else {
      root.setAttribute('dir', 'ltr');
      root.classList.remove('rtl-mode');
    }
    localStorage.setItem('studenthub_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setIsSwitching(true);
    const nextLang = language === 'en' ? 'ar' : 'en';
    setLoadingText(
      nextLang === 'ar' 
        ? 'جاري تغيير اللغة وتحميل الواجهة العربية...' 
        : 'Loading English content interface...'
    );

    setTimeout(() => {
      setLanguageState(nextLang);
    }, 900);

    setTimeout(() => {
      setIsSwitching(false);
    }, 1400);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return dictionary[language][key] || dictionary['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
      
      {/* High-Fidelity Simple & Elegant Switching Loading Screen */}
      {isSwitching && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-zinc-950 transition-all duration-300">
          <div className="flex flex-col items-center gap-6 max-w-sm px-6 text-center">
            
            {/* Elegant Loading Animation */}
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-100 dark:border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 dark:border-blue-400 border-t-transparent animate-spin" />
            </div>

            <div className="space-y-2.5">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide transition-all animate-pulse">
                {loadingText}
              </p>
              <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">
                {language === 'en' ? 'ستودنت هب • STUDENT HUB' : 'STUDENT HUB • ستودنت هب'}
              </div>
            </div>
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
