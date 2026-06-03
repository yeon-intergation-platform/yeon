import type { ReactNode } from "react";

import type { YeonIconName, YeonIconWebProps } from "./types";

export type { YeonIconName, YeonIconWebProps as YeonIconProps } from "./types";

const ICON_LABELS: Record<YeonIconName, string> = {
  "align-horizontal-center": "정렬",
  "arrow-left": "뒤로",
  bold: "굵게",
  "chevron-down": "펼치기",
  "circle-help": "도움말",
  "circle-user": "사용자",
  code: "코드",
  columns: "열",
  crown: "방장",
  "file-text": "문서",
  "folder-open": "폴더",
  "image-plus": "이미지 추가",
  italic: "기울임",
  link: "링크",
  list: "목록",
  "list-ordered": "번호 목록",
  loader: "로딩",
  "log-out": "로그아웃",
  "message-circle": "메시지",
  mic: "마이크 켜짐",
  "mic-off": "마이크 꺼짐",
  phone: "통화",
  "phone-off": "통화 종료",
  play: "시작",
  plus: "추가",
  quote: "인용",
  redo: "다시 실행",
  "rotate-cw": "다시",
  rows: "행",
  search: "검색",
  send: "보내기",
  settings: "설정",
  swords: "대전",
  table: "표",
  trash: "삭제",
  underline: "밑줄",
  undo: "실행 취소",
  unlink: "링크 해제",
  user: "사용자",
  users: "사용자",
  "volume-2": "소리 켜짐",
  "volume-x": "소리 꺼짐",
  x: "닫기",
};

type IconRenderProps = {
  strokeWidth: number;
};

function textIcon(label: string) {
  return (
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fontSize="12"
      fontWeight="800"
      fill="currentColor"
      stroke="none"
    >
      {label}
    </text>
  );
}

