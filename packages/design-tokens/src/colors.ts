export const yeonColors = {
  white: "#ffffff",
  black: "#111",
  neutral: {
    50: "#fafafa",
    100: "#e5e5e5",
    400: "#aaa",
    600: "#666",
    900: "#111",
  },
  mobile: {
    accent: "#111",
    error: "#111",
    border: "#e5e5e5",
  },
  semantic: {
    success: "#111",
    error: "#111",
    info: "#666",
    accent: "#111",
  },
  overlay: {
    neutralBackdrop: "rgba(17, 17, 17, 0.18)",
  },
  auth: {
    background: "#080808",
    surface: "#111318",
    text: "#f8f7f3",
    cta: "#f8f7f3",
    ctaText: "#080808",
  },
} as const;

export type YeonColorToken = typeof yeonColors;
