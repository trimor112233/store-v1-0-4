import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useStoreData } from '../context/StoreDataContext';
import { Product } from '../types';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistPageProps {
  onSelectProduct: (product: Product) => void;
  onNavigateToStore: () => void;
}

export default function WishlistPage({ onSelectProduct, onNavigateToStore }: WishlistPageProps) {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const { addProductToCart } = useCart();
  const { products } = useStoreData();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveAllToCart = () => {
    wishlistedProducts.forEach((p) => addProductToCart(p));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            My Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Saved equipment, textbooks, kits and stationery for upcoming semesters.
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={clearWishlist}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleMoveAllToCart}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add All to Cart</span>
            </button>
          </div>
        )}
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="py-24 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1">
            Your wishlist is empty
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
            Click the heart icon on any tool, diagnostic instrument or kit to save it for your next exam or semester.
          </p>
          <button
            onClick={onNavigateToStore}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5"
          >
            <span>Browse Student Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistedProducts.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div
                onClick={() => onSelectProduct(p)}
                className="relative aspect-4/3 bg-zinc-100 dark:bg-zinc-800 cursor-pointer overflow-hidden"
              >
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(p.id);
                  }}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 text-rose-500 hover:bg-white"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {p.category}
                  </span>
                  <h4
                    onClick={() => onSelectProduct(p)}
                    className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 mt-1 hover:text-blue-600 cursor-pointer"
                  >
                    {p.title}
                  </h4>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between mt-4">
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {p.price} EGP
                  </span>
                  <button
                    onClick={() => addProductToCart(p)}
                    className="py-1.5 px-3 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
