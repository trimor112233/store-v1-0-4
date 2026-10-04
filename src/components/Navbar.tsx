import React, { useState } from 'react';
import { useCollege } from '../context/CollegeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useStoreData } from '../context/StoreDataContext';
import { useLanguage } from '../context/LanguageContext';
import { collegesData } from '../data/mockData';
import { CollegeId } from '../types';
import {
  ShoppingBag,
  Heart,
  Search,
  ChevronDown,
  Menu,
  X,
  Check,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openSearch: () => void;
  onOpenTrackOrder?: () => void;
}

export default function Navbar({ currentView, setCurrentView, openSearch, onOpenTrackOrder }: NavbarProps) {
  const { college, setCollege, activeCollege } = useCollege();
  const { totalItemsCount, setIsCartOpen, cartBounce } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useStoreData();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const [isCollegeMenuOpen, setIsCollegeMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = (settings.navigationLinks || []).filter((link) => link.isVisible);

  const handleSelectCollege = (colId: CollegeId) => {
    setCollege(colId);
    setIsCollegeMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand & College Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
                SH
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Student Hub
              </span>
            </button>

            {/* Quick College Switcher Dropdown */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsCollegeMenuOpen(!isCollegeMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
                title="Switch College Context"
              >
                <span>{activeCollege.icon}</span>
                <span className="max-w-[100px] truncate">{activeCollege.name}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              <AnimatePresence>
                {isCollegeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1 z-50 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/80">
                      Personalize By College
                    </div>
                    {collegesData.map((col) => {
                      const isCurrent = col.id === college;
                      return (
                        <button
                          key={col.id}
                          onClick={() => handleSelectCollege(col.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left ${
                            isCurrent
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{col.icon}</span>
                            <span className="truncate">{col.name}</span>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Zone 2: Minimal Navigation (Home + 3-line Menu) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
              title="Navigation Menu"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </div>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={openSearch}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 transition-colors"
              title="Search products, kits, or services (⌘K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-zinc-400">Search gear...</span>
              <kbd className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                ⌘K
              </kbd>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setCurrentView('wishlist')}
              className={`relative p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${
                currentView === 'wishlist' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100' : ''
              }`}
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Track Order Button */}
            <button
              onClick={onOpenTrackOrder}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
              title="Track Order"
            >
              <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isRtl ? 'تتبع طلبك' : 'Track Order'}</span>
            </button>

            {/* Cart Button */}
            <motion.button
              onClick={() => setIsCartOpen(true)}
              animate={cartBounce ? { scale: [1, 1.25, 0.95, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors shadow-xs"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalItemsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold tabular-nums">
                  {totalItemsCount}
                </span>
              )}
            </motion.button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Open mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Drawer (Opens on all screens) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-2 overflow-hidden shadow-lg"
            >
              {/* College Switcher on Mobile */}
              <div className="pb-2 border-b border-zinc-100 dark:border-zinc-900">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Your College
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {collegesData.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        handleSelectCollege(col.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-left truncate transition-colors ${
                        col.id === college
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span>{col.icon}</span>
                      <span className="truncate">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Links */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setCurrentView(link.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                      currentView === link.id
                        ? 'bg-zinc-100 dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenTrackOrder?.();
                  }}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-left text-blue-600 dark:text-blue-400 flex items-center gap-1.5"
                >
                  <Package className="w-4 h-4" />
                  <span>{isRtl ? 'تتبع حالة طلبك' : 'Track Order'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly mobile UX) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-md px-2 py-1.5 flex justify-around items-center text-[10px] text-zinc-500 dark:text-zinc-400">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center gap-1 p-1 ${
            currentView === 'home' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
          }`}
        >
          <span className="text-base leading-none">🏠</span>
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentView('store')}
          className={`flex flex-col items-center gap-1 p-1 ${
            currentView === 'store' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
          }`}
        >
          <span className="text-base leading-none">🛍️</span>
          <span>Store</span>
        </button>

        <button
          onClick={() => setCurrentView('kits')}
          className={`flex flex-col items-center gap-1 p-1 ${
            currentView === 'kits' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
          }`}
        >
          <span className="text-base leading-none">📦</span>
          <span>Kits</span>
        </button>

        <button
          onClick={() => setCurrentView('wishlist')}
          className={`relative flex flex-col items-center gap-1 p-1 ${
            currentView === 'wishlist' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
          }`}
        >
          <Heart className="w-4 h-4" />
          {wishlistCount > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span>Saved</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 p-1"
        >
          <ShoppingBag className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
          {totalItemsCount > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
              {totalItemsCount}
            </span>
          )}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Cart</span>
        </button>
      </nav>
    </>
  );
}
