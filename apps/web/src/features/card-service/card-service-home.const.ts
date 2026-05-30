import { SHARED_FEATURE_CLASS } from "../shared-style-constants";

export const CARD_SERVICE_HOME_CLASS = {
  root: SHARED_FEATURE_CLASS.pageSurface,
  main: "flex min-w-0 flex-col items-center px-3 py-5 sm:px-5 md:px-10 md:py-5",
  introSection: "w-full max-w-[980px] min-w-0",
  introCopy: "max-w-[680px]",
  introTitle:
    "text-[27px] font-black tracking-[-0.04em] text-[#111] md:text-[34px]",
  introDescription:
    "mt-3 text-[14px] leading-[1.75] text-[#666] md:text-[15px]",
  boardSection:
    "mt-8 grid w-full max-w-[980px] min-w-0 overflow-x-visible rounded-[20px] border border-[#e5e5e5] bg-white sm:rounded-[24px] md:grid-cols-[430px_minmax(0,1fr)] md:rounded-[28px]",
  profilePanel:
    "min-w-0 border-b border-[#e5e5e5] p-4 md:border-b-0 md:border-r md:p-6",
  actionPanel: "min-w-0 p-4 md:p-6",
  sectionTitle: "text-[16px] font-bold text-[#111]",
  sectionBody: "mt-5 flex justify-center",
  ctaWrap: "mt-5 grid gap-4",
  ctaBase:
    "block w-full rounded-2xl px-5 py-5 text-left transition-colors no-underline",
  ctaPrimary: "border border-[#111] bg-[#111] text-white hover:bg-[#333]",
  ctaDefault:
    "border border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]",
  ctaLoading:
    "block w-full rounded-2xl px-5 py-5 text-left border border-[#e5e5e5] bg-[#fafafa] text-[#666] cursor-wait",
  ctaTextPrimary: "block text-[16px] font-bold",
  ctaTextSecondary: "mt-1 block text-[13px] leading-[1.6] text-white/70",
  ctaTextSecondaryMuted: "mt-1 block text-[13px] leading-[1.6] text-[#666]",
  ctaTextSecondaryGray: "mt-1 block text-[13px] leading-[1.6] text-[#666]",
} as const;
