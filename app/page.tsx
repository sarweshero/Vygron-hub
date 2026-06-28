"use client";
// page.tsx – Vygron Hub | Inspired by the TrendHub UI

import { useState, useEffect, useMemo } from "react";
import { getAllShops, BASE, mediaUrl } from "@/lib/api";
import Link from "next/link";
import Footer from "@/app/components/Footer";
import { 
  Search, Bell, Heart, ShoppingCart, ChevronRight, 
  ArrowRight, Globe, ShoppingBag, X, Plus, Minus, CheckCircle2, User,
  LogOut, Settings, LayoutDashboard, Package
} from "lucide-react";
import { getCachedUserInfo, clearUserToken } from "@/lib/api";
import { useRef } from "react";

export default function Home() {
  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("");
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

  useEffect(() => {
    // Load global cart
    try {
      const saved = localStorage.getItem("vygron_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {}

    // Check for user
    const info = getCachedUserInfo();
    if (info) setUserName(info.name?.split(" ")[0] || "Profile");
  }, []);

  useEffect(() => {
    localStorage.setItem("vygron_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    const itemToAdd = {
      ...product,
      qty: 1,
      shop_slug: product.shop_slug || "vygron-hub",
      shop_name: product.shop_name || "Vygron Premium"
    };

    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, itemToAdd]);
    }
    alert(`Added to your Vygron Hub cart via ${itemToAdd.shop_name}! ✨`);
  };

  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        const [shopsData, productsData] = await Promise.all([
          getAllShops(),
          fetch(`${BASE}/products/`).then(r => r.json())
        ]);
        setShops(shopsData);
        setProducts(productsData.results || productsData);
      } catch (err) {
        console.error("Failed to load marketplace data", err);
      } finally {
        setLoading(false);
      }
    };
    loadMarketplace();
  }, []);

  useEffect(() => {
    if (selectedProduct && selectedProduct.images?.length > 0) {
      setActiveImage(selectedProduct.images[0]);
    }
  }, [selectedProduct]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-white">
           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-white text-[#333] font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ── NAVBAR 85% ── */}
      <nav className="w-[85%] mx-auto py-6 flex items-center justify-between">
         <div className="flex items-center gap-12 flex-1">
            <Link href="/" className="text-2xl font-black tracking-tighter text-[#1A1A1A]">
               vygron<span className="text-blue-600">hub</span>
            </Link>
            
            <div className="flex-1 max-w-xl relative">
               <input 
                  type="text" 
                  placeholder="Search product in Vygronhub" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-full py-3 px-6 pl-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
               />
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">|</div>
            </div>
         </div>

         <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
               <Link href="#" className="hover:text-blue-600">About</Link>
               <Link href="#" className="hover:text-blue-600">Help</Link>
               <Link href="#" className="hover:text-blue-600">Contact</Link>
            </div>
            <div className="flex items-center gap-4">
               <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
               </button>
               <Link href="/cart" className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative block">
                  <ShoppingCart size={20} />
                  {cart.length > 0 && (
                     <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">
                        {cart.reduce((sum, item) => sum + item.qty, 0)}
                     </span>
                  )}
               </Link>
               {userName ? (
                  <div className="relative" ref={userMenuRef}>
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="bg-blue-600 text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
                    >
                       <User size={16} />
                       {userName}
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 py-4 z-[200] animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="px-6 py-4 border-b border-gray-50 mb-2">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Hub</p>
                           <p className="text-sm font-bold text-[#1A1A1A] truncate">{userName}</p>
                        </div>
                        
                        <div className="flex flex-col">
                           <Link href="/dashboard/customer" className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                              <LayoutDashboard size={16} /> Dashboard
                           </Link>
                           <Link href="/dashboard/customer?tab=orders" className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                              <Package size={16} /> My Orders
                           </Link>
                           <Link href="/dashboard/customer?tab=wishlist" className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                              <Heart size={16} /> Wishlist
                           </Link>
                           <Link href="/dashboard/customer?tab=profile" className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                              <Settings size={16} /> Settings
                           </Link>
                           
                           <div className="h-[1px] bg-gray-50 my-2" />
                           
                           <button 
                             onClick={handleLogout}
                             className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                           >
                              <LogOut size={16} /> Sign Out
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/login" className="bg-blue-600 text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                     Login
                  </Link>
                )}
            </div>
         </div>
      </nav>

      {/* ── CATEGORY SUBNAV 85% ── */}
      <div className="w-[85%] mx-auto py-4 border-t border-gray-100 flex items-center justify-between overflow-x-auto no-scrollbar whitespace-nowrap">
         <div className="flex items-center gap-4">
            <button className="px-6 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-600 border border-gray-200">All Categories</button>
            <button className="px-6 py-2 bg-blue-600 rounded-full text-xs font-bold text-white shadow-md">All Discount</button>
         </div>
         <div className="flex items-center gap-8 ml-12 text-sm font-bold text-gray-400">
            {["Electronics", "Fashion", "Grocery", "Sports", "School Supplies", "Toys", "Book"].map((cat) => (
               <button key={cat} onClick={() => setActiveCategory(cat)} className={`hover:text-blue-600 transition-colors ${activeCategory === cat ? 'text-blue-600' : ''}`}>
                  {cat}
               </button>
            ))}
         </div>
      </div>

      {/* ── HERO SECTION 85% ── */}
      <div className="w-[85%] mx-auto mt-6 bg-[#EDEFF1] rounded-[3rem] overflow-hidden relative min-h-[500px] flex items-center px-16">
         <div className="flex-1 space-y-8 py-20 relative z-10">
            <h1 className="text-6xl font-black text-[#1A1A1A] leading-[1.1] max-w-xl">
               Your <span className="text-blue-600">One-Stop</span> Shop for Everything You Need!
            </h1>
            <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
               Fast shipping, friendly customer service, and secure transactions guaranteed!
            </p>
            
            <div className="flex gap-4 pt-4">
               {/* Mini Promo Card 1 */}
               <div className="bg-[#FFEB3B] p-6 rounded-[2rem] w-44 space-y-4 shadow-xl shadow-yellow-500/10">
                  <h3 className="font-black text-sm text-[#1A1A1A]">Back to School</h3>
                  <p className="text-[10px] text-gray-600 leading-tight">Grab your school supplies at unbeatable prices!</p>
                   <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg">Claim discount</button>
                </div>

                {/* Mini Promo Card 2 */}
                <div className="bg-white p-6 rounded-[2rem] w-44 space-y-4 shadow-xl">
                   <span className="inline-block px-2 py-1 bg-yellow-400 text-[10px] font-black rounded-md">20% OFF</span>
                   <h3 className="font-black text-xs text-[#1A1A1A]">For All Cosmetic Product</h3>
                   <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg">Claim discount</button>
               </div>
            </div>
         </div>

         <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-end justify-center pointer-events-none">
            <img 
               src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop" 
               className="h-[110%] object-cover object-center translate-y-10" 
               alt="Shopping Hero" 
            />
         </div>
      </div>

      {/* ── TRENDING CATEGORIES (NOW SHOPS) 85% ── */}
      <section className="w-[85%] mx-auto py-24 space-y-12">
         <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black text-[#1A1A1A]">Explore Our Elite Boutiques</h2>
            <Link href="#" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-all">
               View all sellers <ArrowRight size={16} />
            </Link>
         </div>

         <div className="grid grid-cols-12 gap-8 h-[600px]">
            {shops.length > 0 ? (
               <>
                  {/* Main Shop - Large Slot */}
                  {shops[0] && (
                     <Link href={`/${shops[0].slug}`} className="col-span-12 md:col-span-4 bg-[#1A1A1A] rounded-[3rem] p-10 flex flex-col justify-between group overflow-hidden relative shadow-2xl">
                        <div className="relative z-10">
                           <span className="px-4 py-2 bg-white/10 text-white text-[10px] font-bold rounded-full backdrop-blur-md">Premier Partner</span>
                           <h3 className="text-4xl font-black text-white mt-6 leading-tight" style={{ fontFamily: "var(--font-cormorant, serif)" }}>{shops[0].name}</h3>
                        </div>
                        <div className="relative z-10">
                           <button className="bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-bold shadow-2xl shadow-blue-600/30">Visit Boutique →</button>
                        </div>
                        {shops[0].logo ? (
                           <img src={mediaUrl(shops[0].logo)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" alt={shops[0].name} />
                        ) : (
                           <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black opacity-60" />
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
                     </Link>
                  )}

                  {/* Middle Section Stack - 2 Shops */}
                  <div className="col-span-12 md:col-span-5 grid grid-rows-2 gap-8">
                     {shops[1] && (
                        <Link href={`/${shops[1].slug}`} className="bg-white border border-gray-100 rounded-[3rem] p-10 flex items-center justify-between shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                           <div className="space-y-6 relative z-10 w-2/3">
                              <h3 className="text-2xl font-black text-[#1A1A1A] leading-tight" style={{ fontFamily: "var(--font-cormorant, serif)" }}>{shops[1].name}</h3>
                              <p className="text-xs text-gray-400 line-clamp-1">{shops[1].description || 'Premium curated collection'}</p>
                              <button className="bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-bold">Explore Collection →</button>
                           </div>
                           <div className="w-1/3 aspect-square relative z-10 flex items-center justify-center">
                              {shops[1].logo ? (
                                 <img src={mediaUrl(shops[1].logo)} className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-700" alt={shops[1].name} />
                              ) : (
                                 <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-3xl font-black text-gray-200">{shops[1].name[0]}</div>
                              )}
                           </div>
                        </Link>
                     )}
                     {shops[2] && (
                        <Link href={`/${shops[2].slug}`} className="bg-[#EDEFF1] rounded-[3rem] p-10 flex items-center justify-between shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                           <div className="space-y-6 relative z-10 w-2/3">
                              <h3 className="text-2xc font-black text-[#1A1A1A] leading-tight" style={{ fontFamily: "var(--font-cormorant, serif)" }}>{shops[2].name}</h3>
                              <p className="text-xs text-gray-400 line-clamp-1">{shops[2].description || 'Handcrafted Excellence'}</p>
                              <button className="bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-bold">Explore Collection →</button>
                           </div>
                           <div className="w-1/3 relative z-10 flex items-center justify-center">
                              {shops[2].logo ? (
                                 <img src={mediaUrl(shops[2].logo)} className="w-32 h-full object-cover group-hover:rotate-6 transition-transform duration-700" alt={shops[2].name} />
                              ) : (
                                 <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center text-3xl font-black text-white">{shops[2].name[0]}</div>
                              )}
                           </div>
                        </Link>
                     )}
                  </div>

                  {/* Side Section - 1 Shop */}
                  {shops[3] && (
                     <Link href={`/${shops[3].slug}`} className="col-span-12 md:col-span-3 bg-blue-600 rounded-[3rem] p-10 flex flex-col group relative overflow-hidden shadow-2xl shadow-blue-600/20">
                        <div className="relative z-10">
                           <span className="px-4 py-2 bg-white/20 text-white text-[10px] font-black rounded-full">New Arrival</span>
                           <h3 className="text-3xl font-black text-white mt-6 leading-tight" style={{ fontFamily: "var(--font-cormorant, serif)" }}>{shops[3].name}</h3>
                        </div>
                        <div className="mt-auto relative z-10">
                           <button className="bg-white text-blue-600 px-8 py-3 rounded-xl text-xs font-bold shadow-2xl">Visit Hub →</button>
                        </div>
                        {shops[3].logo ? (
                           <img src={mediaUrl(shops[3].logo)} className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[120%] object-contain opacity-20 group-hover:scale-110 transition-transform duration-1000" alt={shops[3].name} />
                        ) : (
                           <div className="absolute inset-0 bg-white/5" />
                        )}
                     </Link>
                  )}
               </>
            ) : (
               <div className="col-span-12 flex items-center justify-center border-4 border-dashed border-gray-100 rounded-[3rem] py-40">
                  <p className="text-2xl font-black text-gray-200 uppercase tracking-widest italic">Curating Boutiques...</p>
               </div>
            )}
         </div>
      </section>

      {/* ── PRODUCT OF THE MONTH 85% ── */}
      <section id="products" className="w-[85%] mx-auto py-24 space-y-16">
         <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black text-[#1A1A1A]">Product of The Month</h2>
            <Link href="#" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-all">
               View all <ArrowRight size={16} />
            </Link>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {products.slice(0, 8).map((product) => (
               <div 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all group flex flex-col cursor-pointer border border-gray-50"
               >
                  <div className="aspect-square relative bg-gray-50 p-6 flex items-center justify-center">
                     <img src={mediaUrl(product.images?.[0])} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                     <div className="absolute top-6 left-6 px-3 py-1 bg-[#FFEB3B] text-[9px] font-black uppercase tracking-widest rounded-md shadow-sm">Popular</div>
                      <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                         <button onClick={(e) => { e.stopPropagation(); try { const w = JSON.parse(localStorage.getItem("kurthi_wishlist") || "[]"); if (!w.some((x:any) => x.id === product.id)) { w.push({ id: product.id, name: product.name, price: product.price, original: product.mrp, imgClass: product.img_class, images: product.images, tag: product.tag }); localStorage.setItem("kurthi_wishlist", JSON.stringify(w)); alert("Added to wishlist! ❤️"); } else { alert("Already in wishlist!"); } } catch {} }} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:text-red-500 transition-colors"><Heart size={18} /></button>
                         <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:text-blue-600 transition-colors"><ShoppingCart size={18} /></button>
                      </div>
                  </div>
                  <div className="p-8 space-y-4">
                     <div className="space-y-1">
                        <h4 className="text-xl font-black text-[#1A1A1A] line-clamp-1 leading-tight">{product.name}</h4>
                        <p className="text-sm font-black text-blue-600">₹{parseFloat(product.price).toLocaleString()}</p>
                     </div>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                         Buy now
                      </button>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* ── PRODUCT DETAIL MODAL ── */}
      {selectedProduct && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-500" onClick={() => setSelectedProduct(null)}>
            <div className="bg-white w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in slide-in-from-bottom-10 duration-700" onClick={e => e.stopPropagation()}>
               <button 
                  onClick={() => setSelectedProduct(null)} 
                  className="absolute top-8 right-8 z-20 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shadow-xl hover:rotate-90 transition-all text-gray-400 hover:text-red-500"
               >
                  <X size={24} />
               </button>

               {/* Image Gallery */}
               <div className="w-full md:w-1/2 bg-gray-50 flex flex-col border-b md:border-b-0 md:border-r border-gray-100">
                  <div className="flex-1 p-12 flex items-center justify-center relative group min-h-[400px]">
                     <img
                         src={mediaUrl(activeImage) || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop"}
                         alt={selectedProduct.name}
                         className="w-full h-full max-h-[500px] object-contain mix-blend-multiply transition-all duration-700"
                      />
                  </div>
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="p-8 border-t border-gray-200/50 bg-white">
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                         {selectedProduct.images.map((img: string, i: number) => (
                           <button 
                             key={i} 
                             onClick={() => setActiveImage(img)}
                             className={`w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden border-2 transition-all p-2 bg-gray-50 ${activeImage === img ? 'border-blue-600 shadow-md scale-105' : 'border-transparent'}`}
                           >
                             <img src={mediaUrl(img)} className="w-full h-full object-contain mix-blend-multiply" alt={`Thumbnail ${i}`} />
                           </button>
                         ))}
                      </div>
                    </div>
                  )}
               </div>

               {/* Content */}
               <div className="w-full md:w-1/2 overflow-y-auto p-12 md:p-16 space-y-10 custom-scrollbar">
                  <div className="space-y-4">
                     <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">{selectedProduct.category}</span>
                     <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] leading-tight">
                        {selectedProduct.name}
                     </h2>
                     <div className="flex items-center gap-4">
                        <span className="text-3xl font-black text-blue-600">₹{parseFloat(selectedProduct.price).toLocaleString()}</span>
                        {parseFloat(selectedProduct.mrp) > parseFloat(selectedProduct.price) && (
                           <div className="flex items-center gap-2">
                              <span className="text-lg text-gray-300 line-through">₹{parseFloat(selectedProduct.mrp).toLocaleString()}</span>
                              <span className="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                 {Math.round((1 - parseFloat(selectedProduct.price)/parseFloat(selectedProduct.mrp)) * 100)}% OFF
                              </span>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Product Description</h4>
                     <p className="text-gray-500 leading-relaxed text-sm">
                        {selectedProduct.description || "Premium quality product sourced from verified sellers in Vygron Hub. Experience ultimate comfort and superior design language with every purchase."}
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-100">
                     <div className="space-y-2">
                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Boutique</span>
                        <p className="font-bold text-[#1A1A1A] text-sm">{selectedProduct.shop_name || "Vygron Elite"}</p>
                     </div>
                     <div className="space-y-2 text-right">
                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery</span>
                        <p className="font-bold text-green-600 text-sm">Express Available</p>
                     </div>
                  </div>

                  <div className="pt-10 flex flex-col sm:flex-row gap-4">
                     <button 
                        onClick={() => addToCart(selectedProduct)}
                        className="flex-[2] py-6 bg-blue-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3"
                     >
                        <ShoppingBag size={18} /> Add to Cart
                     </button>
                     <Link href={`/${selectedProduct.shop_slug || 'shop'}`} className="flex-1 py-6 bg-gray-50 text-[#1A1A1A] rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] text-center">
                        Visit Shop
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      )}

      <Footer />
    </div>
  );
}
