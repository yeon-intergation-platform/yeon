export const YEON_WEB_OVERLAY_CLASS = {
  scrimSubtle: "bg-[#111]/20",
  scrimMedium: "bg-[#111]/35",
  scrimDefault: "bg-[#111]/40",
  scrimStrong: "bg-[#111]/70",
} as const;

export const YEON_WEB_SHADOW_CLASS = {
  actionSoft: "shadow-[0_3px_10px_rgba(17,17,17,0.10)]",
  dropdown: "shadow-[0_8px_24px_rgba(17,17,17,0.10)]",
  cardSoft: "shadow-[0_18px_60px_rgba(17,17,17,0.08)]",
  cardTiny: "shadow-[0_6px_22px_rgba(17,17,17,0.04)]",
  cardWide: "shadow-[0_24px_80px_rgba(17,17,17,0.08)]",
  territoryBoard: "shadow-[0_30px_100px_rgba(17,17,17,0.08)]",
  modalSoft: "shadow-[0_20px_80px_rgba(17,17,17,0.12)]",
  modal: "shadow-[0_24px_80px_rgba(17,17,17,0.18)]",
  modalMd: "md:shadow-[0_24px_80px_rgba(17,17,17,0.18)]",
  dialog: "shadow-[0_28px_80px_rgba(17,17,17,0.18)]",
  popover: "shadow-[0_24px_80px_rgba(17,17,17,0.22)]",
  hoverStartPrimary:
    "hover:shadow-[0_16px_34px_rgba(17,17,17,0.18)] focus-visible:shadow-[0_16px_34px_rgba(17,17,17,0.18)]",
  hoverStartSecondary:
    "hover:shadow-[0_14px_30px_rgba(17,17,17,0.08)] focus-visible:shadow-[0_14px_30px_rgba(17,17,17,0.08)]",
} as const;

export const YEON_WEB_CSS_VALUE = {
  invertedCodeBackground: "rgba(255, 255, 255, 0.1)",
  invertedCodeBorder: "rgba(255, 255, 255, 0.2)",
  invertedCodeHeaderBorder: "rgba(255, 255, 255, 0.15)",
  invertedCodeText: "rgba(255, 255, 255, 0.75)",
  selectedCellBackground: "rgba(17, 17, 17, 0.08)",
  imageHandleShadow: "0 2px 8px rgba(17, 17, 17, 0.22)",
  imageSizeBackground: "rgba(17, 17, 17, 0.78)",
} as const;

export const YEON_WEB_SHARED_CLASS = {
  pageSurface: "min-h-screen bg-white text-[#111]",
  modalOverlay:
    "fixed inset-0 z-50 m-0 flex h-auto max-h-none w-auto max-w-none items-center justify-center border-0 bg-[#111]/40 p-0",
  modalCard: "mx-4 w-full max-w-[420px] rounded-xl bg-white p-6",
  text12Emphasis: "text-[12px] font-semibold text-[#111]",
  text12EmphasisMuted: "text-[12px] font-semibold text-[#666]",
  text12EmphasisSubtle: "text-[12px] font-semibold text-[#aaa]",
  text12EmphasisNeutral: "text-[12px] font-semibold text-[#666]",
  text13Emphasis: "text-[13px] font-semibold text-[#111]",
  text13EmphasisSubtle: "text-[13px] font-semibold text-[#aaa]",
  text13EmphasisMuted: "text-[13px] font-semibold text-[#666]",
  text13Primary: "text-[13px] text-[#111]",
  text13PrimaryBold: "text-[13px] font-bold text-[#111]",
  text13Secondary: "text-[13px] text-[#666]",
  text13MediumSecondary: "text-[13px] font-medium text-[#666]",
  text15EmphasisOnCream: "text-[15px] font-bold text-[#fafafa]",
  text13Neutral: "text-[13px] text-[#666]",
  text13Subtle: "text-[13px] text-[#aaa]",
  text16Secondary: "text-[16px] font-medium text-[#666]",
  text11EmphasisSubtle: "text-[11px] font-semibold text-[#aaa]",
  text13Soft: "text-[13px] text-[#aaa]",
  text12Soft: "text-[12px] text-[#aaa]",
  text16Emphasis: "text-[16px] font-semibold text-[#111]",
  text13PrimaryMedium: "text-[13px] font-medium text-[#111]",
  text14Neutral: "text-[14px] text-[#666]",
  text14Soft: "text-[14px] text-[#aaa]",
  text14Primary: "text-[14px] text-[#111]",
  text15Primary: "text-[15px] text-[#111]",
  text12Subtle: "text-[12px] text-[#aaa]",
  text12Neutral: "text-[12px] text-[#666]",
  text22Emphasis: "text-[22px] font-semibold text-[#111]",
  text28Emphasis: "text-[28px] font-semibold text-[#111]",
  text34Emphasis: "text-[34px] font-semibold text-[#111]",
  text12BoldNeutral: "text-[12px] font-bold text-[#666]",
  smallInlineActionButton:
    "inline-flex items-center gap-2 rounded border border-[#e5e5e5] px-5 py-2 text-[13px] font-medium text-[#666] transition-colors hover:border-[#aaa]",
  mutedInputPanel: "rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2",
  panelCard: "rounded-2xl border border-[#e5e5e5] bg-white p-4",
  wrapItemsCenterGap2: "flex flex-wrap items-center gap-2",
  inlineItemsCenterGap2: "flex items-center gap-2",
  alignBetweenGap3: "flex items-center justify-between gap-3",
  alignBetweenStartGap3: "flex items-start justify-between gap-3",
  alignBetweenGap3WithMargin3: "mt-3 flex items-center justify-between gap-3",
  alignBetweenGap3WithMargin4: "mt-4 flex items-center justify-between gap-3",
  alignBetweenStartGap3WithMargin4:
    "mb-4 flex items-start justify-between gap-3",
  primaryActionButtonMd14:
    "rounded-xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90",
  primaryActionButtonMd13:
    "rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90",
  headingText22Emphasis: "text-[22px] font-semibold text-[#111]",
  ghostButtonMd14:
    "rounded-xl border border-[#e5e5e5] px-4 py-2 text-[14px] text-[#111] hover:bg-[#fafafa]",
  ghostButtonMd13:
    "rounded-xl border border-[#e5e5e5] px-4 py-2 text-[13px] text-[#111] no-underline transition-colors hover:border-[#111]",
  inputText14:
    "rounded-lg border border-[#e5e5e5] px-3 py-2 text-[14px] text-[#111] outline-none focus:border-[#111]",
  captionMutedMono: "font-mono text-[12px] text-[#aaa]",
  sectionHeading14: "mb-3 text-[14px] font-bold",
  sectionBodyGap3: "mt-3 grid gap-3",
  wrapGap2: "flex flex-wrap gap-2",
  tagPill: "rounded-full border border-[#e5e5e5] px-2 py-0.5",
} as const;

