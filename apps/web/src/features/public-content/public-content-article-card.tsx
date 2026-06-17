import {
  buildPublicContentCanonicalUrl,
  type PublicContentArticle,
} from "./public-content-data";
import { getPublicContentArticleCardMetaItems } from "./public-content-article-card-meta";
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
      <div className="flex flex-wrap gap-2 text-[12px] font-semibold text-[#555]">
        {getPublicContentArticleCardMetaItems(article).map((item, index) => (
          <span key={`${item}-${index}`} className="contents">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            <span>{item}</span>
          </span>
        ))}
      </div>
      <h2 className="mt-4 text-[20px] font-semibold leading-7 text-[#111]">
        {article.title}
      </h2>
      <p className="mt-3 text-[14px] leading-6 text-[#666]">
        {article.summary}
      </p>
    </PublicContentTrackedLink>
  );
}
