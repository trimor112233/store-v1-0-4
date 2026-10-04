import React, { useState, useEffect } from 'react';
import { useStoreData } from '../context/StoreDataContext';
import { Product, CollegeId } from '../types';
import { Search, X, ArrowRight, Sparkles, Star, PackageCheck, Layers, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectView: (view: string) => void;
  onSelectCollegeFilter?: (collegeId: CollegeId) => void;
  onSelectCategoryFilter?: (categoryId: string) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelectProduct,
  onSelectView,
  onSelectCollegeFilter,
  onSelectCategoryFilter,
}: SearchModalProps) {
  const { products, categories, colleges, kits } = useStoreData();
  const [query, setQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<CollegeId | 'all'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    const matchesCollege = selectedCollege === 'all' || p.collegeId === selectedCollege;
    const matchesQuery =
      !query.trim() ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(query.toLowerCase())) ||
      p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
    return matchesCollege && matchesQuery;
  });

  const filteredKits = kits.filter((k) => {
    const matchesCollege = selectedCollege === 'all' || k.collegeId === selectedCollege;
    const matchesQuery =
      !query.trim() ||
      k.title.toLowerCase().includes(query.toLowerCase()) ||
      k.description.toLowerCase().includes(query.toLowerCase());
    return matchesCollege && matchesQuery;
  });

  const filteredCategories = categories.filter((c) => {
    const matchesCollege = selectedCollege === 'all' || c.collegeId === selectedCollege;
    return query.trim() && c.name.toLowerCase().includes(query.toLowerCase()) && matchesCollege;
  });

  const popularSearches = [
    'Rotring 0.5',
    'T-Square 80cm',
    'Stethoscope',
    'ESP32 IoT',
    'A2 Cutting Mat',
    'Casio FX-991',
    'Lab Coat',
    'Dissection Set',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, student kits, calculators, lab coats, categories..."
            className="flex-1 bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            ESC
          </kbd>
        </div>

        {/* College Filter Tabs */}
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCollege('all')}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedCollege === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            All Faculties
          </button>
          {colleges.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelectedCollege(col.id)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedCollege === col.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{col.icon}</span>
              <span>{col.name}</span>
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Popular Student Searches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Categories */}
          {filteredCategories.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Categories
              </p>
              <div className="grid grid-cols-2 gap-2">
                {filteredCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (onSelectCategoryFilter) onSelectCategoryFilter(c.id);
                      onSelectView('store');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {c.icon} {c.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Student Kits matches */}
          {filteredKits.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Curated Student Kits ({filteredKits.length})
              </p>
              <div className="space-y-2">
                {filteredKits.map((kit) => (
                  <div
                    key={kit.id}
                    onClick={() => {
                      onSelectView('kits');
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg font-bold">
                        🎁
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {kit.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500">
                          {kit.targetYear} · {kit.itemsList.length} items included
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {kit.price} EGP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products matches */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Products ({filteredProducts.length})
            </p>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">
                No products found matching "{query}". Try checking other faculties.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-10 h-10 rounded-lg object-cover bg-zinc-200 dark:bg-zinc-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {product.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                          <span className="capitalize">{product.collegeId}</span>
                          <span>·</span>
                          <span className="truncate">{product.category}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{product.rating}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right pl-3 shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {product.price} EGP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Shortcut */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/70 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Search university supplies, tools, kits and campus services</span>
          <button
            onClick={() => {
              onSelectView('store');
              onClose();
            }}
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Open Full Store Catalog</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
