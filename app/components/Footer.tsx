import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "var(--primary)", color: "#fff" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="text-3xl font-bold tracking-[0.15em] mb-1" style={{ fontFamily: "var(--font-cormorant, serif)" }}>KURTHĪ</div>
            <div className="text-xs tracking-[0.4em] uppercase mb-4" style={{ color: "var(--accent-light)" }}>COUTURE</div>
            <p className="text-sm leading-relaxed opacity-75 mb-6" style={{ fontFamily: "var(--font-jost, sans-serif)" }}>
              Handcrafted ethnic wear celebrating India&apos;s rich textile heritage. Made with love, worn with pride.
            </p>
            <div className="flex gap-3">
              {["f", "📸", "in", "𝕏"].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.12)", color: "#fff", textDecoration: "none" }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-5 text-sm tracking-widest uppercase" style={{ fontFamily: "var(--font-jost, sans-serif)", color: "var(--accent-light)" }}>Shop</h4>
            <ul className="space-y-3 list-none p-0 m-0">
              {["New Arrivals", "Bestsellers", "Casual Wear", "Festive Collection", "Embroidered", "Sale"].map((item) => (
                <li key={item}>
                  <Link href="/products" className="text-sm opacity-70 hover:opacity-100 transition-opacity" style={{ color: "#fff", textDecoration: "none", fontFamily: "var(--font-jost, sans-serif)" }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold mb-5 text-sm tracking-widest uppercase" style={{ fontFamily: "var(--font-jost, sans-serif)", color: "var(--accent-light)" }}>Help</h4>
            <ul className="space-y-3 list-none p-0 m-0">
              {["Size Guide", "Track Order", "Returns & Exchange", "Shipping Info", "Contact Us", "FAQ"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity" style={{ color: "#fff", textDecoration: "none", fontFamily: "var(--font-jost, sans-serif)" }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-5 text-sm tracking-widest uppercase" style={{ fontFamily: "var(--font-jost, sans-serif)", color: "var(--accent-light)" }}>Contact</h4>
            <div className="space-y-4">
              {[
                { icon: "📧", label: "hello@kurthicouture.com" },
                { icon: "📱", label: "+91 98765 43210" },
                { icon: "📍", label: "Mumbai, Maharashtra, India" },
                { icon: "🕐", label: "Mon–Sat, 10am – 7pm IST" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <span className="text-base mt-0.5">{c.icon}</span>
                  <span className="text-sm opacity-75" style={{ fontFamily: "var(--font-jost, sans-serif)" }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs opacity-60"
          style={{ borderTop: "1px solid rgba(255,255,255,0.15)", fontFamily: "var(--font-jost, sans-serif)" }}
        >
          <p>© 2026 Kurthī Couture. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Sitemap"].map((l) => (
              <a key={l} href="#" className="hover:opacity-100 transition-opacity" style={{ color: "#fff", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <span style={{ color: "var(--accent-light)" }}>#</span>
            <span>Vygron</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
