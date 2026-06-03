import type { YeonImageElement } from "@yeon/ui/types";
import type {
  YeonDataTransfer,
  YeonFile,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  getYeonElementAttribute,
  parseYeonHtmlDocument,
  queryYeonElements,
} from "@yeon/ui/rich-content/YeonRichDom";
import { isCardEditorImageFile } from "./card-editor-image-utils";

const URL_PATTERNS = {
  image: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|bmp|avif|svg)(\?[^\s]*)?$/i,
  dataImage: /^data:image\/[a-z0-9.+-]+;base64,/i,
  remote: /^https?:\/\/\S+$/i,
} as const;

const IMAGE_URL_PART =
  /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif|bmp|avif|svg)(?:\?[^\s"'<>]*)?/gi;
const DATA_IMAGE_TEXT_PART =
  /data:image\/[a-z0-9.+-]+;base64,[a-zA-Z0-9+/=\s]+/gi;

type UrlKind = keyof typeof URL_PATTERNS;

function isAllowedUrl(text: string, kinds: UrlKind | UrlKind[] = "remote") {
  const targets = Array.isArray(kinds) ? kinds : [kinds];

  return targets.some((kind) => URL_PATTERNS[kind].test(text.trim()));
}

function removeHtmlWrappers(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toUniqueImageFiles(files: YeonFile[]) {
  const seen = new Set<string>();

  return files.filter((file) => {
    if (!isCardEditorImageFile(file)) {
      return false;
    }

    const key = `${file.name}:${file.size}:${file.type}:${file.lastModified}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function extractCardEditorImageFiles(dataTransfer: YeonDataTransfer) {
  const directFiles = Array.from(dataTransfer.files);
  const itemFiles = Array.from(dataTransfer.items)
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is YeonFile => Boolean(file));

  return toUniqueImageFiles([...directFiles, ...itemFiles]);
}

export function extractCardEditorHtmlImageSources(html: string) {
  if (!html.trim()) {
    return [];
  }

  const htmlDocument = parseYeonHtmlDocument(html);
  if (!htmlDocument) {
    return [];
  }

  return queryYeonElements<YeonImageElement>(htmlDocument, "img[src]")
    .map((image) => getYeonElementAttribute(image, "src")?.trim() ?? "")
    .filter(Boolean);
}

export function extractCardEditorClipboardImageSource(
  clipboardData: YeonDataTransfer
) {
  const pastedHtml = clipboardData.getData("text/html").trim();
  if (pastedHtml) {
    const imageSource = extractCardEditorHtmlImageSources(pastedHtml)[0];

    if (imageSource && isAllowedUrl(imageSource, ["remote", "dataImage"])) {
      return imageSource;
    }
  }

  const pastedText = clipboardData.getData("text/plain").trim();
  if (pastedText && isAllowedUrl(pastedText, ["image", "dataImage"])) {
    return pastedText;
  }

  return "";
}

export function hasCardEditorClipboardImageHint(
  clipboardData: YeonDataTransfer
) {
  if (extractCardEditorImageFiles(clipboardData).length > 0) {
    return true;
  }

  const clipboardItems = Array.from(clipboardData.items);
  const hasHtmlItem = clipboardItems.some((item) => item.type.includes("html"));
  if (hasHtmlItem) {
    return clipboardData.getData("text/html").includes("<img");
  }

  const pastedText = clipboardData.getData("text/plain").trim();

  return isAllowedUrl(pastedText, ["image", "dataImage"]);
}

export function isCardEditorClipboardImageOnly(
  clipboardData: YeonDataTransfer
) {
  const pastedText = clipboardData.getData("text/plain").trim();
  const pastedHtml = clipboardData.getData("text/html").trim();

  if (pastedText) {
    const textWithoutImageRefs = pastedText
      .replace(IMAGE_URL_PART, "")
      .replace(DATA_IMAGE_TEXT_PART, "")
      .replace(/\s+/g, "")
      .trim();

    if (textWithoutImageRefs) {
      return false;
    }

    return isAllowedUrl(pastedText, ["image", "dataImage"]);
  }

  if (!pastedHtml) {
    return extractCardEditorImageFiles(clipboardData).length > 0;
  }

  const htmlText = removeHtmlWrappers(pastedHtml);
  if (htmlText) {
    return false;
  }

  return true;
}
