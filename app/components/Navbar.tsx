"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = ["New Arrivals", "Collections"];

type NavbarProps = {
  /** "full" = logo + nav links + search + wishlist + account + cart (default)
   *  "simple" = logo + cart icon only
   *  "checkout" = logo + optional back link */
  variant?: "full" | "simple" | "checkout";
  /** Override the cart count instead of auto-reading from localStorage */
  cartCount?: number;
  /** Show wishlist badge */
  wishlistCount?: number;
  /** For "checkout" variant – text and href of the back link */
  backHref?: string;
  backLabel?: string;
};

export default function Navbar({
  variant = "full",
  cartCount: cartCountProp,
  wishlistCount = 0,
  backHref = "/cart",
  backLabel = "← Back to Cart",
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(cartCountProp ?? 0);
  const [userName, setUserName] = useState("");

  /* Auto-read cart count + user name from localStorage */
  useEffect(() => {
    try {
      if (cartCountProp === undefined) {
        const s = localStorage.getItem("kurthi_cart");
        if (s) {
          const items: { qty: number }[] = JSON.parse(s);
          setCartCount(items.reduce((sum, i) => sum + i.qty, 0));
        }
      }
      const auth = localStorage.getItem("kurthi_user_auth");
      if (auth) {
        const u = JSON.parse(auth);
        setUserName(u.name?.split(" ")[0] || "");
      }
    } catch {}
  }, [cartCountProp]);

  /* Keep in sync if parent updates cartCount prop */
  useEffect(() => {
    if (cartCountProp !== undefined) setCartCount(cartCountProp);
  }, [cartCountProp]);

  return (
    <nav
      className="sticky top-0 z-50 shadow-sm"
      style={{ background: "rgba(253,250,246,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--cream-dark)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-20">

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className="text-2xl font-bold tracking-[0.15em]" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)", lineHeight: 1 }}>
            KURTHĪ
          </div>
          <div className="text-xs tracking-[0.35em] uppercase mt-[2px]" style={{ color: "var(--accent)", fontFamily: "var(--font-jost, sans-serif)", fontSize: "0.6rem" }}>
            COUTURE
          </div>
        </Link>

        {/* ── FULL variant: desktop nav links ── */}
        {variant === "full" && (
          <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <Link
                  href={link === "Collections" || link === "New Arrivals" ? "/products" : "#"}
                  className="text-sm font-medium tracking-wider uppercase transition-colors duration-200 hover:opacity-70"
                  style={{ color: "var(--foreground)", textDecoration: "none", fontFamily: "var(--font-jost, sans-serif)", fontSize: "0.78rem" }}
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* ── CHECKOUT variant: back link ── */}
        {variant === "checkout" && backLabel && (
          <Link href={backHref} className="text-sm font-medium" style={{ color: "var(--primary)", textDecoration: "none", opacity: 0.7 }}>
            {backLabel}
          </Link>
        )}

        {/* Right icons */}
        <div className="flex items-center gap-3">

          {/* Search – full only */}
          {/* {variant === "full" && (
            <button
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:opacity-80"
              style={{ border: "1px solid var(--cream-dark)", background: "var(--cream)", color: "var(--foreground)", fontFamily: "var(--font-jost, sans-serif)", cursor: "pointer" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="text-xs tracking-wide" style={{ color: "#888" }}>Search</span>
            </button>
          )} */}

          {/* Wishlist – full only */}
          {/* {variant === "full" && (
            <button
              className="relative p-2 transition-transform hover:scale-110"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={wishlistCount > 0 ? "var(--primary)" : "none"} stroke="var(--primary)" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center" style={{ background: "var(--accent)", fontSize: "0.6rem" }}>
                  {wishlistCount}
                </span>
              )}
            </button>
          )} */}

          {/* Account / User – full and simple */}
          {(variant === "full" || variant === "simple") && (
            userName ? (
              <Link href="/profile" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide" style={{ background: "var(--primary)", color: "#fff", textDecoration: "none" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {userName}
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:flex items-center gap-1.5 p-2 rounded-xl transition-colors hover:bg-[var(--cream)]" style={{ color: "var(--primary)", textDecoration: "none" }} title="My Account">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            )
          )}

          {/* Cart – full and simple */}
          {(variant === "full" || variant === "simple") && (
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium tracking-wide btn-primary"
              style={{ fontFamily: "var(--font-jost, sans-serif)", textDecoration: "none" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: "#fff", color: "var(--primary)" }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Mobile hamburger – full only */}
          {variant === "full" && (
            <button
              className="lg:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", cursor: "pointer" }}
              aria-label="Menu"
            >
              <div className="flex flex-col gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="block h-0.5 w-5 rounded" style={{ background: "var(--primary)" }} />
                ))}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {variant === "full" && menuOpen && (
        <div className="lg:hidden px-6 pb-6 pt-2" style={{ borderTop: "1px solid var(--cream-dark)" }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link}
              href={link === "Collections" || link === "New Arrivals" ? "/products" : "#"}
              className="block py-3 text-sm font-medium tracking-wider uppercase"
              style={{ color: "var(--foreground)", textDecoration: "none", borderBottom: "1px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)" }}
            >
              {link}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
