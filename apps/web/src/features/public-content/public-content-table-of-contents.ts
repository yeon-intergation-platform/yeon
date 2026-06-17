import type { PublicContentArticle } from "./public-content-data";

export type PublicContentTableOfContentsItem = {
  blockIndex: number;
  id: string;
  title: string;
};

function buildPublicContentHeadingId(headingIndex: number) {
  return `section-${headingIndex + 1}`;
}

export function buildPublicContentTableOfContents(
  article: Pick<PublicContentArticle, "body">
): readonly PublicContentTableOfContentsItem[] {
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
