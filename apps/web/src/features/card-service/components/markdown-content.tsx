"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  children: string;
  inverted?: boolean;
}

const baseTextClass = "whitespace-pre-wrap break-words";

export function MarkdownContent({
  children,
  inverted = false,
}: MarkdownContentProps) {
  const colors = inverted
    ? {
        text: "text-white",
        muted: "text-white/80",
        border: "border-white/20",
        code: "bg-white/10",
      }
    : {
        text: "text-[#111]",
        muted: "text-[#555]",
        border: "border-[#e5e5e5]",
        code: "bg-[#f7f7f7]",
      };

  return (
    <div className={`${baseTextClass} text-[15px] leading-7 ${colors.text}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children: nodeChildren }) => (
            <p className="my-2 first:mt-0 last:mb-0">{nodeChildren}</p>
          ),
          ul: ({ children: nodeChildren }) => (
            <ul className="my-2 list-disc space-y-1 pl-5">{nodeChildren}</ul>
          ),
          ol: ({ children: nodeChildren }) => (
            <ol className="my-2 list-decimal space-y-1 pl-5">{nodeChildren}</ol>
          ),
          li: ({ children: nodeChildren }) => <li>{nodeChildren}</li>,
          blockquote: ({ children: nodeChildren }) => (
            <blockquote
              className={`my-3 border-l-4 ${colors.border} pl-3 ${colors.muted}`}
            >
              {nodeChildren}
            </blockquote>
          ),
          code: ({ children: nodeChildren, className }) => {
            const isBlock = Boolean(className);
            if (!isBlock) {
              return (
                <code
                  className={`rounded px-1 py-0.5 font-mono text-[0.92em] ${colors.code}`}
                >
                  {nodeChildren}
                </code>
              );
            }
            return (
              <code className="font-mono text-[13px] leading-6">
                {nodeChildren}
              </code>
            );
          },
          pre: ({ children: nodeChildren }) => (
            <pre
              className={`my-3 overflow-x-auto rounded-xl ${colors.code} p-3 text-left`}
            >
              {nodeChildren}
            </pre>
          ),
          a: ({ children: nodeChildren, href }) => (
            <a
              className={
                inverted
                  ? "underline decoration-white/60"
                  : "underline decoration-[#999]"
              }
              href={href}
              rel="noreferrer"
              target="_blank"
            >
              {nodeChildren}
            </a>
          ),
          table: ({ children: nodeChildren }) => (
            <div className="my-3 overflow-x-auto">
              <table
                className={`min-w-full border-collapse border ${colors.border} text-left text-[13px]`}
              >
                {nodeChildren}
              </table>
            </div>
          ),
          th: ({ children: nodeChildren }) => (
            <th className={`border ${colors.border} px-2 py-1 font-semibold`}>
              {nodeChildren}
            </th>
          ),
          td: ({ children: nodeChildren }) => (
            <td className={`border ${colors.border} px-2 py-1`}>
              {nodeChildren}
            </td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
