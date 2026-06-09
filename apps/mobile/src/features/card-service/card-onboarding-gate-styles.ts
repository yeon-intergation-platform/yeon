import { createYeonStyleSheet, yeonMobileAppColors } from "@yeon/ui/native";

// 카카오 브랜드 컬러(소셜 로그인 버튼 한정 예외 — 사용자 명시 요청).
const KAKAO_YELLOW = "#FEE500";
const KAKAO_LABEL_BLACK = "#191919";
const BRAND_BUTTON_HEIGHT = 56;

export const cardOnboardingGateStyles = createYeonStyleSheet({
  hero: {
    alignItems: "center",
    gap: 6,
    paddingTop: 28,
    paddingBottom: 8,
  },
  heroMascot: {
    height: 150,
    width: 150,
  },
  heroTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 40,
    marginTop: 12,
    paddingTop: 2,
    textAlign: "center",
  },
  heroSubtitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  // 소셜 버튼: 로고는 왼쪽 고정, 텍스트는 전체 폭 중앙.
  brandIconSlot: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    top: 0,
  },
  googleButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: yeonMobileAppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: BRAND_BUTTON_HEIGHT,
    justifyContent: "center",
  },
  googleButtonText: {
    color: yeonMobileAppColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  kakaoButton: {
    alignItems: "center",
    backgroundColor: KAKAO_YELLOW,
    borderRadius: 16,
    height: BRAND_BUTTON_HEIGHT,
    justifyContent: "center",
  },
  kakaoButtonText: {
    color: KAKAO_LABEL_BLACK,
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  dividerLine: {
    backgroundColor: yeonMobileAppColors.border,
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: yeonMobileAppColors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  guestNoteButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  guestNoteText: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
});
