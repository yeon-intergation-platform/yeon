export const MOBILE_WEB_PREVIEW_WIDTH = 393;
export const MOBILE_WEB_PREVIEW_HEIGHT = 852;

export const MOBILE_WEB_PREVIEW = {
  width: MOBILE_WEB_PREVIEW_WIDTH,
  height: MOBILE_WEB_PREVIEW_HEIGHT,
  style: {
    containerBackground: "#0f172a",
    frameBackground: "#fff",
    frameBorderColor: "rgba(255,255,255,0.2)",
    frameBorderWidth: 1,
    frameRadius: 32,
    padding: 16,
  },
  transform: {
    scaleMax: 1,
  },
} as const;

export type MobileWebPreviewConfig = typeof MOBILE_WEB_PREVIEW;
