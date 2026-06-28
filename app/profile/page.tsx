"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import {
  getUserProfile, updateUserProfile, getMyOrders,
  orderFromAPI,   getCachedUserInfo,  clearUserToken, mediaUrl
} from "@/lib/api";

/* ─── Types ─── */
type OrderStatus = "placed" | "confirmed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

type Order = {
  id: string;
  date: string;
  items: { name: string; qty: number; size: string; price: number; imgClass: string }[];
  total: number;
  status: OrderStatus;
  trackingId?: string;
  customerName?: string;
  address: string;
  payMethod: string;
};

const STATUS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "placed",            label: "Order Placed",       icon: "🛍️" },
  { key: "confirmed",         label: "Confirmed",          icon: "✅" },
  { key: "shipped",           label: "Shipped",            icon: "📦" },
  { key: "out_for_delivery",  label: "Out for Delivery",   icon: "🚚" },
  { key: "delivered",         label: "Delivered",          icon: "🎉" },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  placed: 0, confirmed: 1, shipped: 2, out_for_delivery: 3, delivered: 4, cancelled: -1,
};

const STATUS_BADGE: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  placed:           { bg: "#eff6ff", color: "#2563eb", label: "Placed"           },
  confirmed:        { bg: "#f0fdf4", color: "#15803d", label: "Confirmed"        },
  shipped:          { bg: "#fef3c7", color: "#92400e", label: "Shipped"          },
  out_for_delivery: { bg: "#fff7ed", color: "#c2410c", label: "Out for Delivery" },
  delivered:        { bg: "#f0fdf4", color: "#15803d", label: "Delivered ✓"      },
  cancelled:        { bg: "#fff1f2", color: "#be123c", label: "Cancelled"        },
};

type TabId = "orders" | "profile" | "wishlist" | "addresses" | "shop";

type WishlistItem = {
  id: number;
  name: string;
  price: number;
  original?: number;
  imgClass: string;
  images?: string[];
  tag?: string;
};

type SavedAddress = {
  id: string; label: string;
  name: string; phone: string;
  pincode: string; city: string; state: string;
  line1: string; line2: string;
  isDefault: boolean;
};



