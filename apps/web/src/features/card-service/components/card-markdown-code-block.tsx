"use client";
import { useState, type ReactNode } from "react";
import { YeonButton, YeonText, YeonView } from "@yeon/ui";
import {
  copyYeonClipboardText,
  scheduleYeonTimeout,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  getCardEditorCodeLanguageFromClassName,
  normalizeCardEditorCodeLanguage,
} from "./card-editor-codeblock-utils";
import { CardMarkdownMermaidBlock } from "./card-markdown-mermaid-block";

interface CardMarkdownCodeBlockProps {
  children: ReactNode;
  className?: string;
  inverted?: boolean;
}

function toCodeText(value: ReactNode): string {
  if (Array.isArray(value)) {
    return value.map((child) => toCodeText(child)).join("");
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}

export function CardMarkdownCodeBlock({
  children,
  className,
  inverted = false,
}: CardMarkdownCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const language =
    getCardEditorCodeLanguageFromClassName(className) ??
    normalizeCardEditorCodeLanguage(className);
  const codeText = toCodeText(children).replace(/\n$/, "");

  if (language === "mermaid") {
    return <CardMarkdownMermaidBlock code={codeText} inverted={inverted} />;
  }

  const handleCopy = async () => {
    try {
      const copiedSuccessfully = await copyYeonClipboardText(codeText);
      if (!copiedSuccessfully) {
        throw new Error("클립보드 복사를 지원하지 않습니다.");
      }
      setCopied(true);
      scheduleYeonTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <YeonView
      className={`my-3 overflow-hidden rounded-xl border ${
        inverted
          ? "border-white/20 bg-white/10"
          : "border-[#e5e5e5] bg-[#fafafa]"
      }`}
    >
      <YeonView
        className={`flex items-center justify-between border-b px-3 py-2 text-[11px] font-semibold ${
          inverted
            ? "border-white/15 text-white/75"
            : "border-[#e5e5e5] text-[#666]"
        }`}
      >
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="uppercase tracking-[0.12em]"
        >
          {language ?? "code"}
        </YeonText>
        <YeonButton
          type="button"
          onClick={handleCopy}
          variant={inverted ? "ghost" : "secondary"}
          size="sm"
          className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors ${
            inverted
              ? "border-white/20 text-white hover:bg-white/10"
              : "border-[#e5e5e5] bg-white text-[#111]"
          }`}
        >
          {copied ? "복사됨" : "복사"}
        </YeonButton>
      </YeonView>
      <YeonText
        as="pre"
        variant="unstyled"
        tone="inherit"
        className="overflow-x-auto p-3 text-left"
      >
        <YeonText
          as="code"
          variant="unstyled"
          tone="inherit"
          className="font-mono text-[13px] leading-6"
        >
          {codeText}
        </YeonText>
      </YeonText>
    </YeonView>
  );
}
