"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, ShoppingCart, CheckCircle, MapPin, CreditCard, Package } from "lucide-react";
import { BASE, getCachedUserInfo, getUserToken } from "@/lib/api";

const STEPS = ["Delivery Address", "Payment Details", "Order Summary"];

type SavedAddress = {
  id: string; label: string;
  name: string; phone: string;
  pincode: string; city: string; state: string;
  line1: string; line2: string;
  isDefault: boolean;
};

type CartItem = {
  id: number; name: string; price: number; original?: number;
  imgClass: string; size: string; color: string; colorHex: string;
  qty: number; fabric: string;
};

const ESTIMATED_DELIVERY = new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function CheckoutPage() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [placedOrderId, setPlacedOrderId] = useState("");

  /* Redirect to login if not authenticated */
  useEffect(() => {
    try {
      if (!getUserToken()) window.location.href = "/login";
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Saved addresses from profile */
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addrMode, setAddrMode]             = useState<"saved" | "new">("new");
  const [selectedAddrId, setSelectedAddrId] = useState<string>("");
  const [saveAddr, setSaveAddr]             = useState(false);
  const [addrLabel, setAddrLabel]           = useState("Home");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kurthi_addresses");
      if (stored) {
        const parsed: SavedAddress[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setSavedAddresses(parsed);
          const def = parsed.find(a => a.isDefault) ?? parsed[0];
          setSelectedAddrId(def.id);
          setAddrMode("saved");
        }
      }
    } catch {}
  }, []);

  /* Cart items */
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vygron_cart");
      if (stored) setCartItems(JSON.parse(stored));
    } catch {}
  }, []);

  const cartSubtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartShipping = cartSubtotal >= 1499 ? 0 : 99;
  const cartSavings  = cartItems.reduce((s, i) => s + ((i.original ?? i.price) - i.price) * i.qty, 0);
  const cartTotal    = cartSubtotal + cartShipping;
  const totalItems   = cartItems.reduce((s, i) => s + i.qty, 0);

  const [addr, setAddr] = useState({ name: "", phone: "", pincode: "", city: "", state: "", line1: "", line2: "" });
  const [addrError, setAddrError] = useState("");

  /* Payment state */
  const [payMethod, setPayMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [processing, setProcessing] = useState(false);

  const validateAddress = () => {
    if (addrMode === "saved") {
      const sa = savedAddresses.find(a => a.id === selectedAddrId);
      if (!sa) { setAddrError("Please select a delivery address."); return false; }
      setAddr({ name: sa.name, phone: sa.phone, pincode: sa.pincode, city: sa.city, state: sa.state, line1: sa.line1, line2: sa.line2 });
      setAddrError(""); return true;
    }
    if (!addr.name || !addr.phone || !addr.pincode || !addr.city || !addr.state || !addr.line1) {
      setAddrError("Please fill in all required fields."); return false;
    }
    if (!/^\d{10}$/.test(addr.phone)) { setAddrError("Enter a valid 10-digit phone number."); return false; }
    if (!/^\d{6}$/.test(addr.pincode)) { setAddrError("Enter a valid 6-digit pincode."); return false; }
    setAddrError("");
    if (saveAddr) {
      const newSaved: SavedAddress = {
        id: Date.now().toString(), label: addrLabel || "Home",
        ...addr, isDefault: savedAddresses.length === 0,
      };
      const updated = [...savedAddresses, newSaved];
      setSavedAddresses(updated);
      try { localStorage.setItem("kurthi_addresses", JSON.stringify(updated)); } catch {}
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    const userInfo  = getCachedUserInfo();
    const userToken = getUserToken();
    const orderId = "VYG-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 89999);
    const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    setPlacedOrderId(orderId);

    /* POST to API — primary method */
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (userToken) headers["Authorization"] = `Bearer ${userToken}`;
      await fetch(`${BASE}/orders/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id:         orderId,
          customer:   addr.name,
          email:      userInfo?.email ?? "",
          phone:      addr.phone,
          city:       addr.city,
          date:       dateStr,
          total:      cartTotal,
          pay_method: payMethod.toUpperCase(),
          items:      cartItems.map(i => ({ 
            id: i.id, // product id
            name: i.name, 
            qty: i.qty, 
            price: i.price,
            shop_slug: (i as any).shop_slug || "vygron-hub",
            shop_name: (i as any).shop_name || "Vygron Premium"
          })),
        }),
      });
    } catch { /* backend unreachable — proceed anyway */ }

    /* clear cart */
    try { localStorage.removeItem("vygron_cart"); } catch {}
    setProcessing(false);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-[#EDEFF1] text-[#333] font-sans selection:bg-blue-500 selection:text-white pb-20">
      
      {/* ── NAVBAR 85% ── */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="w-[85%] mx-auto py-5 flex items-center justify-between">
           <div className="flex items-center gap-12 flex-1">
              <Link href="/" className="text-2xl font-black tracking-tighter text-[#1A1A1A]">
                 vygron<span className="text-blue-600">hub</span>
              </Link>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#1A1A1A] font-bold text-sm tracking-wide">
                 🔒 <span className="hidden sm:inline uppercase">100% Secure Transaction</span>
              </div>
           </div>
        </div>
      </nav>

      <div className="w-[85%] mx-auto py-8">
        {step < 2 ? (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
             
             {/* Left Panel: Accordion style steps */}
             <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                
                {/* LOGIN STEP - STATIC FOR CHECKOUT */}
                <div className="bg-white rounded shadow-sm flex flex-col">
                   <div className="p-4 sm:p-6 flex items-center gap-4">
                      <div className="w-6 h-6 bg-gray-100 text-[#1A1A1A] font-bold rounded shadow-sm flex flex-shrink-0 items-center justify-center text-sm">1</div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                         <div className="flex gap-2">
                            <span className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wide">LOGIN</span>
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1">✓</span>
                         </div>
                         <div className="text-sm font-bold text-[#1A1A1A]">{addr.name || "Customer"} <span className="font-semibold text-gray-500 ml-2">+91 {addr.phone || "000000000"}</span></div>
                      </div>
                   </div>
                </div>

                {/* ADDRESS STEP */}
                <div className="bg-white rounded shadow-sm flex flex-col transition-all overflow-hidden border border-transparent hover:border-gray-100">
                   <div className={`p-4 sm:p-6 flex items-center gap-4 ${step === 0 ? "bg-blue-600 text-white" : "bg-white text-[#1A1A1A] border-b border-gray-100"}`}>
                      <div className={`w-6 h-6 font-bold rounded shadow-sm flex flex-shrink-0 items-center justify-center text-sm ${step === 0 ? "bg-white text-blue-600" : "bg-gray-100 text-[#1A1A1A]"}`}>
                         2
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                         <div className="flex gap-2">
                            <span className="font-bold text-sm uppercase tracking-wide">DELIVERY ADDRESS</span>
                            {step > 0 && <span className="text-xs text-green-600 font-bold flex items-center gap-1">✓</span>}
                         </div>
                         {step > 0 && (
                            <button onClick={() => setStep(0)} className="text-xs font-bold text-blue-600 hover:underline uppercase p-0 border-none bg-transparent cursor-pointer">Change</button>
                         )}
                      </div>
                   </div>

                   {step === 0 && (
                      <div className="p-6 pb-8">
                        {/* Saved Addresses */}
                        {savedAddresses.length > 0 && (
                          <div className="flex flex-col gap-4 mb-6">
                            {savedAddresses.map(sa => (
                              <div
                                key={sa.id}
                                onClick={() => { setAddrMode("saved"); setSelectedAddrId(sa.id); }}
                                className={`p-4 border rounded cursor-pointer transition-colors relative ${addrMode==="saved" && selectedAddrId===sa.id ? "bg-blue-50/30 border-blue-600" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                              >
                                <div className="flex gap-4">
                                   <div className="mt-1 flex-shrink-0">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${addrMode==="saved" && selectedAddrId===sa.id ? "border-blue-600" : "border-gray-300"}`}>
                                         {addrMode==="saved" && selectedAddrId===sa.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                      </div>
                                   </div>
                                   <div className="flex-1">
                                      <div className="flex items-center gap-4 mb-2">
                                         <span className="text-sm font-bold text-[#1A1A1A]">{sa.name}</span>
                                         <span className="bg-gray-100 text-[10px] font-bold text-gray-500 px-2 py-0.5 rounded uppercase tracking-wide">{sa.label}</span>
                                         <span className="text-sm font-bold text-[#1A1A1A] ml-2">{sa.phone}</span>
                                      </div>
                                      <p className="text-sm text-[#1A1A1A] leading-relaxed max-w-lg mb-4">
                                         {sa.line1}{sa.line2 ? ", " + sa.line2 : ""}, {sa.city}, {sa.state} – <span className="font-bold">{sa.pincode}</span>
                                      </p>
                                      {addrMode==="saved" && selectedAddrId===sa.id && (
                                         <button onClick={() => validateAddress() && setStep(1)} className="bg-blue-600 text-white px-8 py-3 rounded-[3px] text-sm font-bold tracking-wide uppercase shadow-sm hover:bg-blue-700 transition-colors">
                                           Deliver Here
                                         </button>
                                      )}
                                   </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add New Address Toggle */}
                        <div
                          onClick={() => setAddrMode("new")}
                          className={`p-4 border rounded cursor-pointer flex gap-4 transition-colors ${addrMode==="new" ? "bg-blue-50/30 border-blue-600" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                        >
                           <div className="mt-1 flex-shrink-0">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${addrMode==="new" ? "border-blue-600" : "border-gray-300"}`}>
                                 {addrMode==="new" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                              </div>
                           </div>
                           <div className="flex-1">
                              <span className="text-sm font-bold text-blue-600 tracking-wide">+ ADD A NEW ADDRESS</span>
                           </div>
                        </div>

                        {/* New Address Form */}
                        {addrMode === "new" && (
                          <div className="mt-4 p-6 bg-blue-50/10 border border-blue-100 rounded">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                <Field label="Name" value={addr.name} onChange={v => setAddr({...addr, name: v})} />
                                <Field label="10-digit mobile number" value={addr.phone} onChange={v => setAddr({...addr, phone: v})} type="tel" />
                                <Field label="Pincode" value={addr.pincode} onChange={v => setAddr({...addr, pincode: v})} />
                                <Field label="Locality / City" value={addr.city} onChange={v => setAddr({...addr, city: v})} />
                                <div className="sm:col-span-2">
                                   <Field label="Address (Area and Street)" value={addr.line1} onChange={v => setAddr({...addr, line1: v})} />
                                </div>
                                <Field label="State" value={addr.state} onChange={v => setAddr({...addr, state: v})} />
                                <Field label="Landmark (Optional)" value={addr.line2} onChange={v => setAddr({...addr, line2: v})} />
                             </div>
                             
                             <div className="mt-6">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Address Type</label>
                                <div className="flex gap-4">
                                   {["Home", "Work"].map(l => (
                                     <label key={l} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={addrLabel === l} onChange={() => setAddrLabel(l)} className="accent-blue-600" />
                                        <span className="text-sm font-semibold text-[#1A1A1A]">{l}</span>
                                     </label>
                                   ))}
                                </div>
                             </div>

                             <div className="mt-8 flex gap-4">
                                <button onClick={() => { setSaveAddr(true); validateAddress() && setStep(1); }} className="bg-blue-600 text-white px-8 py-3.5 rounded-[3px] text-sm font-bold uppercase shadow-sm tracking-wide hover:bg-blue-700">
                                   Save and Deliver Here
                                </button>
                                {savedAddresses.length > 0 && (
                                   <button onClick={() => setAddrMode("saved")} className="px-6 py-3 text-sm font-bold text-blue-600 uppercase tracking-wide hover:underline cursor-pointer">
                                      Cancel
                                   </button>
                                )}
                             </div>
                             {addrError && <p className="text-xs font-bold text-red-500 mt-4">{addrError}</p>}
                          </div>
                        )}
                      </div>
                   )}
                </div>

                {/* PAYMENT STEP */}
                <div className="bg-white rounded shadow-sm flex flex-col transition-all overflow-hidden border border-transparent">
                   <div className={`p-4 sm:p-6 flex items-center gap-4 ${step === 1 ? "bg-blue-600 text-white" : "bg-white text-[#1A1A1A] border-b border-gray-100 opacity-70"}`}>
                      <div className={`w-6 h-6 font-bold rounded shadow-sm flex flex-shrink-0 items-center justify-center text-sm ${step === 1 ? "bg-white text-blue-600" : "bg-gray-100 text-[#1A1A1A]"}`}>
                         3
                      </div>
                      <span className="font-bold text-sm uppercase tracking-wide">PAYMENT OPTIONS</span>
                   </div>

                   {step === 1 && (
                      <div className="p-6 pb-8">
                         <div className="flex flex-col gap-4">
                           {[
                             { id: "upi", label: "UPI", desc: "Pay via any UPI app" },
                             { id: "card", label: "Credit / Debit / ATM Card", desc: "Add and secure your card" },
                             { id: "netbanking", label: "Net Banking", desc: "Pay from your bank account" },
                             { id: "cod", label: "Cash on Delivery", desc: "Pay via cash/UPI at doorstep" },
                           ].map(opt => (
                              <div key={opt.id} className="border border-gray-200 rounded overflow-hidden">
                                 <label 
                                    className={`flex items-start gap-4 p-4 cursor-pointer transition-colors ${payMethod === opt.id ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                                    onClick={() => setPayMethod(opt.id as any)}
                                 >
                                    <div className="mt-0.5">
                                      <input type="radio" checked={payMethod === opt.id} onChange={() => {}} className="w-4 h-4 accent-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                       <span className="font-bold text-sm text-[#1A1A1A] block">{opt.label}</span>
                                       {payMethod !== opt.id && <span className="text-xs text-gray-500 mt-1 block">{opt.desc}</span>}
                                       
                                       {/* Expanded forms */}
                                       {payMethod === opt.id && (
                                          <div className="mt-4 pb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                             {opt.id === "upi" && (
                                                <div className="flex flex-col gap-3 max-w-sm">
                                                   <span className="text-xs font-semibold text-gray-600">Please enter your UPI ID</span>
                                                   <div className="flex gap-2">
                                                      <input type="text" placeholder="Ex: MobileNumber@upi" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400 outline-none focus:border-blue-500" />
                                                      <button className="bg-gray-100 border border-gray-200 text-sm font-bold text-gray-600 px-4 py-2 rounded uppercase tracking-wide hover:bg-gray-200">Verify</button>
                                                   </div>
                                                </div>
                                             )}
                                             {opt.id === "card" && (
                                                <div className="grid grid-cols-2 gap-4 max-w-sm">
                                                   <div className="col-span-2">
                                                      <input type="text" placeholder="Enter Card Number" maxLength={19} className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400 outline-none focus:border-blue-500" />
                                                   </div>
                                                   <div>
                                                      <input type="text" placeholder="Valid Thru (MM/YY)" maxLength={5} className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400 outline-none focus:border-blue-500" />
                                                   </div>
                                                   <div>
                                                      <input type="password" placeholder="CVV" maxLength={4} className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400 outline-none focus:border-blue-500" />
                                                   </div>
                                                </div>
                                             )}
                                             <div className="mt-6 flex items-center justify-between">
                                                <button onClick={handlePlaceOrder} disabled={processing} className="bg-blue-600 text-white px-10 py-3 rounded-[3px] text-sm font-bold tracking-wide uppercase shadow-sm hover:bg-blue-700 transition-colors">
                                                   {processing ? "Processing..." : `PAY ₹${cartTotal.toLocaleString("en-IN")}`}
                                                </button>
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 </label>
                              </div>
                           ))}
                         </div>
                      </div>
                   )}
                </div>

             </div>

             {/* Right Panel: Price Details */}
             <div className="w-full lg:w-[380px] flex-shrink-0">
               <div className="bg-white rounded shadow-sm sticky top-6">
                  <div className="p-4 border-b border-gray-100">
                     <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Price Details</h3>
                  </div>
                  <div className="p-6 flex flex-col gap-4 text-sm">
                     <div className="flex justify-between items-center text-[#1A1A1A]">
                        <span>Price ({totalItems} items)</span>
                        <span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
                     </div>
                     <div className="flex justify-between items-center text-[#1A1A1A]">
                        <span>Delivery Charges</span>
                        <span className={cartShipping === 0 ? "text-green-600 font-semibold" : ""}>{cartShipping === 0 ? "FREE" : `₹${cartShipping}`}</span>
                     </div>
                  </div>
                  <div className="p-6 border-t border-b border-gray-100 border-dashed">
                     <div className="flex justify-between items-center font-bold text-lg text-[#1A1A1A]">
                        <span>Amount Payable</span>
                        <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                     </div>
                  </div>
                  <div className="p-6 bg-green-50/50 rounded-b text-sm font-bold text-green-600">
                     Your Total Savings on this order ₹50
                  </div>
               </div>
               
               <div className="flex items-center gap-4 mt-6 text-gray-500">
                  <span className="text-3xl opacity-50">🛡️</span>
                  <p className="text-xs font-bold leading-tight uppercase tracking-wide opacity-80">Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
               </div>
             </div>
          </div>
        ) : (
          /* Confirmation Step (Step 2) */
          <div className="max-w-2xl mx-auto py-16 animate-in zoom-in-95 duration-500">
             <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 text-center">
                <div className="bg-green-500 p-8 text-white flex flex-col items-center justify-center">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                      <CheckCircle size={32} />
                   </div>
                   <h2 className="text-3xl font-black mb-1 uppercase tracking-wider">Order Placed</h2>
                   <p className="text-sm opacity-90 font-bold">Successfully placed on {new Date().toLocaleDateString("en-IN")}</p>
                </div>
                
                <div className="p-8 pb-12">
                   <div className="inline-flex flex-col items-center gap-1 mb-8">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction ID</span>
                     <span className="text-lg font-bold text-[#1A1A1A] bg-gray-50 px-4 py-1.5 rounded">{placedOrderId}</span>
                   </div>
                   
                   <p className="text-[#1A1A1A] font-medium leading-relaxed max-w-md mx-auto mb-10">
                      Thank you for shopping with Vygron Hub. An email confirmation has been sent to your registered email address. 
                   </p>

                   <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Link href="/dashboard/customer?tab=orders">
                         <button className="bg-blue-600 text-white px-8 py-3.5 rounded-[3px] text-sm font-bold tracking-wide uppercase hover:bg-blue-700 shadow-sm transition-colors w-full sm:w-auto">
                            Track Order
                         </button>
                      </Link>
                      <Link href="/">
                         <button className="bg-white text-[#1A1A1A] border border-gray-200 px-8 py-3.5 rounded-[3px] text-sm font-bold tracking-wide uppercase hover:bg-gray-50 transition-colors w-full sm:w-auto">
                            Continue Shopping
                         </button>
                      </Link>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1 w-full relative group">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || " "}
        className="peer w-full px-4 py-3 border border-gray-300 rounded-[3px] text-sm text-[#1A1A1A] outline-none focus:border-blue-500 font-semibold"
      />
      <label className="absolute left-3 -top-2.5 bg-white px-1 text-[11px] font-bold text-gray-500 uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:uppercase-none peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:text-blue-600 peer-focus:uppercase peer-focus:tracking-widest">
        {label}
      </label>
    </div>
  );
}
