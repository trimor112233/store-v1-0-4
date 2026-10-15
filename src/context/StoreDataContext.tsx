import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Category,
  Subcategory,
  Department,
  College,
  StudentKit,
  Order,
  OrderStatus,
  PaymentStatus,
  Customer,
  Review,
  Coupon,
  HomepageBanner,
  HomepageSettings,
  AdminNotification,
  PrintingRequest,
  CustomOrder,
  StoreSettings,
  CollegeId,
  StockStatus,
  DigitalProduct,
  PickupLocation,
  PaymentMethodConfig,
  DeliverySettings,
  WebsiteContentSettings,
  SocialLinksSettings,
  CustomDesignTemplate,
  InventoryLogItem,
} from '../types';
import {
  productsData,
  categoriesData,
  subcategoriesData,
  departmentsData,
  collegesData,
  studentKitsData,
  digitalProductsData,
  initialOrders,
  initialCustomers,
  initialReviews,
  initialCoupons,
  initialBanners,
  initialHomepageSettings,
  initialPrintingRequests,
  initialCustomOrders,
  initialNotifications,
  initialStoreSettings,
} from '../data/mockData';
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
} from '../lib/supabase';
import {
  fetchAllStoreData,
  createOrderInSupabase,
  seedInitialDataToSupabase,
  syncAllLocalDataToSupabase,
  testSupabaseConnection,
  mapProductToDb,
} from '../services/supabaseStoreService';

interface StoreDataContextType {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  departments: Department[];
  colleges: College[];
  kits: StudentKit[];
  digitalProducts: DigitalProduct[];
  orders: Order[];
  customers: Customer[];
  reviews: Review[];
  coupons: Coupon[];
  banners: HomepageBanner[];
  homepageSettings: HomepageSettings;
  printingRequests: PrintingRequest[];
  customOrders: CustomOrder[];
  notifications: AdminNotification[];
  settings: StoreSettings;
  inventoryLogs: InventoryLogItem[];
  isSupabaseLive: boolean;
  isLoadingData: boolean;

  // Supabase Cloud Sync & Configuration
  supabaseConfig: { url: string; key: string; isConfigured: boolean; isEnvConfigured: boolean };
  saveSupabaseCredentials: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  disconnectSupabaseCredentials: () => void;
  syncLocalToCloud: () => Promise<{ success: boolean; message: string }>;
  testCloudConnection: () => Promise<{ success: boolean; message: string }>;

  // Product Actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<void>;
  toggleProductActive: (id: string) => Promise<void>;
  toggleProductFeatured: (id: string) => Promise<void>;
  toggleProductNew: (id: string) => Promise<void>;
  updateProductStockStatus: (id: string, status: StockStatus) => Promise<void>;

  // Category Actions
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (subcategory: Omit<Subcategory, 'id'>) => Promise<Subcategory>;
  updateSubcategory: (id: string, updates: Partial<Subcategory>) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;

  // Kit Actions
  addKit: (kit: Omit<StudentKit, 'id'>) => Promise<void>;
  updateKit: (id: string, updates: Partial<StudentKit>) => Promise<void>;
  deleteKit: (id: string) => Promise<void>;

  // Digital Product Actions
  addDigitalProduct: (item: Omit<DigitalProduct, 'id'>) => Promise<DigitalProduct>;
  updateDigitalProduct: (id: string, updates: Partial<DigitalProduct>) => Promise<void>;
  deleteDigitalProduct: (id: string) => Promise<void>;

  // Order Actions
  addOrder: (order: Order) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => Promise<void>;
  addOrderInternalNote: (orderId: string, text: string, author?: string) => Promise<void>;
  updateOrderDetails: (orderId: string, updates: Partial<Order>) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Coupon Actions
  addCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<void>;
  updateCoupon: (id: string, updates: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  validateCoupon: (code: string, subtotal: number, collegeId?: CollegeId) => { valid: boolean; discount: number; message: string };

  // Banner & Homepage Actions
  addBanner: (banner: Omit<HomepageBanner, 'id'>) => Promise<void>;
  updateBanner: (id: string, updates: Partial<HomepageBanner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  updateHomepageSettings: (updates: Partial<HomepageSettings>) => Promise<void>;

  // Review Actions
  updateReviewStatus: (id: string, status: 'approved' | 'pending' | 'rejected') => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  toggleReviewFeatured: (id: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'date'>) => Promise<void>;

  // Printing & Custom Actions
  updatePrintingStatus: (id: string, status: PrintingRequest['status']) => Promise<void>;
  updateCustomOrderStatus: (id: string, status: CustomOrder['status']) => Promise<void>;
  addPrintingRequest: (req: Omit<PrintingRequest, 'id' | 'submittedAt'>) => Promise<void>;
  addCustomOrder: (ord: Omit<CustomOrder, 'id' | 'date'>) => Promise<void>;
  addPrintingInternalNote: (id: string, text: string, author?: string) => Promise<void>;
  addCustomOrderInternalNote: (id: string, text: string, author?: string) => Promise<void>;

  // Notification Actions
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Store Settings & Modular Controls
  updateStoreSettings: (updates: Partial<StoreSettings>) => Promise<void>;
  factoryResetAllData: () => Promise<void>;

  // Pickup Location Actions
  updatePickupLocations: (locations: PickupLocation[]) => Promise<void>;
  addPickupLocation: (loc: Omit<PickupLocation, 'id'>) => Promise<PickupLocation>;
  updatePickupLocation: (id: string, updates: Partial<PickupLocation>) => Promise<void>;
  deletePickupLocation: (id: string) => Promise<void>;

  // Payment Method Actions
  updatePaymentMethods: (methods: PaymentMethodConfig[]) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethodConfig, 'id'>) => Promise<PaymentMethodConfig>;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethodConfig>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;

  // Delivery, Website Content, Social Links Actions
  updateDeliverySettings: (delivery: Partial<DeliverySettings>) => Promise<void>;
  updateWebsiteContent: (content: Partial<WebsiteContentSettings>) => Promise<void>;
  updateSocialLinks: (links: Partial<SocialLinksSettings>) => Promise<void>;

  // Custom Design Templates Actions
  addCustomDesignTemplate: (template: Omit<CustomDesignTemplate, 'id'>) => Promise<CustomDesignTemplate>;
  updateCustomDesignTemplate: (id: string, updates: Partial<CustomDesignTemplate>) => Promise<void>;
  deleteCustomDesignTemplate: (id: string) => Promise<void>;

  // College Actions
  addCollege: (college: College) => Promise<void>;
  updateCollege: (id: CollegeId, updates: Partial<College>) => Promise<void>;
  deleteCollege: (id: CollegeId) => Promise<void>;

  // Reload data from Supabase manually
  refreshStoreData: () => Promise<void>;
}

const StoreDataContext = createContext<StoreDataContextType | undefined>(undefined);

import {
  loadFromStorage,
  saveToStorage,
  isKeyInitialized,
  getDeletedIds,
  addDeletedId,
  unmarkDeletedId,
  getAddedMap,
  saveAddedItem,
  removeAddedItem,
  idbGet,
} from '../lib/storage';

export { getDeletedIds, addDeletedId, unmarkDeletedId, getAddedMap, saveAddedItem, removeAddedItem };

export const StoreDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with cached local storage + reconcile with mutation tracking so changes NEVER revert on refresh
  const [products, setProducts] = useState<Product[]>(() => {
    const loaded = loadFromStorage<Product[]>('products', null as any);
    const deletedIds = getDeletedIds('products');
    const addedMap = getAddedMap<Product>('products');

    let base: Product[] = Array.isArray(loaded) ? loaded : productsData;
    // Always filter out items explicitly deleted by the user
    base = base.filter((p) => !deletedIds.has(p.id));
    // Always ensure items added by user are present
    Object.values(addedMap).forEach((localProd) => {
      if (!base.some((p) => p.id === localProd.id) && !deletedIds.has(localProd.id)) {
        base = [localProd, ...base];
      }
    });
    return base;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const loaded = loadFromStorage<Category[]>('categories', null as any);
    const deletedIds = getDeletedIds('categories');
    const addedMap = getAddedMap<Category>('categories');

    let base: Category[] = Array.isArray(loaded) ? loaded : categoriesData;
    base = base.filter((c) => !deletedIds.has(c.id));
    Object.values(addedMap).forEach((localCat) => {
      if (!base.some((c) => c.id === localCat.id) && !deletedIds.has(localCat.id)) {
        base = [...base, localCat];
      }
    });
    return base;
  });

