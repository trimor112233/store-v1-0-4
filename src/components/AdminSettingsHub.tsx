import React, { useState } from 'react';
import { useStoreData } from '../context/StoreDataContext';
import { useToast } from '../context/ToastContext';
import {
  PickupLocation,
  PaymentMethodConfig,
  DeliveryZone,
  CustomDesignTemplate,
} from '../types';
import {
  Store,
  Truck,
  MapPin,
  CreditCard,
  FileText,
  Share2,
  Sparkles,
  Shield,
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  Phone,
  Mail,
  ExternalLink,
  RotateCcw,
  X,
} from 'lucide-react';

interface AdminSettingsHubProps {
  onShowConfirm: (title: string, message: string, onConfirm: () => void, destructiveText?: string) => void;
  onLogActivity: (action: string) => void;
}

export default function AdminSettingsHub({ onShowConfirm, onLogActivity }: AdminSettingsHubProps) {
  const {
    settings,
    updateStoreSettings,
    addPickupLocation,
    updatePickupLocation,
    deletePickupLocation,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    updateDeliverySettings,
    updateWebsiteContent,
    updateSocialLinks,
    addCustomDesignTemplate,
    updateCustomDesignTemplate,
    deleteCustomDesignTemplate,
    factoryResetAllData,
  } = useStoreData();

  const { success, error: toastError, info } = useToast();

  // Sub-tab selection: 'general' | 'delivery' | 'pickup' | 'payments' | 'content' | 'social' | 'custom-designs' | 'navigation' | 'security'
  const [subTab, setSubTab] = useState<
    'general' | 'delivery' | 'pickup' | 'payments' | 'content' | 'social' | 'custom-designs' | 'navigation' | 'security'
  >('general');

  // Modal / Form state for Pickup Location
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [editingPickupLoc, setEditingPickupLoc] = useState<PickupLocation | null>(null);
  const [pickupName, setPickupName] = useState('');
  const [pickupNameAr, setPickupNameAr] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupDetails, setPickupDetails] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');
  const [pickupHours, setPickupHours] = useState('');
  const [pickupFee, setPickupFee] = useState<number>(0);
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [pickupActive, setPickupActive] = useState(true);

  // Modal / Form state for Payment Method
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethodConfig | null>(null);
  const [paymentName, setPaymentName] = useState('');
  const [paymentNameAr, setPaymentNameAr] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [paymentFee, setPaymentFee] = useState<number>(0);
  const [paymentPriority, setPaymentPriority] = useState<number>(1);
  const [paymentAccountDetails, setPaymentAccountDetails] = useState('');
  const [paymentActive, setPaymentActive] = useState(true);

  // Modal / Form state for Custom Design Template
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<CustomDesignTemplate | null>(null);
  const [designTitle, setDesignTitle] = useState('');
  const [designTitleAr, setDesignTitleAr] = useState('');
  const [designProductType, setDesignProductType] = useState('ID Card Holder');
  const [designCategory, setDesignCategory] = useState('Accessories');
  const [designBasePrice, setDesignBasePrice] = useState<number>(180);
  const [designPreviewImage, setDesignPreviewImage] = useState('');
  const [designReferenceImage, setDesignReferenceImage] = useState('');
  const [designColors, setDesignColors] = useState('Matte Black, Navy Blue, Silver');
  const [designShapes, setDesignShapes] = useState('Standard Size, Slim');
  const [designStyles, setDesignStyles] = useState('Laser Etched, Color Filled');
  const [designPlaceholder, setDesignPlaceholder] = useState('');
  const [designInstructions, setDesignInstructions] = useState('');
  const [designActive, setDesignActive] = useState(true);

  // Delivery Zone Modal
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [zoneFee, setZoneFee] = useState<number>(35);
  const [zoneDays, setZoneDays] = useState('1-2 Business Days');
  const [zoneGovs, setZoneGovs] = useState('القاهرة (Cairo), الجيزة (Giza)');

  // Admin PIN Change State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPinFields, setShowPinFields] = useState(false);

  // -------------------------------------------------------------
  // HANDLERS FOR PICKUP LOCATIONS
  // -------------------------------------------------------------
  const handleOpenAddPickup = () => {
    setEditingPickupLoc(null);
    setPickupName('');
    setPickupNameAr('');
    setPickupAddress('');
    setPickupDetails('');
    setPickupPhone(settings.supportPhone || '+20 100 234 5678');
    setPickupHours('9:00 AM - 4:00 PM (Sun-Thu)');
    setPickupFee(0);
    setPickupInstructions('Collect from campus coordinator with your Order ID.');
    setPickupActive(true);
    setIsPickupModalOpen(true);
  };

  const handleOpenEditPickup = (loc: PickupLocation) => {
    setEditingPickupLoc(loc);
    setPickupName(loc.name);
    setPickupNameAr(loc.nameAr || '');
    setPickupAddress(loc.address);
    setPickupDetails(loc.details || '');
    setPickupPhone(loc.phone || '');
    setPickupHours(loc.workingHours || '');
    setPickupFee(loc.fee || 0);
    setPickupInstructions(loc.instructions || '');
    setPickupActive(loc.active !== undefined ? loc.active : true);
    setIsPickupModalOpen(true);
  };

  const handleSavePickupLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupName.trim() || !pickupAddress.trim()) return;

    if (editingPickupLoc) {
      updatePickupLocation(editingPickupLoc.id, {
        name: pickupName.trim(),
        nameAr: pickupNameAr.trim() || undefined,
        address: pickupAddress.trim(),
        details: pickupDetails.trim() || undefined,
        phone: pickupPhone.trim() || undefined,
        workingHours: pickupHours.trim() || undefined,
        fee: Number(pickupFee),
        instructions: pickupInstructions.trim() || undefined,
        active: pickupActive,
      });
      success('Location Updated', `${pickupName} updated.`);
      onLogActivity(`Updated pickup location: ${pickupName}`);
    } else {
      addPickupLocation({
        name: pickupName.trim(),
        nameAr: pickupNameAr.trim() || undefined,
        address: pickupAddress.trim(),
        details: pickupDetails.trim() || undefined,
        phone: pickupPhone.trim() || undefined,
        workingHours: pickupHours.trim() || undefined,
        fee: Number(pickupFee),
        instructions: pickupInstructions.trim() || undefined,
        active: pickupActive,
      });
      success('Location Added', `${pickupName} added to pickup options.`);
      onLogActivity(`Added new pickup location: ${pickupName}`);
    }
    setIsPickupModalOpen(false);
  };

  const handleDeletePickupLocation = (loc: PickupLocation) => {
    onShowConfirm(
      'Delete Pickup Location',
      `Are you sure you want to permanently delete "${loc.name}"? Customers will no longer be able to select this campus location.`,
      () => {
        deletePickupLocation(loc.id);
        success('Deleted', `Location "${loc.name}" removed.`);
        onLogActivity(`Deleted pickup location: ${loc.name}`);
      },
      'Delete Location'
    );
  };

  // -------------------------------------------------------------
  // HANDLERS FOR PAYMENT METHODS
  // -------------------------------------------------------------
  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    setPaymentName('');
    setPaymentNameAr('');
    setPaymentCode('custom_pay');
    setPaymentInstructions('');
    setPaymentFee(0);
    setPaymentPriority((settings.paymentMethods?.length || 0) + 1);
    setPaymentAccountDetails('');
    setPaymentActive(true);
    setIsPaymentModalOpen(true);
  };

  const handleOpenEditPayment = (pay: PaymentMethodConfig) => {
    setEditingPayment(pay);
    setPaymentName(pay.name);
    setPaymentNameAr(pay.nameAr || '');
    setPaymentCode(pay.code);
    setPaymentInstructions(pay.instructions || '');
    setPaymentFee(pay.fee || 0);
    setPaymentPriority(pay.priority || 1);
    setPaymentAccountDetails(pay.accountDetails || '');
    setPaymentActive(pay.active !== undefined ? pay.active : true);
    setIsPaymentModalOpen(true);
  };

  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentName.trim()) return;

    if (editingPayment) {
      updatePaymentMethod(editingPayment.id, {
        name: paymentName.trim(),
        nameAr: paymentNameAr.trim() || undefined,
        code: paymentCode.trim().toLowerCase(),
        instructions: paymentInstructions.trim(),
        fee: Number(paymentFee),
        priority: Number(paymentPriority),
        accountDetails: paymentAccountDetails.trim() || undefined,
        active: paymentActive,
      });
      success('Payment Method Updated', `${paymentName} saved.`);
      onLogActivity(`Updated payment method: ${paymentName}`);
    } else {
      addPaymentMethod({
        name: paymentName.trim(),
        nameAr: paymentNameAr.trim() || undefined,
        code: paymentCode.trim().toLowerCase() || `pay_${Date.now()}`,
        instructions: paymentInstructions.trim(),
        fee: Number(paymentFee),
        priority: Number(paymentPriority),
        accountDetails: paymentAccountDetails.trim() || undefined,
        active: paymentActive,
      });
      success('Payment Method Added', `${paymentName} added.`);
      onLogActivity(`Added payment method: ${paymentName}`);
    }
    setIsPaymentModalOpen(false);
  };

  const handleDeletePaymentMethod = (pay: PaymentMethodConfig) => {
    onShowConfirm(
      'Delete Payment Method',
      `Are you sure you want to delete "${pay.name}"? Customers will no longer see this payment option during checkout.`,
      () => {
        deletePaymentMethod(pay.id);
        success('Deleted', `Payment method "${pay.name}" removed.`);
        onLogActivity(`Deleted payment method: ${pay.name}`);
      },
      'Delete Payment Method'
    );
  };

  // -------------------------------------------------------------
  // HANDLERS FOR CUSTOM DESIGN TEMPLATES
  // -------------------------------------------------------------
  const handleOpenAddDesign = () => {
    setEditingDesign(null);
    setDesignTitle('');
    setDesignTitleAr('');
    setDesignProductType('ID Card Holder');
    setDesignCategory('Accessories');
    setDesignBasePrice(180);
    setDesignPreviewImage('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');
    setDesignReferenceImage('');
    setDesignColors('Matte Black, Navy Blue, Silver');
    setDesignShapes('Standard Size, Slim Card');
    setDesignStyles('Laser Etched, Deep Engraved');
    setDesignPlaceholder('e.g. Eng. Omar Khaled · Cairo Univ');
    setDesignInstructions('Personalized with high-precision fiber laser etching.');
    setDesignActive(true);
    setIsDesignModalOpen(true);
  };

  const handleOpenEditDesign = (des: CustomDesignTemplate) => {
    setEditingDesign(des);
    setDesignTitle(des.title);
    setDesignTitleAr(des.titleAr || '');
    setDesignProductType(des.productType);
    setDesignCategory(des.category);
    setDesignBasePrice(des.basePrice);
    setDesignPreviewImage(des.previewImage);
    setDesignReferenceImage(des.referenceImage || '');
    setDesignColors((des.availableColors || []).join(', '));
    setDesignShapes((des.availableShapes || []).join(', '));
    setDesignStyles((des.availableStyles || []).join(', '));
    setDesignPlaceholder(des.customizationPlaceholder || '');
    setDesignInstructions(des.instructions || '');
    setDesignActive(des.active !== undefined ? des.active : true);
    setIsDesignModalOpen(true);
  };

  const handleSaveDesign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designTitle.trim() || !designPreviewImage.trim()) return;

    const payload: Omit<CustomDesignTemplate, 'id'> = {
      title: designTitle.trim(),
      titleAr: designTitleAr.trim() || undefined,
      productType: designProductType.trim(),
      category: designCategory.trim(),
      basePrice: Number(designBasePrice),
      previewImage: designPreviewImage.trim(),
      referenceImage: designReferenceImage.trim() || undefined,
      availableColors: designColors.split(',').map((s) => s.trim()).filter(Boolean),
      availableShapes: designShapes.split(',').map((s) => s.trim()).filter(Boolean),
      availableStyles: designStyles.split(',').map((s) => s.trim()).filter(Boolean),
      customizationPlaceholder: designPlaceholder.trim(),
      instructions: designInstructions.trim(),
      active: designActive,
    };

    if (editingDesign) {
      updateCustomDesignTemplate(editingDesign.id, payload);
      success('Template Updated', `${designTitle} saved.`);
      onLogActivity(`Updated custom design template: ${designTitle}`);
    } else {
      addCustomDesignTemplate(payload);
      success('Template Created', `${designTitle} created.`);
      onLogActivity(`Created custom design template: ${designTitle}`);
    }
    setIsDesignModalOpen(false);
  };

  const handleDeleteDesign = (des: CustomDesignTemplate) => {
    onShowConfirm(
      'Delete Design Template',
      `Delete customization template "${des.title}"? Students will not be able to customize this gear item anymore.`,
      () => {
        deleteCustomDesignTemplate(des.id);
        success('Deleted', `Design template "${des.title}" deleted.`);
        onLogActivity(`Deleted custom design template: ${des.title}`);
      },
      'Delete Template'
    );
  };

  // -------------------------------------------------------------
  // HANDLERS FOR DELIVERY ZONES
  // -------------------------------------------------------------
  const handleOpenAddZone = () => {
    setEditingZone(null);
    setZoneName('');
    setZoneFee(35);
    setZoneDays('1-2 Business Days');
    setZoneGovs('القاهرة (Cairo), الجيزة (Giza)');
    setIsZoneModalOpen(true);
  };

  const handleOpenEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneName(zone.name);
    setZoneFee(zone.fee);
    setZoneDays(zone.estimatedDays);
    setZoneGovs(zone.governorates.join(', '));
    setIsZoneModalOpen(true);
  };

  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;

    const govsList = zoneGovs.split(',').map((g) => g.trim()).filter(Boolean);
    const existingZones = settings.deliverySettings?.zones || [];

    if (editingZone) {
      const updated = existingZones.map((z) =>
        z.id === editingZone.id
          ? {
              ...z,
              name: zoneName.trim(),
              fee: Number(zoneFee),
              estimatedDays: zoneDays.trim(),
              governorates: govsList,
            }
          : z
      );
      updateDeliverySettings({ zones: updated });
      success('Zone Updated', `Delivery zone "${zoneName}" updated.`);
    } else {
      const newZone: DeliveryZone = {
        id: `zone-${Date.now()}`,
        name: zoneName.trim(),
        fee: Number(zoneFee),
        estimatedDays: zoneDays.trim(),
        governorates: govsList,
        active: true,
      };
      updateDeliverySettings({ zones: [...existingZones, newZone] });
      success('Zone Added', `Delivery zone "${zoneName}" added.`);
    }
    setIsZoneModalOpen(false);
  };

  const handleDeleteZone = (zone: DeliveryZone) => {
    onShowConfirm(
      'Delete Delivery Zone',
      `Delete shipping zone "${zone.name}"?`,
      () => {
        const updated = (settings.deliverySettings?.zones || []).filter((z) => z.id !== zone.id);
        updateDeliverySettings({ zones: updated });
        success('Zone Deleted', `Zone "${zone.name}" removed.`);
      },
      'Delete Zone'
    );
  };

  // -------------------------------------------------------------
  // HANDLERS FOR SECURITY / ADMIN PIN
  // -------------------------------------------------------------
  const handleChangeAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentCorrectPin = settings.adminPin || 'admin2026';
    if (currentPinInput !== currentCorrectPin) {
      toastError('Incorrect Passkey', 'Your current admin passkey did not match.');
      return;
    }
    if (!newPinInput || newPinInput.length < 4) {
      toastError('Too Short', 'New admin PIN must be at least 4 characters.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      toastError('Mismatch', 'New PIN and confirm PIN do not match.');
      return;
    }

    updateStoreSettings({ adminPin: newPinInput });
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    success('PIN Updated', 'Administrative security passkey updated successfully.');
    onLogActivity('Admin security passkey changed');
  };

  return (
    <div className="space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs no-scrollbar">
        {[
          { id: 'general', label: 'General Info', icon: Store },
          { id: 'delivery', label: 'Delivery & Shipping', icon: Truck },
          { id: 'pickup', label: 'Pickup Locations', icon: MapPin },
          { id: 'payments', label: 'Payment Methods', icon: CreditCard },
          { id: 'content', label: 'Website Content / CMS', icon: FileText },
          { id: 'social', label: 'Social & External Links', icon: Share2 },
          { id: 'custom-designs', label: 'Custom Gear Templates', icon: Sparkles },
          { id: 'navigation', label: 'Navigation Links', icon: Eye },
          { id: 'security', label: 'Security & PIN', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: GENERAL INFO */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'general' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">General Store Information</h3>
            <p className="text-xs text-zinc-500">Configure store branding, contact info, and currency display.</p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => updateStoreSettings({ storeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Logo Image URL</label>
                <input
                  type="text"
                  value={settings.logoUrl || ''}
                  onChange={(e) => updateStoreSettings({ logoUrl: e.target.value })}
                  placeholder="https://... (Leave empty for default wordmark badge)"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Store Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => updateStoreSettings({ tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Primary Support Phone</label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => updateStoreSettings({ supportPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => updateStoreSettings({ supportEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Currency Display</label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => updateStoreSettings({ currency: e.target.value, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Campus Physical Office / Warehouse Address</label>
              <input
                type="text"
                value={settings.physicalAddress || ''}
                onChange={(e) => updateStoreSettings({ physicalAddress: e.target.value })}
                placeholder="Giza Square, opposite Faculty of Engineering..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>

            {/* Store Open / Closed Status Control */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Store Ordering Status (Open / Closed)</h4>
                <p className="text-[11px] text-zinc-500">When closed, visitors see a store-closed notice and cannot place new orders.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newStatus = !settings.storeOpen;
                  updateStoreSettings({ storeOpen: newStatus });
                  success('Store Status Updated', newStatus ? 'Store is now OPEN for orders.' : 'Store is now CLOSED.');
                  onLogActivity(`Store ordering status changed to: ${newStatus ? 'Open' : 'Closed'}`);
                }}
                className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all shrink-0 ${
                  settings.storeOpen
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
                }`}
              >
                {settings.storeOpen ? '🟢 Store is OPEN' : '🔴 Store is CLOSED'}
              </button>
            </div>

            {!settings.storeOpen && (
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Store Closed Notice Message</label>
                <input
                  type="text"
                  value={settings.storeClosedMessage || ''}
                  onChange={(e) => updateStoreSettings({ storeClosedMessage: e.target.value })}
                  placeholder="The store is currently closed for new orders..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            )}

            {/* SEO Settings */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                <span>🔍 Search Engine Optimization (SEO) & Metadata</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Site Title Tag</label>
                  <input
                    type="text"
                    value={settings.siteTitle || ''}
                    onChange={(e) => updateStoreSettings({ siteTitle: e.target.value })}
                    placeholder="Student Hub — University Student Store"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Social Sharing Image URL (OG Image)</label>
                  <input
                    type="text"
                    value={settings.socialSharingImage || ''}
                    onChange={(e) => updateStoreSettings({ socialSharingImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-[11px]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Meta Description</label>
                <textarea
                  rows={2}
                  value={settings.metaDescription || ''}
                  onChange={(e) => updateStoreSettings({ metaDescription: e.target.value })}
                  placeholder="Academic supplies, printing, and kits..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>
            </div>

            {/* Backup / Export Complete Data */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">📦 Complete Store Data Backup / Export</h4>
                <p className="text-[11px] text-zinc-500">Download a JSON backup of all products, orders, categories, and settings.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const backup = {
                    settings,
                    products: localStorage.getItem('sh_products'),
                    categories: localStorage.getItem('sh_categories'),
                    subcategories: localStorage.getItem('sh_subcategories'),
                    orders: localStorage.getItem('sh_orders'),
                    coupons: localStorage.getItem('sh_coupons'),
                    reviews: localStorage.getItem('sh_reviews'),
                    exportDate: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `student_hub_backup_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  success('Backup Downloaded', 'Complete store data JSON backup exported successfully.');
                  onLogActivity('Exported complete store data backup JSON');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>Export JSON Backup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: DELIVERY & SHIPPING */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'delivery' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Delivery & Shipping Zones</h3>
              <p className="text-xs text-zinc-500">Configure standard shipping fees, free shipping thresholds, and zone-based pricing.</p>
            </div>

            <button
              onClick={handleOpenAddZone}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Delivery Zone</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.deliverySettings?.enabled ?? true}
                  onChange={(e) => updateDeliverySettings({ enabled: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Home Delivery Active</span>
              </label>

              <div>
                <label className="block font-semibold mb-1">Standard Delivery Fee (EGP)</label>
                <input
                  type="number"
                  value={settings.deliverySettings?.standardFee ?? 35}
                  onChange={(e) => updateDeliverySettings({ standardFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 tabular-nums font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Free Delivery Threshold (EGP)</label>
                <input
                  type="number"
                  value={settings.deliverySettings?.freeThreshold ?? 500}
                  onChange={(e) => updateDeliverySettings({ freeThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 tabular-nums font-bold text-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Estimated Delivery Time Display</label>
              <input
                type="text"
                value={settings.deliverySettings?.estimatedDeliveryTime || '24 to 48 Hours'}
                onChange={(e) => updateDeliverySettings({ estimatedDeliveryTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>
          </div>

          {/* Zones Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Configured Governorates & Zone Pricing ({(settings.deliverySettings?.zones || []).length})
            </h4>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden text-xs">
              {(settings.deliverySettings?.zones || []).map((zone) => (
                <div key={zone.id} className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{zone.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                        {zone.fee} EGP Fee
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-1">
                      {zone.governorates.join(' · ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditZone(zone)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      title="Edit Zone"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-zinc-400"
                      title="Delete Zone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: PICKUP LOCATIONS */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'pickup' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Campus Pickup Locations</h3>
              <p className="text-xs text-zinc-500">
                Manage university campus delivery desks. Customers can pick up gear directly at these points during checkout.
              </p>
            </div>

            <button
              onClick={handleOpenAddPickup}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Campus Hub</span>
            </button>
          </div>

          <div className="space-y-3">
            {(settings.pickupLocations || []).map((loc) => (
              <div
                key={loc.id}
                className={`p-4 rounded-2xl border transition-all text-xs flex items-center justify-between gap-4 ${
                  loc.active
                    ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 opacity-60'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{loc.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        loc.active
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {loc.active ? 'Active' : 'Disabled'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold tabular-nums">
                      {loc.fee === 0 ? 'Free Pickup' : `Fee: ${loc.fee} EGP`}
                    </span>
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-400">{loc.address} {loc.details ? `· ${loc.details}` : ''}</p>
                  <p className="text-[11px] text-zinc-400">{loc.workingHours} {loc.phone ? `· Phone: ${loc.phone}` : ''}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updatePickupLocation(loc.id, { active: !loc.active })}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer ${
                      loc.active
                        ? 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {loc.active ? 'Disable' : 'Enable'}
                  </button>

                  <button
                    onClick={() => handleOpenEditPickup(loc)}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    title="Edit Location"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeletePickupLocation(loc)}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-zinc-400"
                    title="Delete Location"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 4: PAYMENT METHODS */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'payments' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Checkout Payment Methods</h3>
              <p className="text-xs text-zinc-500">
                Enable or disable payment options. No paid APIs required; customers choose from active methods during guest checkout.
              </p>
            </div>

            <button
              onClick={handleOpenAddPayment}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Payment Option</span>
            </button>
          </div>

          <div className="space-y-3">
            {(settings.paymentMethods || []).map((pay) => (
              <div
                key={pay.id}
                className={`p-4 rounded-2xl border transition-all text-xs flex items-center justify-between gap-4 ${
                  pay.active
                    ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 opacity-60'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{pay.name}</span>
                    <span className="font-mono text-[10px] text-zinc-400 uppercase">({pay.code})</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pay.active
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {pay.active ? 'Active' : 'Disabled'}
                    </span>
                    {pay.fee > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-[10px] font-bold">
                        +{pay.fee} EGP Fee
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-400">{pay.instructions}</p>
                  {pay.accountDetails && (
                    <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                      Account / Details: {pay.accountDetails}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updatePaymentMethod(pay.id, { active: !pay.active })}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer ${
                      pay.active
                        ? 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {pay.active ? 'Disable' : 'Enable'}
                  </button>

                  <button
                    onClick={() => handleOpenEditPayment(pay)}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    title="Edit Method"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeletePaymentMethod(pay)}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-zinc-400"
                    title="Delete Method"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 5: WEBSITE CONTENT / CMS */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'content' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Website Text & CMS Content</h3>
            <p className="text-xs text-zinc-500">
              Edit all public customer-facing text across the website without touching source code.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5 text-xs">
            <div className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 pb-1 border-b border-zinc-200 dark:border-zinc-800">
              1. Hero Showcase & Announcement Bar
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Hero Main Title</label>
              <input
                type="text"
                value={settings.websiteContent?.heroTitle || ''}
                onChange={(e) => updateWebsiteContent({ heroTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Hero Subtitle Paragraph</label>
              <textarea
                rows={2}
                value={settings.websiteContent?.heroSubtitle || ''}
                onChange={(e) => updateWebsiteContent({ heroSubtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Hero Primary Button Text</label>
                <input
                  type="text"
                  value={settings.websiteContent?.heroButtonPrimary || ''}
                  onChange={(e) => updateWebsiteContent({ heroButtonPrimary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Hero Secondary Button Text</label>
                <input
                  type="text"
                  value={settings.websiteContent?.heroButtonSecondary || ''}
                  onChange={(e) => updateWebsiteContent({ heroButtonSecondary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Announcement Bar Text</label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.websiteContent?.announcementActive ?? true}
                    onChange={(e) => updateWebsiteContent({ announcementActive: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] font-bold">Bar Active</span>
                </label>
              </div>
              <input
                type="text"
                value={settings.websiteContent?.announcementText || ''}
                onChange={(e) => updateWebsiteContent({ announcementText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>

            <div className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 pt-3 pb-1 border-b border-zinc-200 dark:border-zinc-800">
              2. Store Section Headings & Subtitles
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Trending Section Title</label>
                <input
                  type="text"
                  value={settings.websiteContent?.trendingSectionTitle || ''}
                  onChange={(e) => updateWebsiteContent({ trendingSectionTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Trending Section Subtitle</label>
                <input
                  type="text"
                  value={settings.websiteContent?.trendingSectionSubtitle || ''}
                  onChange={(e) => updateWebsiteContent({ trendingSectionSubtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Starter Kits Section Title</label>
                <input
                  type="text"
                  value={settings.websiteContent?.kitsSectionTitle || ''}
                  onChange={(e) => updateWebsiteContent({ kitsSectionTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Starter Kits Section Subtitle</label>
                <input
                  type="text"
                  value={settings.websiteContent?.kitsSectionSubtitle || ''}
                  onChange={(e) => updateWebsiteContent({ kitsSectionSubtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            </div>

            <div className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 pt-3 pb-1 border-b border-zinc-200 dark:border-zinc-800">
              3. Footer & About Section Text
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">About Store Description</label>
              <textarea
                rows={2}
                value={settings.websiteContent?.aboutText || ''}
                onChange={(e) => updateWebsiteContent({ aboutText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Footer Copyright Notice</label>
              <input
                type="text"
                value={settings.websiteContent?.footerCopyright || ''}
                onChange={(e) => updateWebsiteContent({ footerCopyright: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Privacy Policy Text</label>
              <textarea
                rows={3}
                value={settings.websiteContent?.privacyPolicy || ''}
                onChange={(e) => updateWebsiteContent({ privacyPolicy: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Terms of Service Text</label>
              <textarea
                rows={3}
                value={settings.websiteContent?.termsOfService || ''}
                onChange={(e) => updateWebsiteContent({ termsOfService: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 6: SOCIAL & EXTERNAL LINKS */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'social' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Social Media & External Links</h3>
            <p className="text-xs text-zinc-500">
              Manage all social media, WhatsApp inquiry numbers, and map links across headers, footers, and contact cards.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">WhatsApp Inquiry Number</label>
                <input
                  type="text"
                  value={settings.socialLinks?.whatsapp || ''}
                  onChange={(e) => updateSocialLinks({ whatsapp: e.target.value })}
                  placeholder="+201002345678"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Instagram Profile URL</label>
                <input
                  type="text"
                  value={settings.socialLinks?.instagram || ''}
                  onChange={(e) => updateSocialLinks({ instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Facebook Page URL</label>
                <input
                  type="text"
                  value={settings.socialLinks?.facebook || ''}
                  onChange={(e) => updateSocialLinks({ facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">TikTok Profile URL</label>
                <input
                  type="text"
                  value={settings.socialLinks?.tiktok || ''}
                  onChange={(e) => updateSocialLinks({ tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">YouTube Channel URL</label>
                <input
                  type="text"
                  value={settings.socialLinks?.youtube || ''}
                  onChange={(e) => updateSocialLinks({ youtube: e.target.value })}
                  placeholder="https://youtube.com/@..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">LinkedIn Organization URL</label>
                <input
                  type="text"
                  value={settings.socialLinks?.linkedin || ''}
                  onChange={(e) => updateSocialLinks({ linkedin: e.target.value })}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Google Maps / Campus Location URL</label>
              <input
                type="text"
                value={settings.socialLinks?.googleMapsUrl || ''}
                onChange={(e) => updateSocialLinks({ googleMapsUrl: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 7: CUSTOM GEAR TEMPLATES */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'custom-designs' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Custom Gear Design Templates</h3>
              <p className="text-xs text-zinc-500">
                Control the customizable products available to students (ID holders, lab coats, notebooks, keychains).
              </p>
            </div>

            <button
              onClick={handleOpenAddDesign}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(settings.customDesignTemplates || []).map((des) => (
              <div
                key={des.id}
                className={`p-4 rounded-2xl border transition-all text-xs space-y-3 ${
                  des.active
                    ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 opacity-60'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <img
                    src={des.previewImage}
                    alt={des.title}
                    className="w-16 h-16 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">{des.title}</span>
                    </div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block">
                      {des.productType} · {des.basePrice} EGP
                    </span>
                    <p className="text-zinc-500 line-clamp-1 text-[11px] mt-0.5">{des.instructions}</p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <p><span className="font-semibold text-zinc-800 dark:text-zinc-200">Colors:</span> {(des.availableColors || []).join(', ')}</p>
                  <p><span className="font-semibold text-zinc-800 dark:text-zinc-200">Shapes / Sizes:</span> {(des.availableShapes || []).join(', ')}</p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    des.active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {des.active ? 'Active' : 'Disabled'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCustomDesignTemplate(des.id, { active: !des.active })}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold"
                    >
                      {des.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleOpenEditDesign(des)}
                      className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDesign(des)}
                      className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 hover:text-rose-600 text-zinc-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 8: NAVIGATION LINKS */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'navigation' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Header & Mobile Navigation</h3>
            <p className="text-xs text-zinc-500">Toggle visibility and rename main navbar links.</p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 text-xs">
            {(settings.navigationLinks || []).map((link, idx) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 gap-4"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-400 font-mono text-[10px]">#{idx + 1}</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{link.id}</span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const updated = (settings.navigationLinks || []).map((l) =>
                        l.id === link.id ? { ...l, label: e.target.value } : l
                      );
                      updateStoreSettings({ navigationLinks: updated });
                    }}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium"
                  />

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.isVisible}
                      onChange={(e) => {
                        const updated = (settings.navigationLinks || []).map((l) =>
                          l.id === link.id ? { ...l, isVisible: e.target.checked } : l
                        );
                        updateStoreSettings({ navigationLinks: updated });
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-zinc-600 dark:text-zinc-400 text-[11px] font-semibold">Visible</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 9: SECURITY & ADMIN PIN */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'security' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Admin Security & Access Controls</h3>
            <p className="text-xs text-zinc-500">Change your administrative passkey and access security preferences.</p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300">
              <span className="font-bold block">🔒 Restricted Access Level</span>
              <p className="text-[11px] mt-0.5">
                The Admin Portal is locked behind this passkey. Regular guests and customers cannot access admin operations.
              </p>
            </div>

            <form onSubmit={handleChangeAdminPin} className="space-y-3 max-w-md">
              <div>
                <label className="block font-semibold mb-1">Current Admin PIN</label>
                <input
                  type={showPinFields ? 'text' : 'password'}
                  required
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                  placeholder="Enter current PIN..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">New Admin PIN</label>
                <input
                  type={showPinFields ? 'text' : 'password'}
                  required
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                  placeholder="At least 4 characters..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Confirm New Admin PIN</label>
                <input
                  type={showPinFields ? 'text' : 'password'}
                  required
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                  placeholder="Confirm new PIN..."
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinFields(!showPinFields)}
                  className="text-[11px] text-zinc-500 hover:underline"
                >
                  {showPinFields ? 'Hide PIN characters' : 'Show PIN characters'}
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  Update Admin Passkey
                </button>
              </div>
            </form>

            {/* Danger Zone: Factory Reset */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20">
                <div>
                  <h4 className="font-bold text-rose-700 dark:text-rose-400">Factory Reset Store Data</h4>
                  <p className="text-zinc-500 text-[11px]">
                    Clears local cached state and reinitializes with clean catalog data and empty orders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onShowConfirm(
                      'Factory Reset Data',
                      'This will reset your browser storage to the pristine initial state. Are you sure?',
                      () => factoryResetAllData(),
                      'Reset Everything'
                    );
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PICKUP LOCATION */}
      {/* ------------------------------------------------------------- */}
      {isPickupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div onClick={() => setIsPickupModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 z-10 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                {editingPickupLoc ? 'Edit Pickup Location' : 'Add Pickup Location'}
              </h3>
              <button onClick={() => setIsPickupModalOpen(false)} className="text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePickupLocation} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Campus Hub Name (English) *</label>
                <input
                  type="text"
                  required
                  value={pickupName}
                  onChange={(e) => setPickupName(e.target.value)}
                  placeholder="e.g. Mansoura University — Main Campus Hub"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Campus Hub Name (Arabic)</label>
                <input
                  type="text"
                  value={pickupNameAr}
                  onChange={(e) => setPickupNameAr(e.target.value)}
                  placeholder="مثال: جامعة المنصورة — مجمع الكليات"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-right"
                  style={{ direction: 'rtl' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Street Address & City *</label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Gomhoria St, Mansoura"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Pickup Fee (EGP)</label>
                  <input
                    type="number"
                    min={0}
                    value={pickupFee}
                    onChange={(e) => setPickupFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={pickupPhone}
                    onChange={(e) => setPickupPhone(e.target.value)}
                    placeholder="+20 100..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Working Hours</label>
                <input
                  type="text"
                  value={pickupHours}
                  onChange={(e) => setPickupHours(e.target.value)}
                  placeholder="9:00 AM - 4:00 PM (Sun-Thu)"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Student Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  placeholder="Show order confirmation screen at station desk..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={pickupActive}
                  onChange={(e) => setPickupActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-semibold">Location Active for Checkout</span>
              </label>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPickupModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PAYMENT METHOD */}
      {/* ------------------------------------------------------------- */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div onClick={() => setIsPaymentModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 z-10 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                {editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePaymentMethod} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Method Name *</label>
                <input
                  type="text"
                  required
                  value={paymentName}
                  onChange={(e) => setPaymentName(e.target.value)}
                  placeholder="e.g. Vodafone Cash"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Code / Identifier</label>
                <input
                  type="text"
                  value={paymentCode}
                  onChange={(e) => setPaymentCode(e.target.value)}
                  placeholder="vodafone_cash"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Account / Wallet Details (if applicable)</label>
                <input
                  type="text"
                  value={paymentAccountDetails}
                  onChange={(e) => setPaymentAccountDetails(e.target.value)}
                  placeholder="e.g. Wallet Number: 01002345678 or InstaPay: studenthub@instapay"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Customer Instructions</label>
                <textarea
                  rows={2}
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  placeholder="Send transaction screenshot or pay cash upon pickup..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Additional Fee (EGP)</label>
                  <input
                    type="number"
                    min={0}
                    value={paymentFee}
                    onChange={(e) => setPaymentFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Display Priority</label>
                  <input
                    type="number"
                    value={paymentPriority}
                    onChange={(e) => setPaymentPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={paymentActive}
                  onChange={(e) => setPaymentActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-semibold">Active in Checkout</span>
              </label>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Payment Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT CUSTOM DESIGN TEMPLATE */}
      {/* ------------------------------------------------------------- */}
      {isDesignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div onClick={() => setIsDesignModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 z-10 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                {editingDesign ? 'Edit Custom Gear Template' : 'Add Custom Gear Template'}
              </h3>
              <button onClick={() => setIsDesignModalOpen(false)} className="text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDesign} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Template Title *</label>
                <input
                  type="text"
                  required
                  value={designTitle}
                  onChange={(e) => setDesignTitle(e.target.value)}
                  placeholder="e.g. Laser-Engraved Stainless Steel ID Card Holder"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Product Type Association</label>
                  <input
                    type="text"
                    required
                    value={designProductType}
                    onChange={(e) => setDesignProductType(e.target.value)}
                    placeholder="Keychain / ID Card / Lab Coat"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Base Price (EGP) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={designBasePrice}
                    onChange={(e) => setDesignBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Preview Image URL *</label>
                <input
                  type="text"
                  required
                  value={designPreviewImage}
                  onChange={(e) => setDesignPreviewImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Available Colors (comma separated)</label>
                <input
                  type="text"
                  value={designColors}
                  onChange={(e) => setDesignColors(e.target.value)}
                  placeholder="Matte Black, Navy Blue, Silver"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Available Shapes / Sizes (comma separated)</label>
                <input
                  type="text"
                  value={designShapes}
                  onChange={(e) => setDesignShapes(e.target.value)}
                  placeholder="Vertical, Horizontal, Compact"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Customization Input Placeholder</label>
                <input
                  type="text"
                  value={designPlaceholder}
                  onChange={(e) => setDesignPlaceholder(e.target.value)}
                  placeholder="Engraved Text: e.g. Eng. Omar Khaled · Cairo Univ"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Instructions for Students</label>
                <textarea
                  rows={2}
                  value={designInstructions}
                  onChange={(e) => setDesignInstructions(e.target.value)}
                  placeholder="Laser fiber engraved directly into aluminum bezel..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={designActive}
                  onChange={(e) => setDesignActive(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span className="font-semibold">Active for Students to Customize & Order</span>
              </label>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDesignModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT DELIVERY ZONE */}
      {/* ------------------------------------------------------------- */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div onClick={() => setIsZoneModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 z-10 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                {editingZone ? 'Edit Shipping Zone' : 'Add Shipping Zone'}
              </h3>
              <button onClick={() => setIsZoneModalOpen(false)} className="text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="e.g. Mansoura & Delta Cities"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Shipping Fee (EGP)</label>
                  <input
                    type="number"
                    min={0}
                    value={zoneFee}
                    onChange={(e) => setZoneFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Estimated Days</label>
                  <input
                    type="text"
                    value={zoneDays}
                    onChange={(e) => setZoneDays(e.target.value)}
                    placeholder="1-2 Business Days"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Covered Governorates (comma separated)</label>
                <textarea
                  rows={3}
                  value={zoneGovs}
                  onChange={(e) => setZoneGovs(e.target.value)}
                  placeholder="الدقهلية (Dakahlia), الغربية (Gharbia)..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
