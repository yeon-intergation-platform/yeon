import { getYeonHtmlVisibleText } from "@yeon/ui/rich-content/YeonRichDom";

export function htmlToVisibleText(value: string) {
  if (!value.trim()) return "";
  return getYeonHtmlVisibleText(value);
}

export function isEmptyRichContent(value: string) {
  if (!value.trim()) return true;
  if (/<img\b/i.test(value)) return false;
  return htmlToVisibleText(value).length === 0;
}

export function isRenderableRichContent(value: string) {
  return !isEmptyRichContent(value) || /<iframe\b/i.test(value);
}

export function normalizeRichContent(value: string) {
  return value.trim();
}
