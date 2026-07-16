import type {
  PublicContentBlock,
  PublicContentCalloutTone,
} from "./public-content-data";

const CALLOUT_LABELS = {
  note: "NOTE",
  warning: "WARNING",
  success: "TIP",
} as const satisfies Record<PublicContentCalloutTone, string>;

const CALLOUT_TONES = {
  NOTE: "note",
  WARNING: "warning",
  CAUTION: "warning",
  TIP: "success",
  IMPORTANT: "success",
} as const satisfies Record<string, PublicContentCalloutTone>;

export type PublicContentMarkdownHeading = {
  id: string;
  line: number;
  title: string;
};

export function getPublicContentMarkdownHeadings(
  markdown: string
): readonly PublicContentMarkdownHeading[] {
  const headings: PublicContentMarkdownHeading[] = [];
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let fenceMarker: "`" | "~" | null = null;
  let fenceLength = 0;
  let paragraphStartLine = 0;
  let paragraphLines: string[] = [];

  const clearParagraph = () => {
    paragraphStartLine = 0;
    paragraphLines = [];
  };

  const pushHeading = (line: number, title: string) => {
    headings.push({
      id: `section-${headings.length + 1}`,
      line,
      title,
    });
  };

  lines.forEach((rawLine, lineIndex) => {
    const line = rawLine.trim();
    const fence = line.match(/^(`{3,}|~{3,})/);

    if (fence) {
      const marker = fence[1][0] as "`" | "~";
      if (fenceMarker === null) {
        fenceMarker = marker;
        fenceLength = fence[1].length;
      } else if (marker === fenceMarker && fence[1].length >= fenceLength) {
        fenceMarker = null;
        fenceLength = 0;
      }
      clearParagraph();
      return;
    }

    if (fenceMarker !== null) return;

    const heading = line.match(/^#{2,6}\s+(.+?)(?:\s+#+)?$/);
    const title = heading?.[1]?.trim();
    if (title) {
      pushHeading(lineIndex + 1, title);
      clearParagraph();
      return;
    }

    if (/^ {0,3}-{1,}[ \t]*$/.test(rawLine) && paragraphLines.length > 0) {
      pushHeading(paragraphStartLine, paragraphLines.join(" ").trim());
      clearParagraph();
      return;
    }

    if (!line) {
      clearParagraph();
      return;
    }

    if (paragraphLines.length === 0) {
      paragraphStartLine = lineIndex + 1;
    }
    paragraphLines.push(line);
  });

  return headings;
}

export function publicContentBlocksToMarkdown(
  blocks: readonly PublicContentBlock[]
) {
  return blocks.map(blockToMarkdown).join("\n\n").trim();
}

function blockToMarkdown(block: PublicContentBlock) {
  switch (block.type) {
    case "paragraph":
      return block.text;
    case "heading":
      return `## ${block.title}`;
    case "steps":
      return block.items
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n");
    case "checklist":
      return block.items.map((item) => `- [ ] ${item}`).join("\n");
    case "image":
      return [
        `![${block.alt}](${block.src})`,
        block.caption ? `_${block.caption}_` : null,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "code":
      return [
        block.filename ? `**${block.filename}**` : null,
        `\`\`\`${block.language}\n${block.code}\n\`\`\``,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "links":
      return [
        `## ${block.title}`,
        block.links.map((link) => `- [${link.label}](${link.href})`).join("\n"),
      ].join("\n\n");
    case "callout": {
      const tone = block.tone ?? "note";
      return [
        `> [!${CALLOUT_LABELS[tone]}]`,
        `> **${block.title}**`,
        ">",
        ...block.text.split("\n").map((line) => `> ${line}`),
      ].join("\n");
    }
  }
}

export function publicContentMarkdownToBlocks(
  markdown: string
): PublicContentBlock[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: PublicContentBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]?.trim() ?? "";
    if (!line) {
      index += 1;
      continue;
    }

    const codeFence = line.match(/^```([^\s]*)$/);
    if (codeFence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index]?.trim().startsWith("```")) {
        codeLines.push(lines[index] ?? "");
        index += 1;
      }
      index += 1;
      blocks.push({
        type: "code",
        language: codeFence[1] || "text",
        code: codeLines.join("\n"),
      });
      continue;
    }

    const heading = line.match(/^#{2,6}\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", title: heading[1].trim() });
      index += 1;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)]\(([^)]+)\)$/);
    if (image) {
      blocks.push({
        type: "image",
        alt: image[1],
        src: image[2],
        width: 1200,
        height: 675,
      });
      index += 1;
      continue;
    }

    if (/^>\s*/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>/.test(lines[index]?.trim() ?? "")) {
        quoteLines.push((lines[index] ?? "").replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(toCallout(quoteLines));
      continue;
    }

    if (/^- \[[ xX]\]\s+/.test(line)) {
      const items: string[] = [];
      while (/^- \[[ xX]\]\s+/.test(lines[index]?.trim() ?? "")) {
        items.push((lines[index]?.trim() ?? "").replace(/^- \[[ xX]\]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "checklist", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (/^\d+\.\s+/.test(lines[index]?.trim() ?? "")) {
        items.push((lines[index]?.trim() ?? "").replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "steps", items });
      continue;
    }

    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      while (/^-\s+/.test(lines[index]?.trim() ?? "")) {
        items.push((lines[index]?.trim() ?? "").replace(/^-\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "checklist", items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && !isBlockStart(lines[index] ?? "")) {
      paragraphLines.push(lines[index]?.trim() ?? "");
      index += 1;
    }
    blocks.push({
      type: "paragraph",
      text: paragraphLines.filter(Boolean).join(" "),
    });
  }

  return blocks;
}

function isBlockStart(rawLine: string) {
  const line = rawLine.trim();
  return (
    !line ||
    /^```/.test(line) ||
    /^#{2,6}\s+/.test(line) ||
    /^!\[/.test(line) ||
    /^>/.test(line) ||
    /^-\s+/.test(line) ||
    /^\d+\.\s+/.test(line)
  );
}

function toCallout(lines: readonly string[]): PublicContentBlock {
  const label = lines[0]?.match(
    /^\[!(NOTE|WARNING|CAUTION|TIP|IMPORTANT)]$/
  )?.[1] as keyof typeof CALLOUT_TONES | undefined;
  const contentLines = label ? lines.slice(1) : lines;
  const titleLine = contentLines.find((line) => line.trim()) ?? "참고";
  const title = titleLine.replace(/^\*\*(.+)\*\*$/, "$1").trim();
  const titleIndex = contentLines.indexOf(titleLine);
  const text = contentLines
    .filter((_, index) => index !== titleIndex)
    .join("\n")
    .trim();

  return {
    type: "callout",
    title,
    text: text || title,
    tone: label ? CALLOUT_TONES[label] : "note",
  };
}
