import { yeonColors } from "@yeon/design-tokens";
import type { ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
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
  color?: string;
  // "mono"(기본): 단색. "brand": 정식 브랜드 컬러(구글 멀티컬러 등).
  tone?: "mono" | "brand";
  name: YeonBrandIconName;
  size?: number;
  style?: ViewStyle;
  title?: string;
};

export function YeonBrandIcon({
  color = yeonColors.black,
  tone = "mono",
  name,
  size = 20,
  style,
  title,
}: YeonBrandIconProps) {
  const toneColors = YEON_BRAND_ICON_TONE_COLORS[name];

  return (
    <Svg
      accessibilityLabel={title ?? YEON_BRAND_ICON_LABELS[name]}
      height={size}
      style={style}
      viewBox="0 0 24 24"
      width={size}
    >
      {YEON_BRAND_ICON_PATHS[name].map((d, index) => (
        <Path
          d={d}
          fill={tone === "brand" ? (toneColors[index] ?? color) : color}
          key={index}
        />
      ))}
    </Svg>
  );
}
