import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          gap: 5,
          padding: 12,
          borderRadius: 15,
          background: "#111812",
          position: "relative",
        }}
      >
        <div style={{ width: 9, height: 15, borderRadius: 3, background: "#ff7d66" }} />
        <div style={{ width: 9, height: 24, borderRadius: 3, background: "#67c7f2" }} />
        <div style={{ width: 9, height: 36, borderRadius: 3, background: "#7be58c" }} />
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: 99,
            background: "#d9ff6b",
            position: "absolute",
            right: 11,
            top: 10,
          }}
        />
      </div>
    ),
    size,
  );
}
