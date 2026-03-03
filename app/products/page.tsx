"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

/* ─────────────────────────── TYPES ──────────────────────────────── */

type Product = {
  id: number;
  name: string;
  price: number;
  original?: number;
  tag?: string;
  imgClass: string;
  rating: number;
  reviews: number;
  category: string;
  sizes: string[];
  fabric: string;
  occasion: string;
  color: string;
  colorHex: string;
  isNew: boolean;
  isBestseller: boolean;
  outOfStock?: boolean;
};

/* ─────────────────────────── DATA ───────────────────────────────── */

const ALL_PRODUCTS: Product[] = [
  { id: 1,  name: "Gulabi Anarkali Suit",        price: 3499, original: 4999, tag: "New",       imgClass: "product-img-1", rating: 4.9, reviews: 284, category: "Festive",      sizes: ["S","M","L","XL"],        fabric: "Georgette",  occasion: "Party",       color: "Rose",        colorHex: "#e89ca0", isNew: true,  isBestseller: true  },
  { id: 2,  name: "Zari Weave Straight Kurta",   price: 2799, original: 3999, tag: "Hot",       imgClass: "product-img-2", rating: 4.8, reviews: 174, category: "Designer",     sizes: ["XS","S","M","L","XL"],   fabric: "Silk",       occasion: "Wedding",     color: "Burgundy",    colorHex: "#7b1e3a", isNew: true,  isBestseller: true  },
  { id: 3,  name: "Chikankari Lucknowi Kurta",   price: 2299, original: 3299, tag: "Sale",      imgClass: "product-img-3", rating: 4.7, reviews: 432, category: "Casual Wear",  sizes: ["S","M","L","XL","XXL"],  fabric: "Cotton",     occasion: "Daily Wear",  color: "Ivory",       colorHex: "#f5ede3", isNew: false, isBestseller: true  },
  { id: 4,  name: "Royal Bandhani Kurta Set",    price: 4199, original: undefined, tag: "New",  imgClass: "product-img-4", rating: 4.9, reviews: 98,  category: "Festive",      sizes: ["M","L","XL","XXL"],      fabric: "Chanderi",   occasion: "Festive",     color: "Gold",        colorHex: "#c97d4a", isNew: true,  isBestseller: false },
  { id: 5,  name: "Cotton Dabu Block Print",     price: 1899, original: 2499, tag: "Sale",      imgClass: "product-img-5", rating: 4.6, reviews: 317, category: "Block Print",  sizes: ["XS","S","M","L"],        fabric: "Cotton",     occasion: "Daily Wear",  color: "Indigo",      colorHex: "#4a5fa3", isNew: false, isBestseller: false },
  { id: 6,  name: "Kantha Stitch Long Kurta",    price: 3199, original: undefined, tag: undefined, imgClass: "product-img-6", rating: 4.7, reviews: 156, category: "Embroidered", sizes: ["S","M","L","XL"],      fabric: "Mul Cotton", occasion: "Party",       color: "Teal",        colorHex: "#2a8c7c", isNew: false, isBestseller: true  },
  { id: 7,  name: "Organza Silk Flared Kurta",   price: 5499, original: 6999, tag: "New",       imgClass: "product-img-1", rating: 4.9, reviews: 62,  category: "Designer",     sizes: ["XS","S","M","L","XL"],   fabric: "Silk",       occasion: "Wedding",     color: "Champagne",   colorHex: "#e8d5b0", isNew: true,  isBestseller: false, outOfStock: true },
  { id: 8,  name: "Tie-Dye Shibori Tunic",       price: 1599, original: 2199, tag: "Sale",      imgClass: "product-img-2", rating: 4.5, reviews: 203, category: "Casual Wear",  sizes: ["S","M","L","XL","XXL"],  fabric: "Rayon",      occasion: "Daily Wear",  color: "Blue",        colorHex: "#5580c8", isNew: false, isBestseller: false },
  { id: 9,  name: "Phulkari Embroidered Suit",   price: 4899, original: 5999, tag: "New",       imgClass: "product-img-3", rating: 4.8, reviews: 87,  category: "Embroidered",  sizes: ["M","L","XL","XXL"],      fabric: "Georgette",  occasion: "Festive",     color: "Mustard",     colorHex: "#d4a32a", isNew: true,  isBestseller: false },
  { id: 10, name: "Ajrakh Block Print A-Line",   price: 2499, original: 3299, tag: undefined,   imgClass: "product-img-4", rating: 4.6, reviews: 134, category: "Block Print",  sizes: ["XS","S","M","L"],        fabric: "Cotton",     occasion: "Office",      color: "Rust",        colorHex: "#c0552d", isNew: false, isBestseller: false },
  { id: 11, name: "Kashmiri Crewel Kurta",       price: 6299, original: 7999, tag: "Luxe",      imgClass: "product-img-5", rating: 5.0, reviews: 41,  category: "Designer",     sizes: ["S","M","L","XL"],        fabric: "Wool Blend", occasion: "Wedding",     color: "Walnut",      colorHex: "#5c3525", isNew: true,  isBestseller: true  },
  { id: 12, name: "Chanderi Anarkali Floor",     price: 5199, original: undefined, tag: "New",  imgClass: "product-img-6", rating: 4.8, reviews: 73,  category: "Festive",      sizes: ["XS","S","M","L","XL"],   fabric: "Chanderi",   occasion: "Party",       color: "Peach",       colorHex: "#e8a97a", isNew: true,  isBestseller: false },
  { id: 13, name: "Linen Straight Everyday",     price: 1299, original: 1799, tag: "Sale",      imgClass: "product-img-1", rating: 4.4, reviews: 521, category: "Casual Wear",  sizes: ["S","M","L","XL","XXL","3XL"], fabric: "Linen",  occasion: "Daily Wear",  color: "Off-White",   colorHex: "#ede8e0", isNew: false, isBestseller: true  },
  { id: 14, name: "Ikat Silk Festive Kurta",     price: 3799, original: 4999, tag: undefined,   imgClass: "product-img-2", rating: 4.7, reviews: 119, category: "Silk & Satin", sizes: ["XS","S","M","L"],        fabric: "Silk",       occasion: "Festive",     color: "Teal",        colorHex: "#2a8c7c", isNew: false, isBestseller: false },
  { id: 15, name: "Floral Georgette Straight",   price: 2099, original: 2799, tag: "Hot",       imgClass: "product-img-3", rating: 4.6, reviews: 267, category: "Casual Wear",  sizes: ["S","M","L","XL","XXL"],  fabric: "Georgette",  occasion: "Office",      color: "Lavender",    colorHex: "#9b7ec8", isNew: false, isBestseller: false },
  { id: 16, name: "Heavy Bridal Patiala Set",    price: 7499, original: 9999, tag: "Luxe",      imgClass: "product-img-4", rating: 4.9, reviews: 34,  category: "Designer",     sizes: ["S","M","L","XL"],        fabric: "Silk",       occasion: "Wedding",     color: "Maroon",      colorHex: "#8b1a2a", isNew: true,  isBestseller: true,  outOfStock: true  },
];

