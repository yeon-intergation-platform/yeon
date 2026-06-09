export type ToolbarAction =
  | "heading"
  | "bold"
  | "italic"
  | "list"
  | "code"
  | "table"
  | "image";

export const MARKDOWN_TEXT_FIELD_TOOLBAR: {
  action: ToolbarAction;
  label: string;
}[] = [
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

export type Selection = { start: number; end: number };
export type InsertResult = { value: string; selection: Selection };

// 선택 영역/커서에 마크다운을 삽입한다. 사용자는 raw 문법을 칠 필요가 없다.
export function applyMarkdownTextFieldFormat(
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

export function insertMarkdownTextFieldSnippetAtCursor(
  value: string,
  selection: Selection,
  snippet: string
): InsertResult {
  const end = Math.max(selection.start, selection.end);
  const nextValue = value.slice(0, end) + snippet + value.slice(end);
  const cursor = end + snippet.length;
  return { value: nextValue, selection: { start: cursor, end: cursor } };
}
