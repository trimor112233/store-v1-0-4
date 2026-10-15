import { supabase, isSupabaseConfigured, normalizePhone } from '../lib/supabase';
import {
  Product,
  Category,
  Subcategory,
  College,
  StudentKit,
  DigitalProduct,
  Order,
  CartItem,
  Review,
  Coupon,
  HomepageBanner,
  HomepageSettings,
  PrintingRequest,
  CustomOrder,
  AdminNotification,
  StoreSettings,
  InventoryLogItem,
  CollegeId,
  PrintingStatus,
  CustomOrderStatus,
} from '../types';

// ===================== MAPPERS (Snake <-> Camel) =====================

export const mapProductFromDb = (row: any): Product => ({
  id: row.id,
  title: row.title,
  collegeId: row.college_id as CollegeId,
  categoryId: row.category_id,
  subcategoryId: row.subcategory_id || '',
  category: row.category || 'General',
  productType: row.product_type || 'Physical',
  price: Number(row.price || 0),
  originalPrice: row.original_price ? Number(row.original_price) : undefined,
  stock: Number(row.stock || 0),
  stockStatus: row.stock_status || 'in_stock',
  rating: Number(row.rating || 5.0),
  reviewsCount: Number(row.reviews_count || 0),
  image: row.image,
  inStock: row.in_stock ?? true,
  featured: Boolean(row.featured),
  trending: Boolean(row.trending),
  isNewArrival: Boolean(row.is_new_arrival),
  active: row.active ?? true,
  description: row.description || '',
  specs: row.specs || {},
  tags: row.tags || [],
  lowStockThreshold: Number(row.low_stock_threshold || 10),
  disableWhenOutOfStock: Boolean(row.disable_when_out_of_stock),
  isPreOrder: Boolean(row.is_pre_order),
});

export const mapProductToDb = (p: Partial<Product>) => {
  const row: Record<string, any> = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.title !== undefined) row.title = p.title;
  if (p.collegeId !== undefined) row.college_id = p.collegeId;
  if (p.categoryId !== undefined) row.category_id = p.categoryId;
  if (p.subcategoryId !== undefined) row.subcategory_id = p.subcategoryId;
  if (p.category !== undefined) row.category = p.category;
  if (p.productType !== undefined) row.product_type = p.productType;
  if (p.price !== undefined) row.price = p.price;
  if (p.originalPrice !== undefined) row.original_price = p.originalPrice;
  if (p.stock !== undefined) row.stock = p.stock;
  if (p.stockStatus !== undefined) row.stock_status = p.stockStatus;
  if (p.rating !== undefined) row.rating = p.rating;
  if (p.reviewsCount !== undefined) row.reviews_count = p.reviewsCount;
  if (p.image !== undefined) row.image = p.image;
  if (p.inStock !== undefined) row.in_stock = p.inStock;
  if (p.featured !== undefined) row.featured = p.featured;
  if (p.trending !== undefined) row.trending = p.trending;
  if (p.isNewArrival !== undefined) row.is_new_arrival = p.isNewArrival;
  if (p.active !== undefined) row.active = p.active;
  if (p.description !== undefined) row.description = p.description;
  if (p.specs !== undefined) row.specs = p.specs;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.lowStockThreshold !== undefined) row.low_stock_threshold = p.lowStockThreshold;
  if (p.disableWhenOutOfStock !== undefined) row.disable_when_out_of_stock = p.disableWhenOutOfStock;
  if (p.isPreOrder !== undefined) row.is_pre_order = p.isPreOrder;
  return row;
};

export const mapOrderFromDb = (row: any, items: CartItem[] = []): Order => ({
  id: row.id,
  date: row.date || new Date(row.created_at).toISOString().split('T')[0],
  orderType: row.order_type || 'Product Order',
  status: row.status || 'Pending',
  paymentStatus: row.payment_status || 'Unpaid',
  items,
  subtotal: Number(row.subtotal || 0),
  shipping: Number(row.shipping || 0),
  discount: Number(row.discount || 0),
  total: Number(row.total || 0),
  studentName: row.student_name,
  customerName: row.customer_name || row.student_name,
  phone: row.phone,
  whatsapp: row.whatsapp,
  email: row.email,
  preferredContactMethod: row.preferred_contact_method || 'whatsapp',
  customerNotes: row.customer_notes,
  collegeId: row.college_id,
  collegeName: row.college_name,
  deliveryMethod: row.delivery_method || 'delivery',
  campusDeliveryPoint: row.campus_delivery_point,
  deliveryAddress: row.delivery_address,
  governorate: row.governorate,
  city: row.city,
  detailedAddress: row.detailed_address,
  buildingDetails: row.building_details,
  paymentMethod: row.payment_method || 'Cash on Delivery',
  timeline: row.timeline || [],
  internalNotes: row.internal_notes || [],
});

