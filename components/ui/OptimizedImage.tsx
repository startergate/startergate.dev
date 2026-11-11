"use client";

import ExportedImage from "next-image-export-optimizer";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof ExportedImage>;

/**
 * Drop-in replacement for `next/image`.
 *
 * Static export (`output: "export"`) has no image optimization server, so
 * `npm run build` ends with next-image-export-optimizer pre-generating WebP
 * variants of `public/images` at several widths; this component builds the
 * srcset from them and falls back to the original file when they are missing
 * (e.g. in dev mode).
 *
 * Blur placeholders are not generated (`generateAndUseBlurImages: false` in
 * next.config), so the placeholder defaults to "empty".
 */
export default function OptimizedImage({ placeholder = "empty", ...props }: Props) {
  return <ExportedImage placeholder={placeholder} {...props} />;
}
