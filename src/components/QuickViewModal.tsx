import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { collegesData } from '../data/mockData';
import {
  X,
  Star,
  Heart,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Plus,
  Minus,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFullDetails: (product: Product) => void;
}

export default function QuickViewModal({ product, onClose, onViewFullDetails }: QuickViewModalProps) {
  const { addProductToCart, setIsCartOpen } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);
  const collegeObj = collegesData.find((c) => c.id === product.collegeId);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    addProductToCart(product, quantity);
  };

  const handleInstantBuy = () => {
    addProductToCart(product, quantity);
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 z-20 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Product Image */}
        <div className="md:w-1/2 relative bg-zinc-100 dark:bg-zinc-800/80 min-h-[260px] md:min-h-full">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {discountPercent && (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-rose-600 text-white text-xs font-bold shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}

          <button
            onClick={() => toggleWishlist(product.id)}
            className={`absolute top-3 right-12 md:right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
              wishlisted
                ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/80'
                : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* College & Department Breadcrumb Tag */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {collegeObj?.name || 'General'}
              </span>
              <span>·</span>
              <span className="truncate">{product.category}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
              {product.title}
            </h3>

            {/* Rating & Stock Status */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{product.rating}</span>
                <span className="text-zinc-400">({product.reviewsCount} reviews)</span>
              </div>

              {product.stockStatus === 'in_stock' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>In Stock</span>
                </span>
              )}
              {product.stockStatus === 'low_stock' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>Only {product.stock} left</span>
                </span>
              )}
              {product.stockStatus === 'out_of_stock' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Price Block */}
            <div className="flex items-baseline gap-2 mb-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tabular-nums">
                {product.price}
              </span>
              <span className="text-xs font-semibold text-zinc-500">EGP</span>
              {product.originalPrice && (
                <span className="text-xs text-zinc-400 line-through tabular-nums ml-1">
                  {product.originalPrice} EGP
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 line-clamp-3">
              {product.description}
            </p>

            {/* Quick Specs Snapshot */}
            <div className="space-y-1 text-[11px] text-zinc-500 mb-6 bg-zinc-50/50 dark:bg-zinc-800/30 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
              {Object.entries(product.specs).slice(0, 2).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              {/* Quantity */}
              <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 p-0.5">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-xs tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.stockStatus === 'out_of_stock'}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart ({product.price * quantity} EGP)</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleInstantBuy}
                disabled={product.stockStatus === 'out_of_stock'}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Buy Now (Cash on Delivery)
              </button>

              <button
                onClick={() => {
                  onClose();
                  onViewFullDetails(product);
                }}
                className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
              >
                <span>Full Page</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 pt-1">
              <Truck className="w-3 h-3 text-blue-500" />
              <span>Campus Delivery in 24–48 Hours</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
