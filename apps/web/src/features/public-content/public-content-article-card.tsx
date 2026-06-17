import {
  buildPublicContentCanonicalUrl,
  getPublicContentCategoryLabel,
  getPublicContentServiceLabel,
  type PublicContentArticle,
} from "./public-content-data";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

function getArticleSlug(article: PublicContentArticle) {
  return article.slugSegments.join("/");
}

export function PublicContentArticleCard({
  article,
}: {
  article: PublicContentArticle;
}) {
  const href = buildPublicContentCanonicalUrl(
    article.channel,
    article.slugSegments
  );

  return (
    <PublicContentTrackedLink
      href={href}
      className="group block rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-5 text-[#111] no-underline transition-colors hover:border-[#111] hover:bg-white"
      trackingParams={{
        category: article.category,
        channel: article.channel,
        link_kind: "article_card",
        service: article.service,
        slug: getArticleSlug(article),
        target_title: article.title,
      }}
    >
      <div className="flex flex-wrap gap-2 text-[12px] font-semibold text-[#aaa]">
        <span>{getPublicContentServiceLabel(article.service)}</span>
        <span aria-hidden="true">/</span>
        <span>{getPublicContentCategoryLabel(article.category)}</span>
      </div>
      <h2 className="mt-4 text-[20px] font-semibold leading-7 text-[#111]">
        {article.title}
      </h2>
      <p className="mt-3 text-[14px] leading-6 text-[#666]">
        {article.summary}
      </p>
      <div className="mt-5 flex items-center justify-between gap-4 text-[13px] text-[#aaa]">
        <span>{article.publishedAt}</span>
        <span>{article.readingMinutes}분</span>
      </div>
    </PublicContentTrackedLink>
  );
}
