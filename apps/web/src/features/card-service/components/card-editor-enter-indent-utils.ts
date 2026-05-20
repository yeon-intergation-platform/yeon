export function getCardEditorLineLeadingIndentBeforeCursor(
  textBeforeCursor: string
) {
  const currentLine = textBeforeCursor.split("\n").at(-1) ?? textBeforeCursor;
  return currentLine.match(/^[\t ]+/)?.[0] ?? "";
}
