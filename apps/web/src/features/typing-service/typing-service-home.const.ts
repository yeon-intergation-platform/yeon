import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

export const TYPING_SERVICE_HOME_CLASS = {
  root: SHARED_FEATURE_CLASS.pageSurface,
  main: "flex flex-col items-center px-5 py-5 md:px-10 md:py-5",
  introSection: "w-full max-w-[960px]",
  introCopy: "max-w-[640px]",
  introTitle:
    "text-[27px] font-black tracking-[-0.04em] text-[#111] md:text-[34px]",
  introDescription:
    "mt-3 text-[14px] leading-[1.75] text-[#666] md:text-[15px]",
  boardSection:
    "mt-8 grid w-full max-w-[980px] overflow-hidden rounded-[28px] md:grid-cols-[430px_minmax(0,1fr)]",
  profilePanel:
    "border-b border-[#e5e5e5] p-5 md:border-b-0 md:border-r md:p-6",
  actionPanel: "p-5 md:p-6",
  sectionTitle: "text-[16px] font-bold text-[#111]",
  sectionBody: "mt-5 flex justify-center",
  ctaWrap: "mt-5 grid gap-4",
  startCardBase:
    "group relative flex min-h-[96px] cursor-pointer items-start overflow-hidden rounded-2xl px-5 py-5 text-left transition-all duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 active:translate-y-0 active:duration-75",
  startCardPrimary:
    "shadow-sm hover:border-[#111] hover:shadow-[0_16px_34px_rgba(17,17,17,0.18)] focus-visible:shadow-[0_16px_34px_rgba(17,17,17,0.18)] active:shadow-sm",
  startCardSecondary:
    "hover:border-[#111] hover:bg-[#fafafa] hover:shadow-[0_14px_30px_rgba(17,17,17,0.08)] focus-visible:shadow-[0_14px_30px_rgba(17,17,17,0.08)] active:shadow-none",
  startCardLabel: "block text-[17px] font-extrabold tracking-[-0.03em]",
  startCardDescriptionPrimary:
    "pointer-events-none absolute inset-x-5 bottom-4 line-clamp-2 text-[13px] font-medium leading-[1.45] text-white/72 transition-all duration-200 ease-out sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:translate-y-0 sm:group-focus-visible:opacity-100",
  startCardDescriptionSecondary:
    "pointer-events-none absolute inset-x-5 bottom-4 line-clamp-2 text-[13px] font-medium leading-[1.45] text-[#666] transition-all duration-200 ease-out sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:translate-y-0 sm:group-focus-visible:opacity-100",
} as const;
