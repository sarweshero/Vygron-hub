"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, Globe, Search, Bell, Settings as SettingsIcon, Plus, LayoutDashboard, Package, ShoppingBag, MessageSquare, LogOut, ChevronRight, Store, Users, Wallet, TrendingUp, Menu, X, ArrowLeft } from "lucide-react";
import {
  apiLogin, apiGet, apiPost, apiPatch, apiDelete,
  productFromAPI, productToAPI, orderFromAPI, clearToken, mediaUrl,
} from "@/lib/api";

/* ═══════════════════════════ TYPES ═══════════════════════════════ */
type AdminProduct = {
  id: number;
  name: string;
  mrp: number;
  price: number;
  sizes: string[];
  description: string;
  deliveryDays: number;
  category: string;
  fabric: string;
  imgClass: string;
  tag?: string;
  stock: number;
  sold: number;
  rating: number;
  showOnHome: boolean;
  isNew: boolean;
  isBestseller: boolean;
  colorHex: string;
  images?: string[];
  offerFrom?: string;
  offerTo?: string;
};

type OrderStatus = "placed" | "confirmed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

type ConfirmDialog = {
  type: "delete-product" | "cancel-order" | "advance-order" | "out-of-stock";
  id: string | number;
  label: string;
  nextLabel?: string;
};

type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  city: string;
  date: string;
  items: { name: string; qty: number; size: string; price: number }[];
  total: number;
  status: OrderStatus;
  payMethod: string;
};

/* ═══════════════════════════ SEED DATA ══════════════════════════ */
const SEED_PRODUCTS: AdminProduct[] = [
  { id:1,  name:"Gulabi Anarkali Suit",        mrp:4999, price:3499, sizes:["S","M","L","XL"],         description:"Flowy georgette anarkali with intricate floral prints. Perfect for parties and festive occasions. Comes with matching dupatta.",                       deliveryDays:5, category:"Festive",      fabric:"Georgette",  imgClass:"product-img-1", tag:"New",  stock:42, sold:284, rating:4.9, showOnHome:true,  isNew:true,  isBestseller:true,  colorHex:"#e89ca0" },
  { id:2,  name:"Zari Weave Straight Kurta",   mrp:3999, price:2799, sizes:["XS","S","M","L","XL"],    description:"Rich zari border straight kurta in pure silk. Ideal for weddings and formal gatherings. Dry-clean only.",                                            deliveryDays:6, category:"Designer",     fabric:"Silk",        imgClass:"product-img-2", tag:"Hot",  stock:28, sold:174, rating:4.8, showOnHome:true,  isNew:true,  isBestseller:true,  colorHex:"#7b1e3a" },
  { id:3,  name:"Chikankari Lucknowi Kurta",   mrp:3299, price:2299, sizes:["S","M","L","XL","XXL"],   description:"Hand-embroidered Lucknowi chikankari on soft cotton. Lightweight and breathable for daily wear. Machine washable.",                                 deliveryDays:4, category:"Casual Wear",  fabric:"Cotton",      imgClass:"product-img-3", tag:"Sale", stock:65, sold:432, rating:4.7, showOnHome:true,  isNew:false, isBestseller:true,  colorHex:"#f5ede3" },
  { id:4,  name:"Royal Bandhani Kurta Set",    mrp:4199, price:4199, sizes:["M","L","XL","XXL"],       description:"Traditional Rajasthani bandhani tie-dye kurta set in chanderi. Includes kurta and palazzo. Festival-ready.",                                       deliveryDays:5, category:"Festive",      fabric:"Chanderi",    imgClass:"product-img-4", tag:"New",  stock:19, sold:98,  rating:4.9, showOnHome:false, isNew:true,  isBestseller:false, colorHex:"#c97d4a" },
  { id:5,  name:"Cotton Dabu Block Print",     mrp:2499, price:1899, sizes:["XS","S","M","L"],         description:"Earthy dabu block print using natural dyes on organic cotton. Every piece is hand-crafted and unique.",                                            deliveryDays:4, category:"Block Print",  fabric:"Cotton",      imgClass:"product-img-5", tag:"Sale", stock:53, sold:317, rating:4.6, showOnHome:false, isNew:false, isBestseller:false, colorHex:"#4a5fa3" },
  { id:6,  name:"Kantha Stitch Long Kurta",    mrp:3199, price:3199, sizes:["S","M","L","XL"],         description:"Bengali kantha embroidery on soft mul cotton. Long A-line silhouette with side slits. Casually elegant.",                                         deliveryDays:6, category:"Embroidered",  fabric:"Mul Cotton",  imgClass:"product-img-6", tag:undefined,stock:36, sold:156, rating:4.7, showOnHome:false, isNew:false, isBestseller:true,  colorHex:"#2a8c7c" },
  { id:7,  name:"Organza Silk Flared Kurta",   mrp:6999, price:5499, sizes:["XS","S","M","L","XL"],    description:"Sheer organza overlay with silk lining. Dramatic flare with delicate thread embroidery at hem. Statement piece for weddings.",                     deliveryDays:7, category:"Designer",     fabric:"Silk",        imgClass:"product-img-1", tag:"New",  stock:14, sold:62,  rating:4.9, showOnHome:true,  isNew:true,  isBestseller:false, colorHex:"#e8d5b0" },
  { id:8,  name:"Tie-Dye Shibori Tunic",       mrp:2199, price:1599, sizes:["S","M","L","XL","XXL"],   description:"Japanese shibori technique meets Indian rayon. Casual tunic with relaxed fit, perfect for daily wear and travel.",                                   deliveryDays:3, category:"Casual Wear",  fabric:"Rayon",       imgClass:"product-img-2", tag:"Sale", stock:47, sold:203, rating:4.5, showOnHome:false, isNew:false, isBestseller:false, colorHex:"#5580c8" },
  { id:9,  name:"Phulkari Embroidered Suit",   mrp:5999, price:4899, sizes:["M","L","XL","XXL"],       description:"Vibrant Punjabi phulkari hand embroidery on georgette. Three-piece set with dupatta. Festive wear.",                                              deliveryDays:6, category:"Embroidered",  fabric:"Georgette",   imgClass:"product-img-3", tag:"New",  stock:11, sold:87,  rating:4.8, showOnHome:false, isNew:true,  isBestseller:false, colorHex:"#d4a32a" },
  { id:10, name:"Ajrakh Block Print A-Line",   mrp:3299, price:2499, sizes:["XS","S","M","L"],         description:"Signature Kutchi ajrakh block print in indigo and madder dyes. A-line kurta with mandarin collar.",                                               deliveryDays:4, category:"Block Print",  fabric:"Cotton",      imgClass:"product-img-4", tag:undefined,stock:30, sold:134, rating:4.6, showOnHome:false, isNew:false, isBestseller:false, colorHex:"#c0552d" },
  { id:11, name:"Kashmiri Crewel Kurta",       mrp:7999, price:6299, sizes:["S","M","L","XL"],         description:"Hand-embroidered crewel wool work on pashmina wool blend. Intricate floral motifs. Premium winter wear.",                                         deliveryDays:8, category:"Designer",     fabric:"Wool Blend",  imgClass:"product-img-5", tag:"Luxe", stock:8,  sold:41,  rating:5.0, showOnHome:true,  isNew:true,  isBestseller:true,  colorHex:"#5c3525" },
  { id:12, name:"Chanderi Anarkali Floor",     mrp:5199, price:5199, sizes:["XS","S","M","L","XL"],    description:"Full-length chanderi anarkali with gold zari border. Ethereal and lightweight for parties and religious occasions.",                               deliveryDays:5, category:"Festive",      fabric:"Chanderi",    imgClass:"product-img-6", tag:"New",  stock:22, sold:73,  rating:4.8, showOnHome:true,  isNew:true,  isBestseller:false, colorHex:"#e8a97a" },
  { id:13, name:"Linen Straight Everyday",     mrp:1799, price:1299, sizes:["S","M","L","XL","XXL","3XL"], description:"Pure linen straight kurta with Nehru collar. Eco-friendly and breathable. Ideal for office and casual daily use.", deliveryDays:3, category:"Casual Wear",  fabric:"Linen",       imgClass:"product-img-1", tag:"Sale", stock:88, sold:521, rating:4.4, showOnHome:false, isNew:false, isBestseller:true,  colorHex:"#ede8e0" },
  { id:14, name:"Ikat Silk Festive Kurta",     mrp:4999, price:3799, sizes:["XS","S","M","L"],         description:"Traditional Odisha ikat weave silk kurta. Each piece woven by artisan weavers. Rich texture and vibrant colours.",                               deliveryDays:7, category:"Silk & Satin", fabric:"Silk",        imgClass:"product-img-2", tag:undefined,stock:17, sold:119, rating:4.7, showOnHome:false, isNew:false, isBestseller:false, colorHex:"#2a8c7c" },
  { id:15, name:"Floral Georgette Straight",   mrp:2799, price:2099, sizes:["S","M","L","XL","XXL"],   description:"All-over floral print on lightweight georgette. Straight cut with slight flare at hem. Office-to-evening versatile wear.",                        deliveryDays:4, category:"Casual Wear",  fabric:"Georgette",   imgClass:"product-img-3", tag:"Hot",  stock:39, sold:267, rating:4.6, showOnHome:false, isNew:false, isBestseller:false, colorHex:"#9b7ec8" },
  { id:16, name:"Heavy Bridal Patiala Set",    mrp:9999, price:7499, sizes:["S","M","L","XL"],         description:"Luxurious bridal patiala set in pure silk with heavy gold zardozi embroidery. Includes kurta, patiala, dupatta. Made to order.",                 deliveryDays:10,category:"Designer",     fabric:"Silk",        imgClass:"product-img-4", tag:"Luxe", stock:5,  sold:34,  rating:4.9, showOnHome:true,  isNew:true,  isBestseller:true,  colorHex:"#8b1a2a" },
];

