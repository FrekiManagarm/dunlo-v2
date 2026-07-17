import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogImageSize = {
  width: 1200,
  height: 630,
};

type DunloOgImageProps = {
  title: string;
  description: string;
  badge?: string;
};

const palette = {
  accent: "#00E87B",
  ink: "#07110C",
  white: "#F8FCF9",
  muted: "#A8B8AF",
};

const outfitWeights = [400, 500, 700, 800, 900] as const;
const outfitFonts = Promise.all(
  outfitWeights.map(async (weight) => {
    const font = await readFile(
      join(process.cwd(), `src/assets/fonts/outfit-${weight}.woff`),
    );

    return {
      name: "Outfit",
      data: font.buffer.slice(
        font.byteOffset,
        font.byteOffset + font.byteLength,
      ),
      style: "normal" as const,
      weight,
    };
  }),
);

function clampText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength - 1).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  const cleanText = (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated)
    .trim()
    .replace(/[.,;:]+$/, "");

  return `${cleanText}…`;
}

function titleFontSize(title: string) {
  if (title.length > 82) return 48;
  if (title.length > 68) return 52;
  if (title.length > 54) return 57;
  return 66;
}

function LogoMark() {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
      <rect
        width="50"
        height="50"
        rx="14"
        fill={palette.accent}
      />
      <path
        d="M25 38A13 13 0 1 0 12 25"
        stroke={palette.white}
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M8.7 28.4L12 25L15.3 28.4"
        stroke={palette.white}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </svg>
  );
}

function RecoveryPath() {
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: 382,
        height: "100%",
        background: palette.accent,
        color: palette.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -134,
          top: -94,
          width: 420,
          height: 420,
          border: `2px solid ${palette.ink}`,
          borderRadius: 999,
          opacity: 0.12,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -110,
          bottom: -168,
          width: 360,
          height: 360,
          border: `2px solid ${palette.ink}`,
          borderRadius: 999,
          opacity: 0.1,
          display: "flex",
        }}
      />
      <svg
        width="382"
        height="630"
        viewBox="0 0 382 630"
        fill="none"
        style={{ position: "absolute", inset: 0 }}
      >
        <path
          d="M76 90C76 183 296 154 296 264C296 371 88 349 88 461C88 510 126 540 183 540"
          stroke={palette.ink}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <circle cx="76" cy="90" r="20" fill={palette.ink} />
        <circle
          cx="296"
          cy="264"
          r="20"
          fill={palette.accent}
          stroke={palette.ink}
          strokeWidth="10"
        />
        <circle cx="88" cy="461" r="20" fill={palette.ink} />
        <path
          d="M166 514L192 540L166 566"
          stroke={palette.ink}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export async function createDunloOgImage({
  title,
  description,
  badge = "Stripe payment recovery",
}: DunloOgImageProps) {
  const displayTitle = clampText(title.replace(/ - Dunlo( Blog)?$/, ""), 92);
  const displayDescription = clampText(description, 118);
  const fonts = await outfitFonts;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: palette.ink,
          display: "flex",
          fontFamily: "Outfit, Arial, sans-serif",
          color: palette.white,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 52,
            display: "flex",
            alignItems: "center",
          }}
        >
          <LogoMark />
          <div
            style={{
              marginLeft: 16,
              display: "flex",
              fontSize: 31,
              fontWeight: 900,
              letterSpacing: -0.6,
            }}
          >
            dunlo
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 64,
            top: 148,
            width: 690,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              height: 38,
              border: "1px solid rgba(248,252,249,0.22)",
              borderRadius: 999,
              padding: "0 16px",
              color: palette.white,
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                marginRight: 10,
                borderRadius: 999,
                background: palette.accent,
              }}
            />
            {badge}
          </div>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              maxWidth: 690,
              fontSize: titleFontSize(displayTitle),
              lineHeight: 0.94,
              fontWeight: 900,
              letterSpacing: -2.1,
            }}
          >
            {displayTitle}
          </div>
          <div
            style={{
              marginTop: 24,
              width: 650,
              display: "flex",
              color: palette.muted,
              fontSize: 24,
              lineHeight: 1.3,
              fontWeight: 500,
            }}
          >
            {displayDescription}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 64,
            bottom: 34,
            width: 690,
            borderTop: "1px solid rgba(248,252,249,0.16)",
            paddingTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: palette.muted,
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <span>dunlo.io</span>
          <span>Free during beta · no recovery cut</span>
        </div>

        <RecoveryPath />
      </div>
    ),
    {
      ...ogImageSize,
      fonts,
    },
  );
}
