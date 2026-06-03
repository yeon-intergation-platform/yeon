import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";

export const CARD_SERVICE_COMMON_CLASS = {
  panelBodyTitle: "text-[18px] font-semibold text-[#111]",
  panelTitleStrong: "text-[18px] font-bold text-[#111]",
  panelTextEmphasis: "text-[14px] font-semibold text-[#111]",
  panelTextEmphasis15: "text-[15px] font-semibold text-[#111]",
  panelFieldLabel: "grid gap-2 text-[13px] font-semibold text-[#666]",
  sectionBodyTitleMd: "text-[24px] font-semibold text-[#111] md:text-[26px]",
  sectionBadge: `rounded-full bg-[#fafafa] px-2 py-0.5 ${SHARED_FEATURE_CLASS.text12EmphasisNeutral} md:text-[13px]`,
  actionButtonPrimaryInline:
    "inline-flex items-center justify-center rounded-[18px] bg-[#111] px-4 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90",
  actionButtonPrimaryLarge:
    "mt-5 rounded-[22px] bg-[#111] px-5 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90",
  panelNoticeText: "text-[18px] font-semibold text-[#111] md:text-[20px]",
  formControlLarge:
    "h-12 rounded-xl border border-[#e5e5e5] px-4 text-[15px] font-semibold text-[#111] outline-none focus:border-[#111] disabled:cursor-not-allowed disabled:bg-[#fafafa]",
  buttonSecondaryDark:
    "h-12 rounded-xl border border-[#e5e5e5] px-5 text-[14px] font-bold text-[#666] transition-colors hover:border-[#111] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-50",
  buttonPrimarySubmit:
    "h-12 rounded-xl bg-[#111] px-6 text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:bg-[#e5e5e5]",
  mutedErrorTextMd: "text-[14px] text-[#666]",
  errorTextMd: "text-[14px] text-[#666]",
  errorTextSm: "text-[13px] text-[#666]",
} as const;
