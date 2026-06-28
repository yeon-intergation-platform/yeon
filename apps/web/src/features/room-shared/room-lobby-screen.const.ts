export const ROOM_LOBBY_CLASS = {
  heroSection:
    "flex flex-col gap-5 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between md:px-10 md:py-10",
  heroTitle:
    "text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-[#111] sm:text-[44px] md:text-[52px]",
  heroDescription:
    "mt-3 max-w-[24ch] break-keep text-[16px] font-medium leading-7 text-[#666] md:mt-5 md:max-w-[34ch] md:text-[18px]",
  // 모바일 하단은 커뮤니티 챗 위젯(fixed bottom)이 떠 있어 콘텐츠가 가려지므로 여유 패딩을 둔다.
  listTopBorder:
    "border-t border-[#e5e5e5] px-4 pt-6 pb-28 sm:px-6 md:px-10 md:pb-12",
  filterRow:
    "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
  // 모바일에서 가로 스크롤 가능함을 우측 페이드로 힌트(#41).
  filterScroller:
    "flex gap-3 overflow-x-auto pb-1 [mask-image:linear-gradient(to_right,#000_calc(100%-20px),transparent)] md:pb-0 md:[mask-image:none]",
  inputButtonRow: "flex flex-col gap-3 md:flex-row md:items-center",
  searchField: "relative block w-full md:w-[336px]",
  searchIcon:
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#666]",
  roomListRow: "grid gap-3 p-4 md:p-5",
  roomMetaRow: "mt-3 text-[18px] font-semibold tracking-[-0.02em] text-[#111]",
  roomStatusArea:
    "flex items-center justify-between gap-4 md:flex-col md:items-end",
} as const;
