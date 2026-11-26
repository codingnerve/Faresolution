import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getInitials, isLightColor } from "@/lib/utils";
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

const TOP_WING_PATH =
  "M 34.4 2.4 L 13.0 2.4 C 8.4 2.4 5.5 5.2 3.2 10.6 L 1.4 15.2 L 1.7 15.4 C 4.5 12.6 7.8 9.2 13.2 9.0 L 26.8 9.0 C 29.0 9.0 30.2 8.2 31.6 6.2 Z";
const BOTTOM_WING_PATH =
  "M 29.3 11.4 L 13.4 11.4 C 9.4 11.4 6.8 14.1 4.4 19.6 L 0.9 28.2 L 1.3 28.4 C 5.1 26.6 7.8 25.0 9.6 22.4 L 11.4 19.7 C 12.3 18.4 13.2 17.8 15.0 17.8 L 22.0 17.8 C 24.4 17.8 25.7 17.0 27.1 14.8 Z";

function BrandMark({ size = 48, dark = false }: { size?: number; dark?: boolean }) {
  const height = Math.round((size * 30) / 36);
  return (
    <svg width={size} height={height} viewBox="0 0 36 30" fill="none">
      <path d={TOP_WING_PATH} fill={dark ? "#FFFFFF" : "#001740"} />
      <path d={BOTTOM_WING_PATH} fill={dark ? "#3B82F6" : "#0246AA"} />
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
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <BrandMark size={64} dark />
          <div style={{ width: 2, height: 42, backgroundColor: "rgba(255,255,255,0.28)", display: "flex" }} />
          <div style={{ display: "flex", fontSize: 36, letterSpacing: "-0.03em" }}>
            <span style={{ color: "#FFFFFF" }}>Fare</span>
            <span style={{ color: "#60A5FA" }}>solution</span>
          </div>
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
            <BrandMark size={44} />
            <div style={{ width: 1.5, height: 28, backgroundColor: "#CBD5E1", display: "flex" }} />
            <div style={{ display: "flex", fontSize: 26, letterSpacing: "-0.03em" }}>
              <span style={{ color: "#001740" }}>Fare</span>
              <span style={{ color: "#0047AB" }}>solution</span>
            </div>
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