const SEED_ORDERS: AdminOrder[] = [
  { id:"KCI-2026-08371", customer:"Ananya Sharma",    email:"ananya@gmail.com",      phone:"9876543210", city:"Mumbai",    date:"28 Feb 2026", items:[{name:"Gulabi Anarkali Suit",qty:1,size:"M",price:3499},{name:"Zari Weave Straight Kurta",qty:2,size:"L",price:2799}], total:9097, status:"shipped",           payMethod:"UPI"         },
  { id:"KCI-2026-08320", customer:"Priya Menon",      email:"priya.m@yahoo.com",     phone:"9845001234", city:"Bengaluru", date:"27 Feb 2026", items:[{name:"Kashmiri Crewel Kurta",qty:1,size:"S",price:6299}],                                                              total:6299, status:"confirmed",         payMethod:"Credit Card" },
  { id:"KCI-2026-08290", customer:"Neha Joshi",       email:"neha.j@gmail.com",      phone:"9922334455", city:"Pune",      date:"26 Feb 2026", items:[{name:"Organza Silk Flared Kurta",qty:1,size:"XS",price:5499},{name:"Chanderi Anarkali Floor",qty:1,size:"S",price:5199}], total:10698, status:"out_for_delivery", payMethod:"Net Banking" },
  { id:"KCI-2026-08244", customer:"Ritu Singh",       email:"ritu.s@outlook.com",    phone:"9811223344", city:"Delhi",     date:"25 Feb 2026", items:[{name:"Chikankari Lucknowi Kurta",qty:2,size:"M",price:2299}],                                                          total:4598, status:"delivered",         payMethod:"UPI"         },
  { id:"KCI-2026-08201", customer:"Kavya Reddy",      email:"kavya@gmail.com",       phone:"9700112233", city:"Hyderabad", date:"24 Feb 2026", items:[{name:"Heavy Bridal Patiala Set",qty:1,size:"M",price:7499}],                                                           total:7499, status:"delivered",         payMethod:"Credit Card" },
  { id:"KCI-2026-08155", customer:"Sunita Pillai",    email:"sunita.p@gmail.com",    phone:"9988776655", city:"Chennai",   date:"22 Feb 2026", items:[{name:"Linen Straight Everyday",qty:3,size:"L",price:1299}],                                                            total:3897, status:"delivered",         payMethod:"COD"         },
  { id:"KCI-2026-08101", customer:"Meera Agarwal",    email:"meera.a@hotmail.com",   phone:"9876001122", city:"Jaipur",    date:"20 Feb 2026", items:[{name:"Royal Bandhani Kurta Set",qty:1,size:"XL",price:4199}],                                                          total:4199, status:"placed",            payMethod:"UPI"         },
  { id:"KCI-2026-08044", customer:"Deepa Iyer",       email:"deepa.iyer@gmail.com",  phone:"9943221100", city:"Kochi",     date:"18 Feb 2026", items:[{name:"Phulkari Embroidered Suit",qty:1,size:"L",price:4899},{name:"Cotton Dabu Block Print",qty:1,size:"M",price:1899}], total:6798, status:"delivered",       payMethod:"Credit Card" },
  { id:"KCI-2026-07988", customer:"Aishwarya Kumar",  email:"ash.k@gmail.com",       phone:"9654321098", city:"Mysuru",    date:"15 Feb 2026", items:[{name:"Ikat Silk Festive Kurta",qty:1,size:"S",price:3799}],                                                            total:3799, status:"delivered",         payMethod:"Net Banking" },
  { id:"KCI-2026-07940", customer:"Pooja Nair",       email:"pooja.n@yahoo.com",     phone:"9744556677", city:"Kozhikode", date:"12 Feb 2026", items:[{name:"Floral Georgette Straight",qty:2,size:"M",price:2099}],                                                          total:4198, status:"cancelled",         payMethod:"UPI"         },
  { id:"KCI-2026-07891", customer:"Leela Sharma",     email:"leela.s@gmail.com",     phone:"9867445533", city:"Ahmedabad", date:"10 Feb 2026", items:[{name:"Kantha Stitch Long Kurta",qty:1,size:"L",price:3199}],                                                           total:3199, status:"delivered",         payMethod:"COD"         },
  { id:"KCI-2026-07822", customer:"Divya Choudhary",  email:"divya.c@gmail.com",     phone:"9932211004", city:"Kolkata",   date:"7 Feb 2026",  items:[{name:"Tie-Dye Shibori Tunic",qty:2,size:"S",price:1599},{name:"Ajrakh Block Print A-Line",qty:1,size:"XS",price:2499}], total:5697, status:"delivered",       payMethod:"Credit Card" },
];

const MONTHS = ["Sep","Oct","Nov","Dec","Jan","Feb"];
const REVENUE_DATA  = [312000, 398000, 521000, 687000, 445000, 571000];
const ORDERS_DATA   = [88,     112,    147,    196,    129,    163   ];
const VISITORS_DATA = [4200,   5800,   7100,   9400,   6200,   8300  ];

const CATEGORIES_CHART = [
  { name:"Festive",      pct:28, color:"var(--primary)" },
  { name:"Designer",     pct:22, color:"var(--accent)"  },
  { name:"Casual Wear",  pct:19, color:"#5580c8"        },
  { name:"Embroidered",  pct:14, color:"#2a8c7c"        },
  { name:"Block Print",  pct:10, color:"#d4a32a"        },
  { name:"Others",       pct:7,  color:"#ccc"           },
];

const CAT_COLORS: Record<string,string> = {
  "Festive":      "var(--primary)",
  "Designer":     "var(--accent)",
  "Casual Wear":  "#5580c8",
  "Embroidered":  "#2a8c7c",
  "Block Print":  "#d4a32a",
  "Silk & Satin": "#9b7ec8",
  "Others":       "#ccc",
};

const APPAREL_SIZES = ["XS","S","M","L","XL","XXL","3XL"];
const NUMBER_SIZES  = ["28","30","32","34","36","38","40","42","44"];
const ALL_SIZES     = [...APPAREL_SIZES, ...NUMBER_SIZES];
const ALL_FABRICS = ["Cotton","Silk","Georgette","Chiffon","Rayon","Chanderi","Mul Cotton","Linen","Wool Blend"];
const ALL_CATS    = ["Casual Wear","Festive","Embroidered","Block Print","Silk & Satin","Designer"];

const STATUS_CFG: Record<OrderStatus,{bg:string;color:string;label:string}> = {
  placed:           {bg:"#eff6ff",color:"#2563eb",label:"Placed"},
  confirmed:        {bg:"#f0fdf4",color:"#15803d",label:"Confirmed"},
  shipped:          {bg:"#fef3c7",color:"#92400e",label:"Shipped"},
  out_for_delivery: {bg:"#fff7ed",color:"#c2410c",label:"Out for Delivery"},
  delivered:        {bg:"#f0fdf4",color:"#15803d",label:"Delivered ✓"},
  cancelled:        {bg:"#fff1f2",color:"#be123c",label:"Cancelled"},
};

/* ═══════════════════════════ HELPERS ════════════════════════════ */
function fmt(n: number) { return (n ?? 0).toLocaleString("en-IN"); }
function fmtR(n: number) { return "₹" + fmt(n); }

/* ──── SVG Line Chart ──── */
function LineChart({ data, color, height = 80 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 320; const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 10) - 2;
    return `${x},${y}`;
  }).join(" ");
  const fill = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 10) - 2;
    return `${x},${y}`;
  });
  const areaPath = `M ${fill[0]} L ${fill.join(" L ")} L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`lg-${color.replace(/[^a-z]/gi,"")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#lg-${color.replace(/[^a-z]/gi,"")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {fill.map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5"/>;
      })}
    </svg>
  );
}

