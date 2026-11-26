import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/utils";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "An independent directory for finding, comparing and shortlisting business software.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#17243A",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
    ],
  };
}
