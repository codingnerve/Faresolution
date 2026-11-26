import Image from "next/image";
import type { VendorLogo } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoMark";

type ProductLogoProps = {
  name: string;
  /** Brand colour as hex, e.g. "#4169E1", used by the monogram fallback. */
  color: string;
  /** Official vendor/product logo when supplied; otherwise falls back to LogoMark. */
  logo?: VendorLogo | null;
  size?: number;
  className?: string;
};

/**
 * Product or vendor tile: renders an official logo when present inside the
 * same rounded tile geometry, falling back to the generated LogoMark monogram.
 */
export function ProductLogo({ name, color, logo, size = 40, className }: ProductLogoProps) {
  if (!logo) {
    return <LogoMark name={name} color={color} size={size} className={className} />;
  }

  const radius = Math.min(8, Math.round(size * 0.2));

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, borderRadius: radius }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden border border-line bg-surface p-1",
        className,
      )}
    >
      <Image
        src={logo.src}
        alt=""
        width={logo.width}
        height={logo.height}
        sizes={`${size}px`}
        unoptimized={logo.src.endsWith(".svg")}
        className="size-full object-contain"
      />
    </span>
  );
}
