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
  accentDeep: "#009950",
  accentSoft: "#DDFBEA",
  paper: "#F8FAF7",
  ink: "#111714",
  muted: "#55635C",
  line: "#DDE7DF",
  dark: "#151A17",
  white: "#FFFFFF",
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
  if (title.length > 78) return 50;
  if (title.length > 62) return 56;
  if (title.length > 48) return 58;
  return 64;
}

function LogoMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <rect width="56" height="56" rx="17" fill={palette.accent} />
      <path
        d="M28 42.5A14.5 14.5 0 1 0 13.5 28"
        stroke={palette.white}
        strokeLinecap="round"
        strokeWidth="4.3"
      />
      <path
        d="M9.8 31.8L13.5 28L17.2 31.8"
        stroke={palette.white}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.3"
      />
    </svg>
  );
}

function ProductPreview({
  metricLabel,
  metricValue,
}: {
  metricLabel: string;
  metricValue: string;
}) {
  const rows = [
    ["Hearthline", "expired_card", "$87", "email sent"],
    ["RivetDesk", "authentication_required", "$129", "review"],
    ["Northstar Labs", "insufficient_funds", "$348", "retry"],
  ];

  return (
    <div
      style={{
        position: "absolute",
        right: 72,
        top: 82,
        width: 388,
        height: 470,
        borderRadius: 34,
        border: `1px solid ${palette.line}`,
        background: palette.white,
        boxShadow: "0 42px 90px rgba(21, 26, 23, 0.16)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 60,
          background: "#F1F5F2",
          borderBottom: `1px solid ${palette.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#C8D4CB",
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#C8D4CB",
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: palette.accent,
            }}
          />
        </div>
        <div
          style={{
            color: palette.accentDeep,
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          monitoring
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            borderRadius: 26,
            background: palette.dark,
            color: palette.white,
            padding: 24,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              color: palette.accent,
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 2.4,
              textTransform: "uppercase",
            }}
          >
            {metricLabel}
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 58,
              lineHeight: 0.92,
              fontWeight: 900,
              letterSpacing: -1,
            }}
          >
            {metricValue}
          </div>
          <div
            style={{
              marginTop: 12,
              color: "rgba(255,255,255,0.58)",
              fontSize: 19,
              fontWeight: 600,
            }}
          >
            failed-payment revenue in motion
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {rows.map(([company, code, amount, status]) => (
            <div
              key={company}
              style={{
                borderRadius: 20,
                background: "#F5F7F4",
                border: "1px solid #EDF2EE",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    color: palette.ink,
                    fontSize: 17,
                    fontWeight: 800,
                  }}
                >
                  {company}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    color: palette.muted,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {code}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    color: palette.ink,
                    fontSize: 17,
                    fontWeight: 900,
                  }}
                >
                  {amount}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    color:
                      status === "review" ? palette.accentDeep : palette.muted,
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function createDunloOgImage({
  title,
  description,
  badge = "Stripe payment recovery",
  metricLabel = "recovered",
  metricValue = "$248",
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
          background: palette.paper,
          display: "flex",
          fontFamily: "Outfit, Arial, sans-serif",
          color: palette.ink,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(90deg, rgba(17, 23, 20, 0.08) 1px, transparent 1px), linear-gradient(0deg, rgba(17, 23, 20, 0.06) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
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
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: -0.4,
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
              border: `1px solid ${palette.line}`,
              background: palette.white,
              padding: "0 18px",
              color: palette.accentDeep,
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: palette.accent,
                marginRight: 10,
              }}
            />
            {badge}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: titleFontSize(displayTitle),
              lineHeight: 0.96,
              fontWeight: 900,
              letterSpacing: -1.2,
            }}
          >
            {displayTitle}
          </div>
          <div
            style={{
              marginTop: 26,
              width: 540,
              color: palette.muted,
              fontSize: 27,
              lineHeight: 1.26,
              fontWeight: 600,
            }}
          >
            {displayDescription}
          </div>
        </div>

        <ProductPreview metricLabel={metricLabel} metricValue={metricValue} />
      </div>
    ),
    {
      ...ogImageSize,
      fonts,
    },
  );
}
