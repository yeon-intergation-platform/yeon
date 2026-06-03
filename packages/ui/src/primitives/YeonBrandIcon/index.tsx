import type { CSSProperties } from "react";
import {
  YEON_BRAND_ICON_LABELS,
  YEON_BRAND_ICON_NAMES,
  YEON_BRAND_ICON_PATHS,
  YEON_BRAND_ICON_TONE_COLORS,
  type YeonBrandIconName,
} from "./brand-paths";

export { YEON_BRAND_ICON_NAMES };
export type { YeonBrandIconName };

export type YeonBrandIconProps = {
  "aria-hidden"?: boolean | "true" | "false";
  className?: string;
  // "mono"(기본): currentColor 단색. "brand": 정식 브랜드 컬러.
  tone?: "mono" | "brand";
  name: YeonBrandIconName;
  size?: number;
  style?: CSSProperties;
  title?: string;
};

const BRAND_LABELS = YEON_BRAND_ICON_LABELS;

function renderBrandPath(name: YeonBrandIconName, tone: "mono" | "brand") {
  const toneColors = YEON_BRAND_ICON_TONE_COLORS[name];

  return (
    <>
      {YEON_BRAND_ICON_PATHS[name].map((d, index) => (
        <path
          key={index}
          d={d}
          fill={
            tone === "brand"
              ? (toneColors[index] ?? "currentColor")
              : "currentColor"
          }
        />
      ))}
    </>
  );
}

export function YeonBrandIcon({
  "aria-hidden": ariaHidden,
  className,
  tone = "mono",
  name,
  size = 20,
  style,
  title,
}: YeonBrandIconProps) {
  const accessibleTitle = title ?? BRAND_LABELS[name];
  const resolvedAriaHidden = ariaHidden ?? true;

  return (
    <svg
      aria-hidden={resolvedAriaHidden}
      className={className}
      focusable="false"
      height={size}
      role={resolvedAriaHidden ? undefined : "img"}
      style={style}
      viewBox="0 0 24 24"
      width={size}
    >
      {resolvedAriaHidden ? null : <title>{accessibleTitle}</title>}
      {renderBrandPath(name, tone)}
    </svg>
  );
}
