import React, { useState } from 'react';
import { CustomOrder, CustomOrderStatus } from '../types';
import { useStoreData } from '../context/StoreDataContext';
import { useToast } from '../context/ToastContext';
import {
  X,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Lock,
  Plus,
  Building2,
  FileImage,
  Tag,
  Palette,
  Layers,
  ZoomIn,
} from 'lucide-react';

interface AdminCustomOrderDetailsModalProps {
  order: CustomOrder | null;
  onClose: () => void;
}

export default function AdminCustomOrderDetailsModal({
  order,
  onClose,
}: AdminCustomOrderDetailsModalProps) {
  const { updateCustomOrderStatus, addCustomOrderInternalNote } = useStoreData();
  const { success, info } = useToast();

  const [newNoteText, setNewNoteText] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<CustomOrderStatus | ''>('');
  const [previewingImage, setPreviewingImage] = useState<string | null>(null);

  if (!order) return null;

  const statuses: CustomOrderStatus[] = [
    'Pending',
    'Confirmed',
    'In Production',
    'Ready',
    'Delivered',
    'Cancelled',
  ];

  const handleStatusClick = (st: CustomOrderStatus) => {
    setSelectedNextStatus(st);
    setIsChangingStatus(true);
  };

  const confirmStatusChange = () => {
    if (!selectedNextStatus) return;
    updateCustomOrderStatus(order.id, selectedNextStatus);
    success('Custom Order Updated', `Order #${order.id} is now ${selectedNextStatus}`);
    setIsChangingStatus(false);
    setSelectedNextStatus('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addCustomOrderInternalNote(order.id, newNoteText.trim(), 'Workshop Admin');
    success('Note Added', 'Internal production note recorded.');
    setNewNoteText('');
  };

  const cleanPhone = order.phone.replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hello ${order.customerName}, this is the Student Hub Workshop regarding your custom gear #${order.id} (${order.productType}).`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto">
        {/* ===================== HEADER ===================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
                  #{order.id}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Custom Production Job · Submitted on {order.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================== BODY ===================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Bar */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Production Stage:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {statuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusClick(st)}
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

            <div className="text-right">
              <span className="text-xs text-zinc-400 block font-medium">Job Value:</span>
              <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 tabular-nums">
                {order.price} EGP
              </span>
            </div>
          </div>

          {/* Product & Customization Specs */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Customized Product
              </span>
              <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {order.productType}
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60 space-y-2">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Custom Engraving / Embroidery Text:</span>
              </span>
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-purple-200 dark:border-zinc-800 font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                "{order.customizationText}"
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Faculty Badge / Emblem</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mt-1">
                  {order.facultyBadge}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Color / Finish</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mt-1">
                  {order.selectedColor}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Quantity</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mt-1 tabular-nums">
                  {order.quantity} Unit(s)
                </span>
              </div>
            </div>

            {order.notes && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs">
                <span className="font-bold text-zinc-500 block mb-0.5">Customer Instructions:</span>
                <p className="text-zinc-800 dark:text-zinc-200 font-medium">"{order.notes}"</p>
              </div>
            )}
          </div>

          {/* Uploaded Reference Artwork & Mockups */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FileImage className="w-4 h-4 text-purple-600" />
                <span>Uploaded Artwork & Factory Proofs</span>
              </h4>
              <span className="text-xs text-zinc-400">Click any image to inspect high-resolution</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {order.referenceImage && (
                <div
                  onClick={() => setPreviewingImage(order.referenceImage!)}
                  className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer aspect-video"
                >
                  <img
                    src={order.referenceImage}
                    alt="Customer Reference"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <ZoomIn className="w-4 h-4" />
                    <span>Inspect Reference</span>
                  </div>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white">
                    Student Reference Photo
                  </span>
                </div>
              )}

              {order.mockupImage && (
                <div
                  onClick={() => setPreviewingImage(order.mockupImage!)}
                  className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer aspect-video"
                >
                  <img
                    src={order.mockupImage}
                    alt="Digital Proof Mockup"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <ZoomIn className="w-4 h-4" />
                    <span>Inspect Proof</span>
                  </div>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white">
                    Generated Factory Proof
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Customer & Communication */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 text-xs">
            <span className="font-bold text-zinc-400 uppercase text-[10px] block">
              Customer Contact:
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {order.customerName}
                </h4>
                <p className="text-zinc-500 font-mono mt-0.5">{order.phone}</p>
                {order.email && <p className="text-zinc-500">{order.email}</p>}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Student</span>
                </a>
                <a
                  href={`tel:${order.phone}`}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Production Timeline</span>
            </h4>

            <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {order.timeline && order.timeline.length > 0 ? (
                order.timeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white dark:border-zinc-900" />
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
                <p className="text-xs text-zinc-400">Received on {order.date}</p>
              )}
            </div>
          </div>

          {/* Admin Private Notes */}
          <div className="p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  Workshop Internal Notes
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                🔒 Hidden from student
              </span>
            </div>

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
                  No internal notes yet. Record laser settings, thread batch numbers, or inspection notes.
                </p>
              )}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add private note (e.g. 'Engraving approved with 0.15mm depth')..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none"
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

        {/* Full Image Modal */}
        {previewingImage && (
          <div
            onClick={() => setPreviewingImage(null)}
            className="fixed inset-0 z-70 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xs cursor-pointer"
          >
            <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={previewingImage}
                alt="Artwork Preview"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setPreviewingImage(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Confirm Status Change Modal */}
        {isChangingStatus && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-scaleUp">
              <div className="flex items-center gap-3 text-purple-600">
                <AlertCircle className="w-6 h-6" />
                <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                  Update Custom Order Status
                </h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Are you sure you want to transition custom order <span className="font-mono font-bold">#{order.id}</span> from{' '}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{order.status}</span> to{' '}
                <span className="font-bold text-purple-600">{selectedNextStatus}</span>?
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
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs"
                >
                  Confirm Transition
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
