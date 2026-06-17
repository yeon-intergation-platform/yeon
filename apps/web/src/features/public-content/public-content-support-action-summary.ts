import {
  PUBLIC_CONTENT_CHANNELS,
  type PublicContentArticle,
  type PublicContentBlock,
} from "./public-content-data";

type PublicContentActionBlock = Extract<
  PublicContentBlock,
  { type: "steps" | "checklist" }
>;

const PRIMARY_ACTION_ITEM_LIMIT = 3;

export function getPublicContentSupportPrimaryActionItems(
  article: PublicContentArticle
): readonly string[] {
  if (article.channel !== PUBLIC_CONTENT_CHANNELS.support) return [];

  const firstActionBlock = article.body.find(
    (block): block is PublicContentActionBlock =>
      block.type === "steps" || block.type === "checklist"
  );

  if (!firstActionBlock) return [];

  return firstActionBlock.items.slice(0, PRIMARY_ACTION_ITEM_LIMIT);
}

export function hasPublicContentSupportFaqHeadingStructure(
  article: PublicContentArticle
) {
  if (
    article.channel !== PUBLIC_CONTENT_CHANNELS.support ||
    article.category !== "faq"
  ) {
    return true;
  }

  return article.body.some((block) => block.type === "heading");
}
