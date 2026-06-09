"use client";
import {
  YeonGlobalStyle,
  YeonHtmlContent,
  YeonList,
  YeonListItem,
  YeonText,
  YeonView,
  YEON_WEB_CSS_VALUE,
  YeonLink,
  type YeonAnchorElement,
  type YeonImageElement,
  type YeonPreElement,
  type YeonElement,
} from "@yeon/ui";
import {
  appendYeonChildren,
  createYeonDomElement,
  getYeonElementAttribute,
  getYeonHtmlBodyInnerHtml,
  getYeonNodeTextContent,
  getYeonOwnerDocument,
  hasYeonElementClass,
  insertYeonBefore,
  parseYeonHtmlDocument,
  queryYeonElement,
  queryYeonElements,
  removeYeonElement,
  removeYeonElementAttribute,
  setYeonElementAttribute,
  setYeonElementStyleProperty,
  removeYeonElementStyleProperty,
  setYeonNodeTextContent,
} from "@yeon/ui/rich-content/YeonRichDom";
import { mountYeonMermaidDiagram } from "@yeon/ui/rich-content/YeonMermaid";
import {
  copyYeonClipboardText,
  getYeonNow,
  scheduleYeonTimeout,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  sanitizeYeonHtml,
  YeonMarkdownContent,
} from "@yeon/ui/rich-content/YeonMarkdown";
import { CardMarkdownCodeBlock } from "./card-markdown-code-block";
import { highlightCardEditorCodeHtml } from "./card-code-syntax-highlight";
import {
  CARD_EDITOR_CODE_LANGUAGE_GROUPS,
  getCardEditorCodeLanguageFromClassName,
  getCardEditorCodeLanguageSelectValue,
  normalizeCardEditorCodeLanguage,
} from "./card-editor-codeblock-utils";
import {
  parseCardEditorImageWidth,
  parseOptionalCardEditorImageHeight,
} from "./card-editor-image-utils";
import { renderCardEditorMarkdownTablesInHtml } from "./card-editor-table-utils";
import {
  applyCardEditorYouTubeIframeAttributes,
  replaceStandaloneCardEditorYouTubeLinksWithEmbeds,
} from "./card-editor-youtube-utils";

interface MarkdownContentProps {
  children: string;
  className?: string;
  inverted?: boolean;
  onCodeLanguageChange?: (index: number, language: string) => void;
}

interface MarkdownCodeElementProps {
  children?: ReactNode;
  className?: string;
}

function buildMarkdownCodeCopyErrorMessage(codeLength: number) {
  return `마크다운 코드 클립보드 복사에 실패했습니다. 복사 대상 길이: ${codeLength}자. 브라우저 클립보드 권한 또는 보안 컨텍스트를 확인해 주세요.`;
}

const baseTextClass = "whitespace-pre-wrap break-words";
export const CARD_MARKDOWN_TABLE_MIN_CELL_WIDTH = 56;
export const CARD_MARKDOWN_TABLE_MIN_CELL_HEIGHT = 56;
const CARD_MARKDOWN_TABLE_CELL_CLASS = "h-[56px] min-w-[56px]";

