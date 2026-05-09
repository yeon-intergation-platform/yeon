import { ImageResponse } from "next/og";

type OgImageOptions = {
  eyebrow: string;
  title: string;
  description: string;
};

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_IMAGE_CONTENT_TYPE = "image/png";

export function createOgImage({ eyebrow, title, description }: OgImageOptions) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        color: "#111111",
        padding: "64px",
        fontFamily: "sans-serif",
        border: "1px solid #e5e5e5",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            border: "1px solid #e5e5e5",
            borderRadius: "999px",
            padding: "10px 18px",
            fontSize: 24,
            color: "#555555",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "920px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.45,
              color: "#666666",
            }}
          >
            {description}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #e5e5e5",
          paddingTop: "24px",
          fontSize: 28,
          color: "#555555",
        }}
      >
        <div>YEON</div>
        <div>yeon.world</div>
      </div>
    </div>,
    OG_IMAGE_SIZE
  );
}
