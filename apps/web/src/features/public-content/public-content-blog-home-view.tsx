import { PublicContentArticleCard } from "./public-content-article-card";
import type { PublicContentBlogHomeModel } from "./public-content-blog-home";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

export function PublicContentBlogHomePriority({
  model,
}: {
  model: PublicContentBlogHomeModel;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 md:px-8">
      <nav
        aria-label="블로그 글 분류"
        className="border-y border-[#e5e5e5] py-4"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] font-semibold text-[#111]">글 종류</p>
          <div className="flex flex-wrap gap-2">
            <PublicContentTrackedLink
              href="/blog"
              className="inline-flex h-11 items-center border border-[#111] bg-[#111] px-4 text-[13px] font-semibold text-white no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
              trackingParams={{
                channel: "blog",
                link_kind: "category_nav",
                target_title: "전체",
              }}
            >
              전체 {model.articleCount}
            </PublicContentTrackedLink>
            {model.categoryEntries.map((entry) => (
              <PublicContentTrackedLink
                key={entry.key}
                href={entry.href}
                className="inline-flex h-11 items-center border border-[#e5e5e5] bg-white px-4 text-[13px] font-semibold text-[#666] no-underline transition-colors hover:border-[#111] hover:text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                trackingParams={{
                  category: entry.key,
                  channel: "blog",
                  link_kind: "category_nav",
                  target_title: entry.label,
                }}
              >
                {entry.label} {entry.count}
              </PublicContentTrackedLink>
            ))}
          </div>
        </div>
      </nav>

      <section className="pt-10" aria-labelledby="blog-home-latest-title">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#555]">최신 기록</p>
            <h2
              id="blog-home-latest-title"
              className="mt-1 text-[28px] font-semibold text-[#111]"
            >
              최근에 남긴 글
            </h2>
          </div>
          <p className="text-[13px] text-[#666]">
            제품을 만들며 남긴 기술 선택과 운영 판단
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {model.latestArticles.map((article) => (
            <PublicContentArticleCard
              key={article.slugSegments.join("/")}
              article={article}
            />
          ))}
        </div>
      </section>

      <section
        className="mt-12 border-t border-[#e5e5e5] pt-10"
        aria-labelledby="blog-home-category-title"
      >
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#555]">읽는 경로</p>
            <h2
              id="blog-home-category-title"
              className="mt-1 text-[24px] font-semibold text-[#111]"
            >
              글의 성격으로 찾기
            </h2>
          </div>
          <p className="text-[13px] text-[#666]">
            필요한 기록만 빠르게 모아 볼 수 있어요
          </p>
        </div>
        <div className="border-y border-[#e5e5e5]">
          {model.categoryEntries.map((entry) => (
            <PublicContentTrackedLink
              key={entry.key}
              href={entry.href}
              className="group flex min-w-0 items-center justify-between gap-5 border-b border-[#e5e5e5] py-5 last:border-b-0 no-underline transition-colors hover:text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
              trackingParams={{
                category: entry.key,
                channel: "blog",
                link_kind: "category_nav",
                target_title: entry.label,
              }}
            >
              <div>
                <p className="text-[13px] text-[#666]">{entry.purpose}</p>
                <h3 className="mt-1 text-[20px] font-semibold text-[#111]">
                  {entry.label}{" "}
                  <span className="text-[14px] text-[#666]">
                    {entry.count}개
                  </span>
                </h3>
              </div>
              <span aria-hidden="true" className="text-[20px] text-[#111]">
                →
              </span>
            </PublicContentTrackedLink>
          ))}
        </div>
      </section>
    </section>
  );
}
