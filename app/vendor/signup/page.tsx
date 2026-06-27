"use client";
// vendor/signup/page.tsx – Vygron Hub | Premium Vendor Registration (Light Theme)

import { useState } from "react";
import Link from "next/link";
import { shopRegister } from "@/lib/api";
import { 
  ArrowRight, Mail, Lock, Eye, EyeOff, User, 
  Phone, Store, Briefcase, CheckCircle2, ShieldCheck, FileText
} from "lucide-react";

export default function VendorSignupPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
    shopName: "", description: "", businessDetails: ""
  });
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");

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
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid work email required.";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Valid 10-digit phone required.";
    if (!form.shopName.trim()) e.shopName = "Shop name is required.";
    if (!form.description.trim()) e.description = "Business type is required.";
    if (form.password.length < 8) e.password = "Min 8 characters required.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    if (!agree) e.agree = "Accept terms to continue.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await shopRegister({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        shop_name: form.shopName.trim(),
        description: form.description.trim(),
        business_details: form.businessDetails.trim(),
      });
      setSuccessMsg(res.detail);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrors((e) => ({ ...e, agree: msg }));
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
         <Link href="/vendor/login" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
            Vendor Sign In
         </Link>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex items-center justify-center py-12 px-6">
         <div className={`w-full max-w-7xl grid ${successMsg ? "grid-cols-1" : "md:grid-cols-2"} gap-12 items-start`}>
            
            {/* Left side: Business Value */}
            {!successMsg && (
              <div className="hidden md:flex flex-col space-y-10 pr-12 text-[#1A1A1A] sticky top-12">
                 <div className="space-y-4">
                    <span className="text-blue-600 font-black uppercase tracking-[0.5em] text-[10px]">Vygron Merchant</span>
                    <h1 className="text-7xl font-black leading-[0.9] tracking-tighter">
                       Join The <br/><span className="text-gray-400">Network.</span>
                    </h1>
                 </div>
                 <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-sm">
                    Start selling your premium products to a global audience. Our merchant tools provide everything you need to scale.
                 </p>
                 
                 <div className="space-y-6">
                    {[{
                       icon: <ShieldCheck size={20}/>, t: "Verified Identity", d: "Join a network of trusted, elite boutiques."
                    }, {
                       icon: <FileText size={20}/>, t: "Easy Onboarding", d: "Start selling in few simple steps after approval."
                    }].map((item, i) => (
                       <div key={i} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-white shadow-lg flex items-center justify-center text-blue-600">
                             {item.icon}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-[#1A1A1A]">{item.t}</p>
                             <p className="text-xs text-gray-400 font-medium">{item.d}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            )}

            {/* Registration Card */}
            <div className={`bg-white rounded-[3.5rem] p-10 md:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-white space-y-10 relative ${successMsg ? "max-w-2xl mx-auto" : ""}`}>
               
               {successMsg ? (
                 <div className="text-center space-y-8 py-10">
                    <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto shadow-inner">
                       <CheckCircle2 size={48} className="text-green-500" />
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-4xl font-black text-[#1A1A1A]">Application Sent!</h2>
                       <p className="text-lg text-gray-400 font-medium leading-relaxed">{successMsg}</p>
                    </div>
                    <Link href="/" className="inline-flex items-center gap-3 py-5 px-12 bg-blue-600 text-white rounded-[1.5rem] text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-all">
                       Back to Marketplace
                    </Link>
                 </div>
               ) : (
                 <>
                   <div className="space-y-2">
                      <h2 className="text-3xl font-black text-[#1A1A1A]">Partner Registration</h2>
                      <p className="text-sm text-gray-400 font-medium">Apply to become a verified seller</p>
                   </div>

                   <div className="grid sm:grid-cols-2 gap-6">
                      <VendorField label="Owner Name" value={form.name} onChange={set("name")} placeholder="John Doe" error={errors.name} icon={<User size={18}/>} />
                      <VendorField label="Work Email" value={form.email} onChange={set("email")} placeholder="john@company.com" type="email" error={errors.email} icon={<Mail size={18}/>} />
                      <VendorField label="Contact Number" value={form.phone} onChange={set("phone")} placeholder="9876543210" type="tel" error={errors.phone} icon={<Phone size={18}/>} />
                      <VendorField label="Shop Name" value={form.shopName} onChange={set("shopName")} placeholder="Boutique Name" error={errors.shopName} icon={<Store size={18}/>} />
                      <VendorField label="Business Type" value={form.description} onChange={set("description")} placeholder="e.g. Ethnic Wear" error={errors.description} icon={<Briefcase size={18}/>} />
                      
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                         <div className="relative group">
                            <input 
                               type={showPass ? "text" : "password"}
                               value={form.password}
                               onChange={(e) => set("password")(e.target.value)}
                               className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-8 pr-12 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                               placeholder="••••••••"
                            />
                            <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-600 transition-colors">
                               {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                         </div>
                         {errors.password && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.password}</p>}
                      </div>
                      <VendorField label="Confirm Password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" type="password" error={errors.confirm} icon={<Lock size={18}/>} />
                   </div>

                   <div className="space-y-4">
                      <label className="flex items-start gap-4 cursor-pointer group" onClick={() => setAgree(!agree)}>
                        <div className={`mt-1 w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${agree ? "bg-blue-600 border-blue-600" : "border-gray-200"}`}>
                           {agree && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                           I agree to Vygron Hub Merchant Terms & Conditions
                        </span>
                      </label>
                      {errors.agree && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.agree}</p>}
                   </div>

                   <button onClick={handleSignup} disabled={loading} className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]">
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : "Submit Application"}
                   </button>
                 </>
               )}
            </div>
         </div>
      </main>

      <footer className="w-[85%] mx-auto py-10 border-t border-gray-200 text-center">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Join 500+ premium sellers globally.</p>
      </footer>
    </div>
  );
}

function VendorField({ label, value, onChange, placeholder, type = "text", error, icon }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
       <div className="relative group">
          <input 
             type={type}
             value={value}
             onChange={(e) => onChange(e.target.value)}
             className={`w-full bg-gray-50 border ${error ? "border-red-200" : "border-gray-100"} rounded-[1.5rem] py-5 px-8 pr-12 text-sm font-bold outline-none focus:border-blue-600 transition-all placeholder:text-gray-300`}
             placeholder={placeholder}
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
             {icon}
          </div>
       </div>
    </div>
  );
}
