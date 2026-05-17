import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

export const CARD_SERVICE_COMMON_CLASS = {
  panelBodyTitle: "text-[18px] font-semibold text-[#111]",
  panelTitleStrong: "text-[18px] font-bold text-[#111]",
  panelTextEmphasis: "text-[14px] font-semibold text-[#111]",
  panelTextEmphasis15: "text-[15px] font-semibold text-[#111]",
  panelFieldLabel: "grid gap-2 text-[13px] font-semibold text-[#666]",
  sectionBodyTitleMd: "text-[24px] font-semibold text-[#111] md:text-[26px]",
  sectionBadge: `rounded-full bg-[#f3f3f3] px-2 py-0.5 ${SHARED_FEATURE_CLASS.text12EmphasisNeutral} md:text-[13px]`,
  actionButtonPrimaryInline:
    "inline-flex items-center justify-center rounded-[18px] bg-[#111] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#333]",
  actionButtonPrimaryLarge:
    "mt-5 rounded-[22px] bg-[#111] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#333]",
  panelNoticeText: "text-[18px] font-semibold text-[#111] md:text-[20px]",
  formControlLarge:
    "h-12 rounded-xl border border-[#d9d9d9] px-4 text-[15px] font-semibold text-[#111] outline-none focus:border-[#111] disabled:cursor-not-allowed disabled:bg-[#f5f5f5]",
  buttonSecondaryDark:
    "h-12 rounded-xl border border-[#e5e5e5] px-5 text-[14px] font-bold text-[#666] transition-colors hover:border-[#111] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-50",
  buttonPrimarySubmit:
    "h-12 rounded-xl bg-[#111] px-6 text-[14px] font-bold text-white transition-colors hover:bg-[#333] disabled:bg-[#ccc]",
  mutedErrorTextMd: "text-[14px] text-[#666]",
  errorTextMd: "text-[14px] text-red-600",
  errorTextSm: "text-[13px] text-red-600",
} as const;
