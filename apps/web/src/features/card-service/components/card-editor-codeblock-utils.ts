const CARD_EDITOR_CODE_LANGUAGE_CLASS_PATTERN =
  /(?:^|\s)language-([a-z0-9_+#.-]+)/i;
const CARD_EDITOR_MARKDOWN_FENCE_PATTERN =
  /^\s*(```|~~~)([a-z0-9_+#.-]+)?[^\n]*\n([\s\S]*?)\n\1\s*$/i;

export interface CardEditorCodeBlockInfo {
  code: string;
  language?: string;
}

export function normalizeCardEditorCodeLanguage(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value
    .trim()
    .replace(/^language-/i, "")
    .toLowerCase();
  if (!/^[a-z0-9_+#.-]{1,32}$/.test(normalized)) return undefined;
  return normalized;
}

export function getCardEditorCodeLanguageFromClassName(value: unknown) {
  if (typeof value !== "string") return undefined;
  const match = value.match(CARD_EDITOR_CODE_LANGUAGE_CLASS_PATTERN);
  return normalizeCardEditorCodeLanguage(match?.[1]);
}

export function parseSingleCardEditorMarkdownCodeFence(
  value: string
): CardEditorCodeBlockInfo | undefined {
  const match = value.match(CARD_EDITOR_MARKDOWN_FENCE_PATTERN);
  if (!match) return undefined;

  const language = normalizeCardEditorCodeLanguage(match[2]);
  const code = match[3]?.replace(/\r\n?/g, "\n") ?? "";

  return {
    code,
    language,
  };
}
