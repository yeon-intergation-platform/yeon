import { YEON_WEB_SHADOW_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";

export const TYPING_SERVICE_HOME_CLASS = {
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
  startCardBase:
    "group relative flex min-h-[96px] cursor-pointer items-start overflow-hidden rounded-2xl px-5 py-5 text-left transition-all duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 active:translate-y-0 active:duration-75",
  startCardPrimary: `shadow-sm hover:border-[#111] ${YEON_WEB_SHADOW_CLASS.hoverStartPrimary} active:shadow-sm`,
  startCardSecondary: `hover:border-[#111] hover:bg-[#fafafa] ${YEON_WEB_SHADOW_CLASS.hoverStartSecondary} active:shadow-none`,
  startCardLabel: "block text-[17px] font-extrabold tracking-[-0.03em]",
  startCardDescriptionPrimary:
    "pointer-events-none absolute inset-x-5 bottom-4 line-clamp-2 text-[13px] font-medium leading-[1.45] text-white/72 transition-all duration-200 ease-out sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:translate-y-0 sm:group-focus-visible:opacity-100",
  startCardDescriptionSecondary:
    "pointer-events-none absolute inset-x-5 bottom-4 line-clamp-2 text-[13px] font-medium leading-[1.45] text-[#666] transition-all duration-200 ease-out sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:translate-y-0 sm:group-focus-visible:opacity-100",
} as const;
