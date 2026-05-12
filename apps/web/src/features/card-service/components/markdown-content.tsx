"use client";

import { useMemo } from "react";
import createDOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  children: string;
  inverted?: boolean;
}

const baseTextClass = "whitespace-pre-wrap break-words";
const CARD_HTML_IMAGE_MIN_WIDTH = 160;
const CARD_HTML_IMAGE_MAX_WIDTH = 900;
const CARD_HTML_IMAGE_DEFAULT_WIDTH = 480;

function looksLikeHtml(value: string) {
  return /<\/?(p|div|br|ul|ol|li|strong|em|u|s|blockquote|pre|code|h[1-6]|img|a)\b/i.test(
    value
  );
}

function clampImageWidth(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return CARD_HTML_IMAGE_DEFAULT_WIDTH;
  return Math.min(
    CARD_HTML_IMAGE_MAX_WIDTH,
    Math.max(CARD_HTML_IMAGE_MIN_WIDTH, Math.round(parsed))
  );
}

function sanitizeHtml(value: string) {
  if (typeof window === "undefined") return "";
  const sanitizer = createDOMPurify(window);
  const sanitized = sanitizer.sanitize(value, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "blockquote",
      "ul",
      "ol",
      "li",
      "pre",
      "code",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "a",
      "img",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "width"],
    ALLOW_DATA_ATTR: false,
  });

  if (typeof DOMParser === "undefined") return sanitized;
  const document = new DOMParser().parseFromString(sanitized, "text/html");
  document.querySelectorAll("img").forEach((image) => {
    const width = clampImageWidth(image.getAttribute("width"));
    image.setAttribute("width", String(width));
    image.setAttribute("loading", "lazy");
    image.setAttribute("decoding", "async");
  });
  document.querySelectorAll("a").forEach((anchor) => {
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noreferrer");
  });
  return document.body.innerHTML;
}

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

  const isHtml = looksLikeHtml(children);
  const safeHtml = useMemo(
    () => (isHtml ? sanitizeHtml(children) : ""),
    [children, isHtml]
  );

  const htmlStyles = (
    <style jsx global>{`
      .card-markdown-html p {
        margin: 0.5rem 0;
      }
      .card-markdown-html p:first-child {
        margin-top: 0;
      }
      .card-markdown-html p:last-child {
        margin-bottom: 0;
      }
      .card-markdown-html ul,
      .card-markdown-html ol {
        margin: 0.5rem 0;
        padding-left: 1.35rem;
      }
      .card-markdown-html ul {
        list-style: disc;
      }
      .card-markdown-html ol {
        list-style: decimal;
      }
      .card-markdown-html blockquote {
        border-left: 4px solid #e5e5e5;
        color: #555;
        margin: 0.75rem 0;
        padding-left: 0.75rem;
      }
      .card-markdown-html code {
        background: #f7f7f7;
        border-radius: 0.25rem;
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          "Liberation Mono", "Courier New", monospace;
        padding: 0.125rem 0.25rem;
      }
      .card-markdown-html pre {
        background: #f7f7f7;
        border-radius: 0.75rem;
        margin: 0.75rem 0;
        overflow-x: auto;
        padding: 0.75rem;
      }
      .card-markdown-html a {
        text-decoration: underline;
        text-decoration-color: #999;
      }
      .card-markdown-html img {
        border: 1px solid #e5e5e5;
        border-radius: 14px;
        display: inline-block;
        height: auto;
        margin: 0.5rem 0;
        max-width: 100%;
        object-fit: contain;
        vertical-align: middle;
      }
    `}</style>
  );

  if (isHtml) {
    return (
      <>
        <div
          className={`${baseTextClass} card-markdown-html text-[15px] leading-7 ${colors.text}`}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
        {htmlStyles}
      </>
    );
  }

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

      <style jsx global>{`
        .card-markdown-html p {
          margin: 0.5rem 0;
        }
        .card-markdown-html p:first-child {
          margin-top: 0;
        }
        .card-markdown-html p:last-child {
          margin-bottom: 0;
        }
        .card-markdown-html ul,
        .card-markdown-html ol {
          margin: 0.5rem 0;
          padding-left: 1.35rem;
        }
        .card-markdown-html ul {
          list-style: disc;
        }
        .card-markdown-html ol {
          list-style: decimal;
        }
        .card-markdown-html blockquote {
          border-left: 4px solid #e5e5e5;
          color: #555;
          margin: 0.75rem 0;
          padding-left: 0.75rem;
        }
        .card-markdown-html code {
          background: #f7f7f7;
          border-radius: 0.25rem;
          font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          padding: 0.125rem 0.25rem;
        }
        .card-markdown-html pre {
          background: #f7f7f7;
          border-radius: 0.75rem;
          margin: 0.75rem 0;
          overflow-x: auto;
          padding: 0.75rem;
        }
        .card-markdown-html a {
          text-decoration: underline;
          text-decoration-color: #999;
        }
        .card-markdown-html img {
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          display: inline-block;
          height: auto;
          margin: 0.5rem 0;
          max-width: 100%;
          object-fit: contain;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
}
