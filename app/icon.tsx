import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 192, height: 192,
        background: "#0D0E11",
        borderRadius: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        border: "4px solid #C49A2A",
      }}>
      <div style={{ fontSize: 72, lineHeight: 1 }}>⚽</div>
      <div style={{
        fontSize: 28, fontWeight: 900, color: "#C49A2A",
        letterSpacing: "0.1em",
      }}>SV</div>
    </div>,
    { width: 192, height: 192 }
  );
}
