"use client";
// dashboard/shop/page.tsx – Vygron Hub | Shop Owner Dashboard Redesign

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, Bell, Settings as SettingsIcon, Plus, LayoutDashboard, 
  Package, ShoppingBag, MessageSquare, LogOut, ChevronRight, 
  Star, BarChart3, TrendingUp, Users, Wallet, CheckCircle2, Globe, Image as ImageIcon
} from "lucide-react";
import {
  getShopDashboardStats,
  getShopProducts,
  createShopProduct,
  updateShopProduct,
  deleteShopProduct,
  getUserProfile,
  changePassword,
  clearUserToken,
  mediaUrl,
  uploadImage
} from "@/lib/api";

type Tab = "dashboard" | "menu" | "orders" | "setting";

export default function ShopDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState<any>({
    name: "", price: "", mrp: "", stock: "", category: "Others", description: "", fabric: "",
    sizes: [] as string[], is_featured: false, is_new: false, is_bestseller: false,
    images: [] as string[], specifications: {}, tag: "", delivery_days: 5, color_hex: "#7b1e3a",
    img_class: "product-img-1"
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "" });
  const [passMsg, setPassMsg] = useState({ text: "", isError: false });
  const [shopSettings, setShopSettings] = useState({ 
    name: "", tagline: "", logo: "", banner: "", description: "", 
    hero_heading: "Quality You Can Trust",
    categories_heading: "Discover Our Collection",
    custom_categories: [] as string[], bg_color: "#ffffff",
    footer_address: "", footer_phone: "", footer_email: "" 
  });
  const [saveSettingsLoading, setSaveSettingsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const updateOrderStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingStatus(true);
    try {
      setStats((prev: any) => ({
        ...prev,
        recent_orders: prev.recent_orders.map((o: any) => 
          o.id === orderId ? { ...o, status: nextStatus } : o
        )
      }));
      setSelectedOrder((prev: any) => prev ? { ...prev, status: nextStatus } : null);
      alert(`Order ${orderId} has been marked as ${nextStatus}! 🚀`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const prof = await getUserProfile();
      if (prof.userType !== "shop_owner") {
        window.location.href = "/dashboard/customer";
        return;
      }
      setProfile(prof);

      const [sData, pData, shopRes] = await Promise.all([
        getShopDashboardStats(),
        getShopProducts(),
        import("@/lib/api").then(m => m.getShopDetails(prof.shopSlug || ""))
      ]);

      setStats(sData);
      setShopSettings({ 
        name: shopRes.name || "", 
        tagline: shopRes.tagline || "", 
        logo: shopRes.logo || "", 
        banner: shopRes.banner || "", 
        hero_heading: shopRes.hero_heading || "Taste the Finest",
        categories_heading: shopRes.categories_heading || "What we offer",
        description: shopRes.description || "",
        custom_categories: shopRes.custom_categories || [],
        bg_color: shopRes.bg_color || "#ffffff",
        footer_address: shopRes.footer_address || "",
        footer_phone: shopRes.footer_phone || "",
        footer_email: shopRes.footer_email || ""
      });
      const productList = Array.isArray(pData) ? pData : (pData as any).results || [];
      setProducts(productList);
    } catch (err: any) {
      if (err.message.includes("401")) window.location.href = "/login";
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  const handleAddProduct = async () => {
    if (!newProd.name || !newProd.price) return;
    setSubmitLoading(true);
    try {
      await createShopProduct({
        name: newProd.name,
        price: parseInt(newProd.price, 10) || 0,
        mrp: parseInt(newProd.mrp, 10) || 0,
        stock: parseInt(newProd.stock, 10) || 0,
        category: newProd.category,
        description: newProd.description,
        fabric: newProd.fabric,
        sizes: newProd.sizes || [],
        is_featured: newProd.is_featured || false,
        is_new: newProd.is_new || false,
        is_bestseller: newProd.is_bestseller || false,
        images: (newProd.images || []).filter((url: string) => url.trim() !== ""),
        specifications: newProd.specifications || {},
        tag: newProd.tag || "",
        delivery_days: newProd.delivery_days || 5,
        color_hex: newProd.color_hex || "#7b1e3a",
        img_class: newProd.img_class || "product-img-1"
      });
      setShowAddForm(false);
      setNewProd({ name: "", price: "", mrp: "", stock: "", category: "Others", description: "", fabric: "", sizes: [], is_featured: false, is_new: false, is_bestseller: false, images: [], specifications: {}, tag: "", delivery_days: 5, color_hex: "#7b1e3a", img_class: "product-img-1" });
      loadData();
    } catch (err) {
      alert("Failed to add product");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#EDEFF1]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#EDEFF1] font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ── SIDEBAR ── */}
      <aside className="w-80 bg-[#1A1A1A] flex flex-col pt-12 pb-10 px-8 sticky top-0 h-screen z-50">
        <div className="mb-16 flex items-center gap-4">
           <Link href="/" className="text-2xl font-black tracking-tighter text-white">
              vygron<span className="text-blue-600">hub</span>
           </Link>
        </div>

        <nav className="flex-1 space-y-3">
           <SidebarItem active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<LayoutDashboard size={22} />} label="Overview" />
           <SidebarItem active={tab === "menu"} onClick={() => setTab("menu")} icon={<Package size={22} />} label="Products" />
           <SidebarItem active={tab === "orders"} onClick={() => setTab("orders")} icon={<ShoppingBag size={22} />} label="Orders" />
           <SidebarItem active={tab === "setting"} onClick={() => setTab("setting")} icon={<SettingsIcon size={22} />} label="Shop Settings" />
        </nav>

        <div className="mt-10 pt-10 border-t border-white/5 space-y-6">
           <div className="bg-white/5 p-6 rounded-[2rem] space-y-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                 <TrendingUp size={20} />
              </div>
              <p className="text-xs font-bold text-white leading-relaxed">Scaling up? Get detailed analytics for your boutique.</p>
              <button className="w-full py-3 bg-white text-[#1A1A1A] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Upgrade Now</button>
           </div>
           
           <button 
              onClick={() => { clearUserToken(); window.location.href = "/login"; }}
              className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors pl-4"
           >
              <LogOut size={18} /> Logout
           </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="px-12 py-10 flex items-center justify-between sticky top-0 bg-[#EDEFF1]/80 backdrop-blur-xl z-40">
           <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#1A1A1A] capitalize">{tab === 'dashboard' ? 'Market Overview' : tab}</h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Business Dashboard / {tab}</p>
           </div>

           <div className="flex items-center gap-8">
              <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                 <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                 </button>
                 <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors">
                    <MessageSquare size={20} />
                 </button>
              </div>

              <div className="flex items-center gap-4 bg-white pl-4 pr-2 py-2 rounded-2xl shadow-sm border border-gray-100">
                 <div className="text-right">
                    <p className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider">{profile?.name || "Boutique Owner"}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Verified Seller</p>
                 </div>
                 <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center font-black text-blue-600">
                    {profile?.logo ? <img src={mediaUrl(profile.logo)} className="w-full h-full object-cover" /> : profile?.name?.[0]}
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 px-12 pb-20 space-y-10">
           
           {/* OVERVIEW TAB */}
           {tab === "dashboard" && stats && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard icon={<Wallet className="text-blue-600" />} label="Total Revenue" value={`₹${stats.total_revenue.toLocaleString()}`} trend="+12.5%" />
                    <StatCard icon={<ShoppingBag className="text-purple-600" />} label="Total Orders" value={stats.total_orders} trend="+5.2%" />
                    <StatCard icon={<Package className="text-orange-600" />} label="Active Stock" value={stats.total_products} trend="Stable" />
                    <StatCard icon={<Users className="text-green-600" />} label="Store Visited" value="2.4k" trend="+18.4%" />
                 </div>

                 <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                       <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black text-[#1A1A1A]">Recent Orders</h3>
                          <button onClick={() => setTab("orders")} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
                       </div>
                       <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm">
                          <table className="w-full text-left">
                             <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                   <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Order</th>
                                   <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                   <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                   <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50">
                                {(stats.recent_orders || []).slice(0, 5).map((order: any) => (
                                   <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                      <td className="px-8 py-5 text-xs font-bold text-[#1A1A1A]">#{order.id}</td>
                                      <td className="px-8 py-5 text-xs text-gray-600 font-medium">{order.customer || 'Guest'}</td>
                                      <td className="px-8 py-5 text-xs font-bold text-blue-600">₹{order.total}</td>
                                      <td className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-blue-500">{order.status || 'Received'}</td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                    <div className="bg-[#1A1A1A] rounded-[3rem] p-10 flex flex-col justify-between overflow-hidden relative shadow-2xl">
                       <div className="relative z-10 space-y-6">
                          <h4 className="text-2xl font-black text-white leading-tight">Sync your inventory with Vygron Hub Global.</h4>
                          <p className="text-xs text-white/40 leading-relaxed">Reach millions of elite shoppers worldwide.</p>
                          <button className="bg-blue-600 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/30">Boost Listing</button>
                       </div>
                       <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-blue-600/10 rounded-full blur-[40px]" />
                    </div>
                 </div>
              </div>
           )}

           {/* PRODUCTS TAB */}
           {tab === "menu" && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="relative flex-1 max-w-lg">
                       <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input placeholder="Search in your boutique..." className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-16 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 flex items-center gap-3 transition-all hover:-translate-y-1">
                       <Plus size={18} /> New Masterpiece
                    </button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10">
                    {products.map(p => (
                       <ProductGridCard key={p.id} product={p} showActions onDelete={() => loadData()} />
                    ))}
                 </div>
              </div>
           )}

           {/* ORDERS TAB */}
           {tab === "orders" && stats && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="flex items-center justify-between">
                    <div className="relative w-96">
                       <input 
                          type="text" 
                          placeholder="Search Order ID, Customer..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-full py-4 px-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                       />
                       <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    <div className="bg-white px-6 py-3 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-blue-600">
                       Real-time Updates Active
                    </div>
                 </div>
                 <div className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Details</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Current Status</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {((stats.recent_orders || []).filter((o: any) => 
                             o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (o.customer || '').toLowerCase().includes(searchTerm.toLowerCase())
                          )).length > 0 ? (stats.recent_orders || []).filter((o: any) => 
                             o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (o.customer || '').toLowerCase().includes(searchTerm.toLowerCase())
                          ).map((order: any) => (
                             <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                <td className="px-10 py-8 text-sm font-black text-[#1A1A1A]">#{order.id}</td>
                                <td className="px-10 py-8">
                                   <p className="text-sm font-bold text-[#1A1A1A]">{order.customer || 'Guest User'}</p>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.phone || 'Contact not provided'}</p>
                                </td>
                                <td className="px-10 py-8 text-sm font-black text-blue-600">₹{order.total?.toLocaleString()}</td>
                                <td className="px-10 py-8">
                                   <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">{order.status || 'Order Received'}</span>
                                   </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                   <button className="px-6 py-2 bg-blue-600/10 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Details</button>
                                </td>
                             </tr>
                          )) : (
                             <tr>
                                <td colSpan={5} className="px-10 py-32 text-center opacity-20 font-black uppercase italic tracking-[0.2em]">No transactions recorded yet</td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}

           {/* SETTINGS TAB */}
           {tab === "setting" && (
              <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                 <section className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-gray-100 space-y-12 relative overflow-hidden">
                    <h2 className="text-3xl font-black text-[#1A1A1A]">Boutique Identity</h2>
                    <div className="grid md:grid-cols-2 gap-10">
                       <FormGroup label="Official Shop Name" value={shopSettings.name} onChange={(v: string) => setShopSettings({...shopSettings, name:v})} disabled={stats?.is_approved} />
                       <FormGroup label="Brand Tagline" value={shopSettings.tagline} onChange={(v: string) => setShopSettings({...shopSettings, tagline:v})} placeholder="The essence of excellence" />
                       <div className="md:col-span-2">
                          <FormGroup label="Marketplace Narrative (About Us)" value={shopSettings.description} onChange={(v: string) => setShopSettings({...shopSettings, description:v})} type="textarea" placeholder="Tell the story behind your brand..." />
                       </div>
                    </div>
                 </section>
                 <div className="sticky bottom-10 z-30 flex gap-6">
                    <button 
                       onClick={async () => {
                          setSaveSettingsLoading(true);
                          try {
                             const { updateShopSettings } = await import("@/lib/api");
                             await updateShopSettings(shopSettings);
                             alert("Boutique Identity preserved! ✨");
                          } catch (err) { alert("Failed to save."); } finally { setSaveSettingsLoading(false); }
                       }}
                       disabled={saveSettingsLoading}
                       className="flex-1 py-6 bg-blue-600 text-white rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50"
                    >
                       {saveSettingsLoading ? "Preserving..." : "Confirm All Changes"}
                    </button>
                 </div>
              </div>
           )}
        </div>
      </main>

      {/* ── ADD PRODUCT MODAL ── */}
      {showAddForm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 duration-500 custom-scrollbar">
               <div className="p-12 md:p-16 space-y-10">
                  <div className="flex items-center justify-between">
                     <h2 className="text-4xl font-black text-[#1A1A1A]">Curate Product</h2>
                     <button onClick={() => setShowAddForm(false)} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">✕</button>
                  </div>

                  {/* Row 1: Name + Category */}
                  <div className="grid md:grid-cols-2 gap-8">
                     <FormGroup label="Product Name" value={newProd.name} onChange={(v: string) => setNewProd({...newProd, name:v})} />
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Market Category</label>
                        <select
                           value={newProd.category}
                           onChange={e => setNewProd({...newProd, category: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-8 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                        >
                           {shopSettings.custom_categories.map(c => <option key={c} value={c}>{c}</option>)}
                           <option value="Womens Wear">Womens Wear</option>
                           <option value="Mens Wear">Mens Wear</option>
                           <option value="Electronics">Electronics</option>
                           <option value="Home & Living">Home & Living</option>
                           <option value="Others">Others</option>
                        </select>
                     </div>
                  </div>

                  {/* Row 2: Price, MRP, Stock, Delivery Days */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     <FormGroup label="Selling Price (₹)" value={newProd.price} onChange={(v: string) => setNewProd({...newProd, price:v})} type="number" />
                     <FormGroup label="MRP (₹)" value={newProd.mrp} onChange={(v: string) => setNewProd({...newProd, mrp:v})} type="number" />
                     <FormGroup label="Stock" value={newProd.stock} onChange={(v: string) => setNewProd({...newProd, stock:v})} type="number" />
                     <FormGroup label="Delivery Days" value={String(newProd.delivery_days)} onChange={(v: string) => setNewProd({...newProd, delivery_days: parseInt(v,10) || 5})} type="number" />
                  </div>

                  {/* Row 3: Fabric + Tag */}
                  <div className="grid md:grid-cols-2 gap-8">
                     <FormGroup label="Fabric / Material" value={newProd.fabric} onChange={(v: string) => setNewProd({...newProd, fabric:v})} placeholder="e.g. Cotton, Silk, Polyester" />
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Tag</label>
                        <div className="flex gap-3">
                           {["", "New", "Hot", "Sale", "Luxe"].map(t => (
                              <button key={t} type="button" onClick={() => setNewProd({...newProd, tag: t})}
                                 className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    newProd.tag === t ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-400 border-gray-100 hover:border-blue-300"
                                 }`}>
                                 {t || "None"}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Row 4: Sizes */}
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Available Sizes</label>
                     <div className="flex flex-wrap gap-3">
                        {["XS","S","M","L","XL","XXL","3XL","FREE"].map(s => {
                           const active = newProd.sizes.includes(s);
                           return (
                              <button key={s} type="button" onClick={() => {
                                 setNewProd({...newProd, sizes: active ? newProd.sizes.filter((x:string) => x !== s) : [...newProd.sizes, s]});
                              }}
                                 className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    active ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-400 border-gray-100 hover:border-blue-300"
                                 }`}>
                                 {s}
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  {/* Row 5: Description */}
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Description</label>
                     <textarea rows={4} value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})}
                        placeholder="Detailed description of your product..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] py-5 px-8 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 resize-none" />
                  </div>

                  {/* Row 6: Images */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Images</label>
                     <div className="flex flex-wrap gap-4">
                        {newProd.images.map((url: string, i: number) => (
                           <div key={i} className="relative w-28 h-28 rounded-2xl overflow-hidden border border-gray-100 group">
                              <img src={mediaUrl(url)} className="w-full h-full object-cover" />
                              <button onClick={() => setNewProd({...newProd, images: newProd.images.filter((_:string,j:number) => j !== i)})}
                                 className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                           </div>
                        ))}
                        <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                           <ImageIcon size={20} className="text-gray-300 mb-1" />
                           <span className="text-[9px] font-bold text-gray-400 uppercase">Upload</span>
                           <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                 const { url } = await uploadImage(file);
                                 setNewProd({...newProd, images: [...newProd.images, url]});
                              } catch { alert("Image upload failed."); }
                           }} />
                        </label>
                     </div>
                     <FormGroup label="Or paste image URL" value={newProd.images[newProd.images.length - 1] || ""} onChange={(v: string) => {
                        const imgs = [...newProd.images];
                        if (imgs.length > 0) imgs[imgs.length - 1] = v;
                        else imgs.push(v);
                        setNewProd({...newProd, images: imgs});
                     }} placeholder="https://example.com/image.jpg" />
                  </div>

                  {/* Row 7: Color + Toggles */}
                  <div className="grid md:grid-cols-3 gap-8 items-end">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Color Accent</label>
                        <div className="flex items-center gap-4">
                           <input type="color" value={newProd.color_hex} onChange={e => setNewProd({...newProd, color_hex: e.target.value})}
                              className="w-14 h-14 rounded-xl border border-gray-100 cursor-pointer" />
                           <span className="text-xs font-bold text-gray-500">{newProd.color_hex}</span>
                        </div>
                     </div>
                     <div className="flex flex-wrap gap-4">
                        {[
                           { key: "is_featured", label: "Featured" },
                           { key: "is_new", label: "New Arrival" },
                           { key: "is_bestseller", label: "Bestseller" },
                        ].map(({ key, label }) => (
                           <label key={key} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={newProd[key]} onChange={e => setNewProd({...newProd, [key]: e.target.checked})}
                                 className="w-4 h-4 accent-blue-600 rounded" />
                              <span className="text-xs font-bold text-gray-600">{label}</span>
                           </label>
                        ))}
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 flex gap-6 border-t border-gray-50">
                     <button onClick={() => setShowAddForm(false)} className="flex-1 py-6 bg-gray-50 text-gray-400 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
                     <button
                        onClick={handleAddProduct}
                        disabled={submitLoading}
                        className="flex-[2] py-6 bg-blue-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/20 hover:-translate-y-1 transition-all disabled:opacity-50"
                     >
                        {submitLoading ? "Curating..." : "Add to Catalog"}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* ── ORDER DETAILS MODAL ── */}
      {selectedOrder && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1A1A1A]/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
               <div className="p-12 space-y-10">
                  <div className="flex items-center justify-between">
                     <h2 className="text-3xl font-black text-[#1A1A1A]">Order Details</h2>
                     <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all font-black text-xl">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                        <p className="text-sm font-bold text-[#1A1A1A]">{selectedOrder.customer || 'Guest User'}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</p>
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block">✓ SUCCESSFUL</span>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items Ordered</p>
                     <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {(selectedOrder.items || []).map((item: any, i: number) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                              <p className="text-sm font-bold text-[#1A1A1A]">{item.qty}x {item.name}</p>
                              <p className="text-sm font-black text-blue-600">₹{item.price?.toLocaleString()}</p>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                     <p className="text-lg font-black text-[#1A1A1A]">Total Revenue</p>
                     <p className="text-3xl font-black text-blue-600">₹{selectedOrder.total?.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-4">
                     <button 
                        onClick={() => updateOrderStatus(selectedOrder.id, "shipped")} 
                        disabled={updatingStatus}
                        className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                     >
                        Mark as Shipped
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}

/* ── HELPER COMPONENTS ── */

function SidebarItem({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.8rem] transition-all relative group ${active ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/30 font-black" : "text-gray-500 hover:text-white"}`}>
      {icon}
      <span className="text-xs uppercase tracking-widest">{label}</span>
      {active && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full" />}
    </button>
  );
}

function StatCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-50 space-y-6 hover:translate-y-[-5px] transition-all">
       <div className="flex items-center justify-between">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">{icon}</div>
          <span className={`text-[10px] font-black px-3 py-1 rounded-full ${trend.includes('+') ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}>{trend}</span>
       </div>
       <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-[#1A1A1A]">{value}</p>
       </div>
    </div>
  );
}

function ProductGridCard({ product, showActions, onDelete }: any) {
  return (
    <div className="bg-white rounded-[3rem] p-6 shadow-sm border border-gray-50 group transition-all">
       <div className="aspect-square rounded-[2.5rem] bg-gray-50 overflow-hidden mb-6 relative">
          <img src={mediaUrl(product.images?.[0])} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
          {showActions && (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                <button onClick={async () => { if(confirm("Erase?")) { await deleteShopProduct(product.id); onDelete(); }}} className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center">🗑️</button>
             </div>
          )}
       </div>
       <div className="space-y-3 px-2">
          <h4 className="text-sm font-black text-[#1A1A1A] line-clamp-1">{product.name}</h4>
          <span className="text-xs font-bold text-blue-600">₹{product.price.toLocaleString()}</span>
       </div>
    </div>
  );
}

function FormGroup({ label, value, onChange, type = "text", placeholder, disabled, rows }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
       {type === "textarea" ? (
          <textarea rows={rows || 4} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] py-5 px-8 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20" />
       ) : (
          <input type={type} value={value} disabled={disabled} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-8 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50" />
       )}
    </div>
  );
}
