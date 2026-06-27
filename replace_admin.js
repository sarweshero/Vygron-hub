const fs = require('fs');
let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

if (!code.includes('lucide-react')) {
  code = code.replace(
    'import Link from "next/link";',
    'import Link from "next/link";\nimport { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, Globe, Search, Bell, Settings as SettingsIcon, Plus, LayoutDashboard, Package, ShoppingBag, MessageSquare, LogOut, ChevronRight, Store, Users, Wallet, TrendingUp, Menu, X, ArrowLeft } from "lucide-react";'
  );
}

const loginRegex = /\/\* ── Password gate ── \*\/[\s\S]*?(?=return \()/;
const newLogin = `/* ── Password gate ── */
  if(authed === null) return null;
  if(!authed) return (
    <div className="min-h-screen bg-[#EDEFF1] font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      <nav className="w-[85%] mx-auto py-8 flex items-center justify-between">
         <Link href="/" className="text-2xl font-black tracking-tighter text-[#1A1A1A]">
            vygron<span className="text-blue-600">hub</span><span className="text-[10px] text-gray-400 font-bold ml-2 uppercase tracking-widest">Admin</span>
         </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center py-12 px-6">
         <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
            <div className="hidden md:flex flex-col space-y-10 pr-12">
               <div className="space-y-4">
                  <span className="text-blue-600 font-black uppercase tracking-[0.5em] text-[10px]">Secure Gateway</span>
                  <h1 className="text-7xl font-black text-[#1A1A1A] leading-[0.9] tracking-tighter">
                     Admin <br/><span className="text-gray-400">Portal.</span>
                  </h1>
               </div>
               <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-sm">
                  Access the control center to manage products, orders, and monitor marketplace performance.
               </p>
            </div>

            <div className="bg-white rounded-[3.5rem] p-12 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-white space-y-10 relative">
               <div className="space-y-2">
                  <h2 className="text-3xl font-black text-[#1A1A1A]">System Login</h2>
                  <p className="text-sm text-gray-400 font-medium">Authorized personnel only</p>
               </div>

               {loginErr && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                     <div className="w-2 h-2 bg-red-500 rounded-full" />
                     <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{loginErr}</p>
                  </div>
               )}

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                     <div className="relative group">
                        <input 
                           type="text"
                           value={loginUser}
                           onChange={(e) => setLoginUser(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-8 pr-12 text-sm font-bold outline-none group-focus-within:border-blue-600 group-focus-within:bg-white transition-all"
                           placeholder="admin user"
                           onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />
                        <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                     <div className="relative group">
                        <input 
                           type={showLoginPass ? "text" : "password"}
                           value={loginPass}
                           onChange={(e) => setLoginPass(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 px-8 pr-12 text-sm font-bold outline-none group-focus-within:border-blue-600 group-focus-within:bg-white transition-all"
                           placeholder="••••••••"
                           onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />
                        <button 
                           onClick={() => setShowLoginPass(!showLoginPass)}
                           className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-600 transition-colors"
                        >
                           {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleLogin}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
               >
                  Authenticate <ArrowRight size={16} />
               </button>
            </div>
         </div>
      </main>
    </div>
  );

  `;

code = code.replace(loginRegex, newLogin);
fs.writeFileSync('app/admin/page.tsx', code);
console.log('Admin login updated');
