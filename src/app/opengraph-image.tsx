import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Marcus Ruud - Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 36 36"
          fill="none"
        >
          <path
            d="M4 32V4L12 24L18 10L24 24L32 4V32"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            Marcus Ruud
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#888",
            }}
          >
            Developer
          </div>
        </div>
        <div
          style={{
            fontSize: "16px",
            color: "#555",
            position: "absolute",
            bottom: "40px",
          }}
        >
          mruud.com
        </div>
      </div>
    ),
    { ...size }
  );
}
