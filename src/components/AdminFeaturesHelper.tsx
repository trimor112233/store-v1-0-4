import React, { useState, useEffect, useMemo } from 'react';
import {
  Product,
  Order,
  Customer,
  PrintingRequest,
  CustomOrder,
  StudentKit,
  Coupon,
  StoreSettings,
} from '../types';
import {
  X,
  Search,
  Download,
  AlertTriangle,
  Settings2,
  Trash2,
  Check,
  Eye,
  Activity,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  Sliders,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

// ===================== TYPE DEFINITIONS =====================

export interface AdminActivityItem {
  id: string;
  action: string;
  admin: string;
  dateTime: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  visible: boolean;
  size: 'normal' | 'large';
  order: number;
}

// ===================== UTILITY EXPORT CSV =====================

export const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  // Build safe CSV rows with quotes
  const csvContent = "\uFEFF" + [
    headers.join(","),
    ...rows.map(r => r.map(val => {
      const cleanVal = String(val).replace(/"/g, '""');
      return `"${cleanVal}"`;
    }).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ===================== REUSABLE SAFETY CONFIRMATION MODAL =====================

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  destructiveText?: string; // If provided, user must type this exact text to confirm (e.g. "DELETE")
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  destructiveText,
  onConfirm,
  onCancel,
}) => {
  const [typedConfirm, setTypedConfirm] = useState('');
  const [acceptCheckbox, setAcceptCheckbox] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTypedConfirm('');
      setAcceptCheckbox(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const requiresTyping = !!destructiveText;
  const canConfirm = true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onCancel} />

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-md w-full relative z-10 animate-scaleUp">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{title}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">{message}</p>

            {/* Checkbox confirmation for standard deletions */}
            {!requiresTyping && (
              <label className="flex items-center gap-2 mt-4 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptCheckbox}
                  onChange={(e) => setAcceptCheckbox(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                  I understand this action is permanent and cannot be undone.
                </span>
              </label>
            )}

            {/* Typable confirmation for extra-destructive deletions */}
            {requiresTyping && (
              <div className="mt-4 space-y-2">
                <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  Type <span className="font-mono font-bold text-rose-600 dark:text-rose-400 uppercase select-all">"{destructiveText}"</span> to authorize:
                </label>
                <input
                  type="text"
                  required
                  value={typedConfirm}
                  onChange={(e) => setTypedConfirm(e.target.value)}
                  placeholder={`Type "${destructiveText}" here`}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 uppercase"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canConfirm}
                onClick={onConfirm}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Deletion</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== DRAFT / PUBLISH CHANGER COMPONENT =====================

interface PublishStatusSelectorProps {
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: string;
  onChange: (status: 'draft' | 'published' | 'scheduled', date?: string) => void;
}

export const PublishStatusSelector: React.FC<PublishStatusSelectorProps> = ({
  status,
  scheduledDate,
  onChange,
}) => {
  const [localDate, setLocalDate] = useState(scheduledDate || '');

  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 text-xs">
      <div className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[10px]">
        Publishing Control
      </div>
      <div className="flex gap-2">
        {(['draft', 'published', 'scheduled'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode, mode === 'scheduled' ? localDate || new Date().toISOString().slice(0, 16) : undefined)}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-center transition-all ${
              status === mode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <span className="capitalize">{mode}</span>
          </button>
        ))}
      </div>

      {status === 'scheduled' && (
        <div className="space-y-1.5">
          <label className="block font-semibold text-zinc-500 text-[10px]">Scheduled Release Date & Time:</label>
          <input
            type="datetime-local"
            value={localDate}
            onChange={(e) => {
              setLocalDate(e.target.value);
              onChange('scheduled', e.target.value);
            }}
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900"
          />
        </div>
      )}
    </div>
  );
};

// ===================== WIDGET CUSTOMIZER PANEL =====================

interface WidgetCustomizerPanelProps {
  widgets: DashboardWidget[];
  onChange: (widgets: DashboardWidget[]) => void;
}

export const WidgetCustomizerPanel: React.FC<WidgetCustomizerPanelProps> = ({
  widgets,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleVisibility = (id: string) => {
    onChange(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const toggleSize = (id: string) => {
    onChange(widgets.map(w => w.id === id ? { ...w, size: w.size === 'normal' ? 'large' : 'normal' } : w));
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const sorted = [...widgets].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(w => w.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = sorted[index].order;
      sorted[index].order = sorted[index - 1].order;
      sorted[index - 1].order = temp;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const temp = sorted[index].order;
      sorted[index].order = sorted[index + 1].order;
      sorted[index + 1].order = temp;
    }
    onChange(sorted);
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50 text-xs shadow-xs mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Customize Dashboard Layout & Widgets</span>
        </div>
        <span>{isOpen ? 'Close Settings ▲' : 'Configure Widgets ▼'}</span>
      </button>

      {isOpen && (
        <div className="p-4 bg-white dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <p className="text-[11px] text-zinc-500">
            Arrange widgets, hide non-essential analytics, and toggle full-width sizing. Layout is auto-saved locally.
          </p>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {[...widgets].sort((a, b) => a.order - b.order).map((widget, index) => (
              <div key={widget.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={widget.visible}
                    onChange={() => toggleVisibility(widget.id)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span className={`font-semibold truncate ${widget.visible ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 line-through'}`}>
                    {widget.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Size Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleSize(widget.id)}
                    className={`px-2 py-1 rounded border text-[10px] font-semibold transition-all ${
                      widget.size === 'large'
                        ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {widget.size === 'large' ? 'Full Width' : 'Half Width'}
                  </button>

                  {/* Ordering Controls */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveWidget(widget.id, 'up')}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === widgets.length - 1}
                    onClick={() => moveWidget(widget.id, 'down')}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===================== QUICK ACTIONS CARD COMPONENT =====================

interface QuickActionsProps {
  onAction: (actionId: string) => void;
}

export const QuickActionsCard: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    { id: 'add_product', label: '+ Add Product', bg: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60' },
    { id: 'add_category', label: '+ Add Category', bg: 'bg-zinc-50 text-zinc-600 border-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-800' },
    { id: 'create_coupon', label: '+ Create Coupon', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60' },
    { id: 'create_kit', label: '+ Create Kit', bg: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/60' },
    { id: 'add_banner', label: '+ Add Banner', bg: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60' },
    { id: 'view_pending_orders', label: 'View Pending Orders', bg: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700' },
    { id: 'view_printing_requests', label: 'View Printing Requests', bg: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700' },
    { id: 'view_custom_orders', label: 'View Custom Orders', bg: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700' },
  ];

  return (
    <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">Quick Actions Hub</h3>
        <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">1-Click Control</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {actions.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={() => onAction(act.id)}
            className={`px-3 py-2 text-[11px] font-semibold rounded-xl border text-center transition-all hover:shadow-xs active:scale-98 ${act.bg}`}
          >
            {act.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ===================== BULK ACTIONS CONTAINER COMPONENT =====================

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: { label: string; actionId: string; dangerous?: boolean }[];
  onTrigger: (actionId: string) => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClear,
  actions,
  onTrigger,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200 rounded-2xl px-6 py-3.5 shadow-2xl flex items-center gap-6 z-50 animate-slideUp animate-fadeIn">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold tabular-nums">
          {selectedCount}
        </span>
        <span className="text-xs font-bold whitespace-nowrap">items selected</span>
      </div>

      <div className="h-4 w-px bg-zinc-700 dark:bg-zinc-300" />

      <div className="flex items-center gap-2 overflow-x-auto max-w-sm sm:max-w-md md:max-w-lg scrollbar-none">
        {actions.map((act) => (
          <button
            key={act.actionId}
            type="button"
            onClick={() => onTrigger(act.actionId)}
            className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
              act.dangerous
                ? 'bg-rose-600/95 text-white hover:bg-rose-700'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-800 dark:hover:bg-zinc-200'
            }`}
          >
            {act.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-zinc-700 dark:bg-zinc-300" />

      <button
        type="button"
        onClick={onClear}
        className="p-1 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-100 text-zinc-400 dark:text-zinc-500"
        title="Clear Selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ===================== EXPORTS & REPORTS COMPONENT =====================

interface ReportsSectionProps {
  orders: Order[];
  products: Product[];
  printing: PrintingRequest[];
  custom: CustomOrder[];
}

type DateRange = 'today' | 'week' | 'month' | 'semester' | 'all';

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  orders,
  products,
  printing,
  custom,
}) => {
  const [range, setRange] = useState<DateRange>('semester');

  // Filter items based on selected date ranges
  const filterDate = <T extends { date?: string; submittedAt?: string }>(items: T[]): T[] => {
    const now = new Date();
    return items.filter(item => {
      const dStr = item.date || item.submittedAt;
      if (!dStr) return false;
      const date = new Date(dStr);
      const diffMs = now.getTime() - date.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (range === 'today') return diffDays <= 1;
      if (range === 'week') return diffDays <= 7;
      if (range === 'month') return diffDays <= 30;
      if (range === 'semester') return diffDays <= 120; // 4 months semester
      return true;
    });
  };

  const filteredOrders = useMemo(() => filterDate(orders), [orders, range]);
  const filteredPrinting = useMemo(() => filterDate(printing), [printing, range]);
  const filteredCustom = useMemo(() => filterDate(custom), [custom, range]);

  // Compute revenues
  const productSales = filteredOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
  const printingRevenue = filteredPrinting.reduce((sum, p) => sum + (p.status === 'Completed' || p.status === 'Printing' ? p.price : 0), 0);
  const customRevenue = filteredCustom.reduce((sum, c) => sum + (c.status === 'Delivered' || c.status === 'In Production' ? c.price : 0), 0);
  const totalRev = productSales + printingRevenue + customRevenue;

  const totalProductsSold = filteredOrders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);

  // Trigger downloads
  const handleExportCSV = (type: 'orders' | 'products' | 'printing' | 'custom') => {
    if (type === 'orders') {
      const headers = ['Order ID', 'Date', 'Type', 'Student', 'Phone', 'Pickup Point', 'Subtotal', 'Discount', 'Courier', 'Total', 'Payment', 'Status'];
      const rows = orders.map(o => [o.id, o.date, o.orderType || 'Product Order', o.studentName, o.phone, o.campusDeliveryPoint || o.deliveryAddress || '', o.subtotal, o.discount, o.shipping, o.total, o.paymentStatus, o.status]);
      exportToCSV('orders_report', headers, rows);
    } else if (type === 'products') {
      const headers = ['Product ID', 'Title', 'Faculty', 'Category', 'Type', 'Price', 'Original Price', 'Stock', 'Status', 'Featured', 'Active'];
      const rows = products.map(p => [p.id, p.title, p.collegeId, p.category || 'General', p.productType, p.price, p.originalPrice || '', p.stock, p.stockStatus, p.featured ? 'Yes' : 'No', p.active ? 'Yes' : 'No']);
      exportToCSV('products_catalog', headers, rows);
    } else if (type === 'printing') {
      const headers = ['Request ID', 'Submitted At', 'Customer', 'Phone', 'File Name', 'Pages', 'Copies', 'Size', 'Color', 'Binding', 'Price', 'Status'];
      const rows = printing.map(p => [p.id, p.submittedAt, p.customerName, p.phone, p.fileName, p.pages, p.copies, p.paperSize, p.colorMode, p.binding, p.price, p.status]);
      exportToCSV('printing_requests_report', headers, rows);
    } else if (type === 'custom') {
      const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Product Type', 'Custom Text', 'Color', 'Quantity', 'Price', 'Status'];
      const rows = custom.map(c => [c.id, c.date, c.customerName, c.phone, c.productType, c.customizationText, c.selectedColor, c.quantity, c.price, c.status]);
      exportToCSV('custom_badge_orders', headers, rows);
    }
  };

  return (
    <div className="space-y-6 text-xs bg-zinc-50/50 dark:bg-zinc-800/10 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Store Reports & Exports Hub</span>
          </h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Filter financial logs, check performance metrics, and export raw datasets to CSV.</p>
        </div>

        {/* Date Filter selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as DateRange)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="today">Today (24h)</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="semester">Active Semester (120 Days)</option>
            <option value="all">Lifetime History</option>
          </select>
        </div>
      </div>

      {/* Derived Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Sales Volume</span>
          <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">{totalRev.toLocaleString()} EGP</div>
          <span className="text-[10px] text-zinc-400 block mt-0.5">All channels combined</span>
        </div>
        <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Products Sold</span>
          <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">{totalProductsSold} Units</div>
          <span className="text-[10px] text-zinc-400 block mt-0.5">From store orders</span>
        </div>
        <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Printing Revenue</span>
          <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">{printingRevenue.toLocaleString()} EGP</div>
          <span className="text-[10px] text-emerald-600 block mt-0.5">{filteredPrinting.length} plot requests</span>
        </div>
        <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Custom Badge Sales</span>
          <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">{customRevenue.toLocaleString()} EGP</div>
          <span className="text-[10px] text-purple-600 block mt-0.5">{filteredCustom.length} bespoke orders</span>
        </div>
      </div>

      {/* CSV Exporter Action Cards */}
      <div className="pt-2">
        <div className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px] mb-2.5">Export Dataset Sheets</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            { id: 'orders', label: 'Export Orders (CSV)', count: orders.length },
            { id: 'products', label: 'Export Catalog (CSV)', count: products.length },
            { id: 'printing', label: 'Export Prints (CSV)', count: printing.length },
            { id: 'custom', label: 'Export Custom (CSV)', count: custom.length },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => handleExportCSV(btn.id as any)}
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold transition-all group"
            >
              <div className="text-left min-w-0">
                <div className="text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{btn.label}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">{btn.count} records total</div>
              </div>
              <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 shrink-0 ml-1.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================== STORE SETTINGS EDITOR PANEL =====================

interface StoreSettingsPanelProps {
  settings: StoreSettings;
  onSave: (updates: Partial<StoreSettings>) => void;
}

export const StoreSettingsPanel: React.FC<StoreSettingsPanelProps> = ({
  settings,
  onSave,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.supportPhone);
  const [email, setEmail] = useState(settings.supportEmail);
  const [shippingFee, setShippingFee] = useState(settings.standardShippingFee);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold);
  const [currency, setCurrency] = useState(settings.currency);
  const [adminPin, setAdminPin] = useState(settings.adminPin || 'admin2026');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      storeName,
      tagline,
      supportPhone: phone,
      supportEmail: email,
      standardShippingFee: Number(shippingFee),
      freeShippingThreshold: Number(freeShippingThreshold),
      currency,
      adminPin,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Global Commerce Settings</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Control store metadata, currency tickers, and express campus courier fees.</p>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors"
        >
          Save Settings Updates
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Store Name</label>
          <input
            type="text"
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Store Slogan / Tagline</label>
          <input
            type="text"
            required
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">WhatsApp / Support Phone</label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Support Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Standard Courier Shipping Fee (EGP)</label>
          <input
            type="number"
            required
            value={shippingFee}
            onChange={(e) => setShippingFee(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Free Shipping Threshold (EGP)</label>
          <input
            type="number"
            required
            value={freeShippingThreshold}
            onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Currency Symbol</label>
          <input
            type="text"
            required
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
            <span>🛡️ Admin Portal Passkey</span>
          </label>
          <input
            type="text"
            required
            value={adminPin}
            onChange={(e) => setAdminPin(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/10 dark:bg-amber-950/10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
            placeholder="e.g. admin2026"
          />
        </div>
      </div>
    </form>
  );
};
