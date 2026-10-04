import React from 'react';
import { useStoreData } from '../context/StoreDataContext';
import { useCollege } from '../context/CollegeContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';
import QuickViewModal from './QuickViewModal';
import { Product, CollegeId } from '../types';
import {
  ArrowRight,
  Sparkles,
  PackageCheck,
  CheckCircle2,
  Truck,
  ShieldCheck,
  GraduationCap,
  ShoppingBag,
  Tag,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomePageProps {
  onNavigateToStore: (collegeFilter?: CollegeId, categoryFilter?: string) => void;
  onNavigateToKits: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function HomePage({
  onNavigateToStore,
  onNavigateToKits,
  onSelectProduct,
}: HomePageProps) {
  const { products, colleges, kits, banners, homepageSettings } = useStoreData();
  const { college: activeCollegeId, activeCollege, setCollege } = useCollege();
  const { addKitToCart } = useCart();
  const { t, language } = useLanguage();

  const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);

  // Personalized products: prioritize active college
  const personalizedTrendingProducts = React.useMemo(() => {
    const activeCollegeProducts = products.filter(
      (p) => p.active && p.trending && p.collegeId === activeCollegeId
    );
    const otherTrending = products.filter(
      (p) => p.active && p.trending && p.collegeId !== activeCollegeId
    );
    return [...activeCollegeProducts, ...otherTrending].slice(0, 4);
  }, [products, activeCollegeId]);

  // Preview kits (strictly 2 curated bundles)
  const previewKits = kits.slice(0, 2);

  const isSectionVisible = (sectionId: string) => {
    const sec = homepageSettings.sections.find((s) => s.id === sectionId);
    return sec ? sec.visible : true;
  };

  const handleCollegeCardClick = (colId: CollegeId) => {
    setCollege(colId);
    onNavigateToStore(colId);
  };

  const isRtl = language === 'ar';

  // Translate hero content dynamically based on defaults or user preference
  const heroBadge = t('home.hero.badge');
  const heroTitle = homepageSettings.heroTitle === 'Everything students need. One place.' ? t('home.hero.title') : homepageSettings.heroTitle;
  const heroSubtitle = homepageSettings.heroSubtitle.startsWith('Hand-curated faculty tools') ? t('home.hero.subtitle') : homepageSettings.heroSubtitle;
  const heroButtonPrimary = homepageSettings.heroButtonPrimary === 'Shop Store' ? t('home.hero.cta.primary') : homepageSettings.heroButtonPrimary;
  const heroButtonSecondary = homepageSettings.heroButtonSecondary === 'Explore Kits' ? t('home.hero.cta.secondary') : homepageSettings.heroButtonSecondary;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 animate-fadeIn">
      {/* 1. Hero Section (Controlled by Admin homepageSettings) */}
      {isSectionVisible('sec-hero') && (
        <section className="relative overflow-hidden pt-8 sm:pt-14 pb-8 sm:pb-12 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left text hero */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{heroBadge}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1] text-balance">
                  {heroTitle}
                </h1>

                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 font-normal max-w-xl leading-relaxed">
                  {heroSubtitle}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigateToStore()}
                    className="px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-white shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{heroButtonPrimary}</span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={onNavigateToKits}
                    className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    {heroButtonSecondary}
                  </button>
                </div>
              </div>

              {/* Right Hero Image Card */}
              <div className="lg:col-span-5">
                <div className="relative aspect-video sm:aspect-4/3 lg:aspect-square rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl group">
                  <img
                    src={homepageSettings.heroImage}
                    alt="Student workspace tools and supplies"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Floating overlay card for active college */}
                  <div className={`absolute bottom-4 ${isRtl ? 'right-4 left-4' : 'left-4 right-4'} p-3.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-lg flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{activeCollege.icon}</span>
                      <div>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                          {isRtl ? 'مخصص من أجلك' : 'Personalized For You'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {isRtl ? `${activeCollege.nameAr} مستلزمات` : `${activeCollege.name} Essentials`}
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateToStore(activeCollege.id)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      {isRtl ? 'عرض الأدوات' : 'View Gear'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Campaign Banners Carousel / Row */}
      {banners.filter((b) => b.active).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.filter((b) => b.active).map((b) => (
              <div
                key={b.id}
                onClick={() => onNavigateToStore(b.linkCollege)}
                className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between min-h-[190px] cursor-pointer group shadow-xs hover:shadow-md transition-all bg-zinc-900 text-white"
              >
                <img
                  src={b.image}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="relative z-10 space-y-1">
                  {b.badge && (
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                      {b.badge}
                    </span>
                  )}
                  <h3 className="font-bold text-lg leading-snug">{b.title}</h3>
                  <p className="text-xs text-zinc-300 line-clamp-2">{b.subtitle}</p>
                </div>
                <div className="relative z-10 pt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-300 group-hover:text-white transition-colors">
                  <span>{b.buttonText}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Browse by College */}
      {isSectionVisible('sec-colleges') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {t('home.sec.colleges.title')}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {t('home.sec.colleges.subtitle')}
              </p>
            </div>
            <button
              onClick={() => onNavigateToStore()}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isRtl ? 'عرض كل الكليات' : 'All Faculties'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {colleges.slice(0, 6).map((col) => (
              <motion.button
                key={col.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCollegeCardClick(col.id)}
                className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border text-center transition-all group cursor-pointer ${
                  col.id === activeCollegeId
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                  {col.icon || '🎓'}
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {isRtl ? col.nameAr : col.name}
                </h3>
                <span className="text-[11px] text-zinc-400 mt-1">{isRtl ? 'تصفح ←' : 'Explore →'}</span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* 3. Trending Products */}
      {isSectionVisible('sec-trending') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {t('home.sec.trending.title')}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                  {isRtl ? `مخصص حسب: ${activeCollege.nameAr}` : `Personalized: ${activeCollege.name}`}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {t('home.sec.trending.subtitle')}
              </p>
            </div>
            <button
              onClick={() => onNavigateToStore(activeCollegeId)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>{isRtl ? 'عرض المتجر الكامل' : 'View Full Store'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personalizedTrendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Student Kits Showcase */}
      {isSectionVisible('sec-kits') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                <PackageCheck className="w-3.5 h-3.5" />
                <span>{isRtl ? 'حزم متكاملة وموفرة' : 'Complete Curated Bundles'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {t('home.sec.kits.title')}
              </h2>
            </div>
            <button
              onClick={onNavigateToKits}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isRtl ? 'كل الحزم' : 'View All Kits'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {previewKits.map((kit) => (
              <div
                key={kit.id}
                className="flex flex-col sm:flex-row rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="sm:w-2/5 aspect-4/3 sm:aspect-auto bg-zinc-100 dark:bg-zinc-800 relative">
                  <img src={kit.image} alt={kit.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-2.5 ${isRtl ? 'right-2.5' : 'left-2.5'} px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold`}>
                    {isRtl ? `وفر ${kit.savings} ج.م` : `Save ${kit.savings} EGP`}
                  </span>
                </div>

                <div className="sm:w-3/5 p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      {kit.targetYear}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1 mb-2">
                      {kit.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                      {kit.description}
                    </p>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      {isRtl 
                        ? `تتضمن ${kit.itemsList.length} قطع معتمدة: ${kit.itemsList.slice(0, 2).map((i) => i.name).join('، ')}...`
                        : `Includes ${kit.itemsList.length} verified items: ${kit.itemsList.slice(0, 2).map((i) => i.name).join(', ')}...`}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between mt-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {kit.price}
                      </span>
                      <span className="text-xs text-zinc-500">{isRtl ? 'ج.م' : 'EGP'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={onNavigateToKits}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                      >
                        {isRtl ? 'تفاصيل' : 'Unpack'}
                      </button>
                      <button
                        onClick={() => addKitToCart(kit)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 cursor-pointer"
                      >
                        {isRtl ? 'شراء' : 'Add Kit'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Why Student Hub? (3 pillars) */}
      {isSectionVisible('sec-why') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {t('home.sec.why.title')}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {t('home.sec.why.subtitle')}
              </p>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 text-center ${isRtl ? 'sm:text-right' : 'sm:text-left'}`}>
              <div className="space-y-2">
                <div className={`w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg mb-3 mx-auto ${isRtl ? 'sm:mr-0' : 'sm:ml-0'}`}>
                  📚
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {t('home.why.original.title')}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {t('home.why.original.desc')}
                </p>
              </div>

              <div className="space-y-2">
                <div className={`w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg mb-3 mx-auto ${isRtl ? 'sm:mr-0' : 'sm:ml-0'}`}>
                  ⚡
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {t('home.why.delivery.title')}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {t('home.why.delivery.desc')}
                </p>
              </div>

              <div className="space-y-2">
                <div className={`w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg mb-3 mx-auto ${isRtl ? 'sm:mr-0' : 'sm:ml-0'}`}>
                  🏛️
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {t('home.why.savings.title')}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {t('home.why.savings.desc')}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFullDetails={(p) => onSelectProduct(p)}
      />
    </div>
  );
}
