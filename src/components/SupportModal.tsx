import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MessageSquare, 
  Package, 
  Ticket, 
  HelpCircle, 
  Send, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  ChevronRight, 
  Copy, 
  Check, 
  Search,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';
import { Order, Product, SupportMessage, SupportTicket } from '../types';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  onSelectProduct?: (product: Product) => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  onSelectProduct
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'track' | 'ticket' | 'faq'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "👋 Welcome to **ShopFlow 24/7 Live Support**! I'm your dedicated concierge, available around the clock. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '📦 Track My Order', action: 'prompt', payload: 'Can you help me track my recent order?' },
        { label: '🔄 30-Day Returns Policy', action: 'prompt', payload: 'How do 30-day hassle-free returns work?' },
        { label: '🚚 Shipping Rates & Speeds', action: 'prompt', payload: 'What are your shipping rates and delivery times?' },
        { label: '⚡ Check Live Warehouse Stock', action: 'prompt', payload: 'What items are currently in stock?' },
        { label: '🎫 Open Priority Ticket', action: 'tab_ticket' }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Tracking tab state
  const [trackingQuery, setTrackingQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Ticket tab state
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketCategory, setTicketCategory] = useState<SupportTicket['category']>('Order Status & Tracking');
  const [ticketPriority, setTicketPriority] = useState<SupportTicket['priority']>('Normal');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccessMessage, setTicketSuccessMessage] = useState('');

  // FAQ state
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isSending]);

  // If there are store orders, pre-populate the search query or ticket order ID
  useEffect(() => {
    if (orders.length > 0 && !searchedOrder) {
      setSearchedOrder(orders[0]);
      setTrackingQuery(orders[0].id);
      setTicketOrderId(orders[0].id);
      if (orders[0].shippingAddress) {
        setTicketName(orders[0].shippingAddress.fullName);
        setTicketEmail(orders[0].shippingAddress.email);
      }
    }
  }, [orders, searchedOrder]);

  if (!isOpen) return null;

  // Send message to 24/7 Chat API
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isSending) return;

    const userMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages.map(m => ({ sender: m.sender, text: m.text })),
          currentOrderId: searchedOrder?.id
        })
      });

      if (!res.ok) throw new Error('Support network response was not ok');

      const data = await res.json();
      const assistantMsg: SupportMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || "I've received your inquiry. Our support specialist is checking the live inventory records.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions,
        orderCard: data.orderCard,
        productCard: data.productCard
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: "I am having temporary trouble reaching the assistant server. You can also submit an urgent ticket directly in the **Submit Priority Ticket** tab or call our 24/7 hotline at **+1 (800) 555-FLOW**.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [{ label: '🎫 Open Priority Ticket', action: 'tab_ticket' }]
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleActionClick = (action: { label: string; action: string; payload?: any }) => {
    if (action.action === 'prompt') {
      handleSendMessage(action.payload);
    } else if (action.action === 'tab_ticket') {
      setActiveTab('ticket');
    } else if (action.action === 'track_order') {
      setActiveTab('track');
      if (action.payload) {
        handleLookupOrder(action.payload);
      }
    } else if (action.action === 'open_ticket') {
      setActiveTab('ticket');
      if (action.payload?.category) setTicketCategory(action.payload.category);
      if (action.payload?.orderId) setTicketOrderId(action.payload.orderId);
    }
  };

  // Tracking Lookup Handler
  const handleLookupOrder = async (queryParam?: string) => {
    const q = (queryParam || trackingQuery).trim();
    if (!q) return;

    setIsTrackingLoading(true);
    setTrackingError('');

    try {
      const res = await fetch(`/api/orders/lookup/${encodeURIComponent(q)}`);
      const data = await res.json();

      if (res.ok && data.found && data.order) {
        setSearchedOrder(data.order);
      } else {
        setTrackingError(data.error || 'No matching order found. Please verify your Order ID (e.g., ORD-78192) or tracking number.');
        setSearchedOrder(null);
      }
    } catch (err: any) {
      setTrackingError('Unable to connect to carrier tracking authority. Please try again.');
    } finally {
      setIsTrackingLoading(false);
    }
  };

  // Submit Support Ticket Handler
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName || !ticketEmail || !ticketMessage) return;

    setIsSubmittingTicket(true);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: ticketName,
          customerEmail: ticketEmail,
          category: ticketCategory,
          priority: ticketPriority,
          orderId: ticketOrderId,
          message: ticketMessage
        })
      });

      const data = await res.json();
      if (res.ok && data.ticket) {
        setSubmittedTicket(data.ticket);
        setTicketSuccessMessage(`Ticket #${data.ticket.id} registered! Priority response estimated in ${data.ticket.estimatedResolutionMinutes} minutes.`);
        // Also add note to chat
        setMessages(prev => [
          ...prev,
          {
            id: `ticket-notice-${Date.now()}`,
            sender: 'system',
            text: `📋 **Support Ticket Created: #${data.ticket.id}** (${ticketCategory})\nA specialist has been notified and sent a confirmation to ${ticketEmail}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      alert('Failed to submit ticket. Please check your connection.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const faqs = [
    {
      q: 'How fast is standard and express shipping?',
      a: 'All orders over $50 receive Free Express Delivery (2-3 business days). Orders placed before 2:00 PM EST ship same-day from our central fulfillment center via UPS Ground Air Express or FedEx 2-Day Air. Standard shipping is $5.99 for smaller orders.'
    },
    {
      q: 'What is your 30-day return and refund policy?',
      a: 'We offer a 100% money-back guarantee within 30 days of delivery. Items can be returned in original packaging or like-new condition. We provide a prepaid digital shipping label at zero cost to you, and refunds are released within 48 hours of carrier scan.'
    },
    {
      q: 'How does real-time warehouse inventory work?',
      a: 'Our platform uses server-authoritative atomic inventory tracking. Whenever a purchase happens online or across integrated retail channels (Amazon, Shopify POS), available warehouse counts decrement immediately, ensuring you never encounter backorders or overselling.'
    },
    {
      q: 'Are payments secure and PCI compliant?',
      a: 'Yes. All payments are encrypted using 256-bit SSL protocols and processed through a PCI-DSS Level 1 certified gateway. We support major Credit Cards (Visa, Mastercard, Amex), Apple Pay Instant Tokens, and Google Pay. Card details are never stored in raw text.'
    },
    {
      q: 'How can small business merchants manage inventory?',
      a: 'Merchants can switch to the "Merchant Admin & Inventory" tab in the top navigation. There, business owners can perform one-click restocks, adjust inventory thresholds, review immutable audit trails, and simulate incoming sales from multi-channel marketplaces.'
    },
    {
      q: 'How can I reach a live support representative directly?',
      a: 'You can chat here 24/7/365 with our live concierge, file a priority ticket with a guaranteed 15-minute response SLA, or call our toll-free customer desk at +1 (800) 555-FLOW.'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div id="support-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="support-modal-card"
        className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl h-[88vh] max-h-[750px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
      >
        {/* Top Header */}
        <div className="bg-zinc-950 border-b border-zinc-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight font-['Space_Grotesk']">
                  24/7 Support Desk & Concierge
                </h2>
                <span className="inline-flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live 24/7 • Online</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Instant delivery tracking, order assistance, live warehouse stock & merchant help
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href="tel:18005553569" 
              className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 px-3 py-1.5 rounded-lg transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>+1 (800) 555-FLOW</span>
            </a>
            <button
              id="close-support-modal-btn"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-zinc-950/50 border-b border-zinc-800 px-4 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="tab-support-chat"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live 24/7 Chat</span>
            </button>

            <button
              id="tab-support-track"
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Instant Order Tracker</span>
            </button>

            <button
              id="tab-support-ticket"
              onClick={() => setActiveTab('ticket')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'ticket'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Priority Support Ticket</span>
            </button>

            <button
              id="tab-support-faq"
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Knowledge Base & FAQs</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-zinc-400 shrink-0">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Avg Response: &lt; 15 seconds</span>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-zinc-900/50">
          {/* TAB 1: LIVE 24/7 CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.map(msg => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {/* Message Bubble */}
                    <div 
                      className={`max-w-[85%] sm:max-w-xl rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-950'
                          : msg.sender === 'system'
                          ? 'bg-zinc-800/90 border border-zinc-700 text-zinc-200 rounded-xl'
                          : 'bg-zinc-800/95 border border-zinc-700/80 text-zinc-100 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line">
                        {msg.text}
                      </div>

                      {/* Attached Order Card if relevant */}
                      {msg.orderCard && (
                        <div className="mt-3 bg-zinc-950/80 border border-zinc-700/80 rounded-xl p-3 text-zinc-200">
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                            <div className="flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="font-bold text-white text-xs">{msg.orderCard.id}</span>
                            </div>
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                              {msg.orderCard.fulfillmentStatus}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1 text-[11px] text-zinc-400">
                            <p>Carrier: <strong className="text-zinc-200">{msg.orderCard.carrier}</strong></p>
                            <p>Tracking: <strong className="text-zinc-200 font-mono">{msg.orderCard.trackingNumber}</strong></p>
                            <p>Estimated Delivery: <strong className="text-emerald-400">{msg.orderCard.estimatedDelivery}</strong></p>
                          </div>

                          <button
                            onClick={() => {
                              setActiveTab('track');
                              setSearchedOrder(msg.orderCard!);
                              setTrackingQuery(msg.orderCard!.id);
                            }}
                            className="mt-2.5 w-full py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-semibold transition flex items-center justify-center gap-1"
                          >
                            <span>Open Full Tracking Timeline</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Attached Product Card if relevant */}
                      {msg.productCard && (
                        <div className="mt-3 bg-zinc-950/80 border border-zinc-700/80 rounded-xl p-2.5 flex items-center gap-3">
                          <img 
                            src={msg.productCard.imageUrl} 
                            alt={msg.productCard.title} 
                            className="w-12 h-12 rounded-lg object-cover bg-zinc-900 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{msg.productCard.title}</p>
                            <p className="text-[11px] text-emerald-400 font-bold">${msg.productCard.price.toFixed(2)}</p>
                            <p className="text-[10px] text-zinc-400">
                              Live Stock: {msg.productCard.stock > 0 ? `${msg.productCard.stock} units available` : 'Sold out (restock soon)'}
                            </p>
                          </div>
                          {onSelectProduct && (
                            <button
                              onClick={() => {
                                onSelectProduct(msg.productCard!);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded shrink-0 transition"
                            >
                              View Item
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sender & Timestamp */}
                    <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-zinc-400">
                      <span>{msg.sender === 'user' ? 'You' : '24/7 Concierge'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Suggested Action Chips */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-xl">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/70 text-zinc-300 hover:text-white rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isSending && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-800/50 border border-zinc-800 p-3 rounded-xl max-w-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>24/7 Concierge is typing live response...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800">
                <form 
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    id="support-chat-input"
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    placeholder="Ask about order tracking, returns, shipping, stock availability..."
                    className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                  <button
                    id="support-chat-send-btn"
                    type="submit"
                    disabled={!inputMessage.trim() || isSending}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 px-1">
                  <span>🔒 Secure live session • 256-bit encrypted</span>
                  <span>Responses grounded in live warehouse database</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTANT ORDER TRACKER */}
          {activeTab === 'track' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Lookup Bar */}
              <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 mb-6">
                <h3 className="text-sm sm:text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Carrier Tracking Authority</span>
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Enter your Order ID (e.g. <strong className="text-zinc-300">ORD-78192</strong>), Carrier tracking number, or account email.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={trackingQuery}
                    onChange={e => setTrackingQuery(e.target.value)}
                    placeholder="e.g. ORD-78192 or 1Z999AA10123456784"
                    className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleLookupOrder()}
                    disabled={isTrackingLoading || !trackingQuery.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isTrackingLoading ? 'Searching...' : 'Track Order'}</span>
                  </button>
                </div>

                {/* Quick select previous orders */}
                {orders.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-zinc-400">
                    <span>Quick Select:</span>
                    {orders.map(o => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setTrackingQuery(o.id);
                          handleLookupOrder(o.id);
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded text-[11px] font-mono transition"
                      >
                        {o.id} ({o.fulfillmentStatus})
                      </button>
                    ))}
                  </div>
                )}

                {trackingError && (
                  <div className="mt-3 bg-red-950/40 border border-red-900/60 rounded-xl p-3 text-xs text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{trackingError}</span>
                  </div>
                )}
              </div>

              {/* Searched Order Details & Milestone Timeline */}
              {searchedOrder && (
                <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white font-mono">{searchedOrder.id}</span>
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
                          {searchedOrder.fulfillmentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Placed on {new Date(searchedOrder.createdAt).toLocaleDateString()} via {searchedOrder.paymentSummary.method}
                      </p>
                    </div>

                    <div className="text-right sm:text-right">
                      <p className="text-xs text-zinc-400">Estimated Delivery</p>
                      <p className="text-sm font-bold text-emerald-400">{searchedOrder.estimatedDelivery}</p>
                    </div>
                  </div>

                  {/* 4-Stage Visual Fulfillment Progress Tracker */}
                  <div className="py-6">
                    <div className="relative">
                      {/* Timeline bar */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -translate-y-1/2" />
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 transition-all duration-500"
                        style={{
                          width: 
                            searchedOrder.fulfillmentStatus === 'Delivered' ? '100%' :
                            searchedOrder.fulfillmentStatus === 'Out for Delivery' ? '75%' :
                            searchedOrder.fulfillmentStatus === 'Shipped' ? '50%' : '20%'
                        }}
                      />

                      {/* Milestones */}
                      <div className="relative flex justify-between">
                        {[
                          { label: 'Order Placed', done: true, sub: 'Payment Verified' },
                          { label: 'Warehouse Packed', done: ['Shipped', 'Out for Delivery', 'Delivered'].includes(searchedOrder.fulfillmentStatus), sub: 'Quality Inspected' },
                          { label: 'In Transit', done: ['Shipped', 'Out for Delivery', 'Delivered'].includes(searchedOrder.fulfillmentStatus), sub: searchedOrder.carrier },
                          { label: 'Delivered', done: searchedOrder.fulfillmentStatus === 'Delivered', sub: 'Front Porch / Mail' }
                        ].map((step, idx) => (
                          <div key={idx} className="flex flex-col items-center text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                              step.done 
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 ring-4 ring-zinc-950' 
                                : 'bg-zinc-800 text-zinc-500 ring-4 ring-zinc-950'
                            }`}>
                              {step.done ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={`text-xs font-bold mt-2 ${step.done ? 'text-white' : 'text-zinc-500'}`}>
                              {step.label}
                            </span>
                            <span className="text-[10px] text-zinc-400 max-w-[80px]">
                              {step.sub}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Carrier & Tracking Card */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{searchedOrder.carrier}</p>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          Tracking: {searchedOrder.trackingNumber}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(searchedOrder.trackingNumber)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTracking ? 'Copied' : 'Copy Tracking #'}</span>
                    </button>
                  </div>

                  {/* Items in this shipment */}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Shipment Contents ({searchedOrder.items.length} item{searchedOrder.items.length > 1 ? 's' : ''})
                    </h4>
                    <div className="space-y-2">
                      {searchedOrder.items.map((item, idx) => (
                        <div key={idx} className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-zinc-950 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{item.title}</p>
                              <p className="text-[10px] text-zinc-400">SKU: {item.sku} • Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-zinc-200">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick support action for this order */}
                  <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-zinc-400">Need changes or return label for this order?</span>
                    <button
                      onClick={() => {
                        setActiveTab('ticket');
                        setTicketOrderId(searchedOrder.id);
                        setTicketCategory('Returns & Refunds');
                      }}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Request Return Label</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUBMIT PRIORITY TICKET */}
          {activeTab === 'ticket' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-6">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-emerald-400" />
                      <span>Open 24/7 Priority Support Ticket</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Guaranteed priority routing to an e-commerce specialist. Average resolution under 15 minutes.
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap hidden sm:inline">
                    15 Min Response SLA
                  </span>
                </div>

                {submittedTicket ? (
                  <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">
                      Support Ticket Registered: #{submittedTicket.id}
                    </h4>
                    <p className="text-xs text-zinc-300 max-w-md mx-auto mb-4">
                      {ticketSuccessMessage} A confirmation notice has been sent to <strong className="text-white">{submittedTicket.customerEmail}</strong>.
                    </p>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-w-md mx-auto text-left text-xs mb-5">
                      <p className="text-zinc-400">Category: <strong className="text-white">{submittedTicket.category}</strong></p>
                      {submittedTicket.orderId && <p className="text-zinc-400">Order Reference: <strong className="text-white">{submittedTicket.orderId}</strong></p>}
                      <p className="text-zinc-400 mt-2 italic bg-zinc-950 p-2 rounded text-zinc-300">"{submittedTicket.message}"</p>
                    </div>

                    <button
                      onClick={() => {
                        setSubmittedTicket(null);
                        setTicketMessage('');
                      }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Submit Another Ticket
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={ticketName}
                          onChange={e => setTicketName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={ticketEmail}
                          onChange={e => setTicketEmail(e.target.value)}
                          placeholder="e.g. alex@example.com"
                          className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Category
                        </label>
                        <select
                          value={ticketCategory}
                          onChange={e => setTicketCategory(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Order Status & Tracking">Order Status & Tracking</option>
                          <option value="Returns & Refunds">Returns & Refunds</option>
                          <option value="Inventory & Restock">Inventory & Restock</option>
                          <option value="Payment & Security">Payment & Security</option>
                          <option value="Merchant Operations">Merchant Operations</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Priority Level
                        </label>
                        <select
                          value={ticketPriority}
                          onChange={e => setTicketPriority(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Normal">Normal (15 min SLA)</option>
                          <option value="High">High Priority (10 min SLA)</option>
                          <option value="Urgent (24/7 Priority)">Urgent (5 min SLA)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Order / SKU ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={ticketOrderId}
                          onChange={e => setTicketOrderId(e.target.value)}
                          placeholder="e.g. ORD-78192"
                          className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Describe your inquiry or issue *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={ticketMessage}
                        onChange={e => setTicketMessage(e.target.value)}
                        placeholder="Please provide specifics (e.g. tracking update, return label request, or bulk purchase inquiries)..."
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingTicket}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-950 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{isSubmittingTicket ? 'Submitting to 24/7 Dispatch...' : 'Submit Priority Ticket'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: KNOWLEDGE BASE & FAQ */}
          {activeTab === 'faq' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={e => setFaqSearch(e.target.value)}
                    placeholder="Search policies, returns, shipping speeds, PCI security..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Quick Policy Highlights Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Free Express $50+</p>
                      <p className="text-[10px] text-zinc-400">Same-day dispatch</p>
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">30-Day Guarantee</p>
                      <p className="text-[10px] text-zinc-400">Free return shipping</p>
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">PCI-DSS Gateway</p>
                      <p className="text-[10px] text-zinc-400">256-bit SSL encrypted</p>
                    </div>
                  </div>
                </div>

                {/* FAQ Items Accordion */}
                <div className="space-y-2">
                  {filteredFaqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden transition"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 text-xs font-bold text-zinc-200 hover:text-white transition cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-90 text-emerald-400' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-3.5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-2.5">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Strip */}
        <div className="bg-zinc-950 border-t border-zinc-800/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <strong className="text-zinc-300">24/7 Concierge Live</strong>
            </span>
            <span>•</span>
            <span>Toll-Free: <strong>1-800-555-FLOW</strong></span>
            <span>•</span>
            <span>Email: <strong>support@shopflow.dev</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ticket')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition"
            >
              Open Priority Ticket →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
