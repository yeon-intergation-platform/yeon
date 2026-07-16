import {
  PUBLIC_CONTENT_CHANNELS,
  type PublicContentArticle,
} from "./public-content-data";

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
