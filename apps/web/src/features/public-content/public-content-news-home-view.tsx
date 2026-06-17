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
            <dt className="text-[12px] font-semibold text-[#777]">
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
      aria-labelledby="news-home-priority-title"
      className="mx-auto max-w-6xl px-6 pb-16 md:px-8"
    >
      {model.featuredArticle ? (
        <div className="border-t border-[#e5e5e5] pt-10">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#777]">
                먼저 확인할 소식
              </p>
              <h2
                id="news-home-priority-title"
                className="mt-1 text-[24px] font-semibold text-[#111]"
              >
                공식 공지와 제품 업데이트
              </h2>
            </div>
            <p className="text-[13px] text-[#666]">Featured 1개</p>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
            <PublicContentArticleCard article={model.featuredArticle} />
            <PublicContentNewsArticleContextPanel
              article={model.featuredArticle}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-10 space-y-10">
        {model.sections.map((section) => (
          <section key={section.category} aria-labelledby={section.category}>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[#777]">
                  {section.articles.length}개 글
                </p>
                <h2
                  id={section.category}
                  className="mt-1 text-[22px] font-semibold text-[#111]"
                >
                  {section.title}
                </h2>
                <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#666]">
                  {section.description}
                </p>
              </div>
              <PublicContentTrackedLink
                href={section.href}
                className="w-fit rounded-lg border border-[#e5e5e5] px-3 py-2 text-[13px] font-semibold text-[#555] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
                trackingParams={{
                  category: section.category,
                  channel: "news",
                  link_kind: "category_nav",
                  target_title: section.title,
                }}
              >
                전체 보기
              </PublicContentTrackedLink>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {section.articles.map((article) => (
                <PublicContentArticleCard
                  key={getArticleSlug(article)}
                  article={article}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
