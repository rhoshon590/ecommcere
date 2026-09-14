import React from 'react';
import { 
  Store, 
  Boxes, 
  ShoppingCart, 
  Search, 
  Zap, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw,
  LifeBuoy
} from 'lucide-react';
import { InventorySummary } from '../types';

interface NavbarProps {
  currentView: 'storefront' | 'merchant';
  onViewChange: (view: 'storefront' | 'merchant') => void;
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  onOpenSupport: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  inventorySummary: InventorySummary | null;
  onSimulateChannelSale: () => void;
  isSimulating: boolean;
  isRefreshing: boolean;
  onRefreshData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  cartCount,
  cartSubtotal,
  onOpenCart,
  onOpenSupport,
  searchQuery,
  onSearchChange,
  inventorySummary,
  onSimulateChannelSale,
  isSimulating,
  isRefreshing,
  onRefreshData
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100 shadow-sm">
      {/* Top Banner: Real-time sync and multi-channel indicator */}
      <div className="bg-zinc-900 border-b border-zinc-800/80 px-4 py-1.5 text-xs text-zinc-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-400">Real-Time Inventory Authority:</span>
            <span className="text-zinc-400 hidden sm:inline">
              Shopify & Amazon channel synchronization active (Stock updates live across all tabs)
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {inventorySummary && inventorySummary.lowStockCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded-full font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{inventorySummary.lowStockCount} items low in stock</span>
              </div>
            )}

            <button
              id="top-support-desk-btn"
              onClick={onOpenSupport}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded transition text-xs font-medium cursor-pointer"
              title="24/7 Live Support Concierge & Order Tracking"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <LifeBuoy className="w-3.5 h-3.5 text-emerald-400" />
              <span>24/7 Support</span>
            </button>

            <button
              id="simulate-external-sale-btn"
              onClick={onSimulateChannelSale}
              disabled={isSimulating}
              className="flex items-center gap-1 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded transition text-xs font-medium cursor-pointer disabled:opacity-50"
              title="Simulates an incoming order from Amazon or Shopify marketplace to test real-time stock deduction"
            >
              <Zap className={`w-3 h-3 text-amber-400 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>Simulate Channel Sale</span>
            </button>

            <button
              id="refresh-inventory-btn"
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="p-1 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              title="Refresh stock levels from backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => onViewChange('storefront')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-950 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-['Space_Grotesk']">
                  ShopFlow
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 -mt-0.5 tracking-tight">
                Live Inventory & Secure Pay
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <nav id="view-mode-tabs" className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <button
              id="tab-storefront-view"
              onClick={() => onViewChange('storefront')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'storefront'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customer Storefront</span>
            </button>

            <button
              id="tab-merchant-view"
              onClick={() => onViewChange('merchant')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'merchant'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-sky-400" />
              <span>Merchant Admin & Inventory</span>
              {inventorySummary && inventorySummary.lowStockCount > 0 && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-amber-500/40">
                  {inventorySummary.lowStockCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Center Search Input (Storefront mode) */}
        {currentView === 'storefront' && (
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                id="search-products-input"
                type="text"
                placeholder="Search products, SKUs, barista gear, tech..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Section: Mobile switcher + Cart button */}
        <div className="flex items-center gap-3">
          {/* Mobile view toggle */}
          <div className="flex md:hidden bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
            <button
              onClick={() => onViewChange('storefront')}
              className={`p-1.5 rounded ${currentView === 'storefront' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
              title="Storefront"
            >
              <Store className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewChange('merchant')}
              className={`p-1.5 rounded relative ${currentView === 'merchant' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
              title="Merchant"
            >
              <Boxes className="w-4 h-4" />
              {inventorySummary && inventorySummary.lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>

          {/* 24/7 Support Button */}
          <button
            id="navbar-support-desk-btn"
            onClick={onOpenSupport}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="Open 24/7 Live Support Desk"
          >
            <LifeBuoy className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">24/7 Support</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* Cart Button */}
          <button
            id="open-cart-drawer-btn"
            onClick={onOpenCart}
            className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg font-medium text-xs shadow-md shadow-emerald-950 hover:shadow-emerald-900 transition-all cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-zinc-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-zinc-950">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-semibold">
              ${cartSubtotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
