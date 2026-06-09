import {
  YeonButton,
  YeonTextField as TextField,
  YeonView,
  createYeonStyleSheet,
  showYeonAlert,
  yeonMobileAppColors,
} from "@yeon/ui/native";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { uploadCardImageAsset } from "../../services/card-service/asset-upload";

type ToolbarAction =
  | "heading"
  | "bold"
  | "italic"
  | "list"
  | "code"
  | "table"
  | "image";

const TOOLBAR: { action: ToolbarAction; label: string }[] = [
  { action: "heading", label: "제목" },
  { action: "bold", label: "굵게" },
  { action: "italic", label: "기울임" },
  { action: "list", label: "목록" },
  { action: "code", label: "코드" },
  { action: "table", label: "표" },
  { action: "image", label: "이미지" },
];

const PLACEHOLDER_TEXT: Record<"bold" | "italic" | "code", string> = {
  bold: "굵게",
  italic: "기울임",
  code: "코드",
};

const TABLE_TEMPLATE = "\n| 제목 | 제목 |\n| --- | --- |\n| 내용 | 내용 |\n";

type Selection = { start: number; end: number };
type InsertResult = { value: string; selection: Selection };

function getImageAttachmentErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return `이미지를 첨부하지 못했어요. 원인: ${error.trim()}`;
  }

  return `이미지를 첨부하지 못했어요. 원인: 처리할 수 없는 오류 형식(${String(error)})`;
}

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

// 선택 영역/커서에 마크다운을 삽입한다. 사용자는 raw 문법을 칠 필요가 없다.
function applyFormat(
  value: string,
  selection: Selection,
  action: Exclude<ToolbarAction, "image">
): InsertResult {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);
  const selected = value.slice(start, end);

  if (action === "table") {
    const nextValue = value.slice(0, end) + TABLE_TEMPLATE + value.slice(end);
    const cursor = end + TABLE_TEMPLATE.length;
    return { value: nextValue, selection: { start: cursor, end: cursor } };
  }

  if (action === "heading" || action === "list") {
    const prefix = action === "heading" ? "## " : "- ";
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const nextValue =
      value.slice(0, lineStart) + prefix + value.slice(lineStart);
    const cursor = end + prefix.length;
    return { value: nextValue, selection: { start: cursor, end: cursor } };
  }

  const wrap = action === "bold" ? "**" : action === "italic" ? "*" : "`";
  const placeholder = selected || PLACEHOLDER_TEXT[action];
  const inserted = `${wrap}${placeholder}${wrap}`;
  const nextValue = value.slice(0, start) + inserted + value.slice(end);

  if (selected) {
    const cursor = start + inserted.length;
    return { value: nextValue, selection: { start: cursor, end: cursor } };
  }
  const innerStart = start + wrap.length;
  return {
    value: nextValue,
    selection: { start: innerStart, end: innerStart + placeholder.length },
  };
}

function insertAtCursor(
  value: string,
  selection: Selection,
  snippet: string
): InsertResult {
  const end = Math.max(selection.start, selection.end);
  const nextValue = value.slice(0, end) + snippet + value.slice(end);
  const cursor = end + snippet.length;
  return { value: nextValue, selection: { start: cursor, end: cursor } };
}

type MarkdownTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
};

export function MarkdownTextField({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
}: MarkdownTextFieldProps) {
  // 툴바 삽입 직후에만 selection을 제어하고, 그 외에는 비제어(undefined)로 둔다.
  // 이로써 onChangeText와 selection 간 동기화 문제(커서 점프)를 방지한다(idx=131).
  const [controlledSelection, setControlledSelection] = useState<
    Selection | undefined
  >(undefined);
  const [isUploading, setUploading] = useState(false);

  // 최신 value와 selection을 ref로 유지해 비동기 핸들러에서 stale closure를 방지한다(idx=132).
  const valueRef = useRef(value);
  const selectionRef = useRef<Selection>({ start: 0, end: 0 });
  valueRef.current = value;

  function commit(result: InsertResult) {
    if (typeof maxLength === "number" && result.value.length > maxLength) {
      // idx=130: 조용히 드롭하는 대신 사용자에게 안내한다.
      showYeonAlert(
        "내용이 너무 길어요",
        `최대 ${maxLength}자까지 입력할 수 있어요. 이미지를 삽입하면 글자 수가 초과됩니다.`
      );
      return;
    }
    onChangeText(result.value);
    // 삽입 후 커서 위치를 일시적으로 제어하고, 다음 onSelectionChange에서 해제한다(idx=131).
    setControlledSelection(result.selection);
  }

  async function handleAction(action: ToolbarAction) {
    if (action === "image") {
      await handleInsertImage();
      return;
    }
    // 최신 value/selection을 ref에서 읽어 stale closure를 피한다(idx=132).
    commit(applyFormat(valueRef.current, selectionRef.current, action));
  }

  async function handleInsertImage() {
    if (isUploading) return;
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showYeonAlert(
          "권한 필요",
          "이미지를 첨부하려면 사진 접근 권한이 필요해요."
        );
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (picked.canceled || !picked.assets[0]) return;

      const asset = picked.assets[0];
      setUploading(true);
      const uploaded = await uploadCardImageAsset({
        uri: asset.uri,
        name: asset.fileName ?? "image.jpg",
        mimeType: asset.mimeType ?? "image/jpeg",
      });
      // 업로드 완료 시점의 최신 value/selection을 ref에서 읽는다(idx=132).
      commit(
        insertAtCursor(
          valueRef.current,
          selectionRef.current,
          `\n![](${uploaded.imageUrl})\n`
        )
      );
    } catch (error) {
      showYeonAlert("이미지 첨부 실패", getImageAttachmentErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  return (
    <YeonView style={styles.wrapper}>
      <YeonView style={styles.toolbar}>
        {TOOLBAR.map((item) => (
          <YeonButton
            accessibilityRole="button"
            aria-label={item.label}
            disabled={item.action === "image" && isUploading}
            key={item.action}
            onPress={() => handleAction(item.action)}
            style={styles.toolButton}
          >
            <ToolbarIcon action={item.action} />
          </YeonButton>
        ))}
      </YeonView>
      <TextField
        label={label}
        maxLength={maxLength}
        multiline
        multilineMinHeight={136}
        onChangeText={onChangeText}
        onSelectionChange={(event) => {
          const sel = event.nativeEvent.selection;
          selectionRef.current = sel;
          // 제어된 selection을 해제한다(커서가 자연스럽게 이동한 것으로 간주)(idx=131).
          if (controlledSelection !== undefined) {
            setControlledSelection(undefined);
          }
        }}
        placeholder={placeholder}
        selection={controlledSelection}
        showCounter={typeof maxLength === "number"}
        value={value}
      />
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  wrapper: {
    gap: 8,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  toolButton: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
});