const CATEGORIES  = ["All", "Casual Wear", "Festive", "Embroidered", "Block Print", "Silk & Satin", "Designer"];
const SIZES       = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const FABRICS     = ["All", "Cotton", "Silk", "Georgette", "Chiffon", "Rayon", "Chanderi", "Mul Cotton", "Linen", "Wool Blend"];
const OCCASIONS   = ["All", "Daily Wear", "Party", "Wedding", "Festive", "Office"];
const SORT_OPTIONS = [
  { label: "Most Popular",          value: "popular"       },
  { label: "New Arrivals",          value: "newest"        },
  { label: "Price: Low to High",    value: "price_asc"     },
  { label: "Price: High to Low",    value: "price_desc"    },
  { label: "Top Rated",             value: "rating"        },
  { label: "Biggest Discount",      value: "discount"      },
];


/* ─────────────────────────── HELPERS ────────────────────────────── */

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i < Math.floor(rating) ? "var(--accent)" : "#ddd"} stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span className="text-xs ml-1" style={{ color: "#999", fontFamily: "var(--font-jost, sans-serif)" }}>({count})</span>
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    Sale: { bg: "#dc2626", color: "#fff" },
    Hot:  { bg: "var(--accent)", color: "#fff" },
    New:  { bg: "var(--primary)", color: "#fff" },
    Luxe: { bg: "#1a1a1a", color: "var(--accent-light)" },
  };
  const style = colors[tag] ?? { bg: "#888", color: "#fff" };
  return (
    <span
      className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
      style={{ background: style.bg, color: style.color, fontFamily: "var(--font-jost, sans-serif)" }}
    >
      {tag}
    </span>
  );
}

