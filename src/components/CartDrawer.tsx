import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight, 
  Tag, 
  Check, 
  Truck,
  AlertCircle
} from 'lucide-react';
import { CartItem, Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  products: Product[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (discountAmount: number, promoCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Calculate live subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Promo codes: SHOPIFY20 (20%), WELCOME10 ($10 off)
  let discount = 0;
  if (appliedPromo === 'SHOPIFY20') {
    discount = Math.round(subtotal * 0.2 * 100) / 100;
  } else if (appliedPromo === 'WELCOME10') {
    discount = Math.min(subtotal, 10.0);
  }

  const freeShippingThreshold = 50.0;
  const progressToFreeShip = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShip = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoInput.trim().toUpperCase();
    if (code === 'SHOPIFY20' || code === 'WELCOME10') {
      setAppliedPromo(code);
      setPromoInput('');
    } else {
      setPromoError('Invalid coupon. Try "SHOPIFY20" or "WELCOME10"');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  return (
    <div 
      id="cart-drawer-backdrop" 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div 
        id="cart-drawer-panel"
        className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col justify-between shadow-2xl text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base tracking-tight font-['Space_Grotesk']">
              Your Shopping Cart
            </h3>
            <span className="text-xs bg-zinc-800 text-zinc-300 font-bold px-2 py-0.5 rounded-full">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>

          <button
            id="close-cart-drawer-btn"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-6 py-2.5 bg-zinc-950/40 border-b border-zinc-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              {amountToFreeShip === 0 ? (
                <span className="text-emerald-400 font-semibold">
                  You unlocked Free Fast Delivery!
                </span>
              ) : (
                <span>
                  Add <strong className="text-emerald-400">${amountToFreeShip.toFixed(2)}</strong> more for Free Shipping
                </span>
              )}
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">{progressToFreeShip}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressToFreeShip}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <div className="w-14 h-14 rounded-full bg-zinc-800/80 flex items-center justify-center mb-3">
                <ShoppingBag className="w-7 h-7 text-zinc-500" />
              </div>
              <p className="font-semibold text-zinc-200 mb-1">Your cart is empty</p>
              <p className="text-xs text-zinc-500 max-w-xs mb-4">
                Explore our curated catalog of artisan barista gear, high-performance electronics, and lifestyle essentials.
              </p>
              <button
                onClick={onClose}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Browse Products
              </button>
            </div>
          ) : (
            cartItems.map(item => {
              // Find matching live product to check current warehouse stock
              const liveProduct = products.find(p => p.id === item.product.id) || item.product;
              const isOverStock = item.quantity > liveProduct.stock;
              const isMaxStock = item.quantity >= liveProduct.stock;

              return (
                <div 
                  key={item.product.id}
                  className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3 flex gap-3 relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover rounded-lg bg-zinc-900 shrink-0 border border-zinc-800"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-zinc-100 line-clamp-1">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="font-mono text-zinc-500">{item.product.sku}</span>
                        <span>•</span>
                        <span>${item.product.price.toFixed(2)} each</span>
                      </div>
                    </div>

                    {/* Stock Warning if inventory decreased */}
                    {isOverStock && (
                      <div className="flex items-center gap-1 text-[11px] text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Only {liveProduct.stock} left in warehouse</span>
                      </div>
                    )}

                    {/* Stepper & Line Total */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/50">
                      <div className="flex items-center bg-zinc-900 border border-zinc-700/60 rounded-md">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-zinc-400 hover:text-white transition cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-zinc-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={isMaxStock}
                          className="px-2 py-0.5 text-zinc-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-white font-['Space_Grotesk']">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Checkout Controls */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-950/70 space-y-4">
            {/* Promo Code Form */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Coupon <strong>{appliedPromo}</strong> applied (-${discount.toFixed(2)})</span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-zinc-400 hover:text-zinc-200 text-[11px] underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. SHOPIFY20)"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  >
                    Apply
                  </button>
                </form>
              )}
              {promoError && (
                <p className="text-[11px] text-rose-400 mt-1">{promoError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-200 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span>{amountToFreeShip === 0 ? 'FREE' : '$5.99'}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Estimated Sales Tax (8%)</span>
                <span>${(Math.round((subtotal - discount) * 0.08 * 100) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800 font-['Space_Grotesk']">
                <span>Estimated Total</span>
                <span>
                  $
                  {(
                    (subtotal - discount) +
                    (amountToFreeShip === 0 ? 0 : 5.99) +
                    Math.round((subtotal - discount) * 0.08 * 100) / 100
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Trigger Button */}
            <button
              id="proceed-to-checkout-btn"
              onClick={() => onProceedToCheckout(discount, appliedPromo || '')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>

            {/* Payment security trust marks */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-400 pt-1">
              <span>💳 Visa / Mastercard / Amex</span>
              <span>•</span>
              <span>🔒 256-Bit SSL PCI Compliant</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
