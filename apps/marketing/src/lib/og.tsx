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

  const truncated = text.slice(0, maxLength - 3).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  const cleanText = (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated)
    .trim()
    .replace(/[.,;:]+$/, "");

  return `${cleanText}...`;
}

function titleFontSize(title: string) {
  if (title.length > 74) return 52;
  if (title.length > 58) return 58;
  return 68;
}

function LogoMark() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
      <rect width="54" height="54" rx="15" fill="#00E87B" />
      <path
        d="M27 41.5A14.5 14.5 0 1 0 12.5 27"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="4.2"
      />
      <path
        d="M8.8 30.8L12.5 27L16.2 30.8"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.2"
      />
    </svg>
  );
}

function EditorialAccent() {
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: 430,
        height: 630,
        display: "flex",
        flexDirection: "column",
        padding: "76px 70px 72px",
      }}
    >
      <div
        style={{
          color: "#087A42",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: 3.2,
          textTransform: "uppercase",
        }}
      >
        Dunlo
      </div>
      <div
        style={{
          marginTop: 92,
          height: 2,
          width: 256,
          background: "#BFEBD0",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 36,
          color: "rgba(13, 18, 16, 0.08)",
          fontSize: 74,
          fontWeight: 900,
          letterSpacing: -1.4,
          lineHeight: 0.88,
          textTransform: "uppercase",
        }}
      >
        Payment
        <br />
        Recovery
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 84,
            height: 2,
            background: "#BFEBD0",
          }}
        />
        <div
          style={{
            width: 38,
            height: 2,
            background: "#00C66A",
          }}
        />
      </div>
    </div>
  );
}

export async function createDunloOgImage({
  title,
  description,
  badge = "Stripe payment recovery",
}: DunloOgImageProps) {
  const displayTitle = clampText(title.replace(/ - Dunlo( Blog)?$/, ""), 92);
  const displayDescription = clampText(description, 108);
  const fonts = await outfitFonts;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#FAFEFB",
          display: "flex",
          fontFamily: "Outfit, Arial, sans-serif",
          color: "#0D1210",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(90deg, rgba(207, 224, 213, 0.44) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            opacity: 0.52,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 430,
            height: 630,
            background: "#ECFAF1",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 430,
            top: 0,
            width: 2,
            height: 630,
            background: "#CFE0D5",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 118,
            top: 74,
            width: 256,
            height: 2,
            background: "#BFEBD0",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 232,
            bottom: 70,
            width: 230,
            height: 2,
            background: "#BFEBD0",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 78,
            top: 76,
            display: "flex",
            alignItems: "center",
          }}
        >
          <LogoMark />
          <div
            style={{
              marginLeft: 18,
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -0.2,
            }}
          >
            dunlo
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 78,
            top: 170,
            width: 610,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              height: 42,
              borderRadius: 999,
              border: "1px solid #CFE0D5",
              background: "#FFFFFF",
              padding: "0 18px",
              color: "#087A42",
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#00E87B",
                marginRight: 10,
              }}
            />
            {badge}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: titleFontSize(displayTitle),
              lineHeight: 0.98,
              fontWeight: 900,
              letterSpacing: -1.1,
            }}
          >
            {displayTitle}
          </div>
          <div
            style={{
              marginTop: 26,
              width: 548,
              color: "#3E4E45",
              fontSize: 28,
              lineHeight: 1.28,
              fontWeight: 500,
            }}
          >
            {displayDescription}
          </div>
        </div>

        <EditorialAccent />
      </div>
    ),
    {
      ...ogImageSize,
      fonts,
    },
  );
}
