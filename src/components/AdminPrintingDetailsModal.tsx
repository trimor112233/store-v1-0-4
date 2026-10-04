import React, { useState } from 'react';
import { PrintingRequest, PrintingStatus } from '../types';
import { useStoreData } from '../context/StoreDataContext';
import { useToast } from '../context/ToastContext';
import {
  X,
  FileText,
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Lock,
  Plus,
  Building2,
  Layers,
  Sparkles,
  RotateCw,
  FileCheck,
} from 'lucide-react';

interface AdminPrintingDetailsModalProps {
  request: PrintingRequest | null;
  onClose: () => void;
}

export default function AdminPrintingDetailsModal({
  request,
  onClose,
}: AdminPrintingDetailsModalProps) {
  const { updatePrintingStatus, addPrintingInternalNote } = useStoreData();
  const { success, error, info } = useToast();

  const [activePage, setActivePage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [newNoteText, setNewNoteText] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<PrintingStatus | ''>('');

  if (!request) return null;

  const totalPages = request.pages || 1;
  const isPdf =
    request.fileType?.includes('pdf') ||
    request.fileName.toLowerCase().endsWith('.pdf');
  const isImage =
    request.fileType?.includes('image') ||
    request.fileName.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/i);

  const workflowStatuses: PrintingStatus[] = [
    'Pending',
    'File Review',
    'Confirmed',
    'Printing',
    'Ready for Pickup',
    'Completed',
    'Cancelled',
  ];

  const handleStatusClick = (st: PrintingStatus) => {
    setSelectedNextStatus(st);
    setIsChangingStatus(true);
  };

  const confirmStatusChange = () => {
    if (!selectedNextStatus) return;
    updatePrintingStatus(request.id, selectedNextStatus);
    success('Print Job Updated', `Job #${request.id} is now ${selectedNextStatus}`);
    setIsChangingStatus(false);
    setSelectedNextStatus('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addPrintingInternalNote(request.id, newNoteText.trim(), 'Print Admin');
    success('Note Added', 'Internal print job note recorded.');
    setNewNoteText('');
  };

  const handleDownload = () => {
    info('Downloading Document', `Initiated download for ${request.fileName}`);
    const link = document.createElement('a');
    link.href = request.fileUrl || '#';
    link.download = request.fileName;
    link.target = '_blank';
    link.click();
  };

  const getStatusColor = (st: PrintingStatus) => {
    switch (st) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
      case 'Ready for Pickup':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800';
      case 'Printing':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800';
      case 'Confirmed':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800';
      case 'File Review':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700';
    }
  };

  // WhatsApp link
  const cleanPhone = request.phone.replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hello ${request.customerName}, this is the Student Hub Printing Center regarding print job #${request.id} (${request.fileName}).`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto">
        {/* ===================== HEADER ===================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
                  #{request.id}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
                {request.deadline && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Deadline: {request.deadline}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                Submitted {request.submittedAt} · Campus High-Speed Plotting & Digital Press
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
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
          {/* Workflow Status Controls */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Printing Job Workflow Stage:
              </span>
              <span className="text-xs text-zinc-500">
                Total Price: <strong className="text-zinc-900 dark:text-zinc-100 tabular-nums">{request.price} EGP</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {workflowStatuses.map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusClick(st)}
                  disabled={request.status === st}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    request.status === st
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                      : 'border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* ===================== EMBEDDED FILE VIEWER ===================== */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 overflow-hidden shadow-md">
            {/* Viewer Toolbar */}
            <div className="px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-zinc-200 truncate max-w-[200px] sm:max-w-md">
                  {request.fileName}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-800 text-zinc-300">
                  {request.fileSize || '12.4 MB'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-900/60 text-blue-300">
                  {isPdf ? 'VECTOR PDF' : isImage ? 'IMAGE (300 DPI)' : 'DOCUMENT'}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {isPdf && totalPages > 1 && (
                  <div className="flex items-center gap-1 bg-zinc-800/80 rounded-lg px-2 py-1">
                    <button
                      onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                      disabled={activePage <= 1}
                      className="text-zinc-300 hover:text-white disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono">
                      {activePage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setActivePage((p) => Math.min(totalPages, p + 1))}
                      disabled={activePage >= totalPages}
                      className="text-zinc-300 hover:text-white disabled:opacity-30"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1 bg-zinc-800/80 rounded-lg px-2 py-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                    className="text-zinc-300 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono w-10 text-center">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
                    className="text-zinc-300 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                  title="Rotate 90deg"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Render Canvas */}
            <div className="p-4 sm:p-8 bg-zinc-950 flex items-center justify-center min-h-[380px] max-h-[520px] overflow-auto">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="relative bg-white text-zinc-900 rounded-lg shadow-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700"
              >
                {/* Simulated High-Res Architectural Blueprint or Academic PDF */}
                {request.paperSize === 'A1' || request.paperSize === 'A2' ? (
                  <div className="w-[580px] h-[400px] p-6 bg-slate-900 text-cyan-300 font-mono relative flex flex-col justify-between select-none">
                    {/* Architectural Plot Grid Background */}
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                      }}
                    />

                    {/* Blueprint Title Block Header */}
                    <div className="relative border-b-2 border-cyan-400 pb-2 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-cyan-400 tracking-widest block uppercase font-bold">
                          EGYPTIAN UNIVERSITIES FACULTY OF ENGINEERING · DEPT OF ARCHITECTURE
                        </span>
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          URBAN INTEGRATION MASTERPLAN & STRUCTURAL ELEVATION (PAGE {activePage})
                        </h4>
                      </div>
                      <div className="text-right text-[10px] border border-cyan-500/50 p-1 rounded bg-cyan-950/60">
                        <span>SCALE 1:100</span>
                        <span className="block font-bold text-white">{request.paperSize} PLOT</span>
                      </div>
                    </div>

                    {/* Schematics Vector representation */}
                    <div className="relative my-auto py-4 flex items-center justify-center">
                      <div className="border border-dashed border-cyan-400/60 p-6 rounded w-full flex flex-col items-center justify-center gap-2 bg-cyan-950/20">
                        <div className="w-48 h-24 border-2 border-cyan-300 relative flex items-center justify-center">
                          <div className="absolute inset-x-0 top-1/2 border-t border-cyan-400/40" />
                          <div className="absolute inset-y-0 left-1/2 border-l border-cyan-400/40" />
                          <span className="text-[11px] font-bold text-white">SECTION A-A: CORE RESIDENCE</span>
                        </div>
                        <span className="text-[10px] text-cyan-400">
                          Linework: 0.18mm, 0.35mm, 0.50mm · Calibrated for {request.paperType} ({request.colorMode.toUpperCase()})
                        </span>
                      </div>
                    </div>

                    {/* Title Block Footer */}
                    <div className="relative border-t-2 border-cyan-400 pt-2 flex justify-between items-center text-[10px] text-cyan-300">
                      <div>
                        <span>DESIGNED BY: </span>
                        <strong className="text-white">{request.customerName}</strong>
                      </div>
                      <div>
                        <span>FACULTY: </span>
                        <strong className="text-white">{request.university}</strong>
                      </div>
                      <div className="text-right">
                        <span>SHEET {activePage} OF {totalPages}</span>
                      </div>
                    </div>
                  </div>
                ) : isImage ? (
                  <div className="max-w-[500px] max-h-[380px] p-2 bg-zinc-100 flex items-center justify-center">
                    <img
                      src={request.fileUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'}
                      alt={request.fileName}
                      className="max-h-[360px] object-contain rounded"
                    />
                  </div>
                ) : (
                  /* Standard A4 Academic Multi-page PDF Document */
                  <div className="w-[420px] h-[540px] p-8 bg-white text-zinc-800 flex flex-col justify-between font-serif select-none shadow-inner">
                    <div className="border-b border-zinc-200 pb-3 flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm font-sans text-zinc-900">
                          {request.fileName.replace('.pdf', '')}
                        </h4>
                        <p className="text-[10px] font-sans text-zinc-500">
                          {request.university} · Departmental Course Manual
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">P. {activePage}</span>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed text-zinc-700">
                      <h5 className="font-bold font-sans text-zinc-900 text-xs uppercase tracking-wide">
                        Chapter {activePage}: Laboratory Protocol & Methodology
                      </h5>
                      <p className="text-[11px] text-justify text-zinc-600">
                        This document is officially registered for university printing services. High-density text formatting calibrated at 600 DPI to avoid bleeding across dual-sided {request.paperType} binding.
                      </p>
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-mono">
                        <div>// Sample Lecture Formula / Code / Table:</div>
                        <div className="text-blue-700 font-bold">Standard Specimen Concentration = 2.45 mg/dL</div>
                        <div>Calibration Curve R² = 0.9984 (Validated)</div>
                      </div>
                      <p className="text-[11px] text-zinc-600">
                        Ensure all figures are legible under fluorescent bench lights. Bound with {request.binding} and durable covers.
                      </p>
                    </div>

                    <div className="border-t border-zinc-200 pt-2 flex justify-between items-center text-[10px] font-sans text-zinc-400">
                      <span>Student Hub Document Spooler</span>
                      <span>Page {activePage} of {totalPages}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===================== PRINT SPECIFICATIONS GRID ===================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Paper Size & Specs</span>
              <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 block mt-0.5">
                {request.paperSize}
              </span>
              <span className="text-[11px] text-zinc-500">
                {request.paperSize === 'A1'
                  ? '594 × 841 mm (Wide Format)'
                  : request.paperSize === 'A2'
                  ? '420 × 594 mm (Poster)'
                  : request.paperSize === 'A3'
                  ? '297 × 420 mm (Tabloid)'
                  : '210 × 297 mm (Standard)'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Color & Paper Stock</span>
              <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 block mt-0.5">
                {request.colorMode === 'color' ? 'Full Color (CMYK)' : 'Black & White (Monochrome)'}
              </span>
              <span className="text-[11px] text-zinc-500 capitalize">
                Paper: {request.paperType}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Finishing & Duplex</span>
              <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 block mt-0.5 capitalize">
                {request.binding === 'none' ? 'Loose Sheets' : `${request.binding} Binding`}
              </span>
              <span className="text-[11px] text-zinc-500">
                {request.doubleSided ? 'Double-Sided (Duplex)' : 'Single-Sided (Simplex)'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Quantity & Pages</span>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 block mt-0.5 tabular-nums">
                {request.copies} {request.copies === 1 ? 'Copy' : 'Copies'} ({request.pages} Pages)
              </span>
              <span className="text-[11px] text-zinc-500 font-semibold tabular-nums">
                Total: {request.price} EGP
              </span>
            </div>
          </div>

          {/* Customer Instructions & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Instructions */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 text-xs">
              <span className="font-bold text-zinc-400 uppercase text-[10px] block">
                Student Instructions & Notes:
              </span>
              {request.notes ? (
                <p className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                  "{request.notes}"
                </p>
              ) : (
                <p className="text-zinc-400 italic">No custom notes specified by student.</p>
              )}

              <div className="pt-2 text-zinc-500 space-y-1">
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Pickup Station:</strong>{' '}
                  {request.pickupPoint}
                </div>
                {request.deadline && (
                  <div>
                    <strong className="text-zinc-700 dark:text-zinc-300">Requested Deadline:</strong>{' '}
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {request.deadline}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Details & Contact Actions */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 text-xs">
              <span className="font-bold text-zinc-400 uppercase text-[10px] block">
                Customer Information:
              </span>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {request.customerName}
                </h4>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  {request.university}
                </p>
              </div>

              <div className="space-y-1 text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-mono">{request.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{request.email}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 flex-wrap">
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
                  href={`tel:${request.phone}`}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href={`mailto:${request.email}?subject=Student%20Hub%20Print%20Job%20%23${request.id}`}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* Workflow Timeline */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Print Production Workflow Timeline</span>
            </h4>

            <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {request.timeline && request.timeline.length > 0 ? (
                request.timeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-zinc-900" />
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
                <p className="text-xs text-zinc-400">Submitted on {request.submittedAt}</p>
              )}
            </div>
          </div>

          {/* Private Internal Notes */}
          <div className="p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  Private Plotter & Print Center Notes
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                🔒 Hidden from student
              </span>
            </div>

            <div className="space-y-2">
              {request.internalNotes && request.internalNotes.length > 0 ? (
                request.internalNotes.map((note) => (
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
                  No internal notes yet. Record paper stock calibration, plotter issues, or locker codes.
                </p>
              )}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add private note (e.g. 'Plotter resolution set to 1200 DPI on Roll #3')..."
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

        {/* ===================== CONFIRM STATUS MODAL ===================== */}
        {isChangingStatus && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-scaleUp">
              <div className="flex items-center gap-3 text-indigo-600">
                <AlertCircle className="w-6 h-6" />
                <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                  Update Print Job Workflow
                </h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Are you sure you want to transition job <span className="font-mono font-bold">#{request.id}</span> from{' '}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{request.status}</span> to{' '}
                <span className="font-bold text-indigo-600">{selectedNextStatus}</span>?
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
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
