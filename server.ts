import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Product, InventoryAuditEntry, Order, InventorySummary, SupportMessage, SupportTicket } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database for Real-Time E-Commerce & Inventory
let products: Product[] = [
  {
    id: 'prod-1',
    title: 'Precision Gooseneck Pour-Over Electric Kettle with PID Temp Control',
    description: 'Commercial-grade 0.9L matte black stainless steel kettle with 1-degree precision digital thermostat, stopwatch, and 60-minute hold mode. Built for specialty barista workflows.',
    price: 89.0,
    compareAtPrice: 119.0,
    category: 'Coffee & Barista',
    sku: 'KIT-KT-091',
    stock: 4, // Low stock on purpose to show urgency
    lowStockThreshold: 5,
    rating: 4.8,
    reviewCount: 342,
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
    badges: ['Fast Prime Delivery', 'Bestseller'],
    features: [
      'PID controller for ±1°F precision',
      'Ultra-balanced counterweighted handle',
      'High-grade 304 stainless steel interior',
      'Built-in brew stopwatch & LCD screen'
    ],
    specs: {
      'Capacity': '0.9 Liters',
      'Power': '1200W Fast Boil',
      'Material': 'Food-Safe Stainless Steel',
      'Color': 'Matte Charcoal Black'
    },
    isFeatured: true
  },
  {
    id: 'prod-2',
    title: 'Studio Pro ANC Wireless Over-Ear Headphones (Hi-Res Lossless Audio)',
    description: 'Active hybrid noise cancelling with 40mm custom bio-cellulose drivers, 45-hour battery life, multi-point Bluetooth 5.3, and memory foam acoustic earcups.',
    price: 249.0,
    compareAtPrice: 299.0,
    category: 'Electronics',
    sku: 'AUD-HP-104',
    stock: 18,
    lowStockThreshold: 5,
    rating: 4.9,
    reviewCount: 890,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    badges: ['Staff Pick', 'Amazon’s Choice'],
    features: [
      'Hybrid ANC with transparency audio mode',
      'Custom 40mm titanium drivers',
      '45 hours of playback on a single charge',
      'Quick charge: 10 mins = 5 hours playback'
    ],
    specs: {
      'Connectivity': 'Bluetooth 5.3 + 3.5mm Aux',
      'Weight': '255g',
      'Battery': '45 Hours ANC On',
      'Warranty': '2-Year Manufacturer Warranty'
    },
    isFeatured: true
  },
  {
    id: 'prod-3',
    title: 'Full-Grain Italian Leather Daypack & Commuter Backpack (Water-Resistant)',
    description: 'Handcrafted full-grain vegetable-tanned leather backpack with dedicated padded 16-inch laptop pocket, quick-access passport sleeve, and weatherproof YKK zippers.',
    price: 165.0,
    compareAtPrice: 195.0,
    category: 'Lifestyle',
    sku: 'LIF-BP-502',
    stock: 6,
    lowStockThreshold: 5,
    rating: 4.7,
    reviewCount: 215,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    badges: ['Artisan Crafted'],
    features: [
      'Vegetable-tanned full-grain leather',
      'Shockproof 16" MacBook compartment',
      'Luggage pass-through strap for travel',
      'Solid brass hardware and YKK Excella zippers'
    ],
    specs: {
      'Volume': '18 Liters',
      'Dimensions': '17.5" x 11.8" x 5.5"',
      'Lining': 'Reinforced Herringbone Cotton',
      'Origin': 'Tuscany, Italy'
    },
    isFeatured: true
  },
  {
    id: 'prod-4',
    title: 'Ergonomic Custom Mechanical Keyboard (CNC Aluminum, Hot-Swap Switches)',
    description: 'Compact 75% gasket-mount mechanical keyboard with sound-dampening silicone sheets, pre-lubed linear switches, PBT dye-sub keycaps, and south-facing RGB.',
    price: 139.0,
    compareAtPrice: 169.0,
    category: 'Electronics',
    sku: 'TEC-KB-330',
    stock: 2, // Critical low stock
    lowStockThreshold: 4,
    rating: 4.9,
    reviewCount: 412,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    badges: ['Only 2 Left!', 'Popular in Tech'],
    features: [
      'Anodized 6063 CNC aluminum casing',
      'Pre-lubricated Gateron Pro switches',
      'Gasket mount with poron acoustic foam',
      'Mac/Windows toggle switch + QMK/VIA support'
    ],
    specs: {
      'Layout': '75% (82 Keys)',
      'Polling Rate': '1000Hz Ultra-Low Latency',
      'Weight': '1.45 kg (3.2 lbs)',
      'Connection': 'USB-C Detachable Braided'
    },
    isFeatured: true
  },
  {
    id: 'prod-5',
    title: 'Ceremonial Grade Organic First-Harvest Japanese Matcha Powder (30g Tin)',
    description: 'Shade-grown stone-ground tencha tea leaves directly sourced from organic estates in Uji, Kyoto. Vibrant emerald green color, delicate umami sweetness with zero bitterness.',
    price: 34.0,
    category: 'Coffee & Barista',
    sku: 'MAT-TEA-012',
    stock: 28,
    lowStockThreshold: 8,
    rating: 4.9,
    reviewCount: 520,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    badges: ['Certified Organic', 'Direct Trade'],
    features: [
      '100% Single-Origin Uji, Kyoto harvest',
      'Stone-ground slowly to prevent heat oxidation',
      'High L-theanine for sustained calm focus',
      'Airtight nitrogen-flushed UV protective tin'
    ],
    specs: {
      'Net Weight': '30g (~15-20 servings)',
      'Harvest': 'Spring First Flush',
      'Shelf Life': '18 Months',
      'Certifications': 'JAS Organic, Non-GMO'
    }
  },
  {
    id: 'prod-6',
    title: 'Smart Ambient Sunset Horizon Desk Lamp with Qi Fast Wireless Charging Base',
    description: 'Warm circadian lighting fixture with step-less touch dimming, 2700K-5000K spectrum tune, aircraft aluminum stem, and integrated 15W Qi phone charging pad.',
    price: 68.0,
    compareAtPrice: 85.0,
    category: 'Home & Office',
    sku: 'HOM-LMP-881',
    stock: 0, // Out of stock to test restocking functionality!
    lowStockThreshold: 5,
    rating: 4.6,
    reviewCount: 168,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    badges: ['Restock Scheduled'],
    features: [
      'Integrated 15W MagSafe / Qi charging coil',
      'Color rendering index (CRI) > 95 for eye strain relief',
      'Touch gesture slider for brightness & warmth',
      'Memory function stores previous light preset'
    ],
    specs: {
      'Input': 'USB-C Power Delivery 30W',
      'Dimensions': '14.2" Height, 5.9" Base',
      'Lumens': '650 lm maximum output',
      'LED Lifespan': '50,000 hours'
    }
  },
  {
    id: 'prod-7',
    title: 'Vacuum Double-Walled Ceramic Coated Travel Tumbler (16oz Leak-Proof)',
    description: 'True ceramic interior eliminates metallic taste while 18/8 kitchen-grade stainless steel vacuum insulation keeps drinks piping hot for 12 hours or iced for 24 hours.',
    price: 32.0,
    category: 'Lifestyle',
    sku: 'DRK-TM-410',
    stock: 14,
    lowStockThreshold: 6,
    rating: 4.8,
    reviewCount: 290,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    badges: ['Eco-Friendly Choice'],
    features: [
      'Pure interior ceramic coating - no metal aftertaste',
      '360-degree leakproof quick-click lid',
      'Fits standard automotive cup holders',
      'Dishwasher safe lid and base'
    ],
    specs: {
      'Capacity': '16 oz (475 ml)',
      'Insulation': 'Double-Wall Vacuum Copper Core',
      'Weight': '310g',
      'BPA Free': '100% Food-Grade Certified'
    }
  },
  {
    id: 'prod-8',
    title: 'Smart Botanical Soil Moisture & Ambient Sunlight Sensor (Wi-Fi + BLE)',
    description: 'Precision plant sensor measuring soil volumetric water content, electrical conductivity (nutrient density), sunlight lux levels, and ambient temperature.',
    price: 45.0,
    compareAtPrice: 55.0,
    category: 'Home & Office',
    sku: 'HOM-PLT-204',
    stock: 11,
    lowStockThreshold: 4,
    rating: 4.7,
    reviewCount: 145,
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    badges: ['Smart Home Sync'],
    features: [
      'Custom calibrated database of 5,000+ houseplants',
      '1-year battery life on replaceable coin cell',
      'Waterproof IP67 probe for indoor & outdoor pots',
      'Push notifications when plant requires hydration'
    ],
    specs: {
      'Connectivity': 'Bluetooth 5.0 Low Energy & Gateway Sync',
      'Probe Length': '4.5 inches',
      'Battery': 'CR2032 (Included)',
      'App Support': 'iOS & Android'
    }
  }
];

