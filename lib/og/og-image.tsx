import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

import type { Project } from "@/lib/data/types";

import { OG_IMAGE_SIZE } from "@/lib/site-meta";

/** Build-time Open Graph images (issue #61). */

// The personal logo exactly as the nav pill shows it (components/layout/
// NavPill: public/images/startergate.png filling a #f2f3f5 circle).
const personalLogoPromise = readFile(
  path.join(process.cwd(), "public/images/startergate.png"),
).then((buf) => `data:image/png;base64,${buf.toString("base64")}`);

function PersonalLogo({ size, src }: { size: number; src: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        background: "#f2f3f5",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img
        src={src}
        width={size}
        height={size}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}

// [x, y, radius] of the stars scattered over the sky.
const STARS = [
  [120, 70, 2],
  [310, 150, 1.5],
  [540, 40, 2],
  [760, 120, 1.5],
  [980, 60, 2.5],
  [1110, 190, 1.5],
  [1000, 440, 1.5],
  [640, 560, 1.5],
  [60, 300, 1.5],
  [1150, 330, 2],
  [200, 500, 2],
  [880, 540, 1.5],
];

const TEXT = "#E8ECF4";
const SURFACE2 = "#182033";
const LINE = "#232B3D";

/** Night sky (dark theme gradient) with `content` in the middle. */
function renderNightSky(content: ReactNode): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "linear-gradient(to bottom, #03050b 0%, #060a16 18%, #0b1428 40%, #12204a 64%, #1c2d5e 82%, #2e3468 94%, #4a3f70 100%)",
      }}
    >
      {STARS.map(([x, y, r], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            background: "#dde4f2",
            opacity: 0.7,
          }}
        />
      ))}
      {content}
    </div>,
    OG_IMAGE_SIZE,
  );
}

/** Site-wide image: the personal logo alone. */
export async function renderOgImage(): Promise<ImageResponse> {
  return renderNightSky(
    <PersonalLogo size={360} src={await personalLogoPromise} />,
  );
}

const PROJECT_LOGO_SIZE = 260;

/**
 * Project image: the personal logo and the project's logo side by side,
 * split by a thin vertical line. The project logo sits on the same tile
 * as the dark-theme project card (logo.src is the dark-theme variant).
 */
export async function renderProjectOgImage(
  logo: NonNullable<Project["logo"]>,
): Promise<ImageResponse> {
  const buf = await readFile(
    path.join(process.cwd(), "public/images", logo.src),
  );
  // PNG IHDR: width/height are big-endian uint32 at byte 16/20.
  const ratio = buf.readUInt32BE(16) / buf.readUInt32BE(20);
  // Wordmark logos are wide; give them a wider, shorter tile.
  const wide = ratio > 1.6;
  const tileWidth = wide ? 420 : PROJECT_LOGO_SIZE;
  const tileHeight = wide ? 180 : PROJECT_LOGO_SIZE;
  const pad = 32;

  return renderNightSky(
    <div style={{ display: "flex", alignItems: "center", gap: 64 }}>
      <PersonalLogo size={PROJECT_LOGO_SIZE} src={await personalLogoPromise} />
      <div
        style={{
          display: "flex",
          width: 2,
          height: PROJECT_LOGO_SIZE,
          background: TEXT,
          opacity: 0.35,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: tileWidth,
          height: tileHeight,
          borderRadius: 40,
          background: logo.background ?? SURFACE2,
          border: `2px solid ${LINE}`,
          padding: pad,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={`data:image/png;base64,${buf.toString("base64")}`}
          width={tileWidth - pad * 2}
          height={tileHeight - pad * 2}
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>,
  );
}