export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("orders");
  const searchParams = useSearchParams();

  /* ── Activate tab from URL ?tab= param ── */
  useEffect(() => {
    const tab = searchParams.get("tab") as TabId | null;
    if (tab && ["orders", "profile", "wishlist", "addresses"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", userType: "customer", shopSlug: "" });
  const [editMode, setEditMode] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [saved, setSaved] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Shop owner states
  const [shopStats, setShopStats] = useState<any>(null);
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [shopSubTab, setShopSubTab] = useState<"overview" | "products" | "orders">("overview");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", mrp: "", stock: "", category: "Casual Wear", description: "", fabric: "" });
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  /* ── Load wishlist from localStorage ── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kurthi_wishlist");
      if (stored) setWishlistItems(JSON.parse(stored));
    } catch {}
  }, []);

  const removeFromWishlist = (id: number) => {
    const updated = wishlistItems.filter(i => i.id !== id);
    setWishlistItems(updated);
    try { localStorage.setItem("kurthi_wishlist", JSON.stringify(updated)); } catch {}
  };

  /* ── Bootstrap: load profile + orders from API ── */
  useEffect(() => {
    const cached = getCachedUserInfo();
    if (cached) {
      if (cached.userType === "shop_owner") {
        window.location.href = "/dashboard/shop";
        return;
      } else {
        window.location.href = "/dashboard/customer";
        return;
      }
    }
    // ... remaining logic if not cached ...
    getUserProfile()
      .then((u) => {
        if (u.userType === "shop_owner") window.location.href = "/dashboard/shop";
        else window.location.href = "/dashboard/customer";
      })
      .catch(() => {
        if (!cached) window.location.href = "/login";
      })
      .finally(() => setAuthLoading(false));
  }, []);

  /* ── Addresses (stored locally) ── */
  const BLANK_ADDR = { id: "", label: "Home", name: "", phone: "", pincode: "", city: "", state: "", line1: "", line2: "", isDefault: false };
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddrForm, setShowAddrForm]     = useState(false);
  const [editingAddr, setEditingAddr]       = useState<SavedAddress>(BLANK_ADDR);
  const [addrFormErr, setAddrFormErr]       = useState("");

  useEffect(() => {
    try {
      const s = localStorage.getItem("kurthi_addresses");
      if (s) setSavedAddresses(JSON.parse(s));
    } catch {}
  }, []);


  const persistAddresses = (list: SavedAddress[]) => {
    setSavedAddresses(list);
    try { localStorage.setItem("kurthi_addresses", JSON.stringify(list)); } catch {}
  };

  const openAddAddr = () => { setEditingAddr({ ...BLANK_ADDR, id: Date.now().toString() }); setAddrFormErr(""); setShowAddrForm(true); };
  const openEditAddr = (a: SavedAddress) => { setEditingAddr({ ...a }); setAddrFormErr(""); setShowAddrForm(true); };

  const saveAddrForm = () => {
    if (!editingAddr.name || !editingAddr.phone || !editingAddr.pincode || !editingAddr.city || !editingAddr.state || !editingAddr.line1) {
      setAddrFormErr("Please fill all required fields."); return;
    }
    if (!/^\d{10}$/.test(editingAddr.phone)) { setAddrFormErr("Enter a valid 10-digit phone."); return; }
    if (!/^\d{6}$/.test(editingAddr.pincode)) { setAddrFormErr("Enter a valid 6-digit pincode."); return; }
    const existing = savedAddresses.find(a => a.id === editingAddr.id);
    let updated: SavedAddress[];
    if (existing) {
      updated = savedAddresses.map(a => a.id === editingAddr.id ? editingAddr : a);
    } else {
      const isFirst = savedAddresses.length === 0;
      updated = [...savedAddresses, { ...editingAddr, isDefault: isFirst }];
    }
    persistAddresses(updated);
    setShowAddrForm(false);
  };

  const removeAddr = (id: string) => {
    let updated = savedAddresses.filter(a => a.id !== id);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) updated[0].isDefault = true;
    persistAddresses(updated);
  };

  const setDefaultAddr = (id: string) => {
    persistAddresses(savedAddresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const downloadInvoice = (order: Order) => {
    const rows = order.items.map(i => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #f0e6d9;">${i.name}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0e6d9;text-align:center;">${i.size}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0e6d9;text-align:center;">${i.qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0e6d9;text-align:right;">&#8377;${(i.price).toLocaleString("en-IN")}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0e6d9;text-align:right;">&#8377;${(i.price * i.qty).toLocaleString("en-IN")}</td>
      </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Invoice ${order.id}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',sans-serif;color:#333;background:#fff;padding:40px}
        .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #7b1e3a}
        .brand{font-family:Georgia,serif;font-size:28px;font-weight:bold;color:#7b1e3a;letter-spacing:0.15em}
        .brand-sub{font-size:10px;letter-spacing:0.35em;color:#c97d4a;text-transform:uppercase;margin-top:2px}
        .invoice-title{text-align:right}
        .invoice-title h2{font-size:22px;color:#7b1e3a;font-family:Georgia,serif}
        .invoice-title p{color:#888;font-size:12px;margin-top:4px}
        .section{margin-bottom:24px}
        .section-title{font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#aaa;margin-bottom:8px}
        .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .meta-card{background:#fffaf7;border:1px solid #f0e6d9;border-radius:10px;padding:14px}
        .meta-card p{font-size:13px;color:#555;line-height:1.6}
        table{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
        th{background:#7b1e3a;color:#fff;padding:10px 8px;text-align:left;font-size:11px;font-weight:600;letter-spacing:0.08em}
        th:nth-child(3),th:nth-child(4),th:nth-child(5){text-align:center}
        th:nth-child(4),th:nth-child(5){text-align:right}
        .totals{margin-top:16px;display:flex;justify-content:flex-end}
        .totals table{width:260px}
        .totals td{padding:6px 8px;font-size:13px}
        .totals .grand td{font-weight:bold;color:#7b1e3a;font-size:15px;border-top:2px solid #7b1e3a;padding-top:10px}
        .footer{margin-top:40px;padding-top:16px;border-top:1px solid #f0e6d9;text-align:center;font-size:11px;color:#bbb}
        @media print{body{padding:20px}.no-print{display:none}}
      </style>
    </head><body>
      <div class="header">
        <div><div class="brand">KURTH\u012a</div><div class="brand-sub">COUTURE</div></div>
        <div class="invoice-title"><h2>TAX INVOICE</h2><p>${order.id}</p><p>${order.date}</p></div>
      </div>
      <div class="meta-grid section">
        <div class="meta-card">
          <div class="section-title">Bill To</div>
          <p style="font-weight:600;font-size:14px;color:#333;margin-bottom:4px">${order.customerName || profile.name}</p>
          <div class="section-title" style="margin-top:10px">Delivery Address</div>
          <p>${order.address}</p>
        </div>
        <div class="meta-card">
          <div class="section-title">Payment Method</div>
          <p>${order.payMethod}</p>
          <div class="section-title" style="margin-top:10px">Order Status</div>
          <p style="text-transform:capitalize">${order.status.replace(/_/g," ")}</p>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Items Ordered</div>
        <table>
          <thead><tr>
            <th>Product</th><th>Size</th><th style="text-align:center">Qty</th>
            <th style="text-align:right">Unit Price</th><th style="text-align:right">Amount</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="totals">
        <table>
          <tr><td>Subtotal</td><td style="text-align:right">&#8377;${order.total.toLocaleString("en-IN")}</td></tr>
          <tr><td>Shipping</td><td style="text-align:right">FREE</td></tr>
          <tr class="grand"><td>Total</td><td style="text-align:right">&#8377;${order.total.toLocaleString("en-IN")}</td></tr>
        </table>
      </div>
      <div class="footer">
        <p>Thank you for shopping with Kurth\u012a Couture &nbsp;|&nbsp; questions? email us at support@kurthi.in</p>
      </div>
      <script>window.onload=function(){window.print();}<\/script>
    </body></html>`;
    const win = window.open("", "_blank", "width=820,height=700");
    if (win) { win.document.write(html); win.document.close(); }
  };

  const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: "orders",    label: "My Orders",     icon: "📦" },
    { id: "profile",   label: "Profile Info",  icon: "👤" },
    { id: "wishlist",  label: "Wishlist",       icon: "❤️" },
    { id: "addresses", label: "Addresses",     icon: "📍" },
  ];
  if (profile.userType === "shop_owner") {
    TABS.push({ id: "shop", label: "My Shop", icon: "🏪" });
  }

  const saveProfile = async () => {
    try {
      const updated = await updateUserProfile({ name: profile.name, phone: profile.phone });
      setProfile({ name: updated.name, email: updated.email, phone: updated.phone, userType: updated.userType, shopSlug: updated.shopSlug || "" });
    } catch { /* ignore network errors */ }
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    clearUserToken();
    window.location.href = "/login";
  };

  if (authLoading && !profile.email) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <div className="text-2xl font-bold tracking-widest" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)" }}>KURTHĪ</div>
          <p className="text-sm mt-2" style={{ color: "#aaa" }}>Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", fontFamily: "var(--font-jost, sans-serif)" }}>
      <Navbar />

      {/* Header */}
      <div className="py-10 px-4 sm:px-8" style={{ background: "linear-gradient(135deg, #5c1629 0%, #7b1e3a 60%, #c97d4a 100%)", color: "#fff" }}>
        <div className="max-w-7xl mx-auto flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)", fontFamily: "var(--font-cormorant, serif)" }}>
            {profile.name ? profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
          </div>
          <div>
            <h1 className="font-bold" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(1.6rem,3vw,2.5rem)", lineHeight: 1.1 }}>{profile.name}</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>{profile.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.15)" }}>✦ Kurthī Member</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{orders.length} Orders</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Tabs Sidebar ── */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--cream-dark)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all text-left"
                  style={{
                    background: activeTab === tab.id ? "var(--cream)" : "#fff",
                    color: activeTab === tab.id ? "var(--primary)" : "var(--foreground)",
                    border: "none",
                    cursor: "pointer",
                    borderLeft: activeTab === tab.id ? "3px solid var(--primary)" : "3px solid transparent",
                    borderBottom: "1px solid var(--cream-dark)",
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all text-left"
                style={{ background: "#fff", color: "#dc2626", border: "none", cursor: "pointer", borderLeft: "3px solid transparent" }}
              >
                <span>🚪</span>
                Sign Out
              </button>
            </div>
          </div>

          {/* ── Tab Content ── */}
          <div className="flex-1 min-w-0">

            {/* ── ORDERS TAB ── */}
            {activeTab === "orders" && (
              <div>
                <h2 className="font-bold mb-6" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.6rem", color: "var(--primary)" }}>My Orders</h2>
                <div className="flex flex-col gap-5">
                  {orders.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl" style={{ background: "#fff", border: "1px solid var(--cream-dark)" }}>
                      <div className="text-5xl mb-4">📦</div>
                      <p className="font-semibold text-lg" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)" }}>No orders yet</p>
                      <p className="text-sm mt-1" style={{ color: "#888" }}>Your orders will appear here after checkout.</p>
                      <Link href="/">
                        <button className="btn-primary mt-5 px-7 py-3 rounded-full text-sm font-semibold tracking-wide uppercase" style={{ cursor: "pointer" }}>Shop Now</button>
                      </Link>
                    </div>
                  ) : (
                  orders.map((order) => {
                    const expanded = expandedOrder === order.id;
                    const badge = STATUS_BADGE[order.status];
                    const statusIdx = STATUS_ORDER[order.status];
                    return (
                      <div
                        key={order.id}
                        className="rounded-2xl overflow-hidden"
                        style={{ background: "#fff", border: "1px solid var(--cream-dark)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}
                      >
                        {/* Order header */}
                        <div
                          className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 cursor-pointer"
                          style={{ borderBottom: expanded ? "1px solid var(--cream-dark)" : "none", background: expanded ? "#fffaf7" : "#fff" }}
                          onClick={() => setExpandedOrder(expanded ? null : order.id)}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold tracking-wide" style={{ color: "#aaa" }}>ORDER ID</span>
                            <span className="font-bold" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.05rem", color: "var(--primary)" }}>{order.id}</span>
                          </div>
                          <div className="text-xs" style={{ color: "#888" }}>{order.date}</div>
                          <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide" style={{ background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold" style={{ color: "var(--primary)", fontFamily: "var(--font-cormorant, serif)", fontSize: "1.1rem" }}>
                              ₹{order.total.toLocaleString("en-IN")}
                            </span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                              <path d="m6 9 6 6 6-6"/>
                            </svg>
                          </div>
                        </div>

                        {/* Order detail */}
                        {expanded && (
                          <div className="p-6">
                            {/* Items */}
                            <div className="flex flex-col gap-4 mb-6">
                              {order.items.map((item) => (
                                <div key={item.name} className="flex items-center gap-4">
                                  <div className={`${item.imgClass} w-14 h-16 rounded-xl flex-shrink-0 flex items-center justify-center`}>
                                    <span style={{ fontSize: "1.6rem", opacity: 0.25 }}>🥻</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm leading-tight" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--foreground)" }}>{item.name}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "#888" }}>Size: {item.size} · Qty: {item.qty}</p>
                                  </div>
                                  <span className="font-bold text-sm flex-shrink-0" style={{ color: "var(--primary)" }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                                </div>
                              ))}
                            </div>

                            {/* Status Timeline — only for non-cancelled */}
                            {order.status !== "cancelled" && (
                              <div className="mb-6 p-5 rounded-2xl" style={{ background: "var(--cream)", border: "1px solid var(--cream-dark)" }}>
                                <h4 className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: "#aaa" }}>Order Tracking</h4>
                                <div className="relative">
                                  {/* Progress bar */}
                                  <div className="absolute top-4 left-4 right-4 h-0.5" style={{ background: "var(--cream-dark)", zIndex: 0 }}>
                                    <div
                                      className="h-full transition-all duration-700"
                                      style={{
                                        background: "linear-gradient(90deg, var(--primary), var(--accent))",
                                        width: `${(statusIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                                      }}
                                    />
                                  </div>
                                  <div className="relative flex justify-between" style={{ zIndex: 1 }}>
                                    {STATUS_STEPS.map((step, i) => {
                                      const done = i < statusIdx;
                                      const active = i === statusIdx;
                                      return (
                                        <div key={step.key} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                                          <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
                                            style={{
                                              background: done ? "var(--accent)" : active ? "var(--primary)" : "#fff",
                                              border: done || active ? "none" : "2px solid var(--cream-dark)",
                                              boxShadow: active ? "0 0 0 4px rgba(123,30,58,0.15)" : "none",
                                            }}
                                          >
                                            {done ? "✓" : step.icon}
                                          </div>
                                          <span className="text-xs text-center leading-tight" style={{ color: active ? "var(--primary)" : done ? "var(--accent)" : "#bbb", fontWeight: active ? 700 : 400, maxWidth: "60px" }}>
                                            {step.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                {order.trackingId && (
                                  <div className="mt-5 flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--cream-dark)" }}>
                                    <span className="text-xs" style={{ color: "#888" }}>Tracking ID: <b style={{ color: "var(--foreground)" }}>{order.trackingId}</b></span>
                                    <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "var(--primary)", color: "#fff", border: "none", cursor: "pointer" }}>
                                      Track Package
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Delivery address + payment */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                              <div className="p-4 rounded-xl" style={{ background: "#fff", border: "1px solid var(--cream-dark)" }}>
                                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#aaa" }}>Delivery Address</p>
                                <p className="text-sm" style={{ color: "#555" }}>{order.address}</p>
                              </div>
                              <div className="p-4 rounded-xl" style={{ background: "#fff", border: "1px solid var(--cream-dark)" }}>
                                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#aaa" }}>Payment</p>
                                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{order.payMethod}</p>
                                <p className="text-xs mt-0.5" style={{ color: "#888" }}>Amount: ₹{order.total.toLocaleString("en-IN")}</p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3">
                              {order.status === "delivered" && (
                                <button className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase" style={{ cursor: "pointer" }}>
                                  Write a Review
                                </button>
                              )}
                              {order.status === "delivered" && (
                                <button className="btn-outline px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase" style={{ cursor: "pointer" }}>
                                  Buy Again
                                </button>
                              )}
                              {(order.status === "placed" || order.status === "confirmed") && (
                                <button className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase" style={{ background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", cursor: "pointer" }}>
                                  Cancel Order
                                </button>
                              )}
                              <button onClick={() => downloadInvoice(order)} className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide" style={{ background: "var(--cream)", color: "#666", border: "1px solid var(--cream-dark)", cursor: "pointer" }}>
                                Download Invoice
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                  )}
                </div>
              </div>
            )}

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.6rem", color: "var(--primary)" }}>Profile Information</h2>
                  {!editMode && (
                    <button onClick={() => setEditMode(true)} className="btn-outline px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ cursor: "pointer" }}>
                      Edit Profile
                    </button>
                  )}
                </div>
                {saved && (
                  <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}>
                    ✓ Profile updated successfully!
                  </div>
                )}
                <div className="rounded-2xl p-6 sm:p-8" style={{ background: "#fff", border: "1px solid var(--cream-dark)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center gap-5 mb-8 pb-6" style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "#fff", fontFamily: "var(--font-cormorant, serif)" }}>AS</div>
                    {editMode && (
                      <button className="btn-outline px-4 py-2 rounded-xl text-xs font-semibold" style={{ cursor: "pointer" }}>Change Photo</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { key: "name",  label: "Full Name",     icon: "👤" },
                      { key: "email", label: "Email Address", icon: "📧" },
                      { key: "phone", label: "Phone Number",  icon: "📱" },
                    ].map(({ key, label, icon }) => (
                      <div key={key} className={key === "email" ? "sm:col-span-2" : ""}>
                        <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#aaa" }}>{icon} {label}</label>
                        {editMode ? (
                          <input
                            type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                            value={profile[key as keyof typeof profile]}
                            onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                            style={{ border: "1.5px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)", color: "var(--foreground)" }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--cream-dark)")}
                          />
                        ) : (
                          <p className="text-base font-medium py-2" style={{ color: "var(--foreground)" }}>{profile[key as keyof typeof profile]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {editMode && (
                    <div className="flex gap-3 mt-8">
                      <button onClick={saveProfile} className="btn-primary px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wide" style={{ cursor: "pointer" }}>
                        Save Changes
                      </button>
                      <button onClick={() => setEditMode(false)} className="btn-outline px-6 py-3.5 rounded-xl text-sm font-semibold" style={{ cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {[
                    { label: "Orders",     value: orders.length,          icon: "📦" },
                    { label: "Delivered",  value: orders.filter((o) => o.status === "delivered").length, icon: "✅" },
                    { label: "Wishlist",   value: wishlistItems.length,        icon: "❤️" },
                    { label: "Savings",    value: "₹2,801",                    icon: "💰" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "#fff", border: "1px solid var(--cream-dark)" }}>
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="font-bold text-xl" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)" }}>{value}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#888" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── WISHLIST TAB ── */}
            {activeTab === "wishlist" && (
              <div>
                <h2 className="font-bold mb-6" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.6rem", color: "var(--primary)" }}>My Wishlist</h2>
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl" style={{ background: "#fff", border: "1px solid var(--cream-dark)" }}>
                    <div className="text-5xl mb-4">❤️</div>
                    <p className="font-semibold text-lg" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)" }}>Your wishlist is empty</p>
                    <p className="text-sm mt-1" style={{ color: "#888" }}>Heart a product to save it here.</p>
                    <Link href="/">
                      <button className="btn-primary mt-5 px-7 py-3 rounded-full text-sm font-semibold tracking-wide uppercase" style={{ cursor: "pointer" }}>Browse Products</button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 rounded-2xl card-lift" style={{ background: "#fff", border: "1px solid var(--cream-dark)" }}>
                        {/* Product image */}
                        <div className="w-20 h-24 rounded-xl flex-shrink-0 overflow-hidden relative" style={{ background: "var(--cream)" }}>
                          {item.images?.[0] ? (
                            <img src={mediaUrl(item.images[0])} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          ) : (
                            <div className={`${item.imgClass} w-full h-full flex items-center justify-center`}>
                              <span style={{ fontSize: "2rem", opacity: 0.25 }}>🥻</span>
                            </div>
                          )}
                          {item.tag && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "var(--primary)", color: "#fff", fontSize: "0.6rem" }}>{item.tag}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm leading-tight" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--foreground)" }}>{item.name}</p>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", flexShrink: 0, padding: "2px" }}
                              title="Remove"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6 6 18M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold" style={{ color: "var(--primary)", fontFamily: "var(--font-jost, sans-serif)" }}>₹{item.price.toLocaleString("en-IN")}</span>
                              {item.original && item.original > item.price && (
                                <span className="text-xs line-through" style={{ color: "#aaa" }}>₹{item.original.toLocaleString("en-IN")}</span>
                              )}
                            </div>
                            <Link href="/">
                              <button className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide" style={{ cursor: "pointer" }}>Shop Now</button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ADDRESSES TAB ── */}
            {activeTab === "addresses" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.6rem", color: "var(--primary)" }}>Saved Addresses</h2>
                  <button onClick={openAddAddr} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide" style={{ cursor: "pointer" }}>
                    + Add Address
                  </button>
                </div>

                {savedAddresses.length === 0 && !showAddrForm && (
                  <div className="text-center py-16">
                    <span style={{ fontSize: "3rem" }}>📍</span>
                    <p className="mt-4 text-sm" style={{ color: "#888" }}>No saved addresses yet.</p>
                    <button onClick={openAddAddr} className="btn-primary mt-4 px-7 py-3 rounded-full text-sm font-semibold tracking-wide" style={{ cursor: "pointer" }}>+ Add Your First Address</button>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {savedAddresses.map(a => (
                    <div key={a.id} className="p-5 rounded-2xl" style={{ background: "#fff", border: a.isDefault ? "2px solid var(--primary)" : "1px solid var(--cream-dark)" }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{a.label}</span>
                          {a.isDefault && <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--cream)", color: "var(--primary)" }}>Default</span>}
                        </div>
                        <div className="flex gap-3">
                          {!a.isDefault && <button onClick={() => setDefaultAddr(a.id)} className="text-xs font-semibold" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", textDecoration: "underline" }}>Set Default</button>}
                          <button onClick={() => openEditAddr(a)} className="text-xs font-semibold underline" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)" }}>Edit</button>
                          {!a.isDefault && <button onClick={() => removeAddr(a.id)} className="text-xs" style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>Remove</button>}
                        </div>
                      </div>
                      <p className="text-sm" style={{ color: "#555" }}>{a.line1}{a.line2 ? ", " + a.line2 : ""}, {a.city}, {a.state} – {a.pincode}</p>
                      <p className="text-xs mt-1" style={{ color: "#888" }}>{a.name} · 📱 {a.phone}</p>
                    </div>
                  ))}
                </div>

                {/* Add / Edit form */}
                {showAddrForm && (
                  <div className="mt-6 rounded-2xl p-6" style={{ background: "#fff", border: "2px solid var(--primary)", boxShadow: "0 4px 30px rgba(123,30,58,0.08)" }}>
                    <h3 className="font-bold mb-4" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.3rem", color: "var(--primary)" }}>
                      {savedAddresses.find(a => a.id === editingAddr.id) ? "Edit Address" : "New Address"}
                    </h3>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold tracking-wide mb-2" style={{ color: "#666" }}>Label</label>
                      <div className="flex gap-2">
                        {["Home","Office","Other"].map(l => (
                          <button key={l} type="button" onClick={() => setEditingAddr(e => ({ ...e, label: l }))}
                            className="px-4 py-2 rounded-full text-sm font-semibold"
                            style={{ background: editingAddr.label===l ? "var(--primary)" : "#fff", color: editingAddr.label===l ? "#fff" : "var(--foreground)", border: `1.5px solid ${editingAddr.label===l ? "var(--primary)" : "var(--cream-dark)"}`, cursor: "pointer" }}
                          >{l}</button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {([
                        ["name","Full Name *","Your full name","text"],
                        ["phone","Phone *","9876543210","tel"],
                        ["pincode","Pincode *","400001","text"],
                        ["city","City *","Mumbai","text"],
                        ["state","State *","Maharashtra","text"],
                      ] as [keyof SavedAddress, string, string, string][]).map(([key, label, ph, type]) => (
                        <ProfileField key={key} label={label} value={editingAddr[key] as string} onChange={v => setEditingAddr(e => ({ ...e, [key]: v }))} placeholder={ph} type={type} />
                      ))}
                      <div className="sm:col-span-2">
                        <ProfileField label="Address Line 1 *" value={editingAddr.line1} onChange={v => setEditingAddr(e => ({ ...e, line1: v }))} placeholder="House no., Building, Street" />
                      </div>
                      <div className="sm:col-span-2">
                        <ProfileField label="Address Line 2 (optional)" value={editingAddr.line2} onChange={v => setEditingAddr(e => ({ ...e, line2: v }))} placeholder="Area, Landmark" />
                      </div>
                    </div>
                    {addrFormErr && <p className="text-sm mt-3" style={{ color: "#dc2626" }}>{addrFormErr}</p>}
                    <div className="flex gap-3 mt-5">
                      <button onClick={saveAddrForm} className="btn-primary px-8 py-3 rounded-xl text-sm font-semibold tracking-wide" style={{ cursor: "pointer" }}>Save Address</button>
                      <button onClick={() => setShowAddrForm(false)} className="btn-outline px-6 py-3 rounded-xl text-sm font-semibold" style={{ cursor: "pointer" }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SHOP TAB ── */}
            {activeTab === "shop" && (
              <div>
                <h2 className="font-bold mb-6" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.6rem", color: "var(--primary)" }}>Manage Shop</h2>
                <div className="rounded-2xl p-6 sm:p-8" style={{ background: "#fff", border: "1px solid var(--cream-dark)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                  <p className="text-sm text-gray-500 mb-6 italic">Shop management dashboard. Here you can see how your shop appears to customers.</p>
                  <Link href={`/${profile.shopSlug}`} target="_blank">
                    <button className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold mb-8" style={{ cursor: "pointer" }}>View Public Shop Page</button>
                  </Link>
                  <div className="p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                    <span className="text-4xl mb-4 block">🛠️</span>
                    <h3 className="font-bold text-gray-400">Advanced Shop Dashboard Coming Soon</h3>
                    <p className="text-xs text-gray-400 mt-1">Soon you will be able to add products, track sales, and customize your theme.</p>
                  </div>

                  {/* Password Change Section */}
                  <div className="mt-8 pt-8 border-t border-cream-dark">
                    <h3 className="font-bold mb-4" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.2rem", color: "var(--primary)" }}>Security</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                      <ProfileField label="Current Password" type="password" value={oldPass} onChange={setOldPass} placeholder="••••••••" />
                      <ProfileField label="New Password" type="password" value={newPass} onChange={setNewPass} placeholder="••••••••" />
                    </div>
                    {passError && <p className="text-xs text-red-500 mt-2">{passError}</p>}
                    {passSuccess && <p className="text-xs text-green-600 mt-2">{passSuccess}</p>}
                    <button 
                      onClick={async () => {
                        if (!oldPass || !newPass) { setPassError("Both fields are required."); return; }
                        setPassLoading(true); setPassError(""); setPassSuccess("");
                        try {
                          const { changePassword } = await import("@/lib/api");
                          await changePassword(oldPass, newPass);
                          setPassSuccess("Password updated successfully!");
                          setOldPass(""); setNewPass("");
                        } catch (err: any) {
                          setPassError(err.message.includes("400") ? "Incorrect current password." : "Something went wrong.");
                        } finally { setPassLoading(false); }
                      }}
                      disabled={passLoading}
                      className="btn-primary px-6 py-2 rounded-xl text-xs font-semibold mt-4"
                      style={{ cursor: passLoading ? "wait" : "pointer" }}
                    >
                      {passLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{ color: "#666" }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{ border: "1.5px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)", color: "var(--foreground)", background: "#fff" }}
        onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={e  => (e.currentTarget.style.borderColor = "var(--cream-dark)")}
      />
    </div>
  );
}
