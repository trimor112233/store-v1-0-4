export type CollegeId = 'engineering' | 'medicine' | 'cs' | 'science' | 'architecture' | 'business' | 'other';

export interface Department {
  id: string;
  name: string;
  collegeId: CollegeId;
}

export interface Category {
  id: string;
  name: string;
  collegeId: CollegeId;
  departmentId?: string;
  icon?: string;
  description?: string;
  whatsappMessage?: string;
  isVisible?: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  collegeId: CollegeId;
}

export interface NavigationLink {
  id: string;
  label: string;
  isVisible: boolean;
}


export interface College {
  id: CollegeId;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  accentColor: string;
  categories: string[];
  color?: string;
  nameEn?: string;
  descriptionEn?: string;
  descriptionAr?: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type ProductType = 'Physical' | 'Digital' | 'Kit' | 'Service';

export interface Product {
  id: string;
  title: string;
  titleAr?: string;
  collegeId: CollegeId;
  departmentId?: string;
  categoryId: string;
  subcategoryId: string;
  category?: string;
  productType: ProductType;
  price: number;
  originalPrice?: number;
  stock: number;
  stockStatus: StockStatus;
  rating: number;
  reviewsCount: number;
  image: string;
  images?: string[];
  fallbackGradient?: string;
  inStock: boolean;
  featured?: boolean;
  trending?: boolean;
  isNewArrival?: boolean;
  active: boolean;
  description: string;
  specs: Record<string, string>;
  tags: string[];
  lowStockThreshold?: number;
  disableWhenOutOfStock?: boolean;
  isPreOrder?: boolean;
  sku?: string;
  variants?: {
    sizes?: string[];
    colors?: string[];
    materials?: string[];
  };
  customizationOptions?: string[];
  relatedProductIds?: string[];
}

export interface StudentKit {
  id: string;
  title: string;
  collegeId: CollegeId;
  price: number;
  originalPrice: number;
  savings: number;
  image: string;
  description: string;
  itemsList: { name: string; quantity: number; icon: string }[];
  targetYear: string;
  badge?: string;
  active?: boolean;
  featured?: boolean;
}

export interface DigitalProduct {
  id: string;
  title: string;
  collegeId: CollegeId | 'all';
  fileType: string;
  size: string;
  price: number;
  downloadsCount: number;
  description: string;
  previewUrl?: string;
  features: string[];
  active?: boolean;
}

export interface PrintingConfig {
  paperSize: 'A4' | 'A3' | 'A2' | 'A1';
  colorMode: 'bw' | 'color';
  paperType: '80gsm' | '120gsm' | '250gsm' | 'tracing' | 'glossy';
  binding: 'none' | 'staple' | 'spiral' | 'thermal' | 'hardcover';
  pages: number;
  copies: number;
  fileName?: string;
  campusPickup: string;
  notes?: string;
}

export type PrintingStatus = 'Pending' | 'File Review' | 'Confirmed' | 'Printing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';

export interface PrintingRequest {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  university: string;
  collegeId?: CollegeId;
  fileName: string;
  fileType?: string;
  fileSize?: string;
  fileUrl?: string;
  paperSize: 'A4' | 'A3' | 'A2' | 'A1';
  colorMode: 'bw' | 'color';
  paperType: string;
  binding: string;
  doubleSided?: boolean;
  pages: number;
  copies: number;
  notes?: string;
  deadline?: string;
  price: number;
  status: PrintingStatus;
  submittedAt: string;
  pickupPoint: string;
  timeline?: { status: string; date: string; description: string }[];
  internalNotes?: OrderAdminNote[];
}

export type CustomOrderStatus = 'Pending' | 'Confirmed' | 'In Production' | 'Ready' | 'Delivered' | 'Cancelled';

export interface CustomOrder {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  productType: string;
  customizationText: string;
  selectedColor: string;
  facultyBadge: string;
  quantity: number;
  price: number;
  status: CustomOrderStatus;
  date: string;
  notes?: string;
  referenceImage?: string;
  mockupImage?: string;
  collegeId?: CollegeId;
  timeline?: { status: string; date: string; description: string }[];
  internalNotes?: OrderAdminNote[];
}

export interface CustomProductConfig {
  productId: string;
  title: string;
  basePrice: number;
  customText: string;
  selectedColor: string;
  facultyBadge: string;
  previewImage?: string;
}

export interface CartItem {
  id: string;
  type: 'product' | 'kit' | 'digital' | 'printing' | 'custom';
  title: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image?: string;
  category?: string;
  collegeId?: CollegeId;
  variant?: string;
  details?: Record<string, string>;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Processing' | 'Ready' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Refunded';
export type OrderType = 'Product Order' | 'Printing Request' | 'Custom Order' | 'Kit Order' | 'Digital Product Order';

export interface OrderAdminNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface OrderTimelineItem {
  status: OrderStatus | string;
  date: string;
  description: string;
}

export interface Order {
  id: string;
  date: string;
  orderType?: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  // Delivery & Pickup details
  deliveryMethod?: 'delivery' | 'pickup';
  campusDeliveryPoint?: string;
  deliveryAddress?: string;
  governorate?: string;
  city?: string;
  detailedAddress?: string;
  buildingDetails?: string;
  // Guest customer information
  studentName: string; // Customer Full Name
  customerName?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  preferredContactMethod?: 'whatsapp' | 'phone';
  customerNotes?: string;
  collegeId?: CollegeId;
  collegeName?: string;
  paymentMethod: string;
  timeline: OrderTimelineItem[];
  internalNotes?: OrderAdminNote[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  faculty: string;
  collegeId: CollegeId;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
  wishlistCount: number;
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  studentName: string;
  studentCollege: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  isFeatured?: boolean;
}

export interface InventoryLogItem {
  id: string;
  productId: string;
  productTitle: string;
  action: 'added' | 'sold' | 'adjusted' | 'restocked';
  quantityDelta: number;
  previousStock: number;
  newStock: number;
  dateTime: string;
  adminName: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  collegeId?: CollegeId | 'all';
  maxUses?: number;
  timesUsed: number;
  expiryDate: string;
  active: boolean;
}

export interface HomepageBanner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  image: string;
  buttonText: string;
  linkView: string;
  linkCollege?: CollegeId;
  collegeId?: CollegeId | 'all';
  active: boolean;
  order: number;
}

export interface HomepageSectionConfig {
  id: string;
  name: string;
  visible: boolean;
  title: string;
  subtitle: string;
  order: number;
}

export interface HomepageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonPrimary: string;
  heroButtonSecondary: string;
  heroImage: string;
  announcementActive: boolean;
  announcementText: string;
  sections: HomepageSectionConfig[];
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'review' | 'print' | 'customer';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  nameAr?: string;
  address: string;
  details?: string;
  phone?: string;
  workingHours?: string;
  fee: number;
  active: boolean;
  instructions?: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  nameAr?: string;
  code: string;
  instructions: string;
  fee: number;
  active: boolean;
  priority: number;
  accountDetails?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  nameAr?: string;
  governorates: string[];
  fee: number;
  estimatedDays: string;
  active: boolean;
}

export interface DeliverySettings {
  enabled: boolean;
  standardFee: number;
  freeThreshold: number;
  zones: DeliveryZone[];
  instructions?: string;
  estimatedDeliveryTime?: string;
}

export interface WebsiteContentSettings {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonPrimary: string;
  heroButtonSecondary: string;
  announcementText: string;
  announcementActive: boolean;
  collegesSectionTitle: string;
  collegesSectionSubtitle: string;
  trendingSectionTitle: string;
  trendingSectionSubtitle: string;
  kitsSectionTitle: string;
  kitsSectionSubtitle: string;
  digitalSectionTitle: string;
  digitalSectionSubtitle: string;
  printingSectionTitle: string;
  printingSectionSubtitle: string;
  customSectionTitle: string;
  customSectionSubtitle: string;
  whyUsTitle: string;
  whyUsSubtitle: string;
  checkoutHeaderTitle: string;
  checkoutSubtitle: string;
  orderReviewNotice: string;
  orderSuccessMessage: string;
  emptyCartTitle: string;
  emptyCartSubtitle: string;
  trackOrderTitle: string;
  trackOrderSubtitle: string;
  aboutText: string;
  faqList: { question: string; answer: string }[];
  privacyPolicy: string;
  termsOfService: string;
  footerCopyright: string;
}

export interface SocialLinksSettings {
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
  youtube: string;
  linkedin: string;
  supportPhone: string;
  supportEmail: string;
  googleMapsUrl: string;
}

export interface CustomDesignTemplate {
  id: string;
  title: string;
  titleAr?: string;
  productType: string;
  category: string;
  previewImage: string;
  referenceImage?: string;
  basePrice: number;
  availableColors: string[];
  availableShapes: string[];
  availableStyles: string[];
  customizationPlaceholder: string;
  instructions: string;
  active: boolean;
  featured?: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  storeDescription?: string;
  physicalAddress?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  supportPhone: string;
  supportEmail: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  currency: string;
  currencySymbol?: string;
  taxRate: number;
  campuses: string[];
  adminPin?: string;
  storeOpen: boolean;
  storeClosedMessage: string;
  siteTitle: string;
  metaDescription: string;
  socialSharingImage: string;
  navigationLinks: NavigationLink[];
  pickupLocations: PickupLocation[];
  paymentMethods: PaymentMethodConfig[];
  deliverySettings: DeliverySettings;
  websiteContent: WebsiteContentSettings;
  socialLinks: SocialLinksSettings;
  customDesignTemplates: CustomDesignTemplate[];
}

export interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  university: string;
  faculty: string;
  year: string;
  studentId: string;
  campusPickupDefault: string;
}
