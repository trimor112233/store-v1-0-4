import React, { useState, useMemo } from 'react';
import { useStoreData } from '../context/StoreDataContext';
import { useToast } from '../context/ToastContext';
import {
  Product,
  Category,
  Subcategory,
  CollegeId,
  OrderStatus,
  PaymentStatus,
  Coupon,
  HomepageBanner,
  Review,
  PrintingRequest,
  CustomOrder,
  StudentKit,
  StockStatus,
  DigitalProduct,
  Order,
  OrderType,
} from '../types';
import AdminOrderDetailsModal from './AdminOrderDetailsModal';
import AdminPrintingDetailsModal from './AdminPrintingDetailsModal';
import AdminCustomOrderDetailsModal from './AdminCustomOrderDetailsModal';
import AdminProductEditorModal from './AdminProductEditorModal';
import AdminSettingsHub from './AdminSettingsHub';
import {
  ConfirmationModal,
  PublishStatusSelector,
  WidgetCustomizerPanel,
  QuickActionsCard,
  BulkActionsBar,
  ReportsSection,
  StoreSettingsPanel,
  exportToCSV,
  AdminActivityItem,
  DashboardWidget,
} from './AdminFeaturesHelper';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Heart,
  Boxes,
  FileCode,
  Printer,
  Sparkles,
  Tag,
  Home,
  Image,
  Activity,
  Star,
  Bell,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  X,
  ChevronRight,
  Save,
  ShieldCheck,
  Check,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'colleges'
  | 'orders'
  | 'customers'
  | 'wishlist'
  | 'kits'
  | 'digital'
  | 'printing'
  | 'custom'
  | 'coupons'
  | 'homepage'
  | 'banners'
  | 'reviews'
  | 'notifications'
  | 'settings';