export const mapOrderToDb = (o: Order) => ({
  id: o.id,
  date: o.date,
  order_type: o.orderType || 'Product Order',
  status: o.status,
  payment_status: o.paymentStatus,
  student_name: o.studentName,
  customer_name: o.customerName || o.studentName,
  phone: o.phone,
  whatsapp: o.whatsapp,
  email: o.email,
  preferred_contact_method: o.preferredContactMethod || 'whatsapp',
  customer_notes: o.customerNotes,
  college_id: o.collegeId,
  college_name: o.collegeName,
  delivery_method: o.deliveryMethod || 'delivery',
  campus_delivery_point: o.campusDeliveryPoint,
  delivery_address: o.deliveryAddress,
  governorate: o.governorate,
  city: o.city,
  detailed_address: o.detailedAddress,
  building_details: o.buildingDetails,
  payment_method: o.paymentMethod,
  subtotal: o.subtotal,
  shipping: o.shipping,
  discount: o.discount,
  total: o.total,
  timeline: o.timeline || [],
  internal_notes: o.internalNotes || [],
});

export const mapOrderItemToDb = (item: CartItem, orderId: string) => ({
  order_id: orderId,
  product_id: item.id,
  title: item.title,
  type: item.type || 'product',
  price: item.price,
  original_price: item.originalPrice || null,
  quantity: item.quantity,
  image: item.image || null,
  category: item.category || null,
  college_id: item.collegeId || null,
  variant: item.variant || null,
  details: item.details || {},
  subtotal: item.price * item.quantity,
});

export const mapOrderItemFromDb = (row: any): CartItem => ({
  id: row.product_id || row.id,
  type: row.type || 'product',
  title: row.title,
  price: Number(row.price || 0),
  originalPrice: row.original_price ? Number(row.original_price) : undefined,
  quantity: Number(row.quantity || 1),
  image: row.image || undefined,
  category: row.category || undefined,
  collegeId: row.college_id || undefined,
  variant: row.variant || undefined,
  details: row.details || undefined,
});

// ===================== SUPABASE API METHODS =====================