/* ──── Bar Chart ──── */
function BarChart({ data, color, labels }: { data: number[]; color: string; labels: string[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2" style={{ height: "120px" }}>
      {data.map((v, i) => {
        const pct = (v / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-lg transition-all duration-700"
              style={{ height: `${pct}%`, background: color, minHeight: "4px", opacity: 0.85 }}
              title={String(v)}
            />
            <span className="text-xs" style={{ color: "#aaa", fontSize: "0.65rem" }}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ──── Donut Chart ──── */
function DonutChart({ slices }: { slices: { pct: number; color: string; name: string }[] }) {
  const R = 40; const cx = 60; const cy = 60;
  const circumference = 2 * Math.PI * R;
  const segments = slices.reduce<{ pct:number;color:string;name:string;dash:number;offset:number }[]>((acc, s) => {
    const dash = (s.pct / 100) * circumference;
    const offset = acc.length > 0 ? acc[acc.length-1].offset + acc[acc.length-1].dash : 0;
    return [...acc, { ...s, dash, offset }];
  }, []);
  return (
    <div className="flex items-center gap-5 flex-wrap">
      <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, flexShrink: 0 }}>
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-(seg.offset)}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        <circle cx={cx} cy={cy} r="28" fill="#fff"/>
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--primary)">Sales</text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {slices.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }}/>
            <span className="text-xs" style={{ color: "#666" }}>{s.name}</span>
            <span className="text-xs font-bold ml-auto pl-2" style={{ color: "var(--foreground)" }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ MAIN COMPONENT ═════════════════════ */
type TabId = "dashboard" | "products" | "orders" | "analytics" | "shops";

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>("dashboard");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders]     = useState<AdminOrder[]>([]);
  const [shops, setShops]       = useState<import("@/lib/api").Shop[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  type DashMonth = { label: string; value: number };
  type DashStats = {
    revenue_by_month:   DashMonth[];
    orders_by_month:    DashMonth[];
    category_breakdown: { name: string; pct: number }[];
  };
  const [dashStats, setDashStats] = useState<DashStats | null>(null);

  /* ── Add Product form ── */
  const BLANK = { name:"",mrp:"",price:"",sizes:[] as string[],description:"",deliveryDays:"5",category:"Casual Wear",fabric:"Cotton",tag:"",stock:"",imgClass:"product-img-1",colorHex:"#c97d4a",images:[] as string[],offerFrom:"",offerTo:"" };
  const [form, setForm]       = useState(BLANK);
  const [formErr, setFormErr] = useState<Record<string,string>>({});
  const [addSuccess, setAddSuccess] = useState<string|null>(null);
  const [editId, setEditId]   = useState<number | null>(null);
  const [customSizeInput, setCustomSizeInput] = useState("");

  /* ── Auth ── */
  const [authed, setAuthed]     = useState<boolean | null>(null);

  useEffect(() => {
    // Check for stored JWT token instead of legacy flag
    try {
      const token = localStorage.getItem("vygron_admin_token");
      setAuthed(!!token);
    } catch {
      setAuthed(false);
    }
  }, []);

  /* ── Load products + orders + dashboard from API once logged in ── */
  useEffect(() => {
    if (!authed) return;
    const load = async () => {
      setDataLoading(true);
      try {
        const [prodsRes, ordsRes, dashRes, shopsRes] = await Promise.all([
          apiGet<{ results: Record<string, unknown>[] } | Record<string, unknown>[]>("/products/"),
          apiGet<{ results: Record<string, unknown>[] } | Record<string, unknown>[]>("/orders/"),
          apiGet<Record<string, unknown>>("/dashboard/"),
          apiGet<import("@/lib/api").Shop[]>("/admin/shops/"),
        ]);
        const prods = Array.isArray(prodsRes) ? prodsRes : (prodsRes as { results: Record<string, unknown>[] }).results;
        const ords  = Array.isArray(ordsRes)  ? ordsRes  : (ordsRes  as { results: Record<string, unknown>[] }).results;
        setProducts(prods.map(p => productFromAPI(p) as AdminProduct));
        setOrders(ords.map(o => orderFromAPI(o) as AdminOrder));
        setDashStats(dashRes as unknown as DashStats);
        setShops(Array.isArray(shopsRes) ? shopsRes : []);
      } catch (e) {
        console.error("Failed to load data:", e);
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, [authed]);
  const [loginUser, setLoginUser]         = useState("");
  const [loginPass, setLoginPass]         = useState("");
  const [loginErr, setLoginErr]           = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  /* ── Image upload ── */
  const [dragOver, setDragOver] = useState(false);

  const handleLogin = async () => {
    try {
      await apiLogin(loginUser.trim(), loginPass);
      setAuthed(true);
      setLoginErr("");
    } catch {
      setLoginErr("Incorrect username or password. Please try again.");
    }
  };

  const readImageFiles = (files: FileList | null) => {
    if(!files) return;
    Array.from(files).forEach(file => {
      if(!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = e => {
        const url = e.target?.result as string;
        setForm(f => ({ ...f, images: [...f.images, url] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  /* ── Products view ── */
  const [prodSearch, setProdSearch] = useState("");
  const [prodCat, setProdCat]       = useState("All");

  /* ── Orders view ── */
  const [orderSearch, setOrderSearch]   = useState("");
  const [orderStatus, setOrderStatus]   = useState<"all"|OrderStatus>("all");
  const [expandedOrder, setExpandedOrder] = useState<string|null>(null);

  /* ── Confirmation dialog ── */
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog|null>(null);

  /* ── Restock dialog ── */
  const [restockDialog, setRestockDialog] = useState<{id:number;name:string}|null>(null);
  const [restockQty, setRestockQty] = useState("");
  const [restockErr, setRestockErr] = useState("");

  const handleRestock = async () => {
    const qty = parseInt(restockQty, 10);
    if(!restockQty || isNaN(qty) || qty < 1) { setRestockErr("Enter a valid quantity (min 1)."); return; }
    const prod = products.find(p => p.id === restockDialog!.id);
    if (!prod) return;
    try {
      const updated = await apiPatch<Record<string, unknown>>(`/products/${restockDialog!.id}/`, { stock: prod.stock + qty });
      setProducts(prev => prev.map(p => p.id === restockDialog!.id ? productFromAPI(updated) as AdminProduct : p));
    } catch (e) { console.error("Restock failed:", e); }
    setRestockDialog(null); setRestockQty(""); setRestockErr("");
  };

  /* ── Analytics metric toggle ── */
  const [metric, setMetric] = useState<"revenue"|"orders"|"visitors">("revenue");

  /* ── Live chart data (from API, fall back to static seed) ── */
  const chartMonths    = dashStats?.revenue_by_month.map(m => m.label)  ?? MONTHS;
  const chartRevenue   = dashStats?.revenue_by_month.map(m => m.value)  ?? REVENUE_DATA;
  const chartOrders    = dashStats?.orders_by_month.map(m => m.value)   ?? ORDERS_DATA;
  const chartCategories = dashStats?.category_breakdown.map(c => ({
    name: c.name, pct: c.pct, color: CAT_COLORS[c.name] ?? "#ccc",
  })) ?? CATEGORIES_CHART;
  const peakRevIdx   = chartRevenue.indexOf(Math.max(...chartRevenue));
  const peakRevLabel = chartMonths[peakRevIdx] ?? "";
  const peakRevVal   = chartRevenue[peakRevIdx] ?? 0;

  const metricData  = metric === "revenue" ? chartRevenue  : metric === "orders" ? chartOrders : VISITORS_DATA;
  const metricLabel = metric === "revenue" ? chartRevenue.map(fmtR) : metric === "orders" ? chartOrders.map(String) : VISITORS_DATA.map(fmt);

  /* — Derived stats — */
  const totalRevenue  = orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0);
  const totalOrders   = orders.length;
  const activeOrders  = orders.filter(o=>!["delivered","cancelled"].includes(o.status)).length;
  const totalProducts = products.length;
  const lowStock      = products.filter(p=>p.stock<15).length;
  const topSelling    = [...products].sort((a,b)=>b.sold-a.sold).slice(0,5);

  /* — Filtered products — */
  const filteredProds = useMemo(()=>products.filter(p=>{
    if(prodCat!=="All"&&p.category!==prodCat) return false;
    if(prodSearch&&!p.name.toLowerCase().includes(prodSearch.toLowerCase())) return false;
    return true;
  }),[products,prodCat,prodSearch]);

  /* — Filtered orders — */
  const filteredOrders = useMemo(()=>orders.filter(o=>{
    if(orderStatus!=="all"&&o.status!==orderStatus) return false;
    if(orderSearch&&!o.customer.toLowerCase().includes(orderSearch.toLowerCase())&&!o.id.includes(orderSearch)) return false;
    return true;
  }),[orders,orderStatus,orderSearch]);

  /* — Toggle home display — */
  const toggleHome = async (id:number) => {
    try {
      const updated = await apiPatch<Record<string, unknown>>(`/products/${id}/toggle_home/`);
      setProducts(prev => prev.map(p => p.id === id ? productFromAPI(updated) as AdminProduct : p));
    } catch (e) { console.error("toggleHome failed:", e); }
  };

  /* — Toggle order status — */
  const nextStatus: Record<OrderStatus,OrderStatus|null> = { placed:"confirmed",confirmed:"shipped",shipped:"out_for_delivery",out_for_delivery:"delivered",delivered:null,cancelled:null };
  const advanceOrder = async (id:string) => {
    try {
      const updated = await apiPatch<Record<string, unknown>>(`/orders/${id}/advance_status/`);
      setOrders(prev => prev.map(o => o.id === id ? orderFromAPI(updated) as AdminOrder : o));
    } catch (e) { console.error("advanceOrder failed:", e); }
  };
  const cancelOrder = async (id:string) => {
    try {
      const updated = await apiPatch<Record<string, unknown>>(`/orders/${id}/cancel/`);
      setOrders(prev => prev.map(o => o.id === id ? orderFromAPI(updated) as AdminOrder : o));
    } catch (e) { console.error("cancelOrder failed:", e); }
  };

  /* — Add / Edit Product — */
  const toggleSize = (s:string) => setForm(f=>({...f,sizes:f.sizes.includes(s)?f.sizes.filter(x=>x!==s):[...f.sizes,s]}));

  const loadEdit = (p: AdminProduct) => {
    setEditId(p.id);
    setFormErr({});
    setAddSuccess(null);
    setForm({ name:p.name??"", mrp:String(p.mrp||0), price:String(p.price||0), sizes:p.sizes??[], description:p.description??"", deliveryDays:String(p.deliveryDays||5), category:p.category??"Casual Wear", fabric:p.fabric??"Cotton", tag:p.tag??"", stock:String(p.stock??0), imgClass:p.imgClass??"product-img-1", colorHex:p.colorHex??"#c97d4a", images:p.images??[], offerFrom:p.offerFrom??"", offerTo:p.offerTo??"" });
    setCustomSizeInput("");
    // reset file input so the same file can be re-selected after clearing
    const fi = document.getElementById("img-upload-input") as HTMLInputElement|null;
    if(fi) fi.value = "";
    setTab("products");
    setTimeout(()=>document.getElementById("add-product-section")?.scrollIntoView({behavior:"smooth"}),100);
  };

  const validateForm = () => {
    const e: Record<string,string> = {};
    if(!form.name.trim())            e.name="Product name is required.";
    if(!form.mrp||isNaN(+form.mrp)) e.mrp="Enter a valid MRP.";
    if(!form.price||isNaN(+form.price)) e.price="Enter a valid selling price.";
    if(+form.price>+form.mrp)       e.price="Selling price cannot exceed MRP.";
    if(form.sizes.length===0)       e.sizes="Select at least one size.";
    if(!form.description.trim())    e.description="Description is required.";
    if(!form.stock||isNaN(+form.stock)) e.stock="Enter valid stock quantity.";
    setFormErr(e);
    return Object.keys(e).length===0;
  };

  const handleSubmit = async () => {
    if(!validateForm()) return;
    const offerFrom = form.offerFrom||undefined;
    const offerTo   = form.offerTo||undefined;
    const payload = productToAPI({
      name: form.name, mrp: +form.mrp, price: +form.price, sizes: form.sizes,
      description: form.description, deliveryDays: +form.deliveryDays,
      category: form.category, fabric: form.fabric, tag: form.tag||undefined,
      stock: +form.stock, imgClass: form.imgClass, colorHex: form.colorHex,
      images: form.images, offerFrom, offerTo,
    });
    try {
      const wasEdit = editId !== null;
      if(wasEdit){
        const updated = await apiPatch<Record<string, unknown>>(`/products/${editId}/`, payload);
        setProducts(prev => prev.map(p => p.id === editId ? productFromAPI(updated) as AdminProduct : p));
        setEditId(null);
      } else {
        const created = await apiPost<Record<string, unknown>>("/products/", payload);
        setProducts(prev => [productFromAPI(created) as AdminProduct, ...prev]);
      }
      setForm(BLANK);
      setFormErr({});
      setAddSuccess(wasEdit ? "Product updated successfully!" : "Product added successfully!");
      setTimeout(()=>setAddSuccess(null),4000);
    } catch (e) { console.error("handleSubmit failed:", e); }
  };

  const deleteProduct = async (id:number) => {
    try {
      await apiDelete(`/products/${id}/`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error("deleteProduct failed:", e); }
  };

  const markOutOfStock = async (id:number) => {
    try {
      const updated = await apiPatch<Record<string, unknown>>(`/products/${id}/out_of_stock/`);
      setProducts(prev => prev.map(p => p.id === id ? productFromAPI(updated) as AdminProduct : p));
    } catch (e) { console.error("markOutOfStock failed:", e); }
  };

  const printInvoice = (order: AdminOrder) => {
    const win = window.open("","_blank","width=820,height=750");
    if(!win) return;
    const itemsHtml = order.items.map(item=>`
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f0ebe5;">${item.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0ebe5;text-align:center;">${item.size}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0ebe5;text-align:center;">${item.qty}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0ebe5;text-align:right;">₹${item.price.toLocaleString("en-IN")}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0ebe5;text-align:right;">₹${(item.price*item.qty).toLocaleString("en-IN")}</td>
      </tr>`).join("");
    win.document.write(`<!DOCTYPE html>
<html><head><title>Invoice ${order.id}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:"Segoe UI",Arial,sans-serif;color:#1a1a1a;background:#fff;padding:40px;}
  .wrap{max-width:700px;margin:0 auto;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #7b1e3a;margin-bottom:32px;}
  .brand{font-family:Georgia,serif;font-size:2.2rem;font-weight:700;letter-spacing:0.15em;color:#7b1e3a;line-height:1;}
  .tagline{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:#c97d4a;margin-top:4px;}
  .inv-title{font-size:1.5rem;font-weight:700;color:#7b1e3a;text-align:right;}
  .inv-meta{font-size:0.82rem;color:#888;margin-top:3px;text-align:right;}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;}
  .info-label{font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin-bottom:6px;}
  .info-block p{font-size:0.85rem;color:#555;line-height:1.7;}
  .info-block strong{color:#1a1a1a;}
  table{width:100%;border-collapse:collapse;margin-bottom:0;}
  thead tr{background:#7b1e3a;}
  thead th{padding:10px 14px;color:#fff;font-size:0.72rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;text-align:left;}
  thead th:nth-child(2),thead th:nth-child(3){text-align:center;}
  thead th:nth-child(4),thead th:nth-child(5){text-align:right;}
  .total-row td{padding:14px 14px;font-weight:700;font-size:1rem;color:#7b1e3a;background:#fff8f0;}
  .footer{margin-top:32px;padding-top:20px;border-top:1px solid #e8e2dc;text-align:center;color:#aaa;font-size:0.75rem;line-height:1.8;}
  @media print{body{padding:20px;} .wrap{max-width:100%;}}
</style></head>
<body><div class="wrap">
  <div class="header">
    <div>
      <div class="brand">KURTHĪ</div>
      <div class="tagline">Couture · Est. 2024</div>
    </div>
    <div>
      <div class="inv-title">INVOICE</div>
      <div class="inv-meta">${order.id}</div>
      <div class="inv-meta">Date: ${order.date}</div>
    </div>
  </div>
  <div class="grid2">
    <div class="info-block">
      <div class="info-label">Bill To</div>
      <p><strong>${order.customer}</strong></p>
      <p>${order.city}</p>
      <p>${order.email}</p>
      <p>${order.phone}</p>
    </div>
    <div class="info-block" style="text-align:right;">
      <div class="info-label" style="text-align:right;">Order Info</div>
      <p><strong>Order No:</strong> ${order.id}</p>
      <p><strong>Date:</strong> ${order.date}</p>
      <p><strong>Payment:</strong> ${order.payMethod}</p>
      <p><strong>Status:</strong> ${STATUS_CFG[order.status].label}</p>
    </div>
  </div>
  <table>
    <thead><tr>
      <th>Item</th><th>Size</th><th>Qty</th><th>Unit Price</th><th>Amount</th>
    </tr></thead>
    <tbody>
      ${itemsHtml}
      <tr class="total-row">
        <td colspan="4" style="text-align:right;padding:14px;">Total Amount</td>
        <td style="text-align:right;padding:14px;">₹${order.total.toLocaleString("en-IN")}</td>
      </tr>
    </tbody>
  </table>
  <div class="footer">
    <p>Thank you for shopping with KurthĪ Couture!</p>
    <p>For support: support@kurthi.in &nbsp;·&nbsp; +91 98765 43210</p>
    <p style="margin-top:8px;font-size:0.7rem;">This is a computer-generated invoice and does not require a signature.</p>
  </div>
</div>
<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};}</script>
</body></html>`);
    win.document.close();
  };

  /* ─────── SIDEBAR TABS ─────── */
  const TABS: {id:TabId;label:string;icon:string}[] = [
    {id:"dashboard", label:"Dashboard",   icon:"📊"},
    {id:"products",  label:"Products",    icon:"🥻"},
    {id:"orders",    label:"Orders",      icon:"📦"},
    {id:"shops",     label:"Shops",       icon:"🏪"},
    {id:"analytics", label:"Analytics",   icon:"📈"},
  ];

  /* ── Password gate ── */
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

  return (
    <div style={{minHeight:"100vh",background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-jost,sans-serif)",padding:"16px"}}>
      <div style={{width:"100%",maxWidth:"400px",background:"#fff",borderRadius:"24px",padding:"40px 36px",boxShadow:"0 32px 80px rgba(0,0,0,0.35)"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"2rem",fontWeight:700,letterSpacing:"0.15em",color:"var(--primary)",lineHeight:1}}>KURTHĪ</div>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.3em",textTransform:"uppercase",color:"var(--accent)",marginTop:"4px",marginBottom:"24px"}}>ADMIN PANEL</div>
          <div style={{width:"56px",height:"56px",borderRadius:"16px",background:"var(--cream)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",margin:"0 auto 16px"}}>🔐</div>
          <h2 style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.4rem",fontWeight:700,color:"var(--primary)",margin:0}}>Admin Sign In</h2>
          <p style={{color:"#aaa",fontSize:"0.85rem",marginTop:"6px"}}>Enter your credentials to access the dashboard</p>
        </div>
        {loginErr&&(
          <div style={{background:"#fef2f2",border:"1px solid #fecdd3",color:"#dc2626",borderRadius:"12px",padding:"10px 14px",fontSize:"0.8rem",display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"}}>
            <span>⚠</span>{loginErr}
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          <div>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:600,letterSpacing:"0.06em",color:"#666",marginBottom:"6px"}}>USERNAME</label>
            <input
              type="text" value={loginUser} onChange={e=>setLoginUser(e.target.value)}
              placeholder="Enter username"
              style={{width:"100%",padding:"12px 16px",borderRadius:"12px",border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)",fontSize:"0.9rem",color:"var(--foreground)",outline:"none",boxSizing:"border-box"}}
              onFocus={e=>(e.currentTarget.style.borderColor="var(--primary)")}
              onBlur={e=>(e.currentTarget.style.borderColor="var(--cream-dark)")}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            />
          </div>
          <div>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:600,letterSpacing:"0.06em",color:"#666",marginBottom:"6px"}}>PASSWORD</label>
            <div style={{position:"relative"}}>
              <input
                type={showLoginPass?"text":"password"} value={loginPass} onChange={e=>setLoginPass(e.target.value)}
                placeholder="Enter password"
                style={{width:"100%",padding:"12px 48px 12px 16px",borderRadius:"12px",border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)",fontSize:"0.9rem",color:"var(--foreground)",outline:"none",boxSizing:"border-box"}}
                onFocus={e=>(e.currentTarget.style.borderColor="var(--primary)")}
                onBlur={e=>(e.currentTarget.style.borderColor="var(--cream-dark)")}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              />
              <button type="button" onClick={()=>setShowLoginPass(s=>!s)} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#aaa",padding:0,display:"flex"}}>
                {showLoginPass
                  ?<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  :<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="btn-primary"
            style={{width:"100%",padding:"14px",borderRadius:"16px",fontWeight:600,fontSize:"0.85rem",letterSpacing:"0.12em",textTransform:"uppercase",marginTop:"8px",cursor:"pointer"}}
          >
            Sign In to Dashboard
          </button>
        </div>
        <p style={{textAlign:"center",fontSize:"0.72rem",color:"#ccc",marginTop:"24px"}}>© 2026 Vygron Hub · Admin Access Only</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f8f5f2",fontFamily:"var(--font-jost,sans-serif)"}}>

      {/* ── TOP BAR ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-16" style={{background:"var(--primary)",boxShadow:"0 2px 20px rgba(123,30,58,0.3)"}}>
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xl font-bold tracking-[0.15em]" style={{fontFamily:"var(--font-cormorant,serif)",color:"#fff",lineHeight:1}}>KURTHĪ</div>
            <div className="text-xs tracking-[0.3em] uppercase" style={{color:"rgba(255,255,255,0.6)",fontSize:"0.55rem"}}>ADMIN PANEL</div>
          </div>
          <div className="h-6 w-px mx-2" style={{background:"rgba(255,255,255,0.2)"}}/>
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map(t=>(
              <button
                key={t.id}
                onClick={()=>setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all"
                style={{background:tab===t.id?"rgba(255,255,255,0.2)":"transparent",color:tab===t.id?"#fff":"rgba(255,255,255,0.65)",border:"none",cursor:"pointer"}}
              >
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.85)",textDecoration:"none"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            View Site
          </Link>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{background:"rgba(255,255,255,0.2)",color:"#fff"}}>A</div>
          <button onClick={()=>{clearToken();setAuthed(false);setProducts([]);setOrders([]);}} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.18)",cursor:"pointer"}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </header>

      {/* ── MOBILE TAB BAR ── */}
      <nav className="md:hidden flex items-center justify-around px-2 py-2 sticky top-16 z-40" style={{background:"#fff",borderBottom:"1px solid var(--cream-dark)"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all" style={{background:tab===t.id?"var(--cream)":"transparent",border:"none",cursor:"pointer"}}>
            <span style={{fontSize:"1.1rem"}}>{t.icon}</span>
            <span className="text-xs font-medium" style={{color:tab===t.id?"var(--primary)":"#aaa"}}>{t.label}</span>
          </button>
        ))}
      </nav>

      {dataLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(255,255,255,0.7)"}}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{borderColor:"var(--primary)",borderTopColor:"transparent"}}/>
            <span className="text-sm font-medium" style={{color:"var(--primary)",fontFamily:"var(--font-jost,sans-serif)"}}>Loading...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ════════════ DASHBOARD ════════════ */}
        {tab==="dashboard" && (
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"clamp(1.8rem,3vw,2.5rem)",color:"var(--primary)"}}>Dashboard</h1>
              <p className="text-sm mt-1" style={{color:"#888"}}>Welcome back, Admin. Here&apos;s your store at a glance.</p>
            </div>

            {/* — KPI Cards — */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {label:"Total Revenue",  value:fmtR(totalRevenue),  sub:"+12% this month",  icon:"💰", iconBg:"#fff8f0", trend:true  },
                {label:"Total Orders",   value:fmt(totalOrders),     sub:`${activeOrders} active`,      icon:"📦", iconBg:"#f0f8ff", trend:true  },
                {label:"Products",       value:String(totalProducts),sub:`${lowStock} low stock`,       icon:"🥻", iconBg:"#fff0f8", trend:false },
                {label:"Avg Order Value",value:fmtR(Math.round(totalRevenue/orders.filter(o=>o.status!=="cancelled").length)), sub:"per order", icon:"📊", iconBg:"#f0fff8", trend:true  },
              ].map(k=>(
                <div key={k.label} className="rounded-2xl p-5" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold tracking-widest uppercase" style={{color:"#aaa"}}>{k.label}</span>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{background:k.iconBg}}>{k.icon}</div>
                  </div>
                  <div className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.8rem",color:"var(--primary)",lineHeight:1}}>{k.value}</div>
                  <div className="flex items-center gap-1 mt-2">
                    {k.trend&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>}
                    <span className="text-xs font-medium" style={{color:k.trend?"#16a34a":"#888"}}>{k.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* — Charts row — */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Trend */}
              <div className="lg:col-span-2 rounded-2xl p-6" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.25rem",color:"var(--primary)"}}>Revenue Trend</h2>
                  <span className="text-xs px-2 py-1 rounded-lg" style={{background:"var(--cream)",color:"var(--accent)",fontWeight:600}}>Last 6 Months</span>
                </div>
                <p className="text-xs mb-5" style={{color:"#aaa"}}>{chartMonths[0]} — {chartMonths[chartMonths.length-1]}</p>
                <div className="flex items-end justify-between mb-1" style={{height:"28px"}}>
                  {chartRevenue.map((v,i)=>(
                    <span key={i} className="text-xs text-center flex-1" style={{color:"#bbb",fontSize:"0.6rem"}}>
                      {v>=100000?`₹${(v/100000).toFixed(1)}L`:`₹${Math.round(v/1000)}K`}
                    </span>
                  ))}
                </div>
                <BarChart data={chartRevenue} color="var(--primary)" labels={chartMonths}/>
                <div className="mt-4 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{background:"var(--primary)"}}/>
                    <span className="text-xs" style={{color:"#888"}}>Monthly Revenue</span>
                  </div>
                  <span className="ml-auto text-xs font-bold" style={{color:"var(--primary)"}}>Peak: {peakRevLabel} {peakRevVal>=100000?`₹${(peakRevVal/100000).toFixed(2)}L`:`₹${Math.round(peakRevVal/1000)}K`}</span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
                <h2 className="font-bold mb-1" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.25rem",color:"var(--primary)"}}>Sales by Category</h2>
                <p className="text-xs mb-5" style={{color:"#aaa"}}>All-time distribution</p>
                <DonutChart slices={chartCategories}/>
              </div>
            </div>

            {/* — Top Selling + Recent Orders — */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Selling */}
              <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.25rem",color:"var(--primary)"}}>Top Selling Products</h2>
                  <button onClick={()=>setTab("products")} className="text-xs font-semibold" style={{color:"var(--accent)",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>View All</button>
                </div>
                <div className="flex flex-col gap-4">
                  {topSelling.map((p,i)=>{
                    const pct=Math.round((p.sold/(topSelling[0].sold))*100);
                    return(
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="text-lg font-bold w-5 text-center flex-shrink-0" style={{fontFamily:"var(--font-cormorant,serif)",color:i===0?"var(--accent)":"#ccc"}}>#{i+1}</span>
                        <div className={`${p.imgClass} w-11 h-12 rounded-xl flex-shrink-0 flex items-center justify-center`}>
                          <span style={{fontSize:"1.4rem",opacity:0.25}}>🥻</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-tight truncate" style={{fontFamily:"var(--font-cormorant,serif)",color:"var(--foreground)"}}>{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 rounded-full" style={{background:"var(--cream-dark)"}}>
                              <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:`linear-gradient(90deg,var(--primary),var(--accent))`}}/>
                            </div>
                            <span className="text-xs font-bold flex-shrink-0" style={{color:"var(--primary)"}}>{fmt(p.sold)}</span>
                          </div>
                        </div>
                        <span className="text-sm font-bold flex-shrink-0" style={{color:"var(--primary)"}}>{fmtR(p.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.25rem",color:"var(--primary)"}}>Recent Orders</h2>
                  <button onClick={()=>setTab("orders")} className="text-xs font-semibold" style={{color:"var(--accent)",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>View All</button>
                </div>
                <div className="flex flex-col gap-3">
                  {orders.slice(0,6).map(o=>{
                    const cfg=STATUS_CFG[o.status];
                    return(
                      <div key={o.id} className="flex items-center justify-between gap-2 py-2" style={{borderBottom:"1px solid var(--cream-dark)"}}>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{color:"var(--foreground)"}}>{o.customer}</p>
                          <p className="text-xs" style={{color:"#aaa"}}>{o.id} · {o.date}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{background:cfg.bg,color:cfg.color}}>{cfg.label}</span>
                          <span className="text-sm font-bold" style={{color:"var(--primary)"}}>{fmtR(o.total)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* — Low Stock Alert — */}
            {lowStock>0&&(
              <div className="rounded-2xl p-5" style={{background:"#fff7ed",border:"1px solid #fed7aa"}}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">⚠️</span>
                  <h3 className="font-bold text-base" style={{color:"#c2410c"}}>Low Stock Alert — {lowStock} product{lowStock>1?"s":""}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {products.filter(p=>p.stock<15).map(p=>(
                    <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:"#fff",border:"1px solid #fed7aa"}}>
                      <span className="text-sm font-semibold" style={{color:"var(--foreground)"}}>{p.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{background:"#fef2f2",color:"#dc2626"}}>{p.stock} left</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════ PRODUCTS ════════════ */}
        {tab==="products" && (
          <div className="flex flex-col gap-8">
            <h1 className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"clamp(1.8rem,3vw,2.5rem)",color:"var(--primary)"}}>Products</h1>

            {/* ── Add / Edit Product Form ── */}
            <div id="add-product-section" className="rounded-2xl p-6 sm:p-8" style={{background:"#fff",border:`2px solid ${editId?"var(--accent)":"var(--cream-dark)"}`,boxShadow:"0 2px 20px rgba(0,0,0,0.05)"}}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.5rem",color:editId?"var(--accent)":"var(--primary)"}}>
                  {editId?"✏️ Edit Product":"➕ Add New Product"}
                </h2>
                {editId&&<button onClick={()=>{setEditId(null);setForm(BLANK);setFormErr({});setAddSuccess(null);}} className="text-sm px-4 py-2 rounded-xl" style={{background:"var(--cream)",color:"#888",border:"none",cursor:"pointer"}}>Cancel Edit</button>}
              </div>

              {addSuccess&&(
                <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{background:"#f0fdf4",border:"1px solid #bbf7d0",color:"#15803d"}}>
                  ✓ {addSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Name */}
                <div className="lg:col-span-2">
                  <ALabel>Product Name *</ALabel>
                  <AInput value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. Gulabi Anarkali Suit" err={formErr.name}/>
                </div>
                {/* ── Images ── */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <ALabel>Product Images</ALabel>
                  {/* Drop zone */}
                  <div
                    onClick={()=>document.getElementById("img-upload-input")?.click()}
                    onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                    onDragLeave={()=>setDragOver(false)}
                    onDrop={e=>{e.preventDefault();setDragOver(false);readImageFiles(e.dataTransfer.files);}}
                    className="w-full rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                    style={{border:`2px dashed ${dragOver?"var(--primary)":"var(--cream-dark)"}`,background:dragOver?"#fff5f8":"#fdfbf9",minHeight:"120px",padding:"24px 20px"}}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{background:"var(--cream)"}}>{dragOver?"📂":"📸"}</div>
                    <p className="text-sm font-semibold" style={{color:dragOver?"var(--primary)":"#777"}}>{dragOver?"Drop images here…":"Click to upload or drag & drop"}</p>
                    <p className="text-xs" style={{color:"#bbb"}}>JPG · PNG · WEBP · Multiple images allowed</p>
                    <input id="img-upload-input" type="file" multiple accept="image/*" className="hidden" onChange={e=>readImageFiles(e.target.files)}/>
                  </div>
                  {/* Previews */}
                  {form.images.length>0&&(
                    <div className="flex flex-wrap gap-3 mt-3">
                      {form.images.map((src,idx)=>(
                        <div key={idx} className="relative group rounded-xl overflow-hidden flex-shrink-0" style={{width:"80px",height:"88px",border:`2px solid ${idx===0?"var(--primary)":"var(--cream-dark)"}`}}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mediaUrl(src)} alt={`img-${idx+1}`} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          <button
                            type="button"
                            onClick={e=>{e.stopPropagation();removeImage(idx);}}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{background:"rgba(220,38,38,0.92)",color:"#fff",border:"none",cursor:"pointer",lineHeight:1}}
                          >×</button>
                          {idx===0&&<div className="absolute bottom-0 left-0 right-0 py-0.5 text-center font-bold" style={{background:"rgba(123,30,58,0.88)",color:"#fff",fontSize:"0.52rem",letterSpacing:"0.1em"}}>MAIN</div>}
                        </div>
                      ))}
                      <div
                        onClick={()=>document.getElementById("img-upload-input")?.click()}
                        className="flex-shrink-0 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
                        style={{width:"80px",height:"88px",border:"2px dashed var(--cream-dark)",background:"#fdfbf9",color:"#bbb",gap:"4px"}}
                      >
                        <span style={{fontSize:"1.4rem"}}>+</span>
                        <span style={{fontSize:"0.6rem",fontWeight:600}}>Add more</span>
                      </div>
                    </div>
                  )}
                  {/* Fallback gradient */}
                </div>
                {/* MRP */}
                <div>
                  <ALabel>MRP (₹) *</ALabel>
                  <AInput value={form.mrp} onChange={v=>setForm(f=>({...f,mrp:v}))} placeholder="e.g. 4999" type="number" err={formErr.mrp}/>
                </div>
                {/* Selling Price */}
                <div>
                  <ALabel>Selling Price (₹) *</ALabel>
                  <AInput value={form.price} onChange={v=>setForm(f=>({...f,price:v}))} placeholder="e.g. 3499" type="number" err={formErr.price}/>
                  {form.mrp&&form.price&&+form.price<+form.mrp&&(
                    <p className="text-xs mt-1 font-semibold" style={{color:"#16a34a"}}>✓ {Math.round(((+form.mrp-+form.price)/+form.mrp)*100)}% discount applied</p>
                  )}
                </div>
                {/* Stock */}
                <div>
                  <ALabel>Stock Quantity *</ALabel>
                  <AInput value={form.stock} onChange={v=>setForm(f=>({...f,stock:v}))} placeholder="e.g. 50" type="number" err={formErr.stock}/>
                </div>
                {/* Delivery Days */}
                <div>
                  <ALabel>Delivery Days *</ALabel>
                  <select value={form.deliveryDays} onChange={e=>setForm(f=>({...f,deliveryDays:e.target.value}))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)",color:"var(--foreground)"}}>
                    {[2,3,4,5,6,7,8,10,14].map(d=><option key={d} value={d}>{d} days</option>)}
                  </select>
                </div>
                {/* Category */}
                <div>
                  <ALabel>Category *</ALabel>
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)",color:"var(--foreground)"}}>
                    {ALL_CATS.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Fabric */}
                <div>
                  <ALabel>Fabric *</ALabel>
                  <select value={form.fabric} onChange={e=>setForm(f=>({...f,fabric:e.target.value}))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)",color:"var(--foreground)"}}>
                    {ALL_FABRICS.map(x=><option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                {/* Tag */}
                <div>
                  <ALabel>Badge Tag</ALabel>
                  <select value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value}))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)",color:"var(--foreground)"}}>
                    <option value="">None</option>
                    {["New","Hot","Sale","Luxe"].map(x=><option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                {/* Color */}
                <div>
                  <ALabel>Accent Color</ALabel>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.colorHex} onChange={e=>setForm(f=>({...f,colorHex:e.target.value}))} className="h-11 w-16 rounded-xl cursor-pointer border-0 p-0.5" style={{border:"1.5px solid var(--cream-dark)"}}/>
                    <span className="text-sm" style={{color:"#888"}}>{form.colorHex}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <ALabel>Description *</ALabel>
                  <textarea
                    value={form.description}
                    onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                    placeholder="Describe the product — fabric, style, occasion, care instructions…"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                    style={{border:`1.5px solid ${formErr.description?"#fca5a5":"var(--cream-dark)"}`,fontFamily:"var(--font-jost,sans-serif)",color:"var(--foreground)"}}
                    onFocus={e=>(e.currentTarget.style.borderColor="var(--primary)")}
                    onBlur={e=>(e.currentTarget.style.borderColor=formErr.description?"#fca5a5":"var(--cream-dark)")}
                  />
                  {formErr.description&&<p className="text-xs mt-1" style={{color:"#dc2626"}}>{formErr.description}</p>}
                </div>

                {/* Sizes */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <ALabel>Available Sizes *</ALabel>

                  {/* Apparel sizes */}
                  <p className="text-xs font-semibold mb-2 mt-1" style={{color:"#aaa",letterSpacing:"0.06em",textTransform:"uppercase"}}>Apparel</p>
                  <div className="flex flex-wrap gap-2">
                    {APPAREL_SIZES.map(s=>(
                      <button key={s} type="button" onClick={()=>toggleSize(s)}
                        className="w-14 h-10 rounded-xl text-sm font-semibold transition-all"
                        style={{background:form.sizes.includes(s)?"var(--primary)":"#fff",color:form.sizes.includes(s)?"#fff":"var(--foreground)",border:form.sizes.includes(s)?"2px solid var(--primary)":"1.5px solid var(--cream-dark)",cursor:"pointer"}}
                      >{s}</button>
                    ))}
                  </div>

                  {/* Numeric sizes */}
                  <p className="text-xs font-semibold mb-2 mt-4" style={{color:"#aaa",letterSpacing:"0.06em",textTransform:"uppercase"}}>Numeric (inches)</p>
                  <div className="flex flex-wrap gap-2">
                    {NUMBER_SIZES.map(s=>(
                      <button key={s} type="button" onClick={()=>toggleSize(s)}
                        className="w-14 h-10 rounded-xl text-sm font-semibold transition-all"
                        style={{background:form.sizes.includes(s)?"var(--accent)":"#fff",color:form.sizes.includes(s)?"#fff":"var(--foreground)",border:form.sizes.includes(s)?"2px solid var(--accent)":"1.5px solid var(--cream-dark)",cursor:"pointer"}}
                      >{s}</button>
                    ))}
                  </div>

                  {/* Custom sizes */}
                  <p className="text-xs font-semibold mb-2 mt-4" style={{color:"#aaa",letterSpacing:"0.06em",textTransform:"uppercase"}}>Custom</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {form.sizes.filter(s=>!ALL_SIZES.includes(s)).map(s=>(
                      <span key={s} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold" style={{background:"var(--primary)",color:"#fff"}}>
                        {s}
                        <button type="button" onClick={()=>toggleSize(s)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.8)",cursor:"pointer",lineHeight:1,fontSize:"1rem",padding:"0 0 0 4px"}}>×</button>
                      </span>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customSizeInput}
                        onChange={e=>setCustomSizeInput(e.target.value.toUpperCase())}
                        onKeyDown={e=>{
                          if(e.key==="Enter"||e.key===","){
                            e.preventDefault();
                            const v=customSizeInput.trim();
                            if(v&&!form.sizes.includes(v)){toggleSize(v);}
                            setCustomSizeInput("");
                          }
                        }}
                        placeholder="e.g. 46 or XXXL"
                        className="px-3 py-2 rounded-xl text-sm outline-none"
                        style={{border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)",width:"140px"}}
                        onFocus={e=>(e.currentTarget.style.borderColor="var(--primary)")}
                        onBlur={e=>(e.currentTarget.style.borderColor="var(--cream-dark)")}
                      />
                      <button
                        type="button"
                        onClick={()=>{const v=customSizeInput.trim();if(v&&!form.sizes.includes(v)){toggleSize(v);}setCustomSizeInput("");}}
                        className="px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{background:"var(--cream)",color:"var(--primary)",border:"1.5px solid var(--cream-dark)",cursor:"pointer"}}
                      >+ Add</button>
                    </div>
                  </div>

                  {/* Selected summary */}
                  {form.sizes.length>0&&(
                    <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                      <span className="text-xs" style={{color:"#aaa"}}>Selected:</span>
                      {form.sizes.map(s=>(
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"var(--cream)",color:"var(--primary)"}}>{s}</span>
                      ))}
                    </div>
                  )}
                  {formErr.sizes&&<p className="text-xs mt-1.5" style={{color:"#dc2626"}}>{formErr.sizes}</p>}
                </div>

                {/* Offer Date */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <div className="rounded-2xl p-5" style={{background:"#fff8f0",border:"1.5px dashed var(--accent)"}}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">🏷️</span>
                      <ALabel>Sale / Offer Period <span style={{fontWeight:400,color:"#bbb"}}>(optional)</span></ALabel>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{color:"#888"}}>Offer Starts</label>
                        <input
                          type="date"
                          value={form.offerFrom}
                          onChange={e=>setForm(f=>({...f,offerFrom:e.target.value}))}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)",color:"var(--foreground)",background:"#fff"}}
                          onFocus={e=>(e.currentTarget.style.borderColor="var(--accent)")}
                          onBlur={e=>(e.currentTarget.style.borderColor="var(--cream-dark)")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{color:"#888"}}>Offer Ends</label>
                        <input
                          type="date"
                          value={form.offerTo}
                          min={form.offerFrom||undefined}
                          onChange={e=>setForm(f=>({...f,offerTo:e.target.value}))}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)",color:"var(--foreground)",background:"#fff"}}
                          onFocus={e=>(e.currentTarget.style.borderColor="var(--accent)")}
                          onBlur={e=>(e.currentTarget.style.borderColor="var(--cream-dark)")}
                        />
                      </div>
                    </div>
                    {form.offerFrom&&form.offerTo&&(
                      <p className="text-xs mt-3 font-semibold" style={{color:"var(--accent)"}}>
                        🏷️ Offer active from {new Date(form.offerFrom).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} to {new Date(form.offerTo).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                      </p>
                    )}
                    {form.offerFrom&&!form.offerTo&&(
                      <p className="text-xs mt-2" style={{color:"#aaa"}}>Set an end date to complete the offer period.</p>
                    )}
                    {(form.offerFrom||form.offerTo)&&(
                      <button type="button" onClick={()=>setForm(f=>({...f,offerFrom:"",offerTo:""}))} className="mt-3 text-xs font-semibold" style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",padding:0}}>✕ Clear dates</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={handleSubmit} className="btn-primary px-10 py-4 rounded-2xl text-sm font-semibold tracking-wider uppercase" style={{cursor:"pointer"}}>
                  {editId?"Update Product":"Add Product"}
                </button>
                <button onClick={()=>{setForm(BLANK);setFormErr({});setEditId(null);setCustomSizeInput("");setAddSuccess(null);}} className="btn-outline px-6 py-4 rounded-2xl text-sm font-semibold" style={{cursor:"pointer"}}>
                  Clear
                </button>
              </div>
            </div>

            {/* ── Home Page Display Section ── */}
            <div className="rounded-2xl p-5" style={{background:"linear-gradient(135deg,#fff8f0,#fff5f8)",border:"2px dashed var(--accent)"}}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">🏠</span>
                <h3 className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.2rem",color:"var(--primary)"}}>Home Page Display</h3>
                <span className="ml-auto text-xs px-3 py-1 rounded-full font-semibold" style={{background:"var(--cream)",color:"var(--accent)"}}>
                  {products.filter(p=>p.showOnHome).length} shown on home
                </span>
              </div>
              <p className="text-sm mb-4" style={{color:"#888"}}>Toggle which products appear in the home page &quot;New Arrivals&quot; section.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map(p=>(
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{background:"#fff",border:`1.5px solid ${p.showOnHome?"var(--primary)":"var(--cream-dark)"}`}}>
                    <div className={`${p.imgClass} w-10 h-11 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center`}>
                      {p.images?.[0]
                        ? <img src={mediaUrl(p.images[0])} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}}/>
                        : <span style={{fontSize:"1.1rem",opacity:0.3}}>🥻</span>
                      }
                    </div>
                    <span className="text-xs font-semibold flex-1 min-w-0 leading-tight" style={{color:"var(--foreground)",fontFamily:"var(--font-cormorant,serif)"}}>{p.name}</span>
                    <button
                      onClick={()=>toggleHome(p.id)}
                      className="flex-shrink-0 w-10 h-6 rounded-full transition-all duration-300 relative"
                      style={{background:p.showOnHome?"var(--primary)":"#ddd",border:"none",cursor:"pointer"}}
                    >
                      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300" style={{left:p.showOnHome?"calc(100% - 22px)":"2px"}}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Product List ── */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <h2 className="font-bold flex-1" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.4rem",color:"var(--primary)"}}>All Products ({filteredProds.length})</h2>
                <input type="text" placeholder="Search products…" value={prodSearch} onChange={e=>setProdSearch(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm outline-none w-48" style={{border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)"}}/>
                <select value={prodCat} onChange={e=>setProdCat(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm outline-none" style={{border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)"}}>
                  <option value="All">All Categories</option>
                  {ALL_CATS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:"var(--cream)",borderBottom:"1px solid var(--cream-dark)"}}>
                        {["Product","Category","MRP","Price","Stock","Sold","Rating","Home","Actions"].map(h=>(
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-widest uppercase whitespace-nowrap" style={{color:"#888"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProds.map((p,i)=>(
                        <tr key={p.id} style={{borderBottom:"1px solid var(--cream-dark)",background:i%2===0?"#fff":"#fffaf7"}}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`${p.imgClass} w-9 h-10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center`}>
                                {p.images?.[0]
                                  ? <img src={mediaUrl(p.images[0])} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}}/>
                                  : <span style={{fontSize:"1rem",opacity:0.3}}>🥻</span>
                                }
                              </div>
                              <div>
                                <p className="font-semibold leading-tight whitespace-nowrap" style={{fontFamily:"var(--font-cormorant,serif)",color:"var(--foreground)",maxWidth:"160px",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</p>
                                <p className="text-xs mt-0.5" style={{color:"#aaa"}}>{p.fabric} · {p.deliveryDays}d</p>
                                {p.offerFrom&&p.offerTo&&(()=>{
                                  const today=new Date(); today.setHours(0,0,0,0);
                                  const from=new Date(p.offerFrom); const to=new Date(p.offerTo);
                                  const active=today>=from&&today<=to;
                                  return <span className="text-xs font-semibold mt-0.5 block" style={{color:active?"#c2410c":"#aaa"}}>
                                    {active?"🏷️ Offer active":"📅 Offer:"} {new Date(p.offerFrom).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}–{new Date(p.offerTo).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                                  </span>;
                                })()}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" style={{background:"var(--cream)",color:"var(--accent)"}}>{p.category}</span></td>
                          <td className="px-4 py-3 whitespace-nowrap"><span className="line-through text-xs" style={{color:"#bbb"}}>₹{fmt(p.mrp)}</span></td>
                          <td className="px-4 py-3 whitespace-nowrap font-bold" style={{color:"var(--primary)"}}>₹{fmt(p.price)}</td>
                          <td className="px-4 py-3">
                            {p.stock===0
                              ? <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{background:"#fef2f2",color:"#dc2626"}}>OUT OF STOCK</span>
                              : <span className={`px-2 py-0.5 rounded-full text-xs font-bold`} style={{background:p.stock<10?"#fef2f2":p.stock<20?"#fff7ed":"#f0fdf4",color:p.stock<10?"#dc2626":p.stock<20?"#c2410c":"#15803d"}}>{p.stock}</span>
                            }
                          </td>
                          <td className="px-4 py-3 font-semibold" style={{color:"#666"}}>{fmt(p.sold)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span style={{color:"var(--accent)"}}>★</span>
                              <span className="font-semibold">{p.rating>0?p.rating:"—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={()=>toggleHome(p.id)} className="w-9 h-5 rounded-full relative transition-all duration-300" style={{background:p.showOnHome?"var(--primary)":"#ddd",border:"none",cursor:"pointer"}}>
                              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300" style={{left:p.showOnHome?"calc(100% - 18px)":"2px"}}/>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button onClick={()=>loadEdit(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:"#eff6ff",color:"#2563eb",border:"none",cursor:"pointer"}}>Edit</button>
                              <button onClick={()=>setConfirmDialog({type:"delete-product",id:p.id,label:p.name})} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:"#fef2f2",color:"#dc2626",border:"none",cursor:"pointer"}}>Delete</button>
                              {p.stock===0
                                ?<button
                                  onClick={()=>{setRestockQty("");setRestockErr("");setRestockDialog({id:p.id,name:p.name});}}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                  style={{background:"#f0fdf4",color:"#15803d",border:"1px solid #bbf7d0",cursor:"pointer"}}
                                >🔄 Restock</button>
                                :<button
                                  onClick={()=>setConfirmDialog({type:"out-of-stock",id:p.id,label:p.name})}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                  style={{background:"#fff7ed",color:"#c2410c",border:"none",cursor:"pointer"}}
                                >Out of Stock</button>
                              }
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ ORDERS ════════════ */}
        {tab==="orders"&&(
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"clamp(1.8rem,3vw,2.5rem)",color:"var(--primary)"}}>Customer Orders</h1>
                <p className="text-sm mt-1" style={{color:"#888"}}>{filteredOrders.length} orders · ₹{fmt(filteredOrders.reduce((s,o)=>s+o.total,0))} total</p>
              </div>
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <input type="text" placeholder="Search by name or order ID…" value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm outline-none w-52" style={{border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)"}}/>
                <select value={orderStatus} onChange={e=>setOrderStatus(e.target.value as typeof orderStatus)} className="px-4 py-2.5 rounded-xl text-sm outline-none" style={{border:"1.5px solid var(--cream-dark)",fontFamily:"var(--font-jost,sans-serif)"}}>
                  <option value="all">All Statuses</option>
                  {(Object.keys(STATUS_CFG) as OrderStatus[]).map(s=><option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                </select>
              </div>
            </div>

            {/* Status summary pills */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_CFG) as OrderStatus[]).map(s=>{
                const cnt=orders.filter(o=>o.status===s).length;
                const cfg=STATUS_CFG[s];
                return(<div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{background:cfg.bg,color:cfg.color}}>
                  {cfg.label} <span className="font-bold">({cnt})</span>
                </div>);
              })}
            </div>

            {/* Orders list */}
            <div className="flex flex-col gap-4">
              {filteredOrders.map(order=>{
                const expanded=expandedOrder===order.id;
                const cfg=STATUS_CFG[order.status];
                const next=nextStatus[order.status];
                return(
                  <div key={order.id} className="rounded-2xl overflow-hidden" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3 px-5 py-4 cursor-pointer" style={{background:expanded?"#fffaf7":"#fff",borderBottom:expanded?"1px solid var(--cream-dark)":"none"}} onClick={()=>setExpandedOrder(expanded?null:order.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold text-sm" style={{fontFamily:"var(--font-cormorant,serif)",color:"var(--primary)"}}>{order.id}</span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{background:cfg.bg,color:cfg.color}}>{cfg.label}</span>
                        </div>
                        <p className="text-xs mt-0.5 font-semibold" style={{color:"var(--foreground)"}}>{order.customer} · {order.city}</p>
                        <p className="text-xs" style={{color:"#aaa"}}>{order.date} · {order.payMethod}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg" style={{fontFamily:"var(--font-cormorant,serif)",color:"var(--primary)"}}>{fmtR(order.total)}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{transform:expanded?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>

                    {/* Detail */}
                    {expanded&&(
                      <div className="p-5">
                        {/* Items */}
                        <div className="flex flex-col gap-3 mb-5 pb-5" style={{borderBottom:"1px solid var(--cream-dark)"}}>
                          {order.items.map(item=>(
                            <div key={item.name} className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:"var(--accent)"}}/>
                              <span className="text-sm font-semibold flex-1" style={{fontFamily:"var(--font-cormorant,serif)",color:"var(--foreground)"}}>{item.name}</span>
                              <span className="text-xs" style={{color:"#888"}}>Qty: {item.qty} · Size {item.size}</span>
                              <span className="text-sm font-bold" style={{color:"var(--primary)"}}>{fmtR(item.price*item.qty)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Customer info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                          {[["Customer",order.customer],["Email",order.email],["Phone",order.phone]].map(([l,v])=>(
                            <div key={l} className="p-3 rounded-xl" style={{background:"var(--cream)"}}>
                              <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{color:"#aaa"}}>{l}</p>
                              <p className="text-sm font-medium" style={{color:"var(--foreground)"}}>{v}</p>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          {next&&(
                            <button onClick={()=>setConfirmDialog({type:"advance-order",id:order.id,label:order.customer,nextLabel:STATUS_CFG[next].label})} className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase" style={{cursor:"pointer"}}>
                              Mark as {STATUS_CFG[next].label} →
                            </button>
                          )}
                          {order.status!=="cancelled"&&order.status!=="delivered"&&(
                            <button onClick={()=>setConfirmDialog({type:"cancel-order",id:order.id,label:order.customer})} className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase" style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fecdd3",cursor:"pointer"}}>
                              Cancel Order
                            </button>
                          )}
                          <button onClick={()=>printInvoice(order)} className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5" style={{background:"var(--cream)",color:"#555",border:"1px solid var(--cream-dark)",cursor:"pointer"}}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                            Print Invoice
                          </button>
                          <button className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide" style={{background:"var(--cream)",color:"#666",border:"1px solid var(--cream-dark)",cursor:"pointer"}}>
                            Send Email
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════ ANALYTICS ════════════ */}
        {tab==="analytics"&&(
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"clamp(1.8rem,3vw,2.5rem)",color:"var(--primary)"}}>Analytics & Trends</h1>
              <p className="text-sm mt-1" style={{color:"#888"}}>6-month performance overview · {chartMonths[0]} — {chartMonths[chartMonths.length-1]}</p>
            </div>

            {/* Trend Metric Selector */}
            <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <h2 className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.35rem",color:"var(--primary)"}}>Performance Trend</h2>
                <div className="flex gap-2 p-1 rounded-xl" style={{background:"var(--cream)"}}>
                  {([["revenue","Revenue","💰"],["orders","Orders","📦"],["visitors","Visitors","👁"]] as const).map(([id,label,icon])=>(
                    <button key={id} onClick={()=>setMetric(id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all" style={{background:metric===id?"#fff":"transparent",color:metric===id?"var(--primary)":"#888",border:"none",cursor:"pointer",boxShadow:metric===id?"0 1px 6px rgba(0,0,0,0.08)":"none"}}>
                      <span>{icon}</span>{label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end justify-between mb-3" style={{height:"24px"}}>
                {metricLabel.map((v,i)=>(
                  <span key={i} className="text-xs flex-1 text-center" style={{color:"#bbb",fontSize:"0.65rem"}}>{v}</span>
                ))}
              </div>
              <LineChart data={metricData} color="var(--primary)" height={120}/>
              <div className="flex items-center gap-6 mt-5 pt-4" style={{borderTop:"1px solid var(--cream-dark)"}}>
                {chartMonths.map((m,i)=>(
                  <div key={m} className="flex-1 text-center">
                    <p className="text-xs font-semibold" style={{color:"var(--foreground)"}}>{m}</p>
                    <p className="text-xs mt-0.5" style={{color:"var(--accent)"}}>
                      {metric==="revenue"?`₹${((chartRevenue[i]??0)/1000).toFixed(0)}K`:metric==="orders"?(chartOrders[i]??0):VISITORS_DATA[i]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Row: Orders by status + Category performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders funnel */}
              <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
                <h2 className="font-bold mb-5" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.25rem",color:"var(--primary)"}}>Orders by Status</h2>
                <div className="flex flex-col gap-3">
                  {(Object.keys(STATUS_CFG) as OrderStatus[]).map(s=>{
                    const cnt=orders.filter(o=>o.status===s).length;
                    const pct=Math.round((cnt/orders.length)*100);
                    const cfg=STATUS_CFG[s];
                    return(
                      <div key={s}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold" style={{color:"var(--foreground)"}}>{cfg.label}</span>
                          <span className="text-sm font-bold" style={{color:cfg.color}}>{cnt} ({pct}%)</span>
                        </div>
                        <div className="h-2.5 rounded-full" style={{background:"var(--cream-dark)"}}>
                          <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:cfg.color}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category performance */}
              <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
                <h2 className="font-bold mb-5" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.25rem",color:"var(--primary)"}}>Category Revenue</h2>
                <DonutChart slices={chartCategories}/>
                <div className="mt-5 pt-4" style={{borderTop:"1px solid var(--cream-dark)"}}>
                  <div className="flex flex-col gap-2">
                    {chartCategories.map(c=>(
                      <div key={c.name} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:c.color}}/>
                        <span className="text-xs flex-1" style={{color:"#666"}}>{c.name}</span>
                        <div className="flex-1 h-1.5 rounded-full mx-2" style={{background:"var(--cream-dark)"}}>
                          <div className="h-full rounded-full" style={{width:`${c.pct}%`,background:c.color}}/>
                        </div>
                        <span className="text-xs font-bold" style={{color:"var(--foreground)"}}>{c.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Orders volume bar chart */}
            <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
              <h2 className="font-bold mb-2" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.25rem",color:"var(--primary)"}}>Monthly Order Volume</h2>
              <p className="text-xs mb-5" style={{color:"#aaa"}}>Total orders per month across all categories</p>
              <div className="flex items-end justify-between mb-1" style={{height:"22px"}}>
                {chartOrders.map((v,i)=><span key={i} className="text-xs flex-1 text-center" style={{color:"#bbb",fontSize:"0.65rem"}}>{v}</span>)}
              </div>
              <BarChart data={chartOrders} color="var(--accent)" labels={chartMonths}/>
            </div>

            {/* Top products table */}
            <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid var(--cream-dark)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
              <h2 className="font-bold mb-5" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.25rem",color:"var(--primary)"}}>Top 10 Products by Revenue</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"var(--cream)",borderBottom:"1px solid var(--cream-dark)"}}>
                      {["#","Product","Category","Price","Units Sold","Revenue","Rating"].map(h=>(
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-widest uppercase whitespace-nowrap" style={{color:"#888"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...products].sort((a,b)=>(b.price*b.sold)-(a.price*a.sold)).slice(0,10).map((p,i)=>(
                      <tr key={p.id} style={{borderBottom:"1px solid var(--cream-dark)",background:i%2===0?"#fff":"#fffaf7"}}>
                        <td className="px-4 py-3 font-bold" style={{color:i<3?"var(--accent)":"#ccc",fontFamily:"var(--font-cormorant,serif)",fontSize:"1.1rem"}}>#{i+1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`${p.imgClass} w-8 h-9 rounded-lg flex-shrink-0 flex items-center justify-center`}><span style={{fontSize:"0.9rem",opacity:0.3}}>🥻</span></div>
                            <span className="font-semibold whitespace-nowrap" style={{fontFamily:"var(--font-cormorant,serif)",color:"var(--foreground)"}}>{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs" style={{background:"var(--cream)",color:"var(--accent)"}}>{p.category}</span></td>
                        <td className="px-4 py-3 font-bold whitespace-nowrap" style={{color:"var(--primary)"}}>₹{fmt(p.price)}</td>
                        <td className="px-4 py-3 font-semibold" style={{color:"#666"}}>{fmt(p.sold)}</td>
                        <td className="px-4 py-3 font-bold whitespace-nowrap" style={{color:"#15803d"}}>₹{fmt(p.price*p.sold)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span style={{color:"var(--accent)"}}>★</span>
                            <span className="font-semibold">{p.rating}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ SHOPS ════════════ */}
        {tab==="shops" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold" style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"2rem",color:"var(--primary)"}}>Shop Registrations</h1>
                <p className="text-sm text-gray-500">Review and approve new shop owners.</p>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 rounded-xl bg-white border border-cream-dark text-xs flex gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Approved: {shops.filter(s=>s.is_approved).length}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Pending: {shops.filter(s=>!s.is_approved).length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-cream-dark">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shop Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Owner Email</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Joined</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">No shop registrations found.</td></tr>
                  ) : (
                    shops.map(s => (
                      <tr key={s.id} className="border-b border-cream-dark last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-primary" style={{fontFamily:"var(--font-cormorant,serif)"}}>{s.name}</div>
                          <div className="text-[10px] text-gray-400">/{s.slug}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">{s.owner_email}</td>
                        <td className="px-6 py-4 text-xs text-gray-600">{s.created_at}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`${s.is_approved ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"} px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                            {s.is_approved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!s.is_approved ? (
                              <button 
                                onClick={async () => {
                                  if(confirm(`Approve shop "${s.name}"?`)) {
                                    try {
                                      const { approveShop } = await import("@/lib/api");
                                      await approveShop(s.id);
                                      setShops(prev => prev.map(sh => sh.id === s.id ? {...sh, is_approved: true} : sh));
                                    } catch (err) { alert("Approval failed"); }
                                  }
                                }}
                                className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide hover:opacity-90 transition-opacity"
                                style={{ cursor: "pointer" }}
                              >
                                Approve
                              </button>
                            ) : (
                              <button 
                                onClick={async () => {
                                  if(confirm(`Deactivate shop "${s.name}"? This will disable the owner's account.`)) {
                                    try {
                                      const { deactivateShop } = await import("@/lib/api");
                                      await deactivateShop(s.id);
                                      setShops(prev => prev.map(sh => sh.id === s.id ? {...sh, is_approved: false} : sh));
                                    } catch (err) { alert("Deactivation failed"); }
                                  }
                                }}
                                className="px-3 py-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide hover:opacity-90 transition-opacity"
                                style={{ cursor: "pointer" }}
                              >
                                Deactivate
                              </button>
                            )}
                            <button 
                              onClick={async () => {
                                if(confirm(`PERMANENTLY DELETE shop "${s.name}" and owner account? This cannot be undone.`)) {
                                  try {
                                    const { deleteShop } = await import("@/lib/api");
                                    await deleteShop(s.id);
                                    setShops(prev => prev.filter(sh => sh.id !== s.id));
                                  } catch (err) { alert("Deletion failed"); }
                                }
                              }}
                              className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide hover:opacity-90 transition-opacity"
                              style={{ cursor: "pointer" }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── Restock Modal ── */}
      {restockDialog&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={()=>setRestockDialog(null)}>
          <div style={{background:"#fff",borderRadius:"20px",padding:"36px 32px",maxWidth:"400px",width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:"24px"}}>
              <div style={{fontSize:"2.6rem",marginBottom:"14px"}}>📦</div>
              <h3 style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.4rem",fontWeight:700,color:"var(--primary)",marginBottom:"8px"}}>Restock Product</h3>
              <p style={{color:"#666",fontSize:"0.85rem",lineHeight:1.6}}>How many units would you like to add for<br/><strong style={{color:"var(--foreground)"}}>{restockDialog.name}</strong>?</p>
            </div>
            <div style={{marginBottom:"20px"}}>
              <label style={{display:"block",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"#aaa",marginBottom:"8px"}}>Units to Add</label>
              <input
                type="number" min="1" value={restockQty}
                onChange={e=>{setRestockQty(e.target.value);setRestockErr("");}}
                onKeyDown={e=>e.key==="Enter"&&handleRestock()}
                placeholder="e.g. 50"
                autoFocus
                style={{width:"100%",padding:"13px 16px",borderRadius:"12px",border:`1.5px solid ${restockErr?"#fca5a5":"var(--cream-dark)"}`,fontFamily:"var(--font-jost,sans-serif)",fontSize:"1rem",color:"var(--foreground)",outline:"none",boxSizing:"border-box"}}
                onFocus={e=>(e.currentTarget.style.borderColor="var(--primary)")}
                onBlur={e=>(e.currentTarget.style.borderColor=restockErr?"#fca5a5":"var(--cream-dark)")}
              />
              {restockErr&&<p style={{color:"#dc2626",fontSize:"0.75rem",marginTop:"6px"}}>{restockErr}</p>}
            </div>
            <div style={{display:"flex",gap:"12px"}}>
              <button
                onClick={()=>setRestockDialog(null)}
                style={{flex:1,padding:"13px",borderRadius:"12px",border:"1.5px solid var(--cream-dark)",background:"#fff",cursor:"pointer",fontSize:"0.875rem",fontWeight:600,color:"#666",fontFamily:"var(--font-jost,sans-serif)"}}
              >Cancel</button>
              <button
                onClick={handleRestock}
                style={{flex:1,padding:"13px",borderRadius:"12px",border:"none",background:"#15803d",cursor:"pointer",fontSize:"0.875rem",fontWeight:600,color:"#fff",fontFamily:"var(--font-jost,sans-serif)"}}
              >✓ Add Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmDialog&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={()=>setConfirmDialog(null)}>
          <div style={{background:"#fff",borderRadius:"20px",padding:"36px 32px",maxWidth:"400px",width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:"24px"}}>
              <div style={{fontSize:"2.8rem",marginBottom:"14px"}}>
                {confirmDialog.type==="delete-product"?"🗑️":confirmDialog.type==="cancel-order"?"❌":confirmDialog.type==="out-of-stock"?"📦":"✅"}
              </div>
              <h3 style={{fontFamily:"var(--font-cormorant,serif)",fontSize:"1.4rem",fontWeight:700,color:"var(--primary)",marginBottom:"10px"}}>
                {confirmDialog.type==="delete-product"?"Delete Product?"
                  :confirmDialog.type==="cancel-order"?"Cancel Order?"
                  :confirmDialog.type==="out-of-stock"?"Mark as Out of Stock?"
                  :"Confirm Status Update"}
              </h3>
              <p style={{color:"#666",fontSize:"0.875rem",lineHeight:1.6}}>
                {confirmDialog.type==="delete-product"
                  ?`Are you sure you want to delete "${confirmDialog.label}"? This action cannot be undone.`
                  :confirmDialog.type==="cancel-order"
                  ?`Cancel the order for ${confirmDialog.label}? This cannot be reversed.`
                  :confirmDialog.type==="out-of-stock"
                  ?`Mark "${confirmDialog.label}" as out of stock? Stock will be set to 0.`
                  :`Advance order for ${confirmDialog.label} to "${confirmDialog.nextLabel}"?`}
              </p>
            </div>
            <div style={{display:"flex",gap:"12px"}}>
              <button
                onClick={()=>setConfirmDialog(null)}
                style={{flex:1,padding:"13px",borderRadius:"12px",border:"1.5px solid var(--cream-dark)",background:"#fff",cursor:"pointer",fontSize:"0.875rem",fontWeight:600,color:"#666",fontFamily:"var(--font-jost,sans-serif)"}}
              >Not now</button>
              <button
                onClick={()=>{
                  if(confirmDialog.type==="delete-product") deleteProduct(confirmDialog.id as number);
                  else if(confirmDialog.type==="cancel-order") cancelOrder(confirmDialog.id as string);
                  else if(confirmDialog.type==="advance-order") advanceOrder(confirmDialog.id as string);
                  else if(confirmDialog.type==="out-of-stock") markOutOfStock(confirmDialog.id as number);
                  setConfirmDialog(null);
                }}
                style={{flex:1,padding:"13px",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"0.875rem",fontWeight:600,color:"#fff",fontFamily:"var(--font-jost,sans-serif)",
                  background:confirmDialog.type==="delete-product"||confirmDialog.type==="cancel-order"?"#dc2626":confirmDialog.type==="out-of-stock"?"#c2410c":"var(--primary)"}}
              >
                {confirmDialog.type==="delete-product"?"Delete"
                  :confirmDialog.type==="cancel-order"?"Cancel Order"
                  :confirmDialog.type==="out-of-stock"?"Mark Out of Stock"
                  :"Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mini field helpers ── */
function ALabel({children}:{children:React.ReactNode}){
  return <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{color:"#666"}}>{children}</label>;
}
function AInput({value,onChange,placeholder,type="text",err}:{value:string|undefined|null;onChange:(v:string)=>void;placeholder?:string;type?:string;err?:string}){
  return(
    <div>
      <input
        type={type} value={value ?? ""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{border:`1.5px solid ${err?"#fca5a5":"var(--cream-dark)"}`,fontFamily:"var(--font-jost,sans-serif)",color:"var(--foreground)"}}
        onFocus={e=>(e.currentTarget.style.borderColor="var(--primary)")}
        onBlur={e=>(e.currentTarget.style.borderColor=err?"#fca5a5":"var(--cream-dark)")}
      />
      {err&&<p className="text-xs mt-1.5" style={{color:"#dc2626"}}>{err}</p>}
    </div>
  );
}
