/* ──────────────────────────────────────────────────────────────────
   Kurthī – API utility
   Base URL: http://127.0.0.1:8000/api
   ────────────────────────────────────────────────────────────────── */

export const BASE = "http://127.0.0.1:8000/api";

/* ── Admin token helpers ───────────────────────────────────────── */
export function getToken(): string | null {
  try { return localStorage.getItem("kurthi_admin_token"); } catch { return null; }
}

export function setToken(token: string) {
  try { localStorage.setItem("kurthi_admin_token", token); } catch {}
}

export function clearToken() {
  try { localStorage.removeItem("kurthi_admin_token"); } catch {}
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ── User token helpers ────────────────────────────────────────── */
const USER_TOKEN_KEY = "kurthi_user_token";
const USER_INFO_KEY  = "kurthi_user_info";

export function getUserToken(): string | null {
  try { return localStorage.getItem(USER_TOKEN_KEY); } catch { return null; }
}
export function setUserToken(token: string) {
  try { localStorage.setItem(USER_TOKEN_KEY, token); } catch {}
}
export function clearUserToken() {
  try {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem("kurthi_user_refresh");
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
}

export interface UserAuthResponse extends UserInfo {
  access:  string;
  refresh: string;
}

function saveUserAuth(data: UserAuthResponse) {
  setUserToken(data.access);
  try {
    localStorage.setItem("kurthi_user_refresh", data.refresh);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify({
      id: data.id, name: data.name, email: data.email, phone: data.phone,
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

export const getUserProfile = (): Promise<UserInfo> =>
  userRequest<UserInfo>("GET", "/auth/profile/");

export const updateUserProfile = (payload: Partial<UserInfo>): Promise<UserInfo> =>
  userRequest<UserInfo>("PATCH", "/auth/profile/", payload);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMyOrders = (): Promise<Record<string, any>[]> =>
  userRequest("GET", "/auth/orders/");

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
