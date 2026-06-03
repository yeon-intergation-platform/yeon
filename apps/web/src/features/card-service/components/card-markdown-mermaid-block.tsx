"use client";
import { useEffect, useId, useState } from "react";
import { YeonHtmlContent, YeonText, YeonView } from "@yeon/ui";
import { renderYeonMermaidSvg } from "@yeon/ui/rich-content/YeonMermaid";

interface CardMarkdownMermaidBlockProps {
  code: string;
  inverted?: boolean;
}

function toMermaidElementId(value: string) {
  return `card-mermaid-${value.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export function CardMarkdownMermaidBlock({
  code,
  inverted = false,
}: CardMarkdownMermaidBlockProps) {
  const reactId = useId();
  const [svg, setSvg] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const elementId = toMermaidElementId(reactId);

  useEffect(() => {
    let isMounted = true;

    renderYeonMermaidSvg({
      code,
      elementId,
      theme: inverted ? "dark" : "neutral",
    })
      .then((nextSvg) => {
        if (!isMounted) return;
        setSvg(nextSvg);
        setErrorMessage("");
      })
      .catch(() => {
        if (!isMounted) return;
        setSvg("");
        setErrorMessage("Mermaid 다이어그램을 렌더링하지 못했습니다.");
      });

    return () => {
      isMounted = false;
    };
  }, [code, elementId, inverted]);

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
          mermaid
        </YeonText>
        {errorMessage ? (
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={inverted ? "text-white/70" : "text-[#666]"}
          >
            렌더링 실패
          </YeonText>
        ) : null}
      </YeonView>
      <YeonView className="overflow-x-auto bg-white p-4">
        {svg ? (
          <YeonHtmlContent
            className="card-mermaid-diagram min-w-max"
            html={svg}
          />
        ) : errorMessage ? (
          <YeonText
            as="pre"
            variant="unstyled"
            tone="inherit"
            className="overflow-x-auto text-left"
          >
            <YeonText
              as="code"
              variant="unstyled"
              tone="inherit"
              className="font-mono text-[13px] leading-6"
            >
              {code}
            </YeonText>
          </YeonText>
        ) : (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[12px] font-medium text-[#666]"
          >
            다이어그램 렌더링 중...
          </YeonText>
        )}
      </YeonView>
    </YeonView>
  );
}
