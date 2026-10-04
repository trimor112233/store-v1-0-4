import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { collegesData } from '../data/mockData';
import {
  Sparkles,
  ShoppingBag,
  Palette,
  CheckCircle2,
  Tag,
  Smile,
  Shield,
} from 'lucide-react';
import { motion } from 'motion/react';

interface CustomItem {
  id: string;
  title: string;
  category: string;
  basePrice: number;
  image: string;
  description: string;
  customizationPlaceholder: string;
  options: { label: string; values: string[] }[];
}

const customItems: CustomItem[] = [
  {
    id: 'cust-1',
    title: 'Laser-Engraved Stainless Steel ID Card Holder & Lanyard',
    category: 'Accessories',
    basePrice: 180,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    description: 'Heavy duty anodized aluminum and stainless steel badge protector with RFID shielding. Personalized with your name, faculty, and student ID number laser-etched permanently.',
    customizationPlaceholder: 'Engraved Text: e.g. Eng. Omar Khaled · Cairo Univ',
    options: [
      { label: 'Holder Color', values: ['Matte Black', 'Space Gray', 'Navy Blue', 'Silver'] },
    ],
  },
  {
    id: 'cust-2',
    title: 'Custom Embroidered Medical Lab Coat / Clinical Scrubs',
    category: 'Apparel',
    basePrice: 450,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80',
    description: '100% Egyptian Cotton heavyweight lab coat. Precision computer embroidery of your faculty seal on the right chest and your full name on the left pocket in classical typography.',
    customizationPlaceholder: 'Embroidery: e.g. Dr. Nour El-Din · Kasr Al-Ainy',
    options: [
      { label: 'Thread Color', values: ['Classic Navy', 'Burgundy Red', 'Emerald Green', 'Royal Gold'] },
      { label: 'Coat Size', values: ['Small', 'Medium', 'Large', 'XL', '2XL'] },
    ],
  },
  {
    id: 'cust-3',
    title: 'Personalized Academic Hardcover Notebook with Gold Foil Name',
    category: 'Stationery',
    basePrice: 160,
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80',
    description: 'Smyth-sewn 192-page 100gsm journal with bookmark ribbon and expander pocket. Your name stamped in hot gold or silver foil on the leatherette cover.',
    customizationPlaceholder: 'Cover Name: e.g. Mariam Tarek · Computer Science',
    options: [
      { label: 'Foil Color', values: ['Metallic Gold', 'Bright Silver', 'Rose Gold'] },
      { label: 'Paper Ruled', values: ['Dotted Grid', 'Lined 7mm', 'Blank'] },
    ],
  },
  {
    id: 'cust-4',
    title: 'Faculty Enamel Metal Keychain & Waterproof Vinyl Stickers Pack',
    category: 'Merch',
    basePrice: 120,
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
    description: 'Die-cast zinc alloy badge keychain with faculty emblem plus 8 weather-resistant matte vinyl stickers for your laptop lid, drafting board, and water bottle.',
    customizationPlaceholder: 'Faculty Choice: e.g. Architecture / Engineering / Medicine',
    options: [
      { label: 'Faculty Seal', values: ['Engineering Gear', 'Medical Caduceus', 'CS Terminal', 'Architecture Column'] },
    ],
  },
];

export default function CustomProductsPage() {
  const { addToCart } = useCart();
  const { success } = useToast();

  const [activeItem, setActiveItem] = useState<CustomItem>(customItems[0]);
  const [customText, setCustomText] = useState('Eng. Ahmed Youssef');
  const [selectedFaculty, setSelectedFaculty] = useState('Faculty of Engineering');
  const [selectedColor, setSelectedColor] = useState('Matte Black');

  const handleAddCustomToCart = () => {
    addToCart({
      id: `custom-${activeItem.id}-${Date.now()}`,
      type: 'custom',
      title: `${activeItem.title} [Custom: ${customText}]`,
      price: activeItem.basePrice,
      quantity: 1,
      category: 'Custom Student Gear',
      image: activeItem.image,
      details: {
        'Custom Engraving/Embroidery': customText,
        'Faculty': selectedFaculty,
        'Option': selectedColor,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-3 shadow-xs">
          <Palette className="w-3.5 h-3.5" />
          <span>Personalized Campus Gear</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
          Custom University Products
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Laser-etched metal ID holders, customized lab coat embroideries, gold-foil notebooks, and faculty enamel accessories crafted for Egyptian university students.
        </p>
      </div>

      {/* Main Customizer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left Column: Live Interactive Mockup Preview (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Live Custom Preview
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Personalized
                </span>
              </div>

              {/* Mockup Canvas */}
              <div className="relative aspect-4/3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center p-6 text-center">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-35 dark:opacity-20"
                />

                {/* Simulated Laser Engraving Plate */}
                <motion.div
                  key={`${activeItem.id}-${customText}-${selectedColor}`}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10 p-6 rounded-xl bg-zinc-900/90 text-white dark:bg-zinc-950/90 border border-zinc-700/80 shadow-2xl max-w-xs w-full backdrop-blur-md"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-3 text-lg font-bold text-blue-400">
                    🎓
                  </div>
                  <div className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
                    STUDENT HUB · EGYPT
                  </div>
                  <h4 className="text-base font-bold tracking-tight text-white mb-1 truncate">
                    {customText || 'Your Name Here'}
                  </h4>
                  <p className="text-xs text-blue-300 font-medium truncate mb-3">
                    {selectedFaculty}
                  </p>
                  <div className="pt-2 border-t border-zinc-800 flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>STATUS: ACTIVE</span>
                    <span>STYLE: {selectedColor}</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Customizer Notes */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 space-y-1">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                Precision Handcrafted in Cairo
              </p>
              <p>Laser engraving and embroidery takes 24 hours. Shipped directly with your campus order.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Select Base Product */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              1. Choose Product to Customize
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {customItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item);
                    setSelectedColor(item.options[0]?.values[0] || 'Default');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeItem.id === item.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-500'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  <div className="text-xs font-bold line-clamp-1">{item.title}</div>
                  <div className="text-xs text-zinc-500 mt-1 font-semibold">{item.basePrice} EGP</div>
                </button>
              ))}
            </div>
          </div>

          {/* Enter Personalization Data */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              2. Personalization Details
            </label>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Name to Engrave / Embroider (Max 30 chars)
              </label>
              <input
                type="text"
                maxLength={30}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={activeItem.customizationPlaceholder}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Faculty / Major
              </label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="Faculty of Engineering">Faculty of Engineering (Cairo / Ain Shams)</option>
                <option value="Kasr Al-Ainy Medicine">Kasr Al-Ainy Faculty of Medicine</option>
                <option value="Computer Science & AI">Faculty of Computers and Artificial Intelligence</option>
                <option value="Architecture & Fine Arts">Faculty of Architecture & Fine Arts</option>
                <option value="Faculty of Science">Faculty of Science</option>
                <option value="Faculty of Commerce / Business">Faculty of Commerce & Business</option>
              </select>
            </div>

            {/* Options */}
            {activeItem.options.map((opt, idx) => (
              <div key={idx}>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  {opt.label}
                </label>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSelectedColor(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedColor === val
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {activeItem.basePrice} EGP
                </span>
                <span className="text-[11px] text-zinc-400 block">Personalization Included</span>
              </div>
              <button
                onClick={handleAddCustomToCart}
                className="py-2.5 px-5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Customized Item</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
