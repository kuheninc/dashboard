import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #d1b799 0%, #a68b6b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="22"
          height="16"
          viewBox="0 0 56 48"
          fill="none"
        >
          <path
            d="M4 36 Q14 6, 24 22 Q34 38, 44 12 Q48 4, 52 8"
            stroke="#1c1720"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
