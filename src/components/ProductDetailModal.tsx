import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Minus,
  ShoppingCart,
  Zap
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onInstantBuy: (product: Product, quantity: number) => void;
  cartQuantity: number;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onInstantBuy,
  cartQuantity
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const remainingPurchasable = Math.max(0, product.stock - cartQuantity);

  const handleIncrease = () => {
    if (quantity < remainingPurchasable) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <div 
      id="product-detail-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id={`product-detail-modal-${product.id}`}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full text-zinc-100 shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar with close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-medium">{product.sku}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">{product.category}</span>
          </div>
          <button
            id="close-product-modal-btn"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left Column: Image & Delivery perks */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.badges.map((badge, i) => (
                  <span
                    key={i}
                    className="text-xs font-bold px-2.5 py-1 rounded-md bg-zinc-950/90 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-md"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="flex flex-col items-center gap-1 text-zinc-300">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-[11px]">Free Fast Ship</span>
                <span className="text-[9px] text-zinc-500">Orders $50+</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-zinc-300">
                <RotateCcw className="w-4 h-4 text-sky-400" />
                <span className="font-medium text-[11px]">30-Day Returns</span>
                <span className="text-[9px] text-zinc-500">Hassle-free</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-[11px]">Secure Checkout</span>
                <span className="text-[9px] text-zinc-500">256-bit SSL</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Ratings, Real-time Stock, Actions */}
          <div className="flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug mb-2 font-['Space_Grotesk']">
                {product.title}
              </h2>

              {/* Star Rating */}
              <div className="flex items-center gap-2 text-xs mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-zinc-200">{product.rating.toFixed(1)}</span>
                <span className="text-zinc-500">({product.reviewCount} customer reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-zinc-800">
                <span className="text-2xl font-black text-white font-['Space_Grotesk']">
                  ${product.price.toFixed(2)}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-sm text-zinc-500 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded">
                      Save ${(product.compareAtPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Real-time Inventory Status Box */}
              <div className="mb-4">
                {isOutOfStock ? (
                  <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 flex items-start gap-2.5 text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <div className="text-xs">
                      <p className="font-bold">Currently Out of Stock</p>
                      <p className="text-zinc-400 text-[11px] mt-0.5">
                        Our warehouse is awaiting shipment. Switch to Merchant view to restock this SKU instantly.
                      </p>
                    </div>
                  </div>
                ) : isLowStock ? (
                  <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 flex items-start gap-2.5 text-amber-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400 animate-bounce" />
                    <div className="text-xs">
                      <p className="font-bold text-amber-300">
                        Only {product.stock} left in stock - order soon!
                      </p>
                      <p className="text-amber-200/80 text-[11px] mt-0.5">
                        Demand is high. Items in cart are not reserved until checkout is completed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 flex items-start gap-2.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <div className="text-xs">
                      <p className="font-bold">In Stock ({product.stock} units ready to ship)</p>
                      <p className="text-emerald-200/80 text-[11px] mt-0.5">
                        Fulfilled via Express Warehouse. Dispatches within 24 hours.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                    Key Highlights
                  </h4>
                  <ul className="space-y-1.5">
                    {product.features.map((feat, i) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specs Table */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="mb-4 bg-zinc-950/40 rounded-lg p-3 border border-zinc-800/60">
                  <h4 className="text-[11px] font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                    Technical Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-zinc-800/40 py-1">
                        <span className="text-zinc-500 text-[11px]">{k}</span>
                        <span className="text-zinc-300 font-medium text-[11px]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Quantity Selector & Buy Buttons */}
            <div className="pt-4 border-t border-zinc-800">
              {!isOutOfStock && remainingPurchasable > 0 && (
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs text-zinc-400 font-medium">Quantity:</span>
                  <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg">
                    <button
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-zinc-100">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrease}
                      disabled={quantity >= remainingPurchasable}
                      className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    ({remainingPurchasable} available to purchase)
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  id="modal-add-to-cart-btn"
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  disabled={isOutOfStock || remainingPurchasable === 0}
                  className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isOutOfStock
                      ? 'Out of Stock'
                      : remainingPurchasable === 0
                      ? 'Max in Cart'
                      : `Add to Cart • $${(product.price * quantity).toFixed(2)}`}
                  </span>
                </button>

                <button
                  id="modal-instant-buy-btn"
                  onClick={() => {
                    onInstantBuy(product, quantity);
                    onClose();
                  }}
                  disabled={isOutOfStock || remainingPurchasable === 0}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-zinc-500">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Encrypted 256-Bit SSL Checkout with Real-Time Stock Reservation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
