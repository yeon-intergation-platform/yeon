export const TYPING_PROFILE_CARD_CLASS = {
  root: "flex w-full max-w-full min-w-0 flex-col items-center rounded-2xl border border-[#e5e5e5] bg-white px-4 py-5 sm:max-w-[380px] sm:px-10 sm:py-7",
  spriteWrapper:
    "mb-5 flex h-[300px] w-full items-end justify-center rounded-xl bg-[#f5f5f5] px-3 py-3 sm:mb-6 sm:h-[360px] sm:px-4",
  skeletonSpriteWrapper:
    "mb-5 flex h-[300px] w-full items-center justify-center rounded-xl bg-[#f5f5f5] px-3 py-3 sm:mb-6 sm:h-[360px] sm:px-4",
  skeletonText: "text-[13px] font-medium text-[#999]",
  skeletonNickname:
    "mb-5 h-[28px] w-28 rounded-full bg-[#f5f5f5] text-transparent",
  skeletonButtonRow: "flex flex-wrap justify-center gap-2",
  skeletonButton: "h-[44px] w-16 rounded-lg bg-[#f5f5f5]",
  nicknameRow: "mb-4 flex items-center gap-2",
  nicknameInput:
    "h-11 w-44 border-b border-[#111] bg-transparent text-center text-[20px] font-semibold text-[#111] outline-none",
  nicknameButton:
    "flex min-h-[44px] items-center gap-1.5 px-2 text-[20px] font-semibold text-[#111] hover:text-[#555]",
  nicknameEditIcon: "text-[14px] font-normal text-[#888]",
  characterGroupLabel: "mb-1 text-[12px] font-medium text-[#666]",
  characterListStack: "flex flex-wrap justify-center gap-2",
  characterListWrapper: "flex flex-col items-center gap-2",
  characterToggle:
    "mt-1 min-h-[44px] px-2 text-[12px] text-[#666] underline underline-offset-2 hover:text-[#111]",
  ctaButtonBase:
    "min-h-[44px] rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-colors",
  ctaButtonSelected: "border-[#111] bg-[#111] text-white",
  ctaButtonDefault: "border-[#e5e5e5] text-[#555] hover:border-[#aaa]",
} as const;
