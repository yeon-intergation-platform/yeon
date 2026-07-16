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
        className="border-b border-[#e5e5e5] pb-4"
      >
        <div className="flex flex-wrap gap-2">
          <PublicContentTrackedLink
            href="/blog"
            className="inline-flex h-10 items-center border border-[#111] bg-[#111] px-4 text-[13px] font-semibold text-white no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
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
              className="inline-flex h-10 items-center border border-[#e5e5e5] bg-white px-4 text-[13px] font-semibold text-[#666] no-underline transition-colors hover:border-[#111] hover:text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
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
      </nav>

      <section className="pt-8" aria-labelledby="blog-home-latest-title">
        <div className="mb-4">
          <h2
            id="blog-home-latest-title"
            className="text-[24px] font-semibold tracking-[-0.03em] text-[#111]"
          >
            최근 글
            <span className="ml-2 text-[14px] font-medium text-[#666]">
              {model.articleCount}개
            </span>
          </h2>
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
    </section>
  );
}
