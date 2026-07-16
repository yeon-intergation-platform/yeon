import type {
  PublicContentAdminArticleDto,
  PublicContentRevisionDto,
} from "@yeon/api-contract/public-content";

export function hasPublicContentPublishedHistory(
  article: PublicContentAdminArticleDto | null,
  revisions: readonly PublicContentRevisionDto[]
) {
  return article?.publishedAt != null || revisions.length > 0;
}

export function canDeletePublicContentDraft(
  article: PublicContentAdminArticleDto | null,
  revisions: readonly PublicContentRevisionDto[]
) {
  return (
    article?.status === "draft" &&
    !hasPublicContentPublishedHistory(article, revisions)
  );
}