export const fetchAllStoreData = async () => {
  if (!supabase || !isSupabaseConfigured()) {
    return null;
  }

  try {
    const [
      productsRes,
      categoriesRes,
      subcategoriesRes,
      collegesRes,
      kitsRes,
      digitalRes,
      ordersRes,
      orderItemsRes,
      reviewsRes,
      couponsRes,
      bannersRes,
      homepageSettingsRes,
      printingRes,
      customOrdersRes,
      notificationsRes,
      storeSettingsRes,
      inventoryLogsRes,
    ] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('subcategories').select('*'),
      supabase.from('colleges').select('*'),
      supabase.from('student_kits').select('*'),
      supabase.from('digital_products').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('order_items').select('*'),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('coupons').select('*'),
      supabase.from('homepage_banners').select('*').order('banner_order', { ascending: true }),
      supabase.from('homepage_settings').select('*').eq('id', 'default').maybeSingle(),
      supabase.from('printing_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('custom_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      supabase.from('store_settings').select('*').eq('id', 'default').maybeSingle(),
      supabase.from('inventory_logs').select('*').order('created_at', { ascending: false }),
    ]);

    // Validate errors from Supabase queries to avoid overwriting state with empty arrays
    if (productsRes.error) console.warn('[Supabase] Products query error:', productsRes.error.message);
    if (categoriesRes.error) console.warn('[Supabase] Categories query error:', categoriesRes.error.message);
    if (ordersRes.error) console.warn('[Supabase] Orders query error:', ordersRes.error.message);

    // Map Order Items to their respective parent Orders
    const itemsByOrder: Record<string, CartItem[]> = {};
    if (!orderItemsRes.error && Array.isArray(orderItemsRes.data)) {
      orderItemsRes.data.forEach((row) => {
        if (!itemsByOrder[row.order_id]) {
          itemsByOrder[row.order_id] = [];
        }
        itemsByOrder[row.order_id].push(mapOrderItemFromDb(row));
      });
    }

    const mappedOrders = !ordersRes.error && Array.isArray(ordersRes.data)
      ? ordersRes.data.map((row) => mapOrderFromDb(row, itemsByOrder[row.id] || []))
      : undefined;

    return {
      products: !productsRes.error && Array.isArray(productsRes.data) ? productsRes.data.map(mapProductFromDb) : undefined,
      categories: !categoriesRes.error && Array.isArray(categoriesRes.data) ? categoriesRes.data.map((row) => ({
        id: row.id,
        name: row.name,
        collegeId: row.college_id as CollegeId,
        icon: row.icon || '📦',
      })) : undefined,
      subcategories: !subcategoriesRes.error && Array.isArray(subcategoriesRes.data) ? subcategoriesRes.data.map((row) => ({
        id: row.id,
        name: row.name,
        categoryId: row.category_id,
        collegeId: row.college_id as CollegeId,
      })) : undefined,
      colleges: !collegesRes.error && Array.isArray(collegesRes.data) ? collegesRes.data.map((row) => ({
        id: row.id as CollegeId,
        name: row.name,
        nameAr: row.name_ar || row.name,
        icon: row.icon || '🏛️',
        description: row.description || '',
        accentColor: 'bg-blue-600',
        categories: [],
        descriptionAr: row.description_ar,
      })) : undefined,
      kits: (kitsRes.data || []).map((row) => ({
        id: row.id,
        title: row.title,
        collegeId: row.college_id as CollegeId,
        price: Number(row.price || 0),
        originalPrice: Number(row.original_price || row.price || 0) + 100,
        savings: 100,
        image: row.image,
        description: row.description || '',
        itemsList: row.items_included || [],
        targetYear: 'All Academic Years',
        badge: row.badge,
        active: Boolean(row.in_stock ?? true),
      })),
      digitalProducts: (digitalRes.data || []).map((row) => ({
        id: row.id,
        title: row.title,
        collegeId: row.college_id as CollegeId | 'all',
        fileType: row.file_type,
        size: row.size || 'Digital File',
        price: Number(row.price || 0),
        downloadsCount: Number(row.downloads_count || 0),
        active: row.active ?? true,
        description: row.description || '',
        features: row.features || [],
      })),
      orders: mappedOrders,
      reviews: !reviewsRes.error && Array.isArray(reviewsRes.data) ? reviewsRes.data.map((row) => ({
        id: row.id,
        productId: row.product_id,
        productTitle: row.product_title,
        studentName: row.student_name,
        studentCollege: row.student_college || 'General',
        rating: Number(row.rating || 5),
        comment: row.comment,
        date: row.date,
        status: row.status as any,
        isFeatured: Boolean(row.is_featured),
      })) : undefined,
      coupons: !couponsRes.error && Array.isArray(couponsRes.data) ? couponsRes.data.map((row) => ({
        id: row.id,
        code: row.code,
        discountType: row.discount_type as any,
        discountValue: Number(row.discount_value),
        minOrderAmount: row.min_order_amount ? Number(row.min_order_amount) : undefined,
        collegeId: row.college_id as any,
        maxUses: row.max_uses,
        timesUsed: Number(row.times_used || 0),
        expiryDate: row.expiry_date || '2026-12-31',
        active: Boolean(row.active),
      })) : undefined,
      banners: !bannersRes.error && Array.isArray(bannersRes.data) ? bannersRes.data.map((row) => ({
        id: row.id,
        title: row.title,
        subtitle: row.subtitle || '',
        badge: row.badge,
        image: row.image,
        buttonText: row.button_text || 'Shop Now',
        linkView: row.link_view || 'store',
        linkCollege: row.link_college as CollegeId | undefined,
        collegeId: (row.college_id as CollegeId | 'all') || 'all',
        active: Boolean(row.active),
        order: Number(row.banner_order || 1),
      })) : undefined,
      homepageSettings: !homepageSettingsRes.error && homepageSettingsRes.data
        ? {
            heroTitle: homepageSettingsRes.data.hero_title,
            heroSubtitle: homepageSettingsRes.data.hero_subtitle,
            heroButtonPrimary: homepageSettingsRes.data.hero_button_primary,
            heroButtonSecondary: homepageSettingsRes.data.hero_button_secondary,
            heroImage: homepageSettingsRes.data.hero_image,
            announcementActive: Boolean(homepageSettingsRes.data.announcement_active),
            announcementText: homepageSettingsRes.data.announcement_text,
            sections: homepageSettingsRes.data.sections || [],
          }
        : null,
      printingRequests: (printingRes.data || []).map((row) => ({
        id: row.id,
        customerName: row.customer_name,
        phone: row.phone,
        email: row.email || '',
        university: 'Cairo University',
        collegeId: (row.college as CollegeId) || 'engineering',
        fileName: row.file_name,
        fileType: 'PDF',
        fileSize: '1.2 MB',
        fileUrl: row.file_url,
        paperSize: (row.paper_size || 'A4') as 'A4' | 'A3' | 'A2' | 'A1',
        colorMode: (row.color_mode || 'bw') as 'bw' | 'color',
        paperType: row.paper_type || 'Standard 80gsm',
        binding: row.binding_type || 'Spiral',
        pages: Number(row.pages || 1),
        copies: Number(row.copies || 1),
        price: Number(row.total_price || 0),
        status: (row.status as PrintingStatus) || 'Pending',
        submittedAt: row.submitted_at || new Date().toISOString(),
        pickupPoint: row.pickup_point || 'Campus Hub',
        notes: row.notes,
        timeline: row.timeline || [],
        internalNotes: row.internal_notes || [],
      })),
      customOrders: (customOrdersRes.data || []).map((row) => ({
        id: row.id,
        customerName: row.customer_name,
        phone: row.phone,
        email: row.email,
        productType: row.product_type,
        customizationText: row.customization_text || row.description || '',
        selectedColor: row.color || 'Matte Black',
        facultyBadge: row.college || 'Engineering',
        quantity: Number(row.quantity || 1),
        price: Number(row.total_price || 0),
        status: (row.status as CustomOrderStatus) || 'Pending',
        date: row.date || new Date().toISOString(),
        notes: row.description,
        referenceImage: row.reference_image,
        collegeId: (row.college as CollegeId) || 'engineering',
        timeline: row.timeline || [],
        internalNotes: row.internal_notes || [],
      })),
      notifications: (notificationsRes.data || []).map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        type: row.type as any,
        timestamp: row.timestamp,
        read: Boolean(row.read),
        linkTab: row.link_tab as any,
      })),
      storeSettings: storeSettingsRes.data
        ? {
            storeName: storeSettingsRes.data.store_name,
            tagline: storeSettingsRes.data.tagline,
            logoUrl: storeSettingsRes.data.logo_url,
            faviconUrl: storeSettingsRes.data.favicon_url,
            storeDescription: storeSettingsRes.data.store_description,
            physicalAddress: storeSettingsRes.data.physical_address,
            privacyPolicyUrl: storeSettingsRes.data.privacy_policy_url,
            termsOfServiceUrl: storeSettingsRes.data.terms_of_service_url,
            supportPhone: storeSettingsRes.data.support_phone,
            supportEmail: storeSettingsRes.data.support_email,
            freeShippingThreshold: Number(storeSettingsRes.data.free_shipping_threshold || 500),
            standardShippingFee: Number(storeSettingsRes.data.standard_shipping_fee || 35),
            currency: storeSettingsRes.data.currency || 'EGP',
            currencySymbol: storeSettingsRes.data.currency_symbol || 'EGP',
            taxRate: Number(storeSettingsRes.data.tax_rate || 0),
            campuses: storeSettingsRes.data.campuses || [],
            adminPin: storeSettingsRes.data.admin_pin || 'admin2026',
            storeOpen: Boolean(storeSettingsRes.data.store_open ?? true),
            storeClosedMessage: storeSettingsRes.data.store_closed_message,
            siteTitle: storeSettingsRes.data.site_title,
            metaDescription: storeSettingsRes.data.meta_description,
            socialSharingImage: storeSettingsRes.data.social_sharing_image,
            navigationLinks: storeSettingsRes.data.navigation_links || [],
            pickupLocations: storeSettingsRes.data.pickup_locations || [],
            paymentMethods: storeSettingsRes.data.payment_methods || [],
            deliverySettings: storeSettingsRes.data.delivery_settings || {},
            websiteContent: storeSettingsRes.data.website_content || {},
            socialLinks: storeSettingsRes.data.social_links || {},
            customDesignTemplates: storeSettingsRes.data.custom_design_templates || [],
          }
        : null,
      inventoryLogs: (inventoryLogsRes.data || []).map((row) => ({
        id: row.id,
        productId: row.product_id,
        productTitle: row.product_title,
        action: row.action,
        quantityDelta: Number(row.quantity_delta),
        previousStock: Number(row.previous_stock),
        newStock: Number(row.new_stock),
        dateTime: row.date_time,
        adminName: row.admin_name,
      })),
    };
  } catch (err) {
    console.error('Error fetching data from Supabase:', err);
    return null;
  }
};

