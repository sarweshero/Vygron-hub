"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

const STEPS = ["Address", "Payment", "Confirmation"];

type SavedAddress = {
  id: string; label: string;
  name: string; phone: string;
  pincode: string; city: string; state: string;
  line1: string; line2: string;
  isDefault: boolean;
};

type CartItem = {
  id: number; name: string; price: number; original?: number;
  imgClass: string; size: string; color: string; colorHex: string;
  qty: number; fabric: string;
};

const ESTIMATED_DELIVERY = new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "long" });

function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
        style={{
          background: done ? "var(--accent)" : active ? "var(--primary)" : "var(--cream-dark)",
          color: done || active ? "#fff" : "#aaa",
        }}
      >
        {done ? "✓" : n}
      </div>
      <span className="text-sm font-semibold hidden sm:block" style={{ color: active ? "var(--primary)" : done ? "var(--accent)" : "#aaa" }}>
        {label}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [placedOrderId, setPlacedOrderId] = useState("");

  /* Saved addresses from profile */
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addrMode, setAddrMode]             = useState<"saved" | "new">("new");
  const [selectedAddrId, setSelectedAddrId] = useState<string>("");
  const [saveAddr, setSaveAddr]             = useState(false);
  const [addrLabel, setAddrLabel]           = useState("Home");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kurthi_addresses");
      if (stored) {
        const parsed: SavedAddress[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setSavedAddresses(parsed);
          const def = parsed.find(a => a.isDefault) ?? parsed[0];
          setSelectedAddrId(def.id);
          setAddrMode("saved");
        }
      }
    } catch {}
  }, []);

  /* Cart items */
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kurthi_cart");
      if (stored) setCartItems(JSON.parse(stored));
    } catch {}
  }, []);

  const cartSubtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartShipping = cartSubtotal >= 1499 ? 0 : 99;
  const cartSavings  = cartItems.reduce((s, i) => s + ((i.original ?? i.price) - i.price) * i.qty, 0);
  const cartTotal    = cartSubtotal + cartShipping;
  const totalItems   = cartItems.reduce((s, i) => s + i.qty, 0);

  const [addr, setAddr] = useState({ name: "", phone: "", pincode: "", city: "", state: "", line1: "", line2: "" });
  const [addrError, setAddrError] = useState("");

  /* Payment state */
  const [payMethod, setPayMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [processing, setProcessing] = useState(false);

  const validateAddress = () => {
    if (addrMode === "saved") {
      const sa = savedAddresses.find(a => a.id === selectedAddrId);
      if (!sa) { setAddrError("Please select a delivery address."); return false; }
      setAddr({ name: sa.name, phone: sa.phone, pincode: sa.pincode, city: sa.city, state: sa.state, line1: sa.line1, line2: sa.line2 });
      setAddrError(""); return true;
    }
    if (!addr.name || !addr.phone || !addr.pincode || !addr.city || !addr.state || !addr.line1) {
      setAddrError("Please fill in all required fields."); return false;
    }
    if (!/^\d{10}$/.test(addr.phone)) { setAddrError("Enter a valid 10-digit phone number."); return false; }
    if (!/^\d{6}$/.test(addr.pincode)) { setAddrError("Enter a valid 6-digit pincode."); return false; }
    setAddrError("");
    if (saveAddr) {
      const newSaved: SavedAddress = {
        id: Date.now().toString(), label: addrLabel || "Home",
        ...addr, isDefault: savedAddresses.length === 0,
      };
      const updated = [...savedAddresses, newSaved];
      setSavedAddresses(updated);
      try { localStorage.setItem("kurthi_addresses", JSON.stringify(updated)); } catch {}
    }
    return true;
  };

  const handlePlaceOrder = () => {
    setProcessing(true);
    const orderId = "KCI-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 89999);
    setPlacedOrderId(orderId);
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      items: cartItems.map(i => ({ name: i.name, qty: i.qty, size: i.size, price: i.price, imgClass: i.imgClass })),
      total: cartTotal,
      status: "placed" as const,
      customerName: addr.name,
      address: [addr.line1, addr.line2, addr.city, addr.state + " – " + addr.pincode].filter(Boolean).join(", "),
      payMethod: payMethod.toUpperCase(),
    };
    try {
      const prev = localStorage.getItem("kurthi_orders");
      const existing = prev ? JSON.parse(prev) : [];
      localStorage.setItem("kurthi_orders", JSON.stringify([newOrder, ...existing]));
      localStorage.removeItem("kurthi_cart");
    } catch {}
    setTimeout(() => { setProcessing(false); setStep(2); }, 2000);
  };

  /* ── Confirmation Screen ── */
  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--background)", fontFamily: "var(--font-jost, sans-serif)" }}>
        <Navbar variant="checkout" backLabel="" />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-7xl mb-6 animate-float inline-block">🎉</div>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="font-bold mb-3" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(2rem,5vw,3rem)", color: "var(--primary)" }}>
            Order Placed!
          </h1>
          <p className="text-base mb-2" style={{ color: "#666" }}>
            Thank you, <b style={{ color: "var(--foreground)" }}>{addr.name || "Valued Customer"}</b>! Your order has been confirmed.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl my-6" style={{ background: "var(--cream)", border: "1px solid var(--cream-dark)" }}>
            <span className="text-sm" style={{ color: "#888" }}>Order ID:</span>
            <span className="font-bold tracking-wider" style={{ color: "var(--primary)", fontFamily: "var(--font-cormorant, serif)", fontSize: "1.1rem" }}>{placedOrderId}</span>
          </div>
          <div className="rounded-2xl p-6 mb-8 text-left" style={{ background: "#fff", border: "1px solid var(--cream-dark)", boxShadow: "0 2px 20px rgba(0,0,0,0.05)" }}>
            <h3 className="font-bold mb-4 pb-3" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.2rem", color: "var(--primary)", borderBottom: "1px solid var(--cream-dark)" }}>
              What happens next?
            </h3>
            {[
              { icon: "📧", title: "Confirmation email sent", sub: `We've sent your order details to your email.` },
              { icon: "📦", title: "Processing (1–2 days)", sub: "Your items are being carefully packed." },
              { icon: "🚚", title: "Shipped (3–5 days)", sub: `Estimated delivery by ${ESTIMATED_DELIVERY}.` },
            ].map((s) => (
              <div key={s.title} className="flex items-start gap-4 py-3" style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{s.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#888" }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/profile">
              <button className="btn-primary px-8 py-4 rounded-full text-sm font-semibold tracking-wider uppercase" style={{ cursor: "pointer" }}>
                Track My Order
              </button>
            </Link>
            <Link href="/products">
              <button className="btn-outline px-8 py-4 rounded-full text-sm font-semibold tracking-wider uppercase" style={{ cursor: "pointer" }}>
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", fontFamily: "var(--font-jost, sans-serif)" }}>
      {/* Navbar */}
      <Navbar variant="checkout" />

      {/* Breadcrumb + Steps */}
      <div className="py-8 px-4 sm:px-8" style={{ borderBottom: "1px solid var(--cream-dark)", background: "#fff" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4 text-xs tracking-wider" style={{ color: "#aaa" }}>
            <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/cart" style={{ color: "#aaa", textDecoration: "none" }}>Cart</Link>
            <span>/</span>
            <span style={{ color: "var(--primary)" }}>Checkout</span>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <StepBadge n={i + 1} label={label} active={step === i} done={step > i} />
                {i < STEPS.length - 1 && (
                  <div className="w-10 sm:w-20 h-0.5 rounded" style={{ background: step > i ? "var(--accent)" : "var(--cream-dark)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Left Panel ── */}
          <div className="flex-1 min-w-0">

            {/* STEP 0 — Address */}
            {step === 0 && (
              <div className="rounded-2xl p-6 sm:p-8" style={{ background: "#fff", border: "1px solid var(--cream-dark)", boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
                <h2 className="font-bold mb-6" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.6rem", color: "var(--primary)" }}>
                  Delivery Address
                </h2>

                {/* ── Saved addresses ── */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#aaa" }}>Saved Addresses</p>
                    <div className="flex flex-col gap-3">
                      {savedAddresses.map(sa => (
                        <div
                          key={sa.id}
                          onClick={() => { setAddrMode("saved"); setSelectedAddrId(sa.id); }}
                          className="p-4 rounded-xl cursor-pointer transition-all"
                          style={{ border: addrMode==="saved" && selectedAddrId===sa.id ? "2px solid var(--primary)" : "1.5px solid var(--cream-dark)", background: addrMode==="saved" && selectedAddrId===sa.id ? "#fff8f5" : "#fff" }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ border: `2px solid ${addrMode==="saved" && selectedAddrId===sa.id ? "var(--primary)" : "#ccc"}` }}>
                              {addrMode==="saved" && selectedAddrId===sa.id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary)" }} />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{sa.label}</span>
                                {sa.isDefault && <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--cream)", color: "var(--primary)" }}>Default</span>}
                              </div>
                              <p className="text-sm" style={{ color: "#555" }}>{sa.line1}{sa.line2 ? ", " + sa.line2 : ""}, {sa.city}, {sa.state} – {sa.pincode}</p>
                              <p className="text-xs mt-0.5" style={{ color: "#888" }}>{sa.name} · 📱 {sa.phone}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Use new address option */}
                      <div
                        onClick={() => setAddrMode("new")}
                        className="p-4 rounded-xl cursor-pointer transition-all flex items-center gap-3"
                        style={{ border: addrMode==="new" ? "2px solid var(--primary)" : "1.5px dashed var(--cream-dark)", background: addrMode==="new" ? "#fff8f5" : "#fafafa" }}
                      >
                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: `2px solid ${addrMode==="new" ? "var(--primary)" : "#ccc"}` }}>
                          {addrMode==="new" && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary)" }} />}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: addrMode==="new" ? "var(--primary)" : "#888" }}>+ Use a different address</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── New address form ── */}
                {addrMode === "new" && (
                  <div>
                    {savedAddresses.length > 0 && <div className="mb-5" style={{ height: "1px", background: "var(--cream-dark)" }} />}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Full Name *" value={addr.name}       onChange={(v) => setAddr({ ...addr, name:    v })} placeholder="Ananya Sharma" />
                      <Field label="Phone Number *" value={addr.phone}   onChange={(v) => setAddr({ ...addr, phone:   v })} placeholder="9876543210" type="tel" />
                      <Field label="Pincode *" value={addr.pincode}      onChange={(v) => setAddr({ ...addr, pincode: v })} placeholder="400001" />
                      <Field label="City *" value={addr.city}            onChange={(v) => setAddr({ ...addr, city:    v })} placeholder="Mumbai" />
                      <Field label="State *" value={addr.state}          onChange={(v) => setAddr({ ...addr, state:   v })} placeholder="Maharashtra" />
                      <div className="sm:col-span-2">
                        <Field label="Address Line 1 *" value={addr.line1} onChange={(v) => setAddr({ ...addr, line1: v })} placeholder="House no., Building, Street" />
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Address Line 2 (optional)" value={addr.line2} onChange={(v) => setAddr({ ...addr, line2: v })} placeholder="Area, Landmark" />
                      </div>
                    </div>

                    {/* Save address option */}
                    <div className="mt-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 rounded-xl" style={{ background: "var(--cream)", border: "1px solid var(--cream-dark)" }}>
                      <label className="flex items-center gap-2 cursor-pointer" onClick={() => setSaveAddr(v => !v)}>
                        <span className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center" style={{ background: saveAddr ? "var(--primary)" : "#fff", border: `1.5px solid ${saveAddr ? "var(--primary)" : "var(--cream-dark)"}` }}>
                          {saveAddr && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M1 6l4 4 6-7"/></svg>}
                        </span>
                        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Save this address to my profile</span>
                      </label>
                      {saveAddr && (
                        <div className="flex items-center gap-2 sm:ml-4">
                          <span className="text-xs font-semibold" style={{ color: "#888" }}>Label:</span>
                          <div className="flex gap-2">
                            {["Home","Office","Other"].map(l => (
                              <button key={l} type="button" onClick={() => setAddrLabel(l)}
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ background: addrLabel===l ? "var(--primary)" : "#fff", color: addrLabel===l ? "#fff" : "var(--foreground)", border: `1px solid ${addrLabel===l ? "var(--primary)" : "var(--cream-dark)"}`, cursor: "pointer" }}
                              >{l}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {addrError && <p className="text-sm mt-3" style={{ color: "#dc2626" }}>{addrError}</p>}
                <button
                  onClick={() => validateAddress() && setStep(1)}
                  className="btn-primary mt-6 px-10 py-4 rounded-2xl text-sm font-semibold tracking-wider uppercase"
                  style={{ cursor: "pointer" }}
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* STEP 1 — Payment */}
            {step === 1 && (
              <div className="rounded-2xl p-6 sm:p-8" style={{ background: "#fff", border: "1px solid var(--cream-dark)", boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
                <h2 className="font-bold mb-6" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.6rem", color: "var(--primary)" }}>
                  Payment Method
                </h2>

                {/* Delivery summary */}
                <div className="flex items-start justify-between mb-6 p-4 rounded-xl" style={{ background: "var(--cream)", border: "1px solid var(--cream-dark)" }}>
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#aaa" }}>Delivering to</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{addr.name}, {addr.phone}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#888" }}>{addr.line1}{addr.line2 ? ", " + addr.line2 : ""}, {addr.city}, {addr.state} – {addr.pincode}</p>
                  </div>
                  <button onClick={() => setStep(0)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: "0.8rem", fontWeight: 600, textDecoration: "underline" }}>
                    Change
                  </button>
                </div>

                {/* Payment options */}
                <div className="flex flex-col gap-3">
                  {[
                    { id: "upi",        label: "UPI / PhonePe / GPay", icon: "📱", sub: "Instant, zero fees" },
                    { id: "card",       label: "Credit / Debit Card",   icon: "💳", sub: "Visa, Mastercard, RuPay" },
                    { id: "netbanking", label: "Net Banking",           icon: "🏦", sub: "All major banks" },
                    { id: "cod",        label: "Cash on Delivery",      icon: "💵", sub: "Pay when delivered" },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setPayMethod(opt.id as typeof payMethod)}
                      className="rounded-xl p-4 cursor-pointer transition-all"
                      style={{
                        border: payMethod === opt.id ? "2px solid var(--primary)" : "1.5px solid var(--cream-dark)",
                        background: payMethod === opt.id ? "#fff8f5" : "#fff",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: `2px solid ${payMethod === opt.id ? "var(--primary)" : "#ccc"}` }}>
                          {payMethod === opt.id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary)" }} />}
                        </div>
                        <span className="text-xl">{opt.icon}</span>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{opt.label}</p>
                          <p className="text-xs" style={{ color: "#888" }}>{opt.sub}</p>
                        </div>
                      </div>

                      {/* UPI field */}
                      {payMethod === "upi" && opt.id === "upi" && (
                        <div className="mt-4 ml-8">
                          <input
                            type="text"
                            placeholder="yourname@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                            style={{ border: "1.5px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)" }}
                          />
                        </div>
                      )}

                      {/* Card fields */}
                      {payMethod === "card" && opt.id === "card" && (
                        <div className="mt-4 ml-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <input
                              type="text" maxLength={19}
                              placeholder="Card Number"
                              value={card.number}
                              onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim() })}
                              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                              style={{ border: "1.5px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)" }}
                            />
                          </div>
                          <input type="text" placeholder="Name on Card" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1.5px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)" }} />
                          <div className="flex gap-2">
                            <input type="text" maxLength={5} placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1.5px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)" }} />
                            <input type="password" maxLength={4} placeholder="CVV" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} className="w-20 px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1.5px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)" }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="btn-primary mt-8 w-full py-4 rounded-2xl text-sm font-semibold tracking-wider uppercase"
                  style={{ cursor: processing ? "wait" : "pointer", opacity: processing ? 0.8 : 1 }}
                >
                  {processing ? "Processing…" : `Place Order · ₹${cartTotal.toLocaleString("en-IN")}`}
                </button>
                <p className="text-xs text-center mt-3" style={{ color: "#aaa" }}>🔒 Your payment is 100% secure & encrypted</p>
              </div>
            )}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:w-[360px] flex-shrink-0">
            <div className="rounded-2xl p-6 sticky top-24" style={{ background: "#fff", border: "1px solid var(--cream-dark)", boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}>
              <h2 className="font-bold mb-5 pb-4" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.4rem", color: "var(--primary)", borderBottom: "1px solid var(--cream-dark)" }}>
                Order Summary ({totalItems} item{totalItems !== 1 ? "s" : ""})
              </h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <span style={{ fontSize: "2.5rem" }}>🛍️</span>
                  <p className="text-sm mt-3" style={{ color: "#aaa" }}>Your cart is empty.</p>
                  <Link href="/products">
                    <button className="btn-primary mt-4 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide" style={{ cursor: "pointer" }}>Shop Now</button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 mb-5">
                    {cartItems.map((item) => (
                      <div key={`${item.id}-${item.size}`} className="flex items-center gap-3">
                        <div className={`${item.imgClass} w-14 h-16 rounded-lg flex-shrink-0 flex items-center justify-center`}>
                          <span style={{ fontSize: "1.5rem", opacity: 0.25 }}>🥻</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-tight" style={{ color: "var(--foreground)", fontFamily: "var(--font-cormorant, serif)" }}>{item.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#888" }}>Size: {item.size} · Qty: {item.qty}</p>
                        </div>
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: "var(--primary)" }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2.5 py-4" style={{ borderTop: "1px solid var(--cream-dark)", borderBottom: "1px solid var(--cream-dark)" }}>
                    <SRow label={`Subtotal (${totalItems} item${totalItems !== 1 ? "s" : ""})`} value={`₹${cartSubtotal.toLocaleString("en-IN")}`} />
                    {cartSavings > 0 && <SRow label="Product Discount" value={`-₹${cartSavings.toLocaleString("en-IN")}`} vc="#16a34a" />}
                    <SRow label="Shipping" value={cartShipping === 0 ? "FREE" : `₹${cartShipping}`} vc={cartShipping === 0 ? "#16a34a" : undefined} />
                    {cartShipping === 0 && <p className="text-xs" style={{ color: "#16a34a" }}>✓ Free shipping on orders above ₹1,499</p>}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold" style={{ color: "var(--foreground)" }}>Total</span>
                    <span className="font-bold text-2xl" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)" }}>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{ color: "#666" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{ border: "1.5px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)", color: "var(--foreground)", background: "#fff" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--cream-dark)")}
      />
    </div>
  );
}

function SRow({ label, value, vc }: { label: string; value: string; vc?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: "#666" }}>{label}</span>
      <span className="font-semibold" style={{ color: vc ?? "var(--foreground)" }}>{value}</span>
    </div>
  );
}
