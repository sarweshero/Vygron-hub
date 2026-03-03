"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

/* ─── Mock cart data ─── */
type CartItem = {
  id: number;
  name: string;
  price: number;
  original?: number;
  imgClass: string;
  size: string;
  color: string;
  colorHex: string;
  qty: number;
  fabric: string;
};



const COUPON_CODES: Record<string, number> = {
  KURTHI20: 20,
  FIRST10: 10,
  FESTIVE15: 15,
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const loaded = useRef(false);

  /* ── Load from localStorage once ── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kurthi_cart");
      if (stored) setCart(JSON.parse(stored));
    } catch {}
  }, []);

  /* ── Write back on every change, but skip the very first render (cart=[]) ── */
  useEffect(() => {
    if (!loaded.current) { loaded.current = true; return; }
    localStorage.setItem("kurthi_cart", JSON.stringify(cart));
  }, [cart]);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; pct: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };
  const removeItem = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const savings = cart.reduce((sum, i) => sum + ((i.original ?? i.price) - i.price) * i.qty, 0);
  const shipping = subtotal >= 1499 ? 0 : 99;
  const discountAmount = appliedCoupon ? Math.round(subtotal * appliedCoupon.pct / 100) : 0;
  const total = subtotal + shipping - discountAmount;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    const pct = COUPON_CODES[code];
    if (pct) {
      setAppliedCoupon({ code, pct });
      setCouponError("");
    } else {
      setCouponError("Invalid or expired coupon code.");
      setAppliedCoupon(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--background)", fontFamily: "var(--font-jost, sans-serif)" }}>
        <Navbar variant="simple" cartCount={0} />
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
          <span style={{ fontSize: "5rem" }}>🛍️</span>
          <h2 className="mt-6 font-bold text-3xl" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)" }}>Your cart is empty</h2>
          <p className="mt-3 text-base" style={{ color: "#888" }}>Looks like you haven&apos;t added anything yet.</p>
          <Link href="/products">
            <button className="btn-primary mt-8 px-10 py-4 rounded-full text-sm font-semibold tracking-widest uppercase" style={{ cursor: "pointer" }}>
              Explore Collections
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", fontFamily: "var(--font-jost, sans-serif)" }}>
      <Navbar variant="simple" cartCount={totalItems} />

      {/* Header */}
      <div className="py-10 px-4 sm:px-8" style={{ borderBottom: "1px solid var(--cream-dark)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2 text-xs tracking-wider" style={{ color: "#aaa" }}>
            <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "var(--primary)" }}>Shopping Cart</span>
          </div>
          <h1 className="font-bold" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(2rem,4vw,3rem)", color: "var(--primary)" }}>
            Shopping Cart
          </h1>
          <p className="text-sm mt-1" style={{ color: "#888" }}>{totalItems} item{totalItems !== 1 ? "s" : ""} in your bag</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Cart Items ── */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-5">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-5 p-5 rounded-2xl animate-fadeIn"
                  style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid var(--cream-dark)" }}
                >
                  {/* Product image */}
                  <div
                    className={`${item.imgClass} rounded-xl flex-shrink-0 flex items-center justify-center`}
                    style={{ width: "110px", height: "130px" }}
                  >
                    <span style={{ fontSize: "3rem", opacity: 0.25 }}>🥻</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold leading-tight mb-1" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.15rem", color: "var(--foreground)" }}>
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "#888" }}>
                          <span>Size: <b style={{ color: "var(--foreground)" }}>{item.size}</b></span>
                          <span className="flex items-center gap-1">
                            Color: <span className="w-3 h-3 rounded-full inline-block" style={{ background: item.colorHex }} /> <b style={{ color: "var(--foreground)" }}>{item.color}</b>
                          </span>
                          <span>Fabric: {item.fabric}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}
                        title="Remove"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                      {/* Qty stepper */}
                      <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--cream-dark)" }}>
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-9 h-9 flex items-center justify-center transition-colors"
                          style={{ background: "var(--cream)", border: "none", cursor: "pointer", color: "var(--primary)", fontWeight: 700, fontSize: "1.1rem" }}
                        >−</button>
                        <span className="w-10 text-center text-sm font-bold" style={{ color: "var(--foreground)" }}>{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-9 h-9 flex items-center justify-center transition-colors"
                          style={{ background: "var(--cream)", border: "none", cursor: "pointer", color: "var(--primary)", fontWeight: 700, fontSize: "1.1rem" }}
                        >+</button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-bold text-lg" style={{ color: "var(--primary)", fontFamily: "var(--font-jost, sans-serif)" }}>
                          ₹{(item.price * item.qty).toLocaleString("en-IN")}
                        </div>
                        {item.original && (
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-xs line-through" style={{ color: "#bbb" }}>₹{(item.original * item.qty).toLocaleString("en-IN")}</span>
                            <span className="text-xs font-bold" style={{ color: "#16a34a" }}>
                              {Math.round(((item.original - item.price) / item.original) * 100)}% off
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* You save / continue shopping */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              {savings > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <span style={{ color: "#16a34a", fontSize: "1.1rem" }}>🎉</span>
                  <span className="text-sm font-semibold" style={{ color: "#15803d" }}>
                    You&apos;re saving ₹{savings.toLocaleString("en-IN")} on this order!
                  </span>
                </div>
              )}
              <Link href="/products">
                <button className="btn-outline px-6 py-3 rounded-full text-sm font-semibold tracking-wider" style={{ cursor: "pointer" }}>
                  ← Continue Shopping
                </button>
              </Link>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:w-[370px] flex-shrink-0">
            <div className="rounded-2xl p-6 sticky top-24" style={{ background: "#fff", border: "1px solid var(--cream-dark)", boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}>
              <h2 className="font-bold mb-6 pb-4" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.5rem", color: "var(--primary)", borderBottom: "1px solid var(--cream-dark)" }}>
                Order Summary
              </h2>

              {/* Coupon */}
              <div className="mb-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ border: "1.5px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)", color: "var(--foreground)" }}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide"
                    style={{ background: "var(--primary)", color: "#fff", border: "none", cursor: "pointer" }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-xs mt-1.5" style={{ color: "#dc2626" }}>{couponError}</p>}
                {appliedCoupon && (
                  <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-lg" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <span className="text-xs font-semibold" style={{ color: "#15803d" }}>🎟 <b>{appliedCoupon.code}</b> — {appliedCoupon.pct}% off</span>
                    <button onClick={() => { setAppliedCoupon(null); setCoupon(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                )}
                <p className="text-xs mt-2" style={{ color: "#aaa" }}>
                  Try: <button onClick={() => setCoupon("KURTHI20")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: "0.75rem", textDecoration: "underline", padding: 0 }}>KURTHI20</button>,{" "}
                  <button onClick={() => setCoupon("FIRST10")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: "0.75rem", textDecoration: "underline", padding: 0 }}>FIRST10</button>
                </p>
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-3 py-4" style={{ borderTop: "1px solid var(--cream-dark)", borderBottom: "1px solid var(--cream-dark)" }}>
                <Row label={`Subtotal (${totalItems} item${totalItems !== 1 ? "s" : ""})`} value={`₹${subtotal.toLocaleString("en-IN")}`} />
                {savings > 0 && <Row label="Product Discount" value={`-₹${savings.toLocaleString("en-IN")}`} valueColor="#16a34a" />}
                {appliedCoupon && <Row label={`Coupon (${appliedCoupon.code})`} value={`-₹${discountAmount.toLocaleString("en-IN")}`} valueColor="#16a34a" />}
                <Row
                  label="Shipping"
                  value={shipping === 0 ? "FREE" : `₹${shipping}`}
                  valueColor={shipping === 0 ? "#16a34a" : undefined}
                />
                {shipping === 0 && (
                  <p className="text-xs" style={{ color: "#16a34a" }}>✓ Free shipping applied (orders above ₹1,499)</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 mb-6">
                <span className="font-bold text-base" style={{ color: "var(--foreground)" }}>Total</span>
                <span className="font-bold text-2xl" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)" }}>
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <Link href="/checkout">
                <button className="btn-primary w-full py-4 rounded-2xl font-semibold tracking-wider text-sm uppercase" style={{ cursor: "pointer" }}>
                  Proceed to Checkout →
                </button>
              </Link>

              {/* Trust signals */}
              <div className="mt-5 flex flex-col gap-2">
                {["🔒 Secure 256-bit SSL payment", "🔄 Easy 15-day returns", "📦 Packed with premium care"].map((t) => (
                  <p key={t} className="text-xs text-center" style={{ color: "#aaa" }}>{t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: "#666" }}>{label}</span>
      <span className="font-semibold" style={{ color: valueColor ?? "var(--foreground)" }}>{value}</span>
    </div>
  );
}
