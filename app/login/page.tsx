"use client";
// login/page.tsx – Vygron Hub | Premium Customer Login

import { useState } from "react";
import Link from "next/link";
import { userLogin } from "@/lib/api";
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, Globe } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await userLogin(email.trim().toLowerCase(), password);
      // Even if they are a shop owner, we treat them as customer here or redirect if needed
      // But usually, separate pages means separate intent.
      if (res.userType === "shop_owner") {
        window.location.href = "/dashboard/shop";
      } else {
        window.location.href = "/";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("401")) {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
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
            <Link href="/vendor/login" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:opacity-70 transition-colors">
               Become a Seller
            </Link>
            <Link href="/signup" className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] hover:text-blue-600 transition-colors">
               Create Account
            </Link>
         </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex items-center justify-center py-12 px-6">
         <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left side: Hero */}
            <div className="hidden md:flex flex-col space-y-10 pr-12">
               <div className="space-y-4">
                  <span className="text-blue-600 font-black uppercase tracking-[0.5em] text-[10px]">Secure Gateway</span>
                  <h1 className="text-7xl font-black text-[#1A1A1A] leading-[0.9] tracking-tighter">
                     Welcome <br/><span className="text-gray-400">Back.</span>
                  </h1>
               </div>
               <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-sm">
                  Access your personalized hub of elite boutiques and premium essentials.
               </p>
               <div className="flex items-center gap-6 pt-10 border-t border-gray-200">
                  <div className="flex -space-x-4">
                     {[1,2,3,4].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-[#EDEFF1] bg-gray-200 overflow-hidden shadow-xl">
                           <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                        </div>
                     ))}
                  </div>
                  <div className="text-xs font-bold text-[#1A1A1A]">
                     Joined by <span className="text-blue-600">10k+</span> refined shoppers
                  </div>
               </div>
            </div>

            {/* Right side: Login Card */}
            <div className="bg-white rounded-[3.5rem] p-12 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-white space-y-10 relative">
               <div className="space-y-2">
                  <h2 className="text-3xl font-black text-[#1A1A1A]">Shopper Sign In</h2>
                  <p className="text-sm text-gray-400 font-medium">Enjoy a premium shopping experience</p>
               </div>

               {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                     <div className="w-2 h-2 bg-red-500 rounded-full" />
                     <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{error}</p>
                  </div>
               )}

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                     <div className="relative group">
                        <input 
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-8 pr-12 text-sm font-bold outline-none group-focus-within:border-blue-600 group-focus-within:bg-white transition-all"
                           placeholder="you@example.com"
                           onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />
                        <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between ml-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                     </div>
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
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
               >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
               </button>

               <div className="pt-6 text-center">
                  <p className="text-xs font-bold text-gray-400">
                     Are you a seller? <Link href="/vendor/login" className="text-blue-600 hover:underline">Vendor Login</Link>
                  </p>
               </div>
            </div>
         </div>
      </main>

      <footer className="w-[85%] mx-auto py-10 flex items-center justify-between border-t border-gray-200">
         <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">© 2026 Vygron Hub</p>
      </footer>
    </div>
  );
}