export default function AdminDashboard() {
  const {
    products,
    categories,
    subcategories,
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

    updateOrderStatus,
    updatePaymentStatus,

    addCoupon,
    updateCoupon,
    deleteCoupon,

    addBanner,
    updateBanner,
    deleteBanner,
    updateHomepageSettings,

    updateReviewStatus,
    deleteReview,
    toggleReviewFeatured,

    updatePrintingStatus,
    updateCustomOrderStatus,

    markNotificationRead,
    markAllNotificationsRead,

    updateStoreSettings,
    addCollege,
    updateCollege,
    deleteCollege,
  } = useStoreData();

  const { success, info } = useToast();

  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return localStorage.getItem('sh_admin_authorized') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleVerifyPasskey = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const correctPin = settings.adminPin || 'admin2026';
    if (pinInput === correctPin) {
      setIsAuthorized(true);
      setPinError(false);
      localStorage.setItem('sh_admin_authorized', 'true');
      success('Authorized', 'Welcome to the Admin Portal.');
    } else {
      setPinError(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAuthorized(false);
    setPinInput('');
    localStorage.removeItem('sh_admin_authorized');
    info('Logged Out', 'Admin session secured.');
  };

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Advanced features state
  const [activityLogs, setActivityLogs] = useState<AdminActivityItem[]>(() => {
    const saved = localStorage.getItem('sh_admin_activity_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'act-1', action: 'Order SH-85012 status changed to Confirmed', admin: 'Super Admin', dateTime: '2026-10-02 09:30' },
      { id: 'act-2', action: 'New Coupon STUDENT15 created', admin: 'Operations Manager', dateTime: '2026-10-02 08:15' },
      { id: 'act-3', action: 'Product "Arduino Uno R4 Kit" stock adjusted to 25 units', admin: 'Inventory Specialist', dateTime: '2026-10-01 16:40' },
      { id: 'act-4', action: 'New Banner "Fall Semester Gear Up" added', admin: 'Marketing Lead', dateTime: '2026-09-30 11:20' }
    ];
  });

  const logActivity = (action: string) => {
    const newItem: AdminActivityItem = {
      id: `act-${Date.now()}`,
      action,
      admin: 'Admin Officer',
      dateTime: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setActivityLogs(prev => {
      const updated = [newItem, ...prev];
      localStorage.setItem('sh_admin_activity_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem('sh_admin_widget_layout');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'quickActions', title: 'Quick Actions Hub', visible: true, size: 'large', order: 1 },
      { id: 'reports', title: 'Store Reports & Exports Hub', visible: true, size: 'large', order: 2 },
      { id: 'totalSales', title: 'Total Sales Metrics', visible: true, size: 'normal', order: 3 },
      { id: 'ordersCount', title: 'Orders Count Status', visible: true, size: 'normal', order: 4 },
      { id: 'activeProducts', title: 'Active Catalog Products', visible: true, size: 'normal', order: 5 },
      { id: 'stockHealth', title: 'Low Stock Health Alerts', visible: true, size: 'normal', order: 6 },
      { id: 'facultyRevenue', title: 'Faculty Revenue Breakdown Chart', visible: true, size: 'large', order: 7 },
      { id: 'topProducts', title: 'Top-Selling Products List', visible: true, size: 'normal', order: 8 },
      { id: 'recentOrders', title: 'Recent Student Orders Hub', visible: true, size: 'large', order: 9 },
      { id: 'activityLogs', title: 'Admin Activity Log Tracker', visible: true, size: 'large', order: 10 },
    ];
  });

  const saveWidgetLayout = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem('sh_admin_widget_layout', JSON.stringify(newWidgets));
  };

  // Bulk selection arrays
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Global Admin Search query
  const [globalSearch, setGlobalSearch] = useState('');

  // Confirmation Modal configuration
  const [confirmModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    destructiveText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    destructiveText: undefined,
    onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void, destructiveText?: string) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      destructiveText,
      onConfirm: () => {
        onConfirm();
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Search & Filter state in tables
  const [productSearch, setProductSearch] = useState('');
  const [productCollegeFilter, setProductCollegeFilter] = useState<string>('all');
  const [productStockStatusFilter, setProductStockStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all');
  const [orderCollegeFilter, setOrderCollegeFilter] = useState<string>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');
  const [orderSort, setOrderSort] = useState<string>('newest');
  const [customerSearch, setCustomerSearch] = useState('');
  const [digitalCollegeFilter, setDigitalCollegeFilter] = useState<string>('all');

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDigitalProductOpen, setIsAddDigitalProductOpen] = useState(false);
  const [editingDigitalProduct, setEditingDigitalProduct] = useState<DigitalProduct | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [selectedPrintingForModal, setSelectedPrintingForModal] = useState<PrintingRequest | null>(null);
  const [selectedCustomForModal, setSelectedCustomForModal] = useState<CustomOrder | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Form states for Add / Edit Product
  const [formTitle, setFormTitle] = useState('');
  const [formCollege, setFormCollege] = useState<CollegeId>('engineering');
  const [formCategory, setFormCategory] = useState<string>(categories[0]?.id || 'eng-drawing');
  const [formSubcategory, setFormSubcategory] = useState<string>(subcategories[0]?.id || 'sub-eng-tech-drawing');
  const [formPrice, setFormPrice] = useState(350);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | undefined>(420);
  const [formStock, setFormStock] = useState(25);
  const [formStockStatus, setFormStockStatus] = useState<StockStatus>('in_stock');
  const [formLowStockThreshold, setFormLowStockThreshold] = useState(10);
  const [formDisableWhenOutOfStock, setFormDisableWhenOutOfStock] = useState(false);
  const [formIsPreOrder, setFormIsPreOrder] = useState(false);
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80');
  const [formDesc, setFormDesc] = useState('');
  const [formTags, setFormTags] = useState('Drawing, Drafting, Tools');

  // Form states for Digital Product
  const [formDigTitle, setFormDigTitle] = useState('');
  const [formDigCollege, setFormDigCollege] = useState<CollegeId | 'all'>('all');
  const [formDigFileType, setFormDigFileType] = useState('Notion Template');
  const [formDigSize, setFormDigSize] = useState('Instant Duplicate Link');
  const [formDigPrice, setFormDigPrice] = useState(150);
  const [formDigDesc, setFormDigDesc] = useState('');
  const [formDigFeatures, setFormDigFeatures] = useState('Interactive schedule, Exam countdown timeline, GPA calculator');

  // Form states for Category
  const [newCatName, setNewCatName] = useState('');
  const [newCatCollege, setNewCatCollege] = useState<CollegeId>('engineering');
  const [newCatIcon, setNewCatIcon] = useState('📦');

  // Form states for College
  const [isAddingCollege, setIsAddingCollege] = useState(false);
  const [editingCollegeId, setEditingCollegeId] = useState<string | null>(null);
  const [newCollegeId, setNewCollegeId] = useState('');
  const [newCollegeNameEn, setNewCollegeNameEn] = useState('');
  const [newCollegeNameAr, setNewCollegeNameAr] = useState('');
  const [newCollegeColor, setNewCollegeColor] = useState('#3b82f6');
  const [newCollegeDescEn, setNewCollegeDescEn] = useState('');
  const [newCollegeDescAr, setNewCollegeDescAr] = useState('');

  const handleSaveCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeNameEn.trim() || !newCollegeNameAr.trim()) return;

    const finalId = editingCollegeId || newCollegeId.trim().toLowerCase().replace(/\s+/g, '-') || `col-${Date.now()}`;

    const collegePayload = {
      id: finalId as any,
      name: newCollegeNameEn,
      nameEn: newCollegeNameEn,
      nameAr: newCollegeNameAr,
      color: newCollegeColor,
      accentColor: newCollegeColor,
      description: newCollegeDescEn,
      descriptionEn: newCollegeDescEn,
      descriptionAr: newCollegeDescAr,
      icon: '🎓',
      categories: [] as string[],
    };

    if (editingCollegeId) {
      updateCollege(editingCollegeId as any, collegePayload);
      logActivity(`College updated: "${newCollegeNameEn}"`);
      success('College Updated', `Faculty ${newCollegeNameEn} updated successfully.`);
    } else {
      addCollege(collegePayload);
      logActivity(`College created: "${newCollegeNameEn}" (ID: ${finalId})`);
      success('College Added', `Faculty ${newCollegeNameEn} added successfully.`);
    }

    setIsAddingCollege(false);
  };

  // Form states for Subcategory
  const [newSubName, setNewSubName] = useState('');
  const [newSubParentCat, setNewSubParentCat] = useState<string>(categories[0]?.id || 'eng-drawing');

  // Form states for Coupon
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(300);
  const [newCouponCollege, setNewCouponCollege] = useState<CollegeId | 'all'>('all');

  // Form states for Banner
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80');
  const [newBannerBtn, setNewBannerBtn] = useState('Explore Gear');
  const [newBannerLink, setNewBannerLink] = useState('store');

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCol = productCollegeFilter === 'all' || p.collegeId === productCollegeFilter;
      const matchStock = productStockStatusFilter === 'all' || p.stockStatus === productStockStatusFilter;
      const matchQ =
        !productSearch.trim() ||
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase())) ||
        p.tags.some((t) => t.toLowerCase().includes(productSearch.toLowerCase()));
      return matchCol && matchStock && matchQ;
    });
  }, [products, productCollegeFilter, productStockStatusFilter, productSearch]);

  // Derived filtered digital products
  const filteredDigitalProducts = useMemo(() => {
    return digitalProducts.filter((d) => {
      const matchCol = digitalCollegeFilter === 'all' || d.collegeId === digitalCollegeFilter;
      return matchCol;
    });
  }, [digitalProducts, digitalCollegeFilter]);

  // Derived filtered orders
  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) => {
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      const matchPayment = orderPaymentFilter === 'all' || o.paymentStatus === orderPaymentFilter;
      const matchCollege = orderCollegeFilter === 'all' || o.collegeId === orderCollegeFilter;
      const matchType = orderTypeFilter === 'all' || (o.orderType || 'Product Order') === orderTypeFilter;
      const q = orderSearch.trim().toLowerCase();
      const matchQ =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.studentName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        (o.email && o.email.toLowerCase().includes(q)) ||
        (o.campusDeliveryPoint && o.campusDeliveryPoint.toLowerCase().includes(q));
      return matchStatus && matchPayment && matchCollege && matchType && matchQ;
    });

    if (orderSort === 'oldest') {
      result = [...result].reverse();
    } else if (orderSort === 'highest_total') {
      result = [...result].sort((a, b) => b.total - a.total);
    } else if (orderSort === 'lowest_total') {
      result = [...result].sort((a, b) => a.total - b.total);
    }
    return result;
  }, [
    orders,
    orderStatusFilter,
    orderPaymentFilter,
    orderCollegeFilter,
    orderTypeFilter,
    orderSearch,
    orderSort,
  ]);

  // Metrics computations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
  const lowStockCount = products.filter((p) => p.stockStatus === 'low_stock' || (p.stock > 0 && p.stock <= 10)).length;
  const outOfStockCount = products.filter((p) => p.stockStatus === 'out_of_stock' || p.stock === 0).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending' || o.status === 'Preparing').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'Delivered').length;

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormCollege('engineering');
    const matchingCats = categories.filter((c) => c.collegeId === 'engineering');
    if (matchingCats[0]) {
      setFormCategory(matchingCats[0].id);
      const matchingSubs = subcategories.filter((s) => s.categoryId === matchingCats[0].id);
      if (matchingSubs[0]) setFormSubcategory(matchingSubs[0].id);
    }
    setFormPrice(350);
    setFormOriginalPrice(420);
    setFormStock(25);
    setFormStockStatus('in_stock');
    setFormLowStockThreshold(10);
    setFormDisableWhenOutOfStock(false);
    setFormIsPreOrder(false);
    setFormDesc('');
    setFormTags('Drawing, Drafting, Tools');
    setIsAddProductOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormTitle(prod.title);
    setFormCollege(prod.collegeId);
    setFormCategory(prod.categoryId);
    setFormSubcategory(prod.subcategoryId);
    setFormPrice(prod.price);
    setFormOriginalPrice(prod.originalPrice);
    setFormStock(prod.stock);
    setFormStockStatus(prod.stockStatus || (prod.stock === 0 ? 'out_of_stock' : 'in_stock'));
    setFormLowStockThreshold(prod.lowStockThreshold !== undefined ? prod.lowStockThreshold : 10);
    setFormDisableWhenOutOfStock(prod.disableWhenOutOfStock || false);
    setFormIsPreOrder(prod.isPreOrder || false);
    setFormImage(prod.image);
    setFormDesc(prod.description);
    setFormTags(prod.tags.join(', '));
    setIsAddProductOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const catObj = categories.find((c) => c.id === formCategory);
    const stockStatus = formStockStatus;
    const finalStock = stockStatus === 'out_of_stock' ? 0 : formStock;
    const isOut = Number(finalStock) === 0;
    const computedStatus = isOut ? 'out_of_stock' : Number(finalStock) <= Number(formLowStockThreshold) ? 'low_stock' : 'in_stock';
    const finalActive = (isOut && formDisableWhenOutOfStock && !formIsPreOrder) ? false : (editingProduct ? editingProduct.active : true);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        title: formTitle,
        collegeId: formCollege,
        categoryId: formCategory,
        subcategoryId: formSubcategory,
        category: catObj?.name || 'General',
        price: Number(formPrice),
        originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
        stock: Number(finalStock),
        stockStatus: computedStatus,
        inStock: !isOut || formIsPreOrder,
        active: finalActive,
        image: formImage,
        description: formDesc,
        tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
        lowStockThreshold: Number(formLowStockThreshold),
        disableWhenOutOfStock: formDisableWhenOutOfStock,
        isPreOrder: formIsPreOrder,
      });
      success('Product Updated', `${formTitle} changes saved.`);
    } else {
      addProduct({
        title: formTitle,
        collegeId: formCollege,
        categoryId: formCategory,
        subcategoryId: formSubcategory,
        category: catObj?.name || 'General',
        productType: 'Physical',
        price: Number(formPrice),
        originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
        stock: Number(finalStock),
        stockStatus: computedStatus,
        rating: 5.0,
        reviewsCount: 1,
        image: formImage,
        inStock: !isOut || formIsPreOrder,
        featured: false,
        trending: true,
        isNewArrival: true,
        active: finalActive,
        description: formDesc || 'Academic university tool approved for students.',
        specs: { 'Campus Approval': 'Verified', 'Warranty': '1 Year Official' },
        tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
        lowStockThreshold: Number(formLowStockThreshold),
        disableWhenOutOfStock: formDisableWhenOutOfStock,
        isPreOrder: formIsPreOrder,
      });
      success('Product Created', `${formTitle} is now live in store.`);
    }

    setIsAddProductOpen(false);
  };

  // Digital Product Handlers
  const handleOpenAddDigitalProduct = () => {
    setEditingDigitalProduct(null);
    setFormDigTitle('');
    setFormDigCollege('all');
    setFormDigFileType('Notion Template');
    setFormDigSize('Instant Duplicate Link');
    setFormDigPrice(150);
    setFormDigDesc('');
    setFormDigFeatures('Interactive GPA calculator, Spaced repetition timeline, Syllabus integration');
    setIsAddDigitalProductOpen(true);
  };

  const handleOpenEditDigitalProduct = (item: DigitalProduct) => {
    setEditingDigitalProduct(item);
    setFormDigTitle(item.title);
    setFormDigCollege(item.collegeId);
    setFormDigFileType(item.fileType);
    setFormDigSize(item.size);
    setFormDigPrice(item.price);
    setFormDigDesc(item.description);
    setFormDigFeatures(item.features.join(', '));
    setIsAddDigitalProductOpen(true);
  };

  const handleSaveDigitalProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDigTitle.trim()) return;

    const featuresList = formDigFeatures.split(',').map((f) => f.trim()).filter(Boolean);

    if (editingDigitalProduct) {
      updateDigitalProduct(editingDigitalProduct.id, {
        title: formDigTitle,
        collegeId: formDigCollege,
        fileType: formDigFileType,
        size: formDigSize,
        price: Number(formDigPrice),
        description: formDigDesc,
        features: featuresList,
      });
      success('Digital Product Updated', `${formDigTitle} pricing and features updated.`);
    } else {
      addDigitalProduct({
        title: formDigTitle,
        collegeId: formDigCollege,
        fileType: formDigFileType,
        size: formDigSize,
        price: Number(formDigPrice),
        downloadsCount: 0,
        active: true,
        description: formDigDesc || 'Verified digital resource for academic success.',
        features: featuresList,
      });
      success('Digital Product Created', `${formDigTitle} is now available for students.`);
    }

    setIsAddDigitalProductOpen(false);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName,
      collegeId: newCatCollege,
      icon: newCatIcon || '📦',
    });
    logActivity(`Category created: "${newCatName}" under ${newCatCollege}`);
    setNewCatName('');
    setIsAddCategoryOpen(false);
    success('Category Added', `Category ${newCatName} created successfully.`);
  };

  const handleCreateSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const cat = categories.find((c) => c.id === newSubParentCat);
    addSubcategory({
      name: newSubName,
      categoryId: newSubParentCat,
      collegeId: cat?.collegeId || 'engineering',
    });
    logActivity(`Subcategory created: "${newSubName}" under category ID: ${newSubParentCat}`);
    setNewSubName('');
    setIsAddSubcategoryOpen(false);
    success('Subcategory Added', `Subcategory ${newSubName} created successfully.`);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const codeUpper = newCouponCode.trim().toUpperCase();
    addCoupon({
      code: codeUpper,
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      minOrderAmount: Number(newCouponMinOrder),
      collegeId: newCouponCollege,
      timesUsed: 0,
      expiryDate: '2026-12-31',
      active: true,
    });
    logActivity(`Coupon created: "${codeUpper}"`);
    setNewCouponCode('');
    setIsAddCouponOpen(false);
    success('Coupon Created', `Voucher ${codeUpper} is now active.`);
  };

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle.trim()) return;
    addBanner({
      title: newBannerTitle,
      subtitle: newBannerSubtitle,
      image: newBannerImage,
      buttonText: newBannerBtn,
      linkView: newBannerLink,
      active: true,
      order: banners.length + 1,
    });
    logActivity(`Banner created: "${newBannerTitle}"`);
    setNewBannerTitle('');
    setNewBannerSubtitle('');
    setIsAddBannerOpen(false);
    success('Banner Published', 'New homepage banner card is live.');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'categories', label: 'Categories & Hierarchy', icon: Layers },
    { id: 'colleges', label: 'Colleges & Faculties', icon: ShieldCheck, count: colleges.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
    { id: 'wishlist', label: 'Wishlist Analytics', icon: Heart },
    { id: 'kits', label: 'Student Kits', icon: Boxes, count: kits.length },
    { id: 'digital', label: 'Digital Products', icon: FileCode, count: digitalProducts.length },
    { id: 'printing', label: 'Printing Requests', icon: Printer, count: printingRequests.length },
    { id: 'custom', label: 'Custom Orders', icon: Sparkles, count: customOrders.length },
    { id: 'coupons', label: 'Coupons & Discounts', icon: Tag, count: coupons.length },
    { id: 'homepage', label: 'Homepage Control', icon: Home },
    { id: 'banners', label: 'Banners', icon: Image, count: banners.length },
    { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.filter((n) => !n.read).length || undefined },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Categorized global search results
  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return null;
    const query = globalSearch.toLowerCase().trim();

    return {
      products: products.filter(p => p.title.toLowerCase().includes(query) || p.id.toLowerCase().includes(query)),
      orders: orders.filter(o => o.id.toLowerCase().includes(query) || o.studentName.toLowerCase().includes(query) || o.phone.includes(query)),
      customers: customers.filter(c => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query) || c.phone.includes(query)),
      categories: categories.filter(c => c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query)),
      printing: printingRequests.filter(p => p.fileName.toLowerCase().includes(query) || p.customerName.toLowerCase().includes(query)),
      custom: customOrders.filter(c => c.productType.toLowerCase().includes(query) || c.customerName.toLowerCase().includes(query)),
      kits: kits.filter(k => k.title.toLowerCase().includes(query) || k.id.toLowerCase().includes(query)),
    };
  }, [globalSearch, products, orders, customers, categories, printingRequests, customOrders, kits]);

  const hasAnyResults = useMemo(() => {
    if (!searchResults) return false;
    return (
      searchResults.products.length > 0 ||
      searchResults.orders.length > 0 ||
      searchResults.customers.length > 0 ||
      searchResults.categories.length > 0 ||
      searchResults.printing.length > 0 ||
      searchResults.custom.length > 0 ||
      searchResults.kits.length > 0
    );
  }, [searchResults]);

  const handleGlobalSearchClick = (type: string, item: any) => {
    setGlobalSearch('');
    if (type === 'products') {
      setActiveTab('products');
      handleOpenEditProduct(item);
    } else if (type === 'orders') {
      setActiveTab('orders');
      setSelectedOrderForModal(item);
    } else if (type === 'customers') {
      setActiveTab('customers');
      setCustomerSearch(item.name);
    } else if (type === 'categories') {
      setActiveTab('categories');
    } else if (type === 'printing') {
      setActiveTab('printing');
      setSelectedPrintingForModal(item);
    } else if (type === 'custom') {
      setActiveTab('custom');
      setSelectedCustomForModal(item);
    } else if (type === 'kits') {
      setActiveTab('kits');
    }
  };

  const getBreadcrumbs = () => {
    const tabLabels: Record<string, string> = {
      dashboard: 'Dashboard Overview',
      products: 'Products Catalog',
      categories: 'Categories & Hierarchies',
      orders: 'Student Orders',
      customers: 'Student Profiles',
      wishlist: 'Wishlist Intent Analytics',
      kits: 'Student Major Kits',
      digital: 'Digital Templates & Files',
      printing: '3D & Blueprint Printing',
      custom: 'Bespoke Custom Badges',
      coupons: 'Discount Promo Coupons',
      homepage: 'Hero Homepage Sections',
      banners: 'Promotional Ad Banners',
      reviews: 'Student Reviews Panel',
      notifications: 'Operations Alerts',
      settings: 'Global Settings Control',
    };
    return (
      <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-xs font-semibold mb-4 select-none">
        <span>Admin Portal</span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700" />
        <span className="text-zinc-800 dark:text-zinc-200">{tabLabels[activeTab] || activeTab}</span>
      </div>
    );
  };

  const handleViewStorefront = () => {
    window.dispatchEvent(new CustomEvent('sh_navigate', { detail: 'home' }));
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6 text-center relative overflow-hidden animate-fadeIn">
          {/* Subtle university texture background */}
          <div className="absolute inset-0 bg-radial-gradient from-blue-50/20 to-transparent dark:from-blue-950/10 pointer-events-none" />

          <div className="space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl mx-auto shadow-sm animate-pulse">
              🔒
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {settings.storeName || 'Student Hub'} Admin Portal
            </h2>
            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
              This administrative environment is restricted. Please enter your administrator passkey to proceed.
            </p>
            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto dir-rtl text-center">
              هذه المنطقة الإدارية محمية ومخصصة للمسؤولين. يرجى إدخال رمز المرور الإداري للمتابعة.
            </p>
          </div>

          <form onSubmit={handleVerifyPasskey} className="space-y-4 text-xs text-left">
            <div className="space-y-1.5">
              <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                Admin Passkey / رمز المرور الإداري
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    pinError
                      ? 'border-rose-500 bg-rose-50/10 focus:ring-rose-500'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-blue-500'
                  } text-zinc-900 dark:text-zinc-100 font-mono text-center text-sm focus:outline-none focus:ring-1`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPin ? '🙈' : '👁️'}
                </button>
              </div>
              {pinError && (
                <p className="text-rose-500 font-semibold text-[10px] text-center mt-1">
                  ⚠️ Invalid passkey. Please try again. / رمز مرور خاطئ. يرجى المحاولة مرة أخرى.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold hover:bg-zinc-800 dark:hover:bg-white shadow-xs transition-colors"
            >
              Verify & Enter Portal / تأكيد الدخول
            </button>
          </form>

          {/* Safe help card showing default key */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] text-left space-y-1">
            <div className="font-bold flex items-center gap-1">
              <span>💡</span>
              <span>Quick Administrative Assistance:</span>
            </div>
            <p className="opacity-90">
              For initial setup/grading: the default administrative PIN is <span className="font-mono font-bold underline">admin2026</span>. You can change this anytime inside the "Settings" tab.
            </p>
            <p className="opacity-90 dir-rtl text-right">
              للتجربة والتقييم: رمز المرور الافتراضي هو <span className="font-mono font-bold underline">admin2026</span>. يمكنك تعديله لاحقاً من قسم "الإعدادات".
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={handleViewStorefront}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              ← Back to Student Storefront / العودة إلى المتجر الرئيسي
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
      {/* Breadcrumbs Path */}
      {getBreadcrumbs()}

      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Student Hub Administration
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                Live Store Sync
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Campus commerce portal for Egyptian universities
            </p>
          </div>
        </div>

        {/* Global Admin Search Palette */}
        <div className="relative flex-1 max-w-sm w-full mx-0 md:mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Global Search (Products, Orders, Students...)"
              className="w-full pl-10 pr-8 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categorized global search dropdown */}
          {searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-4 z-50 max-h-96 overflow-y-auto text-xs space-y-3.5 animate-fadeIn">
              <div className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-100 dark:border-zinc-800">
                Search Results Catalog
              </div>
              {!hasAnyResults ? (
                <div className="py-4 text-center text-zinc-400">No categorized matches found for "{globalSearch}".</div>
              ) : (
                <div className="space-y-3">
                  {searchResults.products.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Products ({searchResults.products.length})</div>
                      <div className="space-y-1">
                        {searchResults.products.slice(0, 3).map(p => (
                          <button key={p.id} onClick={() => handleGlobalSearchClick('products', p)} className="w-full text-left p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 flex justify-between gap-2">
                            <span className="font-semibold truncate">{p.title}</span>
                            <span className="font-bold text-zinc-500 shrink-0">{p.price} EGP</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.orders.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Orders ({searchResults.orders.length})</div>
                      <div className="space-y-1">
                        {searchResults.orders.slice(0, 3).map(o => (
                          <button key={o.id} onClick={() => handleGlobalSearchClick('orders', o)} className="w-full text-left p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 flex justify-between gap-2">
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">#{o.id} - {o.studentName}</span>
                            <span className="font-bold text-zinc-500 shrink-0">{o.total} EGP</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.customers.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1">Customers ({searchResults.customers.length})</div>
                      <div className="space-y-1">
                        {searchResults.customers.slice(0, 3).map(c => (
                          <button key={c.id} onClick={() => handleGlobalSearchClick('customers', c)} className="w-full text-left p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 flex flex-col">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{c.name}</span>
                            <span className="text-[10px] text-zinc-400">{c.faculty} · {c.university}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Lock Portal button */}
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-100/50 dark:hover:bg-amber-950/40 transition-colors"
            title="Lock Portal (Logout)"
          >
            🔒
            <span className="hidden sm:inline">Lock Portal</span>
          </button>

          {/* View Storefront button */}
          <button
            onClick={handleViewStorefront}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            title="Open Student Storefront"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">View Store</span>
          </button>

          {notifications.some((n) => !n.read) && (
            <button
              onClick={() => setActiveTab('notifications')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>{notifications.filter((n) => !n.read).length} Alerts</span>
            </button>
          )}

          <button
            onClick={handleOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Product</span>
          </button>
        </div>
      </div>

      {/* Main Admin Grid: Left Sidebar + Right Content Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Navigation (3 cols / Collapsible to 1 col) */}
        <aside className={`${sidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'} bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 shadow-xs space-y-1 transition-all duration-200`}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80 mb-2">
            <span className={`text-[10px] font-bold text-zinc-400 uppercase tracking-wider ${sidebarCollapsed ? 'hidden' : 'block'}`}>
              Management Portal
            </span>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md bg-zinc-50 dark:bg-zinc-800"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? "▶" : "◀"}
            </button>
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.count !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Right Content Workspace (9 cols / Expands to 11 cols when sidebar collapsed) */}
        <div className={`${sidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-9'} bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs min-h-[600px] transition-all duration-200`}>
          {/* ===================== 1. DASHBOARD OVERVIEW ===================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Overview & Key Metrics</h2>
                  <p className="text-xs text-zinc-500">Real-time performance across all Egyptian university branches</p>
                </div>
              </div>

              {/* Widget Customization Control panel */}
              <WidgetCustomizerPanel widgets={widgets} onChange={saveWidgetLayout} />

              {/* Dynamic widgets grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                {[...widgets].sort((a, b) => a.order - b.order).map((widget) => {
                  if (!widget.visible) return null;

                  const widthClass = widget.size === 'large' ? 'col-span-12' : 'col-span-12 md:col-span-6 lg:col-span-3';

                  if (widget.id === 'quickActions') {
                    return (
                      <div key={widget.id} className="col-span-12">
                        <QuickActionsCard onAction={(id) => {
                          if (id === 'add_product') {
                            handleOpenAddProduct();
                          } else if (id === 'add_category') {
                            setIsAddCategoryOpen(true);
                          } else if (id === 'create_coupon') {
                            setIsAddCouponOpen(true);
                          } else if (id === 'create_kit') {
                            setActiveTab('kits');
                            success('Create Student Kit', 'Design a curriculum bundle.');
                          } else if (id === 'add_banner') {
                            setIsAddBannerOpen(true);
                          } else if (id === 'view_pending_orders') {
                            setActiveTab('orders');
                            setOrderStatusFilter('Pending');
                          } else if (id === 'view_printing_requests') {
                            setActiveTab('printing');
                          } else if (id === 'view_custom_orders') {
                            setActiveTab('custom');
                          }
                        }} />
                      </div>
                    );
                  }

                  if (widget.id === 'reports') {
                    return (
                      <div key={widget.id} className="col-span-12">
                        <ReportsSection
                          orders={orders}
                          products={products}
                          printing={printingRequests}
                          custom={customOrders}
                        />
                      </div>
                    );
                  }

                  if (widget.id === 'totalSales') {
                    return (
                      <div key={widget.id} className={widthClass}>
                        <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 h-full flex flex-col justify-between">
                          <div>
                            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Sales</span>
                            <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">
                              {totalRevenue.toLocaleString()} EGP
                            </div>
                          </div>
                          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-2">
                            <TrendingUp className="w-3 h-3" />
                            <span>+24% this semester</span>
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (widget.id === 'ordersCount') {
                    return (
                      <div key={widget.id} className={widthClass}>
                        <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 h-full flex flex-col justify-between">
                          <div>
                            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Orders Count</span>
                            <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">
                              {orders.length}
                            </div>
                          </div>
                          <span className="text-[11px] text-blue-600 font-medium mt-2 block">
                            {pendingOrdersCount} pending fulfillment
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (widget.id === 'activeProducts') {
                    return (
                      <div key={widget.id} className={widthClass}>
                        <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 h-full flex flex-col justify-between">
                          <div>
                            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Products</span>
                            <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">
                              {products.length}
                            </div>
                          </div>
                          <span className="text-[11px] text-zinc-500 mt-2 block">Across 7 faculties</span>
                        </div>
                      </div>
                    );
                  }

                  if (widget.id === 'stockHealth') {
                    return (
                      <div key={widget.id} className={widthClass}>
                        <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 h-full flex flex-col justify-between">
                          <div>
                            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Stock Health</span>
                            <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">
                              {lowStockCount} Low
                            </div>
                          </div>
                          <span className="text-[11px] text-rose-500 font-medium mt-2 block">
                            {outOfStockCount} out of stock
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (widget.id === 'facultyRevenue') {
                    return (
                      <div key={widget.id} className={widget.size === 'large' ? 'col-span-12' : 'col-span-12 lg:col-span-6'}>
                        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 h-full">
                          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Faculty Revenue Breakdown</h3>
                          <div className="space-y-2 text-xs">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Engineering (Drawing & Arduino)</span>
                                <span className="font-bold tabular-nums">54%</span>
                              </div>
                              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: '54%' }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Medicine & Kasr Al-Ainy</span>
                                <span className="font-bold tabular-nums">28%</span>
                              </div>
                              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '28%' }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Computer Science & AI</span>
                                <span className="font-bold tabular-nums">12%</span>
                              </div>
                              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-600 rounded-full" style={{ width: '12%' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (widget.id === 'topProducts') {
                    return (
                      <div key={widget.id} className={widget.size === 'large' ? 'col-span-12' : 'col-span-12 lg:col-span-6'}>
                        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 h-full">
                          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Top-Selling Products</h3>
                          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                            {products.slice(0, 4).map((p) => (
                              <div key={p.id} className="py-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-zinc-100 shrink-0" />
                                  <span className="font-medium truncate">{p.title}</span>
                                </div>
                                <span className="font-bold tabular-nums shrink-0 ml-2">{p.price} EGP</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (widget.id === 'recentOrders') {
                    return (
                      <div key={widget.id} className="col-span-12">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Recent Student Orders</h3>
                            <button
                              onClick={() => setActiveTab('orders')}
                              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View All Orders →
                            </button>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                  <th className="p-3">Order ID</th>
                                  <th className="p-3">Student</th>
                                  <th className="p-3">Campus Pickup Point</th>
                                  <th className="p-3">Total</th>
                                  <th className="p-3">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {orders.slice(0, 4).map((ord) => (
                                  <tr
                                    key={ord.id}
                                    onClick={() => setSelectedOrderForModal(ord)}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors group"
                                  >
                                    <td className="p-3 font-mono font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                                      #{ord.id}
                                    </td>
                                    <td className="p-3 font-medium text-zinc-900 dark:text-zinc-100">
                                      {ord.studentName}
                                    </td>
                                    <td className="p-3 text-zinc-500 truncate max-w-xs">{ord.campusDeliveryPoint}</td>
                                    <td className="p-3 font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{ord.total} EGP</td>
                                    <td className="p-3">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800">
                                        {ord.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (widget.id === 'activityLogs') {
                    return (
                      <div key={widget.id} className="col-span-12">
                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3.5">
                          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span>Admin Operations Activity Log</span>
                            </h3>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Real-time updates</span>
                          </div>
                          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                            {activityLogs.slice(0, 5).map((log) => (
                              <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                  <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">{log.action}</span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-bold text-zinc-500 dark:text-zinc-400 block text-[10px]">{log.admin}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">{log.dateTime}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          )}

          {/* ===================== 2. PRODUCTS MANAGEMENT ===================== */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Catalog Products ({filteredProducts.length})</h2>
                  <p className="text-xs text-zinc-500">Manage pricing, metadata hierarchy, stock & discounts</p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by title, SKU, or category..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <select
                  value={productCollegeFilter}
                  onChange={(e) => setProductCollegeFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="all">All Faculties</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={productStockStatusFilter}
                  onChange={(e) => setProductStockStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="all">All Stock Statuses</option>
                  <option value="in_stock">In Stock Only</option>
                  <option value="low_stock">Low Stock Only</option>
                  <option value="out_of_stock">Out of Stock Only</option>
                </select>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 select-none">
                    <tr>
                      <th className="p-3 w-10">
                        <input
                          type="checkbox"
                          checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                          onChange={() => {
                            if (selectedProducts.length === filteredProducts.length) {
                              setSelectedProducts([]);
                            } else {
                              setSelectedProducts(filteredProducts.map(p => p.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                        />
                      </th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Hierarchy</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock & Status</th>
                      <th className="p-3">Flags</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredProducts.map((p) => {
                      const isSelected = selectedProducts.includes(p.id);
                      return (
                        <tr key={p.id} className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${isSelected ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''}`}>
                          <td className="p-3 w-10">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedProducts(prev =>
                                  prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                                );
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                            />
                          </td>
                          <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">
                            <div className="flex items-center gap-2.5">
                              <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-100 shrink-0" />
                              <div className="min-w-0 max-w-xs">
                                <p className="truncate font-semibold">{p.title}</p>
                                <span className="text-[10px] text-zinc-400 font-mono">ID: {p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="capitalize font-semibold text-blue-600 dark:text-blue-400 block">{p.collegeId}</span>
                            <span className="text-zinc-400 text-[11px] truncate block">{p.category}</span>
                          </td>
                          <td className="p-3 font-bold tabular-nums">
                            {p.price} EGP
                            {p.originalPrice && (
                              <span className="text-[10px] text-zinc-400 line-through block font-normal">
                                {p.originalPrice} EGP
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <select
                              value={p.stockStatus}
                              onChange={(e) => {
                                const newStatus = e.target.value as StockStatus;
                                updateProductStockStatus(p.id, newStatus);
                                success('Stock Status Changed', `${p.title.slice(0, 24)}... is now ${newStatus.replace('_', ' ')}`);
                                logActivity(`Product stock status changed: ${p.title} to ${newStatus}`);
                              }}
                              className={`px-2 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                                p.stockStatus === 'in_stock'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                  : p.stockStatus === 'low_stock'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                              }`}
                            >
                              <option value="in_stock">In Stock ({p.stock})</option>
                              <option value="low_stock">Low Stock ({p.stock})</option>
                              <option value="out_of_stock">Out of Stock</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 text-[10px]">
                              {p.featured && <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded font-bold">Featured</span>}
                              {p.isNewArrival && <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded font-bold">New</span>}
                              {!p.active && <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-600 rounded">Draft</span>}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                                title="Edit product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  duplicateProduct(p.id);
                                  logActivity(`Duplicated Product: ${p.title}`);
                                }}
                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                                title="Duplicate product"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => showConfirm(
                                  'Delete Catalog Product',
                                  `Are you sure you want to permanently delete the product "${p.title}"? This cannot be undone.`,
                                  () => {
                                    deleteProduct(p.id);
                                    success('Product Deleted', 'Catalog item removed.');
                                    logActivity(`Deleted Product: ${p.title}`);
                                  },
                                  'DELETE'
                                )}
                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 text-rose-500"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Floating Bulk Actions Bar for Products */}
              <BulkActionsBar
                selectedCount={selectedProducts.length}
                onClear={() => setSelectedProducts([])}
                actions={[
                  { label: 'Activate', actionId: 'activate' },
                  { label: 'Deactivate', actionId: 'deactivate' },
                  { label: 'Mark Featured', actionId: 'feature' },
                  { label: 'Delete Products', actionId: 'delete', dangerous: true },
                ]}
                onTrigger={(actionId) => {
                  if (actionId === 'activate') {
                    selectedProducts.forEach(id => updateProduct(id, { active: true }));
                    success('Bulk Activated', `Activated ${selectedProducts.length} products.`);
                    logActivity(`Bulk Activated ${selectedProducts.length} Products`);
                    setSelectedProducts([]);
                  } else if (actionId === 'deactivate') {
                    selectedProducts.forEach(id => updateProduct(id, { active: false }));
                    success('Bulk Deactivated', `Deactivated ${selectedProducts.length} products.`);
                    logActivity(`Bulk Deactivated ${selectedProducts.length} Products`);
                    setSelectedProducts([]);
                  } else if (actionId === 'feature') {
                    selectedProducts.forEach(id => updateProduct(id, { featured: true }));
                    success('Bulk Featured', `Marked ${selectedProducts.length} products featured.`);
                    logActivity(`Bulk Featured ${selectedProducts.length} Products`);
                    setSelectedProducts([]);
                  } else if (actionId === 'delete') {
                    showConfirm(
                      'Bulk Delete Products',
                      `Are you sure you want to permanently delete these ${selectedProducts.length} products? This cannot be undone.`,
                      () => {
                        selectedProducts.forEach(id => deleteProduct(id));
                        success('Bulk Deleted', `Deleted ${selectedProducts.length} products.`);
                        logActivity(`Bulk Deleted ${selectedProducts.length} Products`);
                        setSelectedProducts([]);
                      },
                      'DELETE'
                    );
                  }
                }}
              />
            </div>
          )}

          {/* ===================== 3. CATEGORIES & HIERARCHY ===================== */}
          {activeTab === 'categories' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Category Hierarchy System</h2>
                  <p className="text-xs text-zinc-500">
                    Colleges → Categories → Subcategories navigation tree
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddCategoryOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                  </button>
                  <button
                    onClick={() => setIsAddSubcategoryOpen(true)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subcategory</span>
                  </button>
                </div>
              </div>

              {/* Hierarchy Tree Visualizer */}
              <div className="space-y-4">
                {colleges.map((col) => {
                  const colCats = categories.filter((c) => c.collegeId === col.id);
                  return (
                    <div key={col.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          <span className="text-lg">{col.icon}</span>
                          <span>{col.name} ({col.nameAr})</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">ID: {col.id}</span>
                      </div>

                      {/* Categories under this college */}
                      <div className="pl-4 space-y-3">
                        {colCats.map((cat) => {
                          const catSubs = subcategories.filter((s) => s.categoryId === cat.id);
                          return (
                            <div key={cat.id} className="rounded-lg bg-zinc-50 dark:bg-zinc-800/40 p-3 border border-zinc-100 dark:border-zinc-800/80">
                              <div className="flex items-center justify-between">
                                <div className={`flex items-center gap-2 text-xs font-semibold ${cat.isVisible === false ? 'text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                  <span>{cat.icon}</span>
                                  <span>{cat.name} {!cat.isVisible && '(Hidden)'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-zinc-400 font-mono">{cat.id}</span>
                                  <button
                                    onClick={() => updateCategory(cat.id, { isVisible: !cat.isVisible })}
                                    className={`p-1 ${cat.isVisible === false ? 'text-blue-500' : 'text-zinc-400'} hover:text-blue-600`}
                                    title={cat.isVisible === false ? 'Show Category' : 'Hide Category'}
                                  >
                                    {cat.isVisible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => deleteCategory(cat.id)}
                                    className="text-zinc-400 hover:text-rose-500 p-1"
                                    title="Delete Category"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Subcategories list */}
                              {catSubs.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2 pl-4">
                                  {catSubs.map((sub) => (
                                    <div
                                      key={sub.id}
                                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[11px]"
                                    >
                                      <span>{sub.name}</span>
                                      <button
                                        onClick={() => deleteSubcategory(sub.id)}
                                        className="text-zinc-400 hover:text-rose-500"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================== 4. ORDERS MANAGEMENT ===================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      Campus Orders Management
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {filteredOrders.length} of {orders.length} Orders
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Click any order row to open full inspection details, line items, and audit timeline
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(orderSearch ||
                    orderStatusFilter !== 'all' ||
                    orderPaymentFilter !== 'all' ||
                    orderCollegeFilter !== 'all' ||
                    orderTypeFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setOrderSearch('');
                        setOrderStatusFilter('all');
                        setOrderPaymentFilter('all');
                        setOrderCollegeFilter('all');
                        setOrderTypeFilter('all');
                        setOrderSort('newest');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Advanced Filter Toolbar */}
              <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by Order ID (#SH-...), student name, phone number, or university email..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
                  {/* Status Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Order Status
                    </label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Payment Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Payment Status
                    </label>
                    <select
                      value={orderPaymentFilter}
                      onChange={(e) => setOrderPaymentFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
                    >
                      <option value="all">All Payments</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  {/* Order Type */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Order Type
                    </label>
                    <select
                      value={orderTypeFilter}
                      onChange={(e) => setOrderTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
                    >
                      <option value="all">All Types</option>
                      <option value="Product Order">Product Order</option>
                      <option value="Printing Request">Printing Request</option>
                      <option value="Custom Order">Custom Order</option>
                      <option value="Kit Order">Kit Order</option>
                      <option value="Digital Product Order">Digital Product</option>
                    </select>
                  </div>

                  {/* College Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      University Faculty
                    </label>
                    <select
                      value={orderCollegeFilter}
                      onChange={(e) => setOrderCollegeFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
                    >
                      <option value="all">All Colleges</option>
                      {colleges.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Sort By Date / Total
                    </label>
                    <select
                      value={orderSort}
                      onChange={(e) => setOrderSort(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest_total">Highest Total</option>
                      <option value="lowest_total">Lowest Total</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 text-[10px]">
                    <tr>
                      <th className="p-3.5 pl-4 w-10">
                        <input
                          type="checkbox"
                          checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                          onChange={() => {
                            if (selectedOrders.length === filteredOrders.length) {
                              setSelectedOrders([]);
                            } else {
                              setSelectedOrders(filteredOrders.map(o => o.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                        />
                      </th>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5">Total</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((ord) => {
                        const totalItemCount = ord.items.reduce((s, i) => s + i.quantity, 0);
                        const firstItem = ord.items[0];
                        const cleanPhone = ord.phone.replace(/[^0-9]/g, '');
                        const waNumber = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
                        const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                          `Hello ${ord.studentName}, Student Hub regarding your order #${ord.id}.`
                        )}`;

                        return (
                          <tr
                            key={ord.id}
                            onClick={() => setSelectedOrderForModal(ord)}
                            className={`hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors cursor-pointer group ${
                              selectedOrders.includes(ord.id) ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="p-3.5 pl-4 w-10" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(ord.id)}
                                onChange={() => {
                                  setSelectedOrders(prev =>
                                    prev.includes(ord.id) ? prev.filter(x => x !== ord.id) : [...prev, ord.id]
                                  );
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                              />
                            </td>
                            {/* Order ID */}
                            <td className="p-3.5 pl-4 whitespace-nowrap">
                              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                                #{ord.id}
                              </span>
                              {ord.internalNotes && ord.internalNotes.length > 0 && (
                                <span className="block text-[10px] text-amber-600 font-medium">
                                  ● {ord.internalNotes.length} note(s)
                                </span>
                              )}
                            </td>

                            {/* Customer */}
                            <td className="p-3.5 min-w-[160px]">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 block group-hover:text-blue-600 transition-colors">
                                {ord.studentName}
                              </span>
                              <span className="text-[11px] text-zinc-500 font-mono block">
                                {ord.phone}
                              </span>
                              {ord.email && (
                                <span className="text-[10px] text-zinc-400 truncate block max-w-[180px]">
                                  {ord.email}
                                </span>
                              )}
                            </td>

                            {/* Order Type */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  ord.orderType === 'Kit Order'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                    : ord.orderType === 'Digital Product Order'
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                    : ord.orderType === 'Printing Request'
                                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'
                                    : ord.orderType === 'Custom Order'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                                }`}
                              >
                                {ord.orderType || 'Product Order'}
                              </span>
                            </td>

                            {/* Items Preview */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2 shrink-0">
                                  {ord.items.slice(0, 3).map((item, i) => (
                                    <div
                                      key={i}
                                      className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 shrink-0 shadow-xs"
                                    >
                                      {item.image ? (
                                        <img
                                          src={item.image}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-zinc-400">
                                          PKG
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="text-[11px] leading-tight">
                                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block truncate max-w-[130px]">
                                    {firstItem?.title}
                                  </span>
                                  <span className="text-[10px] text-zinc-400">
                                    {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Total */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50 tabular-nums block">
                                {ord.total} EGP
                              </span>
                              <span className="text-[10px] text-zinc-400 block truncate max-w-[120px]">
                                {ord.paymentMethod.replace('Cash on Campus Delivery', 'COD')}
                              </span>
                            </td>

                            {/* Payment */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  ord.paymentStatus === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                    : ord.paymentStatus === 'Unpaid'
                                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                    : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                }`}
                              >
                                {ord.paymentStatus}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                    : ord.status === 'Shipped'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                                    : ord.status === 'Ready'
                                    ? 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300'
                                    : ord.status === 'Preparing'
                                    ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                                    : ord.status === 'Confirmed'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>

                            {/* Date */}
                            <td className="p-3.5 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                              {ord.date}
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-end gap-1"
                              >
                                <button
                                  onClick={() => setSelectedOrderForModal(ord)}
                                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                                  title="Inspect Full Order"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50 text-emerald-600 dark:hover:bg-emerald-950 transition-colors"
                                  title="WhatsApp Student"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={`tel:${ord.phone}`}
                                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-950 transition-colors"
                                  title="Call Student"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-zinc-400">
                          <p className="text-sm font-semibold">No orders match your filter criteria.</p>
                          <p className="text-xs mt-1">Try resetting search keywords or changing status filters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Floating Bulk Actions Bar for Orders */}
              <BulkActionsBar
                selectedCount={selectedOrders.length}
                onClear={() => setSelectedOrders([])}
                actions={[
                  { label: 'Confirm Orders', actionId: 'status_Confirmed' },
                  { label: 'Mark Preparing', actionId: 'status_Preparing' },
                  { label: 'Mark Ready', actionId: 'status_Ready' },
                  { label: 'Mark Shipped', actionId: 'status_Shipped' },
                  { label: 'Mark Delivered', actionId: 'status_Delivered' },
                  { label: 'Cancel Orders', actionId: 'cancel', dangerous: true },
                  { label: 'Export Selected', actionId: 'export' },
                ]}
                onTrigger={(actionId) => {
                  if (actionId.startsWith('status_')) {
                    const newStatus = actionId.replace('status_', '') as OrderStatus;
                    selectedOrders.forEach(id => {
                      updateOrderStatus(id, newStatus);
                    });
                    success('Bulk Status Updated', `Updated ${selectedOrders.length} orders to ${newStatus}.`);
                    logActivity(`Bulk Updated ${selectedOrders.length} Orders to ${newStatus}`);
                    setSelectedOrders([]);
                  } else if (actionId === 'cancel') {
                    showConfirm(
                      'Bulk Cancel Orders',
                      `Are you sure you want to cancel these ${selectedOrders.length} orders? This action cannot be undone.`,
                      () => {
                        selectedOrders.forEach(id => {
                          updateOrderStatus(id, 'Cancelled');
                        });
                        success('Bulk Orders Cancelled', `Cancelled ${selectedOrders.length} orders.`);
                        logActivity(`Bulk Cancelled ${selectedOrders.length} Orders`);
                        setSelectedOrders([]);
                      },
                      'CANCEL'
                    );
                  } else if (actionId === 'export') {
                    const ordersToExport = orders.filter(o => selectedOrders.includes(o.id));
                    const headers = ['Order ID', 'Date', 'Type', 'Student', 'Phone', 'Pickup Point', 'Subtotal', 'Discount', 'Courier', 'Total', 'Payment', 'Status'];
                    const rows = ordersToExport.map(o => [o.id, o.date, o.orderType || 'Product Order', o.studentName, o.phone, o.campusDeliveryPoint || o.deliveryAddress || '', o.subtotal, o.discount, o.shipping, o.total, o.paymentStatus, o.status]);
                    exportToCSV('bulk_selected_orders', headers, rows);
                    success('CSV Exported', `Exported data sheet for ${selectedOrders.length} orders.`);
                    setSelectedOrders([]);
                  }
                }}
              />
            </div>
          )}

          {/* ===================== 5. CUSTOMERS MANAGEMENT ===================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Registered Students ({customers.length})</h2>
                <p className="text-xs text-zinc-500">Student accounts, university affiliations, and order statistics</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">University & Faculty</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Total Spent</th>
                      <th className="p-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</td>
                        <td className="p-3">
                          <span className="font-semibold block">{c.faculty}</span>
                          <span className="text-zinc-400 text-[11px]">{c.university}</span>
                        </td>
                        <td className="p-3">
                          <span className="block">{c.email}</span>
                          <span className="text-zinc-400 text-[11px]">{c.phone}</span>
                        </td>
                        <td className="p-3 font-bold tabular-nums">{c.ordersCount} orders</td>
                        <td className="p-3 font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                          {c.totalSpent} EGP
                        </td>
                        <td className="p-3 text-zinc-500">{c.joinedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== 6. WISHLIST ANALYTICS ===================== */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Wishlist & Student Intent Analytics</h2>
                <p className="text-xs text-zinc-500">Products most saved by university students for upcoming semesters</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {products.slice(0, 3).map((p, idx) => (
                  <div key={p.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                      Rank #{idx + 1} Most Wanted
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{p.title}</h4>
                    <p className="text-xs text-zinc-500">Saved by {140 - idx * 25} students</p>
                    <div className="text-sm font-bold tabular-nums">{p.price} EGP</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== 7. STUDENT KITS ===================== */}
          {activeTab === 'kits' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Student Bundles & Kits ({kits.length})</h2>
                  <p className="text-xs text-zinc-500">Curated packages with multi-item savings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kits.map((k) => (
                  <div key={k.id} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{k.targetYear}</span>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{k.title}</h4>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">Save {k.savings} EGP</span>
                    </div>
                    <div className="text-xs text-zinc-500">Includes {k.itemsList.length} verified tools</div>
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                      <span className="font-extrabold text-base tabular-nums">{k.price} EGP</span>
                      <button
                        onClick={() => deleteKit(k.id)}
                        className="text-zinc-400 hover:text-rose-500 p-1 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== 8. DIGITAL PRODUCTS ===================== */}
          {activeTab === 'digital' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    Digital Study Resources ({filteredDigitalProducts.length})
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Notion templates, AutoCAD dynamic blocks, Medical Anki decks & LaTeX templates
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={digitalCollegeFilter}
                    onChange={(e) => setDigitalCollegeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="all">All Disciplines</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleOpenAddDigitalProduct}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Digital Template</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDigitalProducts.map((dig) => (
                  <div
                    key={dig.id}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-mono">
                            {dig.fileType}
                          </span>
                          <span className="text-[10px] text-zinc-400 capitalize font-medium">
                            {dig.collegeId === 'all' ? 'All Faculties' : dig.collegeId}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {dig.size}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-1.5">
                          {dig.title}
                        </h4>
                      </div>
                      <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 tabular-nums shrink-0">
                        {dig.price} EGP
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {dig.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span>{dig.downloadsCount} student downloads</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditDigitalProduct(dig)}
                          className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-1 font-semibold"
                          title="Edit Pricing & Information"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            deleteDigitalProduct(dig.id);
                            info('Digital Product Removed', `${dig.title.slice(0, 20)}... removed.`);
                          }}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 text-rose-500"
                          title="Delete Digital Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== 9. PRINTING REQUESTS ===================== */}
          {activeTab === 'printing' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    Campus Printing Queue ({printingRequests.length})
                  </h2>
                  <p className="text-xs text-zinc-500">
                    CAD Architectural Plotting, graduation projects, and course manual printing
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {printingRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedPrintingForModal(req)}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 text-xs shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                            #{req.id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {req.status}
                          </span>
                          {req.deadline && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              ⏰ {req.deadline}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>{req.fileName}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            ({req.fileSize || '10 MB'})
                          </span>
                        </p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          {req.customerName} ({req.phone}) · {req.university} · {req.pickupPoint}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                        <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 tabular-nums">
                          {req.price} EGP
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {req.paperSize} · {req.colorMode === 'color' ? 'Full Color' : 'B&W'} ·{' '}
                          {req.copies} {req.copies === 1 ? 'copy' : 'copies'}
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 flex-wrap gap-2"
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-zinc-400 font-medium text-[11px]">Workflow:</span>
                        {(['Pending', 'File Review', 'Confirmed', 'Printing', 'Ready for Pickup', 'Completed', 'Cancelled'] as PrintingRequest['status'][]).map(
                          (st) => (
                            <button
                              key={st}
                              onClick={() => {
                                updatePrintingStatus(req.id, st);
                                success('Print Status Updated', `Job #${req.id} marked as ${st}`);
                              }}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                                req.status === st
                                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                                  : 'border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              {st}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedPrintingForModal(req)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect File & Specs</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== 10. CUSTOM ORDERS ===================== */}
          {activeTab === 'custom' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Custom Gear Orders ({customOrders.length})
                </h2>
                <p className="text-xs text-zinc-500">
                  Laser-etched metal ID cards, customized lab coats, embroidered crests & nameplates
                </p>
              </div>

              <div className="space-y-3">
                {customOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedCustomForModal(ord)}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-3 shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 transition-colors">
                            #{ord.id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            {ord.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-1">
                          {ord.productType}
                        </h4>
                        <div className="mt-1 p-2 rounded-lg bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 font-mono text-purple-900 dark:text-purple-300 font-bold inline-block">
                          "{ord.customizationText}"
                        </div>
                        <p className="text-zinc-500 text-[11px] mt-1">
                          Badge: {ord.facultyBadge} · Color: {ord.selectedColor} · Customer: {ord.customerName} ({ord.phone})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 tabular-nums block">
                          {ord.price} EGP
                        </span>
                        <span className="text-[10px] text-zinc-400 block">{ord.quantity} unit(s)</span>
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 flex-wrap gap-2"
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-zinc-400 font-medium text-[11px]">Workflow:</span>
                        {(['Pending', 'Confirmed', 'In Production', 'Ready', 'Delivered', 'Cancelled'] as CustomOrder['status'][]).map(
                          (st) => (
                            <button
                              key={st}
                              onClick={() => {
                                updateCustomOrderStatus(ord.id, st);
                                success('Custom Order Updated', `#${ord.id} status changed to ${st}`);
                              }}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                                ord.status === st
                                  ? 'bg-purple-600 text-white'
                                  : 'border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              {st}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedCustomForModal(ord)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Artwork & Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== 11. COUPONS & DISCOUNTS ===================== */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Coupons & Vouchers ({coupons.length})</h2>
                  <p className="text-xs text-zinc-500">Manage promo codes and student discount thresholds</p>
                </div>
                <button
                  onClick={() => setIsAddCouponOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="space-y-3">
                {coupons.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{c.code}</span>
                      <p className="text-zinc-500 mt-0.5">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${c.discountValue} EGP OFF`} · Min order: {c.minOrderAmount || 0} EGP
                      </p>
                      <span className="text-[10px] text-zinc-400">Used {c.timesUsed} times</span>
                    </div>
                    <button
                      onClick={() => deleteCoupon(c.id)}
                      className="text-zinc-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== COLLEGES & FACULTIES ===================== */}
          {activeTab === 'colleges' && (
            <div className="space-y-6 animate-fadeIn text-xs">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Colleges & Faculties Management ({colleges.length})</h2>
                  <p className="text-xs text-zinc-500">Configure campus academic contexts, personalized themes, and active department hubs</p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingCollege(true);
                    setEditingCollegeId(null);
                    setNewCollegeId('');
                    setNewCollegeNameEn('');
                    setNewCollegeNameAr('');
                    setNewCollegeColor('#3b82f6');
                    setNewCollegeDescEn('');
                    setNewCollegeDescAr('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1 hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New College</span>
                </button>
              </div>

              {/* Grid of Colleges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {colleges.map((col) => {
                  const associatedProducts = products.filter(p => p.collegeId === col.id);
                  const associatedKits = kits.filter(k => k.collegeId === col.id);
                  const associatedCategories = categories.filter(c => c.collegeId === col.id);

                  return (
                    <div
                      key={col.id}
                      className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:shadow-xs transition-all relative overflow-hidden group"
                    >
                      {/* Left accent bar matching college color */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: col.accentColor || '#3b82f6' }} />

                      <div className="flex justify-between items-start pl-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🎓</span>
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">
                              {col.name} / {col.nameAr || col.name}
                            </h3>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-bold">
                            ID: {col.id} · Color: <span style={{ color: col.accentColor }}>{col.accentColor || '#3b82f6'}</span>
                          </p>
                          <p className="text-xs text-zinc-500 line-clamp-2 pt-1.5">
                            {col.description || 'No English description.'}
                          </p>
                          <p className="text-xs text-zinc-500 line-clamp-2 pt-0.5 dir-rtl text-right">
                            {col.descriptionAr || 'لا يوجد وصف عربي متاح.'}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setIsAddingCollege(true);
                              setEditingCollegeId(col.id);
                              setNewCollegeId(col.id);
                              setNewCollegeNameEn(col.name);
                              setNewCollegeNameAr(col.nameAr || col.name);
                              setNewCollegeColor(col.accentColor || '#3b82f6');
                              setNewCollegeDescEn(col.description || '');
                              setNewCollegeDescAr(col.descriptionAr || '');
                            }}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            title="Edit College Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              showConfirm(
                                'Delete College / Faculty',
                                `Are you absolutely sure you want to delete "${col.name}"? This action will break personalizations for students assigned to this faculty context.`,
                                () => {
                                  deleteCollege(col.id);
                                  logActivity(`College deleted: "${col.name}" (ID: ${col.id})`);
                                  success('College Deleted', `${col.name} has been removed.`);
                                },
                                'Delete College'
                              );
                            }}
                            className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            title="Delete College"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Association pills */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap gap-2 pl-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                          {associatedProducts.length} Products
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {associatedCategories.length} Categories
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                          {associatedKits.length} Kits
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================== 12. HOMEPAGE CONTROL ===================== */}
          {activeTab === 'homepage' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Homepage Section Control</h2>
                  <p className="text-xs text-zinc-500">Control storefront hero copy, CTA buttons, and toggle visible sections</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Page Layout</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Hero Title</label>
                  <input
                    type="text"
                    value={homepageSettings.heroTitle}
                    onChange={(e) => updateHomepageSettings({ heroTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Hero Subtitle</label>
                  <textarea
                    rows={2}
                    value={homepageSettings.heroSubtitle}
                    onChange={(e) => updateHomepageSettings({ heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Primary CTA Button</label>
                    <input
                      type="text"
                      value={homepageSettings.heroButtonPrimary}
                      onChange={(e) => updateHomepageSettings({ heroButtonPrimary: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Secondary CTA Button</label>
                    <input
                      type="text"
                      value={homepageSettings.heroButtonSecondary}
                      onChange={(e) => updateHomepageSettings({ heroButtonSecondary: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>
                </div>

                {/* Section Visibility Toggles */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                  <p className="font-bold uppercase tracking-wider text-zinc-400 text-[10px]">Homepage Sections Visibility</p>
                  {homepageSettings.sections.map((sec) => (
                    <label key={sec.id} className="flex items-center justify-between p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <span>{sec.name}</span>
                      <input
                        type="checkbox"
                        checked={sec.visible}
                        onChange={(e) => {
                          const updated = homepageSettings.sections.map((s) =>
                            s.id === sec.id ? { ...s, visible: e.target.checked } : s
                          );
                          updateHomepageSettings({ sections: updated });
                          success('Section Updated', `${sec.name} visibility changed.`);
                        }}
                        className="rounded text-blue-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== 13. BANNERS ===================== */}
          {activeTab === 'banners' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Promotional Banners ({banners.length})</h2>
                  <p className="text-xs text-zinc-500">Manage campaign banners and links</p>
                </div>
                <button
                  onClick={() => setIsAddBannerOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Banner</span>
                </button>
              </div>

              <div className="space-y-3">
                {banners.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 text-xs">
                    <img src={b.image} alt="" className="w-16 h-12 rounded-lg object-cover bg-zinc-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{b.title}</h4>
                      <p className="text-zinc-500 truncate">{b.subtitle}</p>
                    </div>
                    <button onClick={() => deleteBanner(b.id)} className="text-zinc-400 hover:text-rose-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== 14. REVIEWS ===================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Student Reviews Moderation ({reviews.length})</h2>
                <p className="text-xs text-zinc-500">Approve, reject, or feature student testimonials</p>
              </div>

              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{r.studentName}</span>
                        <span className="text-zinc-400">({r.studentCollege})</span>
                        <span className="flex items-center text-amber-500 font-bold ml-2">
                          <Star className="w-3 h-3 fill-current mr-0.5" />
                          {r.rating}★
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300">"{r.comment}"</p>
                    <p className="text-[11px] text-zinc-400">Product: {r.productTitle}</p>
                    <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        onClick={() => {
                          updateReviewStatus(r.id, 'approved');
                          success('Review Approved', 'Review is now visible to students.');
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          updateReviewStatus(r.id, 'rejected');
                          info('Review Rejected');
                        }}
                        className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 font-semibold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => deleteReview(r.id)}
                        className="text-rose-500 hover:underline ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== 15. NOTIFICATIONS ===================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Admin Notifications</h2>
                  <p className="text-xs text-zinc-500">Live operational alerts for orders, printing and stock</p>
                </div>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.linkTab) setActiveTab(n.linkTab as AdminTab);
                    }}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      n.read
                        ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-70'
                        : 'border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 font-medium'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{n.title}</span>
                      <span className="text-[10px] text-zinc-400">{n.timestamp}</span>
                    </div>
                    <p className="text-zinc-500 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== 16. SETTINGS ===================== */}
          {activeTab === 'settings' && (
            <AdminSettingsHub onShowConfirm={showConfirm} onLogActivity={logActivity} />
          )}
        </div>
      </div>

      {/* ===================== MODALS ===================== */}

      {/* Add / Edit Product Modal */}
      <AdminProductEditorModal
        isOpen={isAddProductOpen}
        product={editingProduct}
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        onSave={(productData, isNew) => {
          if (isNew) {
            addProduct(productData as any);
            success('Product Created', `${productData.title} is now live in store.`);
            logActivity(`Created Product: ${productData.title}`);
          } else if (editingProduct) {
            updateProduct(editingProduct.id, productData);
            success('Product Updated', `${productData.title || editingProduct.title} changes saved.`);
            logActivity(`Updated Product: ${productData.title || editingProduct.title}`);
          }
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        onDuplicate={(prod) => {
          duplicateProduct(prod.id);
          logActivity(`Duplicated Product: ${prod.title}`);
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        categories={categories}
        subcategories={subcategories}
        colleges={colleges}
        allProducts={products}
      />

      {/* Add / Edit Digital Product Modal */}
      {isAddDigitalProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddDigitalProductOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                {editingDigitalProduct ? 'Edit Digital Resource' : 'Add Digital Academic Resource'}
              </h3>
              <button onClick={() => setIsAddDigitalProductOpen(false)} className="text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDigitalProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={formDigTitle}
                  onChange={(e) => setFormDigTitle(e.target.value)}
                  placeholder="e.g. Master Notion University OS 2026"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Target College / Major</label>
                  <select
                    value={formDigCollege}
                    onChange={(e) => setFormDigCollege(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  >
                    <option value="all">All Disciplines / General</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Price (EGP)</label>
                  <input
                    type="number"
                    required
                    value={formDigPrice}
                    onChange={(e) => setFormDigPrice(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">File Type / Format</label>
                  <input
                    type="text"
                    required
                    value={formDigFileType}
                    onChange={(e) => setFormDigFileType(e.target.value)}
                    placeholder="e.g. Notion Template, .DWG, .APKG"
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Download Size / Link</label>
                  <input
                    type="text"
                    required
                    value={formDigSize}
                    onChange={(e) => setFormDigSize(e.target.value)}
                    placeholder="e.g. Instant Duplicate Link or 1.2 GB ZIP"
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDigDesc}
                  onChange={(e) => setFormDigDesc(e.target.value)}
                  placeholder="Comprehensive description of the digital template, course subjects, and how students use it..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Key Features (comma-separated)</label>
                <input
                  type="text"
                  value={formDigFeatures}
                  onChange={(e) => setFormDigFeatures(e.target.value)}
                  placeholder="Interactive schedule, Exam countdown, GPA calculator"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddDigitalProductOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 text-xs"
                >
                  {editingDigitalProduct ? 'Save Changes' : 'Create Digital Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit College Modal */}
      {isAddingCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddingCollege(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                {editingCollegeId ? 'Edit College / Faculty' : 'Add New College / Faculty'}
              </h3>
              <button onClick={() => setIsAddingCollege(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollege} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">College ID (Slug format, e.g., dentistry, pharmacy)</label>
                <input
                  type="text"
                  required
                  disabled={!!editingCollegeId}
                  value={newCollegeId}
                  onChange={(e) => setNewCollegeId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  placeholder="e.g. dentistry"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">English Name</label>
                  <input
                    type="text"
                    required
                    value={newCollegeNameEn}
                    onChange={(e) => setNewCollegeNameEn(e.target.value)}
                    placeholder="e.g. Faculty of Dentistry"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Arabic Name</label>
                  <input
                    type="text"
                    required
                    value={newCollegeNameAr}
                    onChange={(e) => setNewCollegeNameAr(e.target.value)}
                    placeholder="e.g. كلية طب الأسنان"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right"
                    style={{ direction: 'rtl' }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Theme Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newCollegeColor}
                    onChange={(e) => setNewCollegeColor(e.target.value)}
                    className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    required
                    value={newCollegeColor}
                    onChange={(e) => setNewCollegeColor(e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono"
                  />
                </div>
                {/* Accent Color Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['#3b82f6', '#10b981', '#ef4444', '#14b8a6', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCollegeColor(c)}
                      className="w-6 h-6 rounded-full border border-white dark:border-zinc-800 shadow-2xs hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">English Description</label>
                <textarea
                  rows={2}
                  value={newCollegeDescEn}
                  onChange={(e) => setNewCollegeDescEn(e.target.value)}
                  placeholder="Syllabus materials, required instruments, and faculty specs..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Arabic Description</label>
                <textarea
                  rows={2}
                  value={newCollegeDescAr}
                  onChange={(e) => setNewCollegeDescAr(e.target.value)}
                  placeholder="مستلزمات المنهج والأدوات المطلوبة والمواصفات المعتمدة..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right"
                  style={{ direction: 'rtl' }}
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddingCollege(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  {editingCollegeId ? 'Save Faculty' : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddCategoryOpen(false)} className="fixed inset-0 bg-black/60" />
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 z-10 space-y-3">
            <h3 className="font-bold text-sm">Add Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">College</label>
                <select
                  value={newCatCollege}
                  onChange={(e) => setNewCatCollege(e.target.value as CollegeId)}
                  className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                >
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Surveying & GPS"
                  className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Icon (Emoji)</label>
                <input
                  type="text"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddCategoryOpen(false)} className="px-3 py-1.5 border rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {isAddSubcategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddSubcategoryOpen(false)} className="fixed inset-0 bg-black/60" />
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 z-10 space-y-3">
            <h3 className="font-bold text-sm">Add Subcategory</h3>
            <form onSubmit={handleCreateSubcategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Parent Category</label>
                <select
                  value={newSubParentCat}
                  onChange={(e) => setNewSubParentCat(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.collegeId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Subcategory Name</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Compass Sets"
                  className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddSubcategoryOpen(false)} className="px-3 py-1.5 border rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddCouponOpen(false)} className="fixed inset-0 bg-black/60" />
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 z-10 space-y-3">
            <h3 className="font-bold text-sm">Create New Promo Voucher</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="e.g. CAMPUS25"
                  className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Discount Type</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (EGP)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Min Order Amount (EGP)</label>
                <input
                  type="number"
                  value={newCouponMinOrder}
                  onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddCouponOpen(false)} className="px-3 py-1.5 border rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg">
                  Create Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Banner Modal */}
      {isAddBannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddBannerOpen(false)} className="fixed inset-0 bg-black/60" />
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 z-10 space-y-3">
            <h3 className="font-bold text-sm">Add Promotional Banner</h3>
            <form onSubmit={handleCreateBanner} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Banner Title</label>
                <input
                  type="text"
                  required
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  placeholder="e.g. Midterm Lab Tools Discount"
                  className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Subtitle</label>
                <input
                  type="text"
                  value={newBannerSubtitle}
                  onChange={(e) => setNewBannerSubtitle(e.target.value)}
                  placeholder="Short campaign description..."
                  className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={newBannerImage}
                  onChange={(e) => setNewBannerImage(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddBannerOpen(false)} className="px-3 py-1.5 border rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg">
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== FULL ORDER INSPECTION MODAL ===================== */}
      {selectedOrderForModal && (
        <AdminOrderDetailsModal
          order={orders.find((o) => o.id === selectedOrderForModal.id) || selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
          onOpenProductDetails={(productId) => {
            const foundProduct = products.find((p) => p.id === productId);
            if (foundProduct) {
              handleOpenEditProduct(foundProduct);
            }
          }}
        />
      )}

      {/* ===================== FULL PRINTING REQUEST INSPECTION MODAL ===================== */}
      {selectedPrintingForModal && (
        <AdminPrintingDetailsModal
          request={
            printingRequests.find((p) => p.id === selectedPrintingForModal.id) ||
            selectedPrintingForModal
          }
          onClose={() => setSelectedPrintingForModal(null)}
        />
      )}

      {/* ===================== FULL CUSTOM ORDER INSPECTION MODAL ===================== */}
      {selectedCustomForModal && (
        <AdminCustomOrderDetailsModal
          order={
            customOrders.find((c) => c.id === selectedCustomForModal.id) ||
            selectedCustomForModal
          }
          onClose={() => setSelectedCustomForModal(null)}
        />
      )}

      {/* Homepage Real-time Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsPreviewModalOpen(false)} className="fixed inset-0 bg-black/75 backdrop-blur-xs" />
          <div className="relative w-full max-w-4xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col rounded-2xl animate-scaleUp">
            
            {/* Preview Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-time Storefront Preview</span>
                </h3>
                <p className="text-[11px] text-zinc-400">Review layout structure, hero copywriting, and CTA positions prior to publication</p>
              </div>
              <button onClick={() => setIsPreviewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Simulated Device Window */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Simulated Browser Address Bar */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 flex items-center gap-3 shadow-xs">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg py-1 px-3 text-[10px] text-zinc-400 font-mono select-none truncate">
                  https://studenthub.com.eg/preview_mode=active
                </div>
              </div>

              {/* Simulated Storefront Content */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-md">
                
                {/* Simulated Announcement Bar */}
                {homepageSettings.announcementActive && (
                  <div className="bg-blue-600 text-white text-[10px] font-bold py-1.5 text-center px-4 tracking-wide uppercase">
                    📢 {homepageSettings.announcementText}
                  </div>
                )}

                {/* Simulated Navigation Menu Bar */}
                <div className="bg-white/95 dark:bg-zinc-900/95 border-b border-zinc-100 dark:border-zinc-850 px-5 py-3 flex items-center justify-between">
                  <span className="font-extrabold text-xs tracking-tight text-blue-600 font-mono">STUDENT.HUB</span>
                  <div className="flex items-center gap-3.5 text-[10px] text-zinc-500 font-semibold">
                    <span className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Home</span>
                    <span>Store</span>
                    <span>Student Kits</span>
                    <span>3D Printing</span>
                  </div>
                </div>

                {/* Simulated High-Fidelity Hero Section */}
                <div className="relative bg-zinc-900 dark:bg-zinc-900 text-white py-16 px-8 text-center space-y-5 overflow-hidden">
                  <div className="relative z-10 max-w-lg mx-auto space-y-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-wider">
                      ★ Approved University Vendor
                    </span>
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">
                      {homepageSettings.heroTitle}
                    </h1>
                    <p className="text-[11px] text-zinc-300 leading-relaxed max-w-md mx-auto">
                      {homepageSettings.heroSubtitle}
                    </p>
                    <div className="pt-2 flex justify-center gap-2.5">
                      <button type="button" className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-xs hover:bg-blue-700">
                        {homepageSettings.heroButtonPrimary}
                      </button>
                      <button type="button" className="px-4 py-2 bg-white/15 text-white text-[10px] font-bold rounded-lg border border-white/20">
                        {homepageSettings.heroButtonSecondary}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated homepage sections */}
                <div className="p-6 bg-white dark:bg-zinc-900 space-y-6 text-xs text-zinc-800 dark:text-zinc-200">
                  {homepageSettings.sections.filter(s => s.visible).map(sec => (
                    <div key={sec.id} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-xs">{sec.title}</h4>
                          <p className="text-[10px] text-zinc-400">{sec.subtitle}</p>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-mono">Active</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5 pt-1">
                        <div className="h-16 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold">Item 1</div>
                        <div className="h-16 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold">Item 2</div>
                        <div className="h-16 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold">Item 3</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        destructiveText={confirmModal.destructiveText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
