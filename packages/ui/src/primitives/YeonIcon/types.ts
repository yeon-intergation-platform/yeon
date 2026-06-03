import type { CSSProperties } from "react";

export const YEON_ICON_NAMES = [
  "align-horizontal-center",
  "arrow-left",
  "bold",
  "chevron-down",
  "circle-help",
  "circle-user",
  "code",
  "columns",
  "crown",
  "file-text",
  "folder-open",
  "image-plus",
  "italic",
  "link",
  "list",
  "list-ordered",
  "loader",
  "log-out",
  "message-circle",
  "mic",
  "mic-off",
  "phone",
  "phone-off",
  "play",
  "plus",
  "quote",
  "redo",
  "rotate-cw",
  "rows",
  "search",
  "send",
  "settings",
  "swords",
  "table",
  "trash",
  "underline",
  "undo",
  "unlink",
  "user",
  "users",
  "volume-2",
  "volume-x",
  "x",
] as const;

export type YeonIconName = (typeof YEON_ICON_NAMES)[number];

export type YeonIconCommonProps = {
  color?: string;
  name: YeonIconName;
  size?: number;
  strokeWidth?: number;
  title?: string;
};

export type YeonIconWebProps = YeonIconCommonProps & {
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
};
