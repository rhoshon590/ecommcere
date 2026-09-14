import React from 'react';
import { Star, ShoppingBag, Eye, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  cartQuantity: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  cartQuantity
}) => {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isMaxInCart = cartQuantity >= product.stock;

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:shadow-black/40"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
        <img
          src={product.imageUrl}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges on Image */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {product.badges.slice(0, 2).map((badge, idx) => (
            <span
              key={idx}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900/90 text-amber-300 border border-amber-500/30 backdrop-blur-sm shadow-sm"
            >
              {badge}
            </span>
          ))}
        </div>

        {discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-rose-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-md">
            Save {discountPercent}%
          </div>
        )}

        {/* Hover Quick View Trigger */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-zinc-900/90 text-zinc-100 text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            Quick View Specs
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="text-emerald-400 font-medium">{product.category}</span>
            <span className="font-mono text-zinc-500">{product.sku}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="text-sm font-semibold text-zinc-100 line-clamp-2 hover:text-emerald-400 cursor-pointer transition-colors leading-snug mb-1.5"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Reviews Rating */}
          <div className="flex items-center gap-1.5 text-xs mb-2.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : i < product.rating
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'text-zinc-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-zinc-300 font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-zinc-500">({product.reviewCount})</span>
          </div>

          {/* REAL-TIME INVENTORY TRACKER BADGE */}
          <div className="mb-2">
            {isOutOfStock ? (
              <div className="flex items-center gap-1.5 text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-1 rounded text-xs font-medium">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Currently Out of Stock</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-1 rounded text-xs font-semibold animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Only {product.stock} left in stock - order soon!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 px-2 py-1 rounded text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>In Stock ({product.stock} units ready to ship)</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Add to Cart Section */}
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-zinc-100 font-['Space_Grotesk']">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-zinc-500 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock || isMaxInCart}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                : isMaxInCart
                ? 'bg-zinc-800 text-amber-300 border border-amber-500/30 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-md shadow-emerald-950'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {isOutOfStock
                ? 'Out of Stock'
                : isMaxInCart
                ? `Max Stock in Cart (${cartQuantity})`
                : cartQuantity > 0
                ? `Add More (${cartQuantity} in cart)`
                : 'Add to Cart'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