/* ─────────────────────────── FILTER PANEL ─────────────────────────── */

type FilterPanelProps = {
  filterCount: number;
  clearAll: () => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  activeCategory: string;
  setActiveCategory: (v: string) => void;
  activeSizes: string[];
  toggleSize: (s: string) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  activeFabric: string;
  setActiveFabric: (v: string) => void;
  activeOccasion: string;
  setActiveOccasion: (v: string) => void;
};

function FilterPanel({
  filterCount, clearAll, searchQuery, setSearchQuery,
  activeCategory, setActiveCategory, activeSizes, toggleSize,
  priceRange, setPriceRange, activeFabric, setActiveFabric,
  activeOccasion, setActiveOccasion,
}: FilterPanelProps) {
  return (
    <div style={{ fontFamily: "var(--font-jost, sans-serif)" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-bold text-base tracking-wide" style={{ color: "var(--primary)" }}>
          Filters {filterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: "var(--primary)", color: "#fff" }}>
              {filterCount}
            </span>
          )}
        </span>
        {filterCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-semibold tracking-wide underline"
            style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products…"
          className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none"
          style={{
            border: "1.5px solid var(--cream-dark)", background: "#fff",
            fontFamily: "var(--font-jost, sans-serif)", fontSize: "0.85rem", color: "var(--foreground)",
          }}
          onFocus={(e)  => (e.currentTarget.style.borderColor = "var(--primary)")}
          onBlur={(e)   => (e.currentTarget.style.borderColor = "var(--cream-dark)")}
        />
        <svg className="absolute right-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left"
              style={{
                background: activeCategory === cat ? "var(--primary)" : "transparent",
                color: activeCategory === cat ? "#fff" : "var(--foreground)",
                border: "none", cursor: "pointer",
              }}
            >
              <span>{cat}</span>
              <span className="text-xs opacity-60">
                {cat === "All" ? ALL_PRODUCTS.length : ALL_PRODUCTS.filter((p) => p.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      <Divider />

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className="w-12 h-10 rounded-lg text-sm font-semibold transition-all duration-150"
              style={{
                background: activeSizes.includes(s) ? "var(--primary)" : "#fff",
                color: activeSizes.includes(s) ? "#fff" : "var(--foreground)",
                border: activeSizes.includes(s) ? "1.5px solid var(--primary)" : "1.5px solid var(--cream-dark)",
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "#bbb" }}>
          <a href="#" style={{ color: "var(--accent)", textDecoration: "underline" }}>View size guide →</a>
        </p>
      </FilterSection>

      <Divider />

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex justify-between text-xs mb-2" style={{ color: "var(--primary)", fontWeight: 600 }}>
          <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
          <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
        </div>
        <input
          type="range" min={0} max={10000} step={100}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${priceRange[1] / 100}%, var(--cream-dark) ${priceRange[1] / 100}%, var(--cream-dark) 100%)`,
            accentColor: "var(--primary)",
          }}
        />
        <div className="flex gap-2 mt-3">
          {[[0,1999,"Under ₹2K"],[2000,3999,"₹2K–4K"],[4000,7999,"₹4K–8K"],[8000,10000,"₹8K+"]].map(([min, max, label]) => (
            <button
              key={String(label)}
              onClick={() => setPriceRange([Number(min), Number(max)])}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: priceRange[0] === min && priceRange[1] === max ? "var(--primary)" : "var(--cream)",
                color: priceRange[0] === min && priceRange[1] === max ? "#fff" : "var(--foreground)",
                border: "none", cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      <Divider />

      {/* Fabric */}
      <FilterSection title="Fabric">
        <div className="flex flex-col gap-1.5">
          {FABRICS.map((f) => (
            <label key={f} className="flex items-center gap-3 cursor-pointer group">
              <span
                className="w-4 h-4 rounded flex items-center justify-center transition-all"
                style={{
                  border: activeFabric === f ? "none" : "1.5px solid var(--cream-dark)",
                  background: activeFabric === f ? "var(--primary)" : "#fff",
                  minWidth: "16px",
                }}
                onClick={() => setActiveFabric(f)}
              >
                {activeFabric === f && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M1 6l4 4 6-7"/>
                  </svg>
                )}
              </span>
              <span
                className="text-sm transition-colors"
                style={{ color: activeFabric === f ? "var(--primary)" : "var(--foreground)", fontWeight: activeFabric === f ? 600 : 400 }}
                onClick={() => setActiveFabric(f)}
              >
                {f}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Divider />

      {/* Occasion */}
      <FilterSection title="Occasion">
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              onClick={() => setActiveOccasion(o)}
              className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-150"
              style={{
                background: activeOccasion === o ? "var(--primary)" : "var(--cream)",
                color: activeOccasion === o ? "#fff" : "var(--foreground)",
                border: "none", cursor: "pointer",
              }}
            >
              {o}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

/* ─────────────────────────── COMPONENT ──────────────────────────── */

export default function ProductsPage() {
  /* — Filter state — */
  const [activeCategory, setActiveCategory]  = useState("All");
  const [activeSizes, setActiveSizes]         = useState<string[]>([]);
  const [activeFabric, setActiveFabric]       = useState("All");
  const [activeOccasion, setActiveOccasion]   = useState("All");
  const [priceRange, setPriceRange]           = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy]                   = useState("popular");
  const [gridCols, setGridCols]               = useState<3 | 4>(3);
  const [searchQuery, setSearchQuery]         = useState("");
  const [filterOpen, setFilterOpen]           = useState(false);     // mobile
  const [wishlist, setWishlist]               = useState<number[]>([]);
  const [cartCount, setCartCount]             = useState(0);
  const [hoveredId, setHoveredId]             = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize]       = useState("");
  const [sizeError, setSizeError]             = useState(false);
  const [authPrompt, setAuthPrompt]           = useState(false);

  const openProduct  = (p: Product) => { setSelectedSize(""); setSelectedProduct(p); };
  const closeProduct = ()           => { setSelectedProduct(null); setSelectedSize(""); };

  const addToCart = (product: Product, size: string) => {
    /* auth check */
    try { if (!localStorage.getItem("kurthi_user_auth")) { setAuthPrompt(true); return; } } catch {}
    /* size check */
    if (product.sizes && product.sizes.length > 0 && !size) { setSizeError(true); return; }
    setSizeError(false);
    const newItem = {
      id: product.id, name: product.name,
      price: product.price, original: product.original,
      imgClass: product.imgClass,
      size: size || (product.sizes[0] ?? "Free Size"),
      color: product.color, colorHex: product.colorHex,
      qty: 1, fabric: product.fabric,
    };
    try {
      const existing: typeof newItem[] = JSON.parse(localStorage.getItem("kurthi_cart") || "[]");
      const idx = existing.findIndex(i => i.id === newItem.id && i.size === newItem.size);
      if (idx >= 0) existing[idx].qty += 1; else existing.push(newItem);
      localStorage.setItem("kurthi_cart", JSON.stringify(existing));
    } catch {}
    setCartCount(c => c + 1);
  };

  const toggleSize = (s: string) =>
    setActiveSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const toggleWishlist = (id: number) =>
    setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  /* — Filtered & sorted products — */
  const filtered = useMemo(() => {
    let list = ALL_PRODUCTS.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (activeSizes.length > 0 && !activeSizes.some((s) => p.sizes.includes(s))) return false;
      if (activeFabric !== "All" && p.fabric !== activeFabric) return false;
      if (activeOccasion !== "All" && p.occasion !== activeOccasion) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
    switch (sortBy) {
      case "newest":    list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case "price_asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price_desc":list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating":    list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "discount":  list = [...list].sort((a, b) => {
        const da = a.original ? a.original - a.price : 0;
        const db = b.original ? b.original - b.price : 0;
        return db - da;
      }); break;
      default: list = [...list].sort((a, b) => b.reviews - a.reviews);
    }
    return list;
  }, [activeCategory, activeSizes, activeFabric, activeOccasion, priceRange, sortBy, searchQuery]);

  /* — Active filter count — */
  const filterCount =
    (activeCategory !== "All" ? 1 : 0) +
    activeSizes.length +
    (activeFabric !== "All" ? 1 : 0) +
    (activeOccasion !== "All" ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  const clearAll = () => {
    setActiveCategory("All");
    setActiveSizes([]);
    setActiveFabric("All");
    setActiveOccasion("All");
    setPriceRange([0, 10000]);
    setSearchQuery("");
  };

  /* ─── Collect filter props ─── */
  const filterPanelProps: FilterPanelProps = {
    filterCount, clearAll, searchQuery, setSearchQuery,
    activeCategory, setActiveCategory, activeSizes, toggleSize,
    priceRange, setPriceRange, activeFabric, setActiveFabric,
    activeOccasion, setActiveOccasion,
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", fontFamily: "var(--font-jost, sans-serif)" }}>

      {/* ── ANNOUNCEMENT BAR ── */}
      <div
        className="text-center text-sm py-2 tracking-widest font-medium"
        style={{ background: "var(--primary)", color: "#fff" }}
      >
        ✦ FREE SHIPPING ON ORDERS ABOVE ₹1,499 &nbsp;|&nbsp; USE CODE{" "}
        <span style={{ color: "var(--accent-light)" }}>KURTHI20</span> FOR 20% OFF ✦
      </div>

      <Navbar wishlistCount={wishlist.length} cartCount={cartCount} />

      {/* ── PAGE HEADER ── */}
      <div
        className="relative overflow-hidden py-14"
        style={{ background: "linear-gradient(135deg, #5c1629 0%, #7b1e3a 50%, #c97d4a 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "var(--accent-light)" }}>Collections</span>
          </div>
          <h1 className="font-bold mb-2" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "#fff", lineHeight: 1.1 }}>
            All Collections
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", maxWidth: "500px" }}>
            Handcrafted Kurthi dresses for every occasion — explore {ALL_PRODUCTS.length}+ exclusive designs.
          </p>
          {/* Category Quick Tabs */}
          <div className="flex gap-3 mt-8 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-200"
                style={{
                  background: activeCategory === cat ? "#fff" : "rgba(255,255,255,0.12)",
                  color: activeCategory === cat ? "var(--primary)" : "#fff",
                  border: "none", cursor: "pointer",
                  backdropFilter: "blur(8px)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative mt-6 max-w-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for kurtis, fabrics, styles…"
              className="w-full pl-11 pr-10 py-3.5 rounded-full text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: "#fff",
                fontFamily: "var(--font-jost, sans-serif)",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onFocus={(e)  => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
              onBlur={(e)   => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: "1rem", lineHeight: 1 }}
              >✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex gap-8">

          {/* ── DESKTOP FILTER SIDEBAR ── */}
          <aside
            className="hidden lg:block flex-shrink-0 sticky top-24 self-start rounded-2xl p-6"
            style={{ width: "270px", background: "var(--cream)", border: "1px solid var(--cream-dark)", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}
          >
            <FilterPanel {...filterPanelProps} />
          </aside>

          {/* ── PRODUCT AREA ── */}
          <div className="flex-1 min-w-0">

            {/* ── TOOLBAR ── */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <button
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--cream)", border: "1px solid var(--cream-dark)", cursor: "pointer", color: "var(--primary)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                  </svg>
                  Filters {filterCount > 0 && <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ background: "var(--primary)", color: "#fff" }}>{filterCount}</span>}
                </button>

                <span className="text-sm" style={{ color: "#888" }}>
                  <span className="font-semibold" style={{ color: "var(--foreground)" }}>{filtered.length}</span> products
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-4 pr-8 py-2.5 rounded-xl text-sm font-medium outline-none cursor-pointer"
                    style={{ border: "1px solid var(--cream-dark)", background: "var(--cream)", color: "var(--foreground)", fontFamily: "var(--font-jost, sans-serif)" }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>

                {/* Grid cols toggle */}
                <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--cream)", border: "1px solid var(--cream-dark)" }}>
                  {([3, 4] as const).map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setGridCols(cols)}
                      className="p-2 rounded-lg transition-all"
                      style={{ background: gridCols === cols ? "#fff" : "transparent", border: "none", cursor: "pointer", boxShadow: gridCols === cols ? "0 1px 6px rgba(0,0,0,0.08)" : "none" }}
                      title={`${cols} columns`}
                    >
                      <div className={`grid gap-0.5`} style={{ gridTemplateColumns: `repeat(${cols === 3 ? 2 : 3}, 6px)` }}>
                        {Array.from({ length: cols === 3 ? 4 : 9 }).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-sm" style={{ background: gridCols === cols ? "var(--primary)" : "#ccc" }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ACTIVE FILTER PILLS ── */}
            {filterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 pb-4" style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                {activeCategory !== "All" && (
                  <FilterPill label={activeCategory} onRemove={() => setActiveCategory("All")} />
                )}
                {activeSizes.map((s) => (
                  <FilterPill key={s} label={`Size: ${s}`} onRemove={() => toggleSize(s)} />
                ))}
                {activeFabric !== "All" && (
                  <FilterPill label={activeFabric} onRemove={() => setActiveFabric("All")} />
                )}
                {activeOccasion !== "All" && (
                  <FilterPill label={activeOccasion} onRemove={() => setActiveOccasion("All")} />
                )}
                {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                  <FilterPill label={`₹${priceRange[0].toLocaleString("en-IN")} – ₹${priceRange[1].toLocaleString("en-IN")}`} onRemove={() => setPriceRange([0, 10000])} />
                )}
                <button
                  onClick={clearAll}
                  className="text-xs font-semibold underline px-2"
                  style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Clear All
                </button>
              </div>
            )}

            {/* ── PRODUCT GRID ── */}
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <span className="text-6xl mb-6 block">🔍</span>
                <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)" }}>No products found</h3>
                <p className="text-sm mb-6" style={{ color: "#888" }}>Try adjusting your filters or search term.</p>
                <button
                  onClick={clearAll}
                  className="btn-primary px-8 py-3 rounded-full text-sm font-semibold tracking-wider uppercase"
                  style={{ cursor: "pointer" }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-5`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl overflow-hidden group card-lift"
                    style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", cursor: "pointer" }}
                    onMouseEnter={() => setHoveredId(product.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => openProduct(product)}
                  >
                    {/* Image */}
                    <div className={`relative ${product.imgClass} overflow-hidden`} style={{ height: gridCols === 3 ? "320px" : "260px" }}>
                      {/* Fabric icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="opacity-20 animate-float" style={{ fontSize: gridCols === 3 ? "7rem" : "5rem" }}>🥻</span>
                      </div>

                      {/* Tag */}
                      {product.tag && <TagBadge tag={product.tag} />}

                      {/* Wishlist */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist.includes(product.id) ? "var(--primary)" : "none"} stroke="var(--primary)" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>

                      {/* Bestseller ribbon */}
                      {product.isBestseller && (
                        <div
                          className="absolute bottom-0 left-0 right-0 py-1.5 text-center text-xs font-semibold tracking-widest uppercase"
                          style={{ background: "rgba(201,125,74,0.92)", color: "#fff" }}
                        >
                          ★ Bestseller
                        </div>
                      )}

                      {/* Out of Stock overlay */}
                      {product.outOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: "rgba(0,0,0,0.3)", pointerEvents: "none" }}>
                          <span className="px-4 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase" style={{ background: "rgba(0,0,0,0.72)", color: "#fff" }}>Out of Stock</span>
                        </div>
                      )}
                      {/* Quick Add overlay */}
                      <div
                        className="absolute inset-0 flex flex-col justify-end transition-opacity duration-300"
                        style={{ opacity: hoveredId === product.id ? 1 : 0, background: "linear-gradient(to top, rgba(92,22,41,0.7) 0%, transparent 50%)" }}
                      >
                        {!product.isBestseller && <div style={{ height: "2rem" }} />}
                        <div className="p-3">
                          {product.outOfStock ? (
                            <button
                              disabled
                              className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider uppercase"
                              style={{ background: "rgba(20,20,20,0.75)", color: "rgba(255,255,255,0.55)", cursor: "not-allowed" }}
                            >
                              Out of Stock
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); addToCart(product, product.sizes[0] ?? ""); }}
                              className="btn-primary w-full py-3 rounded-xl text-sm font-semibold tracking-wider uppercase"
                              style={{ cursor: "pointer" }}
                            >
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      {/* Category + Fabric chips */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--cream)", color: "var(--accent)", fontSize: "0.68rem", fontWeight: 600 }}>
                          {product.category}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--cream)", color: "#888", fontSize: "0.68rem" }}>
                          {product.fabric}
                        </span>
                        {/* Color swatch */}
                        <span className="w-3.5 h-3.5 rounded-full border border-white ring-1 ring-gray-200 ml-auto" style={{ background: product.colorHex }} title={product.color} />
                      </div>

                      <h3
                        className="font-semibold mb-1 leading-tight"
                        style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: gridCols === 3 ? "1.1rem" : "1rem", color: "var(--foreground)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {product.name}
                      </h3>

                      <StarRating rating={product.rating} count={product.reviews} />

                      {/* Sizes */}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {product.sizes.slice(0, 5).map((s) => (
                          <span key={s} className="text-xs px-1.5 py-0.5 rounded" style={{ border: "1px solid var(--cream-dark)", color: "#888", fontSize: "0.65rem" }}>{s}</span>
                        ))}
                        {product.sizes.length > 5 && <span className="text-xs" style={{ color: "#bbb" }}>+{product.sizes.length - 5}</span>}
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="font-bold" style={{ color: "var(--primary)", fontFamily: "var(--font-jost, sans-serif)", fontSize: "1.1rem" }}>
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.original && (
                          <>
                            <span className="text-sm line-through" style={{ color: "#bbb" }}>₹{product.original.toLocaleString("en-IN")}</span>
                            <span className="text-xs font-bold" style={{ color: "#16a34a" }}>
                              {Math.round(((product.original - product.price) / product.original) * 100)}% off
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── LOAD MORE ── */}
            {filtered.length > 0 && (
              <div className="text-center mt-14 pb-4">
                <p className="text-sm mb-5" style={{ color: "#aaa" }}>Showing {filtered.length} of {filtered.length} products</p>
                <button
                  className="btn-outline px-10 py-4 rounded-full text-sm font-semibold tracking-widest uppercase"
                  style={{ cursor: "pointer" }}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      {filterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setFilterOpen(false)}
          />
          {/* Drawer */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 overflow-y-auto animate-fadeInUp"
            style={{ background: "#fff", maxHeight: "85vh", boxShadow: "0 -20px 60px rgba(0,0,0,0.15)" }}
          >
            <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ background: "#ddd" }} />
            <FilterPanel {...filterPanelProps} />
            <button
              onClick={() => setFilterOpen(false)}
              className="btn-primary w-full py-4 rounded-2xl font-semibold tracking-wider text-sm uppercase mt-8"
              style={{ cursor: "pointer" }}
            >
              Show {filtered.length} Results
            </button>
          </div>
        </>
      )}

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
                  <span style={{ position:"absolute",top:"18px",left:"18px",background:selectedProduct.tag==="Sale"?"#dc2626":selectedProduct.tag==="Hot"?"var(--accent)":selectedProduct.tag==="Luxe"?"#1a1a1a":"var(--primary)",color:selectedProduct.tag==="Luxe"?"var(--accent-light)":"#fff",padding:"5px 14px",borderRadius:"999px",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>
                    {selectedProduct.tag}
                  </span>
                )}
                {selectedProduct.isBestseller && (
                  <div style={{ position:"absolute",bottom:0,left:0,right:0,textAlign:"center",padding:"8px",background:"rgba(201,125,74,0.92)",color:"#fff",fontSize:"0.75rem",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase" }}>★ Bestseller</div>
                )}
                {selectedProduct.outOfStock && (
                  <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <span style={{ background:"rgba(0,0,0,0.75)",color:"#fff",padding:"8px 20px",borderRadius:"999px",fontSize:"0.75rem",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase" }}>Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div style={{ padding:"40px 36px",display:"flex",flexDirection:"column",gap:"20px",overflowY:"auto",maxHeight:"520px" }}>

                {/* Badges */}
                <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
                  <span style={{ background:"var(--cream)",color:"var(--accent)",padding:"4px 12px",borderRadius:"999px",fontSize:"0.7rem",fontWeight:600,letterSpacing:"0.06em" }}>{selectedProduct.category}</span>
                  <span style={{ background:"#f0f0f0",color:"#666",padding:"4px 12px",borderRadius:"999px",fontSize:"0.7rem",fontWeight:600 }}>{selectedProduct.fabric}</span>
                  <span style={{ background:"#f0f0f0",color:"#888",padding:"4px 12px",borderRadius:"999px",fontSize:"0.7rem" }}>{selectedProduct.occasion}</span>
                  <span className="w-4 h-4 rounded-full ring-1 ring-gray-200" style={{ background:selectedProduct.colorHex,flexShrink:0,alignSelf:"center" }} title={selectedProduct.color} />
                </div>

                {/* Name */}
                <h2 style={{ fontFamily:"var(--font-cormorant,serif)",fontSize:"clamp(1.5rem,3vw,2rem)",fontWeight:700,color:"var(--primary)",lineHeight:1.2,margin:0 }}>{selectedProduct.name}</h2>

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
                  <span style={{ fontFamily:"var(--font-cormorant,serif)",fontSize:"2rem",fontWeight:700,color:"var(--primary)" }}>₹{selectedProduct.price.toLocaleString("en-IN")}</span>
                  {selectedProduct.original && <>
                    <span style={{ fontSize:"1rem",color:"#bbb",textDecoration:"line-through" }}>₹{selectedProduct.original.toLocaleString("en-IN")}</span>
                    <span style={{ background:"#fef2f2",color:"#dc2626",padding:"3px 10px",borderRadius:"999px",fontSize:"0.75rem",fontWeight:700 }}>{Math.round(((selectedProduct.original-selectedProduct.price)/selectedProduct.original)*100)}% OFF</span>
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

                <div style={{ height:"1px",background:"var(--cream-dark)" }}/>

                {/* Actions */}
                <div style={{ display:"flex",gap:"12px",flexWrap:"wrap" }}>
                  {selectedProduct.outOfStock ? (
                    <button disabled style={{ flex:1,padding:"14px",borderRadius:"14px",background:"#e0e0e0",color:"#aaa",border:"none",fontSize:"0.85rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"not-allowed" }}>Out of Stock</button>
                  ) : (
                    <button
                      onClick={()=>addToCart(selectedProduct, selectedSize)}
                      style={{ flex:1,padding:"14px",borderRadius:"14px",background:"var(--primary)",color:"#fff",border:"none",fontSize:"0.85rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer" }}
                    >Add to Cart</button>
                  )}
                  <button
                    onClick={()=>{ const id=selectedProduct.id; setWishlist(prev=>prev.includes(id)?prev.filter(i=>i!==id):[...prev,id]); }}
                    style={{ width:"50px",height:"50px",borderRadius:"14px",border:"1.5px solid var(--cream-dark)",background:wishlist.includes(selectedProduct.id)?"#fff0f5":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlist.includes(selectedProduct.id)?"var(--primary)":"none"} stroke="var(--primary)" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>

                {/* Trust row */}
                <div style={{ display:"flex",gap:"12px",flexWrap:"wrap" }}>
                  {([["↩","30-day returns"],["🔒","Secure checkout"],["💎","Authentic product"]] as [string,string][]).map(([icon,label])=>(
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

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-sm font-semibold tracking-wide"
        style={{ color: "var(--foreground)", background: "none", border: "none", cursor: "pointer" }}
      >
        <span style={{ fontFamily: "var(--font-jost, sans-serif)" }}>{title}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5"
          style={{ transform: open ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: "var(--cream)", color: "var(--primary)", border: "1px solid var(--cream-dark)" }}
    >
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", lineHeight: 1, padding: 0 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </span>
  );
}

function Divider() {
  return <div className="my-4" style={{ height: "1px", background: "var(--cream-dark)" }} />;
}
