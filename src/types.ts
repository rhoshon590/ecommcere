export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  badges: string[];
  features: string[];
  specs?: Record<string, string>;
  isFeatured?: boolean;
}

export type InventoryChangeReason =
  | 'ORDER_PURCHASE'
  | 'MANUAL_RESTOCK'
  | 'DAMAGE_ADJUSTMENT'
  | 'INITIAL_SEED'
  | 'SIMULATED_CHANNEL_SALE';

export interface InventoryAuditEntry {
  id: string;
  productId: string;
  productTitle: string;
  previousStock: number;
  newStock: number;
  change: number;
  reason: InventoryChangeReason;
  timestamp: string;
  referenceId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentDetails {
  method: 'card' | 'apple_pay' | 'google_pay';
  cardNumber?: string;
  cardHolder?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  savePaymentInfo?: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentSummary: {
    method: string;
    cardLast4?: string;
    transactionId: string;
    authCode: string;
    status: 'PAID';
    timestamp: string;
    pciCompliance: string;
  };
  fulfillmentStatus: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  trackingNumber: string;
  carrier: string;
  createdAt: string;
  estimatedDelivery: string;
}

export interface InventorySummary {
  totalSkus: number;
  totalUnitsInStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValuation: number;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string; payload?: any }[];
  orderCard?: Order;
  productCard?: Product;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: 'Order Status & Tracking' | 'Returns & Refunds' | 'Inventory & Restock' | 'Payment & Security' | 'Merchant Operations';
  priority: 'Normal' | 'High' | 'Urgent (24/7 Priority)';
  message: string;
  orderId?: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  createdAt: string;
  estimatedResolutionMinutes: number;
  responseNote?: string;
}
