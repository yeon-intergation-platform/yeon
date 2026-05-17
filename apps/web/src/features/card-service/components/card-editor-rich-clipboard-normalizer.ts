import { convertCardEditorHtmlTableElementToMarkdownTable } from "./card-editor-table-utils";

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
  if (typeof window === "undefined" || !html.trim()) {
    return {
      html,
      hasChanges: false,
      notionAttachmentCount: 0,
    };
  }

  const document = new window.DOMParser().parseFromString(html, "text/html");
  let notionAttachmentCount = 0;
  let tableCount = 0;

  Array.from(document.querySelectorAll("table")).forEach((table) => {
    const markdownTable =
      convertCardEditorHtmlTableElementToMarkdownTable(table);
    if (!markdownTable) {
      return;
    }

    const fragment = document.createDocumentFragment();
    markdownTable.split("\n").forEach((line) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      fragment.appendChild(paragraph);
    });
    table.replaceWith(fragment);
    tableCount += 1;
  });

  Array.from(document.querySelectorAll("img")).forEach((image) => {
    const source = image.getAttribute("src") ?? "";
    if (!isNotionAttachmentSource(source)) {
      return;
    }

    const paragraph = document.createElement("p");
    paragraph.textContent = getNotionAttachmentPlaceholderText(
      image.getAttribute("alt") ?? undefined
    );
    image.replaceWith(paragraph);
    notionAttachmentCount += 1;
  });

  return {
    html: document.body.innerHTML,
    hasChanges: notionAttachmentCount > 0 || tableCount > 0,
    notionAttachmentCount,
    tableCount,
  };
}
