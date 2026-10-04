import React, { useState } from 'react';
import { useStoreData } from '../context/StoreDataContext';
import { useLanguage } from '../context/LanguageContext';
import { Order, OrderStatus } from '../types';
import { generateInvoicePDF, printInvoiceHTML } from '../utils/invoiceGenerator';
import {
  X,
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  FileDown,
  Printer,
  MessageCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  initialPhone?: string;
}

export default function TrackOrderModal({
  isOpen,
  onClose,
  initialOrderId = '',
  initialPhone = '',
}: TrackOrderModalProps) {
  const { orders, settings } = useStoreData();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSearched(true);

    const cleanInputId = orderIdInput.trim().toUpperCase().replace(/^#/, '');
    const cleanInputPhone = phoneInput.replace(/[^0-9]/g, '');

    if (!cleanInputId || !cleanInputPhone) {
      setErrorMessage(
        isRtl
          ? 'يرجى إدخال رقم الطلب ورقم الهاتف المسجل بالطلب.'
          : 'Please enter both your Order ID and the phone number used during checkout.'
      );
      setSearchedOrder(null);
      return;
    }

    // Strict authentication: MUST match BOTH Order ID AND Phone Number!
    const match = orders.find((o) => {
      const storedId = o.id.trim().toUpperCase().replace(/^#/, '');
      const storedPhone = (o.phone || '').replace(/[^0-9]/g, '');
      const storedWhatsapp = (o.whatsapp || '').replace(/[^0-9]/g, '');

      return (
        storedId === cleanInputId &&
        (storedPhone.endsWith(cleanInputPhone.slice(-8)) ||
          cleanInputPhone.endsWith(storedPhone.slice(-8)) ||
          (storedWhatsapp && (storedWhatsapp.endsWith(cleanInputPhone.slice(-8)) || cleanInputPhone.endsWith(storedWhatsapp.slice(-8)))))
      );
    });

    if (match) {
      setSearchedOrder(match);
      setErrorMessage(null);
    } else {
      setSearchedOrder(null);
      setErrorMessage(
        isRtl
          ? 'لم يتم العثور على طلب مطابق لرقم الطلب ورقم الهاتف المدخلين. يرجى التأكد من البيانات والمحاولة مجدداً.'
          : 'No order found matching this Order Number and Phone Number combination. Please verify your details.'
      );
    }
  };

  const statusSteps: OrderStatus[] = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Shipped', 'Delivered'];

  const getStatusIndex = (st: OrderStatus) => {
    const idx = statusSteps.indexOf(st);
    return idx === -1 ? 0 : idx;
  };

  const getStatusColor = (st: OrderStatus) => {
    switch (st) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'Ready':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300';
      case 'Preparing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'Confirmed':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
    }
  };

  const cleanStorePhone = (settings.supportPhone || '+201002345678').replace(/\D/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-zinc-50">
                {isRtl ? 'تتبع حالة الطلب' : 'Track Your Order'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isRtl ? 'أدخل رقم الطلب ورقم الهاتف لمشاهدة تفاصيل وحالة طلبك' : 'Enter your Order ID and phone number to inspect status and receipt'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Tracking Search Form */}
          <form onSubmit={handleTrackSubmit} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isRtl ? 'رقم الطلب (Order ID) *' : 'Order ID (ORD-XXXXXXXX) *'}
                </label>
                <input
                  type="text"
                  required
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  placeholder="ORD-..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isRtl ? 'رقم الهاتف المسجل بالطلب *' : 'Phone Number Used *'}
                </label>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isRtl ? 'بحث وتتبع الطلب' : 'Track Order'}</span>
            </button>
          </form>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Searched Order Details */}
          {searchedOrder && (
            <div className="space-y-5 animate-fadeIn">
              {/* Order Status Header */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                      #{searchedOrder.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(searchedOrder.status)}`}>
                      {searchedOrder.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    Placed on {searchedOrder.date}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateInvoicePDF(searchedOrder, settings)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileDown className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={() => printInvoiceHTML(searchedOrder, settings)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Progress Timeline Tracker */}
              {searchedOrder.status !== 'Cancelled' && (
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                    {isRtl ? 'مراحل تنفيذ الطلب' : 'Order Progress'}
                  </span>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                    {statusSteps.map((step, idx) => {
                      const currentIdx = getStatusIndex(searchedOrder.status);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition-colors ${
                              isComplete
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                            } ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900' : ''}`}
                          >
                            {isComplete ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] font-semibold ${
                              isComplete ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Info & Delivery Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Customer card */}
                <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1.5">
                  <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] block">
                    {isRtl ? 'بيانات العميل' : 'Customer Info'}
                  </span>
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{searchedOrder.studentName}</div>
                  <div className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{searchedOrder.phone}</span>
                  </div>
                  {searchedOrder.whatsapp && (
                    <div className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>WhatsApp: {searchedOrder.whatsapp}</span>
                    </div>
                  )}
                </div>

                {/* Fulfillment card */}
                <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1.5">
                  <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] block">
                    {isRtl ? 'طريقة الاستلام' : 'Fulfillment & Destination'}
                  </span>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    {searchedOrder.deliveryMethod === 'pickup' ? (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{isRtl ? 'استلام من الجامعة' : 'Campus Pickup'}</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-3.5 h-3.5 text-blue-500" />
                        <span>{isRtl ? 'توصيل للعنوان' : 'Address Delivery'}</span>
                      </>
                    )}
                  </div>
                  <div className="text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {searchedOrder.deliveryAddress || searchedOrder.campusDeliveryPoint}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                  {isRtl ? `المنتجات المطلوبة (${searchedOrder.items.length})` : `Order Items (${searchedOrder.items.length})`}
                </span>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 text-xs">
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-9 h-9 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                        )}
                        <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                          {item.title} <span className="text-zinc-400">×{item.quantity}</span>
                        </span>
                      </div>
                      <span className="font-bold tabular-nums shrink-0 text-zinc-900 dark:text-zinc-100">
                        {item.price * item.quantity} EGP
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{searchedOrder.subtotal} EGP</span>
                  </div>
                  {searchedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-bold">-{searchedOrder.discount} EGP</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {searchedOrder.shipping === 0 ? 'FREE' : `${searchedOrder.shipping} EGP`}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    <span>Total Amount:</span>
                    <span className="text-blue-600 dark:text-blue-400 tabular-nums">{searchedOrder.total} EGP</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Support Link */}
              <a
                href={`https://wa.me/${cleanStorePhone}?text=${encodeURIComponent(
                  `Hello, I would like to inquire about my order #${searchedOrder.id} (${searchedOrder.studentName}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Store Support via WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
