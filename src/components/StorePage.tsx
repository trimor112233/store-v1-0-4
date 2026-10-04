import React, { useState, useMemo } from 'react';
import { Product, CollegeId } from '../types';
import { useStoreData } from '../context/StoreDataContext';
import { useCollege } from '../context/CollegeContext';
import ProductCard from './ProductCard';
import QuickViewModal from './QuickViewModal';
import {
  SlidersHorizontal,
  X,
  Search,
  ArrowUpDown,
  RotateCcw,
  Check,
  ChevronRight,
  PackageX,
  Sparkles,
  Tag,
  Star,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StorePageProps {
  onSelectProduct: (product: Product) => void;
  initialCollege?: CollegeId;
  initialCategory?: string;
}

export default function StorePage({
  onSelectProduct,
  initialCollege,
  initialCategory,
}: StorePageProps) {
  const { products, categories, subcategories, colleges } = useStoreData();
  const { college: userSelectedCollege, setCollege: setUserSelectedCollege } = useCollege();

  // Primary Hierarchical Filters
  const [selectedCollege, setSelectedCollege] = useState<CollegeId | 'all'>(
    initialCollege || userSelectedCollege || 'all'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

  // Secondary Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [pricePreset, setPricePreset] = useState<'all' | 'under300' | '300to800' | 'above800'>('all');
  const [availability, setAvailability] = useState<'all' | 'in_stock'>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [newArrivalsOnly, setNewArrivalsOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Sorting: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating'
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating'>('popular');

  // Pagination / Load More state
  const [visibleCount, setVisibleCount] = useState(9);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Mobile filters drawer
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Synchronize with external changes
  React.useEffect(() => {
    if (initialCollege !== undefined) {
      setSelectedCollege(initialCollege);
      setSelectedCategory(initialCategory || 'all');
      setSelectedSubcategory('all');
      setVisibleCount(9);
    }
  }, [initialCollege, initialCategory]);

  React.useEffect(() => {
    if (initialCategory !== undefined) {
      setSelectedCategory(initialCategory);
      setSelectedSubcategory('all');
      setVisibleCount(9);
    }
  }, [initialCategory]);

  React.useEffect(() => {
    if (userSelectedCollege && selectedCollege === 'all' && !initialCollege) {
      setSelectedCollege(userSelectedCollege);
    }
  }, [userSelectedCollege]);

  // 1. Dynamic Categories: Strictly filtered by selected College and visibility
  const relevantCategories = useMemo(() => {
    const visibleCats = categories.filter((c) => c.isVisible !== false);
    if (selectedCollege === 'all') {
      return visibleCats;
    }
    return visibleCats.filter((c) => c.collegeId === selectedCollege);
  }, [categories, selectedCollege]);

  // 2. Dynamic Subcategories: Strictly filtered by selected Category
  const relevantSubcategories = useMemo(() => {
    if (selectedCategory === 'all') {
      if (selectedCollege === 'all') return subcategories;
      return subcategories.filter((s) => s.collegeId === selectedCollege);
    }
    return subcategories.filter((s) => s.categoryId === selectedCategory);
  }, [subcategories, selectedCollege, selectedCategory]);

  // Handle College Change
  const handleCollegeChange = (colId: CollegeId | 'all') => {
    setSelectedCollege(colId);
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setVisibleCount(9);
    if (colId !== 'all') {
      setUserSelectedCollege(colId);
    }
  };

  // Handle Category Change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('all');
    setVisibleCount(9);
  };

  // 3. Strict Hierarchical Filtering Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Only active products
        if (!p.active) return false;

        // College filter: Never show products from other colleges when a college is picked!
        if (selectedCollege !== 'all') {
          if (p.collegeId !== selectedCollege) return false;
        }

        // Category filter: Strictly match categoryId
        if (selectedCategory !== 'all') {
          if (p.categoryId !== selectedCategory) return false;
        }

        // Subcategory filter: Strictly match subcategoryId
        if (selectedSubcategory !== 'all') {
          if (p.subcategoryId !== selectedSubcategory) return false;
        }

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTag) return false;
        }

        // Price presets
        if (pricePreset === 'under300' && p.price > 300) return false;
        if (pricePreset === '300to800' && (p.price < 300 || p.price > 800)) return false;
        if (pricePreset === 'above800' && p.price < 800) return false;

        // Availability
        if (availability === 'in_stock' && p.stockStatus === 'out_of_stock') return false;

        // Rating
        if (ratingFilter > 0 && p.rating < ratingFilter) return false;

        // Discounted / On Sale
        if (onSaleOnly && (!p.originalPrice || p.originalPrice <= p.price)) return false;

        // New Arrivals
        if (newArrivalsOnly && !p.isNewArrival) return false;

        // Featured Only
        if (featuredOnly && !p.featured) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        // Default: Popular / Trending / Reviews count
        return (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || b.reviewsCount - a.reviewsCount;
      });
  }, [
    products,
    selectedCollege,
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    pricePreset,
    availability,
    ratingFilter,
    onSaleOnly,
    newArrivalsOnly,
    featuredOnly,
    sortBy,
  ]);

  const activeCollegeObj = colleges.find((c) => c.id === selectedCollege);
  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);
  const activeSubcategoryObj = subcategories.find((s) => s.id === selectedSubcategory);

  const activeFiltersCount =
    (selectedCollege !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedSubcategory !== 'all' ? 1 : 0) +
    (pricePreset !== 'all' ? 1 : 0) +
    (availability !== 'all' ? 1 : 0) +
    (ratingFilter > 0 ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (newArrivalsOnly ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedCollege('all');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSearchQuery('');
    setPricePreset('all');
    setAvailability('all');
    setRatingFilter(0);
    setOnSaleOnly(false);
    setNewArrivalsOnly(false);
    setFeaturedOnly(false);
    setSortBy('popular');
    setVisibleCount(9);
  };

  const paginatedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* 1. Interactive Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-6 flex-wrap">
        <button
          onClick={handleResetFilters}
          className="hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors"
        >
          Store Home
        </button>
        {selectedCollege !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
              }}
              className={`font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {activeCollegeObj?.name}
            </button>
          </>
        )}
        {selectedCategory !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`font-medium transition-colors ${
                selectedSubcategory === 'all'
                  ? 'text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {activeCategoryObj?.name}
            </button>
          </>
        )}
        {selectedSubcategory !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">
              {activeSubcategoryObj?.name}
            </span>
          </>
        )}
      </nav>

      {/* 2. Top Header & Search Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {selectedCategory !== 'all'
              ? activeCategoryObj?.name
              : selectedCollege !== 'all'
              ? `${activeCollegeObj?.name} Store`
              : 'University Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {activeSubcategoryObj
              ? `Showing verified supplies for ${activeSubcategoryObj.name}`
              : activeCategoryObj
              ? `Explore equipment for ${activeCategoryObj.name}`
              : activeCollegeObj
              ? activeCollegeObj.description
              : 'Official university course tools, medical equipment, and student kits.'}
          </p>
        </div>

        {/* Search input in store */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within this catalog..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. College Horizontal Navigation Tabs */}
      <div className="flex items-center gap-1.5 pb-4 mb-6 overflow-x-auto no-scrollbar border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => handleCollegeChange('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCollege === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          All Faculties
        </button>
        {colleges.map((col) => (
          <button
            key={col.id}
            onClick={() => handleCollegeChange(col.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCollege === col.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span>{col.icon}</span>
            <span>{col.name}</span>
          </button>
        ))}
      </div>

      {/* 4. Subcategory Quick Pills (when category is selected) */}
      {relevantSubcategories.length > 0 && selectedCategory !== 'all' && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar text-xs">
          <span className="text-zinc-400 font-medium shrink-0">Subcategory:</span>
          <button
            onClick={() => setSelectedSubcategory('all')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedSubcategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            All in {activeCategoryObj?.name}
          </button>
          {relevantSubcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubcategory(sub.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedSubcategory === sub.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* 5. Main Layout: Left Sidebar Filters (Desktop) + Right Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filters Sidebar (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                <span>Filters</span>
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset ({activeFiltersCount})</span>
                </button>
              )}
            </div>

            {/* Categories for active college */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5">
                {selectedCollege === 'all' ? 'All Categories' : `${activeCollegeObj?.name} Categories`}
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  All Categories
                </button>
                {relevantCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between gap-1 ${
                      selectedCategory === cat.id
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.icon && <span className="text-xs">{cat.icon}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories (when category is selected) */}
            {selectedCategory !== 'all' && relevantSubcategories.length > 0 && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5">
                  Subcategories
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedSubcategory === 'all'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    All Subcategories
                  </button>
                  {relevantSubcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategory(sub.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedSubcategory === sub.id
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Presets */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5">
                Price (EGP)
              </label>
              <div className="space-y-1 text-xs">
                {[
                  { id: 'all', label: 'Any Price' },
                  { id: 'under300', label: 'Under 300 EGP' },
                  { id: '300to800', label: '300 – 800 EGP' },
                  { id: 'above800', label: '800+ EGP' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPricePreset(p.id as any)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      pricePreset === p.id
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Flags & Badges */}
            <div className="space-y-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={availability === 'in_stock'}
                  onChange={(e) => setAvailability(e.target.checked ? 'in_stock' : 'all')}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <span>In Stock Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => setOnSaleOnly(e.target.checked)}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-rose-500" />
                  <span>On Sale / Discounted</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={newArrivalsOnly}
                  onChange={(e) => setNewArrivalsOnly(e.target.checked)}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <span>New Semester Arrivals</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Faculty Endorsed / Featured</span>
              </label>
            </div>

            {/* Minimum Rating */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Student Rating
              </label>
              <div className="flex gap-1.5 text-xs">
                {[0, 4.5, 4.8].map((rt) => (
                  <button
                    key={rt}
                    onClick={() => setRatingFilter(rt)}
                    className={`flex-1 py-1 rounded-lg font-medium border text-center transition-colors ${
                      ratingFilter === rt
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {rt === 0 ? 'All' : `${rt}★+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Grid (9 cols) */}
        <div className="lg:col-span-9">
          {/* Controls Bar: Sort, View Count & Mobile Filter Trigger */}
          <div className="flex items-center justify-between gap-3 mb-6 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginatedProducts.length}</span> of{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{filteredProducts.length}</span> products
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-semibold text-zinc-900 dark:text-zinc-100 border-none focus:outline-none cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xs">
              <PackageX className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                {selectedSubcategory !== 'all'
                  ? `No products found in ${activeCollegeObj?.name || 'this faculty'} > ${activeCategoryObj?.name || ''} > ${activeSubcategoryObj?.name}`
                  : selectedCategory !== 'all'
                  ? `No products found in ${activeCollegeObj?.name || 'this faculty'} > ${activeCategoryObj?.name}`
                  : selectedCollege !== 'all'
                  ? `No products found in ${activeCollegeObj?.name}`
                  : 'No products match your search and filter criteria'}
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
                Try switching categories, clearing the price presets, or searching for other course tools. Unrelated faculty gear will never be displayed here.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={onSelectProduct}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>

              {/* Load More Button / Pagination */}
              {visibleCount < filteredProducts.length && (
                <div className="pt-6 flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => setVisibleCount((c) => c + 6)}
                    className="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs transition-colors"
                  >
                    Load More Products ({filteredProducts.length - visibleCount} remaining)
                  </button>
                  <span className="text-[11px] text-zinc-400">
                    Showing {visibleCount} of {filteredProducts.length} verified items
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFullDetails={(p) => {
          onSelectProduct(p);
        }}
      />

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-zinc-900 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Filter Store</h3>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1 rounded-lg text-zinc-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* College in mobile */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    College
                  </label>
                  <select
                    value={selectedCollege}
                    onChange={(e) => handleCollegeChange(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="all">All Faculties</option>
                    {colleges.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categories in mobile */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="all">All Categories</option>
                    {relevantCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price in mobile */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Price Range
                  </label>
                  <select
                    value={pricePreset}
                    onChange={(e) => setPricePreset(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="all">Any Price</option>
                    <option value="under300">Under 300 EGP</option>
                    <option value="300to800">300 – 800 EGP</option>
                    <option value="above800">800+ EGP</option>
                  </select>
                </div>

                {/* Checkboxes in mobile */}
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={onSaleOnly}
                      onChange={(e) => setOnSaleOnly(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>On Sale Only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newArrivalsOnly}
                      onChange={(e) => setNewArrivalsOnly(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>New Arrivals Only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={availability === 'in_stock'}
                      onChange={(e) => setAvailability(e.target.checked ? 'in_stock' : 'all')}
                      className="rounded text-blue-600"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
                <button
                  onClick={handleResetFilters}
                  className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
