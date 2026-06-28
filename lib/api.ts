/* ──────────────────────────────────────────────────────────────────
   Vygron Hub – API utility
   ────────────────────────────────────────────────────────────────── */

export const BASE = `${process.env.NEXT_PUBLIC_API_HOST}/api`;
export const HOST = process.env.NEXT_PUBLIC_API_HOST ?? "";

export function mediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.replace(/^https?:\/\/127\.0\.0\.1:8000/, HOST)
            .replace(/^https?:\/\/localhost:8000/, HOST);
}

export function getToken(): string | null {
  try { return localStorage.getItem("vygron_admin_token"); } catch { return null; }
}

export function setToken(token: string) {
  try { localStorage.setItem("vygron_admin_token", token); } catch {}
}

export function clearToken() {
  try { localStorage.removeItem("vygron_admin_token"); } catch {}
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ── User token helpers ────────────────────────────────────────── */
const USER_TOKEN_KEY = "vygron_user_token";
const USER_INFO_KEY  = "vygron_user_info";

export function getUserToken(): string | null {
  try { return localStorage.getItem(USER_TOKEN_KEY); } catch { return null; }
}
export function setUserToken(token: string) {
  try { localStorage.setItem(USER_TOKEN_KEY, token); } catch {}
}
export function clearUserToken() {
  try {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem("vygron_user_refresh");
    localStorage.removeItem(USER_INFO_KEY);
  } catch {}
}
export function getCachedUserInfo(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  } catch { return null; }
}

function userAuthHeaders(): Record<string, string> {
  const token = getUserToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ── Generic request (admin-authenticated) ─────────────────────── */
async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return null as T;
  return res.json() as T;
}

export const apiGet    = <T = unknown>(path: string)                  => request<T>("GET",    path);
export const apiPost   = <T = unknown>(path: string, body: unknown)   => request<T>("POST",   path, body);
export const apiPatch  = <T = unknown>(path: string, body?: unknown)  => request<T>("PATCH",  path, body);
export const apiDelete = <T = unknown>(path: string)                  => request<T>("DELETE", path);

/* ── Admin Auth ────────────────────────────────────────────────── */
export interface LoginResponse {
  access: string;
  refresh: string;
  username: string;
  email: string;
}

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  const data = await apiPost<LoginResponse>("/admin/login/", { username, password });
  setToken(data.access);
  return data;
}

/* ── User Auth ─────────────────────────────────────────────────── */
export interface UserInfo {
  id:    number;
  name:  string;
  email: string;
  phone: string;
  userType: "customer" | "shop_owner";
  shopSlug?: string;
}

export interface UserAuthResponse extends UserInfo {
  access:  string;
  refresh: string;
}

function saveUserAuth(data: UserAuthResponse) {
  setUserToken(data.access);
  try {
    localStorage.setItem("vygron_user_refresh", data.refresh);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify({
      id: data.id, name: data.name, email: data.email, phone: data.phone, userType: data.userType, shopSlug: data.shopSlug
    }));
  } catch {}
}

async function userRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...userAuthHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return null as T;
  return res.json() as T;
}

export async function userLogin(email: string, password: string): Promise<UserAuthResponse> {
  const data = await fetch(`${BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!data.ok) {
    const text = await data.text().catch(() => "");
    throw new Error(`${data.status}: ${text}`);
  }
  const result = (await data.json()) as UserAuthResponse;
  saveUserAuth(result);
  return result;
}

export async function userRegister(
  name: string, email: string, phone: string, password: string,
): Promise<UserAuthResponse> {
  const data = await fetch(`${BASE}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });
  if (!data.ok) {
    const text = await data.text().catch(() => "");
    throw new Error(`${data.status}: ${text}`);
  }
  const result = (await data.json()) as UserAuthResponse;
  saveUserAuth(result);
  return result;
}

export interface ShopRegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  shop_name: string;
  description: string;
  business_details: string;
}

