"use client";
// page.tsx – Kurthī Couture | Premium Ethnic Wear Home Page

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

/* ─── Data ──────────────────────────────────────────────── */


const CATEGORIES = [
  { label: "Casual Wear",  icon: "🌸", bg: "#f5ede3", border: "#c97d4a" },
  { label: "Festive",      icon: "✨", bg: "#f9e9f0", border: "#7b1e3a" },
  { label: "Embroidered",  icon: "🪡", bg: "#fdf3ea", border: "#c97d4a" },
  { label: "Block Print",  icon: "🎨", bg: "#f5ede3", border: "#7b1e3a" },
  { label: "Silk & Satin", icon: "💎", bg: "#f9e9f0", border: "#c97d4a" },
  { label: "Designer",     icon: "👑", bg: "#fdf3ea", border: "#7b1e3a" },
];

type HomeProduct = {
  id: number;
  name: string;
  price: string;
  original: string;
  tag: string;
  imgClass: string;
  rating: number;
  reviews: number;
  outOfStock: boolean;
};

type DetailProduct = HomeProduct & {
  description: string;
  fabric: string;
  category: string;
  deliveryDays: number;
  sizes: string[];
  colorHex: string;
  discount: number;
};

function toHomeProduct(p: {
  id:number; name:string; mrp:number; price:number; tag?:string;
  imgClass:string; rating:number; sold:number; stock:number;
}): HomeProduct {
  const fmt = (n:number) => "\u20b9" + n.toLocaleString("en-IN");
  return {
    id: p.id,
    name: p.name,
    price: fmt(p.price),
    original: p.mrp !== p.price ? fmt(p.mrp) : "",
    tag: p.tag ?? "",
    imgClass: p.imgClass,
    rating: p.rating || 4.5,
    reviews: p.sold || 0,
    outOfStock: p.stock === 0,
  };
}

const FALLBACK_ARRIVALS: HomeProduct[] = [
  { id: 1, name: "Gulabi Anarkali Suit",      price: "\u20b93,499", original: "\u20b94,999", tag: "New",  imgClass: "product-img-1", rating: 4.9, reviews: 284, outOfStock: false },
  { id: 2, name: "Zari Weave Straight Kurta", price: "\u20b92,799", original: "\u20b93,999", tag: "Hot",  imgClass: "product-img-2", rating: 4.8, reviews: 174, outOfStock: false },
  { id: 3, name: "Chikankari Lucknowi Kurta", price: "\u20b92,299", original: "\u20b93,299", tag: "Sale", imgClass: "product-img-3", rating: 4.7, reviews: 432, outOfStock: false },
  { id: 7, name: "Organza Silk Flared Kurta", price: "\u20b95,499", original: "\u20b96,999", tag: "New",  imgClass: "product-img-1", rating: 4.9, reviews: 62,  outOfStock: false },
];

const FEATURED = [
  { id: 1, title: "Festive Edition 2026",  sub: "Step into celebrations with grace",   imgClass: "product-img-2", big: true  },
  { id: 2, title: "Casual Everyday",       sub: "Effortless comfort, timeless style",  imgClass: "product-img-5", big: false },
  { id: 3, title: "Embroidered Luxe",      sub: "Handcrafted artisan masterpieces",    imgClass: "product-img-6", big: false },
];

const TESTIMONIALS = [
  { name: "Priya M.",  location: "Mumbai",    text: "The quality is absolutely stunning. Every stitch feels like it was made with love. My go-to brand for every occasion!", stars: 5 },
  { name: "Ananya K.", location: "Bangalore", text: "I wore the Gulabi Anarkali to my cousin's wedding and received so many compliments. Premium quality at a great price.", stars: 5 },
  { name: "Deepa R.",  location: "Chennai",   text: "Fast shipping, beautiful packaging, and the fabric is so luxurious. Kurthī Couture never disappoints!",                stars: 5 },
];

const FEATURES = [
  { icon: "🚚", title: "Free Shipping",   desc: "On all orders above ₹1,499" },
  { icon: "↩",  title: "Easy Returns",    desc: "Hassle-free 30-day returns"  },
  { icon: "🪡", title: "Premium Fabrics", desc: "Sourced from master weavers"  },
  { icon: "💳", title: "Secure Payments", desc: "100% encrypted checkout"      },
];

