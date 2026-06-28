"use client";
// vendor/login/page.tsx – Vygron Hub | Premium Vendor Login (Light Theme)

import { useState } from "react";
import Link from "next/link";
import { userLogin } from "@/lib/api";
import { ArrowRight, Mail, Lock, Eye, EyeOff, Briefcase, Store } from "lucide-react";

export default function VendorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your credentials."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await userLogin(email.trim().toLowerCase(), password);
      if (res.userType === "shop_owner") {
        window.location.href = "/dashboard/shop";
      } else {
        setError("This account is not registered as a shop owner.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("401") ? "Invalid email or password." : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEFF1] font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* ── TOP NAV ── */}
      <nav className="w-[85%] mx-auto py-8 flex items-center justify-between">
         <Link href="/" className="text-2xl font-black tracking-tighter text-[#1A1A1A]">
            vygron<span className="text-blue-600">hub</span>
         </Link>
         <div className="flex items-center gap-8">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
               Shopper Login
            </Link>
         </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex items-center justify-center py-12 px-6">
         <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left side: Business Info */}
            <div className="hidden md:flex flex-col space-y-10 pr-12 text-[#1A1A1A]">
               <div className="space-y-4">
                  <span className="text-blue-600 font-black uppercase tracking-[0.5em] text-[10px]">Merchant Portal</span>
                  <h1 className="text-7xl font-black leading-[0.9] tracking-tighter">
                     Grow Your <br/><span className="text-gray-400">Business.</span>
                  </h1>
               </div>
               <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-sm">
                  Access your seller dashboard to manage inventory, track orders, and analyze your brand growth.
               </p>
               
               <div className="grid grid-cols-2 gap-6 pt-10 border-t border-gray-200">
                  <div className="space-y-2">
                     <div className="w-10 h-10 rounded-2xl bg-white shadow-lg flex items-center justify-center text-blue-600">
                        <Store size={20} />
                     </div>
                     <p className="text-xs font-bold uppercase tracking-wider">Multi-Shop Control</p>
                  </div>
                  <div className="space-y-2">
                     <div className="w-10 h-10 rounded-2xl bg-white shadow-lg flex items-center justify-center text-blue-600">
                        <Briefcase size={20} />
                     </div>
                     <p className="text-xs font-bold uppercase tracking-wider">Business Analytics</p>
                  </div>
               </div>
            </div>

            {/* Right side: Login Card */}
            <div className="bg-white rounded-[3.5rem] p-12 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-white space-y-10 relative">
               <div className="space-y-2">
                  <h2 className="text-3xl font-black text-[#1A1A1A]">Vendor Sign In</h2>
                  <p className="text-sm text-gray-400 font-medium">Manage your shop on Vygron Hub</p>
               </div>

               {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                     <div className="w-2 h-2 bg-red-500 rounded-full" />
                     <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{error}</p>
                  </div>
               )}

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                     <div className="relative group">
                        <input 
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-8 pr-12 text-sm font-bold outline-none group-focus-within:border-blue-600 group-focus-within:bg-white transition-all"
                           placeholder="vendor@company.com"
                           onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />
                        <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                     <div className="relative group">
                        <input 
                           type={showPass ? "text" : "password"}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-8 pr-12 text-sm font-bold outline-none group-focus-within:border-blue-600 group-focus-within:bg-white transition-all"
                           placeholder="••••••••"
                           onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />
                        <button 
                           onClick={() => setShowPass(!showPass)}
                           className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-600 transition-colors"
                        >
                           {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden group"
               >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Access Dashboard <ArrowRight size={16} /></>}
               </button>

               <div className="pt-6 text-center border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                     Don&apos;t have a shop? <Link href="/vendor/signup" className="text-blue-600 hover:underline">Apply Now</Link>
                  </p>
               </div>
            </div>
         </div>
      </main>

      <footer className="w-[85%] mx-auto py-10 border-t border-gray-200 text-center">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vygron Hub Merchant Solutions • 2026</p>
      </footer>
    </div>
  );
}
