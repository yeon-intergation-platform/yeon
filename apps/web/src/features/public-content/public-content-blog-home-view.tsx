import { PublicContentArticleCard } from "./public-content-article-card";
import { PublicContentBlogCategoryFilterButton } from "./public-content-blog-category-filter-button";
import type { PublicContentBlogHomeModel } from "./public-content-blog-home";
import { getPublicContentCategoryLabel } from "./public-content-data";

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
          <PublicContentBlogCategoryFilterButton
            count={model.totalArticleCount}
            isActive={!model.activeCategory}
            label="전체"
          />
          {model.categoryEntries.map((entry) => (
            <PublicContentBlogCategoryFilterButton
              key={entry.key}
              category={entry.key}
              count={entry.count}
              isActive={model.activeCategory === entry.key}
              label={entry.label}
            />
          ))}
        </div>
      </nav>

      <section className="pt-8" aria-labelledby="blog-home-latest-title">
        <div className="mb-4">
          <h2
            id="blog-home-latest-title"
            className="text-[24px] font-semibold tracking-[-0.03em] text-[#111]"
          >
            {model.activeCategory
              ? getPublicContentCategoryLabel(model.activeCategory)
              : "최근 글"}
            <span className="ml-2 text-[14px] font-medium text-[#666]">
              {model.articleCount}개
            </span>
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {model.visibleArticles.map((article) => (
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
