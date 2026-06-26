"use client";
import { useId, useState, type ReactNode } from "react";
import { YeonButton, YeonText, YeonView } from "@yeon/ui";
import {
  copyYeonClipboardText,
  scheduleYeonTimeout,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  CARD_EDITOR_CODE_LANGUAGE_GROUPS,
  getCardEditorCodeLanguageFromClassName,
  getCardEditorCodeLanguageSelectValue,
  normalizeCardEditorCodeLanguage,
} from "./card-editor-codeblock-utils";
import { renderCardEditorHighlightedCode } from "./card-code-syntax-highlight";
import { CardMarkdownMermaidBlock } from "./card-markdown-mermaid-block";
import { buildCardMarkdownCopyErrorMessage } from "./card-markdown-copy-utils";

interface CardMarkdownCodeBlockProps {
  children: ReactNode;
  className?: string;
  inverted?: boolean;
  codeBlockIndex?: number;
  onLanguageChange?: (index: number, language: string) => void;
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
  codeBlockIndex,
  onLanguageChange,
}: CardMarkdownCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const language =
    getCardEditorCodeLanguageFromClassName(className) ??
    normalizeCardEditorCodeLanguage(className);
  const selectedLanguage = getCardEditorCodeLanguageSelectValue(language);
  const languageSelectId = useId();
  const codeText = toCodeText(children).replace(/\n$/, "");

  if (language === "mermaid") {
    return <CardMarkdownMermaidBlock code={codeText} inverted={inverted} />;
  }

  const handleCopy = async () => {
    try {
      const copiedSuccessfully = await copyYeonClipboardText(codeText);
      if (!copiedSuccessfully) {
        throw new Error(
          buildCardMarkdownCopyErrorMessage({
            targetLabel: "코드 블록",
            codeLength: codeText.length,
          })
        );
      }
      setCopied(true);
      scheduleYeonTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.warn("[CardMarkdownCodeBlock] 코드 복사 실패", error);
      setCopied(false);
    }
  };

  const canChangeLanguage =
    typeof codeBlockIndex === "number" && Boolean(onLanguageChange);

  return (
    <YeonView
      className={`my-3 overflow-hidden rounded-xl border ${
        inverted
          ? "border-white/20 bg-white/10"
          : "border-[#e5e5e5] bg-[#fafafa]"
      }`}
    >
      <YeonView
        className={`flex items-center justify-between gap-2 border-b px-3 py-2 text-[11px] font-semibold ${
          inverted
            ? "border-white/15 text-white/75"
            : "border-[#e5e5e5] text-[#666]"
        }`}
      >
        <YeonView className="flex min-w-0 items-center gap-2">
          <label htmlFor={languageSelectId} className="sr-only">
            코드 언어 선택
          </label>
          <select
            id={languageSelectId}
            value={selectedLanguage}
            disabled={!canChangeLanguage}
            onChange={(event) =>
              onLanguageChange?.(codeBlockIndex ?? 0, event.target.value)
            }
            className={`max-w-[180px] rounded-lg border px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] outline-none transition-colors ${
              inverted
                ? "border-white/20 bg-transparent text-white disabled:opacity-80"
                : "border-[#e5e5e5] bg-white text-[#111] disabled:bg-[#fafafa] disabled:text-[#666]"
            }`}
            title={canChangeLanguage ? "코드 언어 선택" : "코드 언어"}
          >
            {CARD_EDITOR_CODE_LANGUAGE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </YeonView>
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
          {renderCardEditorHighlightedCode(codeText, language)}
        </YeonText>
      </YeonText>
    </YeonView>
  );
}
