import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { PRODUCT_PAGE_HEADER_CLASS } from "@/components/product-shell/product-page-header";

export const TYPING_SERVICE_HOME_CLASS = {
  root: SHARED_FEATURE_CLASS.pageSurface,
  main: "flex min-w-0 flex-col items-center px-3 py-5 sm:px-5 md:px-10 md:py-5",
  introSection: "w-full max-w-[980px] min-w-0",
  introCopy: PRODUCT_PAGE_HEADER_CLASS.copy,
  introTitle: PRODUCT_PAGE_HEADER_CLASS.title,
  introDescription: PRODUCT_PAGE_HEADER_CLASS.description,
  boardSection:
    "mt-8 grid w-full max-w-[980px] min-w-0 overflow-x-visible rounded-[20px] border border-[#e5e5e5] bg-white sm:rounded-[24px] md:grid-cols-[430px_minmax(0,1fr)] md:rounded-[28px]",
  profilePanel:
    "min-w-0 border-b border-[#e5e5e5] p-4 md:border-b-0 md:border-r md:p-6",
  actionPanel: "min-w-0 p-4 md:p-6",
  sectionTitle: "text-[16px] font-bold text-[#111]",
  sectionBody: "mt-5 flex justify-center",

  // 오늘의 시작: 레이스 입장 배너(제공된 race-entry-card 에셋)
  raceBanner:
    "group mt-5 block overflow-hidden rounded-[20px] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2 active:translate-y-0 active:duration-75",
  raceBannerImage: "block h-auto w-full",

  // 다른 기능: 아이콘 + 제목 + 설명 + chevron 행 목록
  featureDivider: "my-6 border-t border-[#e5e5e5]",
  featureListTitle: "text-[15px] font-bold text-[#111]",
  featureList: "mt-4 grid gap-3",
  featureRow:
    "group flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-4 py-3.5 no-underline transition-colors hover:border-[#111] hover:bg-[#fafafa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2",
  featureIconWrap:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f6f6f6]",
  featureIcon: "h-[26px] w-[26px]",
  featureBody: "flex min-w-0 flex-1 flex-col gap-0.5",
  featureTitle: "text-[15px] font-bold leading-tight text-[#111]",
  featureDescription: "text-[13px] leading-[1.5] text-[#666]",
  featureChevron:
    "shrink-0 text-[#bbb] transition-colors group-hover:text-[#111]",
} as const;
