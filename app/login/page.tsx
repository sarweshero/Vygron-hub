"use client";

import { useState } from "react";
import Link from "next/link";
import { userLogin } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    setError("");
    setLoading(true);
    try {
      await userLogin(email.trim().toLowerCase(), password);
      window.location.href = "/profile";
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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--background)", fontFamily: "var(--font-jost, sans-serif)" }}
    >
      {/* Brand mark */}
      <Link href="/" style={{ textDecoration: "none", marginBottom: "2rem", display: "block", textAlign: "center" }}>
        <div className="text-3xl font-bold tracking-[0.18em]" style={{ fontFamily: "var(--font-cormorant, serif)", color: "var(--primary)", lineHeight: 1 }}>KURTHĪ</div>
        <div className="text-xs tracking-[0.4em] uppercase mt-1" style={{ color: "var(--accent)", fontSize: "0.6rem" }}>COUTURE</div>
      </Link>

      <div
        className="w-full max-w-md rounded-3xl p-8 sm:p-10"
        style={{ background: "#fff", boxShadow: "0 8px 50px rgba(123,30,58,0.10)", border: "1px solid var(--cream-dark)" }}
      >
        <h1 className="font-bold mb-1" style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "2rem", color: "var(--primary)" }}>
          Welcome back
        </h1>
        <p className="text-sm mb-8" style={{ color: "#888" }}>Sign in to your Kurthī Couture account</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#fff1f1", border: "1px solid #fecaca", color: "#dc2626" }}>
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{ color: "#666" }}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
            style={{ border: "1.5px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)", color: "var(--foreground)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--cream-dark)")}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{ color: "#666" }}>Password</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm outline-none transition-all"
              style={{ border: "1.5px solid var(--cream-dark)", fontFamily: "var(--font-jost, sans-serif)", color: "var(--foreground)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--cream-dark)")}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}
              tabIndex={-1}
            >
              {showPass ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <span
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{ background: remember ? "var(--primary)" : "#fff", border: `1.5px solid ${remember ? "var(--primary)" : "var(--cream-dark)"}` }}
              onClick={() => setRemember(!remember)}
            >
              {remember && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M1 6l4 4 6-7"/></svg>}
            </span>
            <span className="text-xs" style={{ color: "#666" }}>Remember me</span>
          </label>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: "0.8rem", fontWeight: 600 }}>
            Forgot password?
          </button>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full py-4 rounded-2xl text-sm font-semibold tracking-wider uppercase mb-4"
          style={{ cursor: loading ? "wait" : "pointer", opacity: loading ? 0.8 : 1 }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: "var(--cream-dark)" }} />
          <span className="text-xs" style={{ color: "#bbb" }}>or continue with</span>
          <div className="flex-1 h-px" style={{ background: "var(--cream-dark)" }} />
        </div>

        {/* Google */}
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
          Sign in with Google
        </button>

        {/* Sign up link */}
        <p className="text-center text-sm mt-6" style={{ color: "#888" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
