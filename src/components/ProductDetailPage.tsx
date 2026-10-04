import React, { useState } from 'react';
import { Product } from '../types';
import { useStoreData } from '../context/StoreDataContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  Star,
  Heart,
  ShoppingBag,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductDetailPage({
  product,
  onBack,
  onSelectProduct,
}: ProductDetailPageProps) {
  const { products } = useStoreData();
  const { addProductToCart, setIsCartOpen } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);

  const wishlisted = isWishlisted(product.id);

  // Gallery images (main + variation thumbnails)
  const galleryImages = [
    product.image,
    'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
  ];

  const relatedProducts = products
    .filter((p) => p.active && p.id !== product.id && p.collegeId === product.collegeId)
    .slice(0, 4);

  const handleInstantBuy = () => {
    addProductToCart(product, quantity);
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Breadcrumb / Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main PDP Grid: Left Sticky Gallery, Right Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        {/* Left: Gallery Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80';
              }}
            />
            {product.trending && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-md bg-zinc-900/90 text-white text-xs font-semibold backdrop-blur-xs">
                Trending on Campus
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-colors ${
                wishlisted
                  ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/80'
                  : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails row */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  activeImage === img
                    ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Contiguous Purchase Module (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {product.category}
            </span>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{product.rating}</span>
              <span className="text-zinc-400">({product.reviewsCount} student reviews)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">
            {product.title}
          </h1>

          {/* Price Block */}
          <div className="flex items-baseline gap-3 mb-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tabular-nums">
              {product.price}
            </span>
            <span className="text-base font-semibold text-zinc-500 dark:text-zinc-400">EGP</span>
            {product.originalPrice && (
              <>
                <span className="text-base text-zinc-400 line-through tabular-nums">
                  {product.originalPrice} EGP
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 ml-auto">
                  Save {product.originalPrice - product.price} EGP
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Quantity and Actions */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm tabular-nums text-zinc-900 dark:text-zinc-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => addProductToCart(product, quantity)}
                className="flex-1 py-3 px-5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart ({product.price * quantity} EGP)</span>
              </button>
            </div>

            <button
              onClick={handleInstantBuy}
              className="w-full py-3 px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold shadow-xs transition-colors"
            >
              Express Campus Order (Pay on Delivery)
            </button>
          </div>

          {/* Campus Delivery Guarantee Card */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Campus Gate & Dorm Delivery (1–2 Days)
                </span>
                <span>Direct delivery to Cairo, Ain Shams, GUC, AUC, Alex & Mansoura campuses.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Verified Academic Standard
                </span>
                <span>Complies with Egyptian faculty syllabi & practical lab requirements.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  14-Day Free Campus Exchange
                </span>
                <span>Swap defective items directly at your faculty delivery point.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-10 mb-16">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Technical Specifications
        </h2>
        <div className="max-w-3xl rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} className="grid grid-cols-3 p-3.5 text-xs sm:text-sm">
                <span className="font-medium text-zinc-500 dark:text-zinc-400">{key}</span>
                <span className="col-span-2 font-semibold text-zinc-900 dark:text-zinc-100">
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Recommended with this item
            </h2>
            <button
              onClick={onBack}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View More
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="cursor-pointer group p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-all"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full aspect-4/3 rounded-lg object-cover mb-3"
                />
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {p.title}
                </h4>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {p.price} EGP
                  </span>
                  <span className="text-[11px] text-zinc-500">{p.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
