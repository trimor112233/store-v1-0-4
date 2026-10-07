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
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchAllStoreData,
  createOrderInSupabase,
  seedInitialDataToSupabase,
  mapProductToDb,
  mapProductFromDb,
  mapOrderFromDb,
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

export const StoreDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(productsData);
  const [categories, setCategories] = useState<Category[]>(categoriesData);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(subcategoriesData);
  const [departments] = useState<Department[]>(departmentsData);
  const [colleges, setColleges] = useState<College[]>(collegesData);
  const [kits, setKits] = useState<StudentKit[]>(studentKitsData);
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>(digitalProductsData);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [banners, setBanners] = useState<HomepageBanner[]>(initialBanners);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(initialHomepageSettings);
  const [printingRequests, setPrintingRequests] = useState<PrintingRequest[]>(initialPrintingRequests);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>(initialCustomOrders);
  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications);
  const [settings, setSettings] = useState<StoreSettings>(initialStoreSettings);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLogItem[]>([]);

  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(isSupabaseConfigured());
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Load store data from Supabase
  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    if (isSupabaseConfigured()) {
      setIsSupabaseLive(true);
      const data = await fetchAllStoreData();
      if (data) {
        if (data.products && data.products.length > 0) setProducts(data.products);
        if (data.categories && data.categories.length > 0) setCategories(data.categories);
        if (data.subcategories && data.subcategories.length > 0) setSubcategories(data.subcategories);
        if (data.colleges && data.colleges.length > 0) setColleges(data.colleges);
        if (data.kits && data.kits.length > 0) setKits(data.kits);
        if (data.digitalProducts && data.digitalProducts.length > 0) setDigitalProducts(data.digitalProducts);
        if (data.orders) setOrders(data.orders);
        if (data.reviews) setReviews(data.reviews);
        if (data.coupons && data.coupons.length > 0) setCoupons(data.coupons);
        if (data.banners && data.banners.length > 0) setBanners(data.banners);
        if (data.homepageSettings) setHomepageSettings(data.homepageSettings);
        if (data.printingRequests) setPrintingRequests(data.printingRequests);
        if (data.customOrders) setCustomOrders(data.customOrders);
        if (data.notifications) setNotifications(data.notifications);
        if (data.storeSettings) setSettings(data.storeSettings);
        if (data.inventoryLogs) setInventoryLogs(data.inventoryLogs);

        // Seed initial data if Supabase tables are fresh
        await seedInitialDataToSupabase({
          products: productsData,
          categories: categoriesData,
          settings: initialStoreSettings,
        });
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

    const channel = supabase
      .channel('store_realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        // Refetch latest data when any table changes on any device
        fetchAllStoreData().then((data) => {
          if (data) {
            setProducts(data.products || []);
            setCategories(data.categories || []);
            setSubcategories(data.subcategories || []);
            setColleges(data.colleges || []);
            setKits(data.kits || []);
            setDigitalProducts(data.digitalProducts || []);
            setOrders(data.orders || []);
            setReviews(data.reviews || []);
            setCoupons(data.coupons || []);
            setBanners(data.banners || []);
            if (data.homepageSettings) setHomepageSettings(data.homepageSettings);
            setPrintingRequests(data.printingRequests || []);
            setCustomOrders(data.customOrders || []);
            setNotifications(data.notifications || []);
            if (data.storeSettings) setSettings(data.storeSettings);
            setInventoryLogs(data.inventoryLogs || []);
          }
        });
      })
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // ===================== COLLEGE HANDLERS =====================
  const addCollege = useCallback(async (col: College) => {
    setColleges((prev) => [...prev, col]);
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
    setColleges((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
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
    setColleges((prev) => prev.filter((c) => c.id !== id));
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('colleges').delete().eq('id', id);
    }
  }, []);

  // ===================== PRODUCT HANDLERS =====================
  const addProduct = useCallback(async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = { ...productData, id };
    setProducts((prev) => [newProduct, ...prev]);

    if (supabase && isSupabaseConfigured()) {
      const dbRow = mapProductToDb(newProduct);
      await supabase.from('products').insert(dbRow);
    }

    return newProduct;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    if (supabase && isSupabaseConfigured()) {
      const dbRow = mapProductToDb(updates);
      await supabase.from('products').update(dbRow).eq('id', id);
    }
  }, []);

  const updateProductStockStatus = useCallback(async (id: string, status: StockStatus) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const inStock = status !== 'out_of_stock';
        const stock = status === 'out_of_stock' ? 0 : status === 'low_stock' && p.stock > 10 ? 5 : p.stock;
        return { ...p, stockStatus: status, inStock, stock };
      })
    );

    if (supabase && isSupabaseConfigured()) {
      const target = products.find((p) => p.id === id);
      const inStock = status !== 'out_of_stock';
      const stock = status === 'out_of_stock' ? 0 : status === 'low_stock' && target && target.stock > 10 ? 5 : target?.stock || 0;
      await supabase.from('products').update({
        stock_status: status,
        in_stock: inStock,
        stock,
      }).eq('id', id);
    }
  }, [products]);

  const deleteProduct = useCallback(async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('products').delete().eq('id', id);
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
    setProducts((prev) => [duplicated, ...prev]);

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('products').insert(mapProductToDb(duplicated));
    }
  }, [products]);

  const toggleProductActive = useCallback(async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const nextActive = !target.active;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: nextActive } : p)));

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('products').update({ active: nextActive }).eq('id', id);
    }
  }, [products]);

  const toggleProductFeatured = useCallback(async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const nextFeat = !target.featured;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: nextFeat } : p)));

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('products').update({ featured: nextFeat }).eq('id', id);
    }
  }, [products]);

  const toggleProductNew = useCallback(async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const nextNew = !target.isNewArrival;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isNewArrival: nextNew } : p)));

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('products').update({ is_new_arrival: nextNew }).eq('id', id);
    }
  }, [products]);

  // ===================== CATEGORY & SUBCATEGORY HANDLERS =====================
  const addCategory = useCallback(async (catData: Omit<Category, 'id'>): Promise<Category> => {
    const id = `cat-${catData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newCat: Category = { ...catData, isVisible: true, id };
    setCategories((prev) => [...prev, newCat]);

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('categories').insert({
        id,
        name: newCat.name,
        college_id: newCat.collegeId,
        icon: newCat.icon || '📦',
      });
    }

    return newCat;
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('categories').update({
        ...(updates.name && { name: updates.name }),
        ...(updates.collegeId && { college_id: updates.collegeId }),
        ...(updates.icon && { icon: updates.icon }),
      }).eq('id', id);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setSubcategories((prev) => prev.filter((s) => s.categoryId !== id));

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('categories').delete().eq('id', id);
    }
  }, []);

  const addSubcategory = useCallback(async (subData: Omit<Subcategory, 'id'>): Promise<Subcategory> => {
    const id = `sub-${subData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newSub: Subcategory = { ...subData, id };
    setSubcategories((prev) => [...prev, newSub]);

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('subcategories').insert({
        id,
        name: newSub.name,
        category_id: newSub.categoryId,
        college_id: newSub.collegeId,
      });
    }

    return newSub;
  }, []);

  const updateSubcategory = useCallback(async (id: string, updates: Partial<Subcategory>) => {
    setSubcategories((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('subcategories').update({
        ...(updates.name && { name: updates.name }),
        ...(updates.categoryId && { category_id: updates.categoryId }),
        ...(updates.collegeId && { college_id: updates.collegeId }),
      }).eq('id', id);
    }
  }, []);

  const deleteSubcategory = useCallback(async (id: string) => {
    setSubcategories((prev) => prev.filter((s) => s.id !== id));

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('subcategories').delete().eq('id', id);
    }
  }, []);

  // ===================== KIT HANDLERS =====================
  const addKit = useCallback(async (kitData: Omit<StudentKit, 'id'>) => {
    const newKit: StudentKit = { ...kitData, id: `kit-${Date.now()}` };
    setKits((prev) => [newKit, ...prev]);

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
    setKits((prev) => prev.map((k) => (k.id === id ? { ...k, ...updates } : k)));

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
    setKits((prev) => prev.filter((k) => k.id !== id));
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('student_kits').delete().eq('id', id);
    }
  }, []);

  // ===================== DIGITAL PRODUCT HANDLERS =====================
  const addDigitalProduct = useCallback(async (itemData: Omit<DigitalProduct, 'id'>): Promise<DigitalProduct> => {
    const id = `dig-${Date.now()}`;
    const newDig: DigitalProduct = { ...itemData, id };
    setDigitalProducts((prev) => [newDig, ...prev]);

    if (supabase && isSupabaseConfigured()) {
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
    }

    return newDig;
  }, []);

  const updateDigitalProduct = useCallback(async (id: string, updates: Partial<DigitalProduct>) => {
    setDigitalProducts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('digital_products').update({
        ...(updates.title && { title: updates.title }),
        ...(updates.price !== undefined && { price: updates.price }),
        ...(updates.active !== undefined && { active: updates.active }),
        ...(updates.description && { description: updates.description }),
      }).eq('id', id);
    }
  }, []);

  const deleteDigitalProduct = useCallback(async (id: string) => {
    setDigitalProducts((prev) => prev.filter((d) => d.id !== id));
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('digital_products').delete().eq('id', id);
    }
  }, []);

  // ===================== ORDER HANDLERS =====================
  const addOrder = useCallback(async (order: Order): Promise<boolean> => {
    setOrders((prev) => [order, ...prev]);

    // Save to Supabase
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
          
          setProducts((prev) =>
            prev.map((p) => (p.id === item.id ? { ...p, stock: newStock, stockStatus: computedStatus, inStock: newStock > 0 } : p))
          );

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
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
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
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, paymentStatus: status } : ord))
    );

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
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return { ...o, internalNotes: [...(o.internalNotes || []), newNote] };
      })
    );

    if (supabase && isSupabaseConfigured()) {
      const targetOrder = orders.find((o) => o.id === orderId);
      const newNotes = [...(targetOrder?.internalNotes || []), newNote];
      await supabase.from('orders').update({ internal_notes: newNotes }).eq('id', orderId);
    }
  }, [orders]);

  const updateOrderDetails = useCallback(async (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o)));

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

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: 'Cancelled',
          timeline: [...ord.timeline, { status: 'Cancelled', date: now, description: reason }],
        };
      })
    );

    if (targetOrder) {
      // Restore physical product stock
      for (const item of targetOrder.items || []) {
        if (item.type === 'product') {
          const liveProd = products.find((p) => p.id === item.id);
          if (liveProd) {
            const restoredStock = liveProd.stock + item.quantity;
            setProducts((prev) =>
              prev.map((p) => (p.id === item.id ? { ...p, stock: restoredStock, inStock: true, stockStatus: 'in_stock' } : p))
            );

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
        const newTimeline = [...targetOrder.timeline, { status: 'Cancelled', date: now, description: reason }];
        await supabase.from('orders').update({
          status: 'Cancelled',
          timeline: newTimeline,
        }).eq('id', orderId);
      }
    }
  }, [orders, products]);

  // ===================== COUPON HANDLERS =====================
  const addCoupon = useCallback(async (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = { ...couponData, id: `coup-${Date.now()}` };
    setCoupons((prev) => [newCoupon, ...prev]);

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
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('coupons').update({
        ...(updates.code && { code: updates.code }),
        ...(updates.active !== undefined && { active: updates.active }),
        ...(updates.discountValue !== undefined && { discount_value: updates.discountValue }),
      }).eq('id', id);
    }
  }, []);

  const deleteCoupon = useCallback(async (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
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
    setBanners((prev) => [...prev, newBanner]);

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
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));

    if (supabase && isSupabaseConfigured()) {
      await supabase.from('homepage_banners').update({
        ...(updates.title && { title: updates.title }),
        ...(updates.active !== undefined && { active: updates.active }),
        ...(updates.image && { image: updates.image }),
      }).eq('id', id);
    }
  }, []);

  const deleteBanner = useCallback(async (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('homepage_banners').delete().eq('id', id);
    }
  }, []);

  const updateHomepageSettings = useCallback(async (updates: Partial<HomepageSettings>) => {
    setHomepageSettings((prev) => {
      const updated = { ...prev, ...updates };
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
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('reviews').update({ status }).eq('id', id);
    }
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('reviews').delete().eq('id', id);
    }
  }, []);

  const toggleReviewFeatured = useCallback(async (id: string) => {
    const target = reviews.find((r) => r.id === id);
    if (!target) return;
    const nextFeat = !target.isFeatured;
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isFeatured: nextFeat } : r)));

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
    setReviews((prev) => [newRev, ...prev]);

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
    setPrintingRequests((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('printing_requests').update({ status }).eq('id', id);
    }
  }, []);

  const updateCustomOrderStatus = useCallback(async (id: string, status: CustomOrder['status']) => {
    setCustomOrders((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
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
    setPrintingRequests((prev) => [newReq, ...prev]);

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
    setCustomOrders((prev) => [newCustom, ...prev]);

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
    setPrintingRequests((prev) =>
      prev.map((p) => (p.id === id ? { ...p, internalNotes: [...(p.internalNotes || []), note] } : p))
    );
  }, []);

  const addCustomOrderInternalNote = useCallback(async (id: string, text: string, author: string = 'Admin') => {
    const note = { id: `note-${Date.now()}`, text, author, createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
    setCustomOrders((prev) =>
      prev.map((c) => (c.id === id ? { ...c, internalNotes: [...(c.internalNotes || []), note] } : c))
    );
  }, []);

  // ===================== NOTIFICATIONS =====================
  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('notifications').update({ read: true }).neq('id', '');
    }
  }, []);

  // ===================== STORE SETTINGS =====================
  const updateStoreSettings = useCallback(async (updates: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
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
