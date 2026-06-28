"use client";
// Reusable image slider used on product cards and modals.
// – Cards:  arrows + dots appear on hover (alwaysShowControls=false, default)
// – Modals: arrows always visible, thumbnail strip at bottom (alwaysShowControls + showThumbs)

import { useState, useEffect } from "react";
import { mediaUrl } from "@/lib/api";

interface ImageSliderProps {
  images: string[];
  alt: string;
  /** CSS class for the container (used as gradient fallback bg) */
  imgClass?: string;
  style?: React.CSSProperties;
  className?: string;
  /** Show prev/next arrows even when not hovering (for modals) */
  alwaysShowControls?: boolean;
  /** Show thumbnail strip at bottom (for modals) */
  showThumbs?: boolean;
  /** Overlays: tag badge, OOS overlay, quick-add bar, etc. */
  children?: React.ReactNode;
}

export default function ImageSlider({
  images,
  alt,
  imgClass = "",
  style,
  className = "",
  alwaysShowControls = false,
  showThumbs = false,
  children,
}: ImageSliderProps) {
  const [idx, setIdx]       = useState(0);
  const [hovered, setHovered] = useState(false);
  const count = images.length;

  // Reset to first slide whenever the product changes
  useEffect(() => { setIdx(0); }, [images]);

  const showCtrl = count > 1 && (alwaysShowControls || hovered);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx(i => (i - 1 + count) % count);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx(i => (i + 1) % count);
  };

  return (
    <div
      className={`relative overflow-hidden ${imgClass} ${className}`}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Slides ── */}
      {count === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: "5rem", opacity: 0.18 }}>🥻</span>
        </div>
      ) : (
        <div
          className="absolute inset-0 flex"
          style={{
            width: `${count * 100}%`,
            transform: `translateX(-${(idx / count) * 100}%)`,
            transition: "transform 0.35s ease",
          }}
        >
          {images.map((src, i) => (
            <div key={i} style={{ width: `${100 / count}%`, flexShrink: 0, height: "100%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(src)}
                alt={`${alt} ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Prev arrow ── */}
      {count > 1 && (
        <button
          onClick={prev}
          aria-label="Previous image"
          style={{
            position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)",
            width: "28px", height: "28px", borderRadius: "50%",
            background: "rgba(0,0,0,0.45)", border: "none", cursor: "pointer",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 6, opacity: showCtrl ? 1 : 0, transition: "opacity 0.2s",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      )}

      {/* ── Next arrow ── */}
      {count > 1 && (
        <button
          onClick={next}
          aria-label="Next image"
          style={{
            position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
            width: "28px", height: "28px", borderRadius: "50%",
            background: "rgba(0,0,0,0.45)", border: "none", cursor: "pointer",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 6, opacity: showCtrl ? 1 : 0, transition: "opacity 0.2s",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      )}

      {/* ── Dot indicators (cards only — hidden when thumbs are shown) ── */}
      {count > 1 && !showThumbs && (
        <div
          style={{
            position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: "5px", zIndex: 6,
            opacity: showCtrl ? 1 : 0, transition: "opacity 0.2s",
          }}
          onClick={e => e.stopPropagation()}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIdx(i); }}
              aria-label={`Go to image ${i + 1}`}
              style={{
                width: i === idx ? "18px" : "6px", height: "6px",
                borderRadius: "999px",
                background: i === idx ? "#fff" : "rgba(255,255,255,0.55)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "width 0.25s, background 0.2s",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Thumbnail strip (modals) ── */}
      {count > 1 && showThumbs && (
        <div
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            display: "flex", gap: "6px", padding: "10px 14px",
            background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
            zIndex: 6, overflowX: "auto",
          }}
          onClick={e => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIdx(i); }}
              aria-label={`View image ${i + 1}`}
              style={{
                flexShrink: 0, width: "52px", height: "58px",
                borderRadius: "7px", overflow: "hidden", padding: 0,
                border: `2px solid ${i === idx ? "#fff" : "rgba(255,255,255,0.35)"}`,
                cursor: "pointer",
                transform: i === idx ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.2s, border-color 0.2s",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(src)}
                alt={`Thumbnail ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Overlays passed as children (tag badge, OOS, quick-add, etc.) ── */}
      {children}
    </div>
  );
}
