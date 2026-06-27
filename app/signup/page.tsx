"use client";
// signup/page.tsx – Vygron Hub | Premium Customer Signup

import { useState } from "react";
import Link from "next/link";
import { userRegister } from "@/lib/api";
import { 
  ArrowRight, Mail, Lock, Eye, EyeOff, User, 
  Phone, CheckCircle2, ShieldCheck, Globe
} from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: ""
  });
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string) => (v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    if (errors[key]) setErrors((e) => {
      const newE = { ...e };
      delete newE[key];
      return newE;
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address.";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit phone number.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    if (!agree) e.agree = "Please accept the terms to continue.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await userRegister(form.name.trim(), form.email.trim().toLowerCase(), form.phone.trim(), form.password);
      window.location.href = "/";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists") || msg.includes("400")) {
        setErrors((e) => ({ ...e, email: "An account with this email already exists." }));
      } else {
        setErrors((e) => ({ ...e, agree: "Something went wrong. Please try again." }));
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
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] hover:text-blue-600 transition-colors">
               Sign In
            </Link>
         </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex items-center justify-center py-12 px-6">
         <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-start">
            
            {/* Left side: Hero */}
            <div className="hidden md:flex flex-col space-y-10 pr-12 sticky top-12">
               <div className="space-y-4">
                  <span className="text-blue-600 font-black uppercase tracking-[0.5em] text-[10px]">Elite Access</span>
                  <h1 className="text-7xl font-black text-[#1A1A1A] leading-[0.9] tracking-tighter">
                     Join The <br/><span className="text-gray-400">Hub.</span>
                  </h1>
               </div>
               <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-sm">
                  Create your account to unlock curated premium collections and a personalized shopping dashboard.
               </p>
               
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-white shadow-lg flex items-center justify-center text-blue-600">
                        <ShieldCheck size={20} />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-[#1A1A1A]">Secure Transactions</p>
                        <p className="text-xs text-gray-400 font-medium">Bank-grade encryption for all payments</p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-6 pt-10 border-t border-gray-200">
                  <div className="flex -space-x-4">
                     {[5,6,7,8].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-[#EDEFF1] bg-gray-200 overflow-hidden shadow-xl">
                           <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                        </div>
                     ))}
                  </div>
                  <div className="text-xs font-bold text-[#1A1A1A]">
                     Be part of <span className="text-blue-600">10k+</span> elite members
                  </div>
               </div>
            </div>

            {/* Right side: Signup Card */}
            <div className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-white space-y-8 relative">
               <div className="space-y-2">
                  <h2 className="text-3xl font-black text-[#1A1A1A]">Shopper Signup</h2>
                  <p className="text-sm text-gray-400 font-medium">Join the premium marketplace hub</p>
               </div>

               <div className="grid sm:grid-cols-2 gap-6">
                  <SignupField label="Full Name" value={form.name} onChange={set("name")} placeholder="Ananya Sharma" error={errors.name} icon={<User size={18}/>} />
                  <SignupField label="Email Address" value={form.email} onChange={set("email")} placeholder="you@example.com" type="email" error={errors.email} icon={<Mail size={18}/>} />
                  <SignupField label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="9876543210" type="tel" error={errors.phone} icon={<Phone size={18}/>} />
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                     <div className="relative group">
                        <input 
                           type={showPass ? "text" : "password"}
                           value={form.password}
                           onChange={(e) => set("password")(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-8 pr-12 text-sm font-bold outline-none group-focus-within:border-blue-600 group-focus-within:bg-white transition-all"
                           placeholder="••••••••"
                        />
                        <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-600 transition-colors">
                           {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                     {errors.password && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.password}</p>}
                  </div>

                  <SignupField label="Confirm Password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" type="password" error={errors.confirm} icon={<Lock size={18}/>} />
               </div>

               <div className="space-y-4">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="hidden"/>
                    <div className={`mt-1 w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${agree ? "bg-blue-600 border-blue-600" : "border-gray-200"}`}>
                       {agree && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       I agree to the <span className="text-blue-600">Terms and Privacy Policy</span>
                    </span>
                  </label>
                  {errors.agree && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.agree}</p>}
               </div>

               <button onClick={handleSignup} disabled={loading} className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create My Account <ArrowRight size={16}/></>}
               </button>

               <div className="pt-6 text-center">
                  <p className="text-xs font-bold text-gray-400">
                     Already a member? <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link>
                  </p>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}

function SignupField({ label, value, onChange, placeholder, type = "text", error, icon }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
       <div className="relative group">
          <input 
             type={type}
             value={value}
             onChange={(e) => onChange(e.target.value)}
             className={`w-full bg-gray-50 border ${error ? "border-red-200" : "border-gray-100"} rounded-[1.5rem] py-5 px-8 pr-12 text-sm font-bold outline-none group-focus-within:border-blue-600 group-focus-within:bg-white transition-all`}
             placeholder={placeholder}
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
             {icon}
          </div>
       </div>
       {error && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">{error}</p>}
    </div>
  );
}
