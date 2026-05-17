import { type Editor } from "@tiptap/react";

import {
  createCardEditorMarkdownTableRow,
  isCardEditorMarkdownTableBlock,
  normalizeCardEditorMarkdownTableLines,
  splitCardEditorMarkdownTableRow,
} from "./card-editor-table-utils";

interface ProseMirrorNodeLike {
  type: {
    name: string;
  };
  nodeSize: number;
  textContent: string;
  descendants: (
    callback: (node: ProseMirrorNodeLike, pos: number) => void
  ) => void;
}

interface ParagraphLine {
  index: number;
  pos: number;
  nodeSize: number;
  text: string;
}

interface MarkdownTableRange {
  lines: ParagraphLine[];
  columnCount: number;
}

function collectParagraphLines(document: ProseMirrorNodeLike) {
  const lines: ParagraphLine[] = [];
  document.descendants((node, pos) => {
    if (node.type.name !== "paragraph") {
      return;
    }

    lines.push({
      index: lines.length,
      pos,
      nodeSize: node.nodeSize,
      text: node.textContent,
    });
  });

  return lines;
}

function lineContainsMarkdownTableCell(line: string) {
  return splitCardEditorMarkdownTableRow(line).length >= 2;
}

function findCurrentParagraphIndex(
  lines: readonly ParagraphLine[],
  pos: number
) {
  return lines.findIndex(
    (line) => pos >= line.pos && pos <= line.pos + line.nodeSize
  );
}

function findCardEditorMarkdownTableRange(
  editor: Editor
): MarkdownTableRange | undefined {
  const { doc, selection } = editor.state;
  const lines = collectParagraphLines(doc as unknown as ProseMirrorNodeLike);
  const currentIndex = findCurrentParagraphIndex(lines, selection.from);
  if (currentIndex < 0) {
    return undefined;
  }

  let startIndex = currentIndex;
  while (
    startIndex > 0 &&
    lineContainsMarkdownTableCell(lines[startIndex - 1]?.text ?? "")
  ) {
    startIndex -= 1;
  }

  let endIndex = currentIndex;
  while (
    endIndex + 1 < lines.length &&
    lineContainsMarkdownTableCell(lines[endIndex + 1]?.text ?? "")
  ) {
    endIndex += 1;
  }

  const candidateLines = lines.slice(startIndex, endIndex + 1);
  if (
    !isCardEditorMarkdownTableBlock(candidateLines.map((line) => line.text))
  ) {
    return undefined;
  }

  const columnCount = Math.max(
    ...candidateLines.map(
      (line) => splitCardEditorMarkdownTableRow(line.text).length
    )
  );

  return {
    lines: candidateLines,
    columnCount,
  };
}

function replaceTableLines(
  editor: Editor,
  range: MarkdownTableRange,
  nextLines: readonly string[]
) {
  const firstLine = range.lines[0];
  const lastLine = range.lines[range.lines.length - 1];
  if (!firstLine || !lastLine) return false;

  const nodes = nextLines.map((line) => ({
    type: "paragraph",
    content: line
      ? [
          {
            type: "text",
            text: line,
          },
        ]
      : undefined,
  }));

  return editor
    .chain()
    .focus()
    .deleteRange({
      from: firstLine.pos,
      to: lastLine.pos + lastLine.nodeSize,
    })
    .insertContentAt(firstLine.pos, nodes)
    .run();
}

export function isCardEditorSelectionInMarkdownTable(editor: Editor | null) {
  if (!editor) return false;
  return findCardEditorMarkdownTableRange(editor) !== undefined;
}

export function normalizeSelectedCardEditorMarkdownTable(editor: Editor) {
  const range = findCardEditorMarkdownTableRange(editor);
  if (!range) return false;

  const normalizedLines = normalizeCardEditorMarkdownTableLines(
    range.lines.map((line) => line.text)
  );
  if (!normalizedLines) return false;

  return replaceTableLines(editor, range, normalizedLines);
}

export function addRowToSelectedCardEditorMarkdownTable(editor: Editor) {
  const range = findCardEditorMarkdownTableRange(editor);
  if (!range) return false;

  const normalizedLines = normalizeCardEditorMarkdownTableLines(
    range.lines.map((line) => line.text)
  );
  if (!normalizedLines) return false;

  const nextLines = [
    ...normalizedLines,
    createCardEditorMarkdownTableRow(
      Array.from({ length: range.columnCount }, () => "")
    ),
  ];

  return replaceTableLines(editor, range, nextLines);
}

export function addColumnToSelectedCardEditorMarkdownTable(editor: Editor) {
  const range = findCardEditorMarkdownTableRange(editor);
  if (!range) return false;

  const normalizedLines = normalizeCardEditorMarkdownTableLines(
    range.lines.map((line) => line.text)
  );
  if (!normalizedLines) return false;

  const nextLines = normalizedLines.map((line, rowIndex) => {
    const cells = splitCardEditorMarkdownTableRow(line);
    const nextCell = rowIndex === 0 ? "새 열" : rowIndex === 1 ? "---" : "";
    return createCardEditorMarkdownTableRow([...cells, nextCell]);
  });

  return replaceTableLines(editor, range, nextLines);
}
