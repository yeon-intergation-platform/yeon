import type { ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { yeonColors, yeonRadius, yeonSpacing } from "../../theme";
import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";

type NativeMarkdownBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "code"; text: string };

export type YeonMarkdownContentProps = {
  children?: ReactNode;
  fallbackText?: string;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const MARKDOWN_TOKEN_PATTERNS = [
  /!\[([^\]]*)\]\([^)]+\)/g,
  /\[([^\]]+)\]\([^)]+\)/g,
  /(\*\*|__)(.*?)\1/g,
  /(\*|_)(.*?)\1/g,
  /~~(.*?)~~/g,
  /`([^`]+)`/g,
] as const;

function nodeToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(nodeToText).filter(Boolean).join("");
  }
  return "";
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(
      /<\/(p|div|section|article|li|ul|ol|blockquote|h[1-6]|pre)>/gi,
      "\n"
    )
    .replace(/<[^>]+>/g, " ");
}

function normalizeInlineMarkdown(value: string) {
  return MARKDOWN_TOKEN_PATTERNS.reduce((text, pattern) => {
    return text.replace(pattern, (_match, label, content) =>
      String(content ?? label ?? "").trim()
    );
  }, value)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function markdownToBlocks(markdown: string): NativeMarkdownBlock[] {
  const blocks: NativeMarkdownBlock[] = [];
  const lines = stripHtml(markdown).replace(/\r\n/g, "\n").split("\n");
  let codeLines: string[] = [];
  let inCode = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      if (inCode) {
        const text = codeLines.join("\n").trim();
        if (text) blocks.push({ kind: "code", text });
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(rawLine.replace(/\s+$/g, ""));
      continue;
    }

    if (!line) continue;

    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading?.[1]) {
      blocks.push({
        kind: "heading",
        text: normalizeInlineMarkdown(heading[1]),
      });
      continue;
    }

    const list = line.match(/^[-*+]\s+(.+)$/) ?? line.match(/^\d+\.\s+(.+)$/);
    if (list?.[1]) {
      blocks.push({ kind: "list", text: normalizeInlineMarkdown(list[1]) });
      continue;
    }

    const quote = line.match(/^>\s?(.+)$/);
    if (quote?.[1]) {
      blocks.push({ kind: "quote", text: normalizeInlineMarkdown(quote[1]) });
      continue;
    }

    blocks.push({ kind: "paragraph", text: normalizeInlineMarkdown(line) });
  }

  if (inCode && codeLines.length > 0) {
    blocks.push({ kind: "code", text: codeLines.join("\n").trim() });
  }

  return blocks.filter((block) => block.text.length > 0);
}

export function sanitizeYeonHtml(value: string, _config?: unknown) {
  return normalizeInlineMarkdown(stripHtml(value));
}

export function YeonMarkdownContent({
  children,
  fallbackText,
  numberOfLines,
  style,
  textStyle,
}: YeonMarkdownContentProps) {
  const source = nodeToText(children) || fallbackText || "";
  const blocks = markdownToBlocks(source);
  if (blocks.length === 0) return null;

  return (
    <YeonView style={[styles.root, style]}>
      {blocks.map((block, index) => {
        if (block.kind === "code") {
          return (
            <YeonView key={`${block.kind}-${index}`} style={styles.codeBlock}>
              <YeonText
                variant="caption"
                tone="secondary"
                style={[styles.codeText, textStyle]}
              >
                {block.text}
              </YeonText>
            </YeonView>
          );
        }

        return (
          <YeonText
            key={`${block.kind}-${index}`}
            numberOfLines={numberOfLines}
            variant={block.kind === "heading" ? "subtitle" : "body"}
            tone={block.kind === "quote" ? "secondary" : "primary"}
            style={[
              styles.text,
              block.kind === "list" && styles.listText,
              block.kind === "quote" && styles.quoteText,
              textStyle,
            ]}
          >
            {block.kind === "list" ? `• ${block.text}` : block.text}
          </YeonText>
        );
      })}
    </YeonView>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: yeonSpacing[2],
  },
  text: {
    flexShrink: 1,
  },
  listText: {
    paddingLeft: yeonSpacing[2],
  },
  quoteText: {
    borderLeftColor: yeonColors.neutral[100],
    borderLeftWidth: 3,
    paddingLeft: yeonSpacing[3],
  },
  codeBlock: {
    backgroundColor: yeonColors.neutral[50],
    borderColor: yeonColors.neutral[100],
    borderRadius: yeonRadius.lg,
    borderWidth: 1,
    padding: yeonSpacing[3],
  },
  codeText: {
    fontFamily: "monospace",
  },
});