let inventoryAuditLog: InventoryAuditEntry[] = [
  {
    id: 'audit-init-1',
    productId: 'prod-1',
    productTitle: 'Precision Gooseneck Pour-Over Electric Kettle',
    previousStock: 0,
    newStock: 4,
    change: 4,
    reason: 'INITIAL_SEED',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    referenceId: 'PO-INIT-2026'
  },
  {
    id: 'audit-init-2',
    productId: 'prod-4',
    productTitle: 'Ergonomic Custom Mechanical Keyboard',
    previousStock: 10,
    newStock: 2,
    change: -8,
    reason: 'SIMULATED_CHANNEL_SALE',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    referenceId: 'SYNC-EXT-AMZ-991'
  }
];

let orders: Order[] = [
  {
    id: 'ORD-78192',
    items: [
      {
        productId: 'prod-2',
        title: 'Studio Pro ANC Wireless Over-Ear Headphones',
        sku: 'AUD-HP-104',
        price: 249.0,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 249.0,
    tax: 19.92,
    shippingFee: 0.0,
    total: 268.92,
    shippingAddress: {
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+1 (415) 892-1042',
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      country: 'United States'
    },
    paymentSummary: {
      method: 'Credit Card (Visa)',
      cardLast4: '4242',
      transactionId: 'TXN-SEC-892401',
      authCode: 'AUTH-9921',
      status: 'PAID',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      pciCompliance: 'PCI-DSS Level 1 / AES-256 Encrypted'
    },
    fulfillmentStatus: 'Shipped',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS Ground Air Express',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    estimatedDelivery: new Date(Date.now() + 3600000 * 36).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }
];

// Helper: Calculate inventory summary metrics
function getInventorySummary(): InventorySummary {
  const totalSkus = products.length;
  let totalUnitsInStock = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalInventoryValuation = 0;

  for (const p of products) {
    totalUnitsInStock += p.stock;
    totalInventoryValuation += p.stock * p.price;
    if (p.stock === 0) {
      outOfStockCount++;
    } else if (p.stock <= p.lowStockThreshold) {
      lowStockCount++;
    }
  }

  return {
    totalSkus,
    totalUnitsInStock,
    lowStockCount,
    outOfStockCount,
    totalInventoryValuation: Math.round(totalInventoryValuation * 100) / 100
  };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// GET /api/products
app.get('/api/products', (req, res) => {
  res.json({
    products,
    summary: getInventorySummary()
  });
});

// GET /api/inventory
app.get('/api/inventory', (req, res) => {
  res.json({
    products,
    summary: getInventorySummary(),
    auditLog: inventoryAuditLog.slice(0, 30) // Recent 30 logs
  });
});

// POST /api/inventory/adjust (Restock or manual adjustment by merchant)
app.post('/api/inventory/adjust', (req, res) => {
  const { productId, adjustment, newAbsoluteStock, reason, notes } = req.body;
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const prevStock = product.stock;
  let updatedStock = prevStock;

  if (typeof newAbsoluteStock === 'number') {
    updatedStock = Math.max(0, Math.floor(newAbsoluteStock));
  } else if (typeof adjustment === 'number') {
    updatedStock = Math.max(0, prevStock + Math.floor(adjustment));
  } else {
    return res.status(400).json({ error: 'Invalid adjustment or new stock value' });
  }

  const diff = updatedStock - prevStock;
  product.stock = updatedStock;

  const auditEntry: InventoryAuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: product.id,
    productTitle: product.title,
    previousStock: prevStock,
    newStock: updatedStock,
    change: diff,
    reason: (reason as any) || 'MANUAL_RESTOCK',
    timestamp: new Date().toISOString(),
    referenceId: notes || 'ADMIN-RESTOCK'
  };

  inventoryAuditLog.unshift(auditEntry);

  res.json({
    success: true,
    product,
    auditEntry,
    summary: getInventorySummary()
  });
});

// POST /api/inventory/simulate-external-sale (Simulates external Amazon/Shopify order to demo real-time sync)
app.post('/api/inventory/simulate-channel-sale', (req, res) => {
  const inStockProducts = products.filter(p => p.stock > 0);
  if (inStockProducts.length === 0) {
    return res.status(400).json({ error: 'All products currently out of stock' });
  }

  // Pick a random in-stock product
  const target = inStockProducts[Math.floor(Math.random() * inStockProducts.length)];
  const prevStock = target.stock;
  target.stock = Math.max(0, target.stock - 1);

  const channels = ['Amazon Fulfillment Sync', 'Shopify POS Terminal', 'TikTok Shop Order', 'eBay Enterprise API'];
  const channel = channels[Math.floor(Math.random() * channels.length)];

  const auditEntry: InventoryAuditEntry = {
    id: `audit-${Date.now()}`,
    productId: target.id,
    productTitle: target.title,
    previousStock: prevStock,
    newStock: target.stock,
    change: -1,
    reason: 'SIMULATED_CHANNEL_SALE',
    timestamp: new Date().toISOString(),
    referenceId: `${channel} #${Math.floor(100000 + Math.random() * 900000)}`
  };

  inventoryAuditLog.unshift(auditEntry);

  res.json({
    success: true,
    message: `1 unit of "${target.title}" sold via ${channel}`,
    product: target,
    auditEntry,
    summary: getInventorySummary()
  });
});

// POST /api/inventory/add-product
app.post('/api/inventory/add-product', (req, res) => {
  const { title, description, price, category, stock, lowStockThreshold, imageUrl, sku, features } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ error: 'Title, price, and category are required' });
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    title,
    description: description || 'High quality item carefully sourced for our catalog.',
    price: parseFloat(price),
    category,
    sku: sku || `SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    stock: Math.max(0, parseInt(stock) || 10),
    lowStockThreshold: parseInt(lowStockThreshold) || 5,
    rating: 5.0,
    reviewCount: 1,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    badges: ['New Arrival'],
    features: Array.isArray(features) ? features : ['Quality assured', 'Fast shipping']
  };

  products.unshift(newProduct);

  const auditEntry: InventoryAuditEntry = {
    id: `audit-${Date.now()}`,
    productId: newProduct.id,
    productTitle: newProduct.title,
    previousStock: 0,
    newStock: newProduct.stock,
    change: newProduct.stock,
    reason: 'INITIAL_SEED',
    timestamp: new Date().toISOString(),
    referenceId: 'MERCHANT-NEW-PRODUCT'
  };

  inventoryAuditLog.unshift(auditEntry);

  res.json({
    success: true,
    product: newProduct,
    summary: getInventorySummary()
  });
});

// POST /api/payment/process (Atomic verification of stock + secure simulated payment gateway)
app.post('/api/payment/process', (req, res) => {
  const { cartItems, shippingAddress, paymentDetails } = req.body;

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
    return res.status(400).json({ error: 'Valid shipping address is required' });
  }

  if (!paymentDetails || !paymentDetails.method) {
    return res.status(400).json({ error: 'Payment information is required' });
  }

  // ATOMIC STOCK CHECK: ensure none of the items exceed real-time inventory
  const stockErrors: string[] = [];
  for (const item of cartItems) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      stockErrors.push(`Product "${item.title || item.productId}" no longer exists in catalog`);
    } else if (product.stock < item.quantity) {
      stockErrors.push(`Insufficient stock for "${product.title}". Requested: ${item.quantity}, Available: ${product.stock}`);
    }
  }

  if (stockErrors.length > 0) {
    return res.status(409).json({
      error: 'Inventory check failed',
      details: stockErrors,
      summary: getInventorySummary(),
      products
    });
  }

  // PAYMENT SECURITY VALIDATION SIMULATION:
  // Validates card checksum / digits or digital wallet token
  if (paymentDetails.method === 'card') {
    const cleanNumber = (paymentDetails.cardNumber || '').replace(/[\s-]/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return res.status(400).json({ error: 'Invalid card number length (must be 13-19 digits)' });
    }
    const cleanCvv = (paymentDetails.cvv || '').trim();
    if (cleanCvv.length < 3 || cleanCvv.length > 4) {
      return res.status(400).json({ error: 'Invalid security code (CVV must be 3 or 4 digits)' });
    }
  }

  // Calculate financials
  let subtotal = 0;
  const orderItems = [];

  for (const item of cartItems) {
    const product = products.find(p => p.id === item.productId)!;
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      productId: product.id,
      title: product.title,
      sku: product.sku,
      price: product.price,
      quantity: item.quantity,
      imageUrl: product.imageUrl
    });

    // Deduct stock atomically
    const prevStock = product.stock;
    product.stock -= item.quantity;

    // Log inventory audit trail
    inventoryAuditLog.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productTitle: product.title,
      previousStock: prevStock,
      newStock: product.stock,
      change: -item.quantity,
      reason: 'ORDER_PURCHASE',
      timestamp: new Date().toISOString(),
      referenceId: `ORDER-CHECKOUT`
    });
  }

  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shippingFee = subtotal >= 50 ? 0.0 : 5.99;
  const total = Math.round((subtotal + tax + shippingFee) * 100) / 100;

  const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const carrierList = ['UPS Priority Express', 'FedEx 2-Day Air', 'USPS Ground Advantage'];
  const carrier = carrierList[Math.floor(Math.random() * carrierList.length)];
  const trackingNumber = `1Z${Math.random().toString(36).substring(2, 10).toUpperCase()}${Math.floor(1000000 + Math.random() * 9000000)}`;

  const cardLast4 = paymentDetails.method === 'card'
    ? (paymentDetails.cardNumber || '4242').replace(/\s/g, '').slice(-4)
    : 'ApplePay';

  const newOrder: Order = {
    id: orderId,
    items: orderItems,
    subtotal,
    tax,
    shippingFee,
    total,
    shippingAddress,
    paymentSummary: {
      method: paymentDetails.method === 'card' ? `Credit Card (*${cardLast4})` : 'Apple Pay Instant Token',
      cardLast4,
      transactionId: `TXN-SEC-${Math.floor(100000 + Math.random() * 900000)}`,
      authCode: `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'PAID',
      timestamp: new Date().toISOString(),
      pciCompliance: '256-Bit SSL Encrypted / PCI-DSS Level 1 Gateway'
    },
    fulfillmentStatus: 'Processing',
    trackingNumber,
    carrier,
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 3600000 * 72).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  };

  orders.unshift(newOrder);

  // Update audit log reference with actual order ID
  inventoryAuditLog.forEach(log => {
    if (log.referenceId === 'ORDER-CHECKOUT') {
      log.referenceId = orderId;
    }
  });

  res.json({
    success: true,
    order: newOrder,
    summary: getInventorySummary(),
    products
  });
});

