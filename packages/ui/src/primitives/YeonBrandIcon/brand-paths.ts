// 브랜드 로고 path 데이터 SSOT(web/native 공용). 플랫폼 중립 — React 비의존.
// web(svg)·native(react-native-svg)이 동일 path를 렌더해 drift를 막는다.
// 단색(currentColor/color) 로고로, 카드 서비스 중립 팔레트와 웹 parity를 유지한다.

export const YEON_BRAND_ICON_NAMES = ["google", "kakao"] as const;

export type YeonBrandIconName = (typeof YEON_BRAND_ICON_NAMES)[number];

export const YEON_BRAND_ICON_LABELS: Record<YeonBrandIconName, string> = {
  google: "구글",
  kakao: "카카오",
};

// 브랜드 정식 컬러(tone="brand"일 때 path별 색). 순서는 PATHS와 1:1.
// google: 파랑/초록/노랑/빨강(정식 G 로고 순서). kakao: 검정 말풍선(노란 버튼 위).
export const YEON_BRAND_ICON_TONE_COLORS: Record<
  YeonBrandIconName,
  readonly string[]
> = {
  google: ["#4285F4", "#34A853", "#FBBC05", "#EA4335"],
  kakao: ["#000000"],
};

// viewBox 0 0 24 24 기준 path d 문자열 모음.
export const YEON_BRAND_ICON_PATHS: Record<
  YeonBrandIconName,
  readonly string[]
> = {
  kakao: [
    "M12 3.5C6.74 3.5 2.5 6.73 2.5 10.76c0 2.53 1.67 4.77 4.22 6.03l-1.02 3.77c-.09.34.27.61.57.43l4.41-2.93c.43.05.87.08 1.32.08 5.25 0 9.5-3.23 9.5-7.38S17.25 3.5 12 3.5Z",
  ],
  google: [
    "M21.6 12.23c0-.82-.07-1.41-.22-2.03H12v3.71h5.5c-.11.92-.73 2.31-2.1 3.24l-.02.12 3 2.28.21.02c1.93-1.75 3.03-4.31 3.03-7.34Z",
    "M12 21.9c2.7 0 4.97-.87 6.63-2.33l-3.16-2.42c-.85.58-1.99.99-3.47.99-2.65 0-4.89-1.75-5.69-4.15l-.11.01-3.12 2.37-.04.1c1.64 3.18 4.99 5.43 8.96 5.43Z",
    "M6.31 13.99A6.02 6.02 0 0 1 5.98 12c0-.69.12-1.35.31-1.99l-.01-.13-3.16-2.4-.1.05A9.8 9.8 0 0 0 2 12c0 1.62.39 3.15 1.08 4.47l3.23-2.48Z",
    "M12 5.86c1.86 0 3.12.79 3.84 1.45l2.8-2.68C16.96 3.09 14.7 2.1 12 2.1c-3.97 0-7.32 2.25-8.96 5.43l3.27 2.48C7.11 7.61 9.35 5.86 12 5.86Z",
  ],
};
