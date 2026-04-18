import { ImageResponse } from "next/og";

export const alt = "채종현 · 최수빈 결혼합니다 — 2026.11.15";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #f7eee6 0%, #f0dfd1 50%, #e8c9b5 100%)",
          fontFamily: "serif",
          color: "#3a2a22",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 28,
            letterSpacing: "0.6em",
            color: "#8a5a4a",
          }}
        >
          WEDDING INVITATION
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 64,
            fontSize: 132,
            fontWeight: 400,
            letterSpacing: "0.05em",
          }}
        >
          <span>채종현</span>
          <span style={{ fontSize: 96, color: "#b47a6a" }}>&amp;</span>
          <span>최수빈</span>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 40,
            letterSpacing: "0.2em",
            color: "#5a3f34",
          }}
        >
          2026 · 11 · 15 SUN PM 2:00
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 28,
            letterSpacing: "0.3em",
            color: "#8a5a4a",
          }}
        >
          테라리움 서울
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 22,
            letterSpacing: "0.4em",
            color: "#a07565",
          }}
        >
          · · ·
        </div>
      </div>
    ),
    { ...size }
  );
}
