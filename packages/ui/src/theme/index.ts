import { yeonColors, yeonSpacing } from "@yeon/design-tokens";

export {
  yeonColors,
  yeonRadius,
  yeonShadows,
  yeonSpacing,
  yeonTypography,
} from "@yeon/design-tokens";

export const yeonMobileAppColors = {
  background: yeonColors.white,
  backgroundMuted: yeonColors.neutral[50],
  surface: yeonColors.neutral[50],
  surfaceStrong: yeonColors.white,
  border: yeonColors.mobile.border,
  borderStrong: yeonColors.mobile.border,
  text: yeonColors.neutral[900],
  textMuted: yeonColors.neutral[600],
  accent: yeonColors.mobile.accent,
  accentSoft: yeonColors.neutral[50],
  neutral: yeonColors.neutral[900],
  neutralSoft: yeonColors.neutral[50],
  danger: yeonColors.mobile.error,
  success: yeonColors.semantic.success,
  white: yeonColors.white,
  black: yeonColors.black,
  backdrop: yeonColors.overlay.neutralBackdrop,
} as const;

export const yeonMobileAppShadow = {
  shadowColor: yeonColors.black,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.04,
  shadowRadius: 12,
  elevation: 2,
} as const;

export const yeonMobileAppSpacing = {
  buttonHorizontal: yeonSpacing[4],
  inlineGap: yeonSpacing[2],
} as const;

export const yeonMobileWebPreview = {
  width: 393,
  height: 852,
  style: {
    containerBackground: yeonColors.neutral[50],
    frameBackground: yeonColors.white,
    frameBorderColor: yeonColors.neutral[100],
    frameBorderWidth: 1,
    frameRadius: 32,
    padding: 16,
  },
  transform: {
    scaleMax: 1,
  },
} as const;