/**
 * Create Order + Order Items in Supabase securely
 */
export const createOrderInSupabase = async (order: Order) => {
  if (!supabase || !isSupabaseConfigured()) return false;

  try {
    const dbOrder = mapOrderToDb(order);
    const { error: orderErr } = await supabase.from('orders').insert(dbOrder);
    if (orderErr) {
      console.error('Failed inserting order to Supabase:', orderErr);
      return false;
    }

    if (order.items && order.items.length > 0) {
      const dbItems = order.items.map((item) => mapOrderItemToDb(item, order.id));
      const { error: itemsErr } = await supabase.from('order_items').insert(dbItems);
      if (itemsErr) {
        console.error('Failed inserting order items to Supabase:', itemsErr);
      }
    }

    return true;
  } catch (err) {
    console.error('Order creation exception:', err);
    return false;
  }
};

/**
 * Securely track an order requiring BOTH orderId AND phone match
 */
export const trackOrderInSupabase = async (orderId: string, phone: string): Promise<Order | null> => {
  if (!supabase || !isSupabaseConfigured()) return null;

  const cleanOrder = orderId.trim().toUpperCase();
  const cleanUserPhone = normalizePhone(phone);

  try {
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', cleanOrder)
      .maybeSingle();

    if (orderErr || !orderData) return null;

    const dbPhoneClean = normalizePhone(orderData.phone || '');
    if (dbPhoneClean !== cleanUserPhone && !dbPhoneClean.endsWith(cleanUserPhone) && !cleanUserPhone.endsWith(dbPhoneClean)) {
      // Order ID exists but phone mismatch for security
      return null;
    }

    // Fetch order items for this verified order
    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', cleanOrder);

    const items = (itemsData || []).map(mapOrderItemFromDb);
    return mapOrderFromDb(orderData, items);
  } catch (err) {
    console.error('Error tracking order from Supabase:', err);
    return null;
  }
};

