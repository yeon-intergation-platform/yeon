export const yeonTypography = {
  fontFamily: {
    sans: [
      "Noto Sans KR",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "sans-serif",
    ],
  },
  fontSize: {
    xs: 12,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
  },
  fontWeight: {
    medium: "500",
    semibold: "600",
    bold: "700",
    black: "900",
  },
} as const;

export type YeonTypographyToken = typeof yeonTypography;
