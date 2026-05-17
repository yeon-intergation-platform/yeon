export const TYPING_PROFILE_CARD_CLASS = {
  root: "flex w-full max-w-full min-w-0 flex-col items-center rounded-2xl border border-[#e5e5e5] bg-white px-4 py-6 sm:max-w-[380px] sm:px-10 sm:py-8",
  spriteWrapper:
    "mb-5 flex h-[300px] w-full items-end justify-center rounded-xl bg-[#f5f5f5] px-3 py-3 sm:mb-6 sm:h-[360px] sm:px-4",
  skeletonSpriteWrapper:
    "mb-5 flex h-[300px] w-full items-center justify-center rounded-xl bg-[#f5f5f5] px-3 py-3 sm:mb-6 sm:h-[360px] sm:px-4",
  skeletonText: "text-[13px] font-medium text-[#999]",
  skeletonNickname:
    "mb-5 h-[28px] w-28 rounded-full bg-[#f5f5f5] text-transparent",
  skeletonButtonRow: "flex flex-wrap justify-center gap-2",
  skeletonButton: "h-[31px] w-16 rounded-lg bg-[#f5f5f5]",
  nicknameRow: "mb-5 flex items-center gap-2",
  nicknameInput:
    "w-44 border-b border-[#111] bg-transparent text-center text-[20px] font-semibold text-[#111] outline-none",
  nicknameButton:
    "flex items-center gap-1.5 text-[20px] font-semibold text-[#111] hover:text-[#555]",
  nicknameEditIcon: "text-[13px] font-normal text-[#bbb]",
  characterListStack: "flex flex-wrap justify-center gap-2",
  characterListWrapper: "flex flex-col items-center gap-2",
  characterToggle: "mt-1 text-[11px] text-[#aaa] hover:text-[#555]",
  ctaButtonBase:
    "rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
  ctaButtonSelected: "border-[#111] bg-[#111] text-white",
  ctaButtonDefault: "border-[#e5e5e5] text-[#555] hover:border-[#aaa]",
} as const;
