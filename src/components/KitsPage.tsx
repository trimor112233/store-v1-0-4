import React, { useState } from 'react';
import { useStoreData } from '../context/StoreDataContext';
import { StudentKit, CollegeId } from '../types';
import { useCart } from '../context/CartContext';
import { useCollege } from '../context/CollegeContext';
import {
  PackageCheck,
  Check,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function KitsPage() {
  const { kits, colleges } = useStoreData();
  const { addKitToCart } = useCart();
  const { college } = useCollege();

  const [selectedFilter, setSelectedFilter] = useState<CollegeId | 'all'>('all');
  const [activeUnpackKit, setActiveUnpackKit] = useState<StudentKit | null>(null);

  const filteredKits = kits.filter(
    (kit) => (selectedFilter === 'all' || kit.collegeId === selectedFilter) && (kit.active !== false)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3 shadow-xs">
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Curated Faculty Bundles</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
          University Student Kits
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Complete, verified course gear curated with university professors and senior students. Everything you need for the academic year in a single bundle, discounted up to 25%.
        </p>
      </div>

      {/* College Filter Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedFilter === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          All Faculty Kits
        </button>
        {colleges.slice(0, 5).map((col) => (
          <button
            key={col.id}
            onClick={() => setSelectedFilter(col.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === col.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <span>{col.icon}</span>
            <span>{col.name}</span>
          </button>
        ))}
      </div>

      {/* Kits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {filteredKits.map((kit) => (
          <div
            key={kit.id}
            className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
          >
            {/* Image Header with Savings Tag */}
            <div className="relative aspect-16/9 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <img
                src={kit.image}
                alt={kit.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80';
                }}
              />
              {kit.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-zinc-900/90 text-white text-xs font-semibold backdrop-blur-xs">
                  {kit.badge}
                </span>
              )}
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold shadow-xs">
                Save {kit.savings} EGP Bundle Discount
              </span>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{kit.targetYear}</span>
                <span>·</span>
                <span>{kit.itemsList.length} verified items included</span>
              </div>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                {kit.title}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                {kit.description}
              </p>

              {/* Kit Preview Items (first 4 items preview) */}
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 mb-6">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                  Included in this bundle:
                </p>
                <div className="space-y-1.5">
                  {kit.itemsList.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="text-sm shrink-0">{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                      <span className="ml-auto text-[11px] font-mono text-zinc-400 shrink-0">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                  {kit.itemsList.length > 4 && (
                    <button
                      onClick={() => setActiveUnpackKit(kit)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1 inline-flex items-center gap-1"
                    >
                      <span>+ {kit.itemsList.length - 4} more items inside... View full contents</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Price & Actions Bottom */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-auto flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tabular-nums">
                      {kit.price}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">EGP</span>
                    <span className="text-xs text-zinc-400 line-through tabular-nums">
                      {kit.originalPrice} EGP
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Free Campus Delivery Included
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveUnpackKit(kit)}
                    className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Unpack Kit
                  </button>
                  <button
                    onClick={() => addKitToCart(kit)}
                    className="py-2.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add Kit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unpack Modal */}
      <AnimatePresence>
        {activeUnpackKit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveUnpackKit(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-50">
                    Kit Contents: {activeUnpackKit.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {activeUnpackKit.itemsList.length} guaranteed components
                  </p>
                </div>
                <button
                  onClick={() => setActiveUnpackKit(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-zinc-100 dark:divide-zinc-800 space-y-2">
                {activeUnpackKit.itemsList.map((item, idx) => (
                  <div key={idx} className="pt-2 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        Meets Faculty Syllabus Standard
                      </p>
                    </div>
                    <span className="text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                      Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {activeUnpackKit.price} EGP
                  </div>
                  <span className="text-[11px] text-emerald-600">Save {activeUnpackKit.savings} EGP</span>
                </div>
                <button
                  onClick={() => {
                    addKitToCart(activeUnpackKit);
                    setActiveUnpackKit(null);
                  }}
                  className="py-2.5 px-5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs shadow-xs hover:bg-zinc-800 transition-colors flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Entire Kit to Cart</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
