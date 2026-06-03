import type { YeonImageElement } from "@yeon/ui/types";
import {
  createYeonDomElement,
  getYeonElementAttribute,
  getYeonHtmlBodyInnerHtml,
  parseYeonHtmlDocument,
  queryYeonElements,
  replaceYeonElementWith,
  setYeonNodeTextContent,
} from "@yeon/ui/rich-content/YeonRichDom";

const NOTION_ATTACHMENT_SOURCE_PATTERN = /^attachment:[^\s]+/i;

function isNotionAttachmentSource(source: string) {
  return NOTION_ATTACHMENT_SOURCE_PATTERN.test(source.trim());
}

function getNotionAttachmentPlaceholderText(alt?: string) {
  const normalizedAlt = alt?.trim();
  if (normalizedAlt) {
    return `[Notion 이미지: ${normalizedAlt} - 원본 이미지를 다시 업로드해주세요.]`;
  }

  return "[Notion 이미지 - 원본 이미지를 다시 업로드해주세요.]";
}

export function normalizeCardEditorRichClipboardHtml(html: string) {
  if (!html.trim()) {
    return {
      html,
      hasChanges: false,
      notionAttachmentCount: 0,
    };
  }

  const htmlDocument = parseYeonHtmlDocument(html);
  if (!htmlDocument) {
    return {
      html,
      hasChanges: false,
      notionAttachmentCount: 0,
    };
  }

  let notionAttachmentCount = 0;

  queryYeonElements<YeonImageElement>(htmlDocument, "img").forEach((image) => {
    const source = getYeonElementAttribute(image, "src") ?? "";
    if (!isNotionAttachmentSource(source)) {
      return;
    }

    const paragraph = createYeonDomElement(htmlDocument, "p");
    setYeonNodeTextContent(
      paragraph,
      getNotionAttachmentPlaceholderText(
        getYeonElementAttribute(image, "alt") ?? undefined
      )
    );
    replaceYeonElementWith(image, paragraph);
    notionAttachmentCount += 1;
  });

  return {
    html: getYeonHtmlBodyInnerHtml(htmlDocument),
    hasChanges: notionAttachmentCount > 0,
    notionAttachmentCount,
  };
}
