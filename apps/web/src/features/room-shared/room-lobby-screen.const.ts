export const ROOM_LOBBY_CLASS = {
  heroSection:
    "flex min-h-[174px] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10",
  heroTitle:
    "text-[48px] font-black leading-none tracking-[-0.06em] text-[#111] md:text-[56px]",
  heroDescription: "mt-5 text-[18px] font-medium leading-7 text-[#666]",
  listTopBorder: "border-t border-[#e5e5e5] px-6 py-6 md:px-10",
  filterRow:
    "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
  filterScroller: "flex gap-3 overflow-x-auto pb-1 md:pb-0",
  inputButtonRow: "flex flex-col gap-3 md:flex-row md:items-center",
  searchField: "relative block w-full md:w-[336px]",
  searchIcon:
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#666]",
  roomListRow: "grid gap-3 p-4 md:p-5",
  roomMetaRow: "mt-3 text-[18px] font-semibold tracking-[-0.02em] text-[#111]",
  roomStatusArea:
    "flex items-center justify-between gap-4 md:flex-col md:items-end",
} as const;
