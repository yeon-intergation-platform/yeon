import type {
  YeonTiptapFragment as Fragment,
  YeonTiptapProseMirrorNode as ProseMirrorNode,
  YeonTiptapProseMirrorSlice as Slice,
} from "@yeon/ui/rich-content/YeonTiptap";

function escapeMarkdownTableCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

function normalizeLineBreaks(value: string) {
  return value.replace(/\n{3,}/g, "\n\n").trim();
}

function textWithMarks(node: ProseMirrorNode) {
  let value = node.text ?? "";

  node.marks.forEach((mark) => {
    if (mark.type.name === "code") {
      value = `\`${value}\``;
      return;
    }
    if (mark.type.name === "bold") {
      value = `**${value}**`;
      return;
    }
    if (mark.type.name === "italic") {
      value = `*${value}*`;
      return;
    }
    if (mark.type.name === "link") {
      const href = typeof mark.attrs.href === "string" ? mark.attrs.href : "";
      if (href) {
        value = `[${value}](${href})`;
      }
    }
  });

  return value;
}

function fragmentToInlineMarkdown(fragment: Fragment) {
  const parts: string[] = [];
  fragment.forEach((node) => {
    parts.push(nodeToMarkdown(node, { inline: true }));
  });
  return parts.join("");
}

function listToMarkdown(
  node: ProseMirrorNode,
  ordered: boolean,
  depth: number
) {
  const lines: string[] = [];
  let index = 1;

  node.forEach((listItem) => {
    const childLines: string[] = [];
    listItem.forEach((child) => {
      if (child.type.name === "paragraph") {
        const text = fragmentToInlineMarkdown(child.content).trim();
        if (text) childLines.push(text);
        return;
      }
      childLines.push(nodeToMarkdown(child, { depth: depth + 1 }));
    });

    const marker = ordered ? `${index}.` : "-";
    const indent = "  ".repeat(depth);
    const [firstLine = "", ...restLines] = childLines.join("\n").split("\n");
    lines.push(`${indent}${marker} ${firstLine}`.trimEnd());
    restLines.forEach((line) => lines.push(`${indent}  ${line}`.trimEnd()));
    index += 1;
  });

  return lines.join("\n");
}

function tableCellText(node: ProseMirrorNode) {
  const value = fragmentToInlineMarkdown(node.content)
    .replace(/\n+/g, " ")
    .trim();
  return escapeMarkdownTableCell(value);
}

function tableToMarkdown(node: ProseMirrorNode) {
  const rows: string[][] = [];

  node.forEach((row) => {
    const cells: string[] = [];
    row.forEach((cell) => {
      cells.push(tableCellText(cell));
    });
    if (cells.length > 0) {
      rows.push(cells);
    }
  });

  if (rows.length === 0) return "";

  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalizedRows = rows.map((row) =>
    Array.from({ length: columnCount }, (_, index) => row[index] ?? "")
  );
  const [header = [], ...bodyRows] = normalizedRows;
  const separator = Array.from({ length: columnCount }, () => "---");
  const stringifyRow = (row: readonly string[]) => `| ${row.join(" | ")} |`;

  return [
    stringifyRow(header),
    stringifyRow(separator),
    ...bodyRows.map(stringifyRow),
  ].join("\n");
}

function nodeToMarkdown(
  node: ProseMirrorNode,
  options: { depth?: number; inline?: boolean } = {}
): string {
  const depth = options.depth ?? 0;

  if (node.isText) {
    return textWithMarks(node);
  }

  switch (node.type.name) {
    case "paragraph":
      return fragmentToInlineMarkdown(node.content);
    case "hardBreak":
      return "\n";
    case "bulletList":
      return listToMarkdown(node, false, depth);
    case "orderedList":
      return listToMarkdown(node, true, depth);
    case "blockquote":
      return nodeToMarkdownFragment(node.content, { depth })
        .split("\n")
        .map((line) => `> ${line}`.trimEnd())
        .join("\n");
    case "codeBlock": {
      const language =
        typeof node.attrs.language === "string" ? node.attrs.language : "";
      return `\`\`\`${language}\n${node.textContent}\n\`\`\``;
    }
    case "heading": {
      const level =
        typeof node.attrs.level === "number"
          ? Math.min(Math.max(node.attrs.level, 1), 6)
          : 2;
      return `${"#".repeat(level)} ${fragmentToInlineMarkdown(node.content)}`;
    }
    case "image": {
      const src = typeof node.attrs.src === "string" ? node.attrs.src : "";
      const alt = typeof node.attrs.alt === "string" ? node.attrs.alt : "";
      return src ? `![${alt}](${src})` : "";
    }
    case "youtubeEmbed": {
      const src = typeof node.attrs.src === "string" ? node.attrs.src : "";
      return src ? `[YouTube video](${src})` : "";
    }
    case "table":
      return tableToMarkdown(node);
    case "tableRow":
    case "tableCell":
    case "tableHeader":
      return fragmentToInlineMarkdown(node.content);
    default:
      return options.inline
        ? fragmentToInlineMarkdown(node.content)
        : nodeToMarkdownFragment(node.content, { depth });
  }
}

function nodeToMarkdownFragment(
  fragment: Fragment,
  options: { depth?: number } = {}
) {
  const blocks: string[] = [];
  fragment.forEach((node) => {
    const markdown = nodeToMarkdown(node, options).trimEnd();
    if (markdown) blocks.push(markdown);
  });
  return blocks.join("\n\n");
}

export function serializeCardEditorSliceToMarkdown(slice: Slice) {
  return normalizeLineBreaks(nodeToMarkdownFragment(slice.content));
}
