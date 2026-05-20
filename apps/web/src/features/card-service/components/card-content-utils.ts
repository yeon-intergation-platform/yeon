export function htmlToVisibleText(value: string) {
  if (!value.trim()) return "";
  if (typeof DOMParser === "undefined") {
    return value
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  const document = new DOMParser().parseFromString(value, "text/html");
  return (document.body.textContent ?? "").replace(/\s+/g, " ").trim();
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
