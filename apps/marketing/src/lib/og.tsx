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
  metricLabel?: string;
  metricValue?: string;
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

function signalFontSize(value: string) {
  if (value.length > 22) return 27;
  if (value.length > 15) return 30;
  if (value.length > 9) return 42;
  return 58;
}

function breakTechnicalSignal(value: string) {
  return value.replace(/([._-])/g, "$1\u200B");
}

function LogoMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
      <rect
        width="50"
        height="50"
        rx="14"
        fill={inverted ? palette.ink : palette.accent}
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

function RecoveryLogic({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const displayValue = breakTechnicalSignal(value);

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
        flexDirection: "column",
        padding: "54px 48px 44px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", fontSize: 18, fontWeight: 800 }}>
          Recovery logic
        </div>
        <LogoMark inverted />
      </div>

      <div
        style={{
          position: "absolute",
          right: -92,
          top: 130,
          width: 292,
          height: 292,
          border: `2px solid ${palette.ink}`,
          borderRadius: 999,
          opacity: 0.18,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -42,
          top: 180,
          width: 192,
          height: 192,
          border: `2px solid ${palette.ink}`,
          borderRadius: 999,
          opacity: 0.12,
          display: "flex",
        }}
      />

      <div
        style={{
          marginTop: 66,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 16,
            fontWeight: 700,
            opacity: 0.62,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              marginRight: 10,
              borderRadius: 999,
              background: palette.ink,
            }}
          />
          {label}
        </div>
        <div
          style={{
            marginTop: 14,
            maxWidth: 282,
            display: "flex",
            fontSize: signalFontSize(value),
            lineHeight: 1.04,
            fontWeight: 900,
            letterSpacing: -1.5,
            overflowWrap: "anywhere",
          }}
        >
          {displayValue}
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          borderTop: `2px solid ${palette.ink}`,
          paddingTop: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 16,
            fontWeight: 700,
            opacity: 0.62,
          }}
        >
          Dunlo decision
        </div>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            lineHeight: 1,
            fontWeight: 900,
          }}
        >
          <span>matched path</span>
          <span style={{ fontSize: 34 }}>→</span>
        </div>
      </div>
    </div>
  );
}

export async function createDunloOgImage({
  title,
  description,
  badge = "Stripe payment recovery",
  metricLabel = "Stripe signal",
  metricValue = "payment_failed",
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

        <RecoveryLogic label={metricLabel} value={metricValue} />
      </div>
    ),
    {
      ...ogImageSize,
      fonts,
    },
  );
}