/**
 * Test whether the Supabase database connection and tables are ready
 */
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase credentials are not configured yet.' };
  }
  try {
    const { error } = await supabase.from('products').select('id', { head: true, count: 'exact' });
    if (error) {
      return { success: false, message: error.message || 'Failed to query Supabase products table.' };
    }
    return { success: true, message: 'Connected successfully to Supabase cloud database.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error connecting to Supabase.' };
  }
};

/**
 * Seed initial mock data to Supabase ONLY ONCE if database is fresh
 */
export const seedInitialDataToSupabase = async (seedData: any) => {
  if (!supabase || !isSupabaseConfigured()) return;

  // Never re-seed if already seeded before
  if (typeof window !== 'undefined' && localStorage.getItem('sh_supabase_seeded') === 'true') {
    return;
  }

  try {
    // Check if store settings already exist (means db is initialized)
    const { count: settingsCount } = await supabase.from('store_settings').select('*', { count: 'exact', head: true });
    if (settingsCount && settingsCount > 0) {
      if (typeof window !== 'undefined') localStorage.setItem('sh_supabase_seeded', 'true');
      return;
    }

    // Check if products exist
    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
    if (count === 0 && seedData.products && seedData.products.length > 0) {
      console.log('Seeding initial products to Supabase...');
      const dbProducts = seedData.products.map(mapProductToDb);
      await supabase.from('products').insert(dbProducts);
    }

    // Check categories
    const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    if (catCount === 0 && seedData.categories && seedData.categories.length > 0) {
      console.log('Seeding initial categories to Supabase...');
      const dbCategories = seedData.categories.map((c: Category) => ({
        id: c.id,
        name: c.name,
        college_id: c.collegeId,
        icon: c.icon,
      }));
      await supabase.from('categories').insert(dbCategories);
    }

    // Seed store settings
    if (seedData.settings) {
      console.log('Seeding store settings to Supabase...');
      const s = seedData.settings;
      await supabase.from('store_settings').upsert({
        id: 'default',
        store_name: s.storeName,
        tagline: s.tagline,
        logo_url: s.logoUrl,
        favicon_url: s.faviconUrl,
        store_description: s.storeDescription,
        physical_address: s.physicalAddress,
        support_phone: s.supportPhone,
        support_email: s.supportEmail,
        free_shipping_threshold: s.freeShippingThreshold,
        standard_shipping_fee: s.standardShippingFee,
        currency: s.currency,
        currency_symbol: s.currencySymbol,
        tax_rate: s.taxRate,
        campuses: s.campuses,
        admin_pin: s.adminPin || 'admin2026',
        store_open: s.storeOpen ?? true,
        store_closed_message: s.storeClosedMessage,
        site_title: s.siteTitle,
        meta_description: s.metaDescription,
        social_sharing_image: s.socialSharingImage,
        navigation_links: s.navigationLinks,
        pickup_locations: s.pickupLocations,
        payment_methods: s.paymentMethods,
        delivery_settings: s.deliverySettings,
        website_content: s.websiteContent,
        social_links: s.socialLinks,
        custom_design_templates: s.customDesignTemplates,
      });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sh_supabase_seeded', 'true');
    }
  } catch (err) {
    console.error('Error during Supabase initial seeding:', err);
  }
};

