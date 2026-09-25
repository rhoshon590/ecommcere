import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Lock,
  MapPin,
  ShoppingBag,
  X,
} from "lucide-react";
import { formatPrice, useCart } from "../cart/CartContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Shipping = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
};

type Payment = {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
};

type ShippingErrors = Partial<Record<keyof Shipping, string>>;
type PaymentErrors = Partial<Record<keyof Payment, string>>;

const STEPS = ["Cart", "Shipping", "Payment"] as const;

export function Checkout({ open, onClose }: Props) {
  const { lines, subtotal, setQty, remove, clear } = useCart();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [complete, setComplete] = useState(false);

  const [shipping, setShipping] = useState<Shipping>({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "United States",
  });
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});

  const [payment, setPayment] = useState<Payment>({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});
  const [processing, setProcessing] = useState(false);

  const shippingCost = subtotal > 0 ? 12 : 0;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shippingCost + tax;

  const close = () => {
    onClose();
    // Reset after exit animation finishes
    window.setTimeout(() => {
      if (complete) {
        clear();
        setComplete(false);
      }
      setStep(0);
      setDirection(1);
      setShippingErrors({});
      setPaymentErrors({});
    }, 350);
  };

  const validateShipping = (): boolean => {
    const errs: ShippingErrors = {};
    if (!shipping.fullName.trim()) errs.fullName = "Please enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(shipping.email))
      errs.email = "Enter a valid email address";
    if (!shipping.address.trim()) errs.address = "Address is required";
    if (!shipping.city.trim()) errs.city = "City is required";
    if (!/^\d{4,10}$/.test(shipping.zip.trim()))
      errs.zip = "Enter a valid postal code";
    if (!shipping.country.trim()) errs.country = "Country is required";
    setShippingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = (): boolean => {
    const errs: PaymentErrors = {};
    if (!payment.cardName.trim()) errs.cardName = "Name on card is required";
    const digits = payment.cardNumber.replace(/\s/g, "");
    if (!/^\d{16}$/.test(digits)) errs.cardNumber = "Card number must be 16 digits";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiry))
      errs.expiry = "Use MM/YY format";
    if (!/^\d{3,4}$/.test(payment.cvc)) errs.cvc = "CVC must be 3–4 digits";
    setPaymentErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (step === 0) {
      if (lines.length === 0) return;
      setDirection(1);
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!validateShipping()) return;
      setDirection(1);
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!validatePayment()) return;
      setProcessing(true);
      window.setTimeout(() => {
        setProcessing(false);
        setComplete(true);
      }, 1400);
    }
  };

  const back = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-stretch md:items-center justify-center p-0 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Checkout"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="absolute inset-0 bg-primary/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative w-full md:max-w-3xl bg-background md:rounded-2xl shadow-2xl flex flex-col max-h-screen md:max-h-[90vh] overflow-hidden"
          >
            <header className="flex items-center justify-between px-6 md:px-8 pt-6 pb-4 border-b border-border/60">
              <div>
                <p className="uppercase tracking-[0.3em] text-[10px] text-secondary">
                  AuraShop Checkout
                </p>
                <h2 className="font-heading text-2xl text-primary mt-0.5">
                  {complete ? "Order Confirmed" : STEPS[step]}
                </h2>
              </div>
              <button
                onClick={close}
                aria-label="Close checkout"
                className="rounded-full p-2 text-secondary hover:text-primary hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {!complete && (
              <Stepper currentStep={step} />
            )}

            <div className="flex-1 overflow-y-auto scroll-elegant">
              <div className="px-6 md:px-8 py-6 md:py-8 relative">
                <AnimatePresence mode="wait" custom={direction}>
                  {complete ? (
                    <ConfirmationStep
                      key="done"
                      total={total}
                      email={shipping.email}
                      onClose={close}
                    />
                  ) : step === 0 ? (
                    <motion.div
                      key="cart"
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <CartSummaryStep
                        onIncrement={(id, q) => setQty(id, q)}
                        onRemove={remove}
                      />
                    </motion.div>
                  ) : step === 1 ? (
                    <motion.div
                      key="shipping"
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ShippingStep
                        value={shipping}
                        errors={shippingErrors}
                        onChange={(patch) => {
                          setShipping((s) => ({ ...s, ...patch }));
                          const keys = Object.keys(patch) as (keyof Shipping)[];
                          if (keys.length) {
                            setShippingErrors((e) => {
                              const next = { ...e };
                              keys.forEach((k) => delete next[k]);
                              return next;
                            });
                          }
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="payment"
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <PaymentStep
                        value={payment}
                        errors={paymentErrors}
                        onChange={(patch) => {
                          setPayment((p) => ({ ...p, ...patch }));
                          const keys = Object.keys(patch) as (keyof Payment)[];
                          if (keys.length) {
                            setPaymentErrors((e) => {
                              const next = { ...e };
                              keys.forEach((k) => delete next[k]);
                              return next;
                            });
                          }
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {!complete && (
              <footer className="border-t border-border/60 px-6 md:px-8 py-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 bg-background">
                <div className="flex items-center gap-3">
                  {step > 0 && (
                    <button
                      onClick={back}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm text-primary hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-5 justify-end">
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-secondary">
                      Total
                    </p>
                    <motion.p
                      key={total}
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-heading text-2xl text-primary tabular-nums"
                    >
                      {formatPrice(total)}
                    </motion.p>
                  </div>
                  <button
                    onClick={next}
                    disabled={lines.length === 0 || processing}
                    className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-6 py-3 text-sm font-medium tracking-wide hover:bg-accent transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-on-primary/40 border-t-on-primary animate-spin" />
                        Processing
                      </>
                    ) : step === 2 ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Place Order
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* -------------------- Stepper -------------------- */

function Stepper({ currentStep }: { currentStep: number }) {
  const icons = [ShoppingBag, MapPin, CreditCard];

  return (
    <div className="px-6 md:px-8 pt-5 pb-6">
      <div className="flex items-center">
        {STEPS.map((label, i) => {
          const Icon = icons[i];
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{
                    backgroundColor: isDone || isActive ? "var(--color-primary)" : "var(--color-background)",
                    color: isDone || isActive ? "var(--color-on-primary)" : "var(--color-secondary)",
                    borderColor: isDone || isActive ? "var(--color-primary)" : "var(--color-border)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="relative h-9 w-9 rounded-full border flex items-center justify-center"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isDone ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="icon"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Icon className="h-4 w-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span
                  className={`mt-2 text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-secondary"
                  }`}
                >
                  {label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-3 md:mx-4 h-px bg-border relative overflow-hidden -mt-5">
                  <motion.div
                    initial={false}
                    animate={{ scaleX: i < currentStep ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "left center" }}
                    className="absolute inset-0 bg-primary"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- Step 1: Cart Summary -------------------- */

function CartSummaryStep({
  onIncrement,
  onRemove,
}: {
  onIncrement: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const { lines, subtotal } = useCart();
  const shippingCost = subtotal > 0 ? 12 : 0;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shippingCost + tax;

  if (lines.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="font-heading text-2xl text-primary">Your cart is empty</h3>
        <p className="text-sm text-secondary mt-2">
          Add a piece from the collection to begin checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-border/60">
        {lines.map((line) => (
          <li key={line.product.id} className="flex gap-4 py-4 first:pt-0">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-clay">
              <img
                src={line.product.image}
                alt={line.product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-heading text-lg text-primary leading-tight">
                    {line.product.name}
                  </h4>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-secondary mt-0.5">
                    {line.product.category}
                  </p>
                </div>
                <p className="text-sm text-primary tabular-nums">
                  {formatPrice(line.qty * line.product.price)}
                </p>
              </div>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <div className="inline-flex items-center rounded-full border border-border overflow-hidden text-sm">
                  <button
                    onClick={() => onIncrement(line.product.id, line.qty - 1)}
                    aria-label="Decrease quantity"
                    className="px-3 py-1.5 text-secondary hover:text-primary hover:bg-muted transition-colors duration-200 cursor-pointer"
                  >
                    −
                  </button>
                  <span className="min-w-[2ch] text-center text-primary tabular-nums">
                    {line.qty}
                  </span>
                  <button
                    onClick={() => onIncrement(line.product.id, line.qty + 1)}
                    aria-label="Increase quantity"
                    className="px-3 py-1.5 text-secondary hover:text-primary hover:bg-muted transition-colors duration-200 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => onRemove(line.product.id)}
                  className="text-xs text-secondary hover:text-destructive transition-colors duration-200 cursor-pointer underline-offset-4 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-xl bg-muted/60 p-5 space-y-2 text-sm">
        <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
        <SummaryRow label="Shipping" value={formatPrice(shippingCost)} />
        <SummaryRow label="Tax (est.)" value={formatPrice(tax)} />
        <div className="border-t border-border/60 pt-2 mt-2 flex items-center justify-between">
          <span className="font-heading text-lg text-primary">Total</span>
          <span className="font-heading text-lg text-primary tabular-nums">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-secondary">{label}</span>
      <span className="text-primary tabular-nums">{value}</span>
    </div>
  );
}

/* -------------------- Step 2: Shipping -------------------- */

function ShippingStep({
  value,
  errors,
  onChange,
}: {
  value: Shipping;
  errors: ShippingErrors;
  onChange: (patch: Partial<Shipping>) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-secondary">
        Where should we send your stoneware? All fields are required.
      </p>

      <Field
        label="Full Name"
        error={errors.fullName}
        input={
          <input
            type="text"
            autoComplete="name"
            value={value.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            className={inputClass(errors.fullName)}
            placeholder="Iris Hayashi"
          />
        }
      />

      <Field
        label="Email"
        error={errors.email}
        input={
          <input
            type="email"
            autoComplete="email"
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={inputClass(errors.email)}
            placeholder="iris@example.com"
          />
        }
      />

      <Field
        label="Street Address"
        error={errors.address}
        input={
          <input
            type="text"
            autoComplete="street-address"
            value={value.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className={inputClass(errors.address)}
            placeholder="142 Linden Lane"
          />
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="City"
          error={errors.city}
          input={
            <input
              type="text"
              autoComplete="address-level2"
              value={value.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className={inputClass(errors.city)}
              placeholder="Portland"
            />
          }
        />
        <Field
          label="Postal Code"
          error={errors.zip}
          input={
            <input
              type="text"
              autoComplete="postal-code"
              value={value.zip}
              onChange={(e) => onChange({ zip: e.target.value })}
              className={inputClass(errors.zip)}
              placeholder="97204"
            />
          }
        />
      </div>

      <Field
        label="Country"
        error={errors.country}
        input={
          <select
            value={value.country}
            onChange={(e) => onChange({ country: e.target.value })}
            className={inputClass(errors.country)}
          >
            <option>United States</option>
            <option>Canada</option>
            <option>United Kingdom</option>
            <option>Australia</option>
            <option>Japan</option>
          </select>
        }
      />
    </div>
  );
}

/* -------------------- Step 3: Payment -------------------- */

function PaymentStep({
  value,
  errors,
  onChange,
}: {
  value: Payment;
  errors: PaymentErrors;
  onChange: (patch: Partial<Payment>) => void;
}) {
  const formatCardNumber = (raw: string) =>
    raw
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-muted/60 border border-border/60 px-4 py-3 flex items-center gap-3 text-xs text-secondary">
        <Lock className="h-4 w-4" />
        Mock payment — no real card will be charged.
      </div>

      <Field
        label="Name on Card"
        error={errors.cardName}
        input={
          <input
            type="text"
            autoComplete="cc-name"
            value={value.cardName}
            onChange={(e) => onChange({ cardName: e.target.value })}
            className={inputClass(errors.cardName)}
            placeholder="Iris Hayashi"
          />
        }
      />

      <Field
        label="Card Number"
        error={errors.cardNumber}
        input={
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            value={value.cardNumber}
            onChange={(e) =>
              onChange({ cardNumber: formatCardNumber(e.target.value) })
            }
            className={inputClass(errors.cardNumber)}
            placeholder="4242 4242 4242 4242"
          />
        }
      />

      <div className="grid grid-cols-2 gap-5">
        <Field
          label="Expiry (MM/YY)"
          error={errors.expiry}
          input={
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              value={value.expiry}
              onChange={(e) => onChange({ expiry: formatExpiry(e.target.value) })}
              className={inputClass(errors.expiry)}
              placeholder="08/27"
            />
          }
        />
        <Field
          label="CVC"
          error={errors.cvc}
          input={
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              value={value.cvc}
              onChange={(e) =>
                onChange({ cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })
              }
              className={inputClass(errors.cvc)}
              placeholder="123"
            />
          }
        />
      </div>
    </div>
  );
}

/* -------------------- Confirmation -------------------- */

function ConfirmationStep({
  total,
  email,
  onClose,
}: {
  total: number;
  email: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
        className="mx-auto h-16 w-16 rounded-full bg-primary text-on-primary flex items-center justify-center"
      >
        <Check className="h-7 w-7" />
      </motion.div>
      <h3 className="font-heading text-3xl text-primary mt-6">
        Thank you for your order.
      </h3>
      <p className="text-sm text-secondary mt-3 max-w-md mx-auto">
        A confirmation has been sent to{" "}
        <span className="text-primary">{email || "your inbox"}</span>. Each piece
        is carefully wrapped and shipped within five business days.
      </p>
      <p className="font-heading text-2xl text-primary mt-6 tabular-nums">
        {formatPrice(total)}
      </p>
      <button
        onClick={onClose}
        className="mt-8 inline-flex items-center rounded-full bg-primary text-on-primary px-6 py-3 text-sm font-medium hover:bg-accent transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Continue Browsing
      </button>
    </motion.div>
  );
}

/* -------------------- Field primitives -------------------- */

function Field({
  label,
  error,
  input,
}: {
  label: string;
  error?: string;
  input: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.2em] text-secondary mb-2">
        {label}
      </span>
      {input}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="block text-xs text-destructive mt-1.5"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

function inputClass(error?: string) {
  return [
    "w-full rounded-lg bg-background px-4 py-3 text-sm text-primary placeholder:text-secondary/60",
    "border transition-colors duration-200",
    "focus:outline-none focus:ring-2 focus:ring-ring/30",
    error
      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
      : "border-border focus:border-primary",
  ].join(" ");
}
