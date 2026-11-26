import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getInitials, isLightColor, SITE_NAME } from "@/lib/utils";
import { SITE_TAGLINE } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const geistRegular = await readFile(join(process.cwd(), "lib/og/Geist-Regular.ttf"));

const FONT_OPTIONS = [
  {
    name: "Geist",
    data: geistRegular,
    style: "normal" as const,
    weight: 400 as const,
  },
];

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

function safeHex(color: string): string {
  return HEX.test(color.trim()) ? `#${color.trim().replace(/^#/, "")}` : "#17243A";
}

function BrandMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#17243A" />
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="5.25" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      <rect x="8" y="8.5" width="16" height="4" rx="1" fill="#4169E1" />
      <rect x="8" y="14" width="11" height="4" rx="1" fill="#FFFFFF" />
      <rect x="8" y="19.5" width="4.5" height="4" rx="1" fill="#7767D8" />
    </svg>
  );
}

function MonogramTile({ name, color, size = 84 }: { name: string; color: string; size?: number }) {
  const fill = safeHex(color);
  const light = isLightColor(fill);
  const initials = getInitials(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.16),
        backgroundColor: fill,
        border: light ? "2px solid rgba(23, 36, 58, 0.14)" : "2px solid rgba(255, 255, 255, 0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: light ? "#17243A" : "#FFFFFF",
        fontSize: Math.round(size * (initials.length > 1 ? 0.36 : 0.42)),
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
}

/** Default site Open Graph image: Navy background, Logo mark, tagline, and one blue accent line. */
export function renderDefaultOgImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#17243A",
          padding: "72px 84px",
          fontFamily: "Geist",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <BrandMark size={56} />
          <span style={{ fontSize: 34, letterSpacing: "-0.03em", color: "#FFFFFF" }}>{SITE_NAME}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ width: 96, height: 4, borderRadius: 2, backgroundColor: "#4169E1", display: "flex" }} />
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.12,
              letterSpacing: "-0.025em",
              color: "#FFFFFF",
              maxWidth: 920,
              display: "flex",
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div style={{ fontSize: 26, color: "#9FB4F2", display: "flex" }}>
            Independent software directory and side-by-side comparisons
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, color: "#9FB4F2" }}>
          <span>faresolution.com</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: FONT_OPTIONS,
    },
  );
}

export interface PageOgInput {
  kindLabel: string;
  title: string;
  subtitle?: string;
  monograms?: { name: string; color: string }[];
}

/** Per-section Open Graph card with kind label, title, optional subtitle and product monograms. */
export function renderPageOgImage({ kindLabel, title, subtitle, monograms }: PageOgInput): ImageResponse {
  const titleFontSize = title.length > 72 ? 42 : title.length > 44 ? 50 : 58;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F6F7FA",
          padding: "64px 76px",
          fontFamily: "Geist",
          color: "#17243A",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <BrandMark size={40} />
            <span style={{ fontSize: 24, letterSpacing: "-0.03em", color: "#17243A" }}>{SITE_NAME}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #D5DAE3",
              backgroundColor: "#FFFFFF",
              fontSize: 18,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#2B4CB3",
            }}
          >
            {kindLabel}
          </div>
        </div>

        {/* Main title + optional monograms */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {monograms && monograms.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {monograms.slice(0, 4).map((m, idx) => (
                <MonogramTile key={`${m.name}-${idx}`} name={m.name} color={m.color} size={monograms.length > 1 ? 68 : 84} />
              ))}
            </div>
          )}
          <div
            style={{
              fontSize: titleFontSize,
              lineHeight: 1.15,
              letterSpacing: "-0.024em",
              color: "#17243A",
              maxWidth: 1020,
              display: "flex",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 24,
                lineHeight: 1.4,
                color: "#5F6978",
                maxWidth: 960,
                display: "flex",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #E7EAF0",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: "#4169E1", display: "flex" }} />
            <span style={{ fontSize: 20, color: "#5F6978" }}>{SITE_TAGLINE}</span>
          </div>
          <span style={{ fontSize: 20, color: "#5F6978" }}>faresolution.com</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: FONT_OPTIONS,
    },
  );
}
