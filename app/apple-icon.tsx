import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180, height: 180,
        background: "#0D0E11",
        borderRadius: 36,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}>
      <div style={{ fontSize: 68, lineHeight: 1 }}>⚽</div>
      <div style={{
        fontSize: 26, fontWeight: 900, color: "#C49A2A",
        letterSpacing: "0.1em",
      }}>SV</div>
    </div>,
    { width: 180, height: 180 }
  );
}
