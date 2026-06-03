import createDOMPurify from "dompurify";
import type { Config as DomPurifyConfig } from "dompurify";
import ReactMarkdown from "react-markdown";
import type { Options as ReactMarkdownOptions } from "react-markdown";
import remarkGfm from "remark-gfm";

export type YeonMarkdownContentProps = ReactMarkdownOptions;

export function sanitizeYeonHtml(value: string, config?: DomPurifyConfig) {
  if (typeof window === "undefined") {
    return "";
  }

  return createDOMPurify(window).sanitize(value, config) as string;
}

export function YeonMarkdownContent({
  remarkPlugins,
  ...props
}: YeonMarkdownContentProps) {
  return (
    <ReactMarkdown
      {...props}
      remarkPlugins={
        remarkPlugins ? [remarkGfm, ...remarkPlugins] : [remarkGfm]
      }
    />
  );
}