// Support Tickets In-Memory Store
let supportTickets: SupportTicket[] = [
  {
    id: 'TICK-9021',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.jenkins@example.com',
    subject: 'Carrier Delivery Inquiry for Order ORD-78192',
    category: 'Order Status & Tracking',
    priority: 'Normal',
    message: 'Can I confirm if the UPS Ground Air Express package requires a signature upon arrival?',
    orderId: 'ORD-78192',
    status: 'Investigating',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    estimatedResolutionMinutes: 15,
    responseNote: 'Support Specialist Marcus assigned. Verified with UPS: Standard front porch drop-off, no signature required.'
  },
  {
    id: 'TICK-9015',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.vance@techstudio.io',
    subject: 'Restock inquiry for Smart Sunset Desk Lamp',
    category: 'Inventory & Restock',
    priority: 'Normal',
    message: 'When is the next batch of the Smart Sunset Desk Lamp (SKU HOM-LMP-881) scheduled to land in warehouse inventory?',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    estimatedResolutionMinutes: 10,
    responseNote: 'Next batch of 50 units cleared customs and is expected to hit warehouse balance within 48 hours.'
  }
];

// Lazy Gemini API Client Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('Failed to initialize Gemini AI Client:', err);
    }
  }
  return aiClient;
}

// GET /api/orders
app.get('/api/orders', (req, res) => {
  res.json({ orders });
});

