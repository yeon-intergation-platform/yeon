import type { CSSProperties } from "react";

export type YeonOgImageFrameProps = {
  brand?: string;
  description: string;
  domain?: string;
  eyebrow: string;
  title: string;
};

const frameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  background: "#ffffff",
  color: "#111",
  padding: "64px",
  fontFamily: "sans-serif",
  border: "1px solid #e5e5e5",
};

const contentStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const eyebrowStyle: CSSProperties = {
  display: "flex",
  alignSelf: "flex-start",
  border: "1px solid #e5e5e5",
  borderRadius: "999px",
  padding: "10px 18px",
  fontSize: 24,
  color: "#666",
};

const copyStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  maxWidth: "920px",
};

const titleStyle: CSSProperties = {
  fontSize: 72,
  lineHeight: 1.1,
  fontWeight: 800,
  letterSpacing: "-0.04em",
};

const descriptionStyle: CSSProperties = {
  fontSize: 30,
  lineHeight: 1.45,
  color: "#666",
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderTop: "1px solid #e5e5e5",
  paddingTop: "24px",
  fontSize: 28,
  color: "#666",
};

export function YeonOgImageFrame({
  brand = "YEON",
  description,
  domain = "yeon.world",
  eyebrow,
  title,
}: YeonOgImageFrameProps) {
  return (
    <div style={frameStyle}>
      <div style={contentStackStyle}>
        <div style={eyebrowStyle}>{eyebrow}</div>
        <div style={copyStackStyle}>
          <div style={titleStyle}>{title}</div>
          <div style={descriptionStyle}>{description}</div>
        </div>
      </div>

      <div style={footerStyle}>
        <div>{brand}</div>
        <div>{domain}</div>
      </div>
    </div>
  );
}
