"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Bell, ShoppingCart, User, LogOut, LayoutDashboard, Package, Heart, Settings } from "lucide-react";
import { getCachedUserInfo, clearUserToken } from "@/lib/api";

/* ─── Mock cart data ─── */
type CartItem = {
  id: number;
  name: string;
  price: number;
  original?: number;
  imgClass: string;
  images?: string[];
  size: string;
  color: string;
  colorHex: string;
  qty: number;
  fabric: string;
};

const COUPON_CODES: Record<string, number> = {
  VYGRON20: 20,
  FIRST10: 10,
  FESTIVE15: 15,
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const loaded = useRef(false);

  /* ── Load from localStorage once ── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vygron_cart");
      if (stored) setCart(JSON.parse(stored));
    } catch {}
  }, []);

  /* ── Write back on every change, but skip the very first render (cart=[]) ── */
  useEffect(() => {
    if (!loaded.current) { loaded.current = true; return; }
    localStorage.setItem("vygron_cart", JSON.stringify(cart));
  }, [cart]);

  const [userName, setUserName] = useState<string>("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     const info = getCachedUserInfo();
     if (info) setUserName(info.name?.split(" ")[0] || "Profile");
  }, []);

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

  return (
    <div className="min-h-screen bg-[#EDEFF1] text-[#333] font-sans selection:bg-blue-500 selection:text-white">
      {/* ── NAVBAR 85% ── */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="w-[85%] mx-auto py-5 flex items-center justify-between">
           <div className="flex items-center gap-12 flex-1">
              <Link href="/" className="text-2xl font-black tracking-tighter text-[#1A1A1A]">
                 vygron<span className="text-blue-600">hub</span>
              </Link>
              
              <div className="flex-1 max-w-xl relative hidden md:block">
                 <input 
                    type="text" 
                    placeholder="Search product in Vygronhub" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-[3px] py-2.5 px-4 pl-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                 />
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">|</div>
              </div>
           </div>

           <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                 <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative hidden sm:block">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                 </button>
                 <Link href="/cart" className="p-2 text-blue-600 transition-colors relative block">
                    <ShoppingCart size={20} />
                    {totalItems > 0 && (
                       <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">
                          {totalItems}
                       </span>
                    )}
                 </Link>
                 {userName ? (
                   <div className="relative" ref={userMenuRef}>
                     <button 
                       onClick={() => setShowUserMenu(!showUserMenu)}
                       className="hidden sm:flex items-center gap-2 p-2 text-gray-400 hover:text-blue-600 transition-colors ml-2 cursor-pointer bg-transparent border-none outline-none"
                     >
                        <User size={20} />
                        <span className="text-xs font-bold uppercase tracking-wider">{userName}</span>
                     </button>
                     
                     {showUserMenu && (
                       <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 py-4 z-[200] animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="px-6 py-4 border-b border-gray-50 mb-2">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Hub</p>
                             <p className="text-sm font-bold text-[#1A1A1A] truncate">{userName}</p>
                          </div>
                          
                          <div className="flex flex-col">
                             <Link href="/dashboard/customer" className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors no-underline">
                                <LayoutDashboard size={16} /> Dashboard
                             </Link>
                             <Link href="/dashboard/customer?tab=orders" className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors no-underline">
                                <Package size={16} /> My Orders
                             </Link>
                             <Link href="/dashboard/customer?tab=wishlist" className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors no-underline">
                                <Heart size={16} /> Wishlist
                             </Link>
                             <Link href="/dashboard/customer?tab=profile" className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors no-underline">
                                <Settings size={16} /> Settings
                             </Link>
                             
                             <div className="h-[1px] bg-gray-50 my-2" />
                             
                             <button 
                               onClick={handleLogout}
                               className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors w-full text-left bg-transparent border-none cursor-pointer"
                             >
                                <LogOut size={16} /> Sign Out
                             </button>
                          </div>
                       </div>
                     )}
                   </div>
                 ) : (
                   <Link href="/login" className="hidden sm:flex items-center gap-2 p-2 text-gray-400 hover:text-blue-600 transition-colors ml-2">
                      <User size={20} />
                      <span className="text-xs font-bold uppercase tracking-wider">Login</span>
                   </Link>
                 )}
              </div>
           </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-[85%] mx-auto py-8">
        
        {cart.length === 0 ? (
           <div className="bg-white rounded shadow-sm py-32 px-4 text-center">
             <div className="text-6xl mb-6 opacity-30">🛍️</div>
             <h2 className="font-bold text-2xl text-[#1A1A1A]">Your shopping bag is empty!</h2>
             <p className="mt-2 text-sm text-gray-500">Explore our wide selection and find something you like.</p>
             <Link href="/">
               <button className="bg-blue-600 text-white mt-8 px-10 py-3 rounded-[3px] text-sm font-bold tracking-wide uppercase transition-colors hover:bg-blue-700 shadow-sm" style={{ cursor: "pointer" }}>
                 Start Shopping
               </button>
             </Link>
           </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Bag Items */}
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
               {/* Cart Header */}
               <div className="bg-white rounded shadow-sm p-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#1A1A1A]">Shopping Bag ({totalItems} items)</h2>
               </div>
               
               {/* Items List */}
               {cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="bg-white rounded shadow-sm p-6 flex flex-col sm:flex-row gap-6">
                     {/* Image */}
                     <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                        {item.images?.[0] ? (
                           <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-4xl opacity-25">🥻</span>
                        )}
                     </div>
                     
                     <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="font-bold text-[#1A1A1A] mb-1 line-clamp-2">{item.name}</h3>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                 <span>Size: <span className="font-bold text-[#1A1A1A]">{item.size}</span></span>
                                 <span>•</span>
                                 <span className="flex items-center gap-1">Color: <span className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ background: item.colorHex }} /></span>
                              </div>
                              <p className="text-xs text-gray-400">Seller: Vygron Premium</p>
                           </div>
                           <div className="text-right pl-4">
                              <p className="font-bold text-lg text-[#1A1A1A]">₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
                              {item.original && (
                                 <div className="flex items-center gap-1.5 justify-end">
                                    <p className="text-xs text-gray-400 line-through">₹{(item.original * item.qty).toLocaleString("en-IN")}</p>
                                    <p className="text-xs font-bold text-green-600">{Math.round(((item.original - item.price) / item.original) * 100)}% off</p>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
                           <div className="flex items-center border border-gray-200 rounded">
                              <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-50 transition-colors">−</button>
                              <div className="w-10 h-8 flex items-center justify-center font-bold text-[#1A1A1A] text-sm border-x border-gray-200">{item.qty}</div>
                              <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-50 transition-colors">+</button>
                           </div>
                           <button onClick={() => removeItem(item.id)} className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
                              REMOVE
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
               
               {/* Delivery Options Mock */}
               <div className="bg-white rounded shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                     <span className="text-xl">🚚</span>
                     <div>
                        <p className="text-sm font-bold text-[#1A1A1A]">Delivery available globally.</p>
                        <p className="text-xs text-gray-500">Fast and secure shipping via trusted partners.</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Price Details */}
            <div className="w-full lg:w-[380px] flex flex-col gap-4 flex-shrink-0">
               {/* Coupons */}
               <div className="bg-white rounded shadow-sm p-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Apply Coupon</h3>
                  <div className="flex relative">
                     <input 
                        type="text" 
                        value={coupon} 
                        onChange={(e) => setCoupon(e.target.value)} 
                        placeholder="Enter code (e.g. VYGRON20)"
                        className="w-full border border-gray-200 rounded-[3px] py-2.5 px-3 text-sm font-bold text-[#1A1A1A] outline-none focus:border-blue-500" 
                     />
                     <button onClick={applyCoupon} className="absolute right-0 top-0 bottom-0 px-4 text-sm font-bold text-blue-600 disabled:opacity-50 hover:underline">Apply</button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-2 font-semibold">{couponError}</p>}
                  {appliedCoupon && (
                     <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded text-sm text-green-700 font-bold flex items-center justify-between">
                        <span>{appliedCoupon.code} applied!</span>
                        <span className="text-xs">-{appliedCoupon.pct}% off</span>
                     </div>
                  )}
               </div>

               {/* Summary */}
               <div className="bg-white rounded shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                     <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Price Details</h3>
                  </div>
                  <div className="p-6 flex flex-col gap-4 text-sm">
                     <div className="flex justify-between items-center text-[#1A1A1A]">
                        <span>Price ({totalItems} items)</span>
                        <span>₹{subtotal.toLocaleString("en-IN")}</span>
                     </div>
                     {savings > 0 && (
                        <div className="flex justify-between items-center text-green-600 font-semibold">
                           <span>Discount</span>
                           <span>- ₹{savings.toLocaleString("en-IN")}</span>
                        </div>
                     )}
                     {appliedCoupon && (
                        <div className="flex justify-between items-center text-green-600 font-semibold">
                           <span>Coupon Discount ({appliedCoupon.code})</span>
                           <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
                        </div>
                     )}
                     <div className="flex justify-between items-center text-[#1A1A1A]">
                        <span>Delivery Charges</span>
                        <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>{shipping === 0 ? "FREE Delivery" : `₹${shipping}`}</span>
                     </div>
                  </div>
                  <div className="p-6 border-t border-b border-gray-100 border-dashed">
                     <div className="flex justify-between items-center font-bold text-xl text-[#1A1A1A]">
                        <span>Total Amount</span>
                        <span>₹{total.toLocaleString("en-IN")}</span>
                     </div>
                  </div>
                  <div className="p-6 bg-green-50/50 rounded-b text-sm font-bold text-green-600">
                     You will save ₹{(savings + discountAmount + (shipping === 0 ? 99 : 0)).toLocaleString("en-IN")} on this order
                  </div>
               </div>
               
               <Link href="/checkout" className="w-full">
                  <button className="w-full bg-[#1A1A1A] text-white py-4 rounded-[3px] text-sm font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-sm">
                     Proceed to Checkout
                  </button>
               </Link>
               
               <div className="flex items-center justify-center gap-2 mt-2 opacity-50">
                  <span className="text-sm">🔒</span>
                  <span className="text-xs font-bold text-[#1A1A1A] tracking-wider uppercase">Safe & Secure Payments</span>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
