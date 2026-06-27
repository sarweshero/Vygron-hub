"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getCachedUserInfo, clearUserToken } from "@/lib/api";
import { User, LogOut, Settings, LayoutDashboard, Package, Heart } from "lucide-react";

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearUserToken();
    window.location.reload();
  };

  /* Auto-read cart count + user name from localStorage */
  useEffect(() => {
    try {
      if (cartCountProp === undefined) {
        const s = localStorage.getItem("vygron_cart");
        if (s) {
          const items: { qty: number }[] = JSON.parse(s);
          setCartCount(items.reduce((sum, i) => sum + i.qty, 0));
        }
      }
      const info = getCachedUserInfo();
      if (info) setUserName(info.name?.split(" ")[0] || "");
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
            VYGRON
          </div>
          <div className="text-xs tracking-[0.35em] uppercase mt-[2px]" style={{ color: "var(--accent)", fontFamily: "var(--font-jost, sans-serif)", fontSize: "0.6rem" }}>
            HUB
          </div>
        </Link>

        {/* ── FULL variant: desktop nav links ── */}
        {variant === "full" && (
          <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <Link
                  href={link === "Collections" || link === "New Arrivals" ? "/#categories" : "#"}
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
          {variant === "full" && (
            <Link href="/profile?tab=wishlist" className="relative p-2 transition-transform hover:scale-110" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill={wishlistCount > 0 ? "var(--primary)" : "none"} stroke="var(--primary)" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center" style={{ background: "var(--accent)", fontSize: "0.6rem" }}>
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Account / User – full and simple */}
          {(variant === "full" || variant === "simple") && (
            userName ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide cursor-pointer transition-all hover:bg-[var(--cream-dark)]" 
                  style={{ background: "var(--primary)", color: "#fff", border: "none" }}
                >
                  <User size={14} />
                  {userName}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-3 border-b border-gray-50 mb-1">
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Account Hub</p>
                       <p className="text-sm font-bold text-[#1A1A1A] truncate">{userName}</p>
                    </div>
                    
                    <div className="flex flex-col">
                       <Link href="/dashboard/customer" className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[var(--primary)] transition-colors" style={{ textDecoration: "none" }}>
                          <LayoutDashboard size={14} /> Dashboard
                       </Link>
                       <Link href="/dashboard/customer?tab=orders" className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[var(--primary)] transition-colors" style={{ textDecoration: "none" }}>
                          <Package size={14} /> My Orders
                       </Link>
                       <Link href="/dashboard/customer?tab=wishlist" className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[var(--primary)] transition-colors" style={{ textDecoration: "none" }}>
                          <Heart size={14} /> Wishlist
                       </Link>
                       
                       <div className="h-[1px] bg-gray-50 my-1" />
                       
                       <button 
                         onClick={handleLogout}
                         className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                         style={{ background: "none", border: "none", cursor: "pointer" }}
                       >
                          <LogOut size={14} /> Sign Out
                       </button>
                    </div>
                  </div>
                )}
              </div>
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
              href={link === "Collections" || link === "New Arrivals" ? "/#categories" : "#"}
              className="block py-3 text-sm font-medium tracking-wider uppercase"
              style={{ color: "var(--foreground)", textDecoration: "none", borderBottom: "1px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)" }}
            >
              {link}
            </Link>
          ))}
          {userName ? (
            <Link
              href="/dashboard/customer"
              className="block py-4 text-sm font-bold tracking-wider uppercase border-b border-gray-100 flex items-center justify-between"
              style={{ color: "var(--primary)", textDecoration: "none", fontFamily: "var(--font-jost, sans-serif)" }}
            >
              <span>{userName}&apos;s Profile</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </Link>
          ) : (
            <Link
              href="/login"
              className="block py-4 text-sm font-bold tracking-wider uppercase border-b border-gray-100 flex items-center justify-between"
              style={{ color: "var(--foreground)", textDecoration: "none", fontFamily: "var(--font-jost, sans-serif)" }}
            >
              <span>Login / Sign Up</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