  const [subcategories, setSubcategories] = useState<Subcategory[]>(() => {
    const loaded = loadFromStorage<Subcategory[]>('subcategories', null as any);
    const deletedIds = getDeletedIds('subcategories');
    const addedMap = getAddedMap<Subcategory>('subcategories');

    let base: Subcategory[] = Array.isArray(loaded) ? loaded : subcategoriesData;
    base = base.filter((s) => !deletedIds.has(s.id));
    Object.values(addedMap).forEach((localSub) => {
      if (!base.some((s) => s.id === localSub.id) && !deletedIds.has(localSub.id)) {
        base = [...base, localSub];
      }
    });
    return base;
  });
  const [departments] = useState<Department[]>(() => departmentsData);
  const [colleges, setColleges] = useState<College[]>(() => {
    const loaded = loadFromStorage<College[]>('colleges', null as any);
    const deletedIds = getDeletedIds('colleges');
    let base: College[] = Array.isArray(loaded) ? loaded : (isKeyInitialized('colleges') ? [] : collegesData);
    return base.filter((c) => !deletedIds.has(c.id));
  });
  const [kits, setKits] = useState<StudentKit[]>(() => {
    const loaded = loadFromStorage<StudentKit[]>('kits', null as any);
    const deletedIds = getDeletedIds('kits');
    let base: StudentKit[] = Array.isArray(loaded) ? loaded : (isKeyInitialized('kits') ? [] : studentKitsData);
    return base.filter((k) => !deletedIds.has(k.id));
  });
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>(() => {
    const loaded = loadFromStorage<DigitalProduct[]>('digital_products', null as any);
    const deletedIds = getDeletedIds('digital_products');
    let base: DigitalProduct[] = Array.isArray(loaded) ? loaded : (isKeyInitialized('digital_products') ? [] : digitalProductsData);
    return base.filter((d) => !deletedIds.has(d.id));
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const loaded = loadFromStorage<Order[]>('orders', null as any);
    const deletedIds = getDeletedIds('orders');
    let base: Order[] = Array.isArray(loaded) ? loaded : (isKeyInitialized('orders') ? [] : initialOrders);
    return base.filter((o) => !deletedIds.has(o.id));
  });
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage<Customer[]>('customers', initialCustomers));
  const [reviews, setReviews] = useState<Review[]>(() => {
    const loaded = loadFromStorage<Review[]>('reviews', null as any);
    const deletedIds = getDeletedIds('reviews');
    let base: Review[] = Array.isArray(loaded) ? loaded : (isKeyInitialized('reviews') ? [] : initialReviews);
    return base.filter((r) => !deletedIds.has(r.id));
  });
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const loaded = loadFromStorage<Coupon[]>('coupons', null as any);
    const deletedIds = getDeletedIds('coupons');
    let base: Coupon[] = Array.isArray(loaded) ? loaded : (isKeyInitialized('coupons') ? [] : initialCoupons);
    return base.filter((c) => !deletedIds.has(c.id));
  });
  const [banners, setBanners] = useState<HomepageBanner[]>(() => {
    const loaded = loadFromStorage<HomepageBanner[]>('banners', null as any);
    const deletedIds = getDeletedIds('banners');
    let base: HomepageBanner[] = Array.isArray(loaded) ? loaded : (isKeyInitialized('banners') ? [] : initialBanners);
    return base.filter((b) => !deletedIds.has(b.id));
  });
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(() => loadFromStorage('homepage_settings', initialHomepageSettings));
  const [printingRequests, setPrintingRequests] = useState<PrintingRequest[]>(() => loadFromStorage<PrintingRequest[]>('printing', initialPrintingRequests));
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>(() => loadFromStorage<CustomOrder[]>('custom_orders', initialCustomOrders));
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    const loaded = loadFromStorage<AdminNotification[]>('notifications', []);
    return loaded && loaded.length > 0 ? loaded : initialNotifications;
  });
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const loaded = loadFromStorage<Partial<StoreSettings>>('settings', initialStoreSettings);
    return {
      ...initialStoreSettings,
      ...loaded,
      navigationLinks: loaded.navigationLinks && loaded.navigationLinks.length > 0 ? loaded.navigationLinks : initialStoreSettings.navigationLinks,
      pickupLocations: loaded.pickupLocations && loaded.pickupLocations.length > 0 ? loaded.pickupLocations : initialStoreSettings.pickupLocations,
      paymentMethods: loaded.paymentMethods && loaded.paymentMethods.length > 0 ? loaded.paymentMethods : initialStoreSettings.paymentMethods,
      deliverySettings: { ...initialStoreSettings.deliverySettings, ...(loaded.deliverySettings || {}) },
      websiteContent: { ...initialStoreSettings.websiteContent, ...(loaded.websiteContent || {}) },
      socialLinks: { ...initialStoreSettings.socialLinks, ...(loaded.socialLinks || {}) },
      customDesignTemplates: loaded.customDesignTemplates && loaded.customDesignTemplates.length > 0 ? loaded.customDesignTemplates : initialStoreSettings.customDesignTemplates,
    };
  });
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLogItem[]>(() => loadFromStorage<InventoryLogItem[]>('inventory_logs', []));

  // Asynchronous hydration from IndexedDB for rich persistent state
  useEffect(() => {
    idbGet<Product[]>('products').then((idbProds) => {
      if (idbProds && Array.isArray(idbProds) && idbProds.length > 0) {
        const deletedIds = getDeletedIds('products');
        const filtered = idbProds.filter((p) => !deletedIds.has(p.id));
        if (filtered.length > 0) {
          setProducts(filtered);
        }
      }
    }).catch(() => {});
  }, []);

  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(isSupabaseConfigured());
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Auto-sync state changes to persistent local cache
  useEffect(() => saveToStorage('products', products), [products]);
  useEffect(() => saveToStorage('categories', categories), [categories]);
  useEffect(() => saveToStorage('subcategories', subcategories), [subcategories]);
  useEffect(() => saveToStorage('kits', kits), [kits]);
  useEffect(() => saveToStorage('digital_products', digitalProducts), [digitalProducts]);
  useEffect(() => saveToStorage('orders', orders), [orders]);
  useEffect(() => saveToStorage('customers', customers), [customers]);
  useEffect(() => saveToStorage('reviews', reviews), [reviews]);
  useEffect(() => saveToStorage('coupons', coupons), [coupons]);
  useEffect(() => saveToStorage('banners', banners), [banners]);
  useEffect(() => saveToStorage('homepage_settings', homepageSettings), [homepageSettings]);
  useEffect(() => saveToStorage('printing', printingRequests), [printingRequests]);
  useEffect(() => saveToStorage('custom_orders', customOrders), [customOrders]);
  useEffect(() => saveToStorage('colleges', colleges), [colleges]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('settings', settings), [settings]);
  useEffect(() => saveToStorage('inventory_logs', inventoryLogs), [inventoryLogs]);

  // Load store data from Supabase if configured with mutation reconciliation
  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    if (isSupabaseConfigured()) {
      setIsSupabaseLive(true);
      try {
        const data = await fetchAllStoreData();
        if (data) {
          // Reconcile Products
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            const deletedProdIds = getDeletedIds('products');
            const addedProdMap = getAddedMap<Product>('products');

            let reconciledProds = data.products.filter((p) => !deletedProdIds.has(p.id));
            Object.values(addedProdMap).forEach((addedProd) => {
              if (!reconciledProds.some((p) => p.id === addedProd.id) && !deletedProdIds.has(addedProd.id)) {
                reconciledProds = [addedProd, ...reconciledProds];
              }
            });

            setProducts(reconciledProds);
            saveToStorage('products', reconciledProds);
          }

          // Reconcile Categories
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            const deletedCatIds = getDeletedIds('categories');
            const addedCatMap = getAddedMap<Category>('categories');

            let reconciledCats = data.categories.filter((c) => !deletedCatIds.has(c.id)) as Category[];
            Object.values(addedCatMap).forEach((addedCat) => {
              if (!reconciledCats.some((c) => c.id === addedCat.id) && !deletedCatIds.has(addedCat.id)) {
                reconciledCats = [...reconciledCats, addedCat];
              }
            });

            setCategories(reconciledCats);
            saveToStorage('categories', reconciledCats);
          }

          // Reconcile Subcategories
          if (data.subcategories && Array.isArray(data.subcategories) && data.subcategories.length > 0) {
            const deletedSubIds = getDeletedIds('subcategories');
            const addedSubMap = getAddedMap<Subcategory>('subcategories');

            let reconciledSubs = data.subcategories.filter((s) => !deletedSubIds.has(s.id));
            Object.values(addedSubMap).forEach((addedSub) => {
              if (!reconciledSubs.some((s) => s.id === addedSub.id) && !deletedSubIds.has(addedSub.id)) {
                reconciledSubs = [...reconciledSubs, addedSub];
              }
            });

            setSubcategories(reconciledSubs);
            saveToStorage('subcategories', reconciledSubs);
          }

          if (data.colleges && data.colleges.length > 0) {
            setColleges(data.colleges);
            saveToStorage('colleges', data.colleges);
          }
          if (data.kits && data.kits.length > 0) {
            setKits(data.kits);
            saveToStorage('kits', data.kits);
          }
          if (data.digitalProducts && data.digitalProducts.length > 0) {
            setDigitalProducts(data.digitalProducts);
            saveToStorage('digital_products', data.digitalProducts);
          }
          if (data.orders && Array.isArray(data.orders)) {
            setOrders(data.orders);
            saveToStorage('orders', data.orders);
          }
          if (data.reviews && Array.isArray(data.reviews)) {
            const deletedRevIds = getDeletedIds('reviews');
            const filteredRevs = data.reviews.filter((r) => !deletedRevIds.has(r.id));
            setReviews(filteredRevs);
            saveToStorage('reviews', filteredRevs);
          }

          // Reconcile Coupons
          if (data.coupons && Array.isArray(data.coupons) && data.coupons.length > 0) {
            const deletedCoupIds = getDeletedIds('coupons');
            const addedCoupMap = getAddedMap<Coupon>('coupons');

            let reconciledCoups = data.coupons.filter((c) => !deletedCoupIds.has(c.id)) as Coupon[];
            Object.values(addedCoupMap).forEach((addedCoup) => {
              if (!reconciledCoups.some((c) => c.id === addedCoup.id) && !deletedCoupIds.has(addedCoup.id)) {
                reconciledCoups = [...reconciledCoups, addedCoup];
              }
            });

            setCoupons(reconciledCoups);
            saveToStorage('coupons', reconciledCoups);
          }

          // Reconcile Banners
          if (data.banners && Array.isArray(data.banners) && data.banners.length > 0) {
            const deletedBanIds = getDeletedIds('banners');
            const addedBanMap = getAddedMap<HomepageBanner>('banners');

            let reconciledBans = data.banners.filter((b) => !deletedBanIds.has(b.id)) as HomepageBanner[];
            Object.values(addedBanMap).forEach((addedBan) => {
              if (!reconciledBans.some((b) => b.id === addedBan.id) && !deletedBanIds.has(addedBan.id)) {
                reconciledBans = [...reconciledBans, addedBan];
              }
            });

            setBanners(reconciledBans);
            saveToStorage('banners', reconciledBans);
          }

          if (data.homepageSettings) {
            setHomepageSettings(data.homepageSettings);
            saveToStorage('homepage_settings', data.homepageSettings);
          }
          if (data.printingRequests) {
            setPrintingRequests(data.printingRequests);
            saveToStorage('printing', data.printingRequests);
          }
          if (data.customOrders) {
            setCustomOrders(data.customOrders);
            saveToStorage('custom_orders', data.customOrders);
          }
          if (data.notifications) {
            setNotifications(data.notifications);
            saveToStorage('notifications', data.notifications);
          }
          if (data.storeSettings) {
            setSettings(data.storeSettings);
            saveToStorage('settings', data.storeSettings);
          }
          if (data.inventoryLogs) {
            setInventoryLogs(data.inventoryLogs);
            saveToStorage('inventory_logs', data.inventoryLogs);
          }

          // Seed initial data ONLY ONCE if never seeded before
          if (typeof window !== 'undefined' && localStorage.getItem('sh_supabase_seeded') !== 'true') {
            await seedInitialDataToSupabase({
              products: productsData,
              categories: categoriesData,
              settings: initialStoreSettings,
            });
            localStorage.setItem('sh_supabase_seeded', 'true');
          }
        }
      } catch (err) {
        console.warn('[StoreData] Error syncing with cloud database:', err);
      }
    } else {
      setIsSupabaseLive(false);
    }
    setIsLoadingData(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Setup Supabase Realtime Subscription for instant cross-device updates
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured()) return;

    try {
      const channel = supabase
        .channel('store_realtime_sync')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          // Refetch latest data when any table changes on any device
          fetchAllStoreData().then((data) => {
            if (data) {
              if (data.products !== undefined) {
                const deletedProdIds = getDeletedIds('products');
                const addedProdMap = getAddedMap<Product>('products');
                let reconciledProds = data.products.filter((p) => !deletedProdIds.has(p.id));
                Object.values(addedProdMap).forEach((addedProd) => {
                  if (!reconciledProds.some((p) => p.id === addedProd.id) && !deletedProdIds.has(addedProd.id)) {
                    reconciledProds = [addedProd, ...reconciledProds];
                  }
                });
                setProducts(reconciledProds);
                saveToStorage('products', reconciledProds);
              }
              if (data.categories !== undefined) {
                const deletedCatIds = getDeletedIds('categories');
                const addedCatMap = getAddedMap<Category>('categories');
                let reconciledCats = data.categories.filter((c) => !deletedCatIds.has(c.id)) as Category[];
                Object.values(addedCatMap).forEach((addedCat) => {
                  if (!reconciledCats.some((c) => c.id === addedCat.id) && !deletedCatIds.has(addedCat.id)) {
                    reconciledCats = [...reconciledCats, addedCat];
                  }
                });
                setCategories(reconciledCats);
                saveToStorage('categories', reconciledCats);
              }
              if (data.subcategories !== undefined) {
                const deletedSubIds = getDeletedIds('subcategories');
                const addedSubMap = getAddedMap<Subcategory>('subcategories');
                let reconciledSubs = data.subcategories.filter((s) => !deletedSubIds.has(s.id));
                Object.values(addedSubMap).forEach((addedSub) => {
                  if (!reconciledSubs.some((s) => s.id === addedSub.id) && !deletedSubIds.has(addedSub.id)) {
                    reconciledSubs = [...reconciledSubs, addedSub];
                  }
                });
                setSubcategories(reconciledSubs);
                saveToStorage('subcategories', reconciledSubs);
              }
              if (data.orders !== undefined) {
                const deletedOrderIds = getDeletedIds('orders');
                const reconciledOrders = data.orders.filter((o) => !deletedOrderIds.has(o.id));
                setOrders(reconciledOrders);
                saveToStorage('orders', reconciledOrders);
              }
              if (data.coupons !== undefined) {
                const deletedCoupIds = getDeletedIds('coupons');
                const addedCoupMap = getAddedMap<Coupon>('coupons');
                let reconciledCoups = data.coupons.filter((c) => !deletedCoupIds.has(c.id)) as Coupon[];
                Object.values(addedCoupMap).forEach((addedCoup) => {
                  if (!reconciledCoups.some((c) => c.id === addedCoup.id) && !deletedCoupIds.has(addedCoup.id)) {
                    reconciledCoups = [...reconciledCoups, addedCoup];
                  }
                });
                setCoupons(reconciledCoups);
                saveToStorage('coupons', reconciledCoups);
              }
              if (data.reviews !== undefined) {
                const deletedRevIds = getDeletedIds('reviews');
                const reconciledRevs = data.reviews.filter((r) => !deletedRevIds.has(r.id));
                setReviews(reconciledRevs);
                saveToStorage('reviews', reconciledRevs);
              }
              if (data.storeSettings) {
                setSettings(data.storeSettings);
                saveToStorage('settings', data.storeSettings);
              }
              if (data.inventoryLogs) {
                setInventoryLogs(data.inventoryLogs);
                saveToStorage('inventory_logs', data.inventoryLogs);
              }
            }
          });
        })
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    } catch (err) {
      console.warn('Realtime channel subscription skipped:', err);
    }
  }, [isSupabaseLive]);

  // ===================== SUPABASE CREDENTIALS & SYNC =====================
  const supabaseConfig = {
    ...getSupabaseConfig(),
    isConfigured: isSupabaseConfigured(),
  };

  const saveSupabaseCredentials = useCallback(async (url: string, key: string) => {
    saveSupabaseConfig(url, key);
    const result = await testSupabaseConnection();
    if (result.success) {
      setIsSupabaseLive(true);
      await loadData();
    } else {
      setIsSupabaseLive(false);
    }
    return result;
  }, [loadData]);

  const disconnectSupabaseCredentials = useCallback(() => {
    clearSupabaseConfig();
    setIsSupabaseLive(false);
  }, []);

  const syncLocalToCloud = useCallback(async () => {
    return await syncAllLocalDataToSupabase({
      products,
      categories,
      subcategories,
      settings,
      coupons,
      banners,
      orders,
    });
  }, [products, categories, subcategories, settings, coupons, banners, orders]);

  const testCloudConnection = useCallback(async () => {
    return await testSupabaseConnection();
  }, []);

  // ===================== COLLEGE HANDLERS =====================
  const addCollege = useCallback(async (col: College) => {
    setColleges((prev) => {
      const updated = [...prev, col];
      saveToStorage('colleges', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('colleges').insert({
        id: col.id,
        name: col.name,
        name_ar: col.nameAr,
        icon: col.icon,
        description: col.description,
        description_ar: col.descriptionAr,
      });
    }
  }, []);

  const updateCollege = useCallback(async (id: CollegeId, updates: Partial<College>) => {
    setColleges((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveToStorage('colleges', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('colleges').update({
        ...(updates.name && { name: updates.name }),
        ...(updates.nameAr && { name_ar: updates.nameAr }),
        ...(updates.icon && { icon: updates.icon }),
        ...(updates.description && { description: updates.description }),
        ...(updates.descriptionAr && { description_ar: updates.descriptionAr }),
      }).eq('id', id);
    }
  }, []);

  const deleteCollege = useCallback(async (id: CollegeId) => {
    addDeletedId('colleges', id);
    setColleges((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveToStorage('colleges', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('colleges').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Delete college cloud error:', err);
      }
    }
  }, []);

  // ===================== PRODUCT HANDLERS =====================
  const addProduct = useCallback(async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = { ...productData, id };
    
    // Track locally so refresh never loses the added product
    saveAddedItem('products', newProduct);
    unmarkDeletedId('products', id);

    setProducts((prev) => {
      const updated = [newProduct, ...prev.filter((p) => p.id !== id)];
      saveToStorage('products', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      try {
        const dbRow = mapProductToDb(newProduct);
        const { error } = await supabase.from('products').insert(dbRow);
        if (error) console.warn('[Supabase] Add product cloud sync:', error.message);
      } catch (err) {
        console.warn('[Supabase] Network error during product insert:', err);
      }
    }

    return newProduct;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveToStorage('products', updated);
      const target = updated.find((p) => p.id === id);
      if (target) saveAddedItem('products', target);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      try {
        const dbRow = mapProductToDb(updates);
        await supabase.from('products').update(dbRow).eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Network error updating product:', err);
      }
    }
  }, []);

  const updateProductStockStatus = useCallback(async (id: string, status: StockStatus) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        const inStock = status !== 'out_of_stock';
        const stock = status === 'out_of_stock' ? 0 : status === 'low_stock' && p.stock > 10 ? 5 : p.stock;
        return { ...p, stockStatus: status, inStock, stock };
      });
      saveToStorage('products', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      try {
        const target = products.find((p) => p.id === id);
        const inStock = status !== 'out_of_stock';
        const stock = status === 'out_of_stock' ? 0 : status === 'low_stock' && target && target.stock > 10 ? 5 : target?.stock || 0;
        await supabase.from('products').update({
          stock_status: status,
          in_stock: inStock,
          stock,
        }).eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Network error updating product stock:', err);
      }
    }
  }, [products]);

  const deleteProduct = useCallback(async (id: string) => {
    // Record in deleted tracking so refresh never brings it back
    addDeletedId('products', id);
    removeAddedItem('products', id);

    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveToStorage('products', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) console.warn('[Supabase] Delete product cloud sync:', error.message);
      } catch (err) {
        console.warn('[Supabase] Network error deleting product:', err);
      }
    }
  }, []);

  const duplicateProduct = useCallback(async (id: string) => {
    const source = products.find((p) => p.id === id);
    if (!source) return;

    const duplicated: Product = {
      ...source,
      id: `prod-${Date.now()}`,
      title: `${source.title} (Copy)`,
      rating: 5.0,
      reviewsCount: 0,
    };
    setProducts((prev) => {
      const updated = [duplicated, ...prev];
      saveToStorage('products', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('products').insert(mapProductToDb(duplicated));
    }
  }, [products]);

  const toggleProductActive = useCallback(async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const nextActive = !target.active;
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, active: nextActive } : p));
      saveToStorage('products', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('products').update({ active: nextActive }).eq('id', id);
    }
  }, [products]);

  const toggleProductFeatured = useCallback(async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const nextFeat = !target.featured;
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, featured: nextFeat } : p));
      saveToStorage('products', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('products').update({ featured: nextFeat }).eq('id', id);
    }
  }, [products]);

  const toggleProductNew = useCallback(async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const nextNew = !target.isNewArrival;
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, isNewArrival: nextNew } : p));
      saveToStorage('products', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('products').update({ is_new_arrival: nextNew }).eq('id', id);
    }
  }, [products]);

  // ===================== CATEGORY & SUBCATEGORY HANDLERS =====================
  const addCategory = useCallback(async (catData: Omit<Category, 'id'>): Promise<Category> => {
    const id = `cat-${catData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newCat: Category = { ...catData, isVisible: true, id };

    saveAddedItem('categories', newCat);
    unmarkDeletedId('categories', id);

    setCategories((prev) => {
      const updated = [...prev.filter((c) => c.id !== id), newCat];
      saveToStorage('categories', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').insert({
          id,
          name: newCat.name,
          college_id: newCat.collegeId,
          icon: newCat.icon || '📦',
        });
      } catch (err) {
        console.warn('[Supabase] Add category network error:', err);
      }
    }

    return newCat;
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveToStorage('categories', updated);
      const target = updated.find((c) => c.id === id);
      if (target) saveAddedItem('categories', target);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').update({
          ...(updates.name && { name: updates.name }),
          ...(updates.collegeId && { college_id: updates.collegeId }),
          ...(updates.icon && { icon: updates.icon }),
        }).eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Update category network error:', err);
      }
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    addDeletedId('categories', id);
    removeAddedItem('categories', id);

    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveToStorage('categories', updated);
      return updated;
    });
    setSubcategories((prev) => {
      const updated = prev.filter((s) => s.categoryId !== id);
      saveToStorage('subcategories', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Delete category network error:', err);
      }
    }
  }, []);

  const addSubcategory = useCallback(async (subData: Omit<Subcategory, 'id'>): Promise<Subcategory> => {
    const id = `sub-${subData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newSub: Subcategory = { ...subData, id };

    saveAddedItem('subcategories', newSub);
    unmarkDeletedId('subcategories', id);

    setSubcategories((prev) => {
      const updated = [...prev.filter((s) => s.id !== id), newSub];
      saveToStorage('subcategories', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('subcategories').insert({
          id,
          name: newSub.name,
          category_id: newSub.categoryId,
          college_id: newSub.collegeId,
        });
      } catch (err) {
        console.warn('[Supabase] Add subcategory network error:', err);
      }
    }

    return newSub;
  }, []);

  const updateSubcategory = useCallback(async (id: string, updates: Partial<Subcategory>) => {
    setSubcategories((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      saveToStorage('subcategories', updated);
      const target = updated.find((s) => s.id === id);
      if (target) saveAddedItem('subcategories', target);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('subcategories').update({
          ...(updates.name && { name: updates.name }),
          ...(updates.categoryId && { category_id: updates.categoryId }),
          ...(updates.collegeId && { college_id: updates.collegeId }),
        }).eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Update subcategory network error:', err);
      }
    }
  }, []);

  const deleteSubcategory = useCallback(async (id: string) => {
    addDeletedId('subcategories', id);
    removeAddedItem('subcategories', id);

    setSubcategories((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveToStorage('subcategories', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('subcategories').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Delete subcategory network error:', err);
      }
    }
  }, []);

  // ===================== KIT HANDLERS =====================
  const addKit = useCallback(async (kitData: Omit<StudentKit, 'id'>) => {
    const newKit: StudentKit = { ...kitData, id: `kit-${Date.now()}` };
    setKits((prev) => {
      const updated = [newKit, ...prev];
      saveToStorage('kits', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('student_kits').insert({
        id: newKit.id,
        title: newKit.title,
        college_id: newKit.collegeId,
        price: newKit.price,
        original_price: newKit.originalPrice,
        image: newKit.image,
        badge: newKit.badge,
        in_stock: newKit.active ?? true,
        description: newKit.description,
        items_included: newKit.itemsList,
      });
    }
  }, []);

  const updateKit = useCallback(async (id: string, updates: Partial<StudentKit>) => {
    setKits((prev) => {
      const updated = prev.map((k) => (k.id === id ? { ...k, ...updates } : k));
      saveToStorage('kits', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('student_kits').update({
        ...(updates.title && { title: updates.title }),
        ...(updates.price !== undefined && { price: updates.price }),
        ...(updates.originalPrice !== undefined && { original_price: updates.originalPrice }),
        ...(updates.image && { image: updates.image }),
        ...(updates.description && { description: updates.description }),
        ...(updates.active !== undefined && { in_stock: updates.active }),
      }).eq('id', id);
    }
  }, []);

  const deleteKit = useCallback(async (id: string) => {
    addDeletedId('kits', id);
    removeAddedItem('kits', id);
    setKits((prev) => {
      const updated = prev.filter((k) => k.id !== id);
      saveToStorage('kits', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('student_kits').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Delete kit cloud error:', err);
      }
    }
  }, []);

  // ===================== DIGITAL PRODUCT HANDLERS =====================
  const addDigitalProduct = useCallback(async (itemData: Omit<DigitalProduct, 'id'>): Promise<DigitalProduct> => {
    const id = `dig-${Date.now()}`;
    const newDig: DigitalProduct = { ...itemData, id };
    saveAddedItem('digital_products', newDig);
    unmarkDeletedId('digital_products', id);

    setDigitalProducts((prev) => {
      const updated = [newDig, ...prev];
      saveToStorage('digital_products', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('digital_products').insert({
          id: newDig.id,
          title: newDig.title,
          college_id: newDig.collegeId,
          file_type: newDig.fileType,
          size: newDig.size,
          price: newDig.price,
          downloads_count: newDig.downloadsCount || 0,
          active: newDig.active,
          description: newDig.description,
          features: newDig.features,
        });
      } catch (err) {
        console.warn('[Supabase] Add digital product error:', err);
      }
    }

    return newDig;
  }, []);

  const updateDigitalProduct = useCallback(async (id: string, updates: Partial<DigitalProduct>) => {
    setDigitalProducts((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...updates } : d));
      saveToStorage('digital_products', updated);
      const target = updated.find((d) => d.id === id);
      if (target) saveAddedItem('digital_products', target);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('digital_products').update({
          ...(updates.title && { title: updates.title }),
          ...(updates.price !== undefined && { price: updates.price }),
          ...(updates.active !== undefined && { active: updates.active }),
          ...(updates.description && { description: updates.description }),
        }).eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Update digital product error:', err);
      }
    }
  }, []);

  const deleteDigitalProduct = useCallback(async (id: string) => {
    addDeletedId('digital_products', id);
    removeAddedItem('digital_products', id);
    setDigitalProducts((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      saveToStorage('digital_products', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('digital_products').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Delete digital product cloud error:', err);
      }
    }
  }, []);

  // ===================== ORDER HANDLERS =====================
  const addOrder = useCallback(async (order: Order): Promise<boolean> => {
    setOrders((prev) => {
      const updated = [order, ...prev];
      saveToStorage('orders', updated);
      return updated;
    });

    // Save to Supabase if configured
    let savedInDb = true;
    if (supabase && isSupabaseConfigured()) {
      savedInDb = await createOrderInSupabase(order);
    }

    // Deduct stock for physical items
    for (const item of order.items || []) {
      if (item.type === 'product') {
        const liveProd = products.find((p) => p.id === item.id);
        if (liveProd && liveProd.stock !== undefined) {
          const threshold = liveProd.lowStockThreshold || 10;
          const newStock = Math.max(0, liveProd.stock - item.quantity);
          const computedStatus: StockStatus = newStock === 0 ? 'out_of_stock' : newStock <= threshold ? 'low_stock' : 'in_stock';

          setProducts((prev) => {
            const updated = prev.map((p) => (p.id === item.id ? { ...p, stock: newStock, stockStatus: computedStatus, inStock: newStock > 0 } : p));
            saveToStorage('products', updated);
            return updated;
          });

          if (supabase && isSupabaseConfigured()) {
            await supabase.from('products').update({
              stock: newStock,
              stock_status: computedStatus,
              in_stock: newStock > 0,
            }).eq('id', item.id);

            // Record inventory log
            await supabase.from('inventory_logs').insert({
              id: `log-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
              product_id: item.id,
              product_title: item.title,
              action: 'sold',
              quantity_delta: -item.quantity,
              previous_stock: liveProd.stock,
              new_stock: newStock,
              date_time: new Date().toISOString().replace('T', ' ').slice(0, 16),
              admin_name: 'Customer Order',
            });
          }
        }
      }
    }

    return savedInDb;
  }, [products]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status,
          timeline: [
            ...ord.timeline,
            { status, date: now, description: `Order status updated to ${status}` },
          ],
        };
      });
      saveToStorage('orders', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      const targetOrder = orders.find((o) => o.id === orderId);
      const newTimeline = [
        ...(targetOrder?.timeline || []),
        { status, date: now, description: `Order status updated to ${status}` },
      ];
      await supabase.from('orders').update({
        status,
        timeline: newTimeline,
      }).eq('id', orderId);
    }
  }, [orders]);

  const updatePaymentStatus = useCallback(async (orderId: string, status: PaymentStatus) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => (ord.id === orderId ? { ...ord, paymentStatus: status } : ord));
      saveToStorage('orders', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('orders').update({ payment_status: status }).eq('id', orderId);
    }
  }, []);

  const addOrderInternalNote = useCallback(async (orderId: string, text: string, author: string = 'Admin') => {
    const newNote = {
      id: `note-${Date.now()}`,
      text,
      author,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id !== orderId) return o;
        return { ...o, internalNotes: [...(o.internalNotes || []), newNote] };
      });
      saveToStorage('orders', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      const targetOrder = orders.find((o) => o.id === orderId);
      const newNotes = [...(targetOrder?.internalNotes || []), newNote];
      await supabase.from('orders').update({ internal_notes: newNotes }).eq('id', orderId);
    }
  }, [orders]);

  const updateOrderDetails = useCallback(async (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
      saveToStorage('orders', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('orders').update({
        ...(updates.status && { status: updates.status }),
        ...(updates.paymentStatus && { payment_status: updates.paymentStatus }),
      }).eq('id', orderId);
    }
  }, []);

  const cancelOrder = useCallback(async (orderId: string, reason: string = 'Cancelled by administrator') => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const targetOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: 'Cancelled' as OrderStatus,
          timeline: [...ord.timeline, { status: 'Cancelled' as OrderStatus, date: now, description: reason }],
        };
      });
      saveToStorage('orders', updated);
      return updated;
    });

    if (targetOrder) {
      // Restore physical product stock
      for (const item of targetOrder.items || []) {
        if (item.type === 'product') {
          const liveProd = products.find((p) => p.id === item.id);
          if (liveProd) {
            const restoredStock = liveProd.stock + item.quantity;
            setProducts((prev) => {
              const updated = prev.map((p) => (p.id === item.id ? { ...p, stock: restoredStock, inStock: true, stockStatus: 'in_stock' as StockStatus } : p));
              saveToStorage('products', updated);
              return updated;
            });

            if (supabase && isSupabaseConfigured()) {
              await supabase.from('products').update({
                stock: restoredStock,
                in_stock: true,
                stock_status: 'in_stock',
              }).eq('id', item.id);
            }
          }
        }
      }

      if (supabase && isSupabaseConfigured()) {
        const newTimeline = [...targetOrder.timeline, { status: 'Cancelled' as OrderStatus, date: now, description: reason }];
        await supabase.from('orders').update({
          status: 'Cancelled',
          timeline: newTimeline,
        }).eq('id', orderId);
      }
    }
  }, [orders, products]);

  const deleteOrder = useCallback(async (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      saveToStorage('orders', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('orders').delete().eq('id', orderId);
    }
  }, []);

  // ===================== COUPON HANDLERS =====================
  const addCoupon = useCallback(async (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = { ...couponData, id: `coup-${Date.now()}` };
    setCoupons((prev) => {
      const updated = [newCoupon, ...prev];
      saveToStorage('coupons', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('coupons').insert({
        id: newCoupon.id,
        code: newCoupon.code,
        discount_type: newCoupon.discountType,
        discount_value: newCoupon.discountValue,
        min_order_amount: newCoupon.minOrderAmount,
        college_id: newCoupon.collegeId,
        max_uses: newCoupon.maxUses,
        times_used: newCoupon.timesUsed,
        expiry_date: newCoupon.expiryDate,
        active: newCoupon.active,
      });
    }
  }, []);

  const updateCoupon = useCallback(async (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveToStorage('coupons', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('coupons').update({
        ...(updates.code && { code: updates.code }),
        ...(updates.active !== undefined && { active: updates.active }),
        ...(updates.discountValue !== undefined && { discount_value: updates.discountValue }),
      }).eq('id', id);
    }
  }, []);

  const deleteCoupon = useCallback(async (id: string) => {
    setCoupons((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveToStorage('coupons', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('coupons').delete().eq('id', id);
    }
  }, []);

  const validateCoupon = useCallback(
    (code: string, subtotal: number, collegeId?: CollegeId): { valid: boolean; discount: number; message: string } => {
      const clean = code.trim().toUpperCase();
      const coupon = coupons.find((c) => c.code.toUpperCase() === clean);

      if (!coupon || !coupon.active) {
        return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
      }

      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        return {
          valid: false,
          discount: 0,
          message: `Minimum order amount of ${coupon.minOrderAmount} EGP required for this voucher.`,
        };
      }

      if (coupon.collegeId && coupon.collegeId !== 'all' && collegeId && coupon.collegeId !== collegeId) {
        return {
          valid: false,
          discount: 0,
          message: `This coupon is exclusively valid for ${coupon.collegeId.toUpperCase()} students.`,
        };
      }

      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = Math.round((subtotal * coupon.discountValue) / 100);
      } else {
        discount = coupon.discountValue;
      }

      return { valid: true, discount: Math.min(discount, subtotal), message: `Applied ${coupon.code} (-${discount} EGP)` };
    },
    [coupons]
  );

  // ===================== BANNER & HOMEPAGE HANDLERS =====================
  const addBanner = useCallback(async (bannerData: Omit<HomepageBanner, 'id'>) => {
    const newBanner: HomepageBanner = { ...bannerData, id: `ban-${Date.now()}` };
    setBanners((prev) => {
      const updated = [...prev, newBanner];
      saveToStorage('banners', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('homepage_banners').insert({
        id: newBanner.id,
        title: newBanner.title,
        subtitle: newBanner.subtitle,
        badge: newBanner.badge,
        image: newBanner.image,
        button_text: newBanner.buttonText,
        link_view: newBanner.linkView,
        link_college: newBanner.linkCollege,
        college_id: newBanner.collegeId,
        active: newBanner.active,
        banner_order: newBanner.order,
      });
    }
  }, []);

  const updateBanner = useCallback(async (id: string, updates: Partial<HomepageBanner>) => {
    setBanners((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      saveToStorage('banners', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('homepage_banners').update({
        ...(updates.title && { title: updates.title }),
        ...(updates.active !== undefined && { active: updates.active }),
        ...(updates.image && { image: updates.image }),
      }).eq('id', id);
    }
  }, []);

  const deleteBanner = useCallback(async (id: string) => {
    setBanners((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      saveToStorage('banners', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('homepage_banners').delete().eq('id', id);
    }
  }, []);

  const updateHomepageSettings = useCallback(async (updates: Partial<HomepageSettings>) => {
    setHomepageSettings((prev) => {
      const updated = { ...prev, ...updates };
      saveToStorage('homepage_settings', updated);
      if (supabase && isSupabaseConfigured()) {
        supabase.from('homepage_settings').upsert({
          id: 'default',
          hero_title: updated.heroTitle,
          hero_subtitle: updated.heroSubtitle,
          hero_button_primary: updated.heroButtonPrimary,
          hero_button_secondary: updated.heroButtonSecondary,
          hero_image: updated.heroImage,
          announcement_active: updated.announcementActive,
          announcement_text: updated.announcementText,
          sections: updated.sections,
        });
      }
      return updated;
    });
  }, []);

  // ===================== REVIEW HANDLERS =====================
  const updateReviewStatus = useCallback(async (id: string, status: 'approved' | 'pending' | 'rejected') => {
    setReviews((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, status } : r));
      saveToStorage('reviews', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('reviews').update({ status }).eq('id', id);
    }
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    setReviews((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveToStorage('reviews', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('reviews').delete().eq('id', id);
    }
  }, []);

  const toggleReviewFeatured = useCallback(async (id: string) => {
    const target = reviews.find((r) => r.id === id);
    if (!target) return;
    const nextFeat = !target.isFeatured;
    setReviews((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, isFeatured: nextFeat } : r));
      saveToStorage('reviews', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('reviews').update({ is_featured: nextFeat }).eq('id', id);
    }
  }, [reviews]);

  const addReview = useCallback(async (revData: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      ...revData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setReviews((prev) => {
      const updated = [newRev, ...prev];
      saveToStorage('reviews', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('reviews').insert({
        id: newRev.id,
        product_id: newRev.productId,
        product_title: newRev.productTitle,
        student_name: newRev.studentName,
        student_college: newRev.studentCollege,
        rating: newRev.rating,
        comment: newRev.comment,
        date: newRev.date,
        status: newRev.status,
      });
    }
  }, []);

  // ===================== PRINTING & CUSTOM ORDER HANDLERS =====================
  const updatePrintingStatus = useCallback(async (id: string, status: PrintingRequest['status']) => {
    setPrintingRequests((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, status } : p));
      saveToStorage('printing', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('printing_requests').update({ status }).eq('id', id);
    }
  }, []);

  const updateCustomOrderStatus = useCallback(async (id: string, status: CustomOrder['status']) => {
    setCustomOrders((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, status } : c));
      saveToStorage('custom_orders', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('custom_orders').update({ status }).eq('id', id);
    }
  }, []);

  const addPrintingRequest = useCallback(async (reqData: Omit<PrintingRequest, 'id' | 'submittedAt'>) => {
    const newReq: PrintingRequest = {
      ...reqData,
      id: `PR-${Math.floor(1000 + Math.random() * 9000)}`,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      timeline: [{ status: reqData.status || 'Pending', date: new Date().toISOString().split('T')[0], description: 'Request submitted' }],
    };
    setPrintingRequests((prev) => {
      const updated = [newReq, ...prev];
      saveToStorage('printing', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('printing_requests').insert({
        id: newReq.id,
        customer_name: newReq.customerName,
        phone: newReq.phone,
        email: newReq.email,
        college: newReq.collegeId,
        file_name: newReq.fileName,
        file_url: newReq.fileUrl,
        pages: newReq.pages,
        copies: newReq.copies,
        color_type: newReq.colorMode,
        paper_type: newReq.paperType,
        binding_type: newReq.binding,
        pickup_point: newReq.pickupPoint,
        total_price: newReq.price,
        status: newReq.status,
        submitted_at: newReq.submittedAt,
        notes: newReq.notes,
        timeline: newReq.timeline,
      });
    }
  }, []);

  const addCustomOrder = useCallback(async (ordData: Omit<CustomOrder, 'id' | 'date'>) => {
    const newCustom: CustomOrder = {
      ...ordData,
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      timeline: [{ status: ordData.status || 'Pending', date: new Date().toISOString().split('T')[0], description: 'Custom order submitted' }],
    };
    setCustomOrders((prev) => {
      const updated = [newCustom, ...prev];
      saveToStorage('custom_orders', updated);
      return updated;
    });

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('custom_orders').insert({
        id: newCustom.id,
        customer_name: newCustom.customerName,
        phone: newCustom.phone,
        email: newCustom.email,
        college: newCustom.collegeId || newCustom.facultyBadge,
        product_type: newCustom.productType,
        title: newCustom.productType,
        description: newCustom.notes,
        color: newCustom.selectedColor,
        customization_text: newCustom.customizationText,
        reference_image: newCustom.referenceImage,
        quantity: newCustom.quantity,
        total_price: newCustom.price,
        status: newCustom.status,
        date: newCustom.date,
        timeline: newCustom.timeline,
      });
    }
  }, []);

  const addPrintingInternalNote = useCallback(async (id: string, text: string, author: string = 'Admin') => {
    const note = { id: `note-${Date.now()}`, text, author, createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
    setPrintingRequests((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, internalNotes: [...(p.internalNotes || []), note] } : p));
      saveToStorage('printing', updated);
      return updated;
    });
  }, []);

  const addCustomOrderInternalNote = useCallback(async (id: string, text: string, author: string = 'Admin') => {
    const note = { id: `note-${Date.now()}`, text, author, createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
    setCustomOrders((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, internalNotes: [...(c.internalNotes || []), note] } : c));
      saveToStorage('custom_orders', updated);
      return updated;
    });
  }, []);

  // ===================== NOTIFICATIONS =====================
  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveToStorage('notifications', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveToStorage('notifications', updated);
      return updated;
    });
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('notifications').update({ read: true }).neq('id', '');
    }
  }, []);

  // ===================== STORE SETTINGS =====================
  const updateStoreSettings = useCallback(async (updates: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      saveToStorage('settings', updated);
      if (supabase && isSupabaseConfigured()) {
        supabase.from('store_settings').upsert({
          id: 'default',
          store_name: updated.storeName,
          tagline: updated.tagline,
          logo_url: updated.logoUrl,
          favicon_url: updated.faviconUrl,
          store_description: updated.storeDescription,
          physical_address: updated.physicalAddress,
          support_phone: updated.supportPhone,
          support_email: updated.supportEmail,
          free_shipping_threshold: updated.freeShippingThreshold,
          standard_shipping_fee: updated.standardShippingFee,
          currency: updated.currency,
          currency_symbol: updated.currencySymbol,
          tax_rate: updated.taxRate,
          campuses: updated.campuses,
          admin_pin: updated.adminPin,
          store_open: updated.storeOpen,
          store_closed_message: updated.storeClosedMessage,
          site_title: updated.siteTitle,
          meta_description: updated.metaDescription,
          social_sharing_image: updated.socialSharingImage,
          navigation_links: updated.navigationLinks,
          pickup_locations: updated.pickupLocations,
          payment_methods: updated.paymentMethods,
          delivery_settings: updated.deliverySettings,
          website_content: updated.websiteContent,
          social_links: updated.socialLinks,
          custom_design_templates: updated.customDesignTemplates,
        });
      }
      return updated;
    });
  }, []);

  const factoryResetAllData = useCallback(async () => {
    localStorage.clear();
    setProducts(productsData);
    setCategories(categoriesData);
    setSubcategories(subcategoriesData);
    setOrders(initialOrders);
    setCoupons(initialCoupons);
    setSettings(initialStoreSettings);
    await loadData();
  }, [loadData]);

  // Pickup location helpers
  const updatePickupLocations = useCallback(async (locations: PickupLocation[]) => {
    await updateStoreSettings({ pickupLocations: locations });
  }, [updateStoreSettings]);

  const addPickupLocation = useCallback(async (locData: Omit<PickupLocation, 'id'>) => {
    const newLoc: PickupLocation = { ...locData, id: `loc-${Date.now()}` };
    const updated = [...settings.pickupLocations, newLoc];
    await updateStoreSettings({ pickupLocations: updated });
    return newLoc;
  }, [settings.pickupLocations, updateStoreSettings]);

  const updatePickupLocation = useCallback(async (id: string, updates: Partial<PickupLocation>) => {
    const updated = settings.pickupLocations.map((l) => (l.id === id ? { ...l, ...updates } : l));
    await updateStoreSettings({ pickupLocations: updated });
  }, [settings.pickupLocations, updateStoreSettings]);

  const deletePickupLocation = useCallback(async (id: string) => {
    const updated = settings.pickupLocations.filter((l) => l.id !== id);
    await updateStoreSettings({ pickupLocations: updated });
  }, [settings.pickupLocations, updateStoreSettings]);

  // Payment method helpers
  const updatePaymentMethods = useCallback(async (methods: PaymentMethodConfig[]) => {
    await updateStoreSettings({ paymentMethods: methods });
  }, [updateStoreSettings]);

  const addPaymentMethod = useCallback(async (methodData: Omit<PaymentMethodConfig, 'id'>) => {
    const newMethod: PaymentMethodConfig = { ...methodData, id: `pay-${Date.now()}` };
    const updated = [...settings.paymentMethods, newMethod];
    await updateStoreSettings({ paymentMethods: updated });
    return newMethod;
  }, [settings.paymentMethods, updateStoreSettings]);

  const updatePaymentMethod = useCallback(async (id: string, updates: Partial<PaymentMethodConfig>) => {
    const updated = settings.paymentMethods.map((m) => (m.id === id ? { ...m, ...updates } : m));
    await updateStoreSettings({ paymentMethods: updated });
  }, [settings.paymentMethods, updateStoreSettings]);

  const deletePaymentMethod = useCallback(async (id: string) => {
    const updated = settings.paymentMethods.filter((m) => m.id !== id);
    await updateStoreSettings({ paymentMethods: updated });
  }, [settings.paymentMethods, updateStoreSettings]);

  // Sub-settings helpers
  const updateDeliverySettings = useCallback(async (delivery: Partial<DeliverySettings>) => {
    await updateStoreSettings({ deliverySettings: { ...settings.deliverySettings, ...delivery } });
  }, [settings.deliverySettings, updateStoreSettings]);

  const updateWebsiteContent = useCallback(async (content: Partial<WebsiteContentSettings>) => {
    await updateStoreSettings({ websiteContent: { ...settings.websiteContent, ...content } });
  }, [settings.websiteContent, updateStoreSettings]);

  const updateSocialLinks = useCallback(async (links: Partial<SocialLinksSettings>) => {
    await updateStoreSettings({ socialLinks: { ...settings.socialLinks, ...links } });
  }, [settings.socialLinks, updateStoreSettings]);

  const addCustomDesignTemplate = useCallback(async (templateData: Omit<CustomDesignTemplate, 'id'>) => {
    const newTemplate: CustomDesignTemplate = { ...templateData, id: `tpl-${Date.now()}` };
    const updated = [...settings.customDesignTemplates, newTemplate];
    await updateStoreSettings({ customDesignTemplates: updated });
    return newTemplate;
  }, [settings.customDesignTemplates, updateStoreSettings]);

  const updateCustomDesignTemplate = useCallback(async (id: string, updates: Partial<CustomDesignTemplate>) => {
    const updated = settings.customDesignTemplates.map((t) => (t.id === id ? { ...t, ...updates } : t));
    await updateStoreSettings({ customDesignTemplates: updated });
  }, [settings.customDesignTemplates, updateStoreSettings]);

  const deleteCustomDesignTemplate = useCallback(async (id: string) => {
    const updated = settings.customDesignTemplates.filter((t) => t.id !== id);
    await updateStoreSettings({ customDesignTemplates: updated });
  }, [settings.customDesignTemplates, updateStoreSettings]);

  return (
    <StoreDataContext.Provider
      value={{
        products,
        categories,
        subcategories,
        departments,
        colleges,
        kits,
        digitalProducts,
        orders,
        customers,
        reviews,
        coupons,
        banners,
        homepageSettings,
        printingRequests,
        customOrders,
        notifications,
        settings,
        inventoryLogs,
        isSupabaseLive,
        isLoadingData,

        // Supabase Cloud Sync
        supabaseConfig,
        saveSupabaseCredentials,
        disconnectSupabaseCredentials,
        syncLocalToCloud,
        testCloudConnection,

        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        toggleProductActive,
        toggleProductFeatured,
        toggleProductNew,
        updateProductStockStatus,

        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,

        addKit,
        updateKit,
        deleteKit,

        addDigitalProduct,
        updateDigitalProduct,
        deleteDigitalProduct,

        addOrder,
        updateOrderStatus,
        updatePaymentStatus,
        addOrderInternalNote,
        updateOrderDetails,
        cancelOrder,
        deleteOrder,

        addCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,

        addBanner,
        updateBanner,
        deleteBanner,
        updateHomepageSettings,

        updateReviewStatus,
        deleteReview,
        toggleReviewFeatured,
        addReview,

        updatePrintingStatus,
        updateCustomOrderStatus,
        addPrintingRequest,
        addCustomOrder,
        addPrintingInternalNote,
        addCustomOrderInternalNote,

        markNotificationRead,
        markAllNotificationsRead,

        updateStoreSettings,
        factoryResetAllData,

        updatePickupLocations,
        addPickupLocation,
        updatePickupLocation,
        deletePickupLocation,

        updatePaymentMethods,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,

        updateDeliverySettings,
        updateWebsiteContent,
        updateSocialLinks,

        addCustomDesignTemplate,
        updateCustomDesignTemplate,
        deleteCustomDesignTemplate,

        addCollege,
        updateCollege,
        deleteCollege,

        refreshStoreData: loadData,
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
};

export const useStoreData = () => {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error('useStoreData must be used within a StoreDataProvider');
  }
  return context;
};
