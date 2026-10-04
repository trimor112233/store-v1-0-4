import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { CollegeProvider, useCollege } from './context/CollegeContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { StoreDataProvider } from './context/StoreDataContext';
import { LanguageProvider } from './context/LanguageContext';

import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import StorePage from './components/StorePage';
import ProductDetailPage from './components/ProductDetailPage';
import KitsPage from './components/KitsPage';
import DigitalPage from './components/DigitalPage';
import PrintingPage from './components/PrintingPage';
import CustomProductsPage from './components/CustomProductsPage';
import WishlistPage from './components/WishlistPage';
import AdminDashboard from './components/AdminDashboard';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import TrackOrderModal from './components/TrackOrderModal';
import Footer from './components/Footer';

import { Product, CollegeId } from './types';

function MainApp() {
  const { setCollege } = useCollege();

  // Navigation views: 'home' | 'store' | 'product-detail' | 'kits' | 'digital' | 'printing' | 'custom' | 'wishlist' | 'admin'
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [targetCategoryFilter, setTargetCategoryFilter] = useState<string | undefined>(undefined);
  const [targetCollegeFilter, setTargetCollegeFilter] = useState<CollegeId | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Track Order Modal State
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackPhone, setTrackPhone] = useState('');

  const handleOpenTrackOrder = (orderId?: string, phone?: string) => {
    if (orderId) setTrackOrderId(orderId);
    if (phone) setTrackPhone(phone);
    setIsTrackOrderOpen(true);
  };

  // Scroll to top when switching views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Listen for owner portal URL check
  useEffect(() => {
    const checkOwnerPortal = () => {
      if (window.location.pathname.includes('/admin') || window.location.search.includes('owner_portal=true')) {
        setCurrentView('admin');
      }
    };
    checkOwnerPortal();

    const handleNavigation = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setCurrentView(customEvent.detail);
      }
    };
    window.addEventListener('sh_navigate', handleNavigation);

    return () => {
      window.removeEventListener('sh_navigate', handleNavigation);
    };
  }, []);

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setCurrentView('product-detail');
  };

  const handleNavigateToStoreWithFilters = (collegeId?: CollegeId, categoryId?: string) => {
    if (collegeId) {
      setCollege(collegeId);
      setTargetCollegeFilter(collegeId);
    }
    if (categoryId) {
      setTargetCategoryFilter(categoryId);
    } else {
      setTargetCategoryFilter(undefined);
    }
    setCurrentView('store');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 selection:bg-blue-600 selection:text-white pb-14 md:pb-0">
      {/* Top Navigation & Mobile Bottom Nav */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openSearch={() => setIsSearchOpen(true)}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigateToStore={handleNavigateToStoreWithFilters}
            onNavigateToKits={() => setCurrentView('kits')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'store' && (
          <StorePage
            onSelectProduct={handleSelectProduct}
            initialCollege={targetCollegeFilter}
            initialCategory={targetCategoryFilter}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => setCurrentView('store')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'kits' && <KitsPage />}

        {currentView === 'digital' && <DigitalPage />}

        {currentView === 'printing' && <PrintingPage />}

        {currentView === 'custom' && <CustomProductsPage />}

        {currentView === 'wishlist' && (
          <WishlistPage
            onSelectProduct={handleSelectProduct}
            onNavigateToStore={() => setCurrentView('store')}
          />
        )}

        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Shopping Cart Drawer & Guest Checkout */}
      <CartDrawer onOpenTrackOrderModal={handleOpenTrackOrder} />

      {/* Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => {
          setIsTrackOrderOpen(false);
          setTrackOrderId('');
          setTrackPhone('');
        }}
        initialOrderId={trackOrderId}
        initialPhone={trackPhone}
      />

      {/* Search Command Palette Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onSelectView={(v) => setCurrentView(v)}
        onSelectCollegeFilter={(cId) => {
          setCollege(cId);
          setTargetCollegeFilter(cId);
        }}
        onSelectCategoryFilter={(catId) => {
          setTargetCategoryFilter(catId);
        }}
      />

      {/* Footer */}
      <Footer
        onNavigateToView={setCurrentView}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onSelectCollegeFilter={(cId) => {
          setCollege(cId);
          setTargetCollegeFilter(cId);
          setTargetCategoryFilter(undefined);
          setCurrentView('store');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <StoreDataProvider>
            <WishlistProvider>
              <CartProvider>
                <CollegeProvider>
                  <MainApp />
                </CollegeProvider>
              </CartProvider>
            </WishlistProvider>
          </StoreDataProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
