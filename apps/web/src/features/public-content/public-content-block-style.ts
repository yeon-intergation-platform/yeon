import type { CSSProperties } from "react";
import type {
  PublicContentBlock,
  PublicContentCalloutTone,
} from "./public-content-data";

type PublicContentImageBlock = Extract<PublicContentBlock, { type: "image" }>;
type PublicContentCodeBlock = Extract<PublicContentBlock, { type: "code" }>;

type PublicContentCalloutStyle = {
  containerClassName: string;
  titleClassName: string;
  textClassName: string;
};

const PUBLIC_CONTENT_CALLOUT_STYLES = {
  note: {
    containerClassName: "border-[#e5e5e5] bg-[#fafafa]",
    titleClassName: "text-[#111]",
    textClassName: "text-[#666]",
  },
  warning: {
    containerClassName: "border-[#e7d9b8] bg-[#fffaf0]",
    titleClassName: "text-[#6f4e00]",
    textClassName: "text-[#5f5542]",
  },
  success: {
    containerClassName: "border-[#cfe3d6] bg-[#f3faf5]",
    titleClassName: "text-[#245c39]",
    textClassName: "text-[#4d6455]",
  },
} as const satisfies Record<
  PublicContentCalloutTone,
  PublicContentCalloutStyle
>;

export function getPublicContentImageAspectRatioStyle({
  height,
  width,
}: Pick<PublicContentImageBlock, "height" | "width">): CSSProperties {
  if (width <= 0 || height <= 0) return {};

  return {
    aspectRatio: `${width} / ${height}`,
  };
}

export function getPublicContentCodeBlockLabel({
  filename,
  language,
}: Pick<PublicContentCodeBlock, "filename" | "language">) {
  return [filename, language].filter(Boolean).join(" · ");
}

export function getPublicContentCalloutStyle(
  tone?: PublicContentCalloutTone
): PublicContentCalloutStyle {
  return PUBLIC_CONTENT_CALLOUT_STYLES[tone ?? "note"];
}