export async function shopRegister(payload: ShopRegisterPayload): Promise<{ detail: string; email: string; shop_name: string }> {
  const data = await fetch(`${BASE}/auth/shop-register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!data.ok) {
    const text = await data.text().catch(() => "");
    throw new Error(`${data.status}: ${text}`);
  }
  return (await data.json());
}

export const getAllShops = (): Promise<any[]> =>
  fetch(`${BASE}/shops/`).then(res => res.json());

export const getShopDetails = (slug: string): Promise<any> =>
  fetch(`${BASE}/shops/${slug}/`).then(res => {
    if (!res.ok) throw new Error("Shop not found");
    return res.json();
  });

export const createGuestOrder = (payload: any): Promise<any> =>
  fetch(`${BASE}/guest-order/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(res => {
    if (!res.ok) throw new Error("Order creation failed");
    return res.json();
  });


export const getUserProfile = (): Promise<UserInfo> =>
  userRequest<UserInfo>("GET", "/auth/profile/");

export const updateUserProfile = (payload: Partial<UserInfo>): Promise<UserInfo> =>
  userRequest<UserInfo>("PATCH", "/auth/profile/", payload);

export const getMyOrders = (): Promise<any[]> =>
  userRequest("GET", "/auth/orders/");

export const changePassword = (oldPass: string, newPass: string) => 
  userRequest<{detail: string}>("POST", "/auth/change-password/", { old_password: oldPass, new_password: newPass });

/* ── Shop Owner Dashboard API ──────────────────────────────── */
export interface ShopDashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  low_stock_count: number;
  recent_orders: any[];
  shop_name: string;
  shop_slug: string;
}

export const getShopDashboardStats = () => 
  userRequest<ShopDashboardStats>("GET", "/shop/dashboard/");

export const updateShopSettings = (payload: any) => 
  userRequest<any>("PATCH", "/shop/details/", payload);

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = getUserToken();
  const res = await fetch(`${BASE}/upload/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) throw new Error("Upload failed");
  return await res.json() as { url: string };
};

export const getShopProducts = () => 
  userRequest<any[]>("GET", "/my-shop/products/");

export const createShopProduct = (payload: any) => 
  userRequest<any>("POST", "/my-shop/products/", payload);

export const updateShopProduct = (id: number, payload: any) => 
  userRequest<any>("PATCH", `/my-shop/products/${id}/`, payload);

export const deleteShopProduct = (id: number) => 
  userRequest<void>("DELETE", `/my-shop/products/${id}/`);


/* ── Product field converters (snake_case ↔ camelCase) ─────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function productFromAPI(p: Record<string, any>) {
  return {
    id:           (p.id              as number)  ?? 0,
    name:         (p.name            as string)  ?? "",
    mrp:          parseFloat(p.mrp)  || 0,
    price:        parseFloat(p.price) || 0,
    sizes:        (p.sizes           as string[]) ?? [],
    description:  (p.description     as string)  ?? "",
    deliveryDays: (p.delivery_days   as number)  ?? 5,
    category:     (p.category        as string)  ?? "Casual Wear",
    fabric:       (p.fabric          as string)  ?? "",
    imgClass:     (p.img_class       as string)  ?? "product-img-1",
    tag:          p.tag              ? (p.tag as string) : undefined,
    stock:        (p.stock   as number) ?? 0,
    sold:         (p.sold    as number) ?? 0,
    rating:       (p.rating  as number) ?? 0,
    showOnHome:   !!(p.show_on_home),
    isNew:        !!(p.is_new),
    isBestseller: !!(p.is_bestseller),
    colorHex:     (p.color_hex       as string)  ?? "#7b1e3a",
    images:       (p.images          as string[]) ?? [],
    offerFrom:    p.offer_from       ? (p.offer_from as string) : undefined,
    offerTo:      p.offer_to         ? (p.offer_to  as string) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function productToAPI(p: Record<string, any>) {
  return {
    name:          p.name,
    mrp:           p.mrp,
    price:         p.price,
    sizes:         p.sizes,
    description:   p.description,
    delivery_days: p.deliveryDays,
    category:      p.category,
    fabric:        p.fabric,
    img_class:     p.imgClass,
    tag:           p.tag      ?? "",
    stock:         p.stock,
    color_hex:     p.colorHex,
    images:        p.images   ?? [],
    offer_from:    p.offerFrom ?? null,
    offer_to:      p.offerTo   ?? null,
  };
}

/* ── Order field converter ─────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function orderFromAPI(o: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (o.items as Record<string, any>[]) ?? [];
  return {
    id:        o.id        as string,
    customer:  o.customer  as string,
    email:     o.email     as string,
    phone:     o.phone     as string,
    city:      o.city      as string,
    date:      o.date      as string,
    items:     items.map(i => ({
      name:  i.name  as string,
      qty:   i.qty   as number,
      size:  i.size  as string,
      price: parseFloat(i.price) as number,
    })),
    total:     parseFloat(o.total) as number,
    status:    o.status    as string,
    payMethod: o.pay_method as string,
  };
}

export interface Shop {
  id: number;
  owner_email: string;
  name: string;
  slug: string;
  description: string;
  business_details: string;
  is_approved: boolean;
  created_at: string;
}

/* ── Shop Management (Admin) ────────────────────────────────── */
export const getShops = () => apiGet<Shop[]>("/admin/shops/");
export const approveShop = (id: number) => apiPost<{detail: string}>(`/admin/shops/${id}/approve/`, {});
export const deactivateShop = (id: number) => apiPost<{detail: string}>(`/admin/shops/${id}/deactivate/`, {});
export const deleteShop = (id: number) => apiDelete<{detail: string}>(`/admin/shops/${id}/`);