/**
 * Manually upload & sync all active local data to Supabase
 */
export const syncAllLocalDataToSupabase = async (data: {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  settings: StoreSettings;
  coupons?: Coupon[];
  banners?: HomepageBanner[];
  orders?: Order[];
}): Promise<{ success: boolean; message: string }> => {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured yet.' };
  }

  try {
    // 1. Sync Categories
    if (data.categories && data.categories.length > 0) {
      const dbCats = data.categories.map((c) => ({
        id: c.id,
        name: c.name,
        college_id: c.collegeId,
        icon: c.icon,
      }));
      await supabase.from('categories').upsert(dbCats);
    }

    // 2. Sync Subcategories
    if (data.subcategories && data.subcategories.length > 0) {
      const dbSubs = data.subcategories.map((s) => ({
        id: s.id,
        name: s.name,
        category_id: s.categoryId,
        college_id: s.collegeId,
      }));
      await supabase.from('subcategories').upsert(dbSubs);
    }

    // 3. Sync Products
    if (data.products && data.products.length > 0) {
      const dbProds = data.products.map(mapProductToDb);
      await supabase.from('products').upsert(dbProds);
    }

    // 4. Sync Settings
    if (data.settings) {
      const s = data.settings;
      await supabase.from('store_settings').upsert({
        id: 'default',
        store_name: s.storeName,
        tagline: s.tagline,
        logo_url: s.logoUrl,
        favicon_url: s.faviconUrl,
        store_description: s.storeDescription,
        physical_address: s.physicalAddress,
        support_phone: s.supportPhone,
        support_email: s.supportEmail,
        free_shipping_threshold: s.freeShippingThreshold,
        standard_shipping_fee: s.standardShippingFee,
        currency: s.currency,
        currency_symbol: s.currencySymbol,
        tax_rate: s.taxRate,
        campuses: s.campuses,
        admin_pin: s.adminPin || 'admin2026',
        store_open: s.storeOpen ?? true,
        store_closed_message: s.storeClosedMessage,
        site_title: s.siteTitle,
        meta_description: s.metaDescription,
        social_sharing_image: s.socialSharingImage,
        navigation_links: s.navigationLinks,
        pickup_locations: s.pickupLocations,
        payment_methods: s.paymentMethods,
        delivery_settings: s.deliverySettings,
        website_content: s.websiteContent,
        social_links: s.socialLinks,
        custom_design_templates: s.customDesignTemplates,
      });
    }

    // 5. Sync Coupons
    if (data.coupons && data.coupons.length > 0) {
      const dbCoupons = data.coupons.map((c) => ({
        id: c.id,
        code: c.code,
        discount_type: c.discountType,
        discount_value: c.discountValue,
        min_order_amount: c.minOrderAmount,
        college_id: c.collegeId,
        max_uses: c.maxUses,
        times_used: c.timesUsed,
        expiry_date: c.expiryDate,
        active: c.active,
      }));
      await supabase.from('coupons').upsert(dbCoupons);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sh_supabase_seeded', 'true');
    }

    return { success: true, message: 'All local products, categories, coupons, and settings uploaded to Supabase!' };
  } catch (err: any) {
    console.error('Error syncing local data to Supabase:', err);
    return { success: false, message: err?.message || 'Failed to sync data to Supabase.' };
  }
};
