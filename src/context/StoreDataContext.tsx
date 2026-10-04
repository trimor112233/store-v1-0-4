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

  // Product Actions
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;
  toggleProductFeatured: (id: string) => void;
  toggleProductNew: (id: string) => void;
  updateProductStockStatus: (id: string, status: StockStatus) => void;

  // Category Actions
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (subcategory: Omit<Subcategory, 'id'>) => Subcategory;
  updateSubcategory: (id: string, updates: Partial<Subcategory>) => void;
  deleteSubcategory: (id: string) => void;

  // Kit Actions
  addKit: (kit: Omit<StudentKit, 'id'>) => void;
  updateKit: (id: string, updates: Partial<StudentKit>) => void;
  deleteKit: (id: string) => void;

  // Digital Product Actions
  addDigitalProduct: (item: Omit<DigitalProduct, 'id'>) => DigitalProduct;
  updateDigitalProduct: (id: string, updates: Partial<DigitalProduct>) => void;
  deleteDigitalProduct: (id: string) => void;

  // Order Actions
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  addOrderInternalNote: (orderId: string, text: string, author?: string) => void;
  updateOrderDetails: (orderId: string, updates: Partial<Order>) => void;
  cancelOrder: (orderId: string, reason?: string) => void;

  // Coupon Actions
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  validateCoupon: (code: string, subtotal: number, collegeId?: CollegeId) => { valid: boolean; discount: number; message: string };

  // Banner & Homepage Actions
  addBanner: (banner: Omit<HomepageBanner, 'id'>) => void;
  updateBanner: (id: string, updates: Partial<HomepageBanner>) => void;
  deleteBanner: (id: string) => void;
  updateHomepageSettings: (updates: Partial<HomepageSettings>) => void;

  // Review Actions
  updateReviewStatus: (id: string, status: 'approved' | 'pending' | 'rejected') => void;
  deleteReview: (id: string) => void;
  toggleReviewFeatured: (id: string) => void;
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;

  // Printing & Custom Actions
  updatePrintingStatus: (id: string, status: PrintingRequest['status']) => void;
  updateCustomOrderStatus: (id: string, status: CustomOrder['status']) => void;
  addPrintingRequest: (req: Omit<PrintingRequest, 'id' | 'submittedAt'>) => void;
  addCustomOrder: (ord: Omit<CustomOrder, 'id' | 'date'>) => void;
  addPrintingInternalNote: (id: string, text: string, author?: string) => void;
  addCustomOrderInternalNote: (id: string, text: string, author?: string) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Store Settings & Modular Controls
  updateStoreSettings: (updates: Partial<StoreSettings>) => void;
  factoryResetAllData: () => void;

  // Pickup Location Actions
  updatePickupLocations: (locations: PickupLocation[]) => void;
  addPickupLocation: (loc: Omit<PickupLocation, 'id'>) => PickupLocation;
  updatePickupLocation: (id: string, updates: Partial<PickupLocation>) => void;
  deletePickupLocation: (id: string) => void;

  // Payment Method Actions
  updatePaymentMethods: (methods: PaymentMethodConfig[]) => void;
  addPaymentMethod: (method: Omit<PaymentMethodConfig, 'id'>) => PaymentMethodConfig;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethodConfig>) => void;
  deletePaymentMethod: (id: string) => void;

  // Delivery, Website Content, Social Links Actions
  updateDeliverySettings: (delivery: Partial<DeliverySettings>) => void;
  updateWebsiteContent: (content: Partial<WebsiteContentSettings>) => void;
  updateSocialLinks: (links: Partial<SocialLinksSettings>) => void;

  // Custom Design Templates Actions
  addCustomDesignTemplate: (template: Omit<CustomDesignTemplate, 'id'>) => CustomDesignTemplate;
  updateCustomDesignTemplate: (id: string, updates: Partial<CustomDesignTemplate>) => void;
  deleteCustomDesignTemplate: (id: string) => void;

  // College Actions
  addCollege: (college: College) => void;
  updateCollege: (id: CollegeId, updates: Partial<College>) => void;
  deleteCollege: (id: CollegeId) => void;
}