const CARD_MARKDOWN_HTML_GLOBAL_STYLE = `
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
    color: #666;
    margin: 0.75rem 0;
    padding-left: 0.75rem;
  }
  .card-markdown-html code {
    background: #fafafa;
    border-radius: 0.25rem;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    padding: 0.125rem 0.25rem;
  }
  .card-markdown-html pre {
    background: #fafafa;
    border-radius: 0.75rem;
    margin: 0.75rem 0;
    overflow-x: auto;
    padding: 0.75rem;
  }
  .card-markdown-html .card-code-block-wrapper {
    background: #fafafa;
    border: 1px solid #e5e5e5;
    border-radius: 0.75rem;
    margin: 0.75rem 0;
    overflow: hidden;
  }
  .card-markdown-html .card-code-block-wrapper.is-inverted {
    background: ${YEON_WEB_CSS_VALUE.invertedCodeBackground};
    border-color: ${YEON_WEB_CSS_VALUE.invertedCodeBorder};
  }
  .card-markdown-html .card-code-block-header {
    align-items: center;
    border-bottom: 1px solid #e5e5e5;
    color: #666;
    display: flex;
    font-size: 11px;
    font-weight: 700;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
  }
  .card-markdown-html
    .card-code-block-wrapper.is-inverted
    .card-code-block-header {
    border-bottom-color: ${YEON_WEB_CSS_VALUE.invertedCodeHeaderBorder};
    color: ${YEON_WEB_CSS_VALUE.invertedCodeText};
  }
  .card-markdown-html .card-code-block-language {
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 0.5rem;
    color: #111;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    max-width: 180px;
    outline: none;
    padding: 0.25rem 0.5rem;
    text-transform: uppercase;
  }
  .card-markdown-html .card-code-block-language:disabled {
    background: #fafafa;
    color: #666;
  }
  .card-markdown-html
    .card-code-block-wrapper.is-inverted
    .card-code-block-language {
    background: transparent;
    border-color: ${YEON_WEB_CSS_VALUE.invertedCodeBorder};
    color: #ffffff;
  }
  .card-markdown-html .card-code-block-copy {
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 0.5rem;
    color: #111;
    font-size: 11px;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
  }
  .card-markdown-html
    .card-code-block-wrapper.is-inverted
    .card-code-block-copy {
    background: transparent;
    border-color: ${YEON_WEB_CSS_VALUE.invertedCodeBorder};
    color: #ffffff;
  }
  .card-markdown-html .card-code-block-wrapper pre {
    border-radius: 0;
    margin: 0;
  }
  .card-markdown-html .card-mermaid-html-body {
    background: #ffffff;
    color: #666;
    font-size: 12px;
    font-weight: 600;
    overflow-x: auto;
    padding: 1rem;
  }
  .card-markdown-html .card-mermaid-html-body svg,
  .card-mermaid-diagram svg {
    display: block;
    height: auto;
    max-width: 100%;
  }
  .card-markdown-html a {
    text-decoration: underline;
    text-decoration-color: #aaa;
  }
  .card-markdown-html img {
    border: 1px solid #e5e5e5;
    border-radius: 14px;
    display: block;
    height: auto;
    margin: 0.5rem 0;
    max-width: 100%;
    object-fit: contain;
  }
  .card-markdown-html table {
    border: 1px solid #e5e5e5;
    border-collapse: collapse;
    margin: 0.5rem 0;
    max-width: 100%;
    table-layout: auto;
    text-align: left;
    width: max-content;
  }
  .card-markdown-html th,
  .card-markdown-html td {
    border: 1px solid #e5e5e5;
    box-sizing: border-box;
    font-size: 13px;
    height: ${CARD_MARKDOWN_TABLE_MIN_CELL_HEIGHT}px;
    line-height: 1.4;
    min-width: ${CARD_MARKDOWN_TABLE_MIN_CELL_WIDTH}px;
    padding: 0.25rem 0.4rem;
    vertical-align: top;
    white-space: nowrap;
  }
  .card-markdown-html th {
    background: #fafafa;
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
`;

function looksLikeHtml(value: string) {
  return /<\/?(p|div|br|ul|ol|li|strong|em|u|s|blockquote|pre|code|h[1-6]|img|a|table|thead|tbody|tr|th|td|iframe)\b/i.test(
    value
  );
}

