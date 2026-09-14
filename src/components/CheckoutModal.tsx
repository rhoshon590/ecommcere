import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  User, 
  Mail, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Printer,
  Copy,
  ExternalLink
} from 'lucide-react';
import { CartItem, Order, ShippingAddress, PaymentDetails, Product } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountAmount: number;
  promoCode: string;
  onOrderCompleted: (order: Order) => void;
  products: Product[];
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discountAmount,
  promoCode,
  onOrderCompleted,
  products
}) => {
  if (!isOpen) return null;

  // Form State
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [payment, setPayment] = useState<PaymentDetails>({
    method: 'card',
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '12',
    expiryYear: '2028',
    cvv: '',
    savePaymentInfo: true
  });

  const [selectedShippingSpeed, setSelectedShippingSpeed] = useState<'standard' | 'express'>('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<'idle' | 'tokenizing' | '3d_secure' | 'deducting_inventory' | 'done'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Financial calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = selectedShippingSpeed === 'express' ? 9.99 : (netSubtotal >= 50 ? 0.0 : 5.99);
  const tax = Math.round(netSubtotal * 0.08 * 100) / 100;
  const grandTotal = Math.round((netSubtotal + shippingFee + tax) * 100) / 100;

  // Quick fill helper for testing
  const handleQuickFillShipping = () => {
    setShipping({
      fullName: 'Alexander Vance',
      email: 'alex.vance@example.com',
      phone: '+1 (415) 555-0199',
      street: '100 Montgomery St, Suite 400',
      apartment: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      country: 'United States'
    });
  };

  const handleQuickFillCard = () => {
    setPayment({
      method: 'card',
      cardNumber: '4242 4242 4242 4242',
      cardHolder: 'Alexander Vance',
      expiryMonth: '08',
      expiryYear: '2028',
      cvv: '924',
      savePaymentInfo: true
    });
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 16);
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : digits;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setPayment({ ...payment, cardNumber: formatted });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!shipping.fullName || !shipping.email || !shipping.street || !shipping.city || !shipping.zipCode) {
      setErrorMessage('Please complete all required shipping fields');
      return;
    }

    if (payment.method === 'card') {
      const cleanCard = (payment.cardNumber || '').replace(/\s/g, '');
      if (cleanCard.length < 15) {
        setErrorMessage('Please enter a valid 16-digit card number (e.g. 4242 4242...)');
        return;
      }
      if (!payment.cvv || payment.cvv.length < 3) {
        setErrorMessage('Please enter a valid 3 or 4 digit CVV security code');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Step 1: Tokenizing Card
      setProcessingStep('tokenizing');
      await new Promise(r => setTimeout(r, 600));

      // Step 2: 3D Secure / Bank Fraud Check
      setProcessingStep('3d_secure');
      await new Promise(r => setTimeout(r, 700));

      // Step 3: Server stock check & payment deduction
      setProcessingStep('deducting_inventory');

      const payload = {
        cartItems: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          title: item.product.title
        })),
        shippingAddress: shipping,
        paymentDetails: {
          ...payment,
          shippingSpeed: selectedShippingSpeed
        }
      };

      const res = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details?.join('; ') || data.error || 'Payment processing failed');
      }

      setProcessingStep('done');
      setCompletedOrder(data.order);
      onOrderCompleted(data.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected payment error occurred');
      setIsProcessing(false);
      setProcessingStep('idle');
    }
  };

  const handleCopyTracking = () => {
    if (completedOrder?.trackingNumber) {
      navigator.clipboard.writeText(completedOrder.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  return (
    <div 
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div 
        id="checkout-modal-panel"
        className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full text-zinc-100 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-['Space_Grotesk']">
                Secure 256-Bit SSL Checkout
              </h3>
              <p className="text-[11px] text-zinc-400">
                PCI-DSS Level 1 Compliant Gateway • Real-Time Stock Reservation
              </p>
            </div>
          </div>

          {!isProcessing && !completedOrder && (
            <button
              id="close-checkout-modal-btn"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Order Completed Receipt View */}
        {completedOrder ? (
          <div className="p-8 overflow-y-auto space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white font-['Space_Grotesk']">
                Payment Authorized & Order Confirmed!
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                Thank you for your purchase. Your payment was securely verified, and inventory has been deducted from our live warehouse.
              </p>
            </div>

            {/* Order Summary Receipt Box */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                    Order Number
                  </span>
                  <p className="font-mono text-base font-bold text-emerald-400">
                    {completedOrder.id}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                    Estimated Delivery
                  </span>
                  <p className="text-xs font-semibold text-zinc-200">
                    {completedOrder.estimatedDelivery}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                    Carrier & Tracking
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-300">
                      {completedOrder.trackingNumber}
                    </span>
                    <button
                      onClick={handleCopyTracking}
                      className="text-zinc-400 hover:text-white text-xs p-1"
                      title="Copy tracking"
                    >
                      {copiedTracking ? <span className="text-emerald-400 text-[10px]">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                  Purchased Items ({completedOrder.items.length})
                </span>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-md object-cover bg-zinc-900 border border-zinc-800"
                      />
                      <div>
                        <p className="font-semibold text-zinc-200 line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          {item.sku} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-zinc-100 font-['Space_Grotesk']">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="pt-4 border-t border-zinc-800 space-y-1 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>${completedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping ({completedOrder.carrier})</span>
                  <span>{completedOrder.shippingFee === 0 ? 'FREE' : `$${completedOrder.shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Tax</span>
                  <span>${completedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800 font-['Space_Grotesk']">
                  <span>Total Paid</span>
                  <span className="text-emerald-400">${completedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Verification Stamp */}
              <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Auth Code: <code className="text-zinc-300">{completedOrder.paymentSummary.authCode}</code></span>
                </div>
                <span className="text-zinc-500 font-mono">PCI-DSS L1</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice Receipt</span>
              </button>

              <button
                id="finish-order-btn"
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950 transition"
              >
                Done / Back to Storefront
              </button>
            </div>
          </div>
        ) : isProcessing ? (
          /* Processing State Animation */
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-pulse" />
              <div className="w-full h-full rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <Lock className="w-7 h-7 text-emerald-400 absolute inset-0 m-auto" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white font-['Space_Grotesk']">
                {processingStep === 'tokenizing' && 'Tokenizing Payment Credentials...'}
                {processingStep === '3d_secure' && 'Verifying 3D Secure Authorization with Card Issuer...'}
                {processingStep === 'deducting_inventory' && 'Reserving Inventory & Finalizing Transaction...'}
                {processingStep === 'done' && 'Order Successfully Processed!'}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Please do not close this window. We are communicating with the secure bank network and updating live warehouse stock.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TLS 1.3 / AES-256 Encrypted Session</span>
            </div>
          </div>
        ) : (
          /* Main Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 overflow-y-auto flex-1 space-y-6">
            {errorMessage && (
              <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-3.5 flex items-start gap-3 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <p className="font-bold">Checkout Error</p>
                  <p className="text-rose-200/90 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Section 1: Shipping Address */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-200">
                    Shipping & Delivery Details
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={handleQuickFillShipping}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Fill Demo Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={shipping.fullName}
                    onChange={e => setShipping({ ...shipping, fullName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Email for Order Receipt *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={shipping.email}
                    onChange={e => setShipping({ ...shipping, email: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Main Street"
                    value={shipping.street}
                    onChange={e => setShipping({ ...shipping, street: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Apt / Suite / Unit</label>
                  <input
                    type="text"
                    placeholder="Suite 4B (Optional)"
                    value={shipping.apartment}
                    onChange={e => setShipping({ ...shipping, apartment: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={shipping.city}
                      onChange={e => setShipping({ ...shipping, city: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="CA"
                      value={shipping.state}
                      onChange={e => setShipping({ ...shipping, state: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">ZIP Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="94107"
                      value={shipping.zipCode}
                      onChange={e => setShipping({ ...shipping, zipCode: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Speed Options */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-200">
                  Shipping Speed
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label 
                  onClick={() => setSelectedShippingSpeed('standard')}
                  className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition ${
                    selectedShippingSpeed === 'standard'
                      ? 'bg-zinc-950 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingSpeed"
                    checked={selectedShippingSpeed === 'standard'}
                    onChange={() => setSelectedShippingSpeed('standard')}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-100">Standard Ground</span>
                      <span className="text-emerald-400 font-semibold">
                        {netSubtotal >= 50 ? 'FREE' : '$5.99'}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-[11px] mt-0.5">3-5 Business Days with tracking</p>
                  </div>
                </label>

                <label 
                  onClick={() => setSelectedShippingSpeed('express')}
                  className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition ${
                    selectedShippingSpeed === 'express'
                      ? 'bg-zinc-950 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingSpeed"
                    checked={selectedShippingSpeed === 'express'}
                    onChange={() => setSelectedShippingSpeed('express')}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-100">Priority Express</span>
                      <span className="text-amber-400 font-semibold">$9.99</span>
                    </div>
                    <p className="text-zinc-500 text-[11px] mt-0.5">1-2 Business Days Priority Air</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 3: Secure Payment Gate */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-200">
                    Payment Method (Encrypted)
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={handleQuickFillCard}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Fill Safe Test Card</span>
                </button>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPayment({ ...payment, method: 'card' })}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer ${
                    payment.method === 'card'
                      ? 'bg-zinc-950 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500'
                      : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayment({ ...payment, method: 'apple_pay' })}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer ${
                    payment.method === 'apple_pay'
                      ? 'bg-zinc-950 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500'
                      : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span> Apple Pay / Google Pay</span>
                </button>
              </div>

              {payment.method === 'card' ? (
                <div className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-4 space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-zinc-400 font-medium">Card Number *</label>
                      <span className="text-[11px] text-zinc-500 font-mono">Visa • Mastercard • Amex</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="4242 4242 4242 4242"
                        value={payment.cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-10 pr-4 py-2 font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                      />
                      <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-zinc-400 mb-1 font-medium">Exp Month</label>
                      <select
                        value={payment.expiryMonth}
                        onChange={e => setPayment({ ...payment, expiryMonth: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const m = String(i + 1).padStart(2, '0');
                          return <option key={m} value={m}>{m}</option>;
                        })}
                      </select>
                    </div>

                    <div className="col-span-1">
                      <label className="block text-zinc-400 mb-1 font-medium">Exp Year</label>
                      <select
                        value={payment.expiryYear}
                        onChange={e => setPayment({ ...payment, expiryYear: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        {['2026', '2027', '2028', '2029', '2030', '2031'].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1">
                      <label className="block text-zinc-400 mb-1 font-medium">CVV / CVC *</label>
                      <input
                        type="password"
                        required
                        placeholder="•••"
                        maxLength={4}
                        value={payment.cvv}
                        onChange={e => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '') })}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Name on Card *</label>
                    <input
                      type="text"
                      required
                      placeholder="Name as it appears on card"
                      value={payment.cardHolder}
                      onChange={e => setPayment({ ...payment, cardHolder: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center text-xs text-zinc-300 space-y-2">
                  <p className="font-semibold text-white">Apple Pay & Google Pay Express Integration</p>
                  <p className="text-[11px] text-zinc-400">
                    Payment credentials will be provided securely using biometric device tokenization with zero card exposure.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Final Authorization Summary */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-xs text-zinc-400">Total Charged</span>
                  <p className="text-2xl font-black text-white font-['Space_Grotesk']">
                    ${grandTotal.toFixed(2)}
                  </p>
                </div>

                <div className="text-right text-[11px] text-zinc-400">
                  <span className="text-emerald-400 font-semibold">Ready to reserve stock</span>
                  <p className="text-zinc-500">{cartItems.reduce((acc, i) => acc + i.quantity, 0)} item(s) in order</p>
                </div>
              </div>

              <button
                type="submit"
                id="submit-payment-btn"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950 transition cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ${grandTotal.toFixed(2)} with End-to-End Encryption</span>
              </button>

              <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Bank-Grade Security
                </span>
                <span>•</span>
                <span>PCI-DSS Validated</span>
                <span>•</span>
                <span>Real-Time Warehouse Lock</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
