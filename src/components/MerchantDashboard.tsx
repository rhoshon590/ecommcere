import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  RefreshCw, 
  Search, 
  Filter, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight, 
  Zap, 
  FileText, 
  Package,
  Layers,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Edit2,
  LifeBuoy,
  MessageSquare,
  Ticket,
  User,
  Check
} from 'lucide-react';
import { Product, InventorySummary, InventoryAuditEntry, Order, SupportTicket } from '../types';

interface MerchantDashboardProps {
  products: Product[];
  inventorySummary: InventorySummary | null;
  auditLog: InventoryAuditEntry[];
  orders: Order[];
  onAdjustStock: (productId: string, adjustment: number, reason: string, notes?: string) => Promise<void>;
  onAddProduct: (newProd: Partial<Product>) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: Order['fulfillmentStatus']) => Promise<void>;
  onSimulateChannelSale: () => void;
  isSimulating: boolean;
  onRefresh: () => void;
  onOpenSupportModal?: () => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  products,
  inventorySummary,
  auditLog,
  orders,
  onAdjustStock,
  onAddProduct,
  onUpdateOrderStatus,
  onSimulateChannelSale,
  isSimulating,
  onRefresh,
  onOpenSupportModal
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'audit' | 'support'>('inventory');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [respondingTicketId, setRespondingTicketId] = useState<string | null>(null);
  const [responseNoteText, setResponseNoteText] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'Open' | 'Investigating' | 'Resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out' | 'in'>('all');
  const [isRestockingId, setIsRestockingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customAdjustProduct, setCustomAdjustProduct] = useState<Product | null>(null);
  const [customAdjustQty, setCustomAdjustQty] = useState(10);
  const [customAdjustReason, setCustomAdjustReason] = useState<'MANUAL_RESTOCK' | 'DAMAGE_ADJUSTMENT'>('MANUAL_RESTOCK');
  const [customAdjustNotes, setCustomAdjustNotes] = useState('');

  // Fetch support tickets
  const fetchTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res = await fetch('/api/support/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to fetch support tickets', err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateTicketStatus = async (ticketId: string, status: SupportTicket['status'], note?: string) => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, responseNote: note })
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId ? data.ticket : t));
        setRespondingTicketId(null);
        setResponseNoteText('');
      }
    } catch (err) {
      alert('Failed to update ticket');
    }
  };

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newPrice, setNewPrice] = useState('49.99');
  const [newStock, setNewStock] = useState('15');
  const [newThreshold, setNewThreshold] = useState('5');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'low') {
      return product.stock > 0 && product.stock <= product.lowStockThreshold;
    }
    if (filterStatus === 'out') {
      return product.stock === 0;
    }
    if (filterStatus === 'in') {
      return product.stock > product.lowStockThreshold;
    }
    return true;
  });

  // Calculate total lifetime revenue from orders
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  const handleQuickRestock = async (productId: string, amount: number) => {
    setIsRestockingId(productId);
    try {
      await onAdjustStock(productId, amount, 'MANUAL_RESTOCK', `Quick Restock +${amount} Units`);
    } finally {
      setIsRestockingId(null);
    }
  };

  const handleCustomAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAdjustProduct) return;

    try {
      const delta = customAdjustReason === 'DAMAGE_ADJUSTMENT' ? -Math.abs(customAdjustQty) : Math.abs(customAdjustQty);
      await onAdjustStock(
        customAdjustProduct.id,
        delta,
        customAdjustReason,
        customAdjustNotes || `${customAdjustReason === 'DAMAGE_ADJUSTMENT' ? 'Write-off' : 'Warehouse Restock'}`
      );
      setCustomAdjustProduct(null);
      setCustomAdjustNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    await onAddProduct({
      title: newTitle,
      sku: newSku || `SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      category: newCategory,
      price: parseFloat(newPrice),
      stock: parseInt(newStock) || 10,
      lowStockThreshold: parseInt(newThreshold) || 5,
      imageUrl: newImageUrl
    });

    setIsAddModalOpen(false);
    // Reset
    setNewTitle('');
    setNewSku('');
    setNewPrice('49.99');
    setNewStock('15');
  };

  return (
    <div id="merchant-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Merchant Identity & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
              Shopify & Amazon Operations Center
            </span>
            <span className="text-xs text-zinc-500">• Live Multi-Channel Sync</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight font-['Space_Grotesk']">
            Real-Time Inventory & Order Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Live warehouse stock authority prevents overselling. Stock updates instantly upon customer purchases, manual replenishment, or simulated marketplace channel sales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="merchant-simulate-sale-btn"
            onClick={onSimulateChannelSale}
            disabled={isSimulating}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-semibold text-xs flex items-center gap-2 border border-zinc-700 transition cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Simulate Channel Sale</span>
          </button>

          <button
            id="add-new-sku-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product SKU</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total SKUs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Total SKUs</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-['Space_Grotesk']">
            {inventorySummary?.totalSkus ?? products.length}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1">Across 4 categories</span>
        </div>

        {/* Total Units In Stock */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Units in Stock</span>
            <Package className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white font-['Space_Grotesk']">
            {inventorySummary?.totalUnitsInStock ?? 0}
          </p>
          <span className="text-[11px] text-emerald-400 mt-1">Warehouse Authority</span>
        </div>

        {/* Inventory Retail Valuation */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Inventory Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-['Space_Grotesk']">
            ${(inventorySummary?.totalInventoryValuation ?? 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1">Current Retail Asset</span>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-['Space_Grotesk']">
            {inventorySummary?.lowStockCount ?? 0}
          </p>
          <span className="text-[11px] text-amber-400/80 mt-1">Re-order recommended</span>
        </div>

        {/* Out of Stock */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Out of Stock</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-['Space_Grotesk']">
            {inventorySummary?.outOfStockCount ?? 0}
          </p>
          <span className="text-[11px] text-rose-400/80 mt-1">Ready for 1-click restock</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-zinc-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Boxes className="w-4 h-4 text-emerald-400" />
          <span>Real-Time Inventory Master ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'orders'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Truck className="w-4 h-4 text-sky-400" />
          <span>Customer Orders & Fulfillment ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'audit'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Inventory Audit Trail ({auditLog.length})</span>
        </button>

        <button
          id="merchant-tab-support-tickets"
          onClick={() => setActiveTab('support')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'support'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LifeBuoy className="w-4 h-4 text-emerald-400" />
          <span className="flex items-center gap-1.5">
            <span>24/7 Support Desk</span>
            {tickets.filter(t => t.status !== 'Resolved').length > 0 && (
              <span className="bg-amber-400 text-zinc-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {tickets.filter(t => t.status !== 'Resolved').length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* TAB 4: 24/7 CUSTOMER SUPPORT TICKETS & ESCALATIONS */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          {/* Top Support Banner & Metrics */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white font-['Space_Grotesk']">
                  24/7 Merchant Support Desk & Queue
                </h3>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active 24/7/365</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage live customer escalations, tracking inquiries, return approvals, and warehouse assistance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTickets}
                disabled={isLoadingTickets}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTickets ? 'animate-spin' : ''}`} />
                <span>Refresh Queue</span>
              </button>

              {onOpenSupportModal && (
                <button
                  onClick={onOpenSupportModal}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-950"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open Concierge Modal</span>
                </button>
              )}
            </div>
          </div>

          {/* Ticket Filter Pills */}
          <div className="flex items-center gap-2">
            {(['all', 'Open', 'Investigating', 'Resolved'] as const).map(statusKey => {
              const count = statusKey === 'all' 
                ? tickets.length 
                : tickets.filter(t => t.status === statusKey).length;
              return (
                <button
                  key={statusKey}
                  onClick={() => setTicketStatusFilter(statusKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    ticketStatusFilter === statusKey
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="capitalize">{statusKey}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    ticketStatusFilter === statusKey ? 'bg-zinc-300 text-zinc-900' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ticket Cards Grid */}
          <div className="space-y-3">
            {tickets
              .filter(t => ticketStatusFilter === 'all' || t.status === ticketStatusFilter)
              .map(ticket => {
                const isUrgent = ticket.priority.includes('Urgent');
                const isHigh = ticket.priority === 'High';
                const isResolved = ticket.status === 'Resolved';
                const isResponding = respondingTicketId === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    className={`bg-zinc-900 border rounded-xl p-4 sm:p-5 transition shadow-sm ${
                      isUrgent 
                        ? 'border-rose-800/80 bg-rose-950/10' 
                        : isHigh 
                        ? 'border-amber-800/60' 
                        : 'border-zinc-800'
                    }`}
                  >
                    {/* Ticket Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-bold text-white font-mono">{ticket.id}</span>
                        <span className="bg-zinc-800 text-zinc-300 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-zinc-700">
                          {ticket.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isUrgent
                            ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                            : isHigh
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {ticket.priority} (SLA &lt; {ticket.estimatedResolutionMinutes}m)
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.status === 'Open'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : ticket.status === 'Investigating'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          ● {ticket.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-400">
                        Submitted: {new Date(ticket.createdAt).toLocaleTimeString()} ({new Date(ticket.createdAt).toLocaleDateString()})
                      </div>
                    </div>

                    {/* Customer & Order Information */}
                    <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block">Customer</span>
                        <span className="text-zinc-200 font-semibold">{ticket.customerName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block">Contact Email</span>
                        <a href={`mailto:${ticket.customerEmail}`} className="text-emerald-400 hover:underline">
                          {ticket.customerEmail}
                        </a>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block">Order / Tracking Ref</span>
                        <span className="text-zinc-200 font-mono">
                          {ticket.orderId || 'General Inquiry'}
                        </span>
                      </div>
                    </div>

                    {/* Customer Inquiry Message */}
                    <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-300 mb-3">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Customer Description:</p>
                      <p className="whitespace-pre-line leading-relaxed">{ticket.message}</p>
                    </div>

                    {/* Resolution Note if present */}
                    {ticket.resolutionNotes && (
                      <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-300 mb-3 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-emerald-400">Resolution Log:</p>
                          <p>{ticket.resolutionNotes}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {ticket.status === 'Open' && (
                          <button
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'Investigating')}
                            className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            Mark as Investigating
                          </button>
                        )}

                        {ticket.status !== 'Resolved' && (
                          <button
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'Resolved', 'Resolved by merchant operator in dashboard')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setRespondingTicketId(isResponding ? null : ticket.id);
                            setResponseNoteText(ticket.resolutionNotes || '');
                          }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          {isResponding ? 'Cancel Note' : 'Add Merchant Note'}
                        </button>
                      </div>

                      <div className="text-[11px] text-zinc-500">
                        {isResolved ? 'Closed' : 'Guaranteed 24/7 SLA Protected'}
                      </div>
                    </div>

                    {/* Inline Note Box */}
                    {isResponding && (
                      <div className="mt-3 pt-3 border-t border-zinc-800 flex gap-2">
                        <input
                          type="text"
                          value={responseNoteText}
                          onChange={e => setResponseNoteText(e.target.value)}
                          placeholder="e.g. Verified with FedEx tracking, delivery confirmed for tomorrow morning."
                          className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, ticket.status, responseNoteText)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Save Note
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

            {tickets.length === 0 && (
              <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <Ticket className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">No Active Tickets in Queue</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
                  All customer and merchant support requests are resolved. New tickets filed via 24/7 chat or the priority portal will appear here in real-time.
                </p>
                {onOpenSupportModal && (
                  <button
                    onClick={onOpenSupportModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Open 24/7 Support Desk Modal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter by title, SKU, category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All SKUs ({products.length})
              </button>
              <button
                onClick={() => setFilterStatus('low')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  filterStatus === 'low'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                    : 'text-zinc-400 hover:text-amber-300'
                }`}
              >
                Low Stock Only ({inventorySummary?.lowStockCount ?? 0})
              </button>
              <button
                onClick={() => setFilterStatus('out')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  filterStatus === 'out'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-700/50'
                    : 'text-zinc-400 hover:text-rose-300'
                }`}
              >
                Out of Stock ({inventorySummary?.outOfStockCount ?? 0})
              </button>
              <button
                onClick={() => setFilterStatus('in')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  filterStatus === 'in'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                    : 'text-zinc-400 hover:text-emerald-300'
                }`}
              >
                Healthy Stock
              </button>
            </div>
          </div>

          {/* Master Inventory Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">SKU & Item</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Warehouse Stock</th>
                    <th className="py-3.5 px-3">Alert Threshold</th>
                    <th className="py-3.5 px-3">Unit Price</th>
                    <th className="py-3.5 px-3">Total Asset Value</th>
                    <th className="py-3.5 px-4 text-right">Quick Restock Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-zinc-500">
                        No inventory matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => {
                      const isOut = product.stock === 0;
                      const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold;
                      const assetVal = product.stock * product.price;

                      return (
                        <tr 
                          key={product.id}
                          className="hover:bg-zinc-800/40 transition-colors"
                        >
                          {/* Item with Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-zinc-100 line-clamp-1">
                                  {product.title}
                                </p>
                                <span className="font-mono text-[11px] text-emerald-400">
                                  {product.sku}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3 text-zinc-400">
                            {product.category}
                          </td>

                          {/* Live Warehouse Stock */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              {isOut ? (
                                <span className="inline-flex items-center gap-1 bg-rose-950/60 text-rose-400 border border-rose-800/60 font-bold px-2 py-0.5 rounded text-[11px]">
                                  <ShieldAlert className="w-3 h-3" />
                                  0 (Out of Stock)
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 bg-amber-950/60 text-amber-300 border border-amber-800/60 font-bold px-2 py-0.5 rounded text-[11px] animate-pulse">
                                  <AlertTriangle className="w-3 h-3" />
                                  {product.stock} (Low Stock)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-950/50 text-emerald-300 border border-emerald-800/50 font-bold px-2 py-0.5 rounded text-[11px]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {product.stock} units
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Threshold */}
                          <td className="py-3 px-3 text-zinc-400">
                            ≤ {product.lowStockThreshold} units
                          </td>

                          {/* Price */}
                          <td className="py-3 px-3 font-semibold text-zinc-200">
                            ${product.price.toFixed(2)}
                          </td>

                          {/* Total Asset Value */}
                          <td className="py-3 px-3 font-mono text-zinc-300">
                            ${assetVal.toFixed(2)}
                          </td>

                          {/* Restock Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleQuickRestock(product.id, 10)}
                                disabled={isRestockingId === product.id}
                                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md font-semibold text-[11px] border border-zinc-700 transition cursor-pointer disabled:opacity-50"
                                title="Add 10 units"
                              >
                                +10
                              </button>
                              <button
                                onClick={() => handleQuickRestock(product.id, 25)}
                                disabled={isRestockingId === product.id}
                                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md font-semibold text-[11px] border border-zinc-700 transition cursor-pointer disabled:opacity-50"
                                title="Add 25 units"
                              >
                                +25
                              </button>
                              <button
                                onClick={() => {
                                  setCustomAdjustProduct(product);
                                  setCustomAdjustQty(20);
                                }}
                                className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-md font-semibold text-[11px] transition cursor-pointer"
                                title="Custom inventory adjustment"
                              >
                                Custom Adjust
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER ORDERS & FULFILLMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Order ID & Date</th>
                    <th className="py-3.5 px-3">Customer & Destination</th>
                    <th className="py-3.5 px-3">Item Count</th>
                    <th className="py-3.5 px-3">Total Paid</th>
                    <th className="py-3.5 px-3">Payment Status</th>
                    <th className="py-3.5 px-3">Fulfillment Status</th>
                    <th className="py-3.5 px-4 text-right">Carrier Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-zinc-500">
                        No orders recorded yet. Place an order on the Storefront to see it live here!
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-zinc-800/40 transition">
                        {/* Order ID */}
                        <td className="py-3 px-4">
                          <p className="font-mono font-bold text-emerald-400">{order.id}</p>
                          <span className="text-[11px] text-zinc-500">
                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-3">
                          <p className="font-semibold text-zinc-200">{order.shippingAddress.fullName}</p>
                          <p className="text-[11px] text-zinc-400">
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </p>
                        </td>

                        {/* Items */}
                        <td className="py-3 px-3 text-zinc-300">
                          {order.items.reduce((acc, i) => acc + i.quantity, 0)} item(s)
                        </td>

                        {/* Total */}
                        <td className="py-3 px-3 font-bold text-white font-['Space_Grotesk']">
                          ${order.total.toFixed(2)}
                        </td>

                        {/* Payment */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            PAID (SSL 256)
                          </span>
                        </td>

                        {/* Fulfillment */}
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                            order.fulfillmentStatus === 'Shipped' || order.fulfillmentStatus === 'Delivered'
                              ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {order.fulfillmentStatus}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          {order.fulfillmentStatus === 'Processing' ? (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'Shipped')}
                              className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] rounded-md transition cursor-pointer"
                            >
                              Dispatch Order
                            </button>
                          ) : order.fulfillmentStatus === 'Shipped' ? (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'Delivered')}
                              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-[11px] rounded-md transition cursor-pointer"
                            >
                              Mark Delivered
                            </button>
                          ) : (
                            <span className="text-zinc-500 font-medium text-[11px]">Fulfilled</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Immutable Inventory Change Log</h3>
                <p className="text-xs text-zinc-400">
                  Logs every addition, customer deduction, and channel sale with timestamp and reference ID.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-3">Product Title</th>
                    <th className="py-3.5 px-3">Change Event</th>
                    <th className="py-3.5 px-3">Previous</th>
                    <th className="py-3.5 px-3">Delta</th>
                    <th className="py-3.5 px-3">New Balance</th>
                    <th className="py-3.5 px-4">Reference Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-mono">
                  {auditLog.map(entry => {
                    const isPositive = entry.change > 0;
                    return (
                      <tr key={entry.id} className="hover:bg-zinc-800/40 transition">
                        <td className="py-3 px-4 text-zinc-400 text-[11px]">
                          {new Date(entry.timestamp).toLocaleTimeString()} ({new Date(entry.timestamp).toLocaleDateString()})
                        </td>
                        <td className="py-3 px-3 font-sans font-medium text-zinc-200">
                          {entry.productTitle}
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            entry.reason === 'ORDER_PURCHASE'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : entry.reason === 'SIMULATED_CHANNEL_SALE'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {entry.reason}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-zinc-400">{entry.previousStock}</td>
                        <td className="py-3 px-3">
                          <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? `+${entry.change}` : entry.change}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-white">{entry.newStock}</td>
                        <td className="py-3 px-4 font-sans text-zinc-400 text-[11px]">
                          {entry.referenceId || 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Custom Stock Adjustment */}
      {customAdjustProduct && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setCustomAdjustProduct(null)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-white font-['Space_Grotesk'] mb-1">
              Adjust Inventory: {customAdjustProduct.title}
            </h3>
            <p className="text-xs text-zinc-400 font-mono mb-4">
              SKU: {customAdjustProduct.sku} • Current Stock: {customAdjustProduct.stock} units
            </p>

            <form onSubmit={handleCustomAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Adjustment Type</label>
                <select
                  value={customAdjustReason}
                  onChange={e => setCustomAdjustReason(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="MANUAL_RESTOCK">Add Warehouse Stock (Shipment Arrival)</option>
                  <option value="DAMAGE_ADJUSTMENT">Write-Off (Damaged / Expired / Missing)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={customAdjustQty}
                  onChange={e => setCustomAdjustQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Audit Reference / PO Number</label>
                <input
                  type="text"
                  placeholder="e.g. PO-SUPPLIER-8419 or physical count"
                  value={customAdjustNotes}
                  onChange={e => setCustomAdjustNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomAdjustProduct(null)}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                >
                  Apply Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add New Product SKU */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 text-zinc-100 shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-white font-['Space_Grotesk'] mb-1">
              Add New Product SKU
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter details for the new product to list in your catalog and warehouse.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Titanium Camping French Press"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">SKU *</label>
                  <input
                    type="text"
                    placeholder="e.g. OUT-FP-702"
                    value={newSku}
                    onChange={e => setNewSku(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Coffee & Barista">Coffee & Barista</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Home & Office">Home & Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={e => setNewStock(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    min="1"
                    value={newThreshold}
                    onChange={e => setNewThreshold(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Product Photo URL</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                >
                  Create & List SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