const CARD_EDITOR_HTML_CODE_FENCE_PATTERN =
  /(```|~~~)([a-z0-9_+#.-]+)?\s*([\s\S]*?)\s*\1/gim;

function getHtmlElementTextWithLineBreaks(element: YeonElement): string {
  const parts: string[] = [];

  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.textContent ?? "");
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const childElement = node as YeonElement;
    if (childElement.tagName.toLowerCase() === "br") {
      parts.push("\n");
      return;
    }

    parts.push(getHtmlElementTextWithLineBreaks(childElement));
  });

  return parts.join("");
}

function createCardEditorHtmlParagraph(
  htmlDocument: Document,
  text: string
): YeonElement | null {
  const normalizedText = text.replace(/\s+/g, " ").trim();
  if (!normalizedText) return null;

  const paragraph = createYeonDomElement(htmlDocument, "p");
  setYeonNodeTextContent(paragraph, normalizedText);
  return paragraph;
}

function createCardEditorHtmlCodeBlock(
  htmlDocument: Document,
  languageValue: string | undefined,
  codeValue: string | undefined
): YeonElement {
  const language = normalizeCardEditorCodeLanguage(languageValue);
  const pre = createYeonDomElement(htmlDocument, "pre");
  const code = createYeonDomElement(htmlDocument, "code");

  if (language) {
    setYeonElementAttribute(code, "class", `language-${language}`);
  }
  setYeonNodeTextContent(code, codeValue?.trim() ?? "");
  appendYeonChildren(pre, code);
  return pre;
}

function renderCardEditorMarkdownCodeFencesInHtml(value: string) {
  const htmlDocument = parseYeonHtmlDocument(value);
  if (!htmlDocument) return value;

  queryYeonElements<YeonElement>(htmlDocument, "p").forEach((paragraph) => {
    if (queryYeonElement(paragraph, "pre, code, img, iframe, table")) {
      return;
    }

    const text = getHtmlElementTextWithLineBreaks(paragraph).replace(
      /\r\n?/g,
      "\n"
    );
    const replacements: YeonElement[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(CARD_EDITOR_HTML_CODE_FENCE_PATTERN)) {
      const matchStart = match.index ?? 0;
      const leadingText = text.slice(lastIndex, matchStart);
      const leadingParagraph = createCardEditorHtmlParagraph(
        htmlDocument,
        leadingText
      );
      if (leadingParagraph) replacements.push(leadingParagraph);

      replacements.push(
        createCardEditorHtmlCodeBlock(htmlDocument, match[2], match[3])
      );
      lastIndex = matchStart + match[0].length;
    }

    if (replacements.length === 0) return;

    const trailingParagraph = createCardEditorHtmlParagraph(
      htmlDocument,
      text.slice(lastIndex)
    );
    if (trailingParagraph) replacements.push(trailingParagraph);

    replacements.forEach((replacement) => {
      insertYeonBefore(paragraph.parentNode, replacement, paragraph);
    });
    removeYeonElement(paragraph);
  });

  return getYeonHtmlBodyInnerHtml(htmlDocument);
}

function sanitizeHtml(value: string) {
  const sanitized = sanitizeYeonHtml(value, {
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

  const htmlDocument = parseYeonHtmlDocument(sanitized);
  if (!htmlDocument) return sanitized;

  queryYeonElements<YeonImageElement>(htmlDocument, "img").forEach((image) => {
    const width = parseCardEditorImageWidth(
      getYeonElementAttribute(image, "width")
    );
    setYeonElementAttribute(image, "width", String(width));
    setYeonElementStyleProperty(image, "width", `${width}px`);

    // 명시적 height(px)가 있으면 aspect-ratio + height:auto로 적용한다. 좁은 폭에서
    // max-width:100%로 줄어도 지정한 W:H 비율을 유지하며 함께 축소된다(고정 height 왜곡 방지).
    const height = parseOptionalCardEditorImageHeight(
      getYeonElementAttribute(image, "height")
    );
    setYeonElementStyleProperty(image, "height", "auto");
    if (height === null) {
      removeYeonElementAttribute(image, "height");
      removeYeonElementStyleProperty(image, "aspect-ratio");
    } else {
      setYeonElementAttribute(image, "height", String(height));
      setYeonElementStyleProperty(
        image,
        "aspect-ratio",
        `${width} / ${height}`
      );
    }

    setYeonElementAttribute(image, "loading", "lazy");
    setYeonElementAttribute(image, "decoding", "async");
  });
  queryYeonElements<YeonAnchorElement>(htmlDocument, "a").forEach((anchor) => {
    setYeonElementAttribute(anchor, "target", "_blank");
    setYeonElementAttribute(anchor, "rel", "noreferrer");
  });
  queryYeonElements<YeonElement>(htmlDocument, "pre code").forEach((code) => {
    const language = getCardEditorCodeLanguageFromClassName(
      getYeonElementAttribute(code, "class") ?? ""
    );
    if (language) {
      setYeonElementAttribute(code, "class", `language-${language}`);
      return;
    }

    removeYeonElementAttribute(code, "class");
  });
  applyCardEditorYouTubeIframeAttributes(htmlDocument);
  return getYeonHtmlBodyInnerHtml(htmlDocument);
}

function renderHtmlMermaidBlock(
  host: YeonElement,
  code: string,
  elementId: string
) {
  void mountYeonMermaidDiagram(host, {
    code,
    elementId,
    theme: "neutral",
  });
}

function appendCodeLanguageOptions(select: HTMLSelectElement) {
  CARD_EDITOR_CODE_LANGUAGE_GROUPS.forEach((group) => {
    const optionGroup = document.createElement("optgroup");
    optionGroup.label = group.label;

    group.options.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      optionGroup.appendChild(option);
    });

    select.appendChild(optionGroup);
  });
}

function decorateHtmlCodeBlocks(
  container: YeonElement,
  inverted: boolean,
  onCodeLanguageChange?: (index: number, language: string) => void
) {
  queryYeonElements<YeonPreElement>(container, "pre").forEach((pre, index) => {
    if (hasYeonElementClass(pre.parentElement, "card-code-block-wrapper")) {
      return;
    }

    const code = queryYeonElement<YeonElement>(pre, "code");
    if (!code) return;

    const language = getCardEditorCodeLanguageFromClassName(
      getYeonElementAttribute(code, "class") ?? ""
    );
    const htmlDocument = getYeonOwnerDocument(container);
    const wrapper = createYeonDomElement(htmlDocument, "div");
    const header = createYeonDomElement(htmlDocument, "div");
    const languageSelect = createYeonDomElement(
      htmlDocument,
      "select"
    ) as HTMLSelectElement;
    const copyButton = createYeonDomElement(htmlDocument, "button");
    const codeText =
      getYeonNodeTextContent(code) || getYeonNodeTextContent(pre);

    wrapper.className = `card-code-block-wrapper ${
      inverted ? "is-inverted" : ""
    }`;
    header.className = "card-code-block-header";
    languageSelect.className = "card-code-block-language";
    languageSelect.setAttribute("aria-label", "코드 언어 선택");
    languageSelect.disabled = !onCodeLanguageChange;
    appendCodeLanguageOptions(languageSelect);
    languageSelect.value = getCardEditorCodeLanguageSelectValue(language);
    languageSelect.addEventListener("change", () => {
      const nextLanguage = normalizeCardEditorCodeLanguage(
        languageSelect.value
      );
      if (nextLanguage) {
        setYeonElementAttribute(code, "class", `language-${nextLanguage}`);
      } else {
        removeYeonElementAttribute(code, "class");
      }
      code.innerHTML = highlightCardEditorCodeHtml(
        codeText.replace(/\n$/, ""),
        nextLanguage
      );
      onCodeLanguageChange?.(index, languageSelect.value);
    });
    if (language) {
      code.innerHTML = highlightCardEditorCodeHtml(
        codeText.replace(/\n$/, ""),
        language
      );
    }
    copyButton.type = "button";
    copyButton.className = "card-code-block-copy";
    setYeonNodeTextContent(copyButton, "복사");
    copyButton.addEventListener("click", () => {
      copyYeonClipboardText(codeText.replace(/\n$/, ""))
        .then((copiedSuccessfully) => {
          if (!copiedSuccessfully) {
            throw new Error(buildMarkdownCodeCopyErrorMessage(codeText.length));
          }
          setYeonNodeTextContent(copyButton, "복사됨");
          scheduleYeonTimeout(() => {
            setYeonNodeTextContent(copyButton, "복사");
          }, 1200);
        })
        .catch((error: unknown) => {
          console.warn("[MarkdownContent] 코드 복사 실패", error);
          setYeonNodeTextContent(copyButton, "실패");
          scheduleYeonTimeout(() => {
            setYeonNodeTextContent(copyButton, "복사");
          }, 1200);
        });
    });

    appendYeonChildren(header, languageSelect, copyButton);
    insertYeonBefore(pre.parentNode, wrapper, pre);

    if (language === "mermaid") {
      const mermaidBody = createYeonDomElement(htmlDocument, "div");
      mermaidBody.className = "card-mermaid-html-body";
      setYeonNodeTextContent(mermaidBody, "다이어그램 렌더링 중...");
      appendYeonChildren(wrapper, header, mermaidBody);
      removeYeonElement(pre);
      renderHtmlMermaidBlock(
        mermaidBody,
        codeText.replace(/\n$/, ""),
        `card-html-mermaid-${getYeonNow()}-${index}`
      );
      return;
    }

    appendYeonChildren(wrapper, header, pre);
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
  className,
  inverted = false,
  onCodeLanguageChange,
}: MarkdownContentProps) {
  const htmlContainerRef = useRef<YeonElement | null>(null);
  const colors = inverted
    ? {
        text: "text-white",
        muted: "text-white/80",
        border: "border-white/20",
        code: "bg-white/10",
      }
    : {
        text: "text-[#111]",
        muted: "text-[#666]",
        border: "border-[#e5e5e5]",
        code: "bg-[#fafafa]",
      };

  const contentTextClassName = className ?? "text-[15px] leading-7";

  const originalIsHtml = looksLikeHtml(children);
  const contentWithEmbeds = replaceStandaloneCardEditorYouTubeLinksWithEmbeds(
    children,
    originalIsHtml
  );
  const isHtml = looksLikeHtml(contentWithEmbeds);
  const safeHtml = useMemo(
    () =>
      isHtml
        ? sanitizeHtml(
            renderCardEditorMarkdownCodeFencesInHtml(
              renderCardEditorMarkdownTablesInHtml(contentWithEmbeds)
            )
          )
        : "",
    [contentWithEmbeds, isHtml]
  );

  useEffect(() => {
    if (!isHtml || !htmlContainerRef.current) return;
    decorateHtmlCodeBlocks(
      htmlContainerRef.current,
      inverted,
      onCodeLanguageChange
    );
  }, [inverted, isHtml, onCodeLanguageChange, safeHtml]);

  let markdownCodeBlockIndex = 0;

  if (isHtml) {
    return (
      <>
        <YeonHtmlContent
          ref={htmlContainerRef}
          className={`${baseTextClass} card-markdown-html ${colors.text} ${contentTextClassName}`}
          suppressHydrationWarning
          html={safeHtml}
        />
        <YeonGlobalStyle
          id="card-markdown-html"
          css={CARD_MARKDOWN_HTML_GLOBAL_STYLE}
        />
      </>
    );
  }

  return (
    <YeonView
      className={`${baseTextClass} ${colors.text} ${contentTextClassName}`}
    >
      <YeonMarkdownContent
        components={{
          p: ({ children: nodeChildren }) => (
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="my-2 first:mt-0 last:mb-0"
            >
              {nodeChildren}
            </YeonText>
          ),
          ul: ({ children: nodeChildren }) => (
            <YeonList className="my-2 list-disc space-y-1 pl-5">
              {nodeChildren}
            </YeonList>
          ),
          ol: ({ children: nodeChildren }) => (
            <YeonList as="ol" className="my-2 list-decimal space-y-1 pl-5">
              {nodeChildren}
            </YeonList>
          ),
          li: ({ children: nodeChildren }) => (
            <YeonListItem>{nodeChildren}</YeonListItem>
          ),
          blockquote: ({ children: nodeChildren }) => (
            <YeonText
              as="blockquote"
              variant="unstyled"
              tone="inherit"
              className={`my-3 border-l-4 ${colors.border} pl-3 ${colors.muted}`}
            >
              {nodeChildren}
            </YeonText>
          ),
          code: ({ children: nodeChildren, className }) => {
            return (
              <YeonText
                as="code"
                variant="unstyled"
                tone="inherit"
                className={`rounded px-1 py-0.5 font-mono text-[0.92em] ${colors.code} ${className ?? ""}`}
              >
                {nodeChildren}
              </YeonText>
            );
          },
          pre: ({ children: nodeChildren }) => {
            const codeChild = getMarkdownCodeChild(nodeChildren);
            if (!codeChild)
              return (
                <YeonText as="pre" variant="unstyled" tone="inherit">
                  {nodeChildren}
                </YeonText>
              );

            const codeBlockIndex = markdownCodeBlockIndex;
            markdownCodeBlockIndex += 1;

            return (
              <CardMarkdownCodeBlock
                className={codeChild.props.className}
                inverted={inverted}
                codeBlockIndex={codeBlockIndex}
                onLanguageChange={onCodeLanguageChange}
              >
                {codeChild.props.children}
              </CardMarkdownCodeBlock>
            );
          },
          a: ({ children: nodeChildren, href }) => (
            <YeonLink
              className={
                inverted
                  ? "underline decoration-white/60"
                  : "underline decoration-[#aaa]"
              }
              href={href ?? "#"}
              rel="noreferrer"
              target="_blank"
            >
              {nodeChildren}
            </YeonLink>
          ),
          table: ({ children: nodeChildren }) => (
            <YeonView className="my-2 max-w-full overflow-x-auto">
              <YeonView
                as="table"
                className={`w-max max-w-full table-auto border-collapse border ${colors.border} text-left text-[13px]`}
              >
                {nodeChildren}
              </YeonView>
            </YeonView>
          ),
          th: ({ children: nodeChildren }) => (
            <YeonView
              as="th"
              className={`box-border whitespace-nowrap border ${colors.border} ${CARD_MARKDOWN_TABLE_CELL_CLASS} px-1.5 py-1 align-top font-semibold leading-[1.4]`}
            >
              {nodeChildren}
            </YeonView>
          ),
          td: ({ children: nodeChildren }) => (
            <YeonView
              as="td"
              className={`box-border whitespace-nowrap border ${colors.border} ${CARD_MARKDOWN_TABLE_CELL_CLASS} px-1.5 py-1 align-top leading-[1.4]`}
            >
              {nodeChildren}
            </YeonView>
          ),
        }}
      >
        {children}
      </YeonMarkdownContent>
      <YeonGlobalStyle
        id="card-markdown-html"
        css={CARD_MARKDOWN_HTML_GLOBAL_STYLE}
      />
    </YeonView>
  );
}
