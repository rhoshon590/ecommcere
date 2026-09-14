import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { MerchantDashboard } from './components/MerchantDashboard';
import { SupportModal } from './components/SupportModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Product, CartItem, InventorySummary, InventoryAuditEntry, Order } from './types';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Zap, 
  SlidersHorizontal, 
  Filter, 
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Boxes,
  LifeBuoy
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'storefront' | 'merchant'>('storefront');
  const [products, setProducts] = useState<Product[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [auditLog, setAuditLog] = useState<InventoryAuditEntry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromo, setCheckoutPromo] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Toast Helper
  const addToast = useCallback((type: ToastMessage['type'], title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch live products and inventory from server
  const fetchProductsAndInventory = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const [invRes, ordRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/orders')
      ]);

      if (invRes.ok) {
        const invData = await invRes.json();
        setProducts(invData.products || []);
        setInventorySummary(invData.summary || null);
        setAuditLog(invData.auditLog || []);
      }

      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData.orders || []);
      }
    } catch (err) {
      console.error('Failed to sync inventory:', err);
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, []);

  // Initial load & periodic background sync for real-time inventory authority
  useEffect(() => {
    fetchProductsAndInventory();

    // Periodic sync every 8 seconds to reflect live multi-user / external channel activity
    const interval = setInterval(() => {
      fetchProductsAndInventory(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchProductsAndInventory]);

  // Keep cart quantities bounded by current real-time stock
  useEffect(() => {
    setCart(currentCart => {
      return currentCart.map(item => {
        const live = products.find(p => p.id === item.product.id);
        if (!live) return item;
        // update referenced product stock
        return {
          ...item,
          product: live,
          quantity: Math.min(item.quantity, Math.max(1, live.stock))
        };
      }).filter(item => {
        const live = products.find(p => p.id === item.product.id);
        return live ? live.stock > 0 : true;
      });
    });
  }, [products]);

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock === 0) {
      addToast('error', 'Item Out of Stock', `"${product.title}" is currently unavailable.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        addToast('success', 'Cart Updated', `Updated quantity to ${newQty} for ${product.title}`);
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: newQty } : i);
      } else {
        const initialQty = Math.min(product.stock, quantity);
        addToast('success', 'Added to Cart', `Added ${initialQty}x ${product.title}`);
        return [...prev, { product, quantity: initialQty }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    if (newQty > product.stock) {
      addToast('warning', 'Warehouse Stock Limit', `Only ${product.stock} units available in live stock.`);
      return;
    }

    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: newQty } : i));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
    addToast('info', 'Item Removed', 'Item was removed from your cart');
  };

  const handleInstantBuy = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleProceedToCheckout = (discount: number, promo: string) => {
    setCheckoutDiscount(discount);
    setCheckoutPromo(promo);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setCart([]); // Clear cart
    fetchProductsAndInventory(true);
    addToast(
      'success',
      'Order Confirmed & Stock Deducted!',
      `Order ${newOrder.id} confirmed. Tracking: ${newOrder.trackingNumber}`
    );
  };

  // Merchant Adjust Stock Handler
  const handleAdjustStock = async (productId: string, adjustment: number, reason: string, notes?: string) => {
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, adjustment, reason, notes })
      });

      if (!res.ok) {
        throw new Error('Stock adjustment failed');
      }

      const data = await res.json();
      setProducts(prev => prev.map(p => p.id === productId ? data.product : p));
      setInventorySummary(data.summary);
      if (data.auditEntry) {
        setAuditLog(prev => [data.auditEntry, ...prev]);
      }

      const isAdded = adjustment > 0;
      addToast(
        'success',
        isAdded ? 'Stock Replenished' : 'Stock Adjusted',
        `${data.product.title}: New warehouse balance is ${data.product.stock} units.`
      );
    } catch (err: any) {
      addToast('error', 'Adjustment Error', err.message);
    }
  };

  // Merchant Add New Product SKU
  const handleAddProduct = async (newProd: Partial<Product>) => {
    try {
      const res = await fetch('/api/inventory/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });

      if (!res.ok) throw new Error('Failed to create product SKU');

      const data = await res.json();
      setProducts(prev => [data.product, ...prev]);
      setInventorySummary(data.summary);
      fetchProductsAndInventory(true);
      addToast('success', 'SKU Listed Successfully', `Added "${data.product.title}" with initial stock ${data.product.stock}`);
    } catch (err: any) {
      addToast('error', 'Create Failed', err.message);
    }
  };

  // Merchant Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: Order['fulfillmentStatus']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentStatus: status })
      });

      if (!res.ok) throw new Error('Failed to update status');

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, fulfillmentStatus: status } : o));
      addToast('success', 'Order Updated', `Order ${orderId} marked as "${status}"`);
    } catch (err: any) {
      addToast('error', 'Status Update Error', err.message);
    }
  };

  // Simulate External Marketplace Channel Sale
  const handleSimulateChannelSale = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/inventory/simulate-channel-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Simulation failed');

      const data = await res.json();
      setProducts(prev => prev.map(p => p.id === data.product.id ? data.product : p));
      setInventorySummary(data.summary);
      if (data.auditEntry) {
        setAuditLog(prev => [data.auditEntry, ...prev]);
      }

      addToast(
        'warning',
        '⚡ Live Multi-Channel Sale Detected!',
        `${data.message}. Live stock updated in real time!`
      );
    } catch (err: any) {
      addToast('error', 'Simulation Error', err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Derived calculations
  const cartItemCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredStorefrontProducts = products.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-emerald-500 selection:text-zinc-950">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Top Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        cartCount={cartItemCount}
        cartSubtotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        inventorySummary={inventorySummary}
        onSimulateChannelSale={handleSimulateChannelSale}
        isSimulating={isSimulating}
        isRefreshing={isRefreshing}
        onRefreshData={() => fetchProductsAndInventory(false)}
      />

      {/* Content Area */}
      <main className="flex-1 pb-20 sm:pb-8">
        {currentView === 'storefront' ? (
          <div>
            {/* Storefront Hero Strip */}
            <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border-b border-zinc-800/80 py-10 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-Time Inventory Authority & Instant Express Checkout</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight font-['Space_Grotesk'] mb-3">
                    Curated Specialty Goods with Live Warehouse Tracking
                  </h1>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Browse authentic artisan coffee gear, precision electronics, and daily carry essentials. Every unit count is synchronized with our live warehouse in real time.
                  </p>
                </div>

                {/* Trust Badges Pill Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
                    <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Free Prime Delivery</p>
                      <p className="text-[10px] text-zinc-400">On all orders $50+</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">256-Bit SSL Pay</p>
                      <p className="text-[10px] text-zinc-400">PCI-DSS Compliant</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
                    <RotateCcw className="w-5 h-5 text-sky-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">30-Day Guarantee</p>
                      <p className="text-[10px] text-zinc-400">Hassle-free returns</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Catalog Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Category Pills & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Stock Counter Preview */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0">
                  <span>Showing <strong className="text-white">{filteredStorefrontProducts.length}</strong> products</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">
                    {inventorySummary ? `${inventorySummary.totalUnitsInStock} total units in stock` : 'Syncing stock...'}
                  </span>
                </div>
              </div>

              {/* Products Grid */}
              {filteredStorefrontProducts.length === 0 ? (
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center">
                  <p className="font-bold text-zinc-300 mb-1">No products found</p>
                  <p className="text-xs text-zinc-500 mb-4">
                    Try adjusting your search query or choosing another category.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredStorefrontProducts.map(product => {
                    const inCart = cart.find(i => i.product.id === product.id)?.quantity || 0;

                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelectProduct={setSelectedProduct}
                        onAddToCart={prod => handleAddToCart(prod, 1)}
                        cartQuantity={inCart}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Merchant Admin & Real-Time Inventory Tracker */
          <MerchantDashboard
            products={products}
            inventorySummary={inventorySummary}
            auditLog={auditLog}
            orders={orders}
            onAdjustStock={handleAdjustStock}
            onAddProduct={handleAddProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onSimulateChannelSale={handleSimulateChannelSale}
            isSimulating={isSimulating}
            onRefresh={() => fetchProductsAndInventory(false)}
            onOpenSupportModal={() => setIsSupportOpen(true)}
          />
        )}
      </main>

      {/* Floating 24/7 Live Support Concierge Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
        <button
          id="floating-support-btn"
          onClick={() => setIsSupportOpen(true)}
          className="pointer-events-auto group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-4 py-3 sm:px-4 sm:py-2.5 rounded-full font-bold text-xs shadow-2xl shadow-emerald-950/90 hover:scale-105 transition-all duration-200 cursor-pointer border border-emerald-400/30 min-h-[48px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
          title="24/7 Live Concierge & Order Tracking"
          aria-label="Open 24/7 Live Support Desk and Order Tracker"
        >
          <div className="relative shrink-0">
            <LifeBuoy className="w-5 h-5 text-white animate-spin-slow" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping"></span>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 rounded-full"></span>
          </div>
          <div className="flex flex-col text-left">
            <span className="leading-tight font-extrabold flex items-center gap-1.5 text-xs">
              <span>24/7 Live Support</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
            </span>
            <span className="text-[10px] text-emerald-100/90 font-normal">Tracking • Returns • Stock</span>
          </div>
        </button>
      </div>

      {/* 24/7 Support Concierge & Tracking Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        products={products}
        orders={orders}
        onSelectProduct={prod => setSelectedProduct(prod)}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onInstantBuy={handleInstantBuy}
          cartQuantity={cart.find(i => i.product.id === selectedProduct.id)?.quantity || 0}
        />
      )}

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        products={products}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Secure Checkout & Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        discountAmount={checkoutDiscount}
        promoCode={checkoutPromo}
        onOrderCompleted={handleOrderCompleted}
        products={products}
      />

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/80 text-zinc-400 py-8 px-4 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              <Boxes className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-zinc-200">ShopFlow E-Commerce & Inventory Authority</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500">Shopify & Amazon architecture for small business owners</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <button
              onClick={() => setIsSupportOpen(true)}
              className="hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer font-medium"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-emerald-400" />
              <span>24/7 Live Desk</span>
            </button>
            <span>•</span>
            <span>🔒 256-Bit SSL Encrypted Checkout</span>
            <span>•</span>
            <span>⚡ Atomic Stock Decrementing</span>
            <span>•</span>
            <span>📦 Real-Time Multi-Channel Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