const StoreDataContext = createContext<StoreDataContextType | undefined>(undefined);

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(`sh_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(`sh_${key}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota
  }
};

export const StoreDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const loaded = loadFromStorage<Product[]>('products', []);
    return loaded && loaded.length > 0 ? loaded : productsData;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const loaded = loadFromStorage<Category[]>('categories', []);
    return loaded && loaded.length > 0 ? loaded : categoriesData;
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>(() => {
    const loaded = loadFromStorage<Subcategory[]>('subcategories', []);
    return loaded && loaded.length > 0 ? loaded : subcategoriesData;
  });
  const [departments] = useState<Department[]>(() => departmentsData);
  const [colleges, setColleges] = useState<College[]>(() => {
    const loaded = loadFromStorage<College[]>('colleges', []);
    return loaded && loaded.length > 0 ? loaded : collegesData;
  });
  const [kits, setKits] = useState<StudentKit[]>(() => {
    const loaded = loadFromStorage<StudentKit[]>('kits', []);
    return loaded && loaded.length > 0 ? loaded : studentKitsData;
  });
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>(() => {
    const loaded = loadFromStorage<DigitalProduct[]>('digital_products', []);
    return loaded && loaded.length > 0 ? loaded : digitalProductsData;
  });
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage<Order[]>('orders', []));
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage<Customer[]>('customers', []));
  const [reviews, setReviews] = useState<Review[]>(() => {
    const loaded = loadFromStorage<Review[]>('reviews', []);
    return loaded && loaded.length > 0 ? loaded : initialReviews;
  });
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const loaded = loadFromStorage<Coupon[]>('coupons', []);
    return loaded && loaded.length > 0 ? loaded : initialCoupons;
  });
  const [banners, setBanners] = useState<HomepageBanner[]>(() => {
    const loaded = loadFromStorage<HomepageBanner[]>('banners', []);
    return loaded && loaded.length > 0 ? loaded : initialBanners;
  });
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(() => loadFromStorage('homepage_settings', initialHomepageSettings));
  const [printingRequests, setPrintingRequests] = useState<PrintingRequest[]>(() => loadFromStorage<PrintingRequest[]>('printing', []));
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>(() => loadFromStorage<CustomOrder[]>('custom_orders', []));
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

  // Auto-sync state to localStorage
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

  // ===================== COLLEGE HANDLERS =====================
  const addCollege = useCallback((col: College) => {
    setColleges((prev) => {
      const updated = [...prev, col];
      setTimeout(() => window.dispatchEvent(new CustomEvent('sh_colleges_sync')), 50);
      return updated;
    });
  }, []);

  const updateCollege = useCallback((id: CollegeId, updates: Partial<College>) => {
    setColleges((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      setTimeout(() => window.dispatchEvent(new CustomEvent('sh_colleges_sync')), 50);
      return updated;
    });
  }, []);

  const deleteCollege = useCallback((id: CollegeId) => {
    setColleges((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      setTimeout(() => window.dispatchEvent(new CustomEvent('sh_colleges_sync')), 50);
      return updated;
    });
  }, []);

  // ===================== PRODUCT HANDLERS =====================
  const addProduct = useCallback((productData: Omit<Product, 'id'>): Product => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = { ...productData, id };
    setProducts((prev) => [newProduct, ...prev]);

    // Push an admin notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Product Published',
        message: `${newProduct.title} added to live store.`,
        type: 'stock',
        timestamp: 'Just now',
        read: false,
        linkTab: 'products',
      },
      ...prev,
    ]);

    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const updateProductStockStatus = useCallback((id: string, status: StockStatus) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const inStock = status !== 'out_of_stock';
        const stock = status === 'out_of_stock' ? 0 : status === 'low_stock' && p.stock > 10 ? 5 : p.stock;
        return { ...p, stockStatus: status, inStock, stock };
      })
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const duplicateProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const source = prev.find((p) => p.id === id);
      if (!source) return prev;
      const duplicated: Product = {
        ...source,
        id: `prod-${Date.now()}`,
        title: `${source.title} (Copy)`,
        rating: 5.0,
        reviewsCount: 0,
      };
      return [duplicated, ...prev];
    });
  }, []);

  const toggleProductActive = useCallback((id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  }, []);

  const toggleProductFeatured = useCallback((id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)));
  }, []);

  const toggleProductNew = useCallback((id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isNewArrival: !p.isNewArrival } : p)));
  }, []);

  // ===================== CATEGORY & SUBCATEGORY HANDLERS =====================
  const addCategory = useCallback((catData: Omit<Category, 'id'>): Category => {
    const id = `cat-${catData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newCat: Category = { ...catData, isVisible: true, id };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  }, []);

  const factoryResetAllData = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setSubcategories((prev) => prev.filter((s) => s.categoryId !== id));
  }, []);

  const addSubcategory = useCallback((subData: Omit<Subcategory, 'id'>): Subcategory => {
    const id = `sub-${subData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newSub: Subcategory = { ...subData, id };
    setSubcategories((prev) => [...prev, newSub]);
    return newSub;
  }, []);

  const updateSubcategory = useCallback((id: string, updates: Partial<Subcategory>) => {
    setSubcategories((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const deleteSubcategory = useCallback((id: string) => {
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ===================== KIT HANDLERS =====================
  const addKit = useCallback((kitData: Omit<StudentKit, 'id'>) => {
    const newKit: StudentKit = { ...kitData, id: `kit-${Date.now()}` };
    setKits((prev) => [newKit, ...prev]);
  }, []);

  const updateKit = useCallback((id: string, updates: Partial<StudentKit>) => {
    setKits((prev) => prev.map((k) => (k.id === id ? { ...k, ...updates } : k)));
  }, []);

  const deleteKit = useCallback((id: string) => {
    setKits((prev) => prev.filter((k) => k.id !== id));
  }, []);

  // ===================== DIGITAL PRODUCT HANDLERS =====================
  const addDigitalProduct = useCallback((itemData: Omit<DigitalProduct, 'id'>): DigitalProduct => {
    const id = `dig-${Date.now()}`;
    const newDig: DigitalProduct = { ...itemData, id };
    setDigitalProducts((prev) => [newDig, ...prev]);
    return newDig;
  }, []);

  const updateDigitalProduct = useCallback((id: string, updates: Partial<DigitalProduct>) => {
    setDigitalProducts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const deleteDigitalProduct = useCallback((id: string) => {
    setDigitalProducts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // ===================== ORDER HANDLERS =====================
  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);

    // Keep admin customer directory updated from incoming orders
    setCustomers((prev) => {
      const existing = prev.find((c) => c.phone === order.phone);
      if (existing) {
        return prev.map((c) =>
          c.phone === order.phone
            ? {
                ...c,
                ordersCount: c.ordersCount + 1,
                totalSpent: c.totalSpent + order.total,
                name: order.studentName || c.name,
                email: order.email || c.email,
              }
            : c
        );
      } else {
        const newCustomer: Customer = {
          id: `cust-${Date.now()}`,
          name: order.studentName,
          email: order.email || `${order.phone}@guest.store`,
          phone: order.phone,
          university: order.campusDeliveryPoint || order.governorate || 'Guest Customer',
          faculty: order.collegeName || 'Customer Order',
          collegeId: order.collegeId || 'other',
          ordersCount: 1,
          totalSpent: order.total,
          joinedDate: new Date().toISOString().split('T')[0],
          wishlistCount: 0,
        };
        return [newCustomer, ...prev];
      }
    });

    // Notification for admin
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `New Order #${order.id}`,
        message: `${order.studentName} placed order for ${order.total} EGP (${order.campusDeliveryPoint || order.city || 'Delivery'}).`,
        type: 'order',
        timestamp: 'Just now',
        read: false,
        linkTab: 'orders',
      },
      ...prev,
    ]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
        return {
          ...ord,
          status,
          timeline: [
            ...ord.timeline,
            { status, date: now, description: `Order status updated to ${status}` },
          ],
        };
      })
    );
  }, []);

  const updatePaymentStatus = useCallback((orderId: string, paymentStatus: PaymentStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o)));
  }, []);

  const addOrderInternalNote = useCallback((orderId: string, text: string, author: string = 'Admin') => {
    const newNote = {
      id: `note-${Date.now()}`,
      text,
      author,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          internalNotes: [...(o.internalNotes || []), newNote],
        };
      })
    );
  }, []);

  const updateOrderDetails = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o)));
  }, []);

  const cancelOrder = useCallback((orderId: string, reason: string = 'Cancelled by administrator') => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: 'Cancelled',
          timeline: [
            ...ord.timeline,
            { status: 'Cancelled', date: now, description: reason },
          ],
        };
      })
    );
  }, []);

  // ===================== COUPON HANDLERS =====================
  const addCoupon = useCallback((couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = { ...couponData, id: `coup-${Date.now()}` };
    setCoupons((prev) => [newCoupon, ...prev]);
  }, []);

  const updateCoupon = useCallback((id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCoupon = useCallback((id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
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
        discount = Math.min(subtotal, coupon.discountValue);
      }

      return { valid: true, discount, message: `${coupon.code} applied! (-${discount} EGP)` };
    },
    [coupons]
  );

  // ===================== BANNER & HOMEPAGE HANDLERS =====================
  const addBanner = useCallback((bannerData: Omit<HomepageBanner, 'id'>) => {
    const newBanner: HomepageBanner = { ...bannerData, id: `ban-${Date.now()}` };
    setBanners((prev) => [...prev, newBanner]);
  }, []);

  const updateBanner = useCallback((id: string, updates: Partial<HomepageBanner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }, []);

  const deleteBanner = useCallback((id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const updateHomepageSettings = useCallback((updates: Partial<HomepageSettings>) => {
    setHomepageSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // ===================== REVIEW HANDLERS =====================
  const updateReviewStatus = useCallback((id: string, status: 'approved' | 'pending' | 'rejected') => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  const deleteReview = useCallback((id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleReviewFeatured = useCallback((id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isFeatured: !r.isFeatured } : r)));
  }, []);

  const addReview = useCallback((revData: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      ...revData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setReviews((prev) => [newRev, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Review Submitted',
        message: `${newRev.studentName} rated "${newRev.productTitle.slice(0, 24)}" ${newRev.rating} stars.`,
        type: 'review',
        timestamp: 'Just now',
        read: false,
        linkTab: 'reviews',
      },
      ...prev,
    ]);
  }, []);

  // ===================== PRINTING & CUSTOM ORDER HANDLERS =====================
  const updatePrintingStatus = useCallback((id: string, status: PrintingRequest['status']) => {
    setPrintingRequests((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }, []);

  const updateCustomOrderStatus = useCallback((id: string, status: CustomOrder['status']) => {
    setCustomOrders((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }, []);

  const addPrintingRequest = useCallback((reqData: Omit<PrintingRequest, 'id' | 'submittedAt'>) => {
    const newReq: PrintingRequest = {
      ...reqData,
      id: `PR-${Math.floor(1000 + Math.random() * 9000)}`,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      timeline: [
        {
          status: reqData.status || 'Pending',
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          description: 'Print request submitted',
        },
      ],
    };
    setPrintingRequests((prev) => [newReq, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `New Print Request #${newReq.id}`,
        message: `${newReq.customerName} submitted ${newReq.fileName} (${newReq.paperSize}).`,
        type: 'print',
        timestamp: 'Just now',
        read: false,
        linkTab: 'printing',
      },
      ...prev,
    ]);
  }, []);

  const addPrintingInternalNote = useCallback((id: string, text: string, author: string = 'Admin') => {
    const newNote = {
      id: `pnote-${Date.now()}`,
      text,
      author,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setPrintingRequests((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          internalNotes: [...(p.internalNotes || []), newNote],
        };
      })
    );
  }, []);

  const addCustomOrder = useCallback((ordData: Omit<CustomOrder, 'id' | 'date'>) => {
    const newOrd: CustomOrder = {
      ...ordData,
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      timeline: [
        {
          status: ordData.status || 'Pending',
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          description: 'Custom gear order received',
        },
      ],
    };
    setCustomOrders((prev) => [newOrd, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `New Custom Gear Order #${newOrd.id}`,
        message: `${newOrd.customerName} ordered custom ${newOrd.productType}.`,
        type: 'order',
        timestamp: 'Just now',
        read: false,
        linkTab: 'custom',
      },
      ...prev,
    ]);
  }, []);

  const addCustomOrderInternalNote = useCallback((id: string, text: string, author: string = 'Admin') => {
    const newNote = {
      id: `cnote-${Date.now()}`,
      text,
      author,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setCustomOrders((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          internalNotes: [...(c.internalNotes || []), newNote],
        };
      })
    );
  }, []);

  // ===================== NOTIFICATION HANDLERS =====================
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // ===================== SETTINGS HANDLER =====================
  const updateStoreSettings = useCallback((updates: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const updatePickupLocations = useCallback((locations: PickupLocation[]) => {
    setSettings((prev) => ({ ...prev, pickupLocations: locations }));
  }, []);

  const addPickupLocation = useCallback((loc: Omit<PickupLocation, 'id'>): PickupLocation => {
    const newLoc: PickupLocation = { ...loc, id: `loc-${Date.now()}` };
    setSettings((prev) => ({
      ...prev,
      pickupLocations: [...(prev.pickupLocations || []), newLoc],
    }));
    return newLoc;
  }, []);

  const updatePickupLocation = useCallback((id: string, updates: Partial<PickupLocation>) => {
    setSettings((prev) => ({
      ...prev,
      pickupLocations: (prev.pickupLocations || []).map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  }, []);

  const deletePickupLocation = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      pickupLocations: (prev.pickupLocations || []).filter((l) => l.id !== id),
    }));
  }, []);

  const updatePaymentMethods = useCallback((methods: PaymentMethodConfig[]) => {
    setSettings((prev) => ({ ...prev, paymentMethods: methods }));
  }, []);

  const addPaymentMethod = useCallback((method: Omit<PaymentMethodConfig, 'id'>): PaymentMethodConfig => {
    const newMethod: PaymentMethodConfig = { ...method, id: `pay-${Date.now()}` };
    setSettings((prev) => ({
      ...prev,
      paymentMethods: [...(prev.paymentMethods || []), newMethod],
    }));
    return newMethod;
  }, []);

  const updatePaymentMethod = useCallback((id: string, updates: Partial<PaymentMethodConfig>) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: (prev.paymentMethods || []).map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  }, []);

  const deletePaymentMethod = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: (prev.paymentMethods || []).filter((m) => m.id !== id),
    }));
  }, []);

  const updateDeliverySettings = useCallback((delivery: Partial<DeliverySettings>) => {
    setSettings((prev) => ({
      ...prev,
      deliverySettings: { ...prev.deliverySettings, ...delivery },
    }));
  }, []);

  const updateWebsiteContent = useCallback((content: Partial<WebsiteContentSettings>) => {
    setSettings((prev) => ({
      ...prev,
      websiteContent: { ...prev.websiteContent, ...content },
    }));
  }, []);

  const updateSocialLinks = useCallback((links: Partial<SocialLinksSettings>) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, ...links },
    }));
  }, []);

  const addCustomDesignTemplate = useCallback((template: Omit<CustomDesignTemplate, 'id'>): CustomDesignTemplate => {
    const newTemplate: CustomDesignTemplate = { ...template, id: `dt-${Date.now()}` };
    setSettings((prev) => ({
      ...prev,
      customDesignTemplates: [...(prev.customDesignTemplates || []), newTemplate],
    }));
    return newTemplate;
  }, []);

  const updateCustomDesignTemplate = useCallback((id: string, updates: Partial<CustomDesignTemplate>) => {
    setSettings((prev) => ({
      ...prev,
      customDesignTemplates: (prev.customDesignTemplates || []).map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const deleteCustomDesignTemplate = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      customDesignTemplates: (prev.customDesignTemplates || []).filter((t) => t.id !== id),
    }));
  }, []);

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
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
};

export const useStoreData = () => {
  const context = useContext(StoreDataContext);
  if (!context) throw new Error('useStoreData must be used within StoreDataProvider');
  return context;
};
