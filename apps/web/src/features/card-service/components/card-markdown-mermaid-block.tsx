"use client";

import { useEffect, useId, useState } from "react";

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

    import("mermaid")
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: inverted ? "dark" : "neutral",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        });

        const result = await mermaid.render(elementId, code);
        if (!isMounted) return;
        setSvg(result.svg);
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
        <span className="uppercase tracking-[0.12em]">mermaid</span>
        {errorMessage ? (
          <span className={inverted ? "text-white/70" : "text-[#777]"}>
            렌더링 실패
          </span>
        ) : null}
      </div>
      <div className="overflow-x-auto bg-white p-4">
        {svg ? (
          <div
            className="card-mermaid-diagram min-w-max"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : errorMessage ? (
          <pre className="overflow-x-auto text-left">
            <code className="font-mono text-[13px] leading-6">{code}</code>
          </pre>
        ) : (
          <p className="text-[12px] font-medium text-[#777]">
            다이어그램 렌더링 중...
          </p>
        )}
      </div>
    </div>
  );
}
