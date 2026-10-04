import React, { useState } from 'react';
import { universityCampuses } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  Printer,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

export default function PrintingPage() {
  const { addToCart } = useCart();
  const { success } = useToast();

  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'A2' | 'A1'>('A4');
  const [colorMode, setColorMode] = useState<'bw' | 'color'>('bw');
  const [paperType, setPaperType] = useState<'80gsm' | '120gsm' | '250gsm' | 'tracing' | 'glossy'>('80gsm');
  const [binding, setBinding] = useState<'none' | 'staple' | 'spiral' | 'thermal' | 'hardcover'>('spiral');
  const [pages, setPages] = useState<number>(35);
  const [copies, setCopies] = useState<number>(1);
  const [selectedPickup, setSelectedPickup] = useState(universityCampuses[0]);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>({
    name: 'Graduation_Project_Final_Draft_v2.pdf',
    size: '14.2 MB',
  });
  const [specialNotes, setSpecialNotes] = useState('');

  // Live price calculation formula
  const getUnitPagePrice = () => {
    let base = 0;
    if (paperSize === 'A4') base = colorMode === 'bw' ? 0.75 : 3.5;
    else if (paperSize === 'A3') base = colorMode === 'bw' ? 2.5 : 8.0;
    else if (paperSize === 'A2') base = colorMode === 'bw' ? 15.0 : 35.0;
    else if (paperSize === 'A1') base = colorMode === 'bw' ? 30.0 : 65.0;

    // Paper type surcharge
    if (paperType === '120gsm') base += 0.5;
    if (paperType === '250gsm') base += 2.0;
    if (paperType === 'tracing') base += 3.0; // كلك
    if (paperType === 'glossy') base += 4.0;

    return base;
  };

  const getBindingPrice = () => {
    switch (binding) {
      case 'staple':
        return 3;
      case 'spiral':
        return 18;
      case 'thermal':
        return 30;
      case 'hardcover':
        return 110;
      default:
        return 0;
    }
  };

  const pagesCost = getUnitPagePrice() * pages * copies;
  const bindingCost = getBindingPrice() * copies;
  const totalCost = Math.round(pagesCost + bindingCost);

  const handleAddPrintingToCart = () => {
    addToCart({
      id: `print-${Date.now()}`,
      type: 'printing',
      title: `Campus Print: ${uploadedFile ? uploadedFile.name : `${paperSize} Document`} (${pages} pages, ${copies}x)`,
      price: totalCost,
      quantity: 1,
      category: 'Printing & Binding',
      details: {
        'Size': paperSize,
        'Color': colorMode === 'bw' ? 'Black & White' : 'Full Color',
        'Paper': paperType,
        'Binding': binding,
        'Pickup': selectedPickup,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3 shadow-xs">
          <Printer className="w-3.5 h-3.5" />
          <span>Express Campus Print & Plotting Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
          University Printing Services
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Upload your lectures, engineering CAD blueprints, lab manuals or graduation theses. Pick up directly at your faculty gate or library desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left Column: Interactive Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* File Upload Dropzone */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center hover:border-blue-500 transition-colors">
            {uploadedFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-zinc-500">{uploadedFile.size} · PDF Ready</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-xs text-rose-500 hover:underline font-semibold"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  Upload PDF, Word or DWG File
                </h4>
                <p className="text-xs text-zinc-500 mb-4">
                  Drag and drop your file here or click to browse (Max 150MB)
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setUploadedFile({
                      name: 'Architecture_Presentation_Boards_A1.pdf',
                      size: '28.4 MB',
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                >
                  Simulate File Upload
                </button>
              </div>
            )}
          </div>

          {/* Configuration Options */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
            {/* Paper Size */}
            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                1. Select Paper Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'A4', label: 'A4 Standard', desc: 'Lectures & Theses' },
                  { id: 'A3', label: 'A3 Double', desc: 'Drawings & Sheets' },
                  { id: 'A2', label: 'A2 Plotter', desc: 'Studio Projects' },
                  { id: 'A1', label: 'A1 Blueprint', desc: 'Architectural Boards' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPaperSize(s.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paperSize === s.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-500'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                    }`}
                  >
                    <div className="text-sm font-bold">{s.label}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Mode */}
            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                2. Color Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setColorMode('bw')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    colorMode === 'bw'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-500'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-sm font-bold">Black & White (B&W)</div>
                  <div className="text-[11px] text-zinc-500">Economy 0.75 EGP/page</div>
                </button>
                <button
                  type="button"
                  onClick={() => setColorMode('color')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    colorMode === 'color'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-500'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-sm font-bold">Full High-Resolution Color</div>
                  <div className="text-[11px] text-zinc-500">Laser 3.50 EGP/page</div>
                </button>
              </div>
            </div>

            {/* Paper Type */}
            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                3. Paper Stock
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: '80gsm', label: '80 GSM Standard', sub: 'Regular bond' },
                  { id: '120gsm', label: '120 GSM Heavyweight', sub: '+0.50 EGP' },
                  { id: '250gsm', label: '250 GSM Cardstock', sub: '+2.00 EGP' },
                  { id: 'tracing', label: 'Tracing Paper (الكلك)', sub: '+3.00 EGP' },
                  { id: 'glossy', label: 'Glossy Photographic', sub: '+4.00 EGP' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaperType(p.id as any)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      paperType === p.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-[10px] text-zinc-500">{p.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Binding */}
            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                4. Binding Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'none', label: 'No Binding', price: 'Free' },
                  { id: 'staple', label: 'Corner Staple', price: '3 EGP' },
                  { id: 'spiral', label: 'Plastic Spiral Wire', price: '18 EGP' },
                  { id: 'hardcover', label: 'Hardcover Thesis', price: '110 EGP' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBinding(b.id as any)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      binding === b.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="font-semibold">{b.label}</div>
                    <div className="text-[10px] text-zinc-500">{b.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pages & Copies Steppers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Document Pages Count
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={pages}
                  onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Number of Copies
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Campus Pickup */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Faculty Pickup Point
              </label>
              <select
                value={selectedPickup}
                onChange={(e) => setSelectedPickup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
              >
                {universityCampuses.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Live Summary & Cost Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Print Job Estimation
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Selected Paper:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {paperSize} ({paperType})
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Print Mode:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {colorMode === 'bw' ? 'Black & White' : 'Full Laser Color'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Binding:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                  {binding}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Volume:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {pages} pages × {copies} {copies === 1 ? 'copy' : 'copies'}
                </span>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
                <div className="flex justify-between text-zinc-500">
                  <span>Printing Cost</span>
                  <span className="tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                    {pagesCost.toFixed(2)} EGP
                  </span>
                </div>
                {bindingCost > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Binding Cost</span>
                    <span className="tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                      {bindingCost.toFixed(2)} EGP
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                  <span>Estimated Total</span>
                  <span className="text-xl tabular-nums">{totalCost} EGP</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddPrintingToCart}
              className="w-full py-3 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Print Order to Cart ({totalCost} EGP)</span>
            </button>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Turnaround Time: 2 to 4 Hours</span>
              </div>
              <p>Submitted orders before 12:00 PM are printed and available at your campus pickup gate on the same day.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
