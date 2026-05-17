"use client";

import { useState, type ReactNode } from "react";

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
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={`my-3 overflow-hidden rounded-xl border ${
        inverted
          ? "border-white/20 bg-white/10"
          : "border-[#e5e5e5] bg-[#f7f7f7]"
      }`}
    >
      <div
        className={`flex items-center justify-between border-b px-3 py-2 text-[11px] font-semibold ${
          inverted
            ? "border-white/15 text-white/75"
            : "border-[#e5e5e5] text-[#777]"
        }`}
      >
        <span className="uppercase tracking-[0.12em]">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors ${
            inverted
              ? "border-white/20 text-white hover:bg-white/10"
              : "border-[#d8d8d8] bg-white text-[#333] hover:border-[#bdbdbd] hover:bg-[#f2f2f2]"
          }`}
        >
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-left">
        <code className="font-mono text-[13px] leading-6">{codeText}</code>
      </pre>
    </div>
  );
}
