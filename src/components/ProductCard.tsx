import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { collegesData } from '../data/mockData';
import { Star, Heart, ShoppingBag, Eye, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onSelectProduct, onQuickView }: ProductCardProps) {
  const { addProductToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const collegeObj = collegesData.find((c) => c.id === product.collegeId);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockStatus === 'out_of_stock') return;
    addProductToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative flex flex-col rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl transition-shadow duration-300"
    >
      {/* Product Image Frame */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative w-full aspect-4/3 overflow-hidden bg-zinc-100 dark:bg-zinc-800/80 cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold tracking-wide shadow-xs animate-pulse">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold tracking-wide shadow-xs">
              NEW
            </span>
          )}
          {product.trending && !discountPercent && !product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-md bg-zinc-900/90 text-white text-[10px] font-bold tracking-wide backdrop-blur-xs">
              TRENDING
            </span>
          )}
        </div>

        {/* Action Buttons Top Right: Quick View & Wishlist */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <motion.button
            whileTap={{ scale: 0.75 }}
            whileHover={{ scale: 1.15 }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-colors shadow-xs ${
              wishlisted
                ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/90 dark:text-rose-400'
                : 'bg-white/85 dark:bg-zinc-900/85 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 hover:bg-white dark:hover:bg-zinc-900'
            }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <motion.div animate={wishlisted ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current text-rose-500' : ''}`} />
            </motion.div>
          </motion.button>

          {onQuickView && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2 rounded-full bg-white/85 dark:bg-zinc-900/85 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 hover:bg-white dark:hover:bg-zinc-900 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Low Stock / Out of Stock Banner */}
        {product.stockStatus === 'low_stock' && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-amber-500/90 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1 shadow-xs">
            <AlertCircle className="w-3 h-3" />
            <span>Only {product.stock} left in stock</span>
          </div>
        )}
        {product.stockStatus === 'out_of_stock' && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-lg bg-zinc-950/90 text-white text-xs font-bold uppercase tracking-wider border border-white/20 shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-4">
        {/* Unboxed category metadata with dot separator */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
          <span className="font-semibold text-blue-600 dark:text-blue-400 truncate">
            {collegeObj?.name || 'General'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-medium truncate">{product.category}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-0.5 text-amber-500 shrink-0 font-medium ml-auto">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-zinc-700 dark:text-zinc-300 ml-0.5">{product.rating}</span>
            <span className="text-zinc-400">({product.reviewsCount})</span>
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelectProduct(product)}
          className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer mb-1.5"
        >
          {product.title}
        </h3>

        {/* Short description */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Bottom row: Price & Add to Cart button */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                {product.price}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">EGP</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-zinc-400 line-through tabular-nums ml-1">
                  {product.originalPrice}
                </span>
              )}
            </div>
            {product.stockStatus === 'out_of_stock' ? (
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block">
                Currently Out of Stock
              </span>
            ) : product.stockStatus === 'low_stock' ? (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium block">
                Low Stock · Only {product.stock} left
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                In Stock · Campus delivery
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={product.stockStatus !== 'out_of_stock' ? { scale: 1.04 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            disabled={product.stockStatus === 'out_of_stock'}
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : product.stockStatus === 'out_of_stock'
                ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 animate-bounce" />
                <span>Added</span>
              </>
            ) : product.stockStatus === 'out_of_stock' ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
