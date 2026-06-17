import type { PublicContentArticle } from "./public-content-data";
import { PublicContentArticleCard } from "./public-content-article-card";

export function PublicContentRelatedArticles({
  articles,
}: {
  articles: readonly PublicContentArticle[];
}) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-12 border-t border-[#e5e5e5] pt-8">
      <h2 className="text-[20px] font-semibold text-[#111]">관련 글</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <PublicContentArticleCard
            key={article.slugSegments.join("/")}
            article={article}
          />
        ))}
      </div>
    </section>
  );
}
