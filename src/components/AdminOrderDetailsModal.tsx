import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus, Product } from '../types';
import { useStoreData } from '../context/StoreDataContext';
import { useToast } from '../context/ToastContext';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  Calendar,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  CreditCard,
  Printer,
  Ban,
  Lock,
  Plus,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  DollarSign,
  Send,
} from 'lucide-react';

interface AdminOrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenProductDetails?: (productId: string) => void;
}

export default function AdminOrderDetailsModal({
  order,
  onClose,
  onOpenProductDetails,
}: AdminOrderDetailsModalProps) {
  const {
    updateOrderStatus,
    updatePaymentStatus,
    addOrderInternalNote,
    cancelOrder,
    products,
  } = useStoreData();
  const { success, error, info } = useToast();

  const [newNoteText, setNewNoteText] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<OrderStatus | ''>('');
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Cancelled by customer request');
  const [isPrintReceiptOpen, setIsPrintReceiptOpen] = useState(false);

  if (!order) return null;

  const allStatuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  const handleStatusChangeClick = (status: OrderStatus) => {
    setSelectedNextStatus(status);
    setIsChangingStatus(true);
  };

  const confirmStatusChange = () => {
    if (!selectedNextStatus) return;
    updateOrderStatus(order.id, selectedNextStatus);
    if (selectedNextStatus === 'Delivered' && order.paymentStatus === 'Unpaid') {
      updatePaymentStatus(order.id, 'Paid');
    }
    success('Order Status Updated', `Order #${order.id} is now ${selectedNextStatus}`);
    setIsChangingStatus(false);
    setSelectedNextStatus('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addOrderInternalNote(order.id, newNoteText.trim(), 'Campus Admin');
    success('Note Added', 'Internal admin note recorded.');
    setNewNoteText('');
  };

  const handleConfirmCancel = () => {
    cancelOrder(order.id, cancelReason);
    error('Order Cancelled', `Order #${order.id} has been marked as Cancelled.`);
    setIsCancelConfirmOpen(false);
  };

  const getStatusColor = (st: OrderStatus) => {
    switch (st) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800';
      case 'Ready':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800';
      case 'Preparing':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800';
      case 'Confirmed':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700';
    }
  };

  // Format Egyptian phone for WhatsApp
  const cleanPhone = (order.whatsapp || order.phone || '').replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hello ${order.studentName}, this is Student Hub regarding your order #${order.id}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto">
        {/* ===================== MODAL HEADER ===================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
                  #{order.id}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                {order.orderType && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {order.orderType}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                Placed on {order.date} · Student Hub Campus Courier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrintReceiptOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================== MODAL CONTENT BODY ===================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Action Bar: Status & Payment Controls */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Change Status:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allStatuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChangeClick(st)}
                    disabled={order.status === st}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      order.status === st
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                        : 'border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Payment:
              </span>
              <select
                value={order.paymentStatus}
                onChange={(e) => {
                  const newPay = e.target.value as PaymentStatus;
                  updatePaymentStatus(order.id, newPay);
                  success('Payment Updated', `Payment marked as ${newPay}`);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  order.paymentStatus === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : order.paymentStatus === 'Unpaid'
                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Refunded">Refunded</option>
              </select>

              {order.status !== 'Cancelled' && (
                <button
                  onClick={() => setIsCancelConfirmOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-1"
                >
                  <Ban className="w-3 h-3" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>

          {/* Customer & Delivery Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Contact Card */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Student Information
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  Verified Campus Member
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {order.studentName}
                </h4>
                {order.collegeName && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{order.collegeName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="font-mono">{order.phone}</span>
                </div>
                {order.whatsapp && order.whatsapp !== order.phone && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono">WhatsApp: {order.whatsapp}</span>
                  </div>
                )}
                {order.preferredContactMethod && (
                  <div className="text-[11px] text-zinc-500">
                    Preferred Contact: <span className="font-semibold text-zinc-700 dark:text-zinc-200 capitalize">{order.preferredContactMethod}</span>
                  </div>
                )}
                {order.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{order.email}</span>
                  </div>
                )}
              </div>

              {/* Direct Communication Buttons */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 flex-wrap">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${order.phone}`}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                {order.email && (
                  <a
                    href={`mailto:${order.email}?subject=Student%20Hub%20Order%20%23${order.id}`}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                )}
              </div>
            </div>

            {/* Delivery & Payment Method Card */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Delivery & Payment Method
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-zinc-400 block font-medium">
                    {order.deliveryMethod === 'pickup' ? 'Campus Pickup Point:' : 'Fulfillment Type & Location:'}
                  </span>
                  <div className="flex items-start gap-1.5 text-zinc-900 dark:text-zinc-100 font-semibold mt-0.5">
                    {order.deliveryMethod === 'pickup' ? (
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : (
                      <Truck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <span>{order.campusDeliveryPoint || order.city || 'Address Delivery'}</span>
                  </div>
                </div>

                {order.deliveryAddress && (
                  <div>
                    <span className="text-zinc-400 block font-medium">Destination / Address:</span>
                    <p className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 mt-0.5">
                      {order.deliveryAddress}
                    </p>
                  </div>
                )}

                {order.customerNotes && (
                  <div>
                    <span className="text-zinc-400 block font-medium">Customer Notes:</span>
                    <p className="text-zinc-700 dark:text-zinc-300 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-xl border border-amber-200/60 dark:border-amber-900/40 mt-0.5 italic">
                      "{order.customerNotes}"
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400">Payment Option:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    {order.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== PRODUCTS INSIDE ORDER ===================== */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                Order Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
              </h4>
              <span className="text-xs text-zinc-500">
                Click any product to inspect full catalog details
              </span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onOpenProductDetails?.(item.id)}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-xs">
                          ITEM
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {item.title}
                        </h5>
                        <ExternalLink className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {item.variant && (
                        <p className="text-[11px] text-zinc-500">
                          Spec: <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.variant}</span>
                        </p>
                      )}
                      {item.category && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-xs shrink-0 pl-16 sm:pl-0">
                    <div className="text-zinc-500">
                      <span className="tabular-nums font-semibold">{item.price} EGP</span> ×{' '}
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50 tabular-nums">
                        {item.price * item.quantity} EGP
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="block text-[10px] text-zinc-400 line-through">
                          {item.originalPrice * item.quantity} EGP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary Breakdown */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex justify-end">
              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                    {order.subtotal} EGP
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Applied:</span>
                    <span className="tabular-nums">-{order.discount} EGP</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>Campus Courier Shipping:</span>
                  <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                    {order.shipping === 0 ? 'FREE' : `${order.shipping} EGP`}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-extrabold text-sm text-zinc-900 dark:text-zinc-50">
                  <span>Final Total:</span>
                  <span className="text-blue-600 dark:text-blue-400 tabular-nums">
                    {order.total} EGP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== ORDER TIMELINE PROGRESS ===================== */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Order Processing Timeline</span>
            </h4>

            {/* Step sequence visualization */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {order.timeline && order.timeline.length > 0 ? (
                order.timeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white dark:border-zinc-900" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {step.status}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {step.date}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400">Order placed on {order.date}</p>
              )}
            </div>
          </div>

          {/* ===================== ADMIN PRIVATE INTERNAL NOTES ===================== */}
          <div className="p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  Private Admin Notes
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                🔒 Hidden from student
              </span>
            </div>

            {/* Notes list */}
            <div className="space-y-2">
              {order.internalNotes && order.internalNotes.length > 0 ? (
                order.internalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 text-xs space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {note.author}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {note.createdAt}
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300">{note.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 italic">
                  No internal notes yet. Add operational delivery reminders or verification details below.
                </p>
              )}
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add private operational note (e.g. 'Student requested pickup after 5 PM')..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </form>
          </div>
        </div>

        {/* ===================== CONFIRM STATUS CHANGE MODAL ===================== */}
        {isChangingStatus && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-scaleUp">
              <div className="flex items-center gap-3 text-blue-600">
                <AlertCircle className="w-6 h-6" />
                <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                  Confirm Status Change
                </h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Are you sure you want to change order <span className="font-mono font-bold">#{order.id}</span> from{' '}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{order.status}</span> to{' '}
                <span className="font-bold text-blue-600">{selectedNextStatus}</span>?
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsChangingStatus(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== CANCEL ORDER CONFIRMATION MODAL ===================== */}
        {isCancelConfirmOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-scaleUp">
              <div className="flex items-center gap-3 text-rose-600">
                <Ban className="w-6 h-6" />
                <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                  Cancel Order #{order.id}
                </h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                This will mark the order as Cancelled and record an administrative cancellation in the order timeline.
              </p>
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Cancellation Reason:
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCancelConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== PRINT RECEIPT MODAL ===================== */}
        {isPrintReceiptOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-lg p-6 rounded-3xl bg-white text-zinc-900 shadow-2xl space-y-4 border border-zinc-200">
              <div className="flex justify-between items-start border-b border-zinc-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">STUDENT HUB</h3>
                  <p className="text-[11px] text-zinc-500">Official Campus Order Receipt</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-zinc-900 block">#{order.id}</span>
                  <span className="text-[10px] text-zinc-400">{order.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Customer:</span>
                  <span className="font-bold text-zinc-800">{order.studentName}</span>
                  <span className="block text-zinc-500 font-mono text-[11px]">{order.phone}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Campus Point:</span>
                  <span className="font-semibold text-zinc-800 line-clamp-2">{order.campusDeliveryPoint}</span>
                </div>
              </div>

              <div className="border-t border-b border-zinc-200 py-2 divide-y divide-zinc-100 text-xs">
                {order.items.map((i, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between">
                    <div>
                      <span className="font-bold">{i.quantity}x </span>
                      <span>{i.title}</span>
                    </div>
                    <span className="font-bold tabular-nums">{i.price * i.quantity} EGP</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal:</span>
                  <span className="tabular-nums">{order.subtotal} EGP</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span className="tabular-nums">-{order.discount} EGP</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping:</span>
                  <span>{order.shipping === 0 ? 'FREE' : `${order.shipping} EGP`}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-zinc-200">
                  <span>TOTAL PAID/DUE:</span>
                  <span className="tabular-nums text-blue-600">{order.total} EGP</span>
                </div>
                <div className="text-[10px] text-zinc-400 pt-1">
                  Payment Method: {order.paymentMethod} ({order.paymentStatus})
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  onClick={() => setIsPrintReceiptOpen(false)}
                  className="px-4 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    info('Print Triggered', 'Receipt sent to printer spooler.');
                    window.print();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
