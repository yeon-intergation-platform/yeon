import {
  PUBLIC_CONTENT_CHANNELS,
  type PublicContentArticle,
} from "./public-content-data";
import { getPublicContentMarkdownHeadings } from "./public-content-markdown";

export type PublicContentTableOfContentsItem = {
  blockIndex: number;
  id: string;
  title: string;
};

function buildPublicContentHeadingId(headingIndex: number) {
  return `section-${headingIndex + 1}`;
}

export function buildPublicContentTableOfContents(
  article: Pick<PublicContentArticle, "body" | "bodyMarkdown">
): readonly PublicContentTableOfContentsItem[] {
  if (article.bodyMarkdown) {
    return getPublicContentMarkdownHeadings(article.bodyMarkdown).map(
      (heading, blockIndex) => ({
        blockIndex,
        id: heading.id,
        title: heading.title,
      })
    );
  }

  const items: PublicContentTableOfContentsItem[] = [];

  article.body.forEach((block, blockIndex) => {
    if (block.type !== "heading") return;

    const title = block.title.trim();
    if (!title) return;

    items.push({
      blockIndex,
      id: buildPublicContentHeadingId(items.length),
      title,
    });
  });

  return items;
}

export function shouldShowPublicContentTableOfContents(
  article: Pick<
    PublicContentArticle,
    "body" | "category" | "channel" | "readingMinutes"
  >
) {
  const tableOfContents = buildPublicContentTableOfContents(article);
  if (tableOfContents.length === 0) return false;

  if (article.channel === PUBLIC_CONTENT_CHANNELS.support) return true;

  if (article.channel === PUBLIC_CONTENT_CHANNELS.news) {
    return tableOfContents.length > 1;
  }

  return article.category === "engineering" && article.readingMinutes >= 4;
}