export const YEON_WEB_AUTH_CLASS = {
  pageSurface: "min-h-screen bg-[#080808] text-[#f8f7f3]",
  frame560:
    "mx-auto grid min-h-screen w-[min(560px,calc(100%-32px))] place-items-center py-10",
  frame720:
    "mx-auto grid min-h-screen w-[min(720px,calc(100%-32px))] place-items-center py-10",
  panel:
    "grid w-full gap-6 rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[#111318] p-8 md:p-6",
  headerStack: "grid gap-2",
  eyebrow:
    "m-0 text-xs font-bold uppercase tracking-[0.16em] text-[#f8f7f3]/60",
  title:
    "m-0 text-[clamp(26px,4.2vw,40px)] font-black leading-[1.04] tracking-[-0.04em] text-[#f8f7f3]",
  titleWide:
    "m-0 text-[clamp(30px,6vw,52px)] font-black leading-[0.96] tracking-[-0.05em] text-[#f8f7f3]",
  description: "m-0 text-base leading-[1.65] text-[#f8f7f3]/75",
  body13: "m-0 text-[13px] leading-[1.65] text-[#f8f7f3]/70",
  body13Dim: "m-0 text-[13px] leading-relaxed text-[#f8f7f3]/50",
  footerLinks:
    "flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#f8f7f3]/70",
  inlineLink: "underline-offset-4 hover:underline",
  inlineLinkStrong:
    "font-bold text-[#f8f7f3]/85 underline-offset-4 hover:underline",
  label: "grid gap-1.5",
  labelText: "text-[13px] font-bold tracking-[-0.01em] text-[#f8f7f3]/82",
  helperText: "text-[12px] leading-[1.55] text-[#f8f7f3]/55",
  inputTextBase:
    "h-12 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#111318] px-4 text-[15px] text-[#f8f7f3] outline-none transition-colors duration-150 placeholder:text-[#f8f7f3]/40 focus:border-[#f8f7f3]",
  primaryAction:
    "inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#f8f7f3] px-[22px] text-[15px] font-bold text-[#080808] transition-transform duration-200 ease-[ease] hover:enabled:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70",
  secondaryAction:
    "inline-flex min-h-[48px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[#111318] px-5 text-[14px] font-bold text-[#f8f7f3]/90 transition-transform duration-200 ease-[ease] hover:enabled:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70",
  secondaryAction52:
    "inline-flex min-h-[52px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[#111318] px-[22px] text-[15px] font-bold text-[#f8f7f3]/90 transition-transform duration-200 ease-[ease] hover:-translate-y-px",
  statusPanel:
    "grid gap-2 rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[#111318] p-4 text-[13px] leading-[1.6] text-[#f8f7f3]/78",
  noticePanel:
    "grid gap-4 rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#111318] p-5",
  alertPanel:
    "grid gap-2 rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[#111318] p-4 text-[13px] leading-[1.55] text-[#f8f7f3]",
  errorText13: "m-0 text-[13px] leading-[1.55] text-[#f8f7f3]",
  statusTitle15: "m-0 text-[15px] font-bold text-[#f8f7f3]",
  statusTitle13: "m-0 font-bold text-[#f8f7f3]/85",
} as const;
