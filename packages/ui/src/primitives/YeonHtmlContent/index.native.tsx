import { YeonText } from "../YeonText/index.native";

export interface YeonHtmlContentProps {
  html: string;
  fallbackText?: string;
}

function getNativeHtmlVisibleText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(
      /<\/(p|div|section|article|li|ul|ol|blockquote|h[1-6]|pre)>/gi,
      "\n"
    )
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function YeonHtmlContent({ html, fallbackText }: YeonHtmlContentProps) {
  const visibleText = fallbackText || getNativeHtmlVisibleText(html);
  if (!visibleText) return null;

  return (
    <YeonText variant="unstyled" tone="inherit">
      {visibleText}
    </YeonText>
  );
}
