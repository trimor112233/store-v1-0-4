import React, { useState, useEffect } from 'react';
import { Product, CollegeId, StockStatus, ProductType, Category, Subcategory, College } from '../types';
import {
  X,
  Save,
  Copy,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Tag,
  Layers,
  Sparkles,
  Eye,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Percent,
} from 'lucide-react';

interface AdminProductEditorModalProps {
  isOpen: boolean;
  product: Product | null; // null means adding a new product
  onClose: () => void;
  onSave: (productData: Partial<Product>, isNew: boolean) => void;
  onDuplicate?: (product: Product) => void;
  categories: Category[];
  subcategories: Subcategory[];
  colleges: College[];
  allProducts: Product[];
}

export default function AdminProductEditorModal({
  isOpen,
  product,
  onClose,
  onSave,
  onDuplicate,
  categories,
  subcategories,
  colleges,
  allProducts,
}: AdminProductEditorModalProps) {
  if (!isOpen) return null;

  // Active Tab inside modal: 'general' | 'pricing' | 'images' | 'variants' | 'options' | 'preview'
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'images' | 'variants' | 'options' | 'preview'>('general');

  // Form Fields
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [sku, setSku] = useState('');
  const [collegeId, setCollegeId] = useState<CollegeId>('engineering');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [productType, setProductType] = useState<ProductType>('Physical');
  const [price, setPrice] = useState<number>(100);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState<number>(20);
  const [stockStatus, setStockStatus] = useState<StockStatus>('in_stock');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [disableWhenOutOfStock, setDisableWhenOutOfStock] = useState(false);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Media (Main image + Gallery)
  const [image, setImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Variants (Sizes, Colors, Materials)
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [materials, setMaterials] = useState<string[]>([]);
  const [materialInput, setMaterialInput] = useState('');

  // Customization Options
  const [customizationOptions, setCustomizationOptions] = useState<string[]>([]);
  const [customOptInput, setCustomOptInput] = useState('');

  // Visibility & Badges
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  // Initialize or populate from product
  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setTitleAr(product.titleAr || '');
      setSku(product.sku || product.id);
      setCollegeId(product.collegeId || 'engineering');
      setCategoryId(product.categoryId || categories[0]?.id || '');
      setSubcategoryId(product.subcategoryId || '');
      setProductType(product.productType || 'Physical');
      setPrice(product.price || 0);
      setOriginalPrice(product.originalPrice);
      setStock(product.stock !== undefined ? product.stock : 20);
      setStockStatus(product.stockStatus || (product.stock === 0 ? 'out_of_stock' : 'in_stock'));
      setLowStockThreshold(product.lowStockThreshold || 5);
      setDisableWhenOutOfStock(!!product.disableWhenOutOfStock);
      setIsPreOrder(!!product.isPreOrder);
      setDescription(product.description || '');
      setTags(product.tags || []);
      setImage(product.image || '');
      setGalleryImages(product.images || []);
      setSizes(product.variants?.sizes || []);
      setColors(product.variants?.colors || []);
      setMaterials(product.variants?.materials || []);
      setCustomizationOptions(product.customizationOptions || []);
      setActive(product.active !== undefined ? product.active : true);
      setFeatured(!!product.featured);
      setTrending(!!product.trending);
      setIsNewArrival(!!product.isNewArrival);
    } else {
      // New Product Defaults
      setTitle('');
      setTitleAr('');
      setSku(`SKU-${Date.now().toString().slice(-6)}`);
      setCollegeId('engineering');
      const defCat = categories.find((c) => c.collegeId === 'engineering') || categories[0];
      setCategoryId(defCat?.id || '');
      const defSub = subcategories.find((s) => s.categoryId === defCat?.id);
      setSubcategoryId(defSub?.id || '');
      setProductType('Physical');
      setPrice(150);
      setOriginalPrice(180);
      setStock(25);
      setStockStatus('in_stock');
      setLowStockThreshold(5);
      setDisableWhenOutOfStock(false);
      setIsPreOrder(false);
      setDescription('');
      setTags(['University', 'Faculty Essential']);
      setImage('https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80');
      setGalleryImages([]);
      setSizes([]);
      setColors([]);
      setMaterials([]);
      setCustomizationOptions([]);
      setActive(true);
      setFeatured(false);
      setTrending(false);
      setIsNewArrival(true);
    }
  }, [product, categories, subcategories]);

  // Update subcategories dropdown when category changes
  const availableSubcategories = subcategories.filter((s) => s.categoryId === categoryId);

  // Discount calculation
  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  // Tag helper
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  // Image helpers
  const handleAddGalleryImage = () => {
    if (!newImageUrl.trim()) return;
    setGalleryImages([...galleryImages, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  const handleSetMainImage = (url: string) => {
    setImage(url);
  };

  // Variant Helpers
  const handleAddSize = () => {
    if (!sizeInput.trim()) return;
    if (!sizes.includes(sizeInput.trim())) setSizes([...sizes, sizeInput.trim()]);
    setSizeInput('');
  };

  const handleAddColor = () => {
    if (!colorInput.trim()) return;
    if (!colors.includes(colorInput.trim())) setColors([...colors, colorInput.trim()]);
    setColorInput('');
  };

  const handleAddMaterial = () => {
    if (!materialInput.trim()) return;
    if (!materials.includes(materialInput.trim())) setMaterials([...materials, materialInput.trim()]);
    setMaterialInput('');
  };

  const handleAddCustomOpt = () => {
    if (!customOptInput.trim()) return;
    if (!customizationOptions.includes(customOptInput.trim())) {
      setCustomizationOptions([...customizationOptions, customOptInput.trim()]);
    }
    setCustomOptInput('');
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedCat = categories.find((c) => c.id === categoryId);
    const finalStock = stockStatus === 'out_of_stock' ? 0 : Number(stock);
    const computedStatus =
      finalStock === 0
        ? 'out_of_stock'
        : finalStock <= Number(lowStockThreshold)
        ? 'low_stock'
        : 'in_stock';

    const payload: Partial<Product> = {
      title: title.trim(),
      titleAr: titleAr.trim() || undefined,
      sku: sku.trim() || undefined,
      collegeId,
      categoryId,
      subcategoryId,
      category: matchedCat?.name || 'General',
      productType,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: finalStock,
      stockStatus: computedStatus,
      inStock: finalStock > 0 || isPreOrder,
      lowStockThreshold: Number(lowStockThreshold),
      disableWhenOutOfStock,
      isPreOrder,
      description: description.trim(),
      tags,
      image: image.trim(),
      images: galleryImages,
      active,
      featured,
      trending,
      isNewArrival,
      variants: {
        sizes,
        colors,
        materials,
      },
      customizationOptions,
    };

    onSave(payload, !product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/80 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {product ? '✏️' : '✨'}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {product ? `Edit Product: ${product.title}` : 'Add New Product to Catalog'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {product ? `Editing product ID: ${product.id} (Updates in-place)` : 'Create a new course item for students'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {product && onDuplicate && (
              <button
                type="button"
                onClick={() => {
                  onDuplicate(product);
                  onClose();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Duplicate this product with a new ID"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 no-scrollbar">
          {[
            { id: 'general', label: '1. General & Faculty' },
            { id: 'pricing', label: '2. Price & Inventory' },
            { id: 'images', label: '3. Media & Gallery' },
            { id: 'variants', label: '4. Variants & Options' },
            { id: 'options', label: '5. Badges & Visibility' },
            { id: 'preview', label: '6. Live Card Preview' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          {/* TAB 1: GENERAL & FACULTY */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                    Product Title (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Rotring Isograph Technical Drawing Pen Set"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                    Product Title (Arabic)
                  </label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: طقم أقلام تحبير هندسية روترنج إيزوجراف"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-right"
                    style={{ direction: 'rtl' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">SKU / Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-10294"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Target Faculty</label>
                  <select
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value as CollegeId)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold"
                  >
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Product Type</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as ProductType)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold"
                  >
                    <option value="Physical">Physical Gear / Equipment</option>
                    <option value="Digital">Digital Resource</option>
                    <option value="Kit">Curated Course Kit</option>
                    <option value="Service">Campus Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      const matchingSubs = subcategories.filter((s) => s.categoryId === e.target.value);
                      setSubcategoryId(matchingSubs[0]?.id || '');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.collegeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Subcategory</label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    <option value="">None / General</option>
                    {availableSubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Detailed Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Official faculty specifications, manufacturer details, syllabus course compatibility..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Search Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type tag and press Add or Enter..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-semibold"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]"
                    >
                      <Tag className="w-3 h-3 text-zinc-400" />
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                        className="text-zinc-400 hover:text-rose-500 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & INVENTORY */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                  <div className="font-bold text-zinc-700 dark:text-zinc-300 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                    Pricing Settings (EGP)
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">
                      Selling Price (EGP) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-bold tabular-nums rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-semibold">Original Price (Strike-through)</label>
                      {discountPercent > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          -{discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={originalPrice || ''}
                      onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Leave empty if not discounted"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                  <div className="font-bold text-zinc-700 dark:text-zinc-300 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                    Stock & Availability Controls
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        min={0}
                        value={stock}
                        onChange={(e) => setStock(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Stock Status</label>
                      <select
                        value={stockStatus}
                        onChange={(e) => {
                          const st = e.target.value as StockStatus;
                          setStockStatus(st);
                          if (st === 'out_of_stock') setStock(0);
                        }}
                        className="w-full px-2 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Low-Stock Alert Threshold</label>
                    <input
                      type="number"
                      min={1}
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={disableWhenOutOfStock}
                        onChange={(e) => setDisableWhenOutOfStock(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span>Auto-disable purchasing when stock reaches 0</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-amber-700 dark:text-amber-400">
                      <input
                        type="checkbox"
                        checked={isPreOrder}
                        onChange={(e) => setIsPreOrder(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                      />
                      <span>Enable Pre-Order mode (Allow ordering even if out of stock)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & GALLERY */}
          {activeTab === 'images' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Primary Display Image URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                  />
                  {image && (
                    <img
                      src={image}
                      alt="Primary preview"
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 bg-zinc-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Gallery Images List */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                <div className="font-bold text-zinc-700 dark:text-zinc-300 pb-1 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                  <span>Additional Product Gallery Images ({galleryImages.length})</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Paste additional image URL..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Gallery</span>
                  </button>
                </div>

                {galleryImages.length === 0 ? (
                  <p className="text-zinc-400 italic py-2">No additional gallery photos added yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {galleryImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 space-y-1.5"
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery ${idx}`}
                          className="w-full h-24 rounded-lg object-cover bg-zinc-100"
                        />
                        <div className="flex items-center justify-between gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(imgUrl)}
                            className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            title="Set this photo as the primary image"
                          >
                            Set Main
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="text-zinc-400 hover:text-rose-500 p-1"
                            title="Delete this image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: VARIANTS & CUSTOMIZATION */}
          {activeTab === 'variants' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Sizes */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
                <label className="block font-bold text-zinc-700 dark:text-zinc-300">Available Sizes / Dimensions</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSize();
                      }
                    }}
                    placeholder="e.g. S, M, L, XL or A4, A3, 0.5mm..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                  <button type="button" onClick={handleAddSize} className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-semibold">
                    Add Size
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold flex items-center gap-1">
                      {s}
                      <button type="button" onClick={() => setSizes(sizes.filter((_, i) => i !== idx))} className="text-zinc-400 hover:text-rose-500">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
                <label className="block font-bold text-zinc-700 dark:text-zinc-300">Available Colors</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                    placeholder="e.g. Matte Black, Classic Navy, Silver..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                  <button type="button" onClick={handleAddColor} className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-semibold">
                    Add Color
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {colors.map((c, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-semibold flex items-center gap-1">
                      {c}
                      <button type="button" onClick={() => setColors(colors.filter((_, i) => i !== idx))} className="text-blue-400 hover:text-rose-500">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
                <label className="block font-bold text-zinc-700 dark:text-zinc-300">Materials / Build Specifications</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMaterial();
                      }
                    }}
                    placeholder="e.g. 100% Egyptian Cotton, Anodized Aluminum..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                  <button type="button" onClick={handleAddMaterial} className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-semibold">
                    Add Material
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {materials.map((m, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[11px] font-semibold flex items-center gap-1">
                      {m}
                      <button type="button" onClick={() => setMaterials(materials.filter((_, i) => i !== idx))} className="text-zinc-400 hover:text-rose-500">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Customization Options */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
                <label className="block font-bold text-zinc-700 dark:text-zinc-300">Customization Fields for Customers</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customOptInput}
                    onChange={(e) => setCustomOptInput(e.target.value)}
                    placeholder="e.g. Laser Name Engraving, Faculty Badge Selection..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                  <button type="button" onClick={handleAddCustomOpt} className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-semibold">
                    Add Option
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {customizationOptions.map((opt, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[11px] font-semibold flex items-center gap-1">
                      {opt}
                      <button type="button" onClick={() => setCustomizationOptions(customizationOptions.filter((_, i) => i !== idx))} className="text-purple-400 hover:text-rose-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BADGES & VISIBILITY */}
          {activeTab === 'options' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                <div className="font-bold text-zinc-700 dark:text-zinc-300 pb-1 border-b border-zinc-200 dark:border-zinc-700">
                  Storefront Visibility & Merchandising Badges
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                  <div>
                    <span className="font-bold block">Active in Live Catalog</span>
                    <span className="text-zinc-400 text-[11px]">When disabled, product is saved as draft and hidden from customers.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                  <div>
                    <span className="font-bold block">Featured on Homepage</span>
                    <span className="text-zinc-400 text-[11px]">Highlights this product in prime store showcases.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                  <div>
                    <span className="font-bold block">Trending on Campus Badge</span>
                    <span className="text-zinc-400 text-[11px]">Shows under the "Trending on Campus" student recommendation grid.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={trending}
                    onChange={(e) => setTrending(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                  <div>
                    <span className="font-bold block">New Arrival Badge</span>
                    <span className="text-zinc-400 text-[11px]">Displays purple "NEW" badge on the product card.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 6: LIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-fadeIn flex flex-col items-center">
              <p className="text-xs text-zinc-500 text-center">
                This is how students will see this product in the store catalog:
              </p>

              <div className="w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden p-3 space-y-3">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={image || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {discountPercent > 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                      -{discountPercent}%
                    </span>
                  )}
                  {isNewArrival && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">
                      NEW
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                    {collegeId}
                  </span>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2">
                    {title || 'Sample Product Title'}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-black text-base text-zinc-900 dark:text-zinc-50 tabular-nums">
                      {price} EGP
                    </span>
                    {originalPrice && originalPrice > price && (
                      <span className="text-xs text-zinc-400 line-through tabular-nums">
                        {originalPrice} EGP
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className={`font-semibold ${stockStatus === 'out_of_stock' ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {stockStatus === 'out_of_stock' ? 'Out of Stock' : `In Stock (${stock})`}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-zinc-900 text-white text-[10px] font-bold">
                    Add to Cart
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{product ? 'Save Changes' : 'Create Product'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
