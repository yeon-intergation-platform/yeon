"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import createDOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CardMarkdownCodeBlock } from "./card-markdown-code-block";
import { getCardEditorCodeLanguageFromClassName } from "./card-editor-codeblock-utils";
import { renderCardEditorMarkdownTablesInHtml } from "./card-editor-table-utils";
import {
  applyCardEditorYouTubeIframeAttributes,
  replaceStandaloneCardEditorYouTubeLinksWithEmbeds,
} from "./card-editor-youtube-utils";

interface MarkdownContentProps {
  children: string;
  inverted?: boolean;
}

interface MarkdownCodeElementProps {
  children?: ReactNode;
  className?: string;
}

const baseTextClass = "whitespace-pre-wrap break-words";
const CARD_HTML_IMAGE_MIN_WIDTH = 200;
const CARD_HTML_IMAGE_MAX_WIDTH = 800;
const CARD_HTML_IMAGE_DEFAULT_WIDTH = 480;

function looksLikeHtml(value: string) {
  return /<\/?(p|div|br|ul|ol|li|strong|em|u|s|blockquote|pre|code|h[1-6]|img|a|table|thead|tbody|tr|th|td|iframe)\b/i.test(
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
      "iframe",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: [
      "allow",
      "allowfullscreen",
      "alt",
      "class",
      "frameborder",
      "height",
      "href",
      "loading",
      "referrerpolicy",
      "rel",
      "src",
      "target",
      "title",
      "width",
    ],
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
  document.querySelectorAll("pre code").forEach((code) => {
    const language = getCardEditorCodeLanguageFromClassName(
      code.getAttribute("class") ?? ""
    );
    if (language) {
      code.setAttribute("class", `language-${language}`);
      return;
    }

    code.removeAttribute("class");
  });
  applyCardEditorYouTubeIframeAttributes(document);
  return document.body.innerHTML;
}

function decorateHtmlCodeBlocks(container: HTMLDivElement, inverted: boolean) {
  container.querySelectorAll("pre").forEach((pre) => {
    if (pre.parentElement?.classList.contains("card-code-block-wrapper")) {
      return;
    }

    const code = pre.querySelector("code");
    const language = getCardEditorCodeLanguageFromClassName(
      code?.getAttribute("class") ?? ""
    );
    const wrapper = document.createElement("div");
    const header = document.createElement("div");
    const languageLabel = document.createElement("span");
    const copyButton = document.createElement("button");
    const codeText = code?.textContent ?? pre.textContent ?? "";

    wrapper.className = `card-code-block-wrapper ${
      inverted ? "is-inverted" : ""
    }`;
    header.className = "card-code-block-header";
    languageLabel.className = "card-code-block-language";
    languageLabel.textContent = language ?? "code";
    copyButton.type = "button";
    copyButton.className = "card-code-block-copy";
    copyButton.textContent = "복사";
    copyButton.addEventListener("click", () => {
      navigator.clipboard
        .writeText(codeText.replace(/\n$/, ""))
        .then(() => {
          copyButton.textContent = "복사됨";
          window.setTimeout(() => {
            copyButton.textContent = "복사";
          }, 1200);
        })
        .catch(() => {
          copyButton.textContent = "실패";
          window.setTimeout(() => {
            copyButton.textContent = "복사";
          }, 1200);
        });
    });

    header.append(languageLabel, copyButton);
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.append(header, pre);
  });
}

function getMarkdownCodeChild(
  children: ReactNode
): ReactElement<MarkdownCodeElementProps> | undefined {
  const child = Children.toArray(children)[0];
  if (!isValidElement<MarkdownCodeElementProps>(child)) return undefined;
  return child;
}

export function MarkdownContent({
  children,
  inverted = false,
}: MarkdownContentProps) {
  const htmlContainerRef = useRef<HTMLDivElement | null>(null);
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

  const originalIsHtml = looksLikeHtml(children);
  const contentWithEmbeds = replaceStandaloneCardEditorYouTubeLinksWithEmbeds(
    children,
    originalIsHtml
  );
  const isHtml = looksLikeHtml(contentWithEmbeds);
  const safeHtml = useMemo(
    () =>
      isHtml
        ? sanitizeHtml(renderCardEditorMarkdownTablesInHtml(contentWithEmbeds))
        : "",
    [contentWithEmbeds, isHtml]
  );

  useEffect(() => {
    if (!isHtml || !htmlContainerRef.current) return;
    decorateHtmlCodeBlocks(htmlContainerRef.current, inverted);
  }, [inverted, isHtml, safeHtml]);

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
      .card-markdown-html .card-code-block-wrapper {
        background: #f7f7f7;
        border: 1px solid #e5e5e5;
        border-radius: 0.75rem;
        margin: 0.75rem 0;
        overflow: hidden;
      }
      .card-markdown-html .card-code-block-wrapper.is-inverted {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }
      .card-markdown-html .card-code-block-header {
        align-items: center;
        border-bottom: 1px solid #e5e5e5;
        color: #777;
        display: flex;
        font-size: 11px;
        font-weight: 700;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
      }
      .card-markdown-html
        .card-code-block-wrapper.is-inverted
        .card-code-block-header {
        border-bottom-color: rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.75);
      }
      .card-markdown-html .card-code-block-language {
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .card-markdown-html .card-code-block-copy {
        background: #fff;
        border: 1px solid #d8d8d8;
        border-radius: 0.5rem;
        color: #333;
        font-size: 11px;
        font-weight: 700;
        padding: 0.25rem 0.5rem;
      }
      .card-markdown-html
        .card-code-block-wrapper.is-inverted
        .card-code-block-copy {
        background: transparent;
        border-color: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
      .card-markdown-html .card-code-block-wrapper pre {
        border-radius: 0;
        margin: 0;
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
      .card-markdown-html table {
        border: 1px solid #e5e5e5;
        border-collapse: collapse;
        margin: 0.75rem 0;
        min-width: 100%;
        text-align: left;
      }
      .card-markdown-html th,
      .card-markdown-html td {
        border: 1px solid #e5e5e5;
        padding: 0.35rem 0.5rem;
      }
      .card-markdown-html th {
        background: #f7f7f7;
        font-weight: 700;
      }
      .card-markdown-html iframe.card-youtube-embed {
        aspect-ratio: 16 / 9;
        border: 1px solid #e5e5e5;
        border-radius: 14px;
        display: block;
        height: auto;
        margin: 0.75rem 0;
        max-width: 100%;
        width: 100%;
      }
    `}</style>
  );

  if (isHtml) {
    return (
      <>
        <div
          ref={htmlContainerRef}
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
            return (
              <code
                className={`rounded px-1 py-0.5 font-mono text-[0.92em] ${colors.code} ${className ?? ""}`}
              >
                {nodeChildren}
              </code>
            );
          },
          pre: ({ children: nodeChildren }) => {
            const codeChild = getMarkdownCodeChild(nodeChildren);
            if (!codeChild) return <pre>{nodeChildren}</pre>;

            return (
              <CardMarkdownCodeBlock
                className={codeChild.props.className}
                inverted={inverted}
              >
                {codeChild.props.children}
              </CardMarkdownCodeBlock>
            );
          },
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