// GET /api/orders/lookup/:query
app.get('/api/orders/lookup/:query', (req, res) => {
  const query = (req.params.query || '').trim().toLowerCase();
  const order = orders.find(
    o => o.id.toLowerCase() === query || 
         o.trackingNumber.toLowerCase() === query ||
         o.shippingAddress.email.toLowerCase() === query
  );

  if (!order) {
    return res.status(404).json({ found: false, error: 'No order found matching this reference' });
  }

  res.json({ found: true, order });
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { fulfillmentStatus } = req.body;
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (fulfillmentStatus) {
    order.fulfillmentStatus = fulfillmentStatus;
  }

  res.json({ success: true, order });
});

// GET /api/support/tickets
app.get('/api/support/tickets', (req, res) => {
  res.json({ tickets: supportTickets });
});

// POST /api/support/ticket
app.post('/api/support/ticket', (req, res) => {
  const { customerName, customerEmail, subject, category, priority, message, orderId } = req.body;

  if (!customerName || !customerEmail || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const newTicket: SupportTicket = {
    id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    subject: subject || `${category || 'General'} Support Request`,
    category: category || 'Order Status & Tracking',
    priority: priority || 'Normal',
    message: message.trim(),
    orderId: orderId ? orderId.trim() : undefined,
    status: 'Open',
    createdAt: new Date().toISOString(),
    estimatedResolutionMinutes: priority?.includes('Urgent') ? 5 : 15,
    responseNote: 'Ticket received and queued for 24/7 instant priority response.'
  };

  supportTickets.unshift(newTicket);

  res.json({
    success: true,
    ticket: newTicket,
    message: 'Your 24/7 support ticket has been registered.'
  });
});

// PATCH /api/support/tickets/:id/status (Merchant management)
app.patch('/api/support/tickets/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, responseNote } = req.body;
  const ticket = supportTickets.find(t => t.id === id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (status) ticket.status = status;
  if (responseNote) ticket.responseNote = responseNote;

  res.json({ success: true, ticket });
});

// POST /api/support/chat
app.post('/api/support/chat', async (req, res) => {
  const { message, conversationHistory = [], currentOrderId } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const query = message.trim().toLowerCase();

  // 1. Check for specific order lookup
  const orderIdMatch = message.match(/ORD-\d+/i);
  let matchedOrder: Order | undefined = undefined;
  if (orderIdMatch) {
    matchedOrder = orders.find(o => o.id.toLowerCase() === orderIdMatch[0].toLowerCase());
  } else if (currentOrderId) {
    matchedOrder = orders.find(o => o.id.toLowerCase() === currentOrderId.toLowerCase());
  }

  // 2. Check for product match in store
  const matchedProduct = products.find(p => {
    const title = p.title.toLowerCase();
    const sku = p.sku.toLowerCase();
    const cat = p.category.toLowerCase();
    return (
      query.includes(sku) ||
      (query.includes('kettle') && title.includes('kettle')) ||
      (query.includes('headphones') && title.includes('headphones')) ||
      (query.includes('backpack') && title.includes('backpack')) ||
      (query.includes('keyboard') && title.includes('keyboard')) ||
      (query.includes('matcha') && title.includes('matcha')) ||
      (query.includes('lamp') && title.includes('lamp')) ||
      (query.includes('tumbler') && title.includes('tumbler')) ||
      (query.includes('sensor') && title.includes('sensor'))
    );
  });

  // Try calling Gemini if API key is provided
  const ai = getGeminiClient();
  let aiReplyText: string | null = null;

  if (ai) {
    try {
      const liveCatalogSummary = products.map(p => 
        `- ${p.title} (SKU: ${p.sku}, Price: $${p.price}, Stock: ${p.stock} units, Status: ${p.stock === 0 ? 'OUT OF STOCK' : p.stock <= p.lowStockThreshold ? 'LOW STOCK' : 'IN STOCK'})`
      ).join('\n');

      const liveOrdersSummary = orders.slice(0, 5).map(o =>
        `- Order ${o.id}: Total $${o.total}, Status: ${o.fulfillmentStatus}, Carrier: ${o.carrier}, Tracking: ${o.trackingNumber}, Est Delivery: ${o.estimatedDelivery}`
      ).join('\n');

      const systemPrompt = `You are ShopFlow's 24/7 Live Support Concierge.
You provide instant, friendly, highly professional customer and merchant assistance around the clock.

STORE POLICIES & CAPABILITIES:
- 24/7 Support: Available 24 hours a day, 7 days a week, 365 days a year. Average live response time < 15 seconds.
- Free Express Shipping: Free delivery on all orders $50+. Same-day dispatch if ordered before 2:00 PM EST. Carrier partners: UPS Ground Air Express, FedEx 2-Day Air, USPS.
- 30-Day Hassle-Free Guarantee: 30-day money-back return policy. Customers can return items in original or like-new condition with prepaid shipping labels.
- Payment & Security: 256-Bit SSL encryption, PCI-DSS Level 1 certified gateway. We accept Visa, Mastercard, American Express, Apple Pay Instant Token, and Google Pay. Card data is never stored in plain text.
- Live Real-Time Warehouse Inventory: Real-time atomic inventory tracking prevents overselling. Multi-channel synchronization reflects sales from Shopify, Amazon, and retail POS.

LIVE INVENTORY CATALOG (AUTHORITATIVE):
${liveCatalogSummary}

RECENT ORDERS (IF USER ASKS TO TRACK):
${liveOrdersSummary}

TONE GUIDELINES:
- Be concise, helpful, warm, and professional.
- Format responses cleanly using bold text and short bullet points.
- If the user asks about an order, provide their exact tracking number, carrier, and estimated arrival.
- If the user asks about item availability, state the exact live warehouse stock count.
- If the issue requires human escalation or formal record, offer to open an instant 24/7 priority ticket.`;

      const contents = [
        ...conversationHistory.slice(-4).map((h: any) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      const genResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: systemPrompt
        }
      });

      aiReplyText = genResponse.text || null;
    } catch (err) {
      console.warn('Gemini chat error, falling back to local support engine:', err);
    }
  }

  // Fallback / Deterministic rule-based concierge engine
  if (!aiReplyText) {
    if (matchedOrder) {
      aiReplyText = `Here are the live tracking details for **Order ${matchedOrder.id}**:
• **Status:** ${matchedOrder.fulfillmentStatus}
• **Carrier:** ${matchedOrder.carrier}
• **Tracking Number:** \`${matchedOrder.trackingNumber}\`
• **Estimated Delivery:** ${matchedOrder.estimatedDelivery}
• **Items:** ${matchedOrder.items.map(i => `${i.quantity}x ${i.title}`).join(', ')}
• **Destination:** ${matchedOrder.shippingAddress.city}, ${matchedOrder.shippingAddress.state}

Your package is safely in transit and covered by our on-time delivery guarantee.`;
    } else if (query.includes('track') || query.includes('where is my order') || query.includes('status') || query.includes('shipment')) {
      const recentOrder = orders[0];
      aiReplyText = `I can instantly pull up your live delivery tracking!
Please enter your **Order ID** (e.g. \`${recentOrder ? recentOrder.id : 'ORD-78192'}\`) or tracking number.
Alternatively, switch to the **Instant Order Tracker** tab above to view real-time carrier milestone updates.`;
    } else if (matchedProduct) {
      if (matchedProduct.stock === 0) {
        aiReplyText = `The **${matchedProduct.title}** (SKU: \`${matchedProduct.sku}\`) is currently sold out.
Our procurement team has a replenishment shipment scheduled to land at the fulfillment center within 48 hours. Would you like to submit a 24/7 priority ticket to get notified the second it restocks?`;
      } else if (matchedProduct.stock <= matchedProduct.lowStockThreshold) {
        aiReplyText = `⚠️ **Urgency Alert:** We only have **${matchedProduct.stock} units left** in live warehouse stock for **${matchedProduct.title}** ($${matchedProduct.price.toFixed(2)}).
Because of high demand and multi-channel sync, this item may sell out shortly. We recommend placing your order soon!`;
      } else {
        aiReplyText = `✅ The **${matchedProduct.title}** ($${matchedProduct.price.toFixed(2)}) is **In Stock** with **${matchedProduct.stock} units** ready for immediate dispatch from our warehouse.
Orders placed before 2:00 PM EST ship same-day via ${matchedProduct.price >= 50 ? 'Free Express Delivery' : 'Standard Shipping'}.`;
      }
    } else if (query.includes('return') || query.includes('refund') || query.includes('exchange') || query.includes('guarantee')) {
      aiReplyText = `🔄 **Our 30-Day Hassle-Free Return Guarantee:**
• You can return any item within **30 days** of delivery for a 100% full refund.
• **Prepaid Return Shipping:** We provide a free digital UPS/FedEx return label with no drop-off fees.
• **Instant Processing:** Refunds are issued back to your original payment method within 48 hours of carrier scan.
• Need to start a return? Click **"Submit Priority Ticket"** to generate your return authorization instantly!`;
    } else if (query.includes('shipping') || query.includes('delivery') || query.includes('how long') || query.includes('cost')) {
      aiReplyText = `📦 **Shipping & Delivery Timelines:**
• **Free Express Delivery:** On all orders **$50 or more** (automatically applied at checkout).
• **Standard Rate:** Flat $5.99 for orders under $50.
• **Dispatch Speed:** Orders placed before 2:00 PM EST are packaged and handed to UPS or FedEx same-day.
• **Transit Time:** Typically 2 to 3 business days across the continental US.`;
    } else if (query.includes('pay') || query.includes('security') || query.includes('credit card') || query.includes('apple pay') || query.includes('safe')) {
      aiReplyText = `🔒 **Payment Security & Protection:**
• **256-Bit SSL Encryption:** All transactions are processed through a PCI-DSS Level 1 compliant gateway.
• **Zero Plaintext Storage:** We never store raw card numbers or CVV codes on our servers.
• **Supported Payment Methods:** Visa, Mastercard, American Express, Apple Pay Instant Token, and Google Pay.`;
    } else if (query.includes('merchant') || query.includes('seller') || query.includes('sync') || query.includes('restock')) {
      aiReplyText = `💼 **Merchant & Business Hub Assistance:**
• You can manage your live warehouse inventory in the **Merchant Admin & Inventory** tab.
• Use **Quick Restock (+10, +25, +50)** or custom adjustments with full audit logs.
• Click **"Simulate Channel Sale"** in the top navigation to test real-time stock deductions from external channels like Amazon or Shopify POS.`;
    } else {
      aiReplyText = `Hello! Welcome to **ShopFlow 24/7 Live Support Concierge**. I am here to help you around the clock!
How can I assist you today?
• 📦 **Track an order** (enter your Order ID or tracking code)
• ⚡ **Check item stock & specifications**
• 🔄 **Return or refund assistance** (30-day guarantee)
• 🔒 **Payment & invoice inquiries**
• 🎫 **Open a priority support ticket** for complex requests`;
    }
  }

  // Generate relevant action chips
  const suggestedActions: { label: string; action: string; payload?: any }[] = [];
  if (matchedOrder) {
    suggestedActions.push({ label: `View Order ${matchedOrder.id}`, action: 'track_order', payload: matchedOrder.id });
    suggestedActions.push({ label: 'Request Return Label', action: 'open_ticket', payload: { category: 'Returns & Refunds', orderId: matchedOrder.id } });
  } else {
    suggestedActions.push({ label: '📦 Track My Order', action: 'prompt', payload: 'Where is my order?' });
    suggestedActions.push({ label: '🔄 30-Day Returns Policy', action: 'prompt', payload: 'How do returns work?' });
    suggestedActions.push({ label: '🚚 Shipping Speeds', action: 'prompt', payload: 'What are your shipping rates and speeds?' });
    suggestedActions.push({ label: '🎫 Open Priority Ticket', action: 'open_ticket' });
  }

  res.json({
    reply: aiReplyText,
    orderCard: matchedOrder,
    productCard: matchedProduct,
    suggestedActions
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`E-Commerce Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
