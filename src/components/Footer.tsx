import React from 'react';
import { CollegeId } from '../types';
import { useCollege } from '../context/CollegeContext';
import { useLanguage } from '../context/LanguageContext';
import { GraduationCap, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  onNavigateToView: (view: string) => void;
  onSelectCollegeFilter: (collegeId: CollegeId) => void;
  onOpenTrackOrder?: () => void;
}

export default function Footer({ onNavigateToView, onSelectCollegeFilter, onOpenTrackOrder }: FooterProps) {
  const { allColleges } = useCollege();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand Wordmark & Mission */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
                SH
              </div>
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {isRtl ? 'ستودنت هب' : 'Student Hub'}
              </span>
            </div>
            <p className="text-zinc-500 max-w-sm leading-relaxed text-xs">
              {isRtl
                ? 'المتجر الإلكتروني المخصص بالكامل للمستلزمات والأدوات الجامعية في مصر. أدوات رسم معتمدة، مستلزمات طبية، وحزم طلابية مجهزة تصلك حتى بوابة الكلية.'
                : 'The dedicated student e-commerce ecosystem built for Egyptian universities. Genuine faculty tools, certified medical diagnostics, curated course starter kits, and express campus gate deliveries.'}
            </p>
            <div className="flex items-center gap-4 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>{isRtl ? 'القاهرة • الجيزة • الإسكندرية • حلوان' : 'Cairo · Giza · Alex · Helwan'}</span>
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isRtl ? 'معتمد ومطابق للمواصفات الأكاديمية' : 'Syllabus Verified Supplies'}</span>
              </span>
            </div>
          </div>

          {/* Col 2: Store Catalogs */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] mb-3">
              {isRtl ? 'الكليات والجامعات' : 'Faculties'}
            </h4>
            <ul className="space-y-2">
              {allColleges.slice(0, 5).map((col) => (
                <li key={col.id}>
                  <button
                    onClick={() => {
                      onSelectCollegeFilter(col.id);
                      onNavigateToView('store');
                    }}
                    className={`hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer ${isRtl ? 'text-right' : 'text-left'}`}
                  >
                    {isRtl ? col.nameAr : col.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services & Bundles */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] mb-3">
              {isRtl ? 'الخدمات الجامعية' : 'Campus Services'}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigateToView('kits')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {t('nav.kits')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToView('printing')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {t('nav.printing')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToView('custom')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {t('nav.custom')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToView('digital')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {t('nav.digital')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Links & Info */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] mb-3">
              {isRtl ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigateToView('store')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {isRtl ? 'تصفح المتجر' : 'Browse Store'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToView('wishlist')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {t('nav.wishlist')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToView('kits')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {isRtl ? 'حزم المستلزمات' : 'Course Bundles'}
                </button>
              </li>
              {onOpenTrackOrder && (
                <li>
                  <button
                    onClick={onOpenTrackOrder}
                    className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer text-blue-600 dark:text-blue-400 font-medium"
                  >
                    {isRtl ? '🔍 تتبع حالة طلبك' : '🔍 Track Your Order'}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div>
            {t('footer.copyright')}
          </div>
          <div className="flex items-center gap-4">
            <span>{isRtl ? 'الدفع نقداً عند التسليم' : 'Cash on Delivery'}</span>
            <span>·</span>
            <span>{isRtl ? 'إنستا باي' : 'InstaPay'}</span>
            <span>·</span>
            <span>{isRtl ? 'فودافون كاش' : 'Vodafone Cash'}</span>
            <span>·</span>
            <span>{isRtl ? 'بطاقات بنكية' : 'Bank Cards'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
