import { PublicContentArticleCard } from "./public-content-article-card";
import {
  getPublicContentNewsArticleContext,
  type PublicContentNewsHomeModel,
} from "./public-content-news-home";
import type { PublicContentArticle } from "./public-content-data";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

function getArticleSlug(article: PublicContentArticle) {
  return article.slugSegments.join("/");
}

export function PublicContentNewsArticleContextPanel({
  article,
}: {
  article: PublicContentArticle;
}) {
  const context = getPublicContentNewsArticleContext(article);
  if (!context) return null;

  return (
    <aside className="mt-5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
      <p className="text-[13px] font-semibold text-[#111]">{context.heading}</p>
      <dl className="mt-4 grid gap-3 md:grid-cols-2">
        {context.items.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-[12px] font-semibold text-[#555]">
              {item.label}
            </dt>
            <dd className="mt-1 break-words text-[13px] leading-5 text-[#555]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
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
      <nav aria-label="뉴스 분류" className="border-y border-[#e5e5e5] py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] font-semibold text-[#111]">소식 분류</p>
          <div className="flex flex-wrap gap-2">
            {model.filters.map((filter) => (
              <PublicContentTrackedLink
                key={filter.key}
                href={filter.href}
                className={`inline-flex h-11 items-center border px-4 text-[13px] font-semibold no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] ${
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
        </div>
      </nav>

      {model.featuredArticle ? (
        <section className="pt-10" aria-labelledby="news-home-priority-title">
          <div>
            <p className="text-[13px] font-semibold text-[#555]">중요 공지</p>
            <h2
              id="news-home-priority-title"
              className="mt-1 text-[24px] font-semibold text-[#111]"
            >
              먼저 확인할 변경사항
            </h2>
          </div>
          <div className="mt-5 max-w-4xl">
            <PublicContentArticleCard article={model.featuredArticle} />
          </div>
        </section>
      ) : null}

      <section className="mt-12" id="latest-news">
        <div className="flex flex-col gap-2 border-b border-[#e5e5e5] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#555]">최신 소식</p>
            <h2
              id="news-home-latest-title"
              className="mt-1 text-[28px] font-semibold text-[#111]"
            >
              새로 나온 소식 {model.totalCount}개
            </h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#666]">
              공지, 제품 업데이트, 뉴스 해설을 최신순으로 확인하세요.
            </p>
          </div>
          <p className="text-[13px] text-[#666]">정렬: 최신순</p>
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