function renderIcon(name: YeonIconName, { strokeWidth }: IconRenderProps) {
  const strokeProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth,
  } as const;

  const filledProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth,
  } as const;

  const iconMap: Record<YeonIconName, ReactNode> = {
    "align-horizontal-center": (
      <>
        <path d="M4 12h16" {...strokeProps} />
        <path d="M9 5v14" {...strokeProps} />
        <path d="M15 7v10" {...strokeProps} />
      </>
    ),
    "arrow-left": (
      <>
        <path d="M19 12H5" {...strokeProps} />
        <path d="m12 5-7 7 7 7" {...strokeProps} />
      </>
    ),
    bold: textIcon("B"),
    "chevron-down": <path d="m6 9 6 6 6-6" {...strokeProps} />,
    "circle-help": (
      <>
        <circle cx="12" cy="12" r="9" {...strokeProps} />
        <path
          d="M9.5 9a2.7 2.7 0 0 1 5 1.4c0 1.8-2.5 2-2.5 3.7"
          {...strokeProps}
        />
        <path d="M12 17h.01" {...strokeProps} />
      </>
    ),
    "circle-user": (
      <>
        <circle cx="12" cy="12" r="9" {...strokeProps} />
        <circle cx="12" cy="10" r="3" {...strokeProps} />
        <path d="M6.8 18a6 6 0 0 1 10.4 0" {...strokeProps} />
      </>
    ),
    code: (
      <>
        <path d="m8 9-3 3 3 3" {...strokeProps} />
        <path d="m16 9 3 3-3 3" {...strokeProps} />
        <path d="m13 5-2 14" {...strokeProps} />
      </>
    ),
    columns: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" {...strokeProps} />
        <path d="M12 5v14" {...strokeProps} />
      </>
    ),
    crown: <path d="m4 8 4 4 4-7 4 7 4-4-2 10H6L4 8Z" {...strokeProps} />,
    "file-text": (
      <>
        <path
          d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
          {...strokeProps}
        />
        <path d="M14 3v6h6" {...strokeProps} />
        <path d="M9 13h6" {...strokeProps} />
        <path d="M9 17h6" {...strokeProps} />
      </>
    ),
    "folder-open": (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2" {...strokeProps} />
        <path d="M3 11h18l-2 8H5L3 11Z" {...strokeProps} />
      </>
    ),
    "image-plus": (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" {...strokeProps} />
        <path d="m7 16 4-4 3 3 2-2 3 3" {...strokeProps} />
        <path d="M15 8h4" {...strokeProps} />
        <path d="M17 6v4" {...strokeProps} />
      </>
    ),
    italic: textIcon("I"),
    link: (
      <>
        <path
          d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10 5.9"
          {...strokeProps}
        />
        <path
          d="M14 11a5 5 0 0 0-7.1 0L5.5 12.4a5 5 0 0 0 7.1 7.1L14 18.1"
          {...strokeProps}
        />
      </>
    ),
    list: (
      <>
        <path d="M8 6h12" {...strokeProps} />
        <path d="M8 12h12" {...strokeProps} />
        <path d="M8 18h12" {...strokeProps} />
        <path d="M4 6h.01" {...strokeProps} />
        <path d="M4 12h.01" {...strokeProps} />
        <path d="M4 18h.01" {...strokeProps} />
      </>
    ),
    "list-ordered": (
      <>
        <path d="M10 6h10" {...strokeProps} />
        <path d="M10 12h10" {...strokeProps} />
        <path d="M10 18h10" {...strokeProps} />
        <path d="M4 6h1v4" {...strokeProps} />
        <path d="M4 18h2" {...strokeProps} />
        <path d="M4 14h1.5a1 1 0 0 1 0 2H4v2" {...strokeProps} />
      </>
    ),
    loader: (
      <>
        <path d="M12 3a9 9 0 1 1-8.5 6" opacity="0.28" {...strokeProps} />
        <path d="M12 3a9 9 0 0 1 9 9" {...strokeProps} />
      </>
    ),
    "log-out": (
      <>
        <path d="M10 17 15 12 10 7" {...strokeProps} />
        <path d="M15 12H3" {...strokeProps} />
        <path d="M14 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4" {...strokeProps} />
      </>
    ),
    "message-circle": (
      <path
        d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L4 20l1.1-4.1A8.5 8.5 0 1 1 21 11.5Z"
        {...strokeProps}
      />
    ),
    mic: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" {...strokeProps} />
        <path d="M5 11a7 7 0 0 0 14 0" {...strokeProps} />
        <path d="M12 18v3" {...strokeProps} />
        <path d="M9 21h6" {...strokeProps} />
      </>
    ),
    "mic-off": (
      <>
        <path d="M4 4l16 16" {...strokeProps} />
        <path d="M9 9v2a3 3 0 0 0 5.1 2.1" {...strokeProps} />
        <path d="M15 9.5V6a3 3 0 0 0-5.2-2" {...strokeProps} />
        <path d="M5 11a7 7 0 0 0 11.8 5" {...strokeProps} />
        <path d="M12 18v3" {...strokeProps} />
        <path d="M9 21h6" {...strokeProps} />
      </>
    ),
    phone: (
      <path
        d="M7 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 5 6a2 2 0 0 1 2-2Z"
        {...strokeProps}
      />
    ),
    "phone-off": (
      <>
        <path d="M4 4l16 16" {...strokeProps} />
        <path
          d="M9.5 5H10l1.5 4-1 1a11 11 0 0 0 3.5 3.5l1-1 4 1.5v.5"
          {...strokeProps}
        />
        <path d="M18 20A15 15 0 0 1 5 7" {...strokeProps} />
      </>
    ),
    play: <path d="M8 5v14l11-7L8 5Z" {...filledProps} />,
    plus: (
      <>
        <path d="M12 5v14" {...strokeProps} />
        <path d="M5 12h14" {...strokeProps} />
      </>
    ),
    quote: (
      <>
        <path d="M9 7H5v4h4v6H4" {...strokeProps} />
        <path d="M20 7h-4v4h4v6h-5" {...strokeProps} />
      </>
    ),
    redo: (
      <>
        <path d="M21 7v6h-6" {...strokeProps} />
        <path d="M21 13a8 8 0 1 1-2.3-5.7L21 9.6" {...strokeProps} />
      </>
    ),
    "rotate-cw": (
      <>
        <path d="M21 12a9 9 0 1 1-2.6-6.4" {...strokeProps} />
        <path d="M21 4v6h-6" {...strokeProps} />
      </>
    ),
    rows: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" {...strokeProps} />
        <path d="M4 10h16" {...strokeProps} />
        <path d="M4 15h16" {...strokeProps} />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" {...strokeProps} />
        <path d="m16 16 4 4" {...strokeProps} />
      </>
    ),
    send: (
      <>
        <path d="M21 3 10 14" {...strokeProps} />
        <path d="m21 3-7 18-4-7-7-4 18-7Z" {...strokeProps} />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" {...strokeProps} />
        <path
          d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-2 .1 1.7 1.7 0 0 0-.8 1.7v.2H10v-.2a1.7 1.7 0 0 0-.8-1.7 1.7 1.7 0 0 0-2-.1l-.2.1-2-3.4.1-.1A1.7 1.7 0 0 0 5.4 15 1.7 1.7 0 0 0 4 13.8h-.2V10h.2a1.7 1.7 0 0 0 1.4-1.2 1.7 1.7 0 0 0-.3-1.9L5 6.8l2-3.4.2.1a1.7 1.7 0 0 0 2-.1A1.7 1.7 0 0 0 10 1.7v-.2h4.8v.2a1.7 1.7 0 0 0 .8 1.7 1.7 1.7 0 0 0 2 .1l.2-.1 2 3.4-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 20.8 10h.2v3.8h-.2A1.7 1.7 0 0 0 19.4 15Z"
          {...strokeProps}
        />
      </>
    ),
    swords: (
      <>
        <path d="M14 4 20 10" {...strokeProps} />
        <path d="M20 4 4 20" {...strokeProps} />
        <path d="M4 4 20 20" {...strokeProps} />
        <path d="m5 19 3-1" {...strokeProps} />
        <path d="m19 19-3-1" {...strokeProps} />
      </>
    ),
    table: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" {...strokeProps} />
        <path d="M4 10h16" {...strokeProps} />
        <path d="M10 5v14" {...strokeProps} />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16" {...strokeProps} />
        <path d="M10 11v6" {...strokeProps} />
        <path d="M14 11v6" {...strokeProps} />
        <path d="M6 7l1 14h10l1-14" {...strokeProps} />
        <path d="M9 7V4h6v3" {...strokeProps} />
      </>
    ),
    underline: textIcon("U"),
    undo: (
      <>
        <path d="M3 7v6h6" {...strokeProps} />
        <path d="M3 13a8 8 0 1 0 2.3-5.7L3 9.6" {...strokeProps} />
      </>
    ),
    unlink: (
      <>
        <path
          d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-1-7.8"
          {...strokeProps}
        />
        <path
          d="M14 11a5 5 0 0 0-7.1 0L5.5 12.4a5 5 0 0 0 1 7.8"
          {...strokeProps}
        />
        <path d="M4 4l16 16" {...strokeProps} />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" {...strokeProps} />
        <path d="M4 21a8 8 0 0 1 16 0" {...strokeProps} />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" {...strokeProps} />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" {...strokeProps} />
        <path d="M16 11a3 3 0 0 0 0-6" {...strokeProps} />
        <path d="M17 19a4 4 0 0 0-3-4" {...strokeProps} />
      </>
    ),
    "volume-2": (
      <>
        <path d="M4 10v4h4l5 4V6l-5 4H4Z" {...strokeProps} />
        <path d="M16 9a5 5 0 0 1 0 6" {...strokeProps} />
        <path d="M18.5 6.5a8.5 8.5 0 0 1 0 11" {...strokeProps} />
      </>
    ),
    "volume-x": (
      <>
        <path d="M4 10v4h4l5 4V6l-5 4H4Z" {...strokeProps} />
        <path d="m17 9 5 5" {...strokeProps} />
        <path d="m22 9-5 5" {...strokeProps} />
      </>
    ),
    x: (
      <>
        <path d="M6 6l12 12" {...strokeProps} />
        <path d="M18 6 6 18" {...strokeProps} />
      </>
    ),
  };

  return iconMap[name];
}

export function YeonIcon({
  color,
  name,
  size = 20,
  strokeWidth = 2,
  title,
  className,
  style,
  "aria-hidden": ariaHidden,
}: YeonIconWebProps) {
  const hidden = ariaHidden ?? (title ? undefined : true);

  return (
    <svg
      aria-hidden={hidden}
      aria-label={title}
      className={className}
      fill="none"
      focusable="false"
      height={size}
      role={title ? "img" : undefined}
      style={{ color, ...style }}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      {renderIcon(name, { strokeWidth })}
    </svg>
  );
}

export const yeonIconLabels = ICON_LABELS;
