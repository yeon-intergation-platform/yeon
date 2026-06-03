import type { StyleProp, TextStyle } from "react-native";
import { Text } from "react-native";

import type { YeonIconCommonProps, YeonIconName } from "./types";

export type { YeonIconName } from "./types";

export type YeonIconProps = YeonIconCommonProps & {
  style?: StyleProp<TextStyle>;
};

const NATIVE_ICON_GLYPHS: Record<YeonIconName, string> = {
  "align-horizontal-center": "≡",
  "arrow-left": "←",
  bold: "B",
  "chevron-down": "⌄",
  "circle-help": "?",
  "circle-user": "◉",
  code: "<>",
  columns: "▥",
  crown: "♛",
  "file-text": "▤",
  "folder-open": "▱",
  "image-plus": "▧+",
  italic: "I",
  link: "↔",
  list: "☰",
  "list-ordered": "1.",
  loader: "◌",
  "log-out": "↪",
  "message-circle": "◌",
  mic: "⌕",
  "mic-off": "∅",
  phone: "☎",
  "phone-off": "☏",
  play: "▶",
  plus: "+",
  quote: "❝",
  redo: "↻",
  "rotate-cw": "↻",
  rows: "☷",
  search: "⌕",
  send: "↗",
  settings: "⚙",
  swords: "⚔",
  table: "▦",
  trash: "⌫",
  underline: "U",
  undo: "↺",
  unlink: "↮",
  user: "○",
  users: "◉",
  "volume-2": "♪",
  "volume-x": "∅",
  x: "×",
};

export function YeonIcon({
  color,
  name,
  size = 20,
  title,
  style,
}: YeonIconProps) {
  return (
    <Text
      accessibilityLabel={title}
      accessible={Boolean(title)}
      style={[
        {
          color,
          fontSize: size,
          fontWeight: "800",
          lineHeight: size + 2,
        },
        style,
      ]}
    >
      {NATIVE_ICON_GLYPHS[name]}
    </Text>
  );
}
