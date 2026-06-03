export const yeonShadows = {
  none: "none",
  sm: "0 1px 2px rgba(17, 17, 17, 0.06)",
  md: "0 8px 24px rgba(17, 17, 17, 0.08)",
  lg: "0 18px 48px rgba(17, 17, 17, 0.12)",
} as const;

export type YeonShadowToken = typeof yeonShadows;
