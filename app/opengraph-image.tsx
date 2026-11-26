import { OG_CONTENT_TYPE, OG_SIZE, renderDefaultOgImage } from "@/lib/og/render";
import { SITE_NAME } from "@/lib/utils";
import { SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderDefaultOgImage();
}