/* ─── Component ─────────────────────────────────────────── */

export default function Home() {
  const [email, setEmail]           = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [wishlist, setWishlist]     = useState<number[]>([]);
  const [cartCount, setCartCount]   = useState(0);
  const [homeProducts, setHomeProducts] = useState<HomeProduct[]>(FALLBACK_ARRIVALS);
  const [selectedProduct, setSelectedProduct] = useState<DetailProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState("");  const [sizeError, setSizeError]             = useState(false);
  const [authPrompt, setAuthPrompt]           = useState(false);
  const [searchQuery, setSearchQuery]         = useState("");
  const [activeTag, setActiveTag]             = useState("All");
  useEffect(() => {
    const derive = () => {
      const raw = localStorage.getItem("kurthi_products");
      if (!raw) return FALLBACK_ARRIVALS;
      const all: (Parameters<typeof toHomeProduct>[0] & {showOnHome?: boolean})[] = JSON.parse(raw);
      const approved = all.filter(p => p.showOnHome).map(toHomeProduct);
      return approved.length > 0 ? approved : FALLBACK_ARRIVALS;
    };
    setHomeProducts(derive());
  }, []);

  const toggleWishlist = (id: number) =>
    setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const openProduct = (hp: HomeProduct) => {
    setSelectedSize("");
    try {
      const raw = localStorage.getItem("kurthi_products");
      if (raw) {
        const all: (Parameters<typeof toHomeProduct>[0] & {
          showOnHome?:boolean; description?:string; fabric?:string;
          category?:string; deliveryDays?:number; sizes?:string[];
          colorHex?:string; mrp:number;
        })[] = JSON.parse(raw);
        const full = all.find(p => p.id === hp.id);
        if (full) {
          setSelectedProduct({
            ...hp,
            description: full.description ?? "",
            fabric: full.fabric ?? "",
            category: full.category ?? "",
            deliveryDays: full.deliveryDays ?? 5,
            sizes: full.sizes ?? [],
            colorHex: full.colorHex ?? "#7b1e3a",
            discount: full.mrp > full.price ? Math.round(((full.mrp - full.price) / full.mrp) * 100) : 0,
          });
          return;
        }
      }
    } catch { /* ignore */ }
    setSelectedProduct({ ...hp, description: "", fabric: "", category: "", deliveryDays: 5, sizes: [], colorHex: "#7b1e3a", discount: 0 });
  };

  const closeProduct = () => { setSelectedProduct(null); setSelectedSize(""); };

  const addToCart = (product: DetailProduct, size: string) => {
    /* auth check */
    try { if (!localStorage.getItem("kurthi_user_auth")) { setAuthPrompt(true); return; } } catch {}
    /* size check */
    if (product.sizes && product.sizes.length > 0 && !size) { setSizeError(true); return; }
    setSizeError(false);
    const priceNum    = parseInt(product.price.replace(/[^\d]/g, ""), 10);
    const originalNum = product.original ? parseInt(product.original.replace(/[^\d]/g, ""), 10) : undefined;
    const newItem = {
      id: product.id, name: product.name,
      price: priceNum, original: originalNum,
      imgClass: product.imgClass,
      size: size || "Free Size",
      color: product.colorHex, colorHex: product.colorHex,
      qty: 1, fabric: product.fabric || "",
    };
    try {
      const existing: typeof newItem[] = JSON.parse(localStorage.getItem("kurthi_cart") || "[]");
      const idx = existing.findIndex(i => i.id === newItem.id && i.size === newItem.size);
      if (idx >= 0) existing[idx].qty += 1; else existing.push(newItem);
      localStorage.setItem("kurthi_cart", JSON.stringify(existing));
    } catch {}
    setCartCount(c => c + 1);
  };

  const filteredArrivals = useMemo(() =>
    homeProducts.filter((p) => {
      if (activeTag !== "All" && p.tag !== activeTag) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }),
  [homeProducts, searchQuery, activeTag]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* ── ANNOUNCEMENT BAR ── */}
      <div
        className="text-center text-sm py-2 tracking-widest font-medium"
        style={{ background: "var(--primary)", color: "#fff", fontFamily: "var(--font-jost, sans-serif)" }}
      >
        ✦ FREE SHIPPING ON ORDERS ABOVE ₹1,499&nbsp;&nbsp;|&nbsp;&nbsp;USE CODE{" "}
        <span style={{ color: "var(--accent-light)" }}>KURTHI20</span>{" "}FOR 20% OFF ✦
      </div>

      <Navbar wishlistCount={wishlist.length} cartCount={cartCount} />

      {/* ── HERO ── */}
      <section className="relative flex items-center overflow-hidden" style={{ minHeight: "92vh" }}>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #5c1629 0%, #7b1e3a 35%, #a3264d 55%, #c97d4a 80%, #e8c5a0 100%)" }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 hero-overlay" />
        <div
          className="absolute right-0 bottom-0 opacity-20 animate-float"
          style={{
            width: "500px", height: "500px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,125,74,0.6) 0%, transparent 70%)",
            transform: "translate(30%, 30%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 w-full py-24">
          <div className="max-w-2xl">
            <p className="mb-4 tracking-[0.4em] uppercase text-sm animate-fadeIn" style={{ color: "var(--accent-light)", fontFamily: "var(--font-jost, sans-serif)" }}>
              ✦ New Collection 2026
            </p>
            <h1
              className="font-bold leading-tight mb-6 animate-fadeInUp"
              style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(3rem, 7vw, 6rem)", color: "#fff", lineHeight: 1.05 }}
            >
              Draped in<br />
              <em style={{ fontStyle: "italic", color: "var(--accent-light)" }}>Tradition</em>,<br />
              Crafted for<br />
              <span style={{ color: "var(--cream)" }}>Today.</span>
            </h1>
            <p
              className="mb-10 leading-relaxed animate-fadeInUp delay-200"
              style={{ color: "rgba(255,255,255,0.82)", maxWidth: "480px", fontFamily: "var(--font-jost, sans-serif)", fontSize: "1.1rem" }}
            >
              Discover our exclusive handcrafted Kurthi collection — where centuries-old artisanship meets contemporary silhouettes.
            </p>
            <div className="flex flex-wrap gap-4 animate-fadeInUp delay-300">
              <a
                href="#collections"
                className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold tracking-wider text-sm uppercase"
                style={{ fontFamily: "var(--font-jost, sans-serif)", textDecoration: "none" }}
              >
                Shop the Collection
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a
                href="#arrivals"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold tracking-wider text-sm uppercase transition-all hover:scale-105"
                style={{
                  border: "2px solid rgba(255,255,255,0.6)", color: "#fff",
                  textDecoration: "none", fontFamily: "var(--font-jost, sans-serif)",
                }}
              >
                New Arrivals
              </a>
            </div>
            <div className="flex gap-10 mt-14 animate-fadeInUp delay-400">
              {[["500+", "Designs"], ["50K+", "Customers"], ["4.9★", "Rating"]].map(([num, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold" style={{ color: "#fff", fontFamily: "var(--font-cormorant, serif)" }}>{num}</div>
                  <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-jost, sans-serif)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-jost, sans-serif)" }}>Scroll</span>
          <div className="w-[1px] h-10" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)" }} />
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section style={{ background: "var(--cream)", borderTop: "1px solid var(--cream-dark)", borderBottom: "1px solid var(--cream-dark)" }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-4">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <div className="font-semibold text-sm tracking-wide" style={{ color: "var(--primary)", fontFamily: "var(--font-jost, sans-serif)" }}>{f.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#888", fontFamily: "var(--font-jost, sans-serif)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--accent)", fontFamily: "var(--font-jost, sans-serif)" }}>Browse by Style</p>
          <h2 className="font-bold" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--primary)" }}>
            Shop by Category
          </h2>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.label}
              href="#"
              className="card-lift flex flex-col items-center gap-3 rounded-2xl py-6 px-3 text-center group"
              style={{ background: cat.bg, border: `1.5px solid ${cat.border}30`, textDecoration: "none" }}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--primary)", fontFamily: "var(--font-jost, sans-serif)" }}>{cat.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section id="arrivals" className="py-20" style={{ background: "var(--cream)" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Header row */}
          <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <div>
              <p className="text-xs tracking-[0.4em] uppercase mb-2" style={{ color: "var(--accent)", fontFamily: "var(--font-jost, sans-serif)" }}>Just Landed</p>
              <h2 className="font-bold" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--primary)" }}>
                New Arrivals
              </h2>
            </div>
            <a
              href="/products"
              className="text-sm font-semibold tracking-widest uppercase flex items-center gap-2 group"
              style={{ color: "var(--primary)", textDecoration: "none", fontFamily: "var(--font-jost, sans-serif)" }}
            >
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          {/* ── SEARCH + TAG FILTER ROW ── */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center">
            {/* Search input */}
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search new arrivals…"
                className="w-full pl-10 pr-4 py-3 rounded-full text-sm outline-none"
                style={{
                  border: "1.5px solid var(--cream-dark)", background: "#fff",
                  fontFamily: "var(--font-jost, sans-serif)", color: "var(--foreground)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(123,30,58,0.1)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--cream-dark)"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", lineHeight: 1 }}
                >✕</button>
              )}
            </div>

            {/* Tag filter pills */}
            <div className="flex gap-2 flex-wrap">
              {["All", "New", "Hot", "Sale"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className="px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-150"
                  style={{
                    background: activeTag === tag ? "var(--primary)" : "#fff",
                    color: activeTag === tag ? "#fff" : "var(--foreground)",
                    border: activeTag === tag ? "1.5px solid var(--primary)" : "1.5px solid var(--cream-dark)",
                    cursor: "pointer",
                  }}
                >{tag}</button>
              ))}
            </div>

            {/* Result count */}
            {(searchQuery || activeTag !== "All") && (
              <span className="text-xs whitespace-nowrap" style={{ color: "#999", fontFamily: "var(--font-jost, sans-serif)" }}>
                {filteredArrivals.length} result{filteredArrivals.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {filteredArrivals.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">🔍</span>
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)" }}>No products found</h3>
              <p className="text-sm mb-5" style={{ color: "#888", fontFamily: "var(--font-jost, sans-serif)" }}>Try a different search or clear the filters.</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveTag("All"); }}
                className="btn-primary px-7 py-3 rounded-full text-sm font-semibold tracking-wider uppercase"
                style={{ cursor: "pointer" }}
              >Clear Filters</button>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArrivals.map((product) => (
              <div
                key={product.id}
                className="card-lift rounded-2xl overflow-hidden group"
                style={{ background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", cursor: "pointer" }}
                onClick={() => openProduct(product)}
              >
                <div className={`relative ${product.imgClass} overflow-hidden`} style={{ height: "340px" }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl opacity-20 animate-float">🥻</span>
                  </div>
                  {product.tag && (
                  <span
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
                    style={{
                      background: product.tag === "Sale" ? "#dc2626" : product.tag === "Hot" ? "var(--accent)" : "var(--primary)",
                      color: "#fff", fontFamily: "var(--font-jost, sans-serif)",
                    }}
                  >
                    {product.tag}
                  </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer" }}
                    aria-label="Wishlist"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist.includes(product.id) ? "var(--primary)" : "none"} stroke="var(--primary)" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  {product.outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" style={{ background: "rgba(0,0,0,0.28)" }}>
                      <span className="px-4 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase" style={{ background: "rgba(0,0,0,0.72)", color: "#fff", fontFamily: "var(--font-jost, sans-serif)" }}>Out of Stock</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
                    {product.outOfStock ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider uppercase"
                        style={{ background: "rgba(30,30,30,0.8)", color: "rgba(255,255,255,0.55)", cursor: "not-allowed", fontFamily: "var(--font-jost, sans-serif)" }}
                      >
                        Out of Stock
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); if (product.outOfStock) return; const dp: DetailProduct = { ...product, description:"", fabric:"", category:"", deliveryDays:0, sizes:[], colorHex:"#7b1e3a", discount:0 }; addToCart(dp, ""); }}
                        className="btn-primary w-full py-3 rounded-xl text-sm font-semibold tracking-wider uppercase"
                        style={{ fontFamily: "var(--font-jost, sans-serif)", cursor: "pointer" }}
                      >
                        Quick Add to Cart
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate mb-1" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.1rem", color: "var(--foreground)" }}>
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i < Math.floor(product.rating) ? "var(--accent)" : "#ddd"} stroke="none">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                      </svg>
                    ))}
                    <span className="text-xs ml-1" style={{ color: "#999", fontFamily: "var(--font-jost, sans-serif)" }}>({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg" style={{ color: "var(--primary)", fontFamily: "var(--font-jost, sans-serif)" }}>{product.price}</span>
                    {product.original && (
                      <span className="text-sm line-through" style={{ color: "#bbb", fontFamily: "var(--font-jost, sans-serif)" }}>{product.original}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* ── FEATURED COLLECTIONS ── */}
      <section id="collections" className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--accent)", fontFamily: "var(--font-jost, sans-serif)" }}>Handpicked for You</p>
          <h2 className="font-bold" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--primary)" }}>
            Featured Collections
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURED.map((item, idx) => (
            <div
              key={item.id}
              className={`card-lift relative rounded-2xl overflow-hidden group cursor-pointer ${idx === 0 ? "md:col-span-2" : ""}`}
              style={{ minHeight: idx === 0 ? "520px" : "280px" }}
            >
              <div className={`absolute inset-0 ${item.imgClass}`} />
              <div className="absolute inset-0 flex items-center justify-center opacity-15">
                <span style={{ fontSize: "8rem" }}>🥻</span>
              </div>
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{ background: "linear-gradient(to top, rgba(92,22,41,0.88) 0%, rgba(92,22,41,0.2) 60%, transparent 100%)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "var(--accent-light)", fontFamily: "var(--font-jost, sans-serif)", opacity: 0.85 }}>Collection</p>
                <h3 className="font-bold mb-2" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: idx === 0 ? "2rem" : "1.4rem", color: "#fff" }}>
                  {item.title}
                </h3>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-jost, sans-serif)" }}>{item.sub}</p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase border-b pb-0.5 group-hover:gap-4 transition-all"
                  style={{ color: "var(--accent-light)", borderColor: "var(--accent-light)", textDecoration: "none", fontFamily: "var(--font-jost, sans-serif)" }}
                >
                  Explore
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BRAND STORY BANNER ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "var(--primary)" }}>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-4xl mx-auto px-8 text-center relative">
          <span className="text-5xl mb-6 block animate-float">🪡</span>
          <p className="text-xs tracking-[0.5em] uppercase mb-4" style={{ color: "var(--accent-light)", fontFamily: "var(--font-jost, sans-serif)" }}>Our Story</p>
          <h2 className="font-bold mb-6 leading-tight" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: "#fff" }}>
            Weaving Heritage into<br />
            <em style={{ color: "var(--accent-light)" }}>Every Thread</em>
          </h2>
          <p className="leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-jost, sans-serif)", fontSize: "1.05rem" }}>
            Born from a passion for India&apos;s rich textile traditions, Kurthī Couture partners with master artisans across Rajasthan, Lucknow, and Gujarat to bring you garments that tell a story — crafted with integrity, worn with pride.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold tracking-wider text-sm uppercase transition-all hover:scale-105"
              style={{ background: "var(--accent)", color: "#fff", textDecoration: "none", fontFamily: "var(--font-jost, sans-serif)" }}
            >
              Our Story
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold tracking-wider text-sm uppercase transition-all hover:scale-105"
              style={{ border: "2px solid rgba(255,255,255,0.5)", color: "#fff", textDecoration: "none", fontFamily: "var(--font-jost, sans-serif)" }}
            >
              Meet Our Artisans
            </a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20" style={{ background: "var(--cream)" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--accent)", fontFamily: "var(--font-jost, sans-serif)" }}>Love from Our Community</p>
            <h2 className="font-bold" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--primary)" }}>
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="card-lift rounded-2xl p-8"
                style={{ background: "#fff", boxShadow: "0 4px 24px rgba(123,30,58,0.07)" }}
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                </div>
                <p className="leading-relaxed mb-6" style={{ color: "#555", fontFamily: "var(--font-jost, sans-serif)", fontSize: "0.95rem", fontStyle: "italic" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: "var(--primary)", color: "#fff", fontFamily: "var(--font-jost, sans-serif)" }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "var(--foreground)", fontFamily: "var(--font-jost, sans-serif)" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "#999", fontFamily: "var(--font-jost, sans-serif)" }}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM STRIP ── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--accent)", fontFamily: "var(--font-jost, sans-serif)" }}>@KurthiCouture</p>
          <h2 className="font-bold" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--primary)" }}>
            Style Inspiration
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {["product-img-1","product-img-2","product-img-3","product-img-4","product-img-5","product-img-6"].map((cls, i) => (
            <div
              key={i}
              className="card-lift rounded-xl overflow-hidden group cursor-pointer relative"
              style={{ aspectRatio: "1", minHeight: "100px" }}
            >
              <div className={`absolute inset-0 ${cls}`} />
              <div className="absolute inset-0 flex items-center justify-center opacity-15">
                <span style={{ fontSize: "3rem" }}>🥻</span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <svg
                  width="24" height="24" viewBox="0 0 24 24"
                  fill="none" stroke="white" strokeWidth="2"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase"
            style={{ color: "var(--primary)", textDecoration: "none", fontFamily: "var(--font-jost, sans-serif)" }}
          >
            Follow on Instagram
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--cream) 0%, var(--cream-dark) 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237b1e3a' fill-opacity='0.07'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-2xl mx-auto px-8 text-center relative">
          <span className="text-4xl mb-4 block">💌</span>
          <p className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--accent)", fontFamily: "var(--font-jost, sans-serif)" }}>Stay Connected</p>
          <h2 className="font-bold mb-4" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--primary)" }}>
            Join the Kurthī Circle
          </h2>
          <p className="mb-8" style={{ color: "#666", fontFamily: "var(--font-jost, sans-serif)" }}>
            Get exclusive access to new launches, style guides, and member-only offers — straight to your inbox.
          </p>
          {subscribed ? (
            <div
              className="py-4 px-8 rounded-full inline-flex items-center gap-3 font-semibold"
              style={{ background: "var(--primary)", color: "#fff", fontFamily: "var(--font-jost, sans-serif)" }}
            >
              <span>✓</span> Thank you for joining! Welcome to the circle.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-5 py-4 rounded-full text-sm outline-none"
                style={{
                  border: "2px solid var(--cream-dark)", background: "#fff",
                  fontFamily: "var(--font-jost, sans-serif)", color: "var(--foreground)", transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--cream-dark)")}
              />
              <button
                type="submit"
                className="btn-primary px-6 py-4 rounded-full font-semibold tracking-wider text-sm uppercase whitespace-nowrap"
                style={{ fontFamily: "var(--font-jost, sans-serif)", cursor: "pointer" }}
              >
                Subscribe
              </button>
            </form>
          )}
          <p className="mt-4 text-xs" style={{ color: "#aaa", fontFamily: "var(--font-jost, sans-serif)" }}>
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </section>

      <Footer />

      {/* ── AUTH PROMPT MODAL ── */}
      {authPrompt && (
        <div style={{ position:"fixed",inset:0,zIndex:4000,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px" }} onClick={()=>setAuthPrompt(false)}>
          <div style={{ background:"#fff",borderRadius:"28px",maxWidth:"400px",width:"100%",padding:"40px 36px",textAlign:"center",boxShadow:"0 32px 100px rgba(0,0,0,0.3)",position:"relative" }} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setAuthPrompt(false)} style={{ position:"absolute",top:"14px",right:"14px",background:"none",border:"none",cursor:"pointer",fontSize:"1.2rem",color:"#aaa" }}>✕</button>
            <div style={{ fontSize:"3rem",marginBottom:"16px" }}>🛍️</div>
            <h3 style={{ fontFamily:"var(--font-cormorant,serif)",fontSize:"1.7rem",fontWeight:700,color:"var(--primary)",marginBottom:"8px" }}>Sign in to continue</h3>
            <p style={{ fontSize:"0.88rem",color:"#888",marginBottom:"28px",lineHeight:1.6 }}>Please log in or create an account to add items to your cart.</p>
            <div style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
              <a href="/login" style={{ display:"block",padding:"14px",borderRadius:"14px",background:"var(--primary)",color:"#fff",textDecoration:"none",fontWeight:700,fontSize:"0.85rem",letterSpacing:"0.1em",textTransform:"uppercase" }}>Sign In</a>
              <a href="/signup" style={{ display:"block",padding:"14px",borderRadius:"14px",border:"1.5px solid var(--primary)",color:"var(--primary)",textDecoration:"none",fontWeight:700,fontSize:"0.85rem",letterSpacing:"0.1em",textTransform:"uppercase" }}>Create Account</a>
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT DETAIL MODAL ── */}
      {selectedProduct && (
        <div
          style={{ position:"fixed",inset:0,zIndex:3000,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",overflowY:"auto" }}
          onClick={closeProduct}
        >
          <div
            style={{ background:"#fff",borderRadius:"28px",maxWidth:"900px",width:"100%",boxShadow:"0 32px 100px rgba(0,0,0,0.35)",overflow:"hidden",position:"relative",fontFamily:"var(--font-jost,sans-serif)" }}
            onClick={e=>e.stopPropagation()}
          >
            {/* close */}
            <button
              onClick={closeProduct}
              style={{ position:"absolute",top:"16px",right:"16px",zIndex:10,width:"38px",height:"38px",borderRadius:"50%",background:"rgba(0,0,0,0.08)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",color:"#555" }}
            >✕</button>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr" }} className="product-modal-grid">
              {/* Image panel */}
              <div className={`${selectedProduct.imgClass} relative`} style={{ minHeight:"480px",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <span style={{ fontSize:"10rem",opacity:0.18 }}>🥻</span>
                {selectedProduct.tag && (
                  <span style={{ position:"absolute",top:"18px",left:"18px",background:selectedProduct.tag==="Sale"?"#dc2626":selectedProduct.tag==="Hot"?"var(--accent)":"var(--primary)",color:"#fff",padding:"5px 14px",borderRadius:"999px",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>
                    {selectedProduct.tag}
                  </span>
                )}
                {selectedProduct.outOfStock && (
                  <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <span style={{ background:"rgba(0,0,0,0.75)",color:"#fff",padding:"8px 20px",borderRadius:"999px",fontSize:"0.75rem",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase" }}>Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div style={{ padding:"40px 36px",display:"flex",flexDirection:"column",gap:"20px",overflowY:"auto",maxHeight:"520px" }}>

                {/* Category & fabric badges */}
                <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
                  {selectedProduct.category && <span style={{ background:"var(--cream)",color:"var(--accent)",padding:"4px 12px",borderRadius:"999px",fontSize:"0.7rem",fontWeight:600,letterSpacing:"0.06em" }}>{selectedProduct.category}</span>}
                  {selectedProduct.fabric    && <span style={{ background:"#f0f0f0",color:"#666",padding:"4px 12px",borderRadius:"999px",fontSize:"0.7rem",fontWeight:600 }}>{selectedProduct.fabric}</span>}
                </div>

                {/* Name */}
                <div>
                  <h2 style={{ fontFamily:"var(--font-cormorant,serif)",fontSize:"clamp(1.5rem,3vw,2rem)",fontWeight:700,color:"var(--primary)",lineHeight:1.2,margin:0 }}>{selectedProduct.name}</h2>
                </div>

                {/* Rating */}
                <div style={{ display:"flex",alignItems:"center",gap:"6px" }}>
                  {Array.from({length:5}).map((_,i)=>(
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i<Math.floor(selectedProduct.rating)?"var(--accent)":"#e0e0e0"} stroke="none">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                  <span style={{ fontSize:"0.82rem",color:"var(--accent)",fontWeight:700 }}>{selectedProduct.rating}</span>
                  <span style={{ fontSize:"0.78rem",color:"#aaa" }}>({selectedProduct.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div style={{ display:"flex",alignItems:"baseline",gap:"12px",flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"var(--font-cormorant,serif)",fontSize:"2rem",fontWeight:700,color:"var(--primary)" }}>{selectedProduct.price}</span>
                  {selectedProduct.original && <>
                    <span style={{ fontSize:"1rem",color:"#bbb",textDecoration:"line-through" }}>{selectedProduct.original}</span>
                    {selectedProduct.discount>0 && <span style={{ background:"#fef2f2",color:"#dc2626",padding:"3px 10px",borderRadius:"999px",fontSize:"0.75rem",fontWeight:700 }}>{selectedProduct.discount}% OFF</span>}
                  </>}
                </div>

                <div style={{ height:"1px",background:"var(--cream-dark)" }}/>

                {/* Sizes */}
                {selectedProduct.sizes.length>0 && (
                  <div>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px" }}>
                      <span style={{ fontSize:"0.78rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color: sizeError?"#dc2626":"#888" }}>Select Size {sizeError && "← please choose a size"}</span>
                      {selectedSize && <span style={{ fontSize:"0.78rem",color:"var(--accent)",fontWeight:600 }}>Selected: {selectedSize}</span>}
                    </div>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:"8px",outline: sizeError?"2px solid #fca5a5":"none",borderRadius:"12px",padding: sizeError?"8px":"0" }}>
                      {selectedProduct.sizes.map(s=>(
                        <button
                          key={s}
                          type="button"
                          onClick={()=>{ setSelectedSize(s); setSizeError(false); }}
                          style={{ padding:"7px 14px",borderRadius:"10px",fontSize:"0.82rem",fontWeight:600,cursor:"pointer",border:`1.5px solid ${selectedSize===s?"var(--primary)":"var(--cream-dark)"}`,background:selectedSize===s?"var(--primary)":"#fff",color:selectedSize===s?"#fff":"var(--foreground)",transition:"all 0.15s",minWidth:"42px",textAlign:"center" }}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery */}
                {selectedProduct.deliveryDays>0 && (
                  <div style={{ display:"flex",alignItems:"center",gap:"8px",background:"#f0fdf4",borderRadius:"12px",padding:"10px 14px" }}>
                    <span style={{ fontSize:"1.1rem" }}>🚚</span>
                    <span style={{ fontSize:"0.82rem",color:"#15803d",fontWeight:600 }}>Delivery in {selectedProduct.deliveryDays} days</span>
                  </div>
                )}

                {/* Description */}
                {selectedProduct.description && (
                  <div>
                    <p style={{ fontSize:"0.78rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"#aaa",marginBottom:"6px" }}>About this product</p>
                    <p style={{ fontSize:"0.88rem",color:"#555",lineHeight:1.75,margin:0 }}>{selectedProduct.description}</p>
                  </div>
                )}

                <div style={{ height:"1px",background:"var(--cream-dark)" }}/>

                {/* Actions */}
                <div style={{ display:"flex",gap:"12px",flexWrap:"wrap" }}>
                  {selectedProduct.outOfStock ? (
                    <button disabled style={{ flex:1,padding:"14px",borderRadius:"14px",background:"#e0e0e0",color:"#aaa",border:"none",fontSize:"0.85rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"not-allowed" }}>Out of Stock</button>
                  ) : (
                    <button
                      onClick={()=>{ addToCart(selectedProduct, selectedSize); }}
                      style={{ flex:1,padding:"14px",borderRadius:"14px",background:"var(--primary)",color:"#fff",border:"none",fontSize:"0.85rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer" }}
                    >Add to Cart</button>
                  )}
                  <button
                    onClick={()=>toggleWishlist(selectedProduct.id)}
                    style={{ width:"50px",height:"50px",borderRadius:"14px",border:"1.5px solid var(--cream-dark)",background:wishlist.includes(selectedProduct.id)?"#fff0f5":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlist.includes(selectedProduct.id)?"var(--primary)":"none"} stroke="var(--primary)" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>

                {/* Trust row */}
                <div style={{ display:"flex",gap:"12px",flexWrap:"wrap" }}>
                  {[["↩","30-day returns"],["🔒","Secure checkout"],["💎","Authentic product"]].map(([icon,label])=>(
                    <div key={label} style={{ display:"flex",alignItems:"center",gap:"5px" }}>
                      <span style={{ fontSize:"0.9rem" }}>{icon}</span>
                      <span style={{ fontSize:"0.72rem",color:"#888",fontWeight:500 }}>{label}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .product-modal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
