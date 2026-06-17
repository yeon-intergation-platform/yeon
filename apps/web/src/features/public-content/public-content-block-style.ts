import type { CSSProperties } from "react";
import type { PublicContentBlock } from "./public-content-data";

type PublicContentImageBlock = Extract<PublicContentBlock, { type: "image" }>;
type PublicContentCodeBlock = Extract<PublicContentBlock, { type: "code" }>;

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
