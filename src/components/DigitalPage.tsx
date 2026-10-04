import React, { useState } from 'react';
import { DigitalProduct } from '../types';
import { useStoreData } from '../context/StoreDataContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  FileCode,
  Download,
  Check,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

export default function DigitalPage() {
  const { digitalProducts } = useStoreData();
  const { addToCart } = useCart();
  const { success } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const activeDigitalProducts = digitalProducts.filter((p) => p.active !== false);

  const handleInstantDownload = (prod: DigitalProduct) => {
    setDownloadingId(prod.id);
    setTimeout(() => {
      setDownloadingId(null);
      success('Instant Access Granted!', `License key & download link sent for ${prod.title.slice(0, 30)}...`);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs font-semibold text-purple-700 dark:text-purple-300 mb-3 shadow-xs">
          <FileCode className="w-3.5 h-3.5" />
          <span>Curated Academic Templates</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
          Digital Products & Study Systems
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Notion study dashboards, parametric AutoCAD blocks, medical flashcard decks, and Overleaf LaTeX thesis templates built for academic excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {activeDigitalProducts.map((item) => (
          <div
            key={item.id}
            className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
          >
            {/* Top Row: File Type & Downloads */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                {item.fileType}
              </span>
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                <span>{item.downloadsCount} student downloads</span>
              </span>
            </div>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {item.title}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              {item.description}
            </p>

            {/* Features check list */}
            <div className="space-y-2 mb-6 flex-1 bg-zinc-50/60 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                What's included:
              </p>
              {item.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4 mt-auto">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {item.price}
                  </span>
                  <span className="text-xs font-semibold text-zinc-500">EGP</span>
                </div>
                <span className="text-[10px] text-zinc-400 block">{item.size} · Instant Delivery</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleInstantDownload(item)}
                  disabled={downloadingId === item.id}
                  className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {downloadingId === item.id ? 'Generating Key...' : 'Instant Preview'}
                </button>
                <button
                  onClick={() =>
                    addToCart({
                      id: item.id,
                      type: 'digital',
                      title: item.title,
                      price: item.price,
                      quantity: 1,
                      category: 'Digital Resource',
                    })
                  }
                  className="py-2.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
