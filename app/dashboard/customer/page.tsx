"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, Bell, ShoppingCart, User, ShoppingBag, Heart, LogOut, Package, ChevronRight, Edit3, Plus
} from "lucide-react";
import { 
  getUserProfile, 
  getMyOrders, 
  orderFromAPI,
  clearUserToken
} from "@/lib/api";

type OrderStatus = "placed" | "confirmed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

interface Order {
  id: string;
  date: string;
  items: any[];
  total: number;
  status: OrderStatus;
  payMethod: string;
}

export default function CustomerDashboard() {
  const [tab, setTab] = useState<"overview" | "orders" | "wishlist" | "addresses">("overview");
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t && ["overview", "orders", "wishlist", "addresses"].includes(t)) {
      setTab(t as any);
    }

    try {
      const saved = localStorage.getItem("vygron_cart");
      if (saved) setCartCount(JSON.parse(saved).reduce((sum: any, item: any) => sum + item.qty, 0));
    } catch {}
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const prof = await getUserProfile();
      setProfile(prof);

      const rawOrders = await getMyOrders();
      const orderList = Array.isArray(rawOrders) ? rawOrders : (rawOrders as any).results || [];
      const mapped = orderList.map((o: any) => {
        const converted = orderFromAPI(o);
        return {
          id: converted.id,
          date: converted.date,
          items: converted.items,
          total: converted.total,
          status: converted.status as OrderStatus,
          payMethod: converted.payMethod
        };
      });
      setOrders(mapped);
    } catch (err: any) {
      if (err.message.includes("401")) window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#EDEFF1]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

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
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 pl-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
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
                 <Link href="/cart" className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative block">
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                       <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">
                          {cartCount}
                       </span>
                    )}
                 </Link>
              </div>
           </div>
        </div>
      </nav>

      {/* ── ALIGN WITH NAVBAR COMPONENT ── */}
      <div className="w-[85%] mx-auto py-8 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Sidebar (Flipkart Style) */}
        <aside className="w-full lg:w-[280px] flex flex-col gap-4 flex-shrink-0">
          
          {/* Hello Card */}
          <div className="bg-white p-4 rounded bg-white shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
                {profile?.name?.charAt(0) || "V"}
             </div>
             <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Hello,</p>
                <h2 className="text-sm font-bold text-[#1A1A1A] max-w-[150px] truncate">{profile?.name || "Vygron User"}</h2>
             </div>
          </div>
          
          {/* Nav Menu Card */}
          <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-50">
             
             {/* MY ORDERS */}
             <div className="border-b border-gray-100">
                <button onClick={() => setTab("orders")} className="flex items-center gap-4 w-full p-4 text-left font-bold text-[#1A1A1A] hover:bg-gray-50 hover:text-blue-600 transition-colors">
                   <ShoppingBag size={20} className="text-blue-600" />
                   <span className="text-sm text-gray-500 font-bold tracking-wide">MY ORDERS</span>
                   <ChevronRight size={16} className="ml-auto text-gray-400" />
                </button>
             </div>
             
             {/* ACCOUNT SETTINGS */}
             <div className="border-b border-gray-100">
                <div className="px-4 py-4 flex items-center gap-4 font-bold text-gray-500">
                   <User size={20} className="text-blue-600" />
                   <span className="text-sm text-gray-500 tracking-wide uppercase">Account Settings</span>
                </div>
                <div className="flex flex-col pb-2">
                   <button onClick={() => setTab("overview")} className={`pl-[3.25rem] pr-4 py-3 text-left text-sm font-semibold transition-colors ${tab === "overview" ? "bg-blue-50/50 text-blue-600" : "text-[#1A1A1A] hover:text-blue-600 hover:bg-gray-50"}`}>Profile Information</button>
                   <button onClick={() => setTab("addresses")} className={`pl-[3.25rem] pr-4 py-3 text-left text-sm font-semibold transition-colors ${tab === "addresses" ? "bg-blue-50/50 text-blue-600" : "text-[#1A1A1A] hover:text-blue-600 hover:bg-gray-50"}`}>Manage Addresses</button>
                </div>
             </div>

             {/* MY STUFF */}
             <div className="border-b border-gray-100">
                <div className="px-4 py-4 flex items-center gap-4 font-bold text-gray-500">
                   <Heart size={20} className="text-blue-600" />
                   <span className="text-sm text-gray-500 tracking-wide uppercase">My Stuff</span>
                </div>
                <div className="flex flex-col pb-2">
                   <button onClick={() => setTab("wishlist")} className={`pl-[3.25rem] pr-4 py-3 text-left text-sm font-semibold transition-colors ${tab === "wishlist" ? "bg-blue-50/50 text-blue-600" : "text-[#1A1A1A] hover:text-blue-600 hover:bg-gray-50"}`}>My Wishlist</button>
                </div>
             </div>

             {/* LOGOUT */}
             <div className="">
                <button onClick={() => { clearUserToken(); window.location.href = "/login"; }} className="flex items-center gap-4 w-full p-4 text-left font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                   <LogOut size={20} className="text-gray-400" />
                   <span className="text-sm uppercase tracking-wide">Logout</span>
                </button>
             </div>

          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-12">
          
          {tab === "overview" && (
            <div className="bg-white rounded shadow-sm p-8 min-h-[500px] animate-in fade-in duration-300">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">Personal Information</h3>
                  <button className="text-sm font-medium text-blue-600 hover:underline">Edit</button>
               </div>
               
               <div className="max-w-md space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">First Name</label>
                        <input type="text" value={profile?.name?.split(' ')[0] || ''} disabled className="w-full bg-gray-50 px-4 py-3 rounded text-sm font-semibold outline-none cursor-not-allowed text-gray-600" />
                     </div>
                     <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Last Name</label>
                        <input type="text" value={profile?.name?.split(' ')[1] || ''} disabled className="w-full bg-gray-50 px-4 py-3 rounded text-sm font-semibold outline-none cursor-not-allowed text-gray-600" />
                     </div>
                  </div>

                  <div className="pt-4 mt-6">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-[#1A1A1A]">Email Address</h3>
                        <button className="text-sm font-bold text-blue-600 hover:underline">Edit</button>
                     </div>
                     <input type="text" value={profile?.email || ''} disabled className="w-full bg-gray-50 px-4 py-3 rounded text-sm font-semibold outline-none cursor-not-allowed text-gray-600" />
                  </div>

                  <div className="pt-4 mt-6">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-[#1A1A1A]">Mobile Number</h3>
                        <button className="text-sm font-bold text-blue-600 hover:underline">Edit</button>
                     </div>
                     <input type="text" value={profile?.phone || 'Not added'} disabled className="w-full bg-gray-50 px-4 py-3 rounded text-sm font-semibold outline-none cursor-not-allowed text-gray-600" />
                  </div>
               </div>

               {/* Quick Links */}
               <div className="mt-12 space-y-4">
                  <h3 className="text-sm font-bold text-[#1A1A1A]">FAQs</h3>
                  <div className="space-y-2">
                     <p className="text-sm text-[#1A1A1A] font-bold">What happens when I update my email address (or mobile number)?</p>
                     <p className="text-sm text-[#1A1A1A] leading-relaxed">Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).</p>
                  </div>
               </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="bg-white rounded shadow-sm min-h-[500px] animate-in fade-in duration-300">
               {/* Header Search for Orders (Flipkart style) */}
               <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#1A1A1A] px-2">My Orders</h2>
                  <div className="relative w-72 h-10">
                     <input type="text" placeholder="Search your orders here" className="w-full h-full pl-4 pr-10 border border-gray-200 rounded text-sm outline-none focus:border-blue-500" />
                     <div className="absolute right-0 top-0 bottom-0 px-3 bg-blue-600 text-white rounded-r flex items-center justify-center cursor-pointer">
                        <Search size={16} />
                     </div>
                  </div>
               </div>

               {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                     <div className="w-48 mb-6 opacity-30 text-8xl">📦</div>
                     <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">You have no orders</h3>
                     <p className="text-sm text-gray-500 mb-6">Looks like you haven't placed an order within the last few months.</p>
                     <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-[3px] text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors uppercase tracking-wide">Start Shopping</Link>
                  </div>
               ) : (
                  <div className="w-full divide-y divide-gray-100">
                     {orders.map((order) => (
                        <div key={order.id} className="p-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 hover:bg-blue-50/20 cursor-pointer transition-colors group">
                           <div className="flex items-center gap-6 flex-1 w-full">
                              {/* Order Image placeholder */}
                              <div className="w-20 h-20 bg-gray-50 rounded border border-gray-100 overflow-hidden flex items-center justify-center font-bold text-gray-200 text-2xl shrink-0">
                                 📦
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm font-bold text-[#1A1A1A] mb-1 line-clamp-1">{order.items[0]?.name || "Vygron Hub Package"} {order.items.length > 1 ? `+ ${order.items.length - 1} more items` : ""}</p>
                                 <p className="text-xs text-gray-500 mb-1">Color: Assorted • Size: Mixed</p>
                                 <p className="text-xs text-gray-500">Seller: <span className="font-bold text-blue-600">{order.items[0]?.shop_name || 'Vygron Premium'}</span></p>
                              </div>
                           </div>
                           
                           <div className="text-left sm:text-right w-full sm:w-24 shrink-0">
                              <p className="text-sm font-bold text-[#1A1A1A]">₹{order.total.toLocaleString()}</p>
                           </div>

                           <div className="w-full sm:w-64 shrink-0 pl-0 sm:pl-6">
                              <div className="flex items-center gap-2">
                                 <div className={`w-2.5 h-2.5 rounded-full ${
                                    order.status === 'delivered' ? 'bg-green-500' : 
                                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500' // Using orange/green based
                                 }`} />
                                 <p className="text-sm font-bold text-[#1A1A1A]">
                                    {order.status === 'delivered' ? 'Delivered on Oct 24' : 
                                     order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                 </p>
                              </div>
                              <p className="text-xs text-[#1A1A1A] mt-1 pl-4">Your item {order.status === 'delivered' ? 'has been delivered' : 'is on its way'}</p>
                              {order.status === 'delivered' && (
                                 <p className="text-xs font-bold text-blue-600 mt-2 pl-4 flex items-center gap-1">★ Rate & Review Product</p>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
          )}

          {tab === "wishlist" && (
            <div className="bg-white rounded shadow-sm min-h-[500px] animate-in fade-in duration-300">
               <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-[#1A1A1A]">My Wishlist (0)</h2>
               </div>
               <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Heart size={64} strokeWidth={1} className="text-gray-300 mb-6" />
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Empty Wishlist</h3>
                  <p className="text-sm text-gray-500 mb-6">You have no items in your wishlist. Start adding!</p>
               </div>
            </div>
          )}

          {tab === "addresses" && (
            <div className="bg-white rounded shadow-sm min-h-[500px] animate-in fade-in duration-300">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#1A1A1A]">Manage Addresses</h2>
               </div>
               <div className="p-6">
                  <button className="w-full py-4 border border-gray-200 rounded flex items-center gap-2 px-6 text-blue-600 font-bold hover:bg-blue-50/50 transition-colors mb-6">
                     <Plus size={18} /> ADD A NEW ADDRESS
                  </button>

                  {/* Mock Address */}
                  <div className="border border-gray-200 rounded p-5 relative hover:shadow-sm transition-shadow">
                     <button className="absolute right-4 top-4 text-gray-400 hover:text-blue-600 p-1"><Edit3 size={16} /></button>
                     <div className="flex items-center gap-3 mb-3">
                        <span className="bg-gray-100 text-[10px] font-bold text-gray-500 px-2 py-0.5 rounded-[3px]">HOME</span>
                     </div>
                     <p className="text-sm font-bold text-[#1A1A1A] mb-2">{profile?.name} <span className="ml-4 font-bold text-[#1A1A1A]">{profile?.phone || "0000000000"}</span></p>
                     <p className="text-sm text-[#1A1A1A] leading-relaxed max-w-md">123 Vygron Street, Tech Park Area, Block B2, Silicon Valley, CA - 94000</p>
                  </div>
               </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
