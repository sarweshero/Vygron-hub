"use client";
// [shopSlug]/page.tsx – Vygron Hub | Premium Boutique Experience

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { getShopDetails, clearUserToken, getCachedUserInfo, mediaUrl } from "@/lib/api";
import Link from "next/link";
import Footer from "@/app/components/Footer";
import { 
  ShoppingBag, X, Plus, Minus, Search, Bell, ShoppingCart, 
  User, LayoutDashboard, Package, Heart, Settings, LogOut, ArrowRight, Star
} from "lucide-react";

export default function ShopPage() {
  const params = useParams();
  const slug = params.shopSlug as string;
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (slug) {
      getShopDetails(slug)
        .then(setShop)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  useEffect(() => {
    // Load global cart + user
    try {
      const saved = localStorage.getItem("vygron_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {}
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
      shop_slug: slug,
      shop_name: shop.name
    };

    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, itemToAdd]);
    }
    alert(`Added to your Vygron Hub cart via ${shop.name}! ✨`);
  };

  const addToWishlist = (product: any) => {
    try {
      const stored = localStorage.getItem("kurthi_wishlist");
      const wishlist: any[] = stored ? JSON.parse(stored) : [];
      if (wishlist.some((w: any) => w.id === product.id)) {
        alert("Already in your wishlist!");
        return;
      }
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        original: product.mrp,
        imgClass: product.img_class || "product-img-1",
        images: product.images || [],
        tag: product.tag
      });
      localStorage.setItem("kurthi_wishlist", JSON.stringify(wishlist));
      alert("Added to your wishlist! ❤️");
    } catch {}
  };

  const handleLogout = () => {
    clearUserToken();
    window.location.reload();
  };

  useEffect(() => {
    if (selectedProduct && selectedProduct.images?.length > 0) {
      setActiveImage(selectedProduct.images[0]);
    }
  }, [selectedProduct]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-white">
      <h1 className="text-4xl font-black mb-4">404 - Shop Not Found</h1>
      <Link href="/" className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs">Explore Marketplace</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#333] font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ── NAVBAR 85% ── */}
      <nav className="w-[85%] mx-auto py-6 flex items-center justify-between">
         <div className="flex items-center gap-12 flex-1">
            <Link href="/" className="text-2xl font-black tracking-tighter text-[#1A1A1A] flex items-center gap-3">
               <span>vygron<span className="text-blue-600">hub</span></span>
               <span className="text-gray-200 font-light ml-1 text-3xl">|</span>
               <span className="text-xl font-bold tracking-tight text-gray-400 capitalize">{shop.name}</span>
            </Link>
            
            <div className="flex-1 max-w-xl relative">
               <input 
                  type="text" 
                  placeholder={`Search in ${shop.name}...`}
                  className="w-full bg-gray-50 border border-gray-100 rounded-full py-3 px-6 pl-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
               />
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
         </div>

         <div className="flex items-center gap-8 ml-8">
            <div className="flex items-center gap-4">
               <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative">
                  <Bell size={20} />
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
                      className="bg-blue-600 text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer border-none"
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
                           <Link href="/dashboard/customer" className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors no-underline">
                              <LayoutDashboard size={16} /> Dashboard
                           </Link>
                           <Link href="/dashboard/customer?tab=orders" className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors no-underline">
                              <Package size={16} /> My Orders
                           </Link>
                           <Link href="/dashboard/customer?tab=wishlist" className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors no-underline">
                              <Heart size={16} /> Wishlist
                           </Link>
                           <button onClick={handleLogout} className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors w-full text-left bg-transparent border-none cursor-pointer">
                              <LogOut size={16} /> Sign Out
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/login" className="bg-blue-600 text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all uppercase tracking-widest no-underline">
                     Login
                  </Link>
                )}
            </div>
         </div>
      </nav>

      {/* ── SHOP HEADER SUBNAV 85% ── */}
      <div className="w-[85%] mx-auto py-4 border-t border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                <Star size={12} className="text-blue-600 fill-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Verified Boutique</span>
            </div>
         </div>
         <div className="flex items-center gap-8 text-sm font-bold text-gray-400">
            <Link href="/" className="hover:text-blue-600 no-underline transition-colors">Marketplace</Link>
            <span className="text-gray-200">|</span>
            <span className="text-blue-600">{shop.name} Home</span>
            <Link href="#collection" className="hover:text-blue-600 no-underline transition-colors">Full Collection</Link>
         </div>
      </div>

      {/* ── HERO SECTION 85% ── */}
      <div className="w-[85%] mx-auto mt-6 bg-[#EDEFF1] rounded-[4rem] overflow-hidden relative min-h-[550px] flex items-center px-16">
         <div className="flex-1 space-y-8 py-20 relative z-10">
            <div className="space-y-4">
               <span className="text-blue-600 font-black uppercase tracking-[0.5em] text-[11px]">Boutique Spotlight</span>
               <div className="space-y-1">
                  <h2 className="text-5xl font-black tracking-tighter uppercase mb-[-5px] bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                     {shop.name}
                  </h2>
                  <h1 className="text-8xl font-black text-[#1A1A1A] leading-[0.9] max-w-xl tracking-tighter">
                     {shop.hero_heading || "Taste the Finest"}
                  </h1>
               </div>
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed text-lg font-medium opacity-80">
               Experience the curated excellence of <span className="text-[#1A1A1A] font-black">{shop.name}</span>. {shop.description || "The destination for premium curated essentials, where quality meets unparalleled design."}
            </p>
            
            <div className="flex gap-4 pt-6">
               <Link href="#collection" className="bg-blue-600 text-white px-12 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all no-underline">
                  Shop Collection
               </Link>
               <div className="bg-white p-6 rounded-[2rem] w-64 flex items-center gap-4 shadow-xl border border-white">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-black text-xl">
                      %
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Limited Offer</p>
                     <p className="font-black text-[#1A1A1A] text-sm">Festive Discounts Active</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-center justify-center">
            <div className="relative group p-12">
               <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-1000" />
               {shop.logo ? (
                 <div className="relative w-80 h-80 bg-white rounded-[4rem] p-16 shadow-[0_40px_100px_rgba(0,0,0,0.06)] flex items-center justify-center transform rotate-3 hover:rotate-0 transition-all duration-700 border border-white">
                    <img src={mediaUrl(shop.logo)} alt={shop.name} className="w-full h-full object-contain" />
                 </div>
               ) : (
                 <div className="relative w-80 h-80 bg-white rounded-[4rem] flex items-center justify-center text-9xl font-black text-blue-600 shadow-2xl rotate-3">
                    {shop.name[0]}
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* ── COLLECTION 85% ── */}
      <section id="collection" className="w-[85%] mx-auto py-32 space-y-20">
         <div className="flex items-center justify-between">
            <div className="space-y-4">
               <h2 className="text-5xl font-black text-[#1A1A1A] tracking-tighter">Shop the Collection</h2>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Exclusively at {shop.name}</p>
            </div>
            <div className="flex gap-4">
               <button className="px-8 py-3 bg-gray-100 rounded-full text-xs font-black text-gray-500 border border-gray-200">Sort: Popularity</button>
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {(shop.products || []).map((product: any) => (
               <div 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-[0_40px_100px_rgba(0,0,0,0.07)] transition-all group flex flex-col cursor-pointer border border-gray-50 border-b-4 border-b-transparent hover:border-b-blue-600"
               >
                  <div className="aspect-[4/5] relative bg-gray-50/50 p-10 flex items-center justify-center">
                     <img src={mediaUrl(product.images?.[0]) || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop"} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                     <div className="absolute top-8 left-8 px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">New Arrival</div>
                     <div className="absolute top-8 right-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl hover:text-red-500 transition-colors"><Heart size={20} /></button>
                        <button 
                           onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                           className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl hover:text-blue-600 transition-colors"
                        >
                           <ShoppingCart size={20} />
                        </button>
                     </div>
                  </div>
                  <div className="p-10 space-y-6">
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category || 'General'}</p>
                        <h4 className="text-2xl font-black text-[#1A1A1A] line-clamp-2 leading-[1.2]">{product.name}</h4>
                        <div className="flex items-center gap-3 pt-2">
                           <span className="text-xl font-black text-blue-600">₹{parseFloat(product.price).toLocaleString()}</span>
                           {parseFloat(product.mrp) > parseFloat(product.price) && (
                              <span className="text-xs text-gray-300 line-through font-bold">₹{parseFloat(product.mrp).toLocaleString()}</span>
                           )}
                        </div>
                     </div>
                     <button className="w-full py-5 bg-gray-100 group-hover:bg-blue-600 group-hover:text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group-hover:shadow-blue-600/20 active:scale-95">
                        Quick View
                     </button>
                  </div>
               </div>
            ))}
         </div>

         {(!shop.products || shop.products.length === 0) && (
            <div className="text-center py-48 border-4 border-dashed border-gray-100 rounded-[4rem]">
               <h3 className="text-4xl font-black text-gray-200 italic uppercase tracking-widest">Coming Soon...</h3>
            </div>
         )}
      </section>

      {/* ── PRODUCT DETAIL MODAL ── */}
      {selectedProduct && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-2xl p-4 md:p-8 animate-in fade-in duration-500" onClick={() => setSelectedProduct(null)}>
            <div className="bg-white w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in slide-in-from-bottom-10 duration-700" onClick={e => e.stopPropagation()}>
               <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 z-20 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shadow-xl hover:rotate-90 transition-all text-gray-400 hover:text-red-500">
                  <X size={24} />
               </button>

               <div className="w-full md:w-1/2 bg-gray-50/50 flex flex-col border-b md:border-b-0 md:border-r border-gray-100">
                  <div className="flex-1 p-16 flex items-center justify-center relative min-h-[400px]">
                     <img src={mediaUrl(activeImage) || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop"} className="w-full h-full max-h-[500px] object-contain mix-blend-multiply" alt={selectedProduct.name} />
                  </div>
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="p-10 bg-white border-t border-gray-50">
                       <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                          {selectedProduct.images.map((img: string, i: number) => (
                            <button key={i} onClick={() => setActiveImage(img)} className={`w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden border-2 transition-all p-3 bg-gray-50 ${activeImage === img ? 'border-blue-600 shadow-xl scale-110' : 'border-transparent opacity-60'}`}>
                               <img src={mediaUrl(img)} className="w-full h-full object-contain mix-blend-multiply" alt={i.toString()} />
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
               </div>

               <div className="w-full md:w-1/2 overflow-y-auto p-12 md:p-20 space-y-12 custom-scrollbar bg-white">
                  <div className="space-y-6">
                     <span className="text-blue-600 font-black uppercase tracking-[0.4em] text-[11px] bg-blue-50 px-4 py-2 rounded-full">{selectedProduct.category || 'Curated'}</span>
                     <h2 className="text-5xl font-black text-[#1A1A1A] leading-[1.1] tracking-tighter">{selectedProduct.name}</h2>
                     <div className="flex items-center gap-6">
                        <span className="text-4xl font-black text-[#1A1A1A]">₹{parseFloat(selectedProduct.price).toLocaleString()}</span>
                        {parseFloat(selectedProduct.mrp) > parseFloat(selectedProduct.price) && (
                           <div className="flex items-center gap-3">
                              <span className="text-xl text-gray-300 line-through font-bold">₹{parseFloat(selectedProduct.mrp).toLocaleString()}</span>
                              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                                 {Math.round((1 - parseFloat(selectedProduct.price)/parseFloat(selectedProduct.mrp)) * 100)}% OFF
                              </span>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-100 pb-2">Description</h4>
                     <p className="text-gray-500 leading-relaxed text-lg font-medium opacity-80">{selectedProduct.description || "A masterfully curated piece from Vygron's elite collection. Hand-selected for those who demand excellence in every detail."}</p>
                  </div>

                  <div className="pt-12 flex flex-col sm:flex-row gap-6">
                     <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex-[3] py-7 bg-blue-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-4">
                        <ShoppingBag size={20} /> Add to Bag
                     </button>
                      <button onClick={() => { addToWishlist(selectedProduct); setSelectedProduct(null); }} className="flex-[2] py-7 border-2 border-gray-100 text-[#1A1A1A] rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-gray-50 transition-all">
                         Wishlist
                      </button>
                  </div>
                  
                  <div className="pt-10 flex items-center gap-6 opacity-40">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Premium Quality</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Support</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      <Footer />
    </div>
  );
}
