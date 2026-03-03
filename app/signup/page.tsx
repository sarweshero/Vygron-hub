"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

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

  const handleSignup = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      try { localStorage.setItem("kurthi_user_auth", JSON.stringify({ name: form.name, email: form.email })); } catch {}
      window.location.href = "/";
    }, 2000);
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#16a34a"][strength];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--background)", fontFamily: "var(--font-jost, sans-serif)" }}
    >
      {/* Brand */}
      <Link href="/" style={{ textDecoration: "none", marginBottom: "2rem", display: "block", textAlign: "center" }}>
        <div className="text-3xl font-bold tracking-[0.18em]" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)", lineHeight: 1 }}>KURTHĪ</div>
        <div className="text-xs tracking-[0.4em] uppercase mt-1" style={{ color: "var(--accent)", fontSize: "0.6rem" }}>COUTURE</div>
      </Link>

      <div
        className="w-full max-w-md rounded-3xl p-8 sm:p-10"
        style={{ background: "#fff", boxShadow: "0 8px 50px rgba(123,30,58,0.10)", border: "1px solid var(--cream-dark)" }}
      >
        <h1 className="font-bold mb-1" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "2rem", color: "var(--primary)" }}>
          Create Account
        </h1>
        <p className="text-sm mb-7" style={{ color: "#888" }}>Join Kurthī Couture — discover ethnic fashion curated for you.</p>

        <div className="flex flex-col gap-4">
          <FormField label="Full Name" value={form.name} onChange={set("name")} placeholder="Ananya Sharma" error={errors.name} />
          <FormField label="Email Address" value={form.email} onChange={set("email")} placeholder="you@example.com" type="email" error={errors.email} />
          <FormField label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="9876543210" type="tel" error={errors.phone} />

          {/* Password with strength */}
          <div>
            <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{ color: "#666" }}>Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password")(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm outline-none transition-all"
                style={{ border: `1.5px solid ${errors.password ? "#fca5a5" : "var(--cream-dark)"}`, fontFamily: "var(--font-jost, sans-serif)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = errors.password ? "#fca5a5" : "var(--cream-dark)")}
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }} tabIndex={-1}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= strength ? strengthColor : "var(--cream-dark)" }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel} password</p>
              </div>
            )}
            {errors.password && <p className="text-xs mt-1.5" style={{ color: "#dc2626" }}>{errors.password}</p>}
          </div>

          <FormField label="Confirm Password" value={form.confirm} onChange={set("confirm")} placeholder="Re-enter password" type="password" error={errors.confirm} />

          {/* Terms */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer" onClick={() => setAgree(!agree)}>
              <span className="w-4 h-4 rounded mt-0.5 flex-shrink-0 flex items-center justify-center transition-all" style={{ background: agree ? "var(--primary)" : "#fff", border: `1.5px solid ${errors.agree ? "#fca5a5" : agree ? "var(--primary)" : "var(--cream-dark)"}` }}>
                {agree && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M1 6l4 4 6-7"/></svg>}
              </span>
              <span className="text-xs leading-relaxed" style={{ color: "#666" }}>
                I agree to the{" "}
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>Terms of Service</span>{" "}
                and{" "}
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>Privacy Policy</span>
              </span>
            </label>
            {errors.agree && <p className="text-xs mt-1.5 ml-6" style={{ color: "#dc2626" }}>{errors.agree}</p>}
          </div>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="btn-primary w-full py-4 rounded-2xl text-sm font-semibold tracking-wider uppercase mt-6 mb-4"
          style={{ cursor: loading ? "wait" : "pointer", opacity: loading ? 0.8 : 1 }}
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: "var(--cream-dark)" }} />
          <span className="text-xs" style={{ color: "#bbb" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--cream-dark)" }} />
        </div>

        <button
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:shadow-md"
          style={{ border: "1.5px solid var(--cream-dark)", background: "#fff", color: "var(--foreground)", cursor: "pointer" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        <p className="text-center text-sm mt-6" style={{ color: "#888" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text", error }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{ color: "#666" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
        style={{ border: `1.5px solid ${error ? "#fca5a5" : "var(--cream-dark)"}`, fontFamily: "var(--font-jost, sans-serif)", color: "var(--foreground)" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = error ? "#fca5a5" : "var(--cream-dark)")}
      />
      {error && <p className="text-xs mt-1.5" style={{ color: "#dc2626" }}>{error}</p>}
    </div>
  );
}
