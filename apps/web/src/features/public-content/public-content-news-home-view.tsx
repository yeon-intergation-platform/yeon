import { PublicContentArticleCard } from "./public-content-article-card";
import type { PublicContentNewsHomeModel } from "./public-content-news-home";
import type { PublicContentArticle } from "./public-content-data";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

function getArticleSlug(article: PublicContentArticle) {
  return article.slugSegments.join("/");
}

export function PublicContentNewsHomePriority({
  model,
}: {
  model: PublicContentNewsHomeModel;
}) {
  return (
    <section
      aria-labelledby="news-home-latest-title"
      className="mx-auto max-w-6xl px-6 pb-16 md:px-8"
    >
      <nav aria-label="뉴스 분류" className="border-b border-[#e5e5e5] pb-4">
        <div className="flex flex-wrap gap-2">
          {model.filters.map((filter) => (
            <PublicContentTrackedLink
              key={filter.key}
              href={filter.href}
              className={`inline-flex h-10 items-center border px-4 text-[13px] font-semibold no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] ${
                filter.key === "all"
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-[#e5e5e5] bg-white text-[#666] hover:border-[#111] hover:text-[#111]"
              }`}
              trackingParams={{
                category: filter.key === "all" ? undefined : filter.key,
                channel: "news",
                link_kind: "category_nav",
                target_title: filter.label,
              }}
            >
              {filter.label} {filter.count}
            </PublicContentTrackedLink>
          ))}
        </div>
      </nav>

      {model.featuredArticle ? (
        <section className="pt-8" aria-labelledby="news-home-priority-title">
          <h2
            id="news-home-priority-title"
            className="text-[22px] font-semibold tracking-[-0.03em] text-[#111]"
          >
            중요 공지
          </h2>
          <div className="mt-4 max-w-4xl">
            <PublicContentArticleCard article={model.featuredArticle} />
          </div>
        </section>
      ) : null}

      <section className="mt-10" id="latest-news">
        <div className="border-b border-[#e5e5e5] pb-4">
          <h2
            id="news-home-latest-title"
            className="text-[24px] font-semibold tracking-[-0.03em] text-[#111]"
          >
            최신 소식
            <span className="ml-2 text-[14px] font-medium text-[#666]">
              {model.totalCount}개
            </span>
          </h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {model.latestArticles.map((article) => (
            <PublicContentArticleCard
              key={getArticleSlug(article)}
              article={article}
            />
          ))}
        </div>
      </section>
    </section>
  );
}
