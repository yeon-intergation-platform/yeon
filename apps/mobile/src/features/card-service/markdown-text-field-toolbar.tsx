import { YeonButton, YeonView, yeonMobileAppColors } from "@yeon/ui/native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import {
  MARKDOWN_TEXT_FIELD_TOOLBAR,
  type ToolbarAction,
} from "./markdown-text-field-formatting";
import { markdownTextFieldStyles as styles } from "./markdown-text-field-styles";

// 텍스트 서식 아이콘(lucide 스타일).
function ToolbarIcon({ action }: { action: ToolbarAction }) {
  const stroke = yeonMobileAppColors.text;
  return (
    <Svg
      fill="none"
      height={18}
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={18}
    >
      {action === "heading" ? (
        <>
          <Path d="M6 12h12" />
          <Path d="M6 20V4" />
          <Path d="M18 20V4" />
        </>
      ) : null}
      {action === "bold" ? (
        <Path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
      ) : null}
      {action === "italic" ? (
        <>
          <Path d="M19 4h-9" />
          <Path d="M14 20H5" />
          <Path d="M15 4 9 20" />
        </>
      ) : null}
      {action === "list" ? (
        <>
          <Path d="M8 6h13" />
          <Path d="M8 12h13" />
          <Path d="M8 18h13" />
          <Path d="M3 6h.01" />
          <Path d="M3 12h.01" />
          <Path d="M3 18h.01" />
        </>
      ) : null}
      {action === "code" ? (
        <>
          <Path d="M16 18l6-6-6-6" />
          <Path d="M8 6l-6 6 6 6" />
        </>
      ) : null}
      {action === "table" ? (
        <>
          <Rect height="18" rx="2" width="18" x="3" y="3" />
          <Path d="M3 9h18" />
          <Path d="M3 15h18" />
          <Path d="M12 3v18" />
        </>
      ) : null}
      {action === "image" ? (
        <>
          <Rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
          <Circle cx="9" cy="9" r="2" />
          <Path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </>
      ) : null}
    </Svg>
  );
}

interface MarkdownTextFieldToolbarProps {
  isUploading: boolean;
  onAction: (action: ToolbarAction) => void;
}

export function MarkdownTextFieldToolbar({
  isUploading,
  onAction,
}: MarkdownTextFieldToolbarProps) {
  return (
    <YeonView style={styles.toolbar}>
      {MARKDOWN_TEXT_FIELD_TOOLBAR.map((item) => (
        <YeonButton
          accessibilityRole="button"
          aria-label={item.label}
          disabled={item.action === "image" && isUploading}
          key={item.action}
          onPress={() => onAction(item.action)}
          style={styles.toolButton}
        >
          <ToolbarIcon action={item.action} />
        </YeonButton>
      ))}
    </YeonView>
  );
}
