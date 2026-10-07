import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useStoreData } from '../context/StoreDataContext';
import { useLanguage } from '../context/LanguageContext';
import { universityCampuses } from '../data/mockData';
import { Order, CartItem } from '../types';
import { generateInvoicePDF, printInvoiceHTML } from '../utils/invoiceGenerator';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Copy,
  Check,
  MessageCircle,
  Truck,
  MapPin,
  Phone,
  Mail,
  FileDown,
  Printer,
  Search,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  BadgeAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const EGYPT_GOVERNORATES = [
  'القاهرة (Cairo)',
  'الجيزة (Giza)',
  'الإسكندرية (Alexandria)',
  'القليوبية (Qalyubia)',
  'الشرقية (Sharqia)',
  'الدقهلية (Dakahlia)',
  'الغربية (Gharbia)',
  'المنوفية (Menofia)',
  'البحيرة (Beheira)',
  'دمياط (Damietta)',
  'بورسعيد (Port Said)',
  'الإسماعيلية (Ismailia)',
  'السويس (Suez)',
  'كفر الشيخ (Kafr El Sheikh)',
  'الفيوم (Fayoum)',
  'بني سويف (Beni Suef)',
  'المنيا (Minya)',
  'أسيوط (Asyut)',
  'سوهاج (Sohag)',
  'قنا (Qena)',
  'الأقصر (Luxor)',
  'أسوان (Aswan)',
  'البحر الأحمر (Red Sea)',
  'الوادي الجديد (New Valley)',
  'مطروح (Matruh)',
  'شمال سيناء (North Sinai)',
  'جنوب سيناء (South Sinai)',
];

function generateSecureOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${rand}`;
}

interface CartDrawerProps {
  onOpenTrackOrderModal?: (orderId?: string, phone?: string) => void;
}

export default function CartDrawer({ onOpenTrackOrderModal }: CartDrawerProps) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { addOrder, settings, products } = useStoreData();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  // Checkout Steps: 'cart' -> 'info' -> 'review' -> 'confirmation'
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'info' | 'review' | 'confirmation'>('cart');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  // Guest Information (Starts completely blank for new visitors)
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'phone'>('whatsapp');

  // Delivery vs Pickup
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [governorate, setGovernorate] = useState(EGYPT_GOVERNORATES[0]);
  const [city, setCity] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [buildingDetails, setBuildingDetails] = useState('');
  const [pickupPoint, setPickupPoint] = useState(universityCampuses[0] || 'Cairo University — Main Campus Gate');

  // Payment & Notes
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'pickup_cash'>('cod');
  const [customerNotes, setCustomerNotes] = useState('');

  // Validation & Processing
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [hasCopiedId, setHasCopiedId] = useState(false);

  // Handle Coupon Apply
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res.message);
    if (res.success) setCouponInput('');
  };

  // Step Navigation: Validate info step before showing Review Order
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!settings.storeOpen) {
      setValidationError(settings.storeClosedMessage || 'The store is currently closed for new orders.');
      return;
    }

    // 1. Validate required fields
    if (!fullName.trim() || fullName.trim().length < 3) {
      setValidationError(isRtl ? 'يرجى إدخال اسمك بالكامل (3 أحرف على الأقل).' : 'Please enter your full name (at least 3 characters).');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setValidationError(isRtl ? 'يرجى إدخال رقم هاتف صحيح مكون من 11 رقم.' : 'Please enter a valid phone number (at least 10-11 digits).');
      return;
    }

    if (!whatsappSameAsPhone) {
      const cleanWa = whatsappNumber.replace(/[^0-9]/g, '');
      if (!cleanWa || cleanWa.length < 10) {
        setValidationError(isRtl ? 'يرجى إدخال رقم واتساب صحيح.' : 'Please enter a valid WhatsApp number.');
        return;
      }
    }

    if (deliveryMethod === 'delivery') {
      if (!city.trim() || !detailedAddress.trim()) {
        setValidationError(isRtl ? 'يرجى كتابة المدينة والعنوان بالتفصيل لتوصيل الطلب.' : 'Please enter your city/area and detailed street address for delivery.');
        return;
      }
    } else {
      if (!pickupPoint.trim()) {
        setValidationError(isRtl ? 'يرجى اختيار نقطة الاستلام من الجامعة.' : 'Please select your campus pickup location.');
        return;
      }
    }

    // 2. Validate product stock & availability
    for (const item of cart) {
      if (item.type === 'product') {
        const liveProd = products.find((p) => p.id === item.id);
        if (liveProd) {
          if (liveProd.stockStatus === 'out_of_stock' || (liveProd.stock !== undefined && liveProd.stock <= 0)) {
            setValidationError(isRtl ? `المنتج "${item.title}" نفذ من المخزون حالياً.` : `"${item.title}" is currently out of stock.`);
            return;
          }
          if (liveProd.stock !== undefined && item.quantity > liveProd.stock) {
            setValidationError(
              isRtl
                ? `الكمية المتاحة من "${item.title}" هي ${liveProd.stock} فقط.`
                : `Only ${liveProd.stock} units available for "${item.title}".`
            );
            return;
          }
        }
      }
    }

    // Move to Review Step
    setCheckoutStep('review');
  };

  // Final Order Confirmation
  const handleConfirmOrder = async () => {
    setIsPlacingOrder(true);
    setValidationError(null);

    if (!settings.storeOpen) {
      setValidationError(settings.storeClosedMessage || 'The store is currently closed for new orders.');
      setIsPlacingOrder(false);
      return;
    }

    // Re-verify stock before final creation
    for (const item of cart) {
      if (item.type === 'product') {
        const liveProd = products.find((p) => p.id === item.id);
        if (liveProd && (liveProd.stockStatus === 'out_of_stock' || (liveProd.stock !== undefined && liveProd.stock <= 0))) {
          setValidationError(`"${item.title}" became unavailable. Please remove it from your cart.`);
          setIsPlacingOrder(false);
          setCheckoutStep('cart');
          return;
        }
      }
    }

    const generatedId = generateSecureOrderId();
    const activeWhatsapp = whatsappSameAsPhone ? phoneNumber : (whatsappNumber || phoneNumber);

    const finalAddress =
      deliveryMethod === 'delivery'
        ? `${governorate}, ${city}, ${detailedAddress}${buildingDetails ? ` (${buildingDetails})` : ''}`
        : `Campus Pickup: ${pickupPoint}`;

    const finalPayment =
      deliveryMethod === 'delivery'
        ? isRtl ? 'الدفع نقداً عند الاستلام' : 'Cash on Delivery'
        : isRtl ? 'الدفع نقداً عند استلام الشحنة بالجامعة' : 'Cash on Pickup';

    const newOrder: Order = {
      id: generatedId,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      orderType: cart.some((i) => i.type === 'kit')
        ? 'Kit Order'
        : cart.some((i) => i.type === 'digital')
        ? 'Digital Product Order'
        : 'Product Order',
      status: 'Pending',
      paymentStatus: 'Unpaid',
      items: [...cart],
      subtotal,
      shipping: deliveryMethod === 'pickup' ? 0 : shipping,
      discount,
      total: deliveryMethod === 'pickup' ? subtotal - discount : total,
      deliveryMethod,
      campusDeliveryPoint: deliveryMethod === 'pickup' ? pickupPoint : city,
      deliveryAddress: finalAddress,
      governorate: deliveryMethod === 'delivery' ? governorate : undefined,
      city: deliveryMethod === 'delivery' ? city : undefined,
      detailedAddress: deliveryMethod === 'delivery' ? detailedAddress : undefined,
      buildingDetails: deliveryMethod === 'delivery' ? buildingDetails : undefined,
      studentName: fullName.trim(),
      customerName: fullName.trim(),
      phone: phoneNumber.trim(),
      whatsapp: activeWhatsapp.trim(),
      email: emailAddress.trim() || undefined,
      preferredContactMethod: preferredContact,
      customerNotes: customerNotes.trim() || undefined,
      collegeId: cart[0]?.collegeId || 'engineering',
      paymentMethod: finalPayment,
      timeline: [
        {
          status: 'Pending',
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          description: 'Order created by guest customer and placed into pending queue',
        },
      ],
      internalNotes: [],
    };

    await addOrder(newOrder);

    // Save order for this guest session
    try {
      sessionStorage.setItem('sh_last_guest_order', JSON.stringify(newOrder));
    } catch {
      // Ignore quota
    }

    setIsPlacingOrder(false);
    setSubmittedOrder(newOrder);
    setCheckoutStep('confirmation');
    clearCart();
  };

  const handleCopyOrderId = () => {
    if (!submittedOrder) return;
    navigator.clipboard.writeText(submittedOrder.id);
    setHasCopiedId(true);
    setTimeout(() => setHasCopiedId(false), 2000);
  };

  const cleanStorePhone = (settings.supportPhone || '+201002345678').replace(/\D/g, '');
  const whatsappInquiryUrl = submittedOrder
    ? `https://wa.me/${cleanStorePhone}?text=${encodeURIComponent(
        isRtl
          ? `مرحباً، أود المتابعة بخصوص طلبي رقم #${submittedOrder.id} بقيمة ${submittedOrder.total} ج.م باسم ${submittedOrder.studentName}.`
          : `Hello, I'd like to check on my order #${submittedOrder.id} (${submittedOrder.total} EGP) placed by ${submittedOrder.studentName}.`
      )}`
    : `https://wa.me/${cleanStorePhone}`;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isPlacingOrder) setIsCartOpen(false);
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className={`fixed inset-y-0 ${isRtl ? 'left-0 pl-0 sm:pl-10' : 'right-0 pr-0 sm:pr-10'} max-w-full flex`}>
            <motion.div
              initial={{ x: isRtl ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                    {checkoutStep === 'confirmation' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>{isRtl ? 'تم تأكيد طلبك بنجاح' : 'Order Confirmed'}</span>
                      </>
                    ) : checkoutStep === 'review' ? (
                      <>
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>{isRtl ? 'مراجعة الطلب قبل التأكيد' : 'Review Your Order'}</span>
                      </>
                    ) : checkoutStep === 'info' ? (
                      <>
                        <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>{isRtl ? 'بيانات التوصيل والاستلام' : 'Checkout & Delivery'}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        <span>{isRtl ? 'سلة المشتريات' : 'Shopping Cart'}</span>
                      </>
                    )}
                  </h2>

                  {/* Subtitle status bar */}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {checkoutStep === 'confirmation'
                      ? (isRtl ? 'تم حفظ طلبك وإصدار الفاتورة الرسمية' : 'Your order is confirmed & invoice generated')
                      : checkoutStep === 'review'
                      ? (isRtl ? 'تأكد من صحة المنتجات والعنوان قبل تأكيد الطلب' : 'Verify items and delivery details before confirming')
                      : checkoutStep === 'info'
                      ? (isRtl ? 'طلب مباشر كزائر بدون حاجة لإنشاء حساب' : 'Guest checkout · No account or registration needed')
                      : (isRtl ? `لديك ${cart.length} منتجات في السلة` : `${cart.length} items in your bag`)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    if (checkoutStep === 'confirmation') {
                      setCheckoutStep('cart');
                      setSubmittedOrder(null);
                    }
                  }}
                  className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* ======================================================== */}
                {/* STEP 4: ORDER CONFIRMATION & INVOICE */}
                {/* ======================================================== */}
                {checkoutStep === 'confirmation' && submittedOrder && (
                  <div className="space-y-6 animate-fadeIn py-1">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                        <CheckCircle2 className="w-9 h-9" />
                      </div>
                      <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                        {isRtl ? `شكراً لك يا ${submittedOrder.studentName}!` : `Order Placed Successfully!`}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                        {isRtl
                          ? `تم تأكيد طلبك وتجهيز الفاتورة. يمكنك تحميل الفاتورة بصيغة PDF وتتبع حالة الطلب في أي وقت.`
                          : `Your order #${submittedOrder.id} has been recorded. You can download the PDF invoice or track its progress.`}
                      </p>
                    </div>

                    {/* Order ID & Copy Badge */}
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                          {isRtl ? 'رقم الطلب الخاص بك' : 'Order ID'}
                        </span>
                        <span className="font-mono text-lg font-black text-blue-900 dark:text-blue-100">
                          #{submittedOrder.id}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyOrderId}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100/50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        {hasCopiedId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{isRtl ? 'تم النسخ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'نسخ الرقم' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Invoice Download & Print Bar */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>{isRtl ? 'فاتورة الطلب الرسمية (Invoice)' : 'Official Order Invoice'}</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Generated
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => generateInvoicePDF(submittedOrder, settings)}
                          className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <FileDown className="w-4 h-4" />
                          <span>{isRtl ? 'تحميل الفاتورة PDF' : 'Download Invoice'}</span>
                        </button>

                        <button
                          onClick={() => printInvoiceHTML(submittedOrder, settings)}
                          className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Printer className="w-4 h-4" />
                          <span>{isRtl ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Details Card */}
                    <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs space-y-2.5">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-700/60">
                        <span className="text-zinc-500">{isRtl ? 'الحالة الحالية:' : 'Status:'}</span>
                        <span className="font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Pending Confirmation
                        </span>
                      </div>

                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-500">{isRtl ? 'الاسم:' : 'Customer:'}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{submittedOrder.studentName}</span>
                      </div>

                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-500">{isRtl ? 'الهاتف:' : 'Phone:'}</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">{submittedOrder.phone}</span>
                      </div>

                      {submittedOrder.whatsapp && submittedOrder.whatsapp !== submittedOrder.phone && (
                        <div className="flex justify-between gap-2">
                          <span className="text-zinc-500">{isRtl ? 'الواتساب:' : 'WhatsApp:'}</span>
                          <span className="font-mono text-zinc-900 dark:text-zinc-100">{submittedOrder.whatsapp}</span>
                        </div>
                      )}

                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-500">{isRtl ? 'طريقة الاستلام:' : 'Method:'}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {submittedOrder.deliveryMethod === 'pickup' ? (isRtl ? 'استلام من الجامعة' : 'Campus Pickup') : (isRtl ? 'توصيل للعنوان' : 'Address Delivery')}
                        </span>
                      </div>

                      <div>
                        <span className="text-zinc-500 block mb-0.5">{isRtl ? 'مكان التسليم / العنوان:' : 'Address / Destination:'}</span>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-medium text-zinc-800 dark:text-zinc-200">
                          {submittedOrder.deliveryAddress}
                        </div>
                      </div>

                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-500">{isRtl ? 'الدفع:' : 'Payment:'}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{submittedOrder.paymentMethod}</span>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                        {isRtl ? `المنتجات المطلوبة (${submittedOrder.items.length})` : `Items (${submittedOrder.items.length})`}
                      </span>
                      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 text-xs">
                        {submittedOrder.items.map((item, idx) => (
                          <div key={idx} className="p-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              {item.image && (
                                <img src={item.image} alt={item.title} className="w-8 h-8 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                              )}
                              <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                                {item.title} <span className="text-zinc-400">×{item.quantity}</span>
                              </span>
                            </div>
                            <span className="font-bold tabular-nums shrink-0 text-zinc-900 dark:text-zinc-100">
                              {item.price * item.quantity} {isRtl ? 'ج.م' : 'EGP'}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 px-1 flex justify-between font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                        <span>{isRtl ? 'المجموع الكلي:' : 'Total Amount:'}</span>
                        <span className="text-blue-600 dark:text-blue-400 tabular-nums">
                          {submittedOrder.total} {isRtl ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-2">
                      {onOpenTrackOrderModal && (
                        <button
                          onClick={() => {
                            setIsCartOpen(false);
                            onOpenTrackOrderModal(submittedOrder.id, submittedOrder.phone);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Search className="w-4 h-4" />
                          <span>{isRtl ? 'تتبع حالة هذا الطلب' : 'Track This Order'}</span>
                        </button>
                      )}

                      <a
                        href={whatsappInquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{isRtl ? 'تواصل معنا على الواتساب' : 'Chat on WhatsApp with Order #'}</span>
                      </a>

                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          setSubmittedOrder(null);
                          setCheckoutStep('cart');
                        }}
                        className="w-full py-3 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        {isRtl ? 'مواصلة التسوق' : 'Continue Shopping'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* STEP 3: ORDER REVIEW BEFORE CONFIRMATION */}
                {/* ======================================================== */}
                {checkoutStep === 'review' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <BadgeAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        {isRtl
                          ? 'يرجى مراجعة تفاصيل طلبك وعنوان التوصيل بدقة قبل الضغط على تأكيد الطلب.'
                          : 'Please carefully review your items and delivery destination before confirming your order.'}
                      </span>
                    </div>

                    {/* Customer & Destination Review Box */}
                    <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs space-y-2">
                      <div className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] pb-1 border-b border-zinc-200 dark:border-zinc-700/60">
                        {isRtl ? 'بيانات الاستلام والتواصل' : 'Delivery & Contact Details'}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">{isRtl ? 'الاسم:' : 'Full Name:'}</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">{isRtl ? 'الهاتف:' : 'Phone Number:'}</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">{phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">{isRtl ? 'الواتساب:' : 'WhatsApp:'}</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">
                          {whatsappSameAsPhone ? phoneNumber : (whatsappNumber || phoneNumber)}
                        </span>
                      </div>
                      {emailAddress && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">{isRtl ? 'البريد:' : 'Email:'}</span>
                          <span className="text-zinc-900 dark:text-zinc-100">{emailAddress}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-zinc-500">{isRtl ? 'طريقة الاستلام:' : 'Method:'}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {deliveryMethod === 'pickup' ? (isRtl ? 'استلام من الجامعة' : 'Campus Pickup') : (isRtl ? 'توصيل للعنوان' : 'Address Delivery')}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block mb-0.5">{isRtl ? 'العنوان المحدد:' : 'Address:'}</span>
                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium">
                          {deliveryMethod === 'delivery'
                            ? `${governorate}, ${city}, ${detailedAddress}${buildingDetails ? ` (${buildingDetails})` : ''}`
                            : pickupPoint}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">{isRtl ? 'طريقة الدفع:' : 'Payment:'}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {deliveryMethod === 'delivery' ? (isRtl ? 'كاش عند الاستلام' : 'Cash on Delivery') : (isRtl ? 'كاش عند الاستلام بالجامعة' : 'Cash on Pickup')}
                        </span>
                      </div>
                      {customerNotes && (
                        <div>
                          <span className="text-zinc-500 block mb-0.5">{isRtl ? 'ملاحظات إضافية:' : 'Customer Notes:'}</span>
                          <p className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 italic text-[11px]">
                            "{customerNotes}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Ordered Items Review */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                        {isRtl ? `المنتجات (${cart.length})` : `Products In Order (${cart.length})`}
                      </span>
                      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 text-xs">
                        {cart.map((item) => (
                          <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.image && (
                                <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.title}</h4>
                                <p className="text-[11px] text-zinc-500">
                                  {item.price} EGP × {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold tabular-nums shrink-0 text-zinc-900 dark:text-zinc-100">
                              {item.price * item.quantity} {isRtl ? 'ج.م' : 'EGP'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals Breakdown */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span className="tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">{subtotal} {isRtl ? 'ج.م' : 'EGP'}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                          <span>{isRtl ? 'كوبون الخصم' : 'Discount'}</span>
                          <span className="tabular-nums font-bold">-{discount} {isRtl ? 'ج.م' : 'EGP'}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>{isRtl ? 'مصاريف التوصيل' : 'Delivery Fee'}</span>
                        <span className="tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                          {deliveryMethod === 'pickup' || shipping === 0 ? (isRtl ? 'مجاني' : 'FREE') : `${shipping} ${isRtl ? 'ج.م' : 'EGP'}`}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-black text-sm text-zinc-900 dark:text-zinc-100">
                        <span>{isRtl ? 'الإجمالي النهائي المطلوب:' : 'Final Total:'}</span>
                        <span className="text-base text-blue-600 dark:text-blue-400 tabular-nums font-extrabold">
                          {deliveryMethod === 'pickup' ? subtotal - discount : total} {isRtl ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                    </div>

                    {validationError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{validationError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ======================================================== */}
                {/* STEP 2: CUSTOMER INFORMATION & DELIVERY INPUT */}
                {/* ======================================================== */}
                {checkoutStep === 'info' && (
                  <form id="checkout-info-form" onSubmit={handleProceedToReview} className="space-y-5">
                    {/* Section 1: Customer Contact */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                          1
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                          {isRtl ? 'بيانات المشتري والتواصل' : 'Customer Information'}
                        </h4>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          {isRtl ? 'الاسم بالكامل *' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={isRtl ? 'مثال: محمد أحمد علي' : 'e.g. Mostafa Hassan'}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          {isRtl ? 'رقم الهاتف للتواصل *' : 'Phone Number *'}
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => {
                              setPhoneNumber(e.target.value);
                              if (whatsappSameAsPhone) {
                                setWhatsappNumber(e.target.value);
                              }
                            }}
                            placeholder="01xxxxxxxxx"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* WhatsApp Same as Phone Toggle */}
                      <div className="pt-0.5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                          <input
                            type="checkbox"
                            checked={whatsappSameAsPhone}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setWhatsappSameAsPhone(checked);
                              if (checked) {
                                setWhatsappNumber(phoneNumber);
                              }
                            }}
                            className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="font-medium">
                            {isRtl ? 'رقم الواتساب هو نفس رقم الهاتف' : 'WhatsApp number is the same as phone number'}
                          </span>
                        </label>
                      </div>

                      {/* Explicit WhatsApp Number */}
                      {!whatsappSameAsPhone && (
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            {isRtl ? 'رقم الواتساب *' : 'WhatsApp Number *'}
                          </label>
                          <div className="relative">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              required={!whatsappSameAsPhone}
                              value={whatsappNumber}
                              onChange={(e) => setWhatsappNumber(e.target.value)}
                              placeholder="01xxxxxxxxx"
                              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono shadow-2xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* Email (Optional) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                          </label>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            {isRtl ? '(اختياري)' : '(Optional)'}
                          </span>
                        </div>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Delivery vs Pickup Method */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                          2
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                          {isRtl ? 'طريقة الاستلام والتوصيل' : 'Delivery or Pickup Method'}
                        </h4>
                      </div>

                      {/* Delivery Mode Toggle */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('delivery')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            deliveryMethod === 'delivery'
                              ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Truck className="w-4 h-4 text-blue-500" />
                            <span>{isRtl ? 'توصيل للعنوان' : 'Address Delivery'}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block font-normal">
                            {isRtl ? 'شحن حتى باب المنزل أو السكن' : 'Home / address shipping'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('pickup')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            deliveryMethod === 'pickup'
                              ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <MapPin className="w-4 h-4 text-rose-500" />
                            <span>{isRtl ? 'استلام من الجامعة' : 'Campus Pickup'}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block font-normal">
                            {isRtl ? 'بدون مصاريف شحن عند البوابة' : 'Free pickup at faculty gate'}
                          </span>
                        </button>
                      </div>

                      {/* Delivery Address Fields */}
                      {deliveryMethod === 'delivery' ? (
                        <div className="space-y-2.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80">
                          {/* Governorate */}
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              {isRtl ? 'المحافظة *' : 'Governorate *'}
                            </label>
                            <select
                              value={governorate}
                              onChange={(e) => setGovernorate(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                            >
                              {EGYPT_GOVERNORATES.map((gov) => (
                                <option key={gov} value={gov}>
                                  {gov}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* City / Area */}
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              {isRtl ? 'المدينة / المنطقة / الحي *' : 'City / District / Area *'}
                            </label>
                            <input
                              type="text"
                              required={deliveryMethod === 'delivery'}
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder={isRtl ? 'مثال: مدينة نصر، المعادي، الدقي، سموحة...' : 'e.g. Nasr City, Dokki, Smouha'}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            />
                          </div>

                          {/* Detailed Street Address */}
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              {isRtl ? 'العنوان بالتفصيل واسم الشارع *' : 'Detailed Street Address & Landmark *'}
                            </label>
                            <input
                              type="text"
                              required={deliveryMethod === 'delivery'}
                              value={detailedAddress}
                              onChange={(e) => setDetailedAddress(e.target.value)}
                              placeholder={isRtl ? 'اسم الشارع، علامة مميزة بجوار...' : 'Street name, nearby landmark'}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            />
                          </div>

                          {/* Building & Apartment */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                                {isRtl ? 'رقم العمارة / الدور / الشقة' : 'Building / Floor / Apartment'}
                              </label>
                              <span className="text-[10px] text-zinc-400">
                                {isRtl ? '(اختياري)' : '(Optional)'}
                              </span>
                            </div>
                            <input
                              type="text"
                              value={buildingDetails}
                              onChange={(e) => setBuildingDetails(e.target.value)}
                              placeholder={isRtl ? 'عمارة 12، الدور الثالث، شقة 5' : 'Bldg 12, Floor 3, Apt 5'}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            />
                          </div>
                        </div>
                      ) : (
                        /* Campus Pickup Selection */
                        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 space-y-2">
                          <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                            {isRtl ? 'اختر نقطة الاستلام من الجامعة *' : 'Select Campus Pickup Location *'}
                          </label>
                          <select
                            value={pickupPoint}
                            onChange={(e) => setPickupPoint(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                          >
                            {universityCampuses.map((campus) => (
                              <option key={campus} value={campus}>
                                {campus}
                              </option>
                            ))}
                          </select>
                          <p className="text-[11px] text-zinc-500">
                            {isRtl
                              ? 'سيقوم مندوبنا بالتواصل معك هاتفياً أو عبر الواتساب عند الوصول لبوابة الكلية لتسليمك الطلب.'
                              : 'Our courier will coordinate via call/WhatsApp when arriving at the faculty gate.'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Section 3: Payment Method & Notes */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                          3
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                          {isRtl ? 'طريقة الدفع والملاحظات' : 'Payment Method & Order Notes'}
                        </h4>
                      </div>

                      {/* Payment Option */}
                      <div className="p-3 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-blue-950 dark:text-blue-100">
                            {deliveryMethod === 'delivery'
                              ? (isRtl ? 'الدفع نقداً عند الاستلام (كاش)' : 'Cash on Delivery')
                              : (isRtl ? 'الدفع نقداً عند استلام الشحنة بالجامعة' : 'Cash on Pickup')}
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-600 font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800">
                          {isRtl ? 'بدون بطاقة' : 'No card needed'}
                        </span>
                      </div>

                      {/* Additional Notes (Optional) */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {isRtl ? 'ملاحظات خاصة بالطلب أو التوصيل' : 'Order Notes & Instructions'}
                          </label>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            {isRtl ? '(اختياري)' : '(Optional)'}
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          placeholder={isRtl ? 'مثال: موعد تسليم مفضل بعد المحاضرة، تسليم لزميلي...' : 'Special instructions, timing, etc.'}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                        />
                      </div>
                    </div>

                    {validationError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{validationError}</span>
                      </div>
                    )}
                  </form>
                )}

                {/* ======================================================== */}
                {/* STEP 1: CART ITEMS VIEW */}
                {/* ======================================================== */}
                {checkoutStep === 'cart' && (
                  <>
                    {cart.length === 0 ? (
                      /* Empty Cart State */
                      <div className="h-full flex flex-col items-center justify-center text-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl mb-3 shadow-inner">
                          🛒
                        </div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">
                          {isRtl ? 'سلة المشتريات فارغة' : 'Your cart is empty'}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
                          {isRtl
                            ? 'تصفح أدوات ومستلزمات كليتك وأضف ما تحتاجه للسلة مباشرة بدون حساب.'
                            : 'Explore your faculty catalog and add items directly to your cart with zero friction.'}
                        </p>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          {isRtl ? 'تصفح المتجر الآن' : 'Browse Catalog'}
                        </button>
                      </div>
                    ) : (
                      /* Cart Items List */
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-2xs"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-16 h-16 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=200&q=80';
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {item.category || 'Product'}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                                  {item.price * item.quantity} {isRtl ? 'ج.م' : 'EGP'}
                                </span>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5">
                                  <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400 cursor-pointer"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-semibold px-2 tabular-nums">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400 cursor-pointer"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 text-zinc-400 hover:text-rose-500 transition-colors self-start cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {/* Promo Code Form */}
                        <div className="pt-2">
                          {appliedCoupon ? (
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                                <Tag className="w-3.5 h-3.5" />
                                <span>{isRtl ? `تم تطبيق الكوبون "${appliedCoupon}"` : `Coupon "${appliedCoupon}" applied`}</span>
                              </div>
                              <button
                                type="button"
                                onClick={removeCoupon}
                                className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                              >
                                {isRtl ? 'حذف' : 'Remove'}
                              </button>
                            </div>
                          ) : (
                            <form onSubmit={handleApplyCoupon} className="flex gap-2">
                              <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                placeholder={isRtl ? 'كود الخصم (مثال: STUDENT10)' : 'Discount code'}
                                className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <button
                                type="submit"
                                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer"
                              >
                                {isRtl ? 'تطبيق' : 'Apply'}
                              </button>
                            </form>
                          )}
                          {couponFeedback && !appliedCoupon && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">{couponFeedback}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Drawer Bottom Controls */}
              {checkoutStep !== 'confirmation' && cart.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 space-y-3 shrink-0">
                  {/* Totals Preview in Cart Step */}
                  {checkoutStep === 'cart' && (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                          {subtotal} {isRtl ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                          <span>{isRtl ? 'الخصم' : 'Discount'}</span>
                          <span className="tabular-nums font-bold">-{discount} {isRtl ? 'ج.م' : 'EGP'}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>{isRtl ? 'مصاريف التوصيل' : 'Delivery Fee'}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                          {shipping === 0 ? (isRtl ? 'مجاني' : 'Free') : `${shipping} ${isRtl ? 'ج.م' : 'EGP'}`}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        <span>{isRtl ? 'الإجمالي' : 'Total'}</span>
                        <span className="text-base text-blue-600 dark:text-blue-400 tabular-nums font-extrabold">
                          {total} {isRtl ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions for Step 1 (Cart) */}
                  {checkoutStep === 'cart' && (
                    <button
                      onClick={() => setCheckoutStep('info')}
                      className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isRtl ? 'إتمام الطلب (بدون حساب)' : 'Proceed to Checkout'}</span>
                      <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                    </button>
                  )}

                  {/* Actions for Step 2 (Info) */}
                  {checkoutStep === 'info' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setValidationError(null);
                          setCheckoutStep('cart');
                        }}
                        className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      >
                        {isRtl ? 'رجوع للسلة' : 'Back'}
                      </button>
                      <button
                        type="submit"
                        form="checkout-info-form"
                        className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>{isRtl ? 'مراجعة الطلب' : 'Review Order'}</span>
                        <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}

                  {/* Actions for Step 3 (Review) */}
                  {checkoutStep === 'review' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isPlacingOrder}
                        onClick={() => setCheckoutStep('info')}
                        className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {isRtl ? 'تعديل البيانات' : 'Edit Info'}
                      </button>
                      <button
                        type="button"
                        disabled={isPlacingOrder}
                        onClick={handleConfirmOrder}
                        className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {isPlacingOrder ? (
                          <span>{isRtl ? 'جاري إنشاء الطلب والفاتورة...' : 'Creating Order & Invoice...'}</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isRtl ? 'تأكيد الطلب نهائياً' : 'Confirm Order'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isRtl ? 'تسوق آمن بدون حساب • الدفع نقداً عند الاستلام' : 'Guest Checkout · Cash on Delivery / Pickup'}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
