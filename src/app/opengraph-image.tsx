import { ImageResponse } from "next/og";

// Branded social-share card used for Open Graph and Twitter previews across the
// site. 1200x630 is the standard large-summary size.
export const alt = "TarnMail — every inbox, one private window";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 55%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            color: "#1a73e8",
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#1a73e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 34,
            }}
          >
            ✉
          </div>
          TarnMail
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            color: "#0f172a",
            maxWidth: 900,
          }}
        >
          Every inbox, one private window.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            color: "#475569",
            maxWidth: 880,
          }}
        >
          Gmail, Outlook & Yahoo in one encrypted client. No ad profiling, no
          content mining, no selling your data.
        </div>
      </div>
    ),
    { ...size },
  );
}
